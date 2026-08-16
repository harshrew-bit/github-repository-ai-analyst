import json
import os


def save_embeddings(
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
            ensure_ascii=False
        )


def load_embeddings(input_file):

    if not os.path.exists(input_file):
        return None

    with open(
        input_file,
        "r",
        encoding="utf-8"
    ) as file:

        return json.load(file)