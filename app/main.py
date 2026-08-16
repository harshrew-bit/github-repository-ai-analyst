from rag import RAGPipeline


chroma_directory = (
    "data/chroma"
)


# Repository name for this test.
# We will make this dynamic from the GitHub URL later.
repository_name = "requests"


# Create a repository-specific Chroma collection name.
collection_name = (
    f"repository_{repository_name}"
)


rag = RAGPipeline(
    chroma_directory=chroma_directory,
    collection_name=collection_name
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