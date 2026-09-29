import os
import requests
from typing import List, Optional
from dotenv import load_dotenv

load_dotenv()

from gemini_client import GeminiClient
from retry import retry_request, get_status_code


class GeminiEmbeddingError(Exception):
    """Base exception for Gemini embedding failures."""
    pass


class GeminiQuotaExceededError(GeminiEmbeddingError):
    """Raised when Gemini API rate limit or quota (HTTP 429) is exhausted."""
    pass


class EmbeddingModel:

    def __init__(self, model_name: Optional[str] = None):
        self.gemini_client = GeminiClient()

        # Configurable through GEMINI_EMBEDDING_MODEL, defaulting to gemini-embedding-001
        raw_model = model_name or os.getenv("GEMINI_EMBEDDING_MODEL", "gemini-embedding-001")
        clean_model = raw_model.strip()
        if not clean_model.startswith("models/"):
            model_resource = f"models/{clean_model}"
        else:
            model_resource = clean_model
            clean_model = clean_model.removeprefix("models/")

        self.model_name = clean_model
        self.model_resource = model_resource

        self.url = (
            f"https://generativelanguage.googleapis.com/"
            f"v1beta/{self.model_resource}:batchEmbedContents"
        )

    def embed_text(self, text: str) -> List[float]:
        embeddings = self.embed_texts([text])
        return embeddings[0]

    def embed_texts(self, texts: List[str]) -> List[List[float]]:
        requests_data = []

        for text in texts:
            requests_data.append({
                "model": self.model_resource,
                "content": {
                    "parts": [
                        {
                            "text": text
                        }
                    ]
                }
            })

        payload = {
            "requests": requests_data
        }

        while True:
            headers = {
                "Content-Type": "application/json",
                "x-goog-api-key": (
                    self.gemini_client.current_key
                )
            }

            try:
                # retry_request handles transient errors (429, 5xx) with bounded exponential backoff & jitter
                response = retry_request(
                    lambda: requests.post(
                        self.url,
                        headers=headers,
                        json=payload,
                        timeout=120
                    )
                )

                data = response.json()

                if "embeddings" not in data:
                    raise GeminiEmbeddingError("Gemini response missing embeddings data.")

                return [
                    item["values"]
                    for item in data["embeddings"]
                ]

            except Exception as error:
                status_code = get_status_code(error)

                # Credential/Auth errors (HTTP 401 or HTTP 403 invalid key):
                # rotate credentials if another key is available
                if status_code in (401, 403):
                    if self.gemini_client.switch_key():
                        continue
                    raise GeminiEmbeddingError(
                        "All configured Gemini credentials failed authentication (HTTP 401/403)."
                    )

                # Quota / Rate limit (HTTP 429):
                # retry_request already executed bounded backoff. Do NOT burn through other keys.
                if status_code == 429:
                    raise GeminiQuotaExceededError(
                        "Gemini embedding quota or rate limit exceeded (HTTP 429). "
                        "Please wait before indexing further files or upgrade project quota."
                    )

                # Re-raise already specialized embedding errors
                if isinstance(error, GeminiEmbeddingError):
                    raise

                # For any other failure, raise a sanitized error without exposing API keys
                raise GeminiEmbeddingError(
                    f"Gemini embedding failed with status {status_code or 'unknown'}."
                )