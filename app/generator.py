import os
from dotenv import load_dotenv

from gemini_client import GeminiClient

load_dotenv()


def generate_answer(question: str, context: str) -> str:
    """
    Generate an answer using Gemini based only
    on the provided repository context.
    """

    gemini_client = GeminiClient()

    prompt = f"""
You are an AI assistant that analyzes GitHub repositories.

Answer the user's question using ONLY the repository context provided below.

Do not use outside knowledge.
Do not invent code or behavior that is not supported by the context.

If the context does not contain enough information to answer the question,
clearly say that the repository context does not provide enough information.

Explain the answer clearly and mention the relevant file paths when useful.

User Question:
{question}

Repository Context:
{context}
"""

    # Configurable through GEMINI_GENERATION_MODEL, defaulting to gemini-3.5-flash-lite
    model = os.getenv("GEMINI_GENERATION_MODEL", "gemini-3.5-flash-lite").strip()

    try:
        response = gemini_client.generate_content(
            model=model,
            contents=prompt
        )

        return response.text

    except Exception as e:
        error_msg = str(e)
        if "429" in error_msg or "ResourceExhausted" in error_msg:
            return "Gemini generation rate limit or quota exceeded (HTTP 429). Please try again shortly."
        return f"Gemini generation failed: {error_msg}"