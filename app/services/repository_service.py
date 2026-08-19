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
    get_collection_name
)
from embedding import EmbeddingModel
from indexer import (
    store_embeddings_in_chroma,
    restore_chroma_from_checkpoint
)


class RepositoryService:

    def __init__(self, chroma_directory: str = "data/chroma"):
        self.chroma_directory = chroma_directory

    def get_status(self, owner: str, repo: str) -> dict:
        """
        Check whether a repository is indexed in Chroma and return chunk count.
        """
        collection_name = get_collection_name(owner, repo)
        try:
            store = ChromaVectorStore(
                persist_directory=self.chroma_directory,
                collection_name=collection_name
            )
            count = store.count()
        except Exception:
            count = 0

        return {
            "repository": f"{owner}/{repo}",
            "collection": collection_name,
            "indexed": count > 0,
            "chunks": count
        }

    def index_repository(
        self,
        repository_url: str,
        batch_size: int = 10,
        force_reindex: bool = False
    ) -> dict:
        """
        Automatically index a repository into its repository-specific Chroma collection.
        Idempotent: if already indexed, reuses the existing collection unless force_reindex=True.
        """
        owner, repo = parse_github_url(repository_url)
        collection_name = get_collection_name(owner, repo)

        store = ChromaVectorStore(
            persist_directory=self.chroma_directory,
            collection_name=collection_name
        )

        existing_count = store.count()
        if existing_count > 0 and not force_reindex:
            return {
                "repository": f"{owner}/{repo}",
                "collection": collection_name,
                "indexed": True,
                "chunks": existing_count,
                "message": "Repository is already indexed."
            }

        # Check if an existing checkpoint file exists to avoid unnecessary re-embedding
        candidate_checkpoints = [
            os.path.join("data", "repositories", f"{owner}_{repo}_embeddings.json".lower()),
            os.path.join("data", "repositories", f"{repo}_embeddings.json".lower()),
            os.path.join("data", "repositories", f"{owner}_{repo}.json".lower()),
        ]

        if not force_reindex:
            for checkpoint_path in candidate_checkpoints:
                if os.path.exists(checkpoint_path):
                    restored = restore_chroma_from_checkpoint(
                        input_file=checkpoint_path,
                        chroma_directory=self.chroma_directory,
                        collection_name=collection_name
                    )
                    if restored and store.count() > 0:
                        return {
                            "repository": f"{owner}/{repo}",
                            "collection": collection_name,
                            "indexed": True,
                            "chunks": store.count(),
                            "message": "Restored repository from local embedding checkpoint."
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

        embedding_model = EmbeddingModel()
        all_embeddings = []
        total = len(chunks)

        for start in range(0, total, batch_size):
            end = min(start + batch_size, total)
            batch = chunks[start:end]
            texts = [chunk.content for chunk in batch]
            embeddings = embedding_model.embed_texts(texts)
            all_embeddings.extend(embeddings)

        store_embeddings_in_chroma(
            chunks=chunks,
            embeddings=all_embeddings,
            chroma_directory=self.chroma_directory,
            collection_name=collection_name
        )

        return {
            "repository": f"{owner}/{repo}",
            "collection": collection_name,
            "indexed": True,
            "chunks": store.count(),
            "message": f"Successfully indexed {store.count()} chunks into Chroma collection '{collection_name}'."
        }
