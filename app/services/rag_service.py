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


class RAGService:

    def __init__(self, chroma_directory: str = "data/chroma"):
        self.chroma_directory = chroma_directory

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
        collection_name = get_collection_name(owner, repo)

        store = ChromaVectorStore(
            persist_directory=self.chroma_directory,
            collection_name=collection_name
        )

        count = store.count()

        # Fallback check for existing Requests legacy collection if new collection is empty
        if count == 0 and repo.lower() == "requests":
            legacy_store = ChromaVectorStore(
                persist_directory=self.chroma_directory,
                collection_name="repository_chunks_cosine"
            )
            if legacy_store.count() > 0:
                collection_name = "repository_chunks_cosine"
                count = legacy_store.count()

        if count == 0:
            raise ValueError(
                f"Repository '{owner}/{repo}' has not been indexed yet. Please index it before querying."
            )

        pipeline = RAGPipeline(
            chroma_directory=self.chroma_directory,
            collection_name=collection_name
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
            "sources": result["sources"]
        }
