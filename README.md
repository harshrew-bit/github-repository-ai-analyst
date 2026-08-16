# GitHub Repository AI Analyst

An AI-powered RAG application that analyzes GitHub repositories and answers questions about their source code using retrieved repository context.

## Architecture

```text
GitHub Repository
       ↓
GitHub API
       ↓
Repository Ingestion
       ↓
Document Creation
       ↓
Code Chunking
       ↓
Gemini Embeddings
       ↓
Vector Storage
       ↓
Similarity Retrieval
       ↓
Gemini LLM
       ↓
Answer + Sources

Features
GitHub repository ingestion
Recursive repository tree retrieval
Source file filtering
Repository document creation
Code and documentation chunking
Gemini embedding generation
Batch embedding
Checkpoint and resume support for API rate limits
Local embedding storage
Cosine similarity search
Diverse source retrieval
Gemini-powered RAG generation
Source file attribution
Current Implementation

The project currently uses Gemini embeddings and JSON-based local vector storage.

The retrieval pipeline performs:

Embed the user's question using Gemini.
Compare the query embedding against stored repository embeddings.
Retrieve the most relevant chunks.
Send the retrieved context to Gemini.
Generate a repository-grounded answer.
Display the source files and similarity scores

Example

For a FastAPI repository:

Question:
How does FastAPI handle authentication?

Retrieved sources:
- fastapi/security/http.py
- fastapi/security/oauth2.py
- fastapi/security/api_key.py

The LLM then generates an answer using the retrieved repository context.

Tech Stack
Python 3.12
GitHub API
Gemini API
Gemini Embeddings
Pydantic
Requests
RAG
Vector Search
Cosine Similarity

Setup

Clone the repository:

git clone <YOUR_REPOSITORY_URL>
cd github-ai-analyst

Create a virtual environment:

python3.12 -m venv venv

Activate it:

source venv/bin/activate

Install dependencies:

pip install -r requirements.txt

Create your environment file:

cp .env.example .env

Add your API keys to .env:

GEMINI_API_KEY=your_gemini_api_key
GITHUB_TOKEN=your_github_token

Running

Run the application:

python app/main.py
Enter a GitHub repository URL when prompted.

Project Structure
github-ai-analyst/
├── app/
│   ├── chunker.py
│   ├── document.py
│   ├── embedding.py
│   ├── embedding_store.py
│   ├── generator.py
│   ├── github_client.py
│   ├── indexer.py
│   ├── ingestion.py
│   ├── main.py
│   ├── rag.py
│   ├── retriever.py
│   └── similarity.py
├── data/
├── .env.example
├── .gitignore
├── README.md
└── requirements.txt

Roadmap
 GitHub repository ingestion
 Repository document creation
 Code chunking
 Gemini embeddings
 Batch embedding
 Checkpoint/resume
 Semantic retrieval
 RAG generation
 Source attribution
 Migrate vector storage to Chroma
 Automatic repository indexing
 Repository-aware vector collections
 Improved retrieval and reranking
 Web interface
 API deployment

 ### Then stage the README

Because it was already staged as an empty file, run:

```bash
git add README.md