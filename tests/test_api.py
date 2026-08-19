from unittest.mock import patch
import pytest



def test_health_endpoint(client):
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_root_endpoint(client):
    response = client.get("/")
    assert response.status_code == 200
    assert "name" in response.json()
    assert response.json()["docs_url"] == "/docs"


def test_status_endpoint(client):
    with patch("app.api.routes.repository_service.get_status") as mock_status:
        mock_status.return_value = {
            "repository": "psf/requests",
            "collection": "repository_psf_requests",
            "indexed": True,
            "chunks": 659
        }
        response = client.get("/repositories/psf/requests/status")
        assert response.status_code == 200
        data = response.json()
        assert data["repository"] == "psf/requests"
        assert data["indexed"] is True
        assert data["chunks"] == 659


def test_index_invalid_url(client):
    response = client.post(
        "/repositories/index",
        json={"url": "https://invalid-url"}
    )
    assert response.status_code == 400
    assert "Invalid GitHub repository URL" in response.json()["detail"]


def test_index_successful(client):
    with patch("app.api.routes.repository_service.index_repository") as mock_index:
        mock_index.return_value = {
            "repository": "psf/requests",
            "collection": "repository_psf_requests",
            "indexed": True,
            "chunks": 659,
            "message": "Repository is already indexed."
        }
        response = client.post(
            "/repositories/index",
            json={"url": "https://github.com/psf/requests"}
        )
        assert response.status_code == 200
        data = response.json()
        assert data["repository"] == "psf/requests"
        assert data["indexed"] is True
        assert data["chunks"] == 659


def test_query_empty_question(client):
    response = client.post(
        "/repositories/query",
        json={
            "repository_url": "https://github.com/psf/requests",
            "question": ""
        }
    )
    assert response.status_code in (400, 422)


def test_query_unindexed_repository(client):
    with patch("app.api.routes.rag_service.query") as mock_query:
        mock_query.side_effect = ValueError(
            "Repository 'some/repo' has not been indexed yet. Please index it before querying."
        )
        response = client.post(
            "/repositories/query",
            json={
                "repository_url": "https://github.com/some/repo",
                "question": "How does it work?"
            }
        )
        assert response.status_code == 400
        assert "not been indexed yet" in response.json()["detail"]


def test_query_successful(client):
    with patch("app.api.routes.rag_service.query") as mock_query:
        mock_query.return_value = {
            "repository": "psf/requests",
            "collection": "repository_psf_requests",
            "question": "What is the Requests library?",
            "answer": "Requests is an elegant HTTP library for Python.",
            "sources": [
                {
                    "file_path": "README.md",
                    "chunk_id": 0,
                    "score": 0.95,
                    "language": "markdown",
                    "content": "# Requests"
                }
            ]
        }
        response = client.post(
            "/repositories/query",
            json={
                "repository_url": "https://github.com/psf/requests",
                "question": "What is the Requests library?",
                "top_k": 3
            }
        )
        assert response.status_code == 200
        data = response.json()
        assert data["repository"] == "psf/requests"
        assert "Requests is an elegant HTTP library" in data["answer"]
        assert len(data["sources"]) == 1


