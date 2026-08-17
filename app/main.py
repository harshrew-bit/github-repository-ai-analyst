import os
import re
from ingestion import (
    parse_github_url,
    load_repository,
    create_chunks,
    get_repository_file_map
)

from indexer import (
    create_embedding_index,
    restore_chroma_from_checkpoint,
    load_checkpoint_file_map,
    compare_file_maps,
    get_files_to_reindex,
    incremental_update,
    update_checkpoint_incrementally
)
from vector_store import ChromaVectorStore

from rag import RAGPipeline
from github_client import GitHubClient


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

github_client = GitHubClient()

repository_data = github_client.get_repository(
    owner,
    repository_name
)

branch = repository_data[
    "default_branch"
]

current_commit_sha = (
    github_client.get_latest_commit_sha(
        owner,
        repository_name,
        branch
    )
)

print(
    f"Current commit: "
    f"{current_commit_sha}"
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

def checkpoint_matches_commit(
    embedding_file,
    current_commit_sha
):

    if not os.path.exists(
        embedding_file
    ):
        return False

    import json

    with open(
        embedding_file,
        "r",
        encoding="utf-8"
    ) as file:

        data = json.load(file)

    checkpoint_sha = data.get(
        "commit_sha"
    )

    if not checkpoint_sha:
        return False

    return (
        checkpoint_sha
        == current_commit_sha
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

        if checkpoint_matches_commit(
            embedding_file,
            current_commit_sha
        ):

            print(
                "Embedding checkpoint matches "
                "current commit."
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
                "Embedding checkpoint is outdated."
            )

            print(
                "Indexing repository again..."
            )

            documents = load_repository(
                repository_url
            )

            chunks = create_chunks(
                documents
            )

            file_map = {
                document.file_path: document.blob_sha
                for document in documents
            }

            print(
                f"\nDocuments: {len(documents)}"
            )

            print(
                f"Total chunks: {len(chunks)}"
            )

            create_embedding_index(
                chunks=chunks,
                repository=f"{owner}/{repository_name}",
                commit_sha=current_commit_sha,
                file_map=file_map,
                output_file=embedding_file,
                collection_name=collection_name,
                chroma_directory=chroma_directory
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

        file_map = {
            document.file_path: document.blob_sha
            for document in documents
        }

        print(
            f"\nDocuments: {len(documents)}"
        )

        print(
            f"Total chunks: {len(chunks)}"
        )

        create_embedding_index(
            chunks=chunks,
            repository=f"{owner}/{repository_name}",
            commit_sha=current_commit_sha,
            file_map=file_map,
            output_file=embedding_file,
            collection_name=collection_name,
            chroma_directory=chroma_directory
        )

else:

    if checkpoint_matches_commit(
        embedding_file,
        current_commit_sha
    ):

        print(
            "\nRepository already indexed."
        )

        print(
            f"Chroma embeddings: {store.count()}"
        )

    else:

        print(
            "\nRepository has changed."
        )

        print(
            "Current commit does not match "
            "indexed commit."
        )

        old_file_map = load_checkpoint_file_map(
            embedding_file
        )

        current_file_map = get_repository_file_map(
            repository_url
        )

        file_changes = compare_file_maps(
            old_file_map,
            current_file_map
        )

        files_to_reindex = get_files_to_reindex(
            file_changes
        )

        print(
            "\nFile changes:"
        )

        print(
            f"Unchanged: "
            f"{len(file_changes['unchanged'])}"
        )

        print(
            f"Changed: "
            f"{len(file_changes['changed'])}"
        )

        print(
            f"Added: "
            f"{len(file_changes['added'])}"
        )

        print(
            f"Deleted: "
            f"{len(file_changes['deleted'])}"
        )

        if not files_to_reindex and not file_changes["deleted"]:

            print(
                "\nNo indexed file changes detected."
            )

            print(
                "Updating checkpoint metadata."
            )

            update_checkpoint_incrementally(
                output_file=embedding_file,
                repository=f"{owner}/{repository_name}",
                commit_sha=current_commit_sha,
                file_map=current_file_map,
                changed_files=[],
                deleted_files=[],
                new_chunks=[],
                new_embeddings=[]
            )

        else:

            incremental_update(
                repository_url=repository_url,
                repository=f"{owner}/{repository_name}",
                changed_files=sorted(
                    files_to_reindex
                ),
                deleted_files=file_changes[
                    "deleted"
                ],
                commit_sha=current_commit_sha,
                file_map=current_file_map,
                output_file=embedding_file,
                collection_name=collection_name,
                chroma_directory=chroma_directory
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