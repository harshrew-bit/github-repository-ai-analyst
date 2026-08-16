import json

from vector_store import ChromaVectorStore


EMBEDDING_FILE = (
    "data/repositories/"
    "requests_embeddings.json"
)

CHROMA_DIRECTORY = (
    "data/chroma"
)


with open(
    EMBEDDING_FILE,
    "r",
    encoding="utf-8"
) as file:

    data = json.load(file)


items = data["embeddings"]

print(
    f"Loaded {len(items)} embeddings."
)


store = ChromaVectorStore(
    persist_directory=CHROMA_DIRECTORY
)


store.add_embeddings(
    items
)


print(
    f"Chroma collection now contains "
    f"{store.count()} items."
)