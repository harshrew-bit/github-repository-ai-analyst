from embedding import EmbeddingModel
from retriever import Retriever


def main():

    embedding_file = (
        "data/repositories/"
        "tiangolo_fastapi_embeddings.json"
    )

    embedding_model = EmbeddingModel()

    retriever = Retriever(
        embedding_model=embedding_model,
        embedding_file=embedding_file
    )

    query = input(
        "\nAsk a question about FastAPI: "
    )

    results = retriever.search(
        query,
        top_k=5
    )

    print("\nSearch Results")
    print("-------------")

    for i, result in enumerate(results):

        print(
            f"\n{i + 1}. "
            f"{result['file_path']}"
        )

        print(
            f"Score: "
            f"{result['score']:.4f}"
        )

        print(
            f"Chunk ID: "
            f"{result['chunk_id']}"
        )

        print("\nContent:")
        print(
            result["content"][:500]
        )


if __name__ == "__main__":
    main()