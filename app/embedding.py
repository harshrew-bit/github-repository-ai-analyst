import requests

from gemini_client import GeminiClient
from retry import retry_request


class EmbeddingModel:

    def __init__(self):

        self.gemini_client = GeminiClient()

        self.url = (
            "https://generativelanguage.googleapis.com/"
            "v1beta/models/gemini-embedding-001:batchEmbedContents"
        )

    def embed_text(self, text):

        embeddings = self.embed_texts(
            [text]
        )

        return embeddings[0]

    def embed_texts(self, texts):

        requests_data = []

        for text in texts:

            requests_data.append({
                "model": "models/gemini-embedding-001",
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

                response = retry_request(
                    lambda: requests.post(
                        self.url,
                        headers=headers,
                        json=payload,
                        timeout=120
                    )
                )

                data = response.json()

                return [
                    item["values"]
                    for item in data["embeddings"]
                ]

            except Exception:

                if not self.gemini_client.switch_key():

                    raise