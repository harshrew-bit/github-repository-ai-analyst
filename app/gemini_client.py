import os

from dotenv import load_dotenv
from google import genai

from retry import retry_request, get_status_code


load_dotenv()


class GeminiClient:

    def __init__(self):

        self.api_keys = []

        # Check standard GEMINI_API_KEY first
        std_key = os.getenv("GEMINI_API_KEY")
        if std_key and std_key.strip():
            self.api_keys.append(std_key.strip())

        for index in range(1, 5):
            api_key = os.getenv(f"GEMINI_API_KEY_{index}")
            if api_key and api_key.strip() and api_key.strip() not in self.api_keys:
                self.api_keys.append(api_key.strip())

        if not self.api_keys:
            raise ValueError(
                "No Gemini API keys found. "
                "Add GEMINI_API_KEY or GEMINI_API_KEY_1 "
                "to environment variables or .env"
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

            except Exception as error:
                status_code = get_status_code(error)
                # Only rotate credentials for auth/permission errors (401/403)
                if status_code in (401, 403):
                    if self.switch_key():
                        continue
                raise