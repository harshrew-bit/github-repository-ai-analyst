import random
import time
from typing import Optional, Set

RETRYABLE_STATUS_CODES: Set[int] = {
    429,
    500,
    502,
    503,
    504,
}


def get_status_code(error) -> Optional[int]:
    """
    Extract HTTP status code from requests exceptions, HTTP responses,
    or Google GenAI exception objects.
    """
    # Requests HTTP error
    response = getattr(error, "response", None)
    if response is not None:
        status_code = getattr(response, "status_code", None)
        if status_code is not None:
            return status_code

    # Direct status code on exception or response object
    status_code = getattr(error, "status_code", None)
    if isinstance(status_code, int):
        return status_code

    # Direct code attribute (e.g. Google API error objects)
    code = getattr(error, "code", None)
    if isinstance(code, int):
        return code

    return None


def get_retry_after(error_or_response) -> Optional[float]:
    """
    Extract Retry-After header in seconds if provided by HTTP response.
    """
    response = getattr(error_or_response, "response", error_or_response)
    headers = getattr(response, "headers", None)
    if headers and hasattr(headers, "get"):
        val = headers.get("Retry-After") or headers.get("retry-after")
        if val is not None:
            try:
                seconds = float(val)
                if seconds > 0:
                    return seconds
            except (ValueError, TypeError):
                pass
    return None


def retry_request(
    request_function,
    max_retries: int = 4,
    initial_delay: float = 2.0,
    max_delay: float = 60.0,
    backoff_factor: float = 2.0,
    jitter: bool = True
):
    """
    Execute request_function with bounded exponential backoff and jitter.
    Respects Retry-After header if provided.
    Preserves original exception and status code when retries are exhausted.
    Does not leak secrets or credentials in logs.
    """
    for attempt in range(max_retries):
        try:
            response = request_function()

            # If response has raise_for_status, trigger it to catch HTTP errors
            if hasattr(response, "raise_for_status"):
                response.raise_for_status()

            return response

        except Exception as error:
            status_code = get_status_code(error)

            if status_code not in RETRYABLE_STATUS_CODES:
                raise

            # If retries are exhausted, re-raise original exception intact
            if attempt == max_retries - 1:
                raise

            # Base exponential delay
            base_delay = initial_delay * (backoff_factor ** attempt)
            bounded_delay = min(base_delay, max_delay)

            # Apply jitter (random variation around bounded_delay)
            if jitter:
                wait_time = random.uniform(bounded_delay * 0.5, bounded_delay * 1.5)
            else:
                wait_time = bounded_delay

            # Check if server provided Retry-After header
            retry_after = get_retry_after(error)
            if retry_after is not None:
                wait_time = max(wait_time, min(retry_after, max_delay * 2))

            # Sanitize log output: never print raw error objects or strings that could contain keys
            print(
                f"[Retry] Transient error (HTTP {status_code}). "
                f"Retrying in {wait_time:.2f}s (attempt {attempt + 1}/{max_retries})..."
            )

            time.sleep(wait_time)