import os
import requests
import base64
from dotenv import load_dotenv

load_dotenv()


class GitHubClient:

    def __init__(self):
        self.token = os.getenv("GITHUB_TOKEN")

        self.headers = {
            "Authorization": f"Bearer {self.token}",
            "Accept": "application/vnd.github+json"
        }

        self.base_url = "https://api.github.com"

    def get_repository(self, owner, repo):

        url = f"{self.base_url}/repos/{owner}/{repo}"

        response = requests.get(
            url,
            headers=self.headers
        )

        response.raise_for_status()

        return response.json()

    def get_latest_commit_sha(
        self,
        owner,
        repo,
        branch
    ):

        url = (
            f"{self.base_url}/repos/"
            f"{owner}/{repo}/commits/{branch}"
        )

        response = requests.get(
            url,
            headers=self.headers,
            timeout=30
        )

        response.raise_for_status()

        data = response.json()

        return data["sha"]

    def get_repository_tree(self, owner, repo, branch):

        url = f"{self.base_url}/repos/{owner}/{repo}/git/trees/{branch}"

        params = {
            "recursive": "1"
        }

        response = requests.get(
            url,
            headers=self.headers,
            params=params
        )

        response.raise_for_status()

        return response.json()

    def get_blob_content(self, owner, repo, sha):

        url = (
            f"{self.base_url}/repos/"
            f"{owner}/{repo}/git/blobs/{sha}"
        )

        response = requests.get(
            url,
            headers=self.headers,
            timeout=30
        )

        response.raise_for_status()

        data = response.json()

        content = base64.b64decode(
            data["content"]
        ).decode("utf-8")

        return content
    
    def get_file_content(self, owner, repo, path):

        url = f"{self.base_url}/repos/{owner}/{repo}/contents/{path}"

        response = requests.get(
            url,
            headers=self.headers,
            timeout=30
        )

        response.raise_for_status()

        data = response.json()

        content = base64.b64decode(
            data["content"]
        ).decode("utf-8")

        return content