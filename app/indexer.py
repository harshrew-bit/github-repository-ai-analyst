import json
import os
import time
from embedding import EmbeddingModel
from vector_store import ChromaVectorStore
from embedding_store import load_embeddings


def save_checkpoint(
    repository,
    commit_sha,
    chunks,
    embeddings,
    output_file
):

    data = {
        "repository": repository,
        "commit_sha": commit_sha,
        "embeddings": []
    }

    for chunk, embedding in zip(chunks, embeddings):

        data["embeddings"].append({
            "file_path": chunk.file_path,
            "language": chunk.language,
            "chunk_id": chunk.chunk_id,
            "content": chunk.content,
            "embedding": embedding
        })

    with open(
        output_file,
        "w",
        encoding="utf-8"
    ) as file:

        json.dump(
            data,
            file,
            indent=2,
            ensure_ascii=False
        )

def store_embeddings_in_chroma(
    chunks,
    embeddings,
    chroma_directory,
    collection_name
):

    store = ChromaVectorStore(
        persist_directory=chroma_directory,
        collection_name=collection_name
    )

    items = []

    for chunk, embedding in zip(
        chunks,
        embeddings
    ):

        items.append({
            "file_path": chunk.file_path,
            "language": chunk.language,
            "chunk_id": chunk.chunk_id,
            "content": chunk.content,
            "embedding": embedding
        })

    store.add_embeddings(items)

    print(
        f"Stored {store.count()} embeddings "
        f"in Chroma collection "
        f"'{collection_name}'."
    )

def restore_chroma_from_checkpoint(
    input_file,
    chroma_directory,
    collection_name
):

    data = load_embeddings(
        input_file
    )

    if data is None:
        return False

    embeddings_data = data.get(
        "embeddings",
        []
    )

    if not embeddings_data:
        return False

    store = ChromaVectorStore(
        persist_directory=chroma_directory,
        collection_name=collection_name
    )

    items = []

    for item in embeddings_data:

        items.append({
            "file_path": item["file_path"],
            "language": item["language"],
            "chunk_id": item["chunk_id"],
            "content": item["content"],
            "embedding": item["embedding"]
        })

    store.add_embeddings(
        items
    )

    print(
        f"Restored {store.count()} embeddings "
        f"from checkpoint into "
        f"'{collection_name}'."
    )

    return True

def checkpoint_matches_commit(
    output_file,
    commit_sha
):

    if not os.path.exists(output_file):
        return False

    with open(
        output_file,
        "r",
        encoding="utf-8"
    ) as file:

        data = json.load(file)

    checkpoint_sha = data.get(
        "commit_sha"
    )

    if not checkpoint_sha:
        return False

    return checkpoint_sha == commit_sha

def create_embedding_index(
    chunks,
    repository,
    commit_sha,
    output_file,
    collection_name,
    chroma_directory="data/chroma",
    batch_size=10
):

    embedding_model = EmbeddingModel()

    all_embeddings = []

    start_index = 0


    # Resume from existing checkpoint
    if os.path.exists(output_file):

        if checkpoint_matches_commit(
            output_file,
            commit_sha
        ):

            print(
                "\nExisting embedding checkpoint "
                "matches current commit."
            )

            print(
                "Loading previous progress..."
            )

            with open(
                output_file,
                "r",
                encoding="utf-8"
            ) as file:

                existing_data = json.load(file)

            existing_embeddings = (
                existing_data.get(
                    "embeddings",
                    []
                )
            )

            all_embeddings = [
                item["embedding"]
                for item in existing_embeddings
            ]

            start_index = len(
                all_embeddings
            )

            print(
                f"Already embedded: "
                f"{start_index}/{len(chunks)}"
            )

        else:

            print(
                "\nExisting embedding checkpoint "
                "does not match current commit."
            )

            print(
                "Starting a fresh embedding index."
            )

    total = len(chunks)

    for start in range(
        start_index,
        total,
        batch_size
    ):

        end = min(
            start + batch_size,
            total
        )

        batch = chunks[start:end]

        print(
            f"\nEmbedding chunks "
            f"{start + 1}-{end}/{total}"
        )

        texts = [
            chunk.content
            for chunk in batch
        ]

        embeddings = (
            embedding_model.embed_texts(
                texts
            )
        )

        all_embeddings.extend(
            embeddings
        )

        # Save after EVERY successful batch
        save_checkpoint(
            repository=repository,
            commit_sha=commit_sha,
            chunks=chunks[:len(all_embeddings)],
            embeddings=all_embeddings,
            output_file=output_file
        )

        print(
            f"Checkpoint saved: "
            f"{len(all_embeddings)}/{total}"
        )

        # Small delay between batches
        time.sleep(3)

    print("\nEmbedding Index Created")
    print("-----------------------")
    print("Chunks:", total)
    print(
        "Embeddings:",
        len(all_embeddings)
    )
    print("Output:", output_file)

    store_embeddings_in_chroma(
    chunks=chunks,
    embeddings=all_embeddings,
    chroma_directory=chroma_directory,
    collection_name=collection_name
)