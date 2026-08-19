from unittest.mock import MagicMock, patch
import pytest
from app.services.repository_service import RepositoryService
from app.services.rag_service import RAGService
from app.vector_store import ChromaVectorStore, get_collection_name
from app.document import RepositoryDocument


def test_repository_service_get_status(temp_chroma_dir):
    service = RepositoryService(chroma_directory=temp_chroma_dir)
    status = service.get_status("octocat", "Hello-World")
    assert status["repository"] == "octocat/Hello-World"
    assert status["indexed"] is False
    assert status["chunks"] == 0

    # Add item to collection
    collection_name = get_collection_name("octocat", "Hello-World")
    store = ChromaVectorStore(
        persist_directory=temp_chroma_dir,
        collection_name=collection_name
    )
    store.add_embeddings([{
        "file_path": "README.md",
        "language": "markdown",
        "chunk_id": 0,
        "content": "# Hello World",
        "blob_sha": "abc",
        "embedding": [0.1] * 768
    }])

    status = service.get_status("octocat", "Hello-World")
    assert status["indexed"] is True
    assert status["chunks"] == 1


def test_repository_service_idempotent_indexing(temp_chroma_dir):
    service = RepositoryService(chroma_directory=temp_chroma_dir)
    collection_name = get_collection_name("psf", "requests")
    store = ChromaVectorStore(
        persist_directory=temp_chroma_dir,
        collection_name=collection_name
    )
    store.add_embeddings([{
        "file_path": "README.md",
        "language": "markdown",
        "chunk_id": 0,
        "content": "Requests HTTP Library",
        "blob_sha": "123",
        "embedding": [0.05] * 768
    }])

    # Calling index_repository should not make external calls since it's already indexed
    result = service.index_repository(
        repository_url="https://github.com/psf/requests",
        force_reindex=False
    )
    assert result["indexed"] is True
    assert result["chunks"] == 1
    assert result["repository"] == "psf/requests"


@patch("app.services.repository_service.load_repository")
@patch("app.services.repository_service.EmbeddingModel")
def test_repository_service_fresh_indexing(mock_embedding_cls, mock_load_repo, temp_chroma_dir):
    mock_load_repo.return_value = [
        RepositoryDocument(
            repository="mock/repo",
            file_path="main.py",
            language="python",
            content="print('hello')",
            blob_sha="sha1"
        )
    ]
    mock_embedder = MagicMock()
    mock_embedder.embed_texts.return_value = [[0.1] * 768]
    mock_embedding_cls.return_value = mock_embedder

    service = RepositoryService(chroma_directory=temp_chroma_dir)
    result = service.index_repository(
        repository_url="https://github.com/mock/repo"
    )

    assert result["indexed"] is True
    assert result["chunks"] == 1
    assert result["repository"] == "mock/repo"


def test_rag_service_unindexed_error(temp_chroma_dir):
    service = RAGService(chroma_directory=temp_chroma_dir)
    with pytest.raises(ValueError, match="has not been indexed yet"):
        service.query(
            repository_url="https://github.com/unindexed/repo",
            question="How does this work?"
        )


def test_rag_service_empty_question(temp_chroma_dir):
    service = RAGService(chroma_directory=temp_chroma_dir)
    with pytest.raises(ValueError, match="Question must not be empty"):
        service.query(
            repository_url="https://github.com/psf/requests",
            question="   "
        )


@patch("app.services.rag_service.RAGPipeline")
def test_rag_service_successful_query(mock_rag_pipeline_cls, temp_chroma_dir):
    collection_name = get_collection_name("testorg", "testrepo")
    store = ChromaVectorStore(
        persist_directory=temp_chroma_dir,
        collection_name=collection_name
    )
    store.add_embeddings([{
        "file_path": "README.md",
        "language": "markdown",
        "chunk_id": 0,
        "content": "Doc content",
        "blob_sha": "abc",
        "embedding": [0.1] * 768
    }])

    mock_pipeline = MagicMock()
    mock_pipeline.ask.return_value = {
        "answer": "This is a test answer.",
        "sources": [{"file_path": "README.md", "chunk_id": 0, "score": 0.95}]
    }
    mock_rag_pipeline_cls.return_value = mock_pipeline

    service = RAGService(chroma_directory=temp_chroma_dir)
    result = service.query(
        repository_url="https://github.com/testorg/testrepo",
        question="What does this repository do?"
    )

    assert result["repository"] == "testorg/testrepo"
    assert result["answer"] == "This is a test answer."
    assert len(result["sources"]) == 1
