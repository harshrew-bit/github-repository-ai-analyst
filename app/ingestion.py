from urllib.parse import urlparse

from github_client import GitHubClient
from document import RepositoryDocument, CodeChunk, detect_language
from chunker import chunk_text


# Directories that are usually unnecessary for code analysis
IGNORED_DIRECTORIES = {
    ".git",
    ".github",
    ".venv",
    "venv",
    "env",
    "node_modules",
    "__pycache__",
    "dist",
    "build",
    ".pytest_cache",
    ".mypy_cache",
}


# File extensions we want to analyze
ALLOWED_EXTENSIONS = {
    ".py",
    ".js",
    ".ts",
    ".tsx",
    ".jsx",
    ".java",
    ".cpp",
    ".c",
    ".h",
    ".hpp",
    ".go",
    ".rs",
    ".md",
    ".json",
    ".yml",
    ".yaml",
    ".toml",
}


def parse_github_url(github_url):

    parsed = urlparse(
        github_url.rstrip("/")
    )

    parts = parsed.path.strip("/").split("/")

    if len(parts) < 2:
        raise ValueError(
            "Invalid GitHub repository URL."
        )

    owner = parts[0]
    repo = parts[1]

    return owner, repo


def should_include_file(path):

    # Ignore files inside unnecessary directories
    parts = path.split("/")

    for directory in parts[:-1]:

        if directory in IGNORED_DIRECTORIES:
            return False

    filename = parts[-1]

    # Important extensionless repository files
    allowed_filenames = {
        "README",
        "LICENSE",
        "Dockerfile",
        "Makefile",
        "Procfile",
    }

    if filename in allowed_filenames:
        return True

    # Check file extension
    for extension in ALLOWED_EXTENSIONS:

        if filename.endswith(extension):
            return True

    return False

def get_repository_file_map(github_url):

    owner, repo = parse_github_url(
        github_url
    )

    client = GitHubClient()

    repository_data = client.get_repository(
        owner,
        repo
    )

    branch = repository_data[
        "default_branch"
    ]

    tree_data = client.get_repository_tree(
        owner,
        repo,
        branch
    )

    file_map = {}

    for item in tree_data.get(
        "tree",
        []
    ):

        if item.get("type") != "blob":
            continue

        path = item["path"]

        if not should_include_file(path):
            continue

        file_map[path] = item["sha"]

    return file_map

def load_repository(
    github_url,
    paths=None
):

    owner, repo = parse_github_url(
        github_url
    )

    client = GitHubClient()

    # Get repository metadata
    repository_data = client.get_repository(
        owner,
        repo
    )

    branch = repository_data[
        "default_branch"
    ]

    repository_name = (
        f"{owner}/{repo}"
    )

    # Get complete repository tree
    tree_data = client.get_repository_tree(
        owner,
        repo,
        branch
    )
    print("\nRepository:", repository_name)
    print("Branch:", branch)
    print("Tree items:", len(tree_data.get("tree", [])))

    print("\nFirst 20 files:")
    for item in tree_data.get("tree", [])[:20]:
        print(
            item.get("type"),
            item.get("path")
        )

    documents = []
    included_files = 0

    for item in tree_data.get(
        "tree",
        []
    ):

        if item.get("type") != "blob":
            continue

        path = item["path"]

        if not should_include_file(path):
            continue

        if paths is not None and path not in paths:
            continue

        included_files += 1

        print(
            f"Fetching file: {path}"
        )
        

        try:

            content = client.get_blob_content(
                owner,
                repo,
                item["sha"]
            )

        except Exception as e:

            print(
                f"Skipping {path}: {e}"
            )

            continue

        documents.append(
            RepositoryDocument(
                repository=repository_name,
                file_path=path,
                language=detect_language(path),
                content=content,
                blob_sha=item["sha"]
            )
        )
    print(
        f"\nIncluded files: {included_files}"
    )
    return documents


def create_chunks(documents):

    chunks = []

    for document in documents:

        text_chunks = chunk_text(
            document.content
        )

        for chunk_id, content in enumerate(
            text_chunks
        ):

            chunks.append(
                CodeChunk(
                    repository=document.repository,
                    file_path=document.file_path,
                    language=document.language,
                    chunk_id=chunk_id,
                    content=content,
                    blob_sha=document.blob_sha
                )
            )

    return chunks