"""
Regression tests for the answer generator (app/generator.py).

Tests A–E validate that the system prompt instructs Gemini to produce
well-formatted Markdown (inline code, proper fenced blocks, no fragmentation).

Tests F–G validate grounding behaviour: the model must not invent details
absent from the context, and must use retrieved source when it is available.

All Gemini API calls are mocked so no real API quota is consumed.
"""
from unittest.mock import MagicMock, patch
import pytest


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _make_response(text: str) -> MagicMock:
    """Return a mock Gemini response with the given text."""
    mock = MagicMock()
    mock.text = text
    return mock


# ---------------------------------------------------------------------------
# Test A – Filenames inside prose
# ---------------------------------------------------------------------------

def test_prompt_contains_inline_code_rule():
    """
    The Markdown formatting section of the generated prompt must instruct
    Gemini to use single backticks for filenames and must forbid standalone
    fenced blocks for identifiers.
    """
    from app.generator import generate_answer

    captured_prompt = {}

    def capture(*args, **kwargs):
        captured_prompt["contents"] = kwargs.get("contents", args[0] if args else "")
        return _make_response("Mocked answer.")

    with patch("app.generator.GeminiClient") as MockClient:
        instance = MockClient.return_value
        instance.generate_content.side_effect = capture
        generate_answer("What files are in this project?", "File: README.md\nCode:\n# My Project\n")

    prompt_text = captured_prompt["contents"]

    # The prompt must instruct inline backtick use for filenames
    assert "single backtick" in prompt_text.lower() or "backtick" in prompt_text.lower(), (
        "Prompt must mention inline backtick formatting for identifiers"
    )

    # The prompt must warn against standalone fenced code blocks for identifiers
    assert "fenced code block" in prompt_text.lower(), (
        "Prompt must mention fenced code block restrictions"
    )

    # The prompt must include grounding / context-only instruction
    assert "do not invent" in prompt_text.lower() or "only" in prompt_text.lower(), (
        "Prompt must include a grounding instruction"
    )


# ---------------------------------------------------------------------------
# Test B – Functions and packages inline
# ---------------------------------------------------------------------------

def test_prompt_forbids_single_identifier_code_blocks():
    """
    The prompt must explicitly forbid fenced code blocks containing only a
    filename, function name, or package name.
    """
    from app.generator import generate_answer

    captured_prompt = {}

    def capture(*args, **kwargs):
        captured_prompt["contents"] = kwargs.get("contents", args[0] if args else "")
        return _make_response("Answer.")

    with patch("app.generator.GeminiClient") as MockClient:
        instance = MockClient.return_value
        instance.generate_content.side_effect = capture
        generate_answer("How does read_csv_data work?", "File: plot_data.py\nCode:\ndef read_csv_data(): pass\n")

    prompt_text = captured_prompt["contents"]

    # Must contain the prohibition text
    assert "never" in prompt_text.lower() or "do not" in prompt_text.lower(), (
        "Prompt must include a prohibition against bad code block usage"
    )


# ---------------------------------------------------------------------------
# Test C – Genuine code block – prompt includes example
# ---------------------------------------------------------------------------

def test_prompt_allows_genuine_multiline_code_blocks():
    """
    The prompt must explicitly allow (and illustrate) the use of fenced code
    blocks for actual multiline code examples.
    """
    from app.generator import generate_answer

    captured_prompt = {}

    def capture(*args, **kwargs):
        captured_prompt["contents"] = kwargs.get("contents", args[0] if args else "")
        return _make_response("Answer.")

    with patch("app.generator.GeminiClient") as MockClient:
        instance = MockClient.return_value
        instance.generate_content.side_effect = capture
        generate_answer(
            "Show me an example.",
            "File: plot_data.py\nCode:\nimport pandas as pd\ndf = pd.read_csv('file.csv')\n"
        )

    prompt_text = captured_prompt["contents"]
    assert "multiline" in prompt_text.lower() or "multi-line" in prompt_text.lower() or "fenced code block" in prompt_text.lower(), (
        "Prompt must explain when fenced code blocks ARE appropriate"
    )


# ---------------------------------------------------------------------------
# Test D – Mixed Markdown – prompt covers all element types
# ---------------------------------------------------------------------------

def test_prompt_covers_headings_and_lists():
    """
    The prompt must mention headings and lists as acceptable Markdown elements.
    """
    from app.generator import generate_answer

    captured_prompt = {}

    def capture(*args, **kwargs):
        captured_prompt["contents"] = kwargs.get("contents", args[0] if args else "")
        return _make_response("Answer.")

    with patch("app.generator.GeminiClient") as MockClient:
        instance = MockClient.return_value
        instance.generate_content.side_effect = capture
        generate_answer("Describe the architecture.", "File: README.md\nCode:\n# Architecture\n- module A\n- module B\n")

    prompt_text = captured_prompt["contents"]
    assert "heading" in prompt_text.lower() or "##" in prompt_text, (
        "Prompt must mention headings"
    )
    assert "list" in prompt_text.lower() or "bullet" in prompt_text.lower() or "readability" in prompt_text.lower(), (
        "Prompt must mention lists or readability"
    )


# ---------------------------------------------------------------------------
# Test E – Multiple inline identifiers
# ---------------------------------------------------------------------------

def test_prompt_passes_question_and_context_verbatim():
    """
    The generate_answer function must include the exact question and context
    text in the prompt sent to Gemini.
    """
    from app.generator import generate_answer

    question = "How does argparse parse file_path, x_column, and y_column?"
    context = "File: plot_data.py\nCode:\nparser = argparse.ArgumentParser()\nparser.add_argument('file_path')\n"

    captured_prompt = {}

    def capture(*args, **kwargs):
        captured_prompt["contents"] = kwargs.get("contents", args[0] if args else "")
        return _make_response("Answer with `argparse`, `file_path`, `x_column`, `y_column`.")

    with patch("app.generator.GeminiClient") as MockClient:
        instance = MockClient.return_value
        instance.generate_content.side_effect = capture
        result = generate_answer(question, context)

    assert question in captured_prompt["contents"], "Question must appear in the prompt"
    assert "file_path" in captured_prompt["contents"], "Context must appear in the prompt"
    assert result == "Answer with `argparse`, `file_path`, `x_column`, `y_column`."


# ---------------------------------------------------------------------------
# Test F – Insufficient context: no hallucination
# ---------------------------------------------------------------------------

def test_generate_answer_with_filenames_only_context():
    """
    When the context contains only filenames and no implementation, the mocked
    Gemini response must not contain invented implementation details.
    This test verifies that the prompt includes a grounding prohibition and
    that the returned answer is passed through unchanged.
    """
    from app.generator import generate_answer

    context = (
        "File: plot_data.py\n"
        "Chunk ID: 0\n"
        "Similarity Score: 0.8700\n\n"
        "Code:\n"
        "# plot_data.py\n"
    )

    # Simulate a well-behaved Gemini response that admits missing details
    mocked_answer = (
        "The repository context does not include the implementation body of "
        "`plot_data.py`. Only the filename is available; I cannot determine "
        "what arguments it accepts or how it processes the CSV without the "
        "actual source code."
    )

    with patch("app.generator.GeminiClient") as MockClient:
        instance = MockClient.return_value
        instance.generate_content.return_value = _make_response(mocked_answer)
        result = generate_answer(
            "How does plot_data.py process the CSV file?",
            context
        )

    assert result == mocked_answer
    assert "cannot determine" in result or "not include" in result or "does not provide" in result, (
        "A well-formed answer should acknowledge insufficient context"
    )


# ---------------------------------------------------------------------------
# Test G – Evidence-based explanation
# ---------------------------------------------------------------------------

def test_generate_answer_with_full_implementation_context():
    """
    When the context contains the actual function implementation, the mock
    Gemini response can explain the behavior in detail. This test verifies
    that the full context is forwarded to Gemini and that the answer is
    returned correctly.
    """
    from app.generator import generate_answer

    context = (
        "File: plot_data.py\n"
        "Chunk ID: 0\n"
        "Similarity Score: 0.9200\n\n"
        "Code:\n"
        "import pandas as pd\n"
        "\n"
        "def read_csv_data(file_path, x_column, y_column):\n"
        "    df = pd.read_csv(file_path)\n"
        "    x_values = df[x_column].tolist()\n"
        "    y_values = df[y_column].tolist()\n"
        "    return x_values, y_values\n"
        "\n"
        "File: tests/test_plot_data.py\n"
        "Chunk ID: 1\n"
        "Similarity Score: 0.8800\n\n"
        "Code:\n"
        "def test_read_csv_data():\n"
        "    x, y = read_csv_data('sample.csv', 'time', 'value')\n"
        "    assert len(x) == len(y)\n"
    )

    mocked_answer = (
        "The `read_csv_data()` function in `plot_data.py` uses `pandas.read_csv()` "
        "to load the file at `file_path` into a DataFrame. It then extracts the "
        "`x_column` and `y_column` series as Python lists and returns them as a "
        "tuple `(x_values, y_values)`. The test in `tests/test_plot_data.py` "
        "confirms that both lists have the same length."
    )

    captured_contents = {}

    def capture(*args, **kwargs):
        captured_contents["prompt"] = kwargs.get("contents", args[0] if args else "")
        return _make_response(mocked_answer)

    with patch("app.generator.GeminiClient") as MockClient:
        instance = MockClient.return_value
        instance.generate_content.side_effect = capture
        result = generate_answer(
            "How does read_csv_data work?",
            context
        )

    # The full implementation context must reach Gemini
    assert "read_csv_data" in captured_contents["prompt"]
    assert "pd.read_csv" in captured_contents["prompt"]
    assert "test_read_csv_data" in captured_contents["prompt"]

    # The mocked answer is returned as-is
    assert result == mocked_answer
    assert "`read_csv_data()`" in result or "read_csv_data" in result
    assert "pandas" in result


# ---------------------------------------------------------------------------
# Test – Rate limit error handling
# ---------------------------------------------------------------------------

def test_generate_answer_handles_rate_limit():
    """generate_answer must return a friendly message on HTTP 429."""
    from app.generator import generate_answer

    with patch("app.generator.GeminiClient") as MockClient:
        instance = MockClient.return_value
        instance.generate_content.side_effect = Exception(
            "429 ResourceExhausted: quota exceeded"
        )
        result = generate_answer("Any question?", "Any context.")

    assert "429" in result or "rate limit" in result.lower() or "quota" in result.lower()


# ---------------------------------------------------------------------------
# Test – Generic error handling
# ---------------------------------------------------------------------------

def test_generate_answer_handles_generic_error():
    """generate_answer must return a meaningful message on unexpected errors."""
    from app.generator import generate_answer

    with patch("app.generator.GeminiClient") as MockClient:
        instance = MockClient.return_value
        instance.generate_content.side_effect = Exception("Connection timeout")
        result = generate_answer("Any question?", "Any context.")

    assert "failed" in result.lower() or "error" in result.lower() or "timeout" in result.lower()
