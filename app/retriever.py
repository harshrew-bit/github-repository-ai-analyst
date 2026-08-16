import json

from similarity import cosine_similarity


class Retriever:

    def __init__(
        self,
        embedding_model,
        embedding_file
    ):

        self.embedding_model = embedding_model

        with open(
            embedding_file,
            "r",
            encoding="utf-8"
        ) as file:

            data = json.load(file)

        self.embeddings = data["embeddings"]

        print(
            f"Loaded {len(self.embeddings)} embeddings."
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

        results = []

        # Calculate similarity with every stored embedding
        for item in self.embeddings:

            score = cosine_similarity(
                query_embedding,
                item["embedding"]
            )

            results.append({
                "score": score,
                "file_path": item["file_path"],
                "language": item["language"],
                "chunk_id": item["chunk_id"],
                "content": item["content"]
            })

        # Highest similarity first
        results.sort(
            key=lambda x: x["score"],
            reverse=True
        )

        

        # Prefer different files
        selected_results = []
        seen_files = set()

        for result in results:

            if result["file_path"] in seen_files:
                continue

            selected_results.append(result)

            seen_files.add(
                result["file_path"]
            )

            if len(selected_results) == top_k:
                break

        return selected_results