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

    prompt = f"""You are an AI assistant that analyzes GitHub repositories.

Answer the user's question using ONLY the repository context provided below.
Do not use outside knowledge.
Do not invent code, arguments, behavior, or implementation details not supported by the context.
If the context does not contain enough information to answer the question,
clearly state that the repository context does not provide sufficient information.

---

## Markdown Formatting Rules

Follow these rules precisely when writing your answer:

1. Use single backticks for filenames, function names, method names, class names,
   variable names, library/package names, command-line flags, and configuration keys
   when they appear within a sentence. Example: The `read_csv_data()` function uses
   `pandas.read_csv()` to load the file.

2. Use a fenced code block (triple backticks with language tag) ONLY for genuine
   multiline code examples, such as actual function implementations or multi-step
   command sequences. Example:
   ```python
   df = pd.read_csv(file_path)
   ```

3. NEVER create a fenced code block that contains only a filename, function name,
   package name, identifier, or a single short value. These must always remain inline.

4. NEVER place each technical term on its own separate line as a code block.

5. Do NOT wrap an entire paragraph or sentence in a code block.

6. Use meaningful headings (`##`, `###`) and concise bullet lists when they improve
   readability, but avoid unnecessary fragmentation.

7. Avoid repeating the user's question verbatim. Provide the direct answer first,
   then the supporting explanation.

---

## Technical Explanation Rules

Explain the actual behavior of the implementation found in the context.

- For functions: explain the sequence of operations, inputs, outputs, and what
  library calls or transformations are performed.
- For CLI interfaces: explain which arguments are positional vs optional, their
  default values, and how they flow into the implementation.
- For architecture questions: explain module responsibilities and how they interact.

Ground every claim in the retrieved source code. If a detail is not available in
the context, say so explicitly rather than inferring or fabricating it.

---

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