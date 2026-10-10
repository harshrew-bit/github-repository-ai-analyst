import os
import sys

_services_dir = os.path.dirname(os.path.abspath(__file__))
_app_dir = os.path.dirname(_services_dir)
if _app_dir not in sys.path:
    sys.path.insert(0, _app_dir)

from ingestion import (
    parse_github_url,
    load_repository,
    create_chunks
)
from vector_store import (
    ChromaVectorStore,
    get_collection_name,
    get_model_tag
)
import json
from embedding import EmbeddingModel
from indexer import (
    store_embeddings_in_chroma,
    restore_chroma_from_checkpoint,
    save_checkpoint
)


from typing import Optional


class RepositoryService:

    def __init__(
        self,
        chroma_directory: Optional[str] = None,
        embedding_model: Optional[str] = None,
        dimensions: Optional[int] = None
    ):
        self.chroma_directory = (
            chroma_directory
            if chroma_directory is not None
            else os.getenv("CHROMA_PERSIST_DIRECTORY", "data/chroma")
        )
        self.embedding_model_name = (
            embedding_model
            or os.getenv("GEMINI_EMBEDDING_MODEL", "gemini-embedding-2")
        ).removeprefix("models/").strip()

        if dimensions is not None:
            self.embedding_dimensions = dimensions
        else:
            raw_dims = os.getenv("GEMINI_EMBEDDING_DIMENSIONS", "3072")
            try:
                self.embedding_dimensions = int(raw_dims) if raw_dims else 3072
            except ValueError:
                self.embedding_dimensions = 3072

    def get_status(self, owner: str, repo: str) -> dict:
        """
        Check whether a repository is indexed in Chroma and return chunk count.
        """
        collection_name = get_collection_name(
            owner, repo, model_name=self.embedding_model_name
        )
        try:
            store = ChromaVectorStore(
                persist_directory=self.chroma_directory,
                collection_name=collection_name,
                embedding_model=self.embedding_model_name,
                dimensions=self.embedding_dimensions
            )
            count = store.count()
            compatible = store.is_compatible(
                self.embedding_model_name, self.embedding_dimensions
            )
            indexed = (count > 0) and compatible
        except Exception:
            count = 0
            indexed = False

        return {
            "repository": f"{owner}/{repo}",
            "collection": collection_name,
            "indexed": indexed,
            "chunks": count,
            "embedding_model": self.embedding_model_name
        }

    def index_repository(
        self,
        repository_url: str,
        batch_size: Optional[int] = None,
        force_reindex: bool = False
    ) -> dict:
        """
        Automatically index a repository into its repository-specific Chroma collection.
        Idempotent: if already indexed, reuses the existing collection unless force_reindex=True.
        Supports progressive checkpoints so interrupted runs do not re-embed already completed chunks.
        """
        # Resolve batch size with GEMINI_EMBEDDING_BATCH_SIZE env fallback
        if batch_size is None:
            try:
                batch_size = int(os.getenv("GEMINI_EMBEDDING_BATCH_SIZE", "10"))
            except ValueError:
                batch_size = 10
        if batch_size < 1:
            batch_size = 10

        owner, repo = parse_github_url(repository_url)
        collection_name = get_collection_name(
            owner, repo, model_name=self.embedding_model_name
        )

        store = ChromaVectorStore(
            persist_directory=self.chroma_directory,
            collection_name=collection_name,
            embedding_model=self.embedding_model_name,
            dimensions=self.embedding_dimensions
        )

        existing_count = store.count()
        is_compat = store.is_compatible(
            self.embedding_model_name, self.embedding_dimensions
        )

        # If existing collection has incompatible vectors (e.g. from older embedding model),
        # cleanly recreate collection to prevent mixing old and new embeddings
        if existing_count > 0 and not is_compat:
            print(
                f"[Chroma] Incompatible embeddings detected in collection '{collection_name}'. "
                f"Recreating collection cleanly for model '{self.embedding_model_name}'..."
            )
            store.recreate_collection()
            existing_count = 0

        if existing_count > 0 and not force_reindex:
            return {
                "repository": f"{owner}/{repo}",
                "collection": collection_name,
                "indexed": True,
                "chunks": existing_count,
                "message": "Repository is already indexed.",
                "embedding_model": self.embedding_model_name
            }

        # Check if an existing checkpoint file exists to avoid unnecessary re-embedding
        repo_data_dir = os.path.join("data", "repositories")
        os.makedirs(repo_data_dir, exist_ok=True)
        tag = get_model_tag(self.embedding_model_name)
        primary_checkpoint_path = os.path.join(
            repo_data_dir, f"{owner}_{repo}_embeddings_{tag}.json".lower()
        )
        legacy_checkpoint_path = os.path.join(
            repo_data_dir, f"{owner}_{repo}_embeddings.json".lower()
        )

        candidate_checkpoints = [
            primary_checkpoint_path,
            legacy_checkpoint_path,
            os.path.join("data", "repositories", f"{repo}_embeddings.json".lower()),
            os.path.join("data", "repositories", f"{owner}_{repo}.json".lower()),
        ]

        if not force_reindex:
            for checkpoint_path in candidate_checkpoints:
                if os.path.exists(checkpoint_path):
                    # Do not restore from an interrupted, partial checkpoint
                    try:
                        with open(checkpoint_path, "r", encoding="utf-8") as f:
                            cp_data = json.load(f)
                        if cp_data.get("is_partial"):
                            continue
                        cp_model = cp_data.get("embedding_model")
                        if cp_model and cp_model != self.embedding_model_name:
                            continue
                        if not cp_model and self.embedding_model_name != "gemini-embedding-001":
                            continue
                    except Exception:
                        continue

                    restored = restore_chroma_from_checkpoint(
                        input_file=checkpoint_path,
                        chroma_directory=self.chroma_directory,
                        collection_name=collection_name,
                        expected_model=self.embedding_model_name,
                        dimensions=self.embedding_dimensions
                    )
                    if restored and store.count() > 0:
                        return {
                            "repository": f"{owner}/{repo}",
                            "collection": collection_name,
                            "indexed": True,
                            "chunks": store.count(),
                            "message": "Restored repository from local embedding checkpoint.",
                            "embedding_model": self.embedding_model_name
                        }

        # Fetch and ingest repository from GitHub
        documents = load_repository(repository_url)
        if not documents:
            raise ValueError(
                f"No indexable files found in repository {owner}/{repo}."
            )

        chunks = create_chunks(documents)
        if not chunks:
            raise ValueError(
                f"No content chunks could be created from repository {owner}/{repo}."
            )

        # Check if partial checkpoint exists to resume without re-embedding
        all_embeddings = []
        start_index = 0

        resume_checkpoint_path = None
        if not force_reindex:
            for cp_path in [primary_checkpoint_path, legacy_checkpoint_path]:
                if os.path.exists(cp_path):
                    try:
                        with open(cp_path, "r", encoding="utf-8") as f:
                            chk_data = json.load(f)
                        chk_model = chk_data.get("embedding_model")
                        chk_model_match = (
                            chk_model == self.embedding_model_name or
                            (not chk_model and self.embedding_model_name == "gemini-embedding-001")
                        )
                        chk_dims = chk_data.get("dimensions")
                        chk_dims_match = (
                            chk_dims is None or chk_dims == self.embedding_dimensions
                        )
                        if chk_model_match and chk_dims_match:
                            resume_checkpoint_path = cp_path
                            break
                    except Exception:
                        continue

        if resume_checkpoint_path:
            try:
                with open(resume_checkpoint_path, "r", encoding="utf-8") as f:
                    cached_data = json.load(f)
                cached_items = cached_data.get("embeddings", [])
                if cached_items and len(cached_items) <= len(chunks):
                    # Validate that chunk files and IDs match sequentially
                    matched = True
                    for idx, item in enumerate(cached_items):
                        if (item.get("file_path") != chunks[idx].file_path or
                                item.get("chunk_id") != chunks[idx].chunk_id):
                            matched = False
                            break
                    if matched:
                        all_embeddings = [item["embedding"] for item in cached_items]
                        start_index = len(all_embeddings)
                        print(
                            f"[Checkpoint] Resuming from existing partial checkpoint: "
                            f"{start_index}/{len(chunks)} chunks already embedded."
                        )
            except Exception:
                all_embeddings = []
                start_index = 0

        embedding_model = EmbeddingModel(
            model_name=self.embedding_model_name,
            dimensions=self.embedding_dimensions
        )
        total = len(chunks)

        for start in range(start_index, total, batch_size):
            end = min(start + batch_size, total)
            batch = chunks[start:end]
            texts = [chunk.content for chunk in batch]
            embeddings = embedding_model.embed_texts(texts)
            all_embeddings.extend(embeddings)

            # Persist checkpoint after each batch so progress is never lost to quota errors
            try:
                save_checkpoint(
                    repository=f"{owner}/{repo}",
                    commit_sha="",
                    file_map={},
                    chunks=chunks[:len(all_embeddings)],
                    embeddings=all_embeddings,
                    output_file=primary_checkpoint_path,
                    is_partial=(len(all_embeddings) < total),
                    embedding_model=self.embedding_model_name,
                    dimensions=self.embedding_dimensions
                )
            except Exception:
                pass

        if force_reindex and existing_count > 0:
            store.recreate_collection()

        store_embeddings_in_chroma(
            chunks=chunks,
            embeddings=all_embeddings,
            chroma_directory=self.chroma_directory,
            collection_name=collection_name,
            embedding_model=self.embedding_model_name,
            dimensions=self.embedding_dimensions
        )

        return {
            "repository": f"{owner}/{repo}",
            "collection": collection_name,
            "indexed": True,
            "chunks": store.count(),
            "message": f"Successfully indexed {store.count()} chunks into Chroma collection '{collection_name}'.",
            "embedding_model": self.embedding_model_name
        }
