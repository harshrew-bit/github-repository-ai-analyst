import os
import requests
import base64
from typing import Optional, Dict, Any
from dotenv import load_dotenv

load_dotenv()


class GitHubAPIException(Exception):
    """Base exception for GitHub API errors."""
    def __init__(self, message: str, status_code: int = 500):
        super().__init__(message)
        self.status_code = status_code
        self.message = message


class GitHubAuthError(GitHubAPIException):
    """Authentication failed (HTTP 401)."""
    def __init__(self, message: str = "GitHub authentication failed. Please verify your GITHUB_TOKEN."):
        super().__init__(message, status_code=401)


class GitHubForbiddenError(GitHubAPIException):
    """Access forbidden / permissions issue (HTTP 403 without rate limit)."""
    def __init__(self, message: str = "Access to the requested GitHub resource is forbidden."):
        super().__init__(message, status_code=403)


class GitHubRateLimitError(GitHubAPIException):
    """Rate limit exceeded (HTTP 403 with rate limit or HTTP 429)."""
    def __init__(self, message: str = "GitHub API rate limit exceeded. Please wait or configure an authenticated GITHUB_TOKEN."):
        super().__init__(message, status_code=429)


class GitHubRepoNotFoundError(GitHubAPIException):
    """Repository not found or private without sufficient permissions (HTTP 404)."""
    def __init__(self, message: str = "GitHub repository not found. Please verify repository URL and accessibility."):
        super().__init__(message, status_code=404)


class GitHubClient:

    def __init__(self, token: Optional[str] = None):
        raw_token = token or os.getenv("GITHUB_TOKEN")
        self.token = raw_token.strip() if raw_token and raw_token.strip() else None

        self.headers: Dict[str, str] = {
            "Accept": "application/vnd.github+json",
            "X-GitHub-Api-Version": "2022-11-28",
            "User-Agent": "GitHub-Repository-AI-Analyst"
        }

        if self.token:
            self.headers["Authorization"] = f"Bearer {self.token}"

        self.base_url = "https://api.github.com"

    def _handle_response(self, response: requests.Response) -> None:
        """Inspect HTTP response and raise appropriate typed exceptions without leaking secrets."""
        if response.ok:
            return

        status_code = response.status_code
        is_rate_limit = False

        rate_remaining = response.headers.get("x-ratelimit-remaining")
        if rate_remaining == "0" or status_code == 429:
            is_rate_limit = True

        detail_msg = ""
        try:
            body = response.json()
            detail_msg = body.get("message", "")
        except Exception:
            pass

        if "rate limit" in detail_msg.lower() or "secondary rate limit" in detail_msg.lower():
            is_rate_limit = True

        if status_code == 401:
            raise GitHubAuthError("GitHub authentication failed. Invalid or expired token.")
        elif status_code == 403:
            if is_rate_limit:
                raise GitHubRateLimitError("GitHub API rate limit exceeded. Please wait or set a valid GITHUB_TOKEN.")
            raise GitHubForbiddenError("GitHub access forbidden. Check repository visibility or token permissions.")
        elif status_code == 404:
            raise GitHubRepoNotFoundError("GitHub repository not found. Verify repository URL and visibility.")
        elif status_code == 429 or is_rate_limit:
            raise GitHubRateLimitError("GitHub API rate limit reached. Please try again shortly.")
        else:
            raise GitHubAPIException(f"GitHub API error (status {status_code}).", status_code=status_code)

    def _get(self, url: str, params: Optional[Dict[str, Any]] = None, timeout: int = 30) -> requests.Response:
        """Make an authenticated GET request with safe error propagation."""
        try:
            response = requests.get(
                url,
                headers=self.headers,
                params=params,
                timeout=timeout
            )
            self._handle_response(response)
            return response
        except requests.exceptions.Timeout:
            raise GitHubAPIException("GitHub API request timed out.", status_code=504)
        except requests.exceptions.ConnectionError:
            raise GitHubAPIException("Could not connect to GitHub API.", status_code=502)
        except requests.exceptions.HTTPError:
            # Re-raise or let handle_response do it
            raise

    def get_repository(self, owner: str, repo: str) -> dict:
        url = f"{self.base_url}/repos/{owner}/{repo}"
        response = self._get(url)
        return response.json()

    def get_latest_commit_sha(
        self,
        owner: str,
        repo: str,
        branch: str
    ) -> str:
        url = f"{self.base_url}/repos/{owner}/{repo}/commits/{branch}"
        response = self._get(url, timeout=30)
        data = response.json()
        return data["sha"]

    def get_repository_tree(self, owner: str, repo: str, branch: str) -> dict:
        url = f"{self.base_url}/repos/{owner}/{repo}/git/trees/{branch}"
        params = {"recursive": "1"}
        response = self._get(url, params=params, timeout=45)
        return response.json()

    def get_blob_content(self, owner: str, repo: str, sha: str) -> str:
        url = f"{self.base_url}/repos/{owner}/{repo}/git/blobs/{sha}"
        response = self._get(url, timeout=30)
        data = response.json()
        content = base64.b64decode(data["content"]).decode("utf-8", errors="replace")
        return content

    def get_file_content(self, owner: str, repo: str, path: str) -> str:
        url = f"{self.base_url}/repos/{owner}/{repo}/contents/{path}"
        response = self._get(url, timeout=30)
        data = response.json()
        content = base64.b64decode(data["content"]).decode("utf-8", errors="replace")
        return content