import os
import re
from ingestion import (
    parse_github_url,
    load_repository,
    create_chunks
)

from indexer import (
    create_embedding_index,
    restore_chroma_from_checkpoint
)
from vector_store import ChromaVectorStore

from rag import RAGPipeline


chroma_directory = (
    "data/chroma"
)


# Ask the user for the GitHub repository URL.
repository_url = input(
    "\nEnter GitHub repository URL: "
).strip()


# using the existing ingestion logic.
owner, repository_name = parse_github_url(
    repository_url
)


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
def create_embedding_file_path(
    owner,
    repository_name
):

    repository_id = (
        f"{owner}_{repository_name}"
        .lower()
    )

    repository_id = re.sub(
        r"[^a-z0-9_-]",
        "_",
        repository_id
    )

    return (
        f"data/repositories/"
        f"{repository_id}_embeddings.json"
    )

collection_name = create_collection_name(
    repository_name
)

embedding_file = create_embedding_file_path(
    owner,
    repository_name
)

print(
    f"Using embedding checkpoint: "
    f"{embedding_file}"
)

print(
    f"\nUsing Chroma collection: "
    f"{collection_name}"
)


store = ChromaVectorStore(
    persist_directory=chroma_directory,
    collection_name=collection_name
)


if store.count() == 0:

    print(
        "\nChroma collection is empty."
    )

    if os.path.exists(embedding_file):

        print(
            "Embedding checkpoint found."
        )

        print(
            "Restoring Chroma from checkpoint..."
        )

        restore_chroma_from_checkpoint(
            input_file=embedding_file,
            chroma_directory=chroma_directory,
            collection_name=collection_name
        )

    else:

        print(
            "No embedding checkpoint found."
        )

        print(
            "Indexing repository..."
        )

        documents = load_repository(
            repository_url
        )

        chunks = create_chunks(
            documents
        )

        print(
            f"\nDocuments: {len(documents)}"
        )

        print(
            f"Total chunks: {len(chunks)}"
        )

        create_embedding_index(
            chunks=chunks,
            repository=f"{owner}/{repository_name}",
            output_file=embedding_file,
            collection_name=collection_name,
            chroma_directory=chroma_directory
        )

else:

    print(
        "\nRepository already indexed."
    )

    print(
        f"Chroma embeddings: {store.count()}"
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