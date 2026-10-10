import os
import re
from typing import Optional
import chromadb


def get_model_tag(model_name: Optional[str] = None) -> str:
    """
    Generate a concise, safe version tag for collection namespacing.
    gemini-embedding-2 -> v2
    gemini-embedding-001 -> v1
    """
    if not model_name:
        model_name = os.getenv("GEMINI_EMBEDDING_MODEL", "gemini-embedding-2")
    clean = model_name.removeprefix("models/").strip().lower()
    if clean in ("gemini-embedding-2", "embedding-2"):
        return "v2"
    if clean in ("gemini-embedding-001", "embedding-001"):
        return "v1"
    sanitized = re.sub(r"[^a-zA-Z0-9]", "", clean)
    return sanitized[:8] if sanitized else "v2"


def get_collection_name(
    owner: str,
    repo: str,
    model_name: Optional[str] = None,
    include_version: bool = True
) -> str:
    """
    Generate a deterministic, Chroma-safe collection name for a GitHub repository.
    Format: repository_<sanitized_owner>_<sanitized_repo>[_<version_tag>]
    Chroma naming rules:
    - 3-63 characters length
    - Alphanumeric characters, underscores, or hyphens
    - Must start and end with an alphanumeric character
    """
    clean_owner = re.sub(r"[^a-zA-Z0-9_-]", "_", owner.strip()).strip("_").lower()
    clean_repo = re.sub(r"[^a-zA-Z0-9_-]", "_", repo.strip()).strip("_").lower()

    clean_owner = clean_owner or "owner"
    clean_repo = clean_repo or "repo"

    tag = get_model_tag(model_name) if include_version else ""
    suffix = f"_{tag}" if tag else ""

    max_base_len = 63 - len(suffix)
    name = f"repository_{clean_owner}_{clean_repo}"
    if len(name) > max_base_len:
        name = name[:max_base_len].rstrip("_-")

    full_name = f"{name}{suffix}"
    if not full_name[-1].isalnum():
        full_name = full_name.rstrip("_-") + "0"

    return full_name


class ChromaVectorStore:

    def __init__(
        self,
        persist_directory: str,
        collection_name: str,
        embedding_model: Optional[str] = None,
        dimensions: Optional[int] = None
    ):

        self.persist_directory = persist_directory
        self.collection_name = collection_name
        self.embedding_model = (
            embedding_model
            or os.getenv("GEMINI_EMBEDDING_MODEL", "gemini-embedding-2")
        ).removeprefix("models/").strip()

        if dimensions is not None:
            self.dimensions = dimensions
        else:
            raw_dims = os.getenv("GEMINI_EMBEDDING_DIMENSIONS", "3072")
            try:
                self.dimensions = int(raw_dims) if raw_dims else 3072
            except ValueError:
                self.dimensions = 3072

        os.makedirs(persist_directory, exist_ok=True)

        self.client = chromadb.PersistentClient(
            path=persist_directory
        )

        self.collection = (
            self.client.get_or_create_collection(
                name=collection_name,
                metadata={
                    "hnsw:space": "cosine",
                    "embedding_model": self.embedding_model,
                    "dimensions": self.dimensions
                }
            )
        )

    def get_metadata(self) -> dict:
        return self.collection.metadata or {}

    def is_compatible(
        self,
        expected_model: Optional[str] = None,
        expected_dimensions: Optional[int] = None
    ) -> bool:
        """
        Check if collection is compatible with expected embedding model and dimensions.
        Empty collections are always considered compatible.
        """
        if self.count() == 0:
            return True

        expected_model = (
            expected_model or self.embedding_model
        ).removeprefix("models/").strip()
        expected_dimensions = expected_dimensions or self.dimensions

        meta = self.get_metadata()
        stored_model = meta.get("embedding_model")
        stored_dims = meta.get("dimensions")

        if stored_model and stored_model != expected_model:
            return False

        # If collection has embeddings but no embedding_model in metadata,
        # it is a legacy collection (e.g. gemini-embedding-001)
        if not stored_model and expected_model != "gemini-embedding-001":
            return False

        if stored_dims and expected_dimensions and stored_dims != expected_dimensions:
            return False

        return True

    def clear(self):
        """
        Delete all items in the collection while keeping collection metadata.
        """
        all_items = self.collection.get(include=[])
        if all_items and all_items.get("ids"):
            self.collection.delete(ids=all_items["ids"])

    def recreate_collection(self):
        """
        Cleanly drop and recreate the collection with current model metadata.
        """
        try:
            self.client.delete_collection(name=self.collection_name)
        except Exception:
            pass

        self.collection = self.client.get_or_create_collection(
            name=self.collection_name,
            metadata={
                "hnsw:space": "cosine",
                "embedding_model": self.embedding_model,
                "dimensions": self.dimensions
            }
        )

    def add_embeddings(self, items):
        if not items:
            return

        if not self.is_compatible(self.embedding_model, self.dimensions):
            raise ValueError(
                f"Cannot add embeddings to collection '{self.collection_name}': "
                f"collection contains embeddings from incompatible model "
                f"'{self.get_metadata().get('embedding_model', 'unknown')}' "
                f"(current model: '{self.embedding_model}'). Clean re-index required."
            )

        ids = []
        embeddings = []
        documents = []
        metadatas = []

        for item in items:

            ids.append(
                f"{item['file_path']}:{item['chunk_id']}"
            )

            embeddings.append(
                item["embedding"]
            )

            documents.append(
                item["content"]
            )

            metadatas.append({
                "file_path": item["file_path"],
                "language": item["language"],
                "chunk_id": item["chunk_id"],
                "blob_sha": item.get("blob_sha", "")
            })

        self.collection.upsert(
            ids=ids,
            embeddings=embeddings,
            documents=documents,
            metadatas=metadatas
        )

    def count(self):

        return self.collection.count()

    def delete_files(
        self,
        file_paths
    ):

        ids = []

        for file_path in file_paths:

            results = self.collection.get(
                where={
                    "file_path": file_path
                },
                include=[]
            )

            ids.extend(
                results["ids"]
            )

        if ids:
            self.collection.delete(
                ids=ids
            )

        return len(ids)

    def delete_collection(self):

        self.client.delete_collection(
            name=self.collection.name
        )
