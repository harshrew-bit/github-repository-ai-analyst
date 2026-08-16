import os

from dotenv import load_dotenv
from google import genai

from retry import retry_request


load_dotenv()


class GeminiClient:

    def __init__(self):

        self.api_keys = []

        for index in range(1, 5):

            api_key = os.getenv(
                f"GEMINI_API_KEY_{index}"
            )

            if api_key:
                self.api_keys.append(
                    api_key
                )

        if not self.api_keys:

            raise ValueError(
                "No Gemini API keys found. "
                "Add GEMINI_API_KEY_1, "
                "GEMINI_API_KEY_2, etc. "
                "to .env"
            )

        self.current_key_index = 0

    @property
    def current_key(self):

        return self.api_keys[
            self.current_key_index
        ]

    def get_client(self):

        return genai.Client(
            api_key=self.current_key
        )

    def switch_key(self):

        if (
            self.current_key_index
            >= len(self.api_keys) - 1
        ):

            return False

        self.current_key_index += 1

        print(
            f"Switching to Gemini "
            f"credential "
            f"{self.current_key_index + 1}/"
            f"{len(self.api_keys)}"
        )

        return True

    def generate_content(
        self,
        model,
        contents
    ):

        while True:

            client = self.get_client()

            try:

                return retry_request(
                    lambda: client.models.generate_content(
                        model=model,
                        contents=contents
                    )
                )

            except Exception:

                if not self.switch_key():

                    raise