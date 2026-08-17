import json
import os
import time
from embedding import EmbeddingModel
from vector_store import ChromaVectorStore
from embedding_store import load_embeddings


def save_checkpoint(
    repository,
    commit_sha,
    file_map,
    chunks,
    embeddings,
    output_file
):

    data = {
        "repository": repository,
        "commit_sha": commit_sha,
        "file_map": file_map,
        "embeddings": []
    }

    for chunk, embedding in zip(chunks, embeddings):

        data["embeddings"].append({
            "file_path": chunk.file_path,
            "language": chunk.language,
            "chunk_id": chunk.chunk_id,
            "content": chunk.content,
            "blob_sha": chunk.blob_sha,
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
            "blob_sha": chunk.blob_sha,
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
            "blob_sha": item.get("blob_sha", ""),
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

def load_checkpoint_file_map(
    output_file
):

    if not os.path.exists(output_file):
        return {}

    with open(
        output_file,
        "r",
        encoding="utf-8"
    ) as file:

        data = json.load(file)

    return data.get(
        "file_map",
        {}
    )

def compare_file_maps(
    old_file_map,
    new_file_map
):

    old_files = set(
        old_file_map.keys()
    )

    new_files = set(
        new_file_map.keys()
    )

    unchanged = []
    changed = []
    added = []
    deleted = []

    for path in old_files & new_files:

        if old_file_map[path] == new_file_map[path]:
            unchanged.append(path)

        else:
            changed.append(path)

    for path in new_files - old_files:
        added.append(path)

    for path in old_files - new_files:
        deleted.append(path)

    return {
        "unchanged": sorted(unchanged),
        "changed": sorted(changed),
        "added": sorted(added),
        "deleted": sorted(deleted)
    }

def get_files_to_reindex(
    file_changes
):

    return set(
        file_changes["changed"]
        + file_changes["added"]
    )

def update_checkpoint_incrementally(
    output_file,
    repository,
    commit_sha,
    file_map,
    changed_files,
    deleted_files,
    new_chunks,
    new_embeddings
):

    with open(
        output_file,
        "r",
        encoding="utf-8"
    ) as file:

        data = json.load(file)

    old_embeddings = data.get(
        "embeddings",
        []
    )

    affected_files = set(
        changed_files + deleted_files
    )

    updated_embeddings = []

    for item in old_embeddings:

        if item["file_path"] in affected_files:
            continue

        updated_embeddings.append(
            item
        )

    for chunk, embedding in zip(
        new_chunks,
        new_embeddings
    ):

        updated_embeddings.append({
            "file_path": chunk.file_path,
            "language": chunk.language,
            "chunk_id": chunk.chunk_id,
            "content": chunk.content,
            "blob_sha": chunk.blob_sha,
            "embedding": embedding
        })

    data["repository"] = repository
    data["commit_sha"] = commit_sha
    data["file_map"] = file_map
    data["embeddings"] = updated_embeddings

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

    print(
        f"Checkpoint updated: "
        f"{len(updated_embeddings)} embeddings."
    )

def incremental_update(
    repository_url,
    repository,
    changed_files,
    deleted_files,
    commit_sha,
    file_map,
    output_file,
    collection_name,
    chroma_directory="data/chroma"
):

    from ingestion import (
        load_repository,
        create_chunks
    )

    store = ChromaVectorStore(
        persist_directory=chroma_directory,
        collection_name=collection_name
    )


    documents = load_repository(
        repository_url,
        paths=set(changed_files)
    )

    chunks = create_chunks(
        documents
    )

    if not chunks:

        print(
            "No new chunks to embed."
        )

        if not changed_files and deleted_files:

            deleted_count = store.delete_files(
                set(deleted_files)
            )

            print(
                f"Deleted {deleted_count} old chunks."
            )

            update_checkpoint_incrementally(
                output_file=output_file,
                repository=repository,
                commit_sha=commit_sha,
                file_map=file_map,
                changed_files=[],
                deleted_files=deleted_files,
                new_chunks=[],
                new_embeddings=[]
            )

        return

    embedding_model = EmbeddingModel()

    texts = [
        chunk.content
        for chunk in chunks
    ]

    embeddings = embedding_model.embed_texts(
        texts
    )

    files_to_delete = set(
        changed_files + deleted_files
    )

    deleted_count = store.delete_files(
        files_to_delete
    )

    print(
        f"Deleted {deleted_count} old chunks."
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
            "blob_sha": chunk.blob_sha,
            "embedding": embedding
        })

    store.add_embeddings(
        items
    )

    print(
        f"Added {len(items)} new chunks."
    )

    update_checkpoint_incrementally(
        output_file=output_file,
        repository=repository,
        commit_sha=commit_sha,
        file_map=file_map,
        changed_files=changed_files,
        deleted_files=deleted_files,
        new_chunks=chunks,
        new_embeddings=embeddings
    )

def create_embedding_index(
    chunks,
    repository,
    commit_sha,
    file_map,
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
            file_map=file_map,
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