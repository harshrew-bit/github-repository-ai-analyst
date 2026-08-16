import os
import requests
from dotenv import load_dotenv


load_dotenv()


class EmbeddingModel:

    def __init__(self):

        self.api_key = os.getenv("GEMINI_API_KEY")

        if not self.api_key:
            raise ValueError(
                "GEMINI_API_KEY not found in .env"
            )

        self.url = (
            "https://generativelanguage.googleapis.com/"
            "v1beta/models/gemini-embedding-001:batchEmbedContents"
        )

    def embed_text(self, text):

        embeddings = self.embed_texts([text])

        return embeddings[0]

    def embed_texts(self, texts):

        headers = {
            "Content-Type": "application/json",
            "x-goog-api-key": self.api_key
        }

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

        response = requests.post(
            self.url,
            headers=headers,
            json=payload,
            timeout=120
        )

        response.raise_for_status()

        data = response.json()

        return [
            item["values"]
            for item in data["embeddings"]
        ]