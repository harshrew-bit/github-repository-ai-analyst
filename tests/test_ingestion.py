import pytest
from app.ingestion import parse_github_url, should_include_file


def test_parse_github_url_standard():
    owner, repo = parse_github_url("https://github.com/psf/requests")
    assert owner == "psf"
    assert repo == "requests"


def test_parse_github_url_trailing_slash():
    owner, repo = parse_github_url("https://github.com/tiangolo/fastapi/")
    assert owner == "tiangolo"
    assert repo == "fastapi"


def test_parse_github_url_extra_path():
    owner, repo = parse_github_url("https://github.com/pallets-eco/flask-smorest/tree/main/src")
    assert owner == "pallets-eco"
    assert repo == "flask-smorest"


def test_parse_github_url_invalid():
    with pytest.raises(ValueError):
        parse_github_url("https://github.com/")

    with pytest.raises(ValueError):
        parse_github_url("https://github.com/singlepart")


def test_should_include_file_extensions():
    assert should_include_file("app/main.py") is True
    assert should_include_file("src/index.ts") is True
    assert should_include_file("README.md") is True
    assert should_include_file("pyproject.toml") is True
    assert should_include_file("Dockerfile") is True
    assert should_include_file("LICENSE") is True


def test_should_include_file_ignored_directories():
    assert should_include_file(".git/config") is False
    assert should_include_file(".github/workflows/ci.yml") is False
    assert should_include_file("node_modules/package/index.js") is False
    assert should_include_file("venv/lib/python.py") is False
    assert should_include_file("__pycache__/main.cpython-312.pyc") is False
    assert should_include_file("dist/bundle.js") is False


def test_should_include_file_unsupported_extensions():
    assert should_include_file("image.png") is False
    assert should_include_file("archive.zip") is False
    assert should_include_file("binary.exe") is False
