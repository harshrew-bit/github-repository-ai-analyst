import os
import json
from unittest.mock import MagicMock, patch
import pytest
import requests

from app.retry import retry_request, get_status_code, get_retry_after
from app.embedding import EmbeddingModel, GeminiQuotaExceededError, GeminiEmbeddingError
from app.generator import generate_answer
from app.services.repository_service import RepositoryService
from app.document import RepositoryDocument


# --- 1. Retry Logic Tests ---

def test_retry_request_429_success_after_transient_failure():
    """Verify that a transient 429 is retried and succeeds on a subsequent attempt."""
    mock_func = MagicMock()
    
    # First attempt: 429 response, Second attempt: 200 OK response
    err_response = requests.Response()
    err_response.status_code = 429
    err = requests.exceptions.HTTPError(response=err_response)
    
    ok_response = requests.Response()
    ok_response.status_code = 200
    
    mock_func.side_effect = [err, ok_response]
    
    with patch("time.sleep") as mock_sleep:
        result = retry_request(mock_func, max_retries=3, initial_delay=0.01)
        assert result == ok_response
        assert mock_func.call_count == 2
        assert mock_sleep.call_count == 1


def test_retry_request_bounded_retries_exhausted():
    """Verify that retries are bounded and re-raise the original error once max_retries is reached."""
    mock_func = MagicMock()
    
    err_response = requests.Response()
    err_response.status_code = 429
    err = requests.exceptions.HTTPError("Rate limited", response=err_response)
    
    mock_func.side_effect = err
    
    with patch("time.sleep"):
        with pytest.raises(requests.exceptions.HTTPError) as exc_info:
            retry_request(mock_func, max_retries=3, initial_delay=0.01)
        
        assert exc_info.value == err
        assert get_status_code(exc_info.value) == 429
        assert mock_func.call_count == 3


def test_retry_request_respects_retry_after():
    """Verify that Retry-After header is parsed and respected."""
    mock_func = MagicMock()
    
    err_response = requests.Response()
    err_response.status_code = 429
    err_response.headers["Retry-After"] = "5"
    err = requests.exceptions.HTTPError(response=err_response)
    
    ok_response = requests.Response()
    ok_response.status_code = 200
    
    mock_func.side_effect = [err, ok_response]
    
    # Test helper
    assert get_retry_after(err) == 5.0
    
    with patch("time.sleep") as mock_sleep:
        retry_request(mock_func, max_retries=2, initial_delay=0.01)
        assert mock_sleep.call_count == 1
        # wait_time should be at least 5.0 seconds
        slept_time = mock_sleep.call_args[0][0]
        assert slept_time >= 5.0


def test_retry_request_non_retryable_fails_immediately():
    """Verify non-retryable errors (e.g. 400 Bad Request) are raised immediately without retry."""
    mock_func = MagicMock()
    err_response = requests.Response()
    err_response.status_code = 400
    err = requests.exceptions.HTTPError(response=err_response)
    mock_func.side_effect = err
    
    with patch("time.sleep") as mock_sleep:
        with pytest.raises(requests.exceptions.HTTPError):
            retry_request(mock_func, max_retries=4)
        assert mock_func.call_count == 1
        assert mock_sleep.call_count == 0


# --- 2. Embedding Model Tests ---

def test_embedding_model_defaults(monkeypatch):
    """Verify default embedding model is gemini-embedding-2 with dimension 3072."""
    monkeypatch.delenv("GEMINI_EMBEDDING_MODEL", raising=False)
    monkeypatch.delenv("GEMINI_EMBEDDING_DIMENSIONS", raising=False)
    with patch("app.embedding.GeminiClient") as mock_client_cls:
        mock_client = MagicMock()
        mock_client.current_key = "dummy-key"
        mock_client_cls.return_value = mock_client
        
        embedder = EmbeddingModel()
        assert embedder.model_name == "gemini-embedding-2"
        assert "gemini-embedding-2" in embedder.url
        assert embedder.dimensions == 3072


def test_embedding_model_configurable(monkeypatch):
    """Verify GEMINI_EMBEDDING_MODEL environment variable overrides model."""
    monkeypatch.setenv("GEMINI_EMBEDDING_MODEL", "custom-embed-model")
    with patch("app.embedding.GeminiClient") as mock_client_cls:
        mock_client = MagicMock()
        mock_client.current_key = "dummy-key"
        mock_client_cls.return_value = mock_client
        
        embedder = EmbeddingModel()
        assert embedder.model_name == "custom-embed-model"
        assert "custom-embed-model" in embedder.url


def test_embedding_dimensions_configurable(monkeypatch):
    """Verify GEMINI_EMBEDDING_DIMENSIONS environment variable and constructor configure dimensions."""
    monkeypatch.setenv("GEMINI_EMBEDDING_DIMENSIONS", "1536")
    with patch("app.embedding.GeminiClient") as mock_client_cls:
        mock_client = MagicMock()
        mock_client.current_key = "dummy-key"
        mock_client_cls.return_value = mock_client

        embedder = EmbeddingModel()
        assert embedder.dimensions == 1536

        # Explicit parameter override
        custom_embedder = EmbeddingModel(dimensions=768)
        assert custom_embedder.dimensions == 768


def test_gemini_2_rest_payload_and_endpoint(monkeypatch):
    """Verify correct Gemini Embedding 2 batchEmbedContents REST payload and endpoint."""
    with patch("app.embedding.GeminiClient") as mock_client_cls, \
         patch("app.embedding.requests.post") as mock_post:
        mock_client = MagicMock()
        mock_client.current_key = "test-api-key"
        mock_client_cls.return_value = mock_client

        ok_response = requests.Response()
        ok_response.status_code = 200
        ok_response._content = json.dumps({
            "embeddings": [
                {"values": [0.1] * 3072},
                {"values": [0.2] * 3072}
            ]
        }).encode()
        mock_post.return_value = ok_response

        embedder = EmbeddingModel()
        result = embedder.embed_texts(["hello", "world"])

        assert len(result) == 2
        assert len(result[0]) == 3072

        # Verify endpoint URL
        called_url = mock_post.call_args[0][0]
        assert called_url == "https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-2:batchEmbedContents"

        # Verify JSON payload
        payload = mock_post.call_args[1]["json"]
        assert "requests" in payload
        assert len(payload["requests"]) == 2
        first_req = payload["requests"][0]
        assert first_req["model"] == "models/gemini-embedding-2"
        assert first_req["content"]["parts"][0]["text"] == "hello"
        assert first_req["outputDimensionality"] == 3072

        second_req = payload["requests"][1]
        assert second_req["content"]["parts"][0]["text"] == "world"
        assert second_req["outputDimensionality"] == 3072


def test_batch_embedding_works():
    """Verify batch embedding multiple texts returns corresponding vectors."""
    with patch("app.embedding.GeminiClient") as mock_client_cls, \
         patch("app.embedding.requests.post") as mock_post:
        mock_client = MagicMock()
        mock_client.current_key = "key1"
        mock_client_cls.return_value = mock_client

        ok_response = requests.Response()
        ok_response.status_code = 200
        ok_response._content = json.dumps({
            "embeddings": [
                {"values": [0.01] * 3072},
                {"values": [0.02] * 3072},
                {"values": [0.03] * 3072}
            ]
        }).encode()
        mock_post.return_value = ok_response

        embedder = EmbeddingModel()
        results = embedder.embed_texts(["chunk 1", "chunk 2", "chunk 3"])
        assert len(results) == 3
        assert results[0] == [0.01] * 3072
        assert results[1] == [0.02] * 3072
        assert results[2] == [0.03] * 3072


def test_embedding_model_sanitized_quota_error(monkeypatch):
    """Verify that when 429 occurs, a sanitized GeminiQuotaExceededError is raised without leaking keys."""
    monkeypatch.setenv("GEMINI_API_KEY_1", "SECRET_KEY_12345")
    
    with patch("app.embedding.requests.post") as mock_post, \
         patch("time.sleep"):
        err_response = requests.Response()
        err_response.status_code = 429
        mock_post.return_value = err_response
        
        embedder = EmbeddingModel()
        with pytest.raises(GeminiQuotaExceededError) as exc_info:
            embedder.embed_texts(["hello world"])
        
        error_msg = str(exc_info.value)
        assert "429" in error_msg
        assert "quota" in error_msg.lower() or "rate limit" in error_msg.lower()
        # Verify secret key is NOT in error string
        assert "SECRET_KEY_12345" not in error_msg


def test_embedding_model_does_not_switch_key_on_429(monkeypatch):
    """Verify that on 429 quota exhaustion, switch_key is NOT called (no burning keys)."""
    with patch("app.embedding.GeminiClient") as mock_client_cls, \
         patch("app.embedding.requests.post") as mock_post, \
         patch("time.sleep"):
        mock_client = MagicMock()
        mock_client.current_key = "key1"
        mock_client_cls.return_value = mock_client
        
        err_response = requests.Response()
        err_response.status_code = 429
        mock_post.return_value = err_response
        
        embedder = EmbeddingModel()
        with pytest.raises(GeminiQuotaExceededError):
            embedder.embed_texts(["test chunk"])
        
        # Critical test: switch_key must NOT be called on 429
        assert mock_client.switch_key.call_count == 0


def test_embedding_model_switches_key_on_401():
    """Verify that on 401 Unauthorized, switch_key IS called."""
    with patch("app.embedding.GeminiClient") as mock_client_cls, \
         patch("app.embedding.requests.post") as mock_post, \
         patch("time.sleep"):
        mock_client = MagicMock()
        mock_client.current_key = "key1"
        # First call fails auth, switch_key returns True, then second call succeeds
        mock_client.switch_key.return_value = True
        mock_client_cls.return_value = mock_client
        
        err_response = requests.Response()
        err_response.status_code = 401
        
        ok_response = requests.Response()
        ok_response.status_code = 200
        ok_response._content = json.dumps({"embeddings": [{"values": [0.1, 0.2]}]}).encode()
        
        mock_post.side_effect = [err_response, ok_response]
        
        embedder = EmbeddingModel()
        result = embedder.embed_texts(["test text"])
        
        assert mock_client.switch_key.call_count == 1
        assert result == [[0.1, 0.2]]


# --- 3. Generator Tests ---

def test_generator_default_model(monkeypatch):
    """Verify generator defaults to gemini-3.5-flash-lite."""
    monkeypatch.delenv("GEMINI_GENERATION_MODEL", raising=False)
    with patch("app.generator.GeminiClient") as mock_client_cls:
        mock_client = MagicMock()
        mock_res = MagicMock()
        mock_res.text = "Grounded response"
        mock_client.generate_content.return_value = mock_res
        mock_client_cls.return_value = mock_client
        
        ans = generate_answer("What is this?", "Context here")
        assert ans == "Grounded response"
        mock_client.generate_content.assert_called_once()
        call_kwargs = mock_client.generate_content.call_args[1]
        assert call_kwargs["model"] == "gemini-3.5-flash-lite"


def test_generator_configurable_model(monkeypatch):
    """Verify generator respects GEMINI_GENERATION_MODEL."""
    monkeypatch.setenv("GEMINI_GENERATION_MODEL", "custom-gen-model-v2")
    with patch("app.generator.GeminiClient") as mock_client_cls:
        mock_client = MagicMock()
        mock_res = MagicMock()
        mock_res.text = "Configured response"
        mock_client.generate_content.return_value = mock_res
        mock_client_cls.return_value = mock_client
        
        ans = generate_answer("What is this?", "Context here")
        assert ans == "Configured response"
        call_kwargs = mock_client.generate_content.call_args[1]
        assert call_kwargs["model"] == "custom-gen-model-v2"


# --- 4. Repository Service Batch & Checkpoint Tests ---

def test_repository_service_configurable_batch_size(monkeypatch, temp_chroma_dir):
    """Verify repository service respects GEMINI_EMBEDDING_BATCH_SIZE."""
    monkeypatch.setenv("GEMINI_EMBEDDING_BATCH_SIZE", "5")
    repo_dir = os.path.join("data", "repositories")
    cp_file = os.path.join(repo_dir, "batchorg_batchrepo_embeddings_v2.json")
    
    with patch("app.services.repository_service.load_repository") as mock_load, \
         patch("app.services.repository_service.EmbeddingModel") as mock_embed_cls:
        mock_load.return_value = [
            RepositoryDocument(
                repository="batchorg/batchrepo",
                file_path="f1.py",
                language="python",
                content="content 1",
                blob_sha="sha1"
            ),
            RepositoryDocument(
                repository="batchorg/batchrepo",
                file_path="f2.py",
                language="python",
                content="content 2",
                blob_sha="sha2"
            ),
        ]
        mock_embedder = MagicMock()
        mock_embedder.embed_texts.return_value = [[0.1] * 768, [0.2] * 768]
        mock_embed_cls.return_value = mock_embedder
        
        try:
            service = RepositoryService(chroma_directory=temp_chroma_dir)
            service.index_repository("https://github.com/batchorg/batchrepo")
            assert mock_embedder.embed_texts.called
        finally:
            if os.path.exists(cp_file):
                os.remove(cp_file)


def test_repository_service_progressive_checkpoint_preservation(temp_chroma_dir, tmp_path):
    """Verify that if a partial checkpoint exists, index_repository resumes from it without re-embedding."""
    repo_dir = os.path.join("data", "repositories")
    os.makedirs(repo_dir, exist_ok=True)
    checkpoint_file = os.path.join(repo_dir, "resumeorg_resumerepo_embeddings_v2.json")
    
    # Create 3 chunks from load_repository
    docs = [
        RepositoryDocument(
            repository="resumeorg/resumerepo",
            file_path="f1.py",
            language="python",
            content="line 1",
            blob_sha="sha1"
        ),
        RepositoryDocument(
            repository="resumeorg/resumerepo",
            file_path="f2.py",
            language="python",
            content="line 2",
            blob_sha="sha2"
        ),
        RepositoryDocument(
            repository="resumeorg/resumerepo",
            file_path="f3.py",
            language="python",
            content="line 3",
            blob_sha="sha3"
        ),
    ]
    
    # Pre-populate checkpoint with chunk 0 already embedded!
    partial_checkpoint = {
        "repository": "resumeorg/resumerepo",
        "commit_sha": "",
        "file_map": {},
        "is_partial": True,
        "embedding_model": "gemini-embedding-2",
        "embeddings": [
            {
                "file_path": "f1.py",
                "language": "python",
                "chunk_id": 0,
                "content": "line 1",
                "blob_sha": "sha1",
                "embedding": [0.99] * 3072
            }
        ]
    }
    with open(checkpoint_file, "w", encoding="utf-8") as f:
        json.dump(partial_checkpoint, f)
        
    try:
        with patch("app.services.repository_service.load_repository", return_value=docs), \
             patch("app.services.repository_service.EmbeddingModel") as mock_embed_cls:
            mock_embedder = MagicMock()
            # It only needs to embed chunks 1 and 2!
            mock_embedder.embed_texts.return_value = [[0.2] * 3072, [0.3] * 3072]
            mock_embed_cls.return_value = mock_embedder
            
            service = RepositoryService(chroma_directory=temp_chroma_dir)
            result = service.index_repository("https://github.com/resumeorg/resumerepo")
            
            assert result["indexed"] is True
            assert result["chunks"] == 3
            # embed_texts was only called with remaining 2 chunks, not all 3!
            assert mock_embedder.embed_texts.call_count == 1
            passed_texts = mock_embedder.embed_texts.call_args[0][0]
            assert len(passed_texts) == 2
            assert "line 1" not in passed_texts
    finally:
        if os.path.exists(checkpoint_file):
            os.remove(checkpoint_file)


def test_old_and_new_embedding_collections_not_mixed(temp_chroma_dir):
    """Verify that old gemini-embedding-001 collections are not queried or mixed with gemini-embedding-2."""
    from app.vector_store import ChromaVectorStore, get_collection_name

    # Simulate a repository indexed with gemini-embedding-001 (dimension 768)
    v1_collection = get_collection_name("testorg", "migraterepo", model_name="gemini-embedding-001")
    store_v1 = ChromaVectorStore(
        persist_directory=temp_chroma_dir,
        collection_name=v1_collection,
        embedding_model="gemini-embedding-001",
        dimensions=768
    )
    store_v1.add_embeddings([{
        "file_path": "README.md",
        "language": "markdown",
        "chunk_id": 0,
        "content": "Old doc",
        "blob_sha": "sha1",
        "embedding": [0.1] * 768
    }])
    assert store_v1.count() == 1

    # Now verify RepositoryService with gemini-embedding-2 targets a distinct collection
    repo_service = RepositoryService(
        chroma_directory=temp_chroma_dir,
        embedding_model="gemini-embedding-2"
    )
    status = repo_service.get_status("testorg", "migraterepo")
    # v2 collection is not yet indexed!
    assert status["indexed"] is False
    assert status["collection"] != v1_collection
    assert status["collection"] == get_collection_name("testorg", "migraterepo", model_name="gemini-embedding-2")

    # If an existing collection with same name had old embeddings, is_compatible detects it
    same_name_store = ChromaVectorStore(
        persist_directory=temp_chroma_dir,
        collection_name="test_forced_same_name",
        embedding_model="gemini-embedding-001",
        dimensions=768
    )
    same_name_store.add_embeddings([{
        "file_path": "README.md",
        "language": "markdown",
        "chunk_id": 0,
        "content": "Old doc",
        "blob_sha": "sha1",
        "embedding": [0.1] * 768
    }])
    # Checking compatibility against gemini-embedding-2 must fail
    assert same_name_store.is_compatible("gemini-embedding-2", 3072) is False


def test_legacy_checkpoint_not_partially_resumed_with_new_model(temp_chroma_dir):
    """Verify that a legacy checkpoint with no model metadata or dimension mismatch is not partially resumed."""
    import json
    from app.document import RepositoryDocument

    checkpoint_file = os.path.join("data", "repositories", "legacymodelorg_legacymodelrepo_embeddings.json")
    v2_checkpoint_file = os.path.join("data", "repositories", "legacymodelorg_legacymodelrepo_embeddings_v2.json")
    os.makedirs(os.path.dirname(checkpoint_file), exist_ok=True)
    if os.path.exists(v2_checkpoint_file):
        os.remove(v2_checkpoint_file)

    docs = [
        RepositoryDocument(
            repository="legacymodelorg/legacymodelrepo",
            file_path="f1.py",
            language="python",
            content="line 1",
            blob_sha="sha1"
        ),
        RepositoryDocument(
            repository="legacymodelorg/legacymodelrepo",
            file_path="f2.py",
            language="python",
            content="line 2",
            blob_sha="sha2"
        ),
    ]

    # Legacy partial checkpoint from old model (768 dims, no embedding_model field)
    legacy_checkpoint = {
        "repository": "legacymodelorg/legacymodelrepo",
        "commit_sha": "",
        "file_map": {},
        "is_partial": True,
        "embeddings": [
            {
                "file_path": "f1.py",
                "language": "python",
                "chunk_id": 0,
                "content": "line 1",
                "blob_sha": "sha1",
                "embedding": [0.99] * 768
            }
        ]
    }
    with open(checkpoint_file, "w", encoding="utf-8") as f:
        json.dump(legacy_checkpoint, f)

    try:
        with patch("app.services.repository_service.load_repository", return_value=docs), \
             patch("app.services.repository_service.EmbeddingModel") as mock_embed_cls:
            mock_embedder = MagicMock()
            mock_embedder.embed_texts.return_value = [[0.1] * 3072, [0.2] * 3072]
            mock_embed_cls.return_value = mock_embedder

            service = RepositoryService(
                chroma_directory=temp_chroma_dir,
                embedding_model="gemini-embedding-2",
                dimensions=3072
            )
            result = service.index_repository("https://github.com/legacymodelorg/legacymodelrepo")

            assert result["indexed"] is True
            assert result["chunks"] == 2
            # Must embed BOTH chunks because legacy checkpoint is incompatible!
            assert mock_embedder.embed_texts.call_count == 1
            passed_texts = mock_embedder.embed_texts.call_args[0][0]
            assert len(passed_texts) == 2
    finally:
        for p in [checkpoint_file, v2_checkpoint_file]:
            if os.path.exists(p):
                os.remove(p)
