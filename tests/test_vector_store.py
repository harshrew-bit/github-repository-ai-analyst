import pytest
from app.vector_store import get_collection_name, ChromaVectorStore


def test_get_collection_name_standard():
    name = get_collection_name("psf", "requests")
    assert name == "repository_psf_requests"


def test_get_collection_name_hyphen_and_dots():
    name = get_collection_name("pallets-eco", "flask-smorest.git")
    assert name == "repository_pallets-eco_flask-smorest_git"


def test_get_collection_name_uppercase():
    name = get_collection_name("PSF", "Requests")
    assert name == "repository_psf_requests"


def test_get_collection_name_special_characters():
    name = get_collection_name("user@name!", "repo#1")
    assert name == "repository_user_name_repo_1"


def test_get_collection_name_length_limit():
    long_owner = "a" * 50
    long_repo = "b" * 50
    name = get_collection_name(long_owner, long_repo)
    assert len(name) <= 63
    assert not name.endswith("_")
    assert not name.endswith("-")


def test_chroma_vector_store_operations(temp_chroma_dir):
    store = ChromaVectorStore(
        persist_directory=temp_chroma_dir,
        collection_name="test_collection"
    )
    assert store.count() == 0

    # Add mock embeddings
    items = [
        {
            "file_path": "app/main.py",
            "language": "python",
            "chunk_id": 0,
            "content": "def main(): pass",
            "blob_sha": "sha1",
            "embedding": [0.1] * 768
        },
        {
            "file_path": "app/main.py",
            "language": "python",
            "chunk_id": 1,
            "content": "if __name__ == '__main__': main()",
            "blob_sha": "sha1",
            "embedding": [0.2] * 768
        }
    ]

    store.add_embeddings(items)
    assert store.count() == 2

    # Test delete
    deleted = store.delete_files(["app/main.py"])
    assert deleted == 2
    assert store.count() == 0
