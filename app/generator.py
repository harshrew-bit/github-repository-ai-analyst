from dotenv import load_dotenv

from gemini_client import GeminiClient


load_dotenv()


def generate_answer(question, context):
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

    try:

        response = gemini_client.generate_content(
            model="gemini-3.5-flash",
            contents=prompt
        )

        return response.text

    except Exception as e:

        return f"Gemini generation failed: {e}"