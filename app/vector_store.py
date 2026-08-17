import chromadb


class ChromaVectorStore:

    def __init__(
        self,
        persist_directory,
        collection_name
    ):

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
