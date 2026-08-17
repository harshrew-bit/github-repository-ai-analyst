# GitHub Repository AI Analyst

### RAG-powered AI assistant for understanding GitHub repositories

A Retrieval-Augmented Generation (RAG) application that ingests a GitHub repository, indexes its source code and documentation, and answers natural-language questions about the codebase using Gemini. Answers are grounded in retrieved repository context and include source attribution.

<div align="center">

[![Python](https://img.shields.io/badge/Python-3.12-blue.svg)](https://www.python.org/)
[![Gemini](https://img.shields.io/badge/LLM-Gemini-purple.svg)](https://ai.google.dev/)
[![ChromaDB](https://img.shields.io/badge/Vector%20DB-ChromaDB-orange.svg)](https://www.trychroma.com/)
[![GitHub API](https://img.shields.io/badge/API-GitHub-black.svg)](https://docs.github.com/en/rest)

</div>

---

## Table of Contents

* [Overview](#overview)
* [Problem](#problem)
* [Solution](#solution)
* [Key Features](#key-features)
* [Architecture](#architecture)
* [How It Works](#how-it-works)
* [Incremental Repository Indexing](#incremental-repository-indexing)
* [Retrieval and RAG](#retrieval-and-rag)
* [ChromaDB Vector Storage](#chromadb-vector-storage)
* [Checkpointing and Recovery](#checkpointing-and-recovery)
* [Reliability and API Handling](#reliability-and-api-handling)
* [Supported Files](#supported-files)
* [Tech Stack](#tech-stack)
* [Project Structure](#project-structure)
* [Prerequisites](#prerequisites)
* [Installation](#installation)
* [Environment Variables](#environment-variables)
* [Running the Application](#running-the-application)
* [Example Questions](#example-questions)
* [Example Output](#example-output)
* [Testing and Validation](#testing-and-validation)
* [Design Decisions](#design-decisions)
* [Current Limitations](#current-limitations)
* [Roadmap](#roadmap)
* [Resume Highlights](#resume-highlights)
* [Project Status](#project-status)

---

## Overview

GitHub Repository AI Analyst allows developers to provide a GitHub repository URL and ask questions about the repository in natural language.

Instead of manually searching through files, the system uses a RAG pipeline to:

1. Retrieve the repository structure and source files from GitHub.
2. Convert supported files into structured repository documents.
3. Split documents into overlapping chunks.
4. Generate Gemini embeddings for the chunks.
5. Store embeddings in a persistent ChromaDB collection.
6. Retrieve semantically relevant chunks for a user's question.
7. Provide the retrieved repository context to Gemini.
8. Generate a grounded answer with source attribution.

The project focuses on building the core components of a practical RAG system rather than adding frameworks or technologies purely for abstraction.

---

## Problem

Large software repositories can contain hundreds or thousands of files, making it difficult for developers to quickly understand:

* where a feature is implemented
* how different modules interact
* how a library handles a specific behavior
* which files are responsible for a particular operation
* how configuration and documentation relate to implementation
* where tests for a feature are located

Traditional keyword search can help locate exact terms, but it does not always capture the intent behind a natural-language question.

For example:

> "How does Requests handle connection pooling?"

A useful answer may require information from multiple source files and tests rather than a single keyword match.

---

## Solution

This project builds a repository-aware RAG pipeline.

The repository is converted into searchable vector representations, allowing natural-language questions to retrieve semantically relevant sections of the codebase.

The retrieved repository context is then passed to Gemini so that the generated response is grounded in the actual contents of the repository.

A key engineering feature is **incremental repository indexing**. Instead of rebuilding the entire vector database whenever the repository changes, the system tracks Git commit SHAs and file-level blob SHAs to identify exactly which files changed.

Only changed or newly added files are re-embedded, while deleted files have their existing vectors removed and unchanged files retain their existing embeddings.

---

# Key Features

### GitHub Repository Ingestion

* GitHub repository URL parsing
* Repository metadata retrieval
* Default branch detection
* Recursive Git tree retrieval
* Git blob content retrieval
* Repository file mapping using Git blob SHAs

### Source Processing

* Supported source-code and documentation file filtering
* Directory exclusion for generated and dependency files
* Language detection
* Repository document creation
* Overlapping text-based chunking

### Embeddings

* Gemini embedding generation
* Batched embedding requests
* Retry handling for API rate limits
* Gemini credential failover
* Checkpoint/resume support

### Vector Search

* Persistent ChromaDB storage
* Repository-specific ChromaDB collections
* Cosine-distance similarity search
* Candidate expansion
* File-diversity selection
* Metadata stored with each vector

### RAG

* Natural-language repository questions
* Semantic retrieval
* Context construction from retrieved chunks
* Gemini-powered answer generation
* Source file and chunk attribution

### Incremental Indexing

* Repository commit SHA tracking
* File-level blob SHA tracking
* Changed-file detection
* Added-file detection
* Deleted-file detection
* Preservation of unchanged embeddings
* Selective re-embedding
* Selective ChromaDB vector deletion

### Recovery

* Persistent indexing checkpoints
* ChromaDB restoration from checkpoints
* Avoidance of unnecessary embedding regeneration

### Interface

* Simple terminal-based CLI
* Repository URL input
* Natural-language question input

---

# Architecture

## Initial Indexing and Query Flow

```text
                    GitHub Repository
                           │
                           ▼
                    GitHub REST API
             ┌─────────────┴─────────────┐
             │                           │
       Repository Metadata        Recursive Git Tree
                                         │
                                         ▼
                                Git Blob Content
                                         │
                                         ▼
                              Repository Ingestion
                           (filtering + documents)
                                         │
                                         ▼
                                   Chunking
                              (size + overlap)
                                         │
                                         ▼
                               Gemini Embeddings
                              (batch + retry)
                                         │
                                         ▼
                         Repository Checkpoint
                      (commit SHA + file map)
                                         │
                                         ▼
                           ChromaDB Collection
                                         │
                                         ▼
                                  Retriever
                    (query embedding + candidate
                         expansion + diversity)
                                         │
                                         ▼
                              Retrieved Context
                                         │
                                         ▼
                                  Gemini LLM
                                         │
                                         ▼
                         Grounded Answer + Sources
```

## Incremental Update Flow

```text
                    GitHub Repository
                           │
                           ▼
                     Current Commit SHA
                           │
                           ▼
                Compare with Stored Checkpoint
                           │
                           ▼
                  Compare File Blob SHAs
                           │
              ┌────────────┼────────────┐
              │            │            │
              ▼            ▼            ▼
          Unchanged      Changed      Added
              │            │            │
              │            ▼            ▼
              │      Delete old      Embed new
              │       chunks
              │            │            │
              │            └─────┬──────┘
              │                  │
              ▼                  ▼
        Preserve existing     Update Chroma
          embeddings
                           │
                           ▼
                       Deleted Files
                           │
                           ▼
                  Remove existing vectors
                           │
                           ▼
                   Update Checkpoint
```

---

# How It Works

## 1. Repository URL Parsing

The application accepts a GitHub repository URL such as:

```text
https://github.com/psf/requests
```

The owner and repository name are extracted and used for GitHub API requests.

---

## 2. Repository Metadata and Tree Retrieval

The GitHub client retrieves:

* repository metadata
* default branch
* latest commit SHA
* recursive repository tree

The recursive tree provides the file paths and Git object information required for ingestion.

---

## 3. File Filtering

The ingestion layer filters files using supported extensions and special repository files.

Commonly ignored directories include:

```text
.git
.github
.venv
venv
env
node_modules
__pycache__
dist
build
.pytest_cache
.mypy_cache
```

This prevents dependencies, generated artifacts, caches, and other irrelevant files from entering the indexing pipeline.

---

## 4. Document Creation

Each supported file is converted into a repository document containing metadata such as:

```text
repository
file_path
language
content
blob_sha
```

The Git blob SHA is particularly important for incremental indexing because it allows the application to determine whether the contents of a file have changed.

---

## 5. Chunking

Large files are split into smaller overlapping chunks before embedding.

The current chunking strategy uses text-based boundaries with:

```text
chunk_size = 1000
overlap    = 200
```

Each generated chunk receives a `chunk_id`.

The current chunking implementation is intentionally simple and is not AST- or syntax-aware.

---

## 6. Embedding Generation

Each chunk is converted into a vector representation using Gemini embeddings.

Embedding generation is performed in batches rather than sending every chunk independently.

The embedding pipeline also includes:

* retry handling
* rate-limit handling
* credential failover
* checkpoint persistence

This makes large indexing operations more resilient to temporary Gemini API failures.

---

# Incremental Repository Indexing

Incremental indexing is one of the major engineering features of the project.

A naive RAG implementation may regenerate embeddings for an entire repository whenever the repository changes.

That approach becomes expensive and slow as repositories grow.

This project instead tracks repository and file-level Git state.

## Commit-Level Detection

The checkpoint stores the latest indexed commit SHA:

```text
commit_sha
```

On a subsequent run, the current repository commit SHA is compared with the stored checkpoint.

If the commit has not changed, the repository does not need to be re-indexed.

If the commit has changed, the system performs file-level comparison.

---

## File-Level Detection

The repository file map stores:

```text
file_path → blob_sha
```

For example:

```text
README.md → abc123
api.py    → def456
models.py → ghi789
```

The current GitHub file map is compared with the checkpoint.

Files are classified into four states.

| File State | Action                         |
| ---------- | ------------------------------ |
| Unchanged  | Preserve existing embeddings   |
| Changed    | Delete old chunks and re-embed |
| Added      | Embed the new file             |
| Deleted    | Remove existing vectors        |

---

## Example

Suppose the previous index contains:

```text
README.md
api.py
old.py
```

The repository is then updated to:

```text
README.md
api.py
new.py
```

The system can identify:

```text
Unchanged:
README.md

Changed:
api.py

Added:
new.py

Deleted:
old.py
```

The resulting indexing operation is:

```text
README.md
    ↓
Preserve existing embeddings

api.py
    ↓
Delete old chunks
    ↓
Fetch updated content
    ↓
Re-chunk
    ↓
Generate new embeddings
    ↓
Store in ChromaDB

new.py
    ↓
Fetch
    ↓
Chunk
    ↓
Embed
    ↓
Store in ChromaDB

old.py
    ↓
Delete corresponding vectors
```

This avoids regenerating embeddings for unchanged files.

---

## Why Blob SHAs?

Git blob SHAs represent the contents of files.

By comparing blob SHAs, the application can determine whether a file's contents changed without comparing the entire file contents manually.

This makes blob-level comparison useful for efficient repository synchronization.

---

# Retrieval and RAG

Once a repository has been indexed, users can ask questions such as:

```text
How does Requests handle connection pooling?
```

The retrieval process works as follows:

```text
User Question
      │
      ▼
Gemini Query Embedding
      │
      ▼
ChromaDB Similarity Search
      │
      ▼
Candidate Expansion
      │
      ▼
File-Diversity Selection
      │
      ▼
Top Relevant Chunks
      │
      ▼
Context Construction
      │
      ▼
Gemini
      │
      ▼
Grounded Answer
```

## Candidate Expansion

Instead of retrieving only the final number of chunks required, the retriever first retrieves a larger candidate set.

For example:

```text
candidate_count = max(top_k * 3, 15)
```

This provides additional candidates from which the final results can be selected.

---

## File Diversity

A retrieval result can become dominated by multiple chunks from the same file.

The retriever therefore prefers results from different files when possible.

For example, instead of returning:

```text
README.md
README.md
README.md
README.md
```

the system may select:

```text
README.md
src/requests/adapters.py
tests/test_requests.py
tests/test_testserver.py
```

This provides broader repository context to the generation step.

---

## Similarity Scoring

ChromaDB returns cosine distance.

The application converts this into a similarity-style score:

```text
similarity = 1 - distance
```

These scores are included in the retrieved context and can be shown as part of source attribution.

---

## Grounded Generation

The retrieved chunks are formatted into a context containing information such as:

```text
file path
chunk ID
similarity score
content
```

The context is then supplied to Gemini together with the user's question.

The model is instructed to base its response on the supplied repository context.

This helps reduce unsupported answers by grounding generation in actual repository content.

However, RAG does not guarantee that every generated answer will be completely correct or complete.

---

# ChromaDB Vector Storage

The project uses ChromaDB as its persistent vector database.

### Configuration

* **Client:** `chromadb.PersistentClient`
* **Storage:** local persistent storage
* **Distance metric:** cosine
* **Collections:** repository-specific
* **Metadata:** file path, language, chunk ID, Git blob SHA

Each repository uses its own collection.

For example:

```text
psf/requests
        ↓
repository_requests
```

This prevents embeddings from unrelated repositories from being mixed together.

---

## ChromaDB Metadata

Each stored chunk includes metadata such as:

```text
file_path
language
chunk_id
blob_sha
```

The `blob_sha` is particularly important because it connects the vector representation back to the Git version of the indexed file.

This allows incremental indexing to identify and update only affected vectors.

---

# Checkpointing and Recovery

The indexing system maintains a repository checkpoint containing information required to understand the current indexed state.

A checkpoint stores:

```text
repository
commit_sha
file_map
embeddings
```

The file map has the form:

```text
file_path → blob_sha
```

For example:

```text
README.md → sha1
src/api.py → sha2
tests/test_api.py → sha3
```

---

## Checkpoint Resume

Embedding generation can involve a large number of API requests.

The system therefore saves progress during embedding generation.

If an indexing operation is interrupted, the checkpoint allows the process to resume instead of unnecessarily starting the entire embedding process again.

---

## ChromaDB Recovery

If ChromaDB is empty but a valid checkpoint exists, the application can restore ChromaDB from the checkpoint without regenerating the embeddings.

This provides an additional recovery path and avoids unnecessary Gemini API calls.

---

# Reliability and API Handling

External APIs can fail temporarily, especially during large indexing operations.

The project includes reliability mechanisms for Gemini API requests.

## Retry Handling

Temporary API failures and rate-limit responses are handled using retries with increasing delays.

This is particularly useful when processing repositories containing many chunks.

---

## Gemini Credential Failover

The application also supports Gemini credential failover.

If one configured Gemini credential becomes unavailable or encounters an appropriate failure, the system can attempt another available credential.

This improves resilience during embedding and generation operations.

---

## GitHub API

The GitHub client centralizes repository API operations including:

* repository metadata
* latest commit SHA
* recursive repository tree
* Git blob content
* individual file content

A GitHub personal access token can be supplied to improve API access and rate-limit capacity.

---

# Supported Files

The ingestion pipeline currently supports common source-code, documentation, and configuration files.

### Programming Languages

```text
.py
.js
.ts
.tsx
.jsx
.java
.cpp
.c
.h
.hpp
.go
.rs
```

### Documentation and Configuration

```text
.md
.json
.yml
.yaml
.toml
```

### Special Files

```text
README
LICENSE
Dockerfile
Makefile
Procfile
```

Files inside dependency, build, cache, and version-control directories are excluded.

---

# Tech Stack

| Component             | Technology                                 |
| --------------------- | ------------------------------------------ |
| Language              | Python 3.12                                |
| LLM                   | Google Gemini                              |
| Embeddings            | Gemini Embeddings API                      |
| Vector Database       | ChromaDB                                   |
| Repository Access     | GitHub REST API                            |
| HTTP Client           | Requests                                   |
| Data Validation       | Pydantic                                   |
| Retrieval             | Semantic vector search + cosine similarity |
| Application Interface | Python CLI                                 |
| Persistence           | ChromaDB + JSON checkpoints                |
| Version Tracking      | Git commit SHA + blob SHA                  |

---

# Project Structure

```text
github-ai-analyst/
│
├── app/
│   ├── __init__.py
│   ├── chunker.py
│   ├── document.py
│   ├── embedding.py
│   ├── embedding_store.py
│   ├── gemini_client.py
│   ├── generator.py
│   ├── github_client.py
│   ├── indexer.py
│   ├── ingestion.py
│   ├── main.py
│   ├── rag.py
│   ├── retriever.py
│   ├── retry.py
│   ├── search.py
│   ├── similarity.py
│   └── vector_store.py
│
├── data/
│   └── repositories/
│
├── .env.example
├── .gitignore
├── README.md
└── requirements.txt
```

### Important Modules

| Module               | Responsibility                                               |
| -------------------- | ------------------------------------------------------------ |
| `github_client.py`   | GitHub API communication                                     |
| `ingestion.py`       | Repository traversal, file filtering, and document ingestion |
| `document.py`        | Repository document and chunk models                         |
| `chunker.py`         | Text-based document chunking                                 |
| `embedding.py`       | Embedding generation and embedding-related operations        |
| `embedding_store.py` | Local embedding and checkpoint storage                       |
| `gemini_client.py`   | Gemini API client and credential handling                    |
| `generator.py`       | Gemini answer generation                                     |
| `indexer.py`         | Repository indexing, checkpointing, and incremental updates  |
| `vector_store.py`    | ChromaDB persistence and vector operations                   |
| `retriever.py`       | Semantic retrieval and result selection                      |
| `rag.py`             | RAG orchestration                                            |
| `retry.py`           | Retry and backoff handling                                   |
| `search.py`          | Search-related utilities                                     |
| `similarity.py`      | Similarity and scoring utilities                             |
| `main.py`            | CLI application entry point                                  |

Generated data under `data/` is excluded from version control.

---

# Prerequisites

Before running the project, make sure you have:

* Python 3.12+
* Git
* A Gemini API key
* A GitHub personal access token
* Internet access for GitHub and Gemini API requests

---

# Installation

## 1. Clone the Repository

```bash
git clone https://github.com/harshrew-bit/github-repository-ai-analyst.git
cd github-repository-ai-analyst
```

## 2. Create a Virtual Environment

```bash
python3.12 -m venv venv
source venv/bin/activate
```

On Windows:

```bash
venv\Scripts\activate
```

## 3. Install Dependencies

```bash
pip install -r requirements.txt
```

## 4. Configure Environment Variables

Create a `.env` file:

```bash
cp .env.example .env
```

Then add the required credentials.

---

# Environment Variables

The application uses environment variables for external API credentials.

Create a `.env` file:

```env
GEMINI_API_KEY=your_gemini_api_key
GITHUB_TOKEN=your_github_token
```

The repository should contain only placeholder values in `.env.example`:

```env
GEMINI_API_KEY=
GITHUB_TOKEN=
```

### Important

Never commit `.env`.

Do not expose API keys or tokens in:

* source code
* Git commits
* screenshots
* terminal output
* documentation

---

# Running the Application

Activate the virtual environment:

```bash
source venv/bin/activate
```

Run:

```bash
python app/main.py
```

The CLI prompts for a repository URL:

```text
Enter GitHub repository URL:
```

For example:

```text
https://github.com/psf/requests
```

The application then prompts:

```text
Ask a question about Requests:
```

You can enter a natural-language question about the repository.

---

# First Index

When a repository is indexed for the first time, the system performs:

```text
GitHub Repository
       ↓
Repository Tree
       ↓
File Filtering
       ↓
File Content Retrieval
       ↓
Document Creation
       ↓
Chunking
       ↓
Gemini Embeddings
       ↓
Checkpoint
       ↓
ChromaDB
```

The embeddings are then available for semantic retrieval.

---

# Subsequent Runs

When the same repository is queried again, the application can use the existing indexed state rather than regenerating everything.

The repository's current commit SHA is compared with the stored checkpoint.

If there are no repository changes:

```text
Repository already indexed.
```

The existing embeddings can be used.

If changes are detected, the incremental indexing process determines which files need to be updated.

---

# Repository Updates

Suppose an indexed repository changes.

The application compares:

```text
Previous commit SHA
        ↓
Current commit SHA
        ↓
File map comparison
        ↓
Unchanged / Changed / Added / Deleted
```

Only affected files are updated.

This is significantly more efficient than rebuilding the entire repository index after every change.

---

# Example Questions

The system can answer questions such as:

```text
What is the Requests library?
```

```text
How does Requests handle connection pooling?
```

```text
How does the Requests library handle HTTP authentication?
```

```text
What authentication methods are supported?
```

```text
Where is connection pooling implemented?
```

```text
Which tests cover HTTP authentication?
```

```text
How do the adapters and sessions interact?
```

The quality of the answer depends on whether the relevant information exists in the indexed repository and is retrieved by the semantic search step.

---

# Example Output

Example repository:

```text
psf/requests
```

Example question:

```text
How does Requests handle connection pooling?
```

The system retrieves relevant repository context from files such as:

```text
src/requests/adapters.py
tests/test_requests.py
tests/test_testserver.py
```

The retrieved chunks are supplied to Gemini, which generates a repository-grounded explanation.

The response also includes source attribution so the user can identify which repository files contributed to the answer.

---

# Testing and Validation

The project has been validated through targeted integration tests and manual end-to-end testing.

Repositories used during development and validation include:

```text
psf/requests
tiangolo/fastapi
octocat/Hello-World
pallets-eco/flask-smorest
```

The `psf/requests` repository is currently the primary end-to-end working example.

---

## Incremental Indexing Validation

The incremental indexing implementation has been tested against scenarios including:

### Changed + Added + Deleted

Verified that:

* changed files are re-embedded
* added files are embedded
* deleted files have their vectors removed
* unchanged files retain their existing embeddings
* checkpoint state is updated
* ChromaDB state is synchronized

### Deleted-Only Update

A deleted-only update was specifically validated to ensure that deleted vectors are removed even when there are no new chunks to embed.

Example validation:

```text
Before: 3 embeddings

Files requested: []
No new chunks to embed.
Deleted 1 old chunks.
Checkpoint updated: 2 embeddings.

After: 2 embeddings
```

The resulting ChromaDB and checkpoint file lists were verified to remain synchronized.

---

## Code Validation

During development, the project has also been checked using:

```bash
python -m py_compile ...
```

and:

```bash
git diff --check
```

These checks were used to catch syntax errors and whitespace problems during development.

A comprehensive automated test suite is a planned improvement.

---

# Design Decisions

## Why GitHub's Git Tree and Blob APIs?

The Git tree provides a recursive view of repository files, while Git blobs allow file content to be retrieved using Git object information.

Using blob SHAs also provides a natural way to track file-level changes.

---

## Why ChromaDB?

ChromaDB provides a lightweight persistent vector store suitable for a local RAG application.

It allows the project to:

* persist embeddings
* perform similarity search
* store metadata with vectors
* maintain repository-specific collections

without requiring a separate hosted vector database.

---

## Why Repository-Specific Collections?

Mixing embeddings from different repositories could cause irrelevant context to be retrieved.

Using a separate collection for each repository provides isolation between indexed codebases.

For example:

```text
repository_requests
repository_fastapi
repository_flask_smorest
```

Each collection can contain embeddings belonging to its corresponding repository.

---

## Why Incremental Indexing?

Embedding an entire repository after every change is inefficient.

The combination of:

```text
Commit SHA
+
File Path
+
Blob SHA
```

allows the application to determine which files actually changed.

This minimizes:

* unnecessary GitHub API requests
* unnecessary Gemini embedding requests
* unnecessary vector-store operations
* indexing time

while preserving the existing embeddings for unchanged files.

---

## Why Not LangChain or LangGraph?

The project intentionally avoids adding frameworks unless they solve a concrete engineering problem.

The core RAG pipeline is implemented directly using:

```text
GitHub API
Gemini
ChromaDB
Python
```

This keeps the system transparent and makes the underlying ingestion, embedding, retrieval, checkpointing, and incremental indexing logic easier to understand.

---

# Current Limitations

The project is currently a local developer tool and is not intended to be production-ready.

Current limitations include:

* **CLI only:** there is currently no web interface.
* **No REST API:** the application is accessed through the Python CLI.
* **Plain-text chunking:** code is chunked using text-based boundaries rather than AST- or syntax-aware chunking.
* **Simple retrieval heuristics:** retrieval currently uses semantic search, candidate expansion, and file diversity rather than advanced reranking.
* **No hybrid search:** lexical and semantic retrieval are not combined.
* **No retrieval evaluation framework:** retrieval quality has not yet been measured using a formal benchmark.
* **No multi-user support:** authentication and user-level isolation are not implemented.
* **No comprehensive automated test suite:** validation has primarily used targeted integration and manual tests.
* **Local persistence:** ChromaDB and checkpoint data are stored locally.
* **Limited scale evaluation:** the system has been tested against several repositories but has not yet been evaluated against very large production-scale repositories.
* **No deployment configuration:** cloud deployment and production infrastructure have not been implemented.

---

# Roadmap

## Phase 1 — Documentation and Engineering

* [x] Core GitHub ingestion
* [x] Gemini embeddings
* [x] ChromaDB vector storage
* [x] RAG question answering
* [x] Repository-specific collections
* [x] Commit-level change detection
* [x] File-level blob SHA tracking
* [x] Incremental indexing
* [x] Deleted-file vector removal
* [x] Checkpoint recovery
* [x] Gemini retry handling
* [x] Gemini credential failover
* [ ] Comprehensive automated test suite
* [ ] CI/CD pipeline

## Phase 2 — Retrieval Improvements

* [ ] Advanced reranking
* [ ] Hybrid lexical + semantic search
* [ ] Metadata-based filtering
* [ ] Retrieval evaluation metrics
* [ ] Improved context selection

## Phase 3 — Code-Aware Understanding

* [ ] AST-aware or syntax-aware chunking
* [ ] Better handling of large source files
* [ ] Symbol-aware retrieval
* [ ] Improved cross-file relationship understanding

## Phase 4 — User Experience

* [ ] Streamlit web interface
* [ ] Conversation history
* [ ] Repository browsing alongside answers
* [ ] Improved source navigation

## Phase 5 — Deployment

* [ ] REST API
* [ ] Docker support
* [ ] Cloud deployment
* [ ] Production-oriented observability
* [ ] Performance and scale evaluation

---

# Resume Highlights

This project demonstrates practical experience with:

* Retrieval-Augmented Generation (RAG)
* LLM application development
* Gemini embeddings and generation
* Vector databases and semantic search
* ChromaDB persistence
* GitHub REST API integration
* Repository ingestion pipelines
* Document chunking
* Incremental indexing
* Git commit and blob SHA-based change detection
* Checkpoint-based recovery
* API retry and credential failover
* Python
* Pydantic
* Requests

### Example Resume Description

> **GitHub Repository AI Analyst** — Built a RAG-based developer assistant that ingests GitHub repositories, generates Gemini embeddings, stores them in repository-specific ChromaDB collections, and answers natural-language questions with source attribution. Implemented commit/blob-SHA based incremental indexing to selectively re-embed changed files, remove deleted-file vectors, preserve unchanged embeddings, and recover vector state from checkpoints.

---

# Project Status

### Current Status: Functional RAG Developer Assistant

The core system is implemented and working end-to-end.

Currently implemented:

* GitHub repository ingestion
* Source/document processing
* Text-based chunking
* Gemini embeddings
* ChromaDB persistence
* Repository-specific vector collections
* Semantic retrieval
* RAG generation
* Source attribution
* Commit-level change detection
* File-level blob SHA tracking
* Incremental indexing
* Deleted-file vector removal
* Checkpoint synchronization
* ChromaDB recovery
* Gemini retry handling
* Gemini credential failover
* CLI interface

The next major engineering priorities are automated testing, improved retrieval, code-aware chunking, a web interface, and deployment.

---

# Project Goal

The long-term goal is to evolve the project from a command-line RAG prototype into a practical AI developer assistant capable of helping developers understand unfamiliar repositories quickly and reliably.

The focus is on improving:

```text
Retrieval Quality
       +
Repository Awareness
       +
Indexing Efficiency
       +
Code Understanding
       +
Developer Experience
```

while keeping the underlying system understandable and technically grounded.

---

## License

This project is currently intended as a personal learning and portfolio project.
