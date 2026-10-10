import os
import sys

_services_dir = os.path.dirname(os.path.abspath(__file__))
_app_dir = os.path.dirname(_services_dir)
if _app_dir not in sys.path:
    sys.path.insert(0, _app_dir)

from ingestion import parse_github_url
from vector_store import (
    ChromaVectorStore,
    get_collection_name
)
from rag import RAGPipeline
from embedding import EmbeddingModel


from typing import Optional


class RAGService:

    def __init__(
        self,
        chroma_directory: Optional[str] = None,
        embedding_model: Optional[str] = None,
        dimensions: Optional[int] = None
    ):
        self.chroma_directory = (
            chroma_directory
            if chroma_directory is not None
            else os.getenv("CHROMA_PERSIST_DIRECTORY", "data/chroma")
        )
        self.embedding_model_name = (
            embedding_model
            or os.getenv("GEMINI_EMBEDDING_MODEL", "gemini-embedding-2")
        ).removeprefix("models/").strip()

        if dimensions is not None:
            self.embedding_dimensions = dimensions
        else:
            raw_dims = os.getenv("GEMINI_EMBEDDING_DIMENSIONS", "3072")
            try:
                self.embedding_dimensions = int(raw_dims) if raw_dims else 3072
            except ValueError:
                self.embedding_dimensions = 3072

    def query(
        self,
        repository_url: str,
        question: str,
        top_k: int = 5
    ) -> dict:
        """
        Query an indexed GitHub repository using the RAG pipeline.
        """
        if not question or not question.strip():
            raise ValueError("Question must not be empty.")

        owner, repo = parse_github_url(repository_url)
        collection_name = get_collection_name(
            owner, repo, model_name=self.embedding_model_name
        )

        store = ChromaVectorStore(
            persist_directory=self.chroma_directory,
            collection_name=collection_name,
            embedding_model=self.embedding_model_name,
            dimensions=self.embedding_dimensions
        )

        count = store.count()
        is_compat = store.is_compatible(
            self.embedding_model_name, self.embedding_dimensions
        )

        if count > 0 and not is_compat:
            raise ValueError(
                f"Repository '{owner}/{repo}' was indexed with an incompatible embedding model. "
                f"Please re-index the repository using {self.embedding_model_name} before querying."
            )

        if count == 0:
            raise ValueError(
                f"Repository '{owner}/{repo}' has not been indexed yet. Please index it before querying."
            )

        embed_model = EmbeddingModel(
            model_name=self.embedding_model_name,
            dimensions=self.embedding_dimensions
        )
        pipeline = RAGPipeline(
            chroma_directory=self.chroma_directory,
            collection_name=collection_name,
            embedding_model=embed_model
        )

        result = pipeline.ask(
            question=question.strip(),
            top_k=top_k
        )

        return {
            "repository": f"{owner}/{repo}",
            "collection": collection_name,
            "question": question.strip(),
            "answer": result["answer"],
            "sources": result["sources"],
            "embedding_model": self.embedding_model_name
        }
