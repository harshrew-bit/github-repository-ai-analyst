import re
from urllib.parse import urlparse

from rag import RAGPipeline


chroma_directory = (
    "data/chroma"
)


# Ask the user for the GitHub repository URL.
repository_url = input(
    "\nEnter GitHub repository URL: "
).strip()


# Parse the repository name from the URL.
parsed_url = urlparse(
    repository_url
)

repository_name = (
    parsed_url.path
    .strip("/")
    .split("/")[-1]
)


# Remove .git if the user provides a Git URL.
if repository_name.endswith(".git"):

    repository_name = (
        repository_name[:-4]
    )


# Create a repository-specific Chroma collection name.
# Create a repository-specific Chroma collection name.
def create_collection_name(repository_name):

    sanitized_name = (
        repository_name
        .lower()
    )

    sanitized_name = re.sub(
        r"[^a-z0-9_-]",
        "_",
        sanitized_name
    )

    return (
        f"repository_{sanitized_name}"
    )


collection_name = create_collection_name(
    repository_name
)


print(
    f"\nUsing Chroma collection: "
    f"{collection_name}"
)


rag = RAGPipeline(
    chroma_directory=chroma_directory,
    collection_name=collection_name
)


question = input(
    "\nAsk a question about "
    f"{repository_name}: "
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