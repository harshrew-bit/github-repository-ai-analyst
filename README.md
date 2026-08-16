# GitHub Repository AI Analyst

<div align="center">

[![Python Version](https://img.shields.io/badge/python-3.12+-blue.svg)](https://www.python.org/downloads/)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![Status](https://img.shields.io/badge/status-Active-brightgreen.svg)]()

An intelligent RAG (Retrieval-Augmented Generation) application that analyzes GitHub repositories and answers questions about their source code using semantic search and AI-powered context retrieval.

[Features](#features) • [Quick Start](#quick-start) • [Architecture](#architecture) • [Tech Stack](#tech-stack) • [Contributing](#contributing)

</div>

---

## 🎯 Overview

**GitHub Repository AI Analyst** transforms how developers understand and interact with codebases. By combining GitHub's API with Google's Gemini embeddings and LLM, this tool enables natural language Q&A about any GitHub repository.

Ask questions like:
- "How does this project handle authentication?"
- "Where is the error handling implemented?"
- "What are the main entry points of this application?"

Get intelligent, source-backed answers with direct references to relevant code files.

---

## ✨ Features

- **🔗 GitHub Integration** - Seamlessly ingest any public GitHub repository via GitHub API
- **📄 Intelligent Chunking** - Recursively splits code files into semantically meaningful chunks
- **🧠 Gemini Embeddings** - Generates high-quality embeddings for semantic understanding
- **🚀 Batch Processing** - Efficiently processes repositories with checkpoint/resume support for API rate limits
- **🔍 Semantic Search** - Performs cosine similarity search to retrieve relevant code chunks
- **🤖 RAG Generation** - Uses Gemini LLM to generate context-aware answers
- **📍 Source Attribution** - Automatically tracks and displays source files with similarity scores
- **💾 Local Storage** - Stores embeddings locally for fast retrieval and offline analysis

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                   User Query (Natural Language)             │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│         Query Embedding (Gemini Embeddings)                 │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│    Similarity Retrieval (Cosine Similarity Search)          │
│  - Retrieve top-k relevant code chunks from vector store    │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│   RAG Generation (Gemini LLM + Retrieved Context)           │
│  - Generate repository-grounded answer                      │
│  - Include source attribution and similarity scores         │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│           Answer + Source Files + Scores                    │
└─────────────────────────────────────────────────────────────┘
```

### Data Pipeline

```
GitHub Repository
    ↓
GitHub API (Recursive Tree Retrieval)
    ↓
Repository Ingestion (Filter Source Files)
    ↓
Document Creation (Structure Code Files)
    ↓
Code Chunking (Semantic Segments)
    ↓
Gemini Embeddings (Vectorization)
    ↓
Vector Storage (JSON-based Local Storage)
    ↓
Ready for Semantic Retrieval & Analysis
```

---

## 🛠️ Tech Stack

| Component | Technology |
|-----------|-----------|
| **Language** | Python 3.12+ |
| **APIs** | GitHub API, Google Gemini API |
| **Embeddings** | Gemini Embeddings |
| **LLM** | Google Gemini |
| **Vector Storage** | JSON (Local), Chroma (Planned) |
| **Search** | Cosine Similarity |
| **Data Processing** | Pydantic, Requests |
| **RAG Framework** | Custom Implementation |

---

## ⚙️ Current Implementation

### Retrieval Pipeline

1. **Query Encoding**: Embed user's question using Gemini embeddings
2. **Similarity Matching**: Compare query embedding against stored repository embeddings using cosine similarity
3. **Context Retrieval**: Fetch top-k most relevant code chunks with highest similarity scores
4. **Answer Generation**: Send retrieved context + question to Gemini LLM
5. **Result Formatting**: Return answer with source file attribution and confidence scores

### Example Workflow

```
Repository: FastAPI
Question: "How does FastAPI handle authentication?"

↓ Retrieved Sources:
  • fastapi/security/http.py (similarity: 0.94)
  • fastapi/security/oauth2.py (similarity: 0.92)
  • fastapi/security/api_key.py (similarity: 0.89)

↓ Generated Answer:
"FastAPI handles authentication through a flexible security scheme system
located in the security module. It supports HTTP Bearer, OAuth2, API Key,
and custom authentication mechanisms. The HTTPBearer class handles standard
HTTP authentication, OAuth2PasswordBearer manages OAuth2 flows, and
APIKeyHeader/APIKeyCookie support token-based access..."
```

---

## 🚀 Quick Start

### Prerequisites

- Python 3.12 or higher
- Git
- GitHub account (for GitHub API token)
- Google Cloud account (for Gemini API key)

### Installation

**1. Clone the repository**
```bash
git clone https://github.com/harshrew-bit/github-repository-ai-analyst.git
cd github-repository-ai-analyst
```

**2. Create a virtual environment**
```bash
python3.12 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

**3. Install dependencies**
```bash
pip install -r requirements.txt
```

**4. Set up environment variables**
```bash
cp .env.example .env
```

**5. Add your API keys to `.env`**
```env
GEMINI_API_KEY=your_gemini_api_key_here
GITHUB_TOKEN=your_github_token_here
```

### Running the Application

```bash
python app/main.py
```

**Then:**
1. Enter a GitHub repository URL (e.g., `https://github.com/tiangolo/fastapi`)
2. Wait for the repository to be indexed
3. Ask questions about the codebase in natural language
4. Receive AI-powered answers with source attribution

---

## 📁 Project Structure

```
github-repository-ai-analyst/
├── app/
│   ├── main.py              # Application entry point
│   ├── rag.py               # RAG orchestration
│   ├── github_client.py      # GitHub API interaction
│   ├── ingestion.py          # Repository ingestion pipeline
│   ├── document.py           # Document management
│   ├── chunker.py            # Code chunking logic
│   ├── embedding.py          # Embedding generation (Gemini)
│   ├── embedding_store.py    # Vector storage management
│   ├── retriever.py          # Semantic retrieval
│   ├── similarity.py         # Similarity computation (cosine)
│   ├── indexer.py            # Repository indexing
│   └── generator.py          # Answer generation (Gemini LLM)
├── data/                     # Local embedding storage
├── .env.example              # Environment variables template
├── .gitignore                # Git ignore rules
├── requirements.txt          # Python dependencies
└── README.md                 # Project documentation
```

### Module Descriptions

| Module | Purpose |
|--------|---------|
| `main.py` | CLI entry point and user interaction |
| `rag.py` | Orchestrates the entire RAG pipeline |
| `github_client.py` | Handles GitHub API communication |
| `ingestion.py` | Manages repository download and processing |
| `chunker.py` | Segments code files into chunks |
| `embedding.py` | Generates vector embeddings |
| `embedding_store.py` | Manages local vector storage |
| `retriever.py` | Implements semantic search |
| `similarity.py` | Computes cosine similarity |
| `generator.py` | Generates answers using Gemini LLM |

---

## 📖 Usage Examples

### Basic Query

```
Repository: https://github.com/tiangolo/fastapi

Query: "How does FastAPI handle dependency injection?"

Answer: "FastAPI handles dependency injection through a sophisticated system 
located in the dependencies module. When you define path operation functions, 
FastAPI analyzes the function signature and automatically resolves dependencies 
based on type hints and parameter annotations..."

Sources:
- fastapi/dependencies/models.py (0.96)
- fastapi/dependencies/utils.py (0.94)
- fastapi/params.py (0.89)
```

### Advanced Query

```
Repository: https://github.com/python/cpython

Query: "Explain the Global Interpreter Lock (GIL) implementation"

Answer: "The GIL is a mutex (mutual exclusion lock) that protects access to 
Python objects in the CPython interpreter. Located in ceval.c, it prevents 
multiple native threads from executing Python bytecode simultaneously..."

Sources:
- Python/ceval.c (0.97)
- Python/gil.c (0.96)
- Include/cpython/code.h (0.91)
```

---

## 🔧 Configuration

### Environment Variables (`.env`)

```env
# Required
GEMINI_API_KEY=your_api_key_here
GITHUB_TOKEN=your_github_token_here

# Optional
MAX_CHUNK_SIZE=1000          # Characters per code chunk
CHUNK_OVERLAP=100            # Overlap between chunks
TOP_K_RETRIEVAL=5            # Number of chunks to retrieve
BATCH_SIZE=50                # Batch size for embeddings
STORAGE_PATH=./data          # Local storage path
```

---

## 🐛 Troubleshooting

### Common Issues

**"GEMINI_API_KEY not found"**
- Ensure `.env` file exists in the project root
- Verify `GEMINI_API_KEY` is correctly set
- Restart the application after updating `.env`

**"GitHub API rate limit exceeded"**
- The application supports checkpoint/resume
- Wait for rate limit reset (typically 1 hour for GitHub)
- Consider using a GitHub token with higher rate limits

**"Repository too large to index"**
- The application automatically filters source files
- Binary files and common non-code files are excluded
- Consider analyzing specific directories

**"No relevant sources found"**
- Try rephrasing your question with more specific keywords
- Ensure the repository contains relevant code for your query
- Increase `TOP_K_RETRIEVAL` in `.env`

---

## 📊 Performance

### Indexing Time
- Small repos (<100 files): ~2-5 minutes
- Medium repos (100-1000 files): ~10-30 minutes
- Large repos (1000+ files): ~30+ minutes

*Times vary based on file sizes, network speed, and API rate limits*

### Query Performance
- Initial embedding: ~2-5 seconds
- Similarity search: <1 second
- Answer generation: ~5-15 seconds

---

## 🗺️ Roadmap

### Completed ✅
- [x] GitHub repository ingestion
- [x] Recursive tree retrieval
- [x] Source file filtering
- [x] Code chunking
- [x] Gemini embeddings
- [x] Batch embedding with checkpoint/resume
- [x] Local vector storage
- [x] Cosine similarity search
- [x] RAG generation with Gemini LLM
- [x] Source attribution

### In Progress 🔄
- [ ] Migrate to Chroma vector database
- [ ] Improve retrieval and reranking
- [ ] Support for private repositories
- [ ] Multi-language code analysis

### Planned 🎯
- [ ] Web UI (React/FastAPI)
- [ ] REST API deployment
- [ ] Repository-aware collection management
- [ ] Advanced filtering and search options
- [ ] Code diff analysis
- [ ] Conversation history tracking
- [ ] Custom prompt templates

---

## 🤝 Contributing

Contributions are welcome! Here's how you can help:

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/AmazingFeature`)
3. **Commit** your changes (`git commit -m 'Add some AmazingFeature'`)
4. **Push** to the branch (`git push origin feature/AmazingFeature`)
5. **Open** a Pull Request

### Development Setup

```bash
# Clone your fork
git clone https://github.com/YOUR_USERNAME/github-repository-ai-analyst.git
cd github-repository-ai-analyst

# Create virtual environment
python3.12 -m venv venv
source venv/bin/activate

# Install development dependencies
pip install -r requirements.txt

# Run tests (if available)
pytest tests/
```

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙋 Support

- **Issues**: [GitHub Issues](https://github.com/harshrew-bit/github-repository-ai-analyst/issues)
- **Discussions**: [GitHub Discussions](https://github.com/harshrew-bit/github-repository-ai-analyst/discussions)

---

## 📚 References

- [Google Gemini API Documentation](https://ai.google.dev/)
- [GitHub API Documentation](https://docs.github.com/en/rest)
- [RAG (Retrieval-Augmented Generation)](https://arxiv.org/abs/2005.11401)
- [Semantic Search with Embeddings](https://en.wikipedia.org/wiki/Semantic_search)

---

## 🎓 Acknowledgments

- Built with [Google Gemini](https://ai.google.dev/) for embeddings and LLM capabilities
- GitHub API for repository data access
- Inspired by modern RAG techniques and semantic search methodologies

---

<div align="center">

**[⬆ Back to top](#github-repository-ai-analyst)**

Made with ❤️ by [harshrew-bit](https://github.com/harshrew-bit)

</div>