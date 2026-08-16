import json
import os
import time

from embedding import EmbeddingModel


def save_checkpoint(
    repository,
    chunks,
    embeddings,
    output_file
):

    data = {
        "repository": repository,
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


def create_embedding_index(
    chunks,
    repository,
    output_file,
    batch_size=10
):

    embedding_model = EmbeddingModel()

    all_embeddings = []

    start_index = 0

    # Resume from existing checkpoint
    if os.path.exists(output_file):

        print("\nExisting embedding file found.")
        print("Loading previous progress...")

        with open(
            output_file,
            "r",
            encoding="utf-8"
        ) as file:

            existing_data = json.load(file)

        existing_embeddings = existing_data.get(
            "embeddings",
            []
        )

        all_embeddings = [
            item["embedding"]
            for item in existing_embeddings
        ]

        start_index = len(all_embeddings)

        print(
            f"Already embedded: "
            f"{start_index}/{len(chunks)}"
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

        max_retries = 5

        for attempt in range(max_retries):

            try:

                embeddings = (
                    embedding_model.embed_texts(
                        texts
                    )
                )

                break

            except Exception as e:

                if "429" not in str(e):
                    raise

                wait_time = 30 * (attempt + 1)

                print(
                    "Rate limit reached."
                )

                print(
                    f"Waiting "
                    f"{wait_time} seconds..."
                )

                time.sleep(wait_time)

        else:

            print(
                "\nEmbedding stopped because "
                "the API rate limit persisted."
            )

            print(
                f"Successfully saved: "
                f"{len(all_embeddings)} chunks"
            )

            return

        all_embeddings.extend(
            embeddings
        )

        # Save after EVERY successful batch
        save_checkpoint(
            repository=repository,
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