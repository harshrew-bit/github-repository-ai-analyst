import pytest
from app.vector_store import get_collection_name, ChromaVectorStore


def test_get_collection_name_standard():
    name = get_collection_name("psf", "requests")
    assert name == "repository_psf_requests_v2"


def test_get_collection_name_without_version():
    name = get_collection_name("psf", "requests", include_version=False)
    assert name == "repository_psf_requests"


def test_get_collection_name_hyphen_and_dots():
    name = get_collection_name("pallets-eco", "flask-smorest.git")
    assert name == "repository_pallets-eco_flask-smorest_git_v2"


def test_get_collection_name_uppercase():
    name = get_collection_name("PSF", "Requests")
    assert name == "repository_psf_requests_v2"


def test_get_collection_name_special_characters():
    name = get_collection_name("user@name!", "repo#1")
    assert name == "repository_user_name_repo_1_v2"


def test_get_collection_name_length_limit():
    long_owner = "a" * 50
    long_repo = "b" * 50
    name = get_collection_name(long_owner, long_repo)
    assert len(name) <= 63
    assert not name.endswith("_")
    assert not name.endswith("-")


def test_get_collection_name_model_versioning():
    v1_name = get_collection_name("psf", "requests", model_name="gemini-embedding-001")
    v2_name = get_collection_name("psf", "requests", model_name="gemini-embedding-2")
    assert v1_name == "repository_psf_requests_v1"
    assert v2_name == "repository_psf_requests_v2"
    assert v1_name != v2_name


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
            "embedding": [0.1] * 3072
        },
        {
            "file_path": "app/main.py",
            "language": "python",
            "chunk_id": 1,
            "content": "if __name__ == '__main__': main()",
            "blob_sha": "sha1",
            "embedding": [0.2] * 3072
        }
    ]

    store.add_embeddings(items)
    assert store.count() == 2

    # Test delete
    deleted = store.delete_files(["app/main.py"])
    assert deleted == 2
    assert store.count() == 0


def test_chroma_vector_store_prevents_mixing_old_and_new_models(temp_chroma_dir):
    """Verify ChromaVectorStore does not allow adding embeddings from mismatched models."""
    store_v1 = ChromaVectorStore(
        persist_directory=temp_chroma_dir,
        collection_name="test_mixed_collection",
        embedding_model="gemini-embedding-001",
        dimensions=768
    )
    store_v1.add_embeddings([
        {
            "file_path": "README.md",
            "language": "markdown",
            "chunk_id": 0,
            "content": "v1 content",
            "blob_sha": "sha1",
            "embedding": [0.1] * 768
        }
    ])
    assert store_v1.count() == 1

    # Attempt to open same collection with gemini-embedding-2
    store_v2 = ChromaVectorStore(
        persist_directory=temp_chroma_dir,
        collection_name="test_mixed_collection",
        embedding_model="gemini-embedding-2",
        dimensions=3072
    )

    assert store_v2.is_compatible("gemini-embedding-2", 3072) is False

    with pytest.raises(ValueError, match="incompatible model"):
        store_v2.add_embeddings([
            {
                "file_path": "main.py",
                "language": "python",
                "chunk_id": 0,
                "content": "v2 content",
                "blob_sha": "sha2",
                "embedding": [0.5] * 3072
            }
        ])

    # Recreate cleanly
    store_v2.recreate_collection()
    assert store_v2.count() == 0
    assert store_v2.is_compatible("gemini-embedding-2", 3072) is True

    # Now adding v2 embeddings succeeds
    store_v2.add_embeddings([
        {
            "file_path": "main.py",
            "language": "python",
            "chunk_id": 0,
            "content": "v2 content",
            "blob_sha": "sha2",
            "embedding": [0.5] * 3072
        }
    ])
    assert store_v2.count() == 1
