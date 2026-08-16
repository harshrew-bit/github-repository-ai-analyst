import time


RETRYABLE_STATUS_CODES = {
    429,
    500,
    502,
    503,
    504
}


def get_status_code(error):

    # Requests HTTP error
    response = getattr(
        error,
        "response",
        None
    )

    if response is not None:
        return getattr(
            response,
            "status_code",
            None
        )

    # Google GenAI exceptions may expose
    # the status code directly.
    status_code = getattr(
        error,
        "status_code",
        None
    )

    if status_code is not None:
        return status_code

    return None


def retry_request(
    request_function,
    max_retries=3,
    initial_delay=5
):

    for attempt in range(max_retries):

        try:

            response = request_function()

            if hasattr(
                response,
                "raise_for_status"
            ):

                response.raise_for_status()

            return response

        except Exception as error:

            status_code = get_status_code(
                error
            )

            if (
                status_code
                not in RETRYABLE_STATUS_CODES
            ):

                raise

            if attempt == max_retries - 1:
                raise

            wait_time = (
                initial_delay
                * (2 ** attempt)
            )

            print(
                f"Gemini request failed "
                f"with HTTP {status_code}."
            )

            print(
                f"Retrying in "
                f"{wait_time} seconds..."
            )

            time.sleep(wait_time)