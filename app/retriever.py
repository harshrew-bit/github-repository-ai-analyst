from embedding import EmbeddingModel
from vector_store import ChromaVectorStore


class Retriever:

    def __init__(
        self,
        embedding_model,
        chroma_directory
    ):

        self.embedding_model = embedding_model

        self.store = ChromaVectorStore(
            persist_directory=chroma_directory
        )

        print(
            f"Loaded "
            f"{self.store.count()} embeddings."
        )

    def search(
        self,
        query,
        top_k=5
    ):

        # Create embedding for the user's question
        query_embedding = (
            self.embedding_model.embed_text(
                query
            )
        )

        # Search Chroma
        results = self.store.collection.query(
            query_embeddings=[query_embedding],
            n_results=top_k
        )

        retrieved_results = []

        for i in range(top_k):

            metadata = (
                results["metadatas"][0][i]
            )

            retrieved_results.append({
                "score": 1 - results["distances"][0][i],
                "file_path": metadata["file_path"],
                "language": metadata["language"],
                "chunk_id": metadata["chunk_id"],
                "content": results["documents"][0][i]
            })

        return retrieved_results