import os
import sys
from typing import List, Optional
import requests
from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, Field

_api_dir = os.path.dirname(os.path.abspath(__file__))
_app_dir = os.path.dirname(_api_dir)
if _app_dir not in sys.path:
    sys.path.insert(0, _app_dir)

try:
    from app.services.repository_service import RepositoryService
    from app.services.rag_service import RAGService
    from app.github_client import (
        GitHubAPIException,
        GitHubAuthError,
        GitHubForbiddenError,
        GitHubRateLimitError,
        GitHubRepoNotFoundError,
    )
    from app.embedding import GeminiQuotaExceededError, GeminiEmbeddingError
except ImportError:
    from services.repository_service import RepositoryService
    from services.rag_service import RAGService
    from github_client import (
        GitHubAPIException,
        GitHubAuthError,
        GitHubForbiddenError,
        GitHubRateLimitError,
        GitHubRepoNotFoundError,
    )
    from embedding import GeminiQuotaExceededError, GeminiEmbeddingError




router = APIRouter()

repository_service = RepositoryService()
rag_service = RAGService()


# --- Pydantic Request & Response Models ---

class HealthResponse(BaseModel):
    status: str = "ok"


class IndexRequest(BaseModel):
    url: str = Field(..., description="GitHub repository URL (e.g. https://github.com/psf/requests)")


class IndexResponse(BaseModel):
    repository: str
    collection: str
    indexed: bool
    chunks: int
    message: Optional[str] = None


class QueryRequest(BaseModel):
    repository_url: str = Field(..., description="GitHub repository URL")
    question: str = Field(..., min_length=1, description="Question about the repository")
    top_k: Optional[int] = Field(5, ge=1, le=20, description="Number of context chunks to retrieve")


class SourceItem(BaseModel):
    file_path: str
    chunk_id: int
    score: float
    language: Optional[str] = None
    content: Optional[str] = None


class QueryResponse(BaseModel):
    repository: str
    collection: str
    question: str
    answer: str
    sources: List[SourceItem]


class StatusResponse(BaseModel):
    repository: str
    collection: str
    indexed: bool
    chunks: int


# --- Endpoints ---

@router.get("/health", response_model=HealthResponse, tags=["Health"])
def health_check():
    """
    Health check endpoint returning system status.
    """
    return HealthResponse(status="ok")


@router.get(
    "/repositories/{owner}/{repo}/status",
    response_model=StatusResponse,
    tags=["Repositories"]
)
def get_repository_status(owner: str, repo: str):
    """
    Check if a repository has been indexed and retrieve its chunk count.
    """
    try:
        status_data = repository_service.get_status(owner=owner, repo=repo)
        return StatusResponse(**status_data)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to check repository status: {str(e)}"
        )


@router.post(
    "/repositories/index",
    response_model=IndexResponse,
    tags=["Repositories"]
)
def index_repository(request: IndexRequest):
    """
    Index a GitHub repository into its repository-specific Chroma collection.
    If already indexed, reuses existing embeddings idempotently.
    """
    if not request.url or not request.url.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Repository URL cannot be empty."
        )

    try:
        result = repository_service.index_repository(repository_url=request.url.strip())
        return IndexResponse(**result)

    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except GitHubRepoNotFoundError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )
    except GitHubAuthError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str(e)
        )
    except GitHubRateLimitError as e:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=str(e)
        )
    except GitHubForbiddenError as e:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=str(e)
        )
    except GitHubAPIException as e:
        http_code = e.status_code if 400 <= e.status_code < 600 else status.HTTP_502_BAD_GATEWAY
        raise HTTPException(
            status_code=http_code,
            detail=str(e)
        )
    except requests.exceptions.HTTPError as e:
        status_code = getattr(e.response, "status_code", None)
        if status_code == 404:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="GitHub repository not found. Verify repository URL and visibility."
            )
        elif status_code == 401:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="GitHub authentication failed. Please verify your GITHUB_TOKEN."
            )
        elif status_code in (403, 429):
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail="GitHub API access denied or rate limit exceeded."
            )
        else:
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail=f"GitHub API error (status {status_code})."
            )
    except GeminiQuotaExceededError as e:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=str(e)
        )
    except GeminiEmbeddingError as e:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=str(e)
        )
    except Exception as e:
        error_msg = str(e)
        # Avoid exposing raw sensitive credentials or API keys
        if "API key" in error_msg or "429" in error_msg or "ResourceExhausted" in error_msg or "quota" in error_msg.lower():
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="AI service rate limit or unavailable. Please try again shortly."
            )
        # Sanitize any unexpected internal token leaks
        safe_msg = error_msg.split("\n")[0]
        if "token" in safe_msg.lower() or "key" in safe_msg.lower():
            safe_msg = "An internal processing error occurred."
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Indexing failed: {safe_msg}"
        )


@router.post(
    "/repositories/query",
    response_model=QueryResponse,
    tags=["Repositories"]
)
def query_repository(request: QueryRequest):
    """
    Query an indexed GitHub repository and generate an AI-powered answer.
    """
    if not request.question or not request.question.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Question must not be empty."
        )

    if not request.repository_url or not request.repository_url.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Repository URL must not be empty."
        )

    try:
        result = rag_service.query(
            repository_url=request.repository_url.strip(),
            question=request.question.strip(),
            top_k=request.top_k or 5
        )
        return QueryResponse(**result)

    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        error_msg = str(e)
        if "API key" in error_msg or "429" in error_msg or "ResourceExhausted" in error_msg:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="AI service rate limit or unavailable. Please try again shortly."
            )
        safe_msg = error_msg.split("\n")[0]
        if "token" in safe_msg.lower() or "key" in safe_msg.lower():
            safe_msg = "An error occurred while generating the answer."
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Query failed: {safe_msg}"
        )
