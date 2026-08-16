import chromadb


class ChromaVectorStore:

    def __init__(self, persist_directory):

        self.client = chromadb.PersistentClient(
            path=persist_directory
        )

        self.collection = (
            self.client.get_or_create_collection(
                name="repository_chunks"
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
                "chunk_id": item["chunk_id"]
            })

        self.collection.add(
            ids=ids,
            embeddings=embeddings,
            documents=documents,
            metadatas=metadatas
        )

    def count(self):

        return self.collection.count()