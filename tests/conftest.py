import os
import sys
import pytest
from fastapi.testclient import TestClient

# Ensure root and app directories are in sys.path
_project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
_app_dir = os.path.join(_project_root, "app")
if _project_root not in sys.path:
    sys.path.insert(0, _project_root)
if _app_dir not in sys.path:
    sys.path.insert(0, _app_dir)

from app.main_api import app


@pytest.fixture
def client():
    return TestClient(app)


@pytest.fixture
def temp_chroma_dir(tmp_path):
    chroma_dir = tmp_path / "chroma"
    chroma_dir.mkdir()
    return str(chroma_dir)
