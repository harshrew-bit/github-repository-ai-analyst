from rag import RAGPipeline


embedding_file = (
    "data/repositories/"
    "requests_embeddings.json"
)


rag = RAGPipeline(
    embedding_file=embedding_file
)


question = input(
    "\nAsk a question about Requests: "
)


result = rag.ask(
    question,
    top_k=5
)


print("\nAI Answer")
print("---------")
print(result["answer"])


print("\nSources")
print("-------")

for source in result["sources"]:

    print(
        f"- {source['file_path']} "
        f"(chunk {source['chunk_id']}, "
        f"score: {source['score']:.4f})"
    )