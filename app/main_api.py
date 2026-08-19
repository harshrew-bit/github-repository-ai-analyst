import os
import sys

_app_dir = os.path.dirname(os.path.abspath(__file__))
if _app_dir not in sys.path:
    sys.path.insert(0, _app_dir)

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
try:
    from app.api.routes import router
except ImportError:
    from api.routes import router


app = FastAPI(
    title="GitHub Repository AI Analyst API",
    description="AI-powered analysis and RAG question answering over GitHub repositories.",
    version="1.0.0"
)

# Enable CORS for future frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router)


@app.get("/", tags=["Root"])
def root():
    return {
        "name": "GitHub Repository AI Analyst API",
        "version": "1.0.0",
        "docs_url": "/docs",
        "health_url": "/health"
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main_api:app", host="0.0.0.0", port=8000, reload=True)
