import os
import re
import chromadb


def get_collection_name(owner: str, repo: str) -> str:
    """
    Generate a deterministic, Chroma-safe collection name for a GitHub repository.
    Format: repository_<sanitized_owner>_<sanitized_repo>
    Chroma naming rules:
    - 3-63 characters length
    - Alphanumeric characters, underscores, or hyphens
    - Must start and end with an alphanumeric character
    """
    clean_owner = re.sub(r"[^a-zA-Z0-9_-]", "_", owner.strip()).strip("_").lower()
    clean_repo = re.sub(r"[^a-zA-Z0-9_-]", "_", repo.strip()).strip("_").lower()

    clean_owner = clean_owner or "owner"
    clean_repo = clean_repo or "repo"

    name = f"repository_{clean_owner}_{clean_repo}"

    # Enforce maximum 63 characters
    if len(name) > 63:
        name = name[:63].rstrip("_-")

    return name


class ChromaVectorStore:

    def __init__(
        self,
        persist_directory,
        collection_name
    ):

        self.persist_directory = persist_directory
        self.collection_name = collection_name

        self.client = chromadb.PersistentClient(
            path=persist_directory
        )

        self.collection = (
            self.client.get_or_create_collection(
                name=collection_name,
                metadata={
                    "hnsw:space": "cosine"
                }
            )
        )

    def add_embeddings(self, items):

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
