import pytest
from app.chunker import chunk_text
from app.document import RepositoryDocument, CodeChunk, detect_language


def test_chunk_text_basic():
    text = "Hello world! This is a simple test string for chunking."
    chunks = chunk_text(text, chunk_size=20, overlap=5)
    assert len(chunks) > 1
    assert chunks[0] == text[:20]
    assert "".join(chunks).count("Hello") == 1


def test_chunk_text_smaller_than_chunk_size():
    text = "Short text"
    chunks = chunk_text(text, chunk_size=100, overlap=20)
    assert len(chunks) == 1
    assert chunks[0] == "Short text"


def test_chunk_text_empty():
    text = ""
    chunks = chunk_text(text, chunk_size=50, overlap=10)
    assert chunks == []


def test_detect_language():
    assert detect_language("app/main.py") == "python"
    assert detect_language("src/index.js") == "javascript"
    assert detect_language("src/types.ts") == "typescript"
    assert detect_language("App.java") == "java"
    assert detect_language("main.cpp") == "cpp"
    assert detect_language("server.go") == "go"
    assert detect_language("lib.rs") == "rust"
    assert detect_language("README.md") == "markdown"
    assert detect_language("package.json") == "json"
    assert detect_language("config.yaml") == "yaml"
    assert detect_language("config.yml") == "yaml"
    assert detect_language("pyproject.toml") == "toml"
    assert detect_language("Makefile") == "text"


def test_document_and_chunk_models():
    doc = RepositoryDocument(
        repository="psf/requests",
        file_path="src/requests/api.py",
        language="python",
        content="def get(): pass",
        blob_sha="abc1234"
    )
    assert doc.repository == "psf/requests"
    assert doc.language == "python"

    chunk = CodeChunk(
        repository=doc.repository,
        file_path=doc.file_path,
        language=doc.language,
        chunk_id=0,
        content=doc.content,
        blob_sha=doc.blob_sha
    )
    assert chunk.chunk_id == 0
    assert chunk.file_path == "src/requests/api.py"
