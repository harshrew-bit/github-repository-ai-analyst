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

# Production-ready CORS configuration
allowed_origins_env = os.getenv("ALLOWED_ORIGINS") or os.getenv("FRONTEND_URL")
if allowed_origins_env:
    allowed_origins = [origin.strip() for origin in allowed_origins_env.split(",") if origin.strip()]
else:
    # Default local development origins
    allowed_origins = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:4173",
        "http://127.0.0.1:4173",
    ]

# Optional wildcard toggle for testing/staging environments
if os.getenv("ALLOW_ALL_ORIGINS", "").lower() in ("true", "1", "yes"):
    allowed_origins = ["*"]

# Regex pattern for dynamic Vercel preview URLs (e.g. https://github-*-user.vercel.app)
origin_regex = os.getenv("ALLOWED_ORIGINS_REGEX", r"^https:\/\/.*\.vercel\.app$")
if allowed_origins == ["*"]:
    origin_regex = None

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_origin_regex=origin_regex,
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
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
