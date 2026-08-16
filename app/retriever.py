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
            persist_directory=chroma_directory,
            collection_name="repository_chunks_cosine"
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

        # Retrieve more candidates than we finally need.
        candidate_count = max(
            top_k * 3,
            15
        )

        results = self.store.collection.query(
            query_embeddings=[query_embedding],
            n_results=candidate_count
        )

        candidates = []

        for i in range(
            len(results["documents"][0])
        ):

            metadata = (
                results["metadatas"][0][i]
            )

            distance = (
                results["distances"][0][i]
            )

            candidates.append({
                "score": 1 - distance,
                "file_path": metadata["file_path"],
                "language": metadata["language"],
                "chunk_id": metadata["chunk_id"],
                "content": results["documents"][0][i]
            })

        # Prefer results from different files.
        selected_results = []
        seen_files = set()

        for result in candidates:

            if result["file_path"] in seen_files:
                continue

            selected_results.append(result)

            seen_files.add(
                result["file_path"]
            )

            if len(selected_results) == top_k:
                break

        return selected_results