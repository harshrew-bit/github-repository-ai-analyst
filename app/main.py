from rag import RAGPipeline


chroma_directory = (
    "data/chroma"
)


rag = RAGPipeline(
    chroma_directory=chroma_directory
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