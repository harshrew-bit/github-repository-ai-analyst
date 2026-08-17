from pydantic import BaseModel


class RepositoryDocument(BaseModel):
    repository: str
    file_path: str
    language: str
    content: str
    blob_sha: str

class CodeChunk(BaseModel):
    repository: str
    file_path: str
    language: str
    chunk_id: int
    content: str
    blob_sha: str

    
def detect_language(file_path):

    if file_path.endswith(".py"):
        return "python"

    if file_path.endswith(".js"):
        return "javascript"

    if file_path.endswith(".ts"):
        return "typescript"

    if file_path.endswith(".java"):
        return "java"

    if file_path.endswith(".cpp"):
        return "cpp"

    if file_path.endswith(".go"):
        return "go"

    if file_path.endswith(".rs"):
        return "rust"

    if file_path.endswith(".md"):
        return "markdown"

    if file_path.endswith(".json"):
        return "json"

    if file_path.endswith((".yml", ".yaml")):
        return "yaml"

    if file_path.endswith(".toml"):
        return "toml"

    return "text"