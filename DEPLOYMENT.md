# Production Deployment Architecture & Guide

## Architecture Overview

```
┌─────────────────────────────────┐
│     Vercel (Edge / Static)      │  Frontend (React + Vite + Tailwind)
│  github-repository-ai-analyst   │
└────────────────┬────────────────┘
                 │  HTTPS Requests (VITE_API_BASE_URL)
                 ▼
┌─────────────────────────────────┐
│    Persistent Container Host    │  Backend (FastAPI + Python 3.12)
│  (Render / Railway / Fly.io /   │  - REST API & Healthchecks
│   Docker VM / AWS ECS)          │  - GitHub API Client
└────────────────┬────────────────┘  - Google Gemini Embeddings & LLM
                 │
                 ▼ Local I/O
┌─────────────────────────────────┐
│     Persistent Volume Mount     │  ChromaDB Vector Store (`data/chroma`)
│        (/app/data/chroma)       │  - SQLite metadata
└─────────────────────────────────┘  - HNSW vector index files
```

### Why Persistent Hosting is Required (ChromaDB)
ChromaDB uses an embedded SQLite database and HNSWlib vector indices written to disk under `data/chroma`. 
- **Vercel Serverless / AWS Lambda** functions have ephemeral, read-only filesystems that wipe disk state across invocations and kill long-running indexing requests after 10–60 seconds.
- Therefore, the FastAPI backend must be hosted on a **persistent container environment** with a persistent disk volume.

---

## Deployment Options

### Option 1: Render (Recommended for Simplicity)
1. In your [Render Dashboard](https://dashboard.render.com/), choose **New** → **Blueprint** or **Web Service**.
2. Select your repository `github-repository-ai-analyst`.
3. Set **Environment** to `Docker`.
4. Add a **Persistent Disk** (under Advanced):
   - **Name**: `chroma-disk`
   - **Mount Path**: `/app/data`
   - **Size**: 5–10 GB
5. Configure Environment Variables:
   - `GITHUB_TOKEN`: Your GitHub Personal Access Token (classic or fine-grained with public repo read access).
   - `GEMINI_API_KEY_1` (or `GEMINI_API_KEY`): Your Google Gemini API Key.
   - `ALLOWED_ORIGINS`: Your Vercel frontend URL, e.g. `https://your-app.vercel.app`.
   - `CHROMA_PERSIST_DIRECTORY`: `/app/data/chroma`
6. Click **Create Web Service**. Health check endpoint is `/health`.

---

### Option 2: Fly.io
1. Install flyctl: `brew install flyctl` or `curl -L https://fly.io/install.sh | sh`
2. Run `fly launch` (it will detect `Dockerfile` and `fly.toml`).
3. Create a persistent volume:
   ```bash
   fly volumes create chroma_data --size 10 --region iad
   ```
4. Set secrets:
   ```bash
   fly secrets set GITHUB_TOKEN="ghp_xxx" GEMINI_API_KEY_1="AIzaSyxxx" ALLOWED_ORIGINS="https://your-app.vercel.app"
   ```
5. Deploy:
   ```bash
   fly deploy
   ```

---

### Option 3: Railway
1. Create a **New Project** → **Deploy from GitHub Repo**.
2. Add a **Volume**:
   - Mount path: `/app/data`
3. Add Environment Variables:
   - `GITHUB_TOKEN`
   - `GEMINI_API_KEY_1`
   - `ALLOWED_ORIGINS`
   - `CHROMA_PERSIST_DIRECTORY`: `/app/data/chroma`
4. Set Healthcheck path: `/health`.

---

### Option 4: Docker Compose (Self-Hosted / VPS / EC2)
1. Clone the repo on your server.
2. Create `.env` with:
   ```env
   GITHUB_TOKEN=ghp_xxx
   GEMINI_API_KEY_1=AIzaSyxxx
   ALLOWED_ORIGINS=https://your-app.vercel.app
   ```
3. Start the persistent container:
   ```bash
   docker compose up -d
   ```

---

## Connecting the Frontend (Vercel)

1. Open your Vercel Project Settings for the frontend.
2. Navigate to **Settings** → **Environment Variables**.
3. Add or update:
   - **Key**: `VITE_API_BASE_URL`
   - **Value**: Your deployed backend URL (e.g. `https://github-ai-analyst-backend.onrender.com` or `https://github-ai-analyst-backend.fly.dev` — without trailing slash).
4. Trigger a frontend redeployment on Vercel (`git push` or click **Redeploy**).
5. The frontend will immediately ping `/health` on your deployed backend and show the green **API Online** indicator.
