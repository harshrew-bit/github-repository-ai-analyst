import os
import sys

_app_dir = os.path.dirname(os.path.abspath(__file__))
if _app_dir not in sys.path:
    sys.path.insert(0, _app_dir)

try:
    from app.services.repository_service import RepositoryService
    from app.services.rag_service import RAGService
    from app.ingestion import parse_github_url
    from app.vector_store import get_collection_name
except ImportError:
    from services.repository_service import RepositoryService
    from services.rag_service import RAGService
    from ingestion import parse_github_url
    from vector_store import get_collection_name


def main():
    chroma_directory = "data/chroma"
    repository_service = RepositoryService(chroma_directory=chroma_directory)
    rag_service = RAGService(chroma_directory=chroma_directory)

    print("==================================================")
    print("  GitHub Repository AI Analyst (CLI Interface)")
    print("==================================================")

    # Ask the user for the GitHub repository URL
    repository_url = input("\nEnter GitHub repository URL: ").strip()
    if not repository_url:
        print("Error: Repository URL cannot be empty.")
        return

    try:
        owner, repository_name = parse_github_url(repository_url)
    except Exception as e:
        print(f"Error parsing URL: {e}")
        return

    collection_name = get_collection_name(owner, repository_name)
    print(f"\nTarget repository: {owner}/{repository_name}")
    print(f"Target Chroma collection: {collection_name}")

    # Index or load repository
    print("\nChecking repository index status...")
    try:
        index_result = repository_service.index_repository(
            repository_url=repository_url,
            force_reindex=False
        )
        print(f"Status: {index_result.get('message', 'Ready.')}")
        print(f"Total indexed chunks: {index_result['chunks']}")
    except Exception as e:
        print(f"Error indexing repository: {e}")
        return

    # Query loop
    while True:
        try:
            question = input(f"\nAsk a question about {repository_name} (or 'quit' to exit): ").strip()
            if not question:
                continue
            if question.lower() in ("quit", "exit", "q"):
                print("Exiting. Goodbye!")
                break

            print("\nSearching repository and generating answer...")
            result = rag_service.query(
                repository_url=repository_url,
                question=question,
                top_k=5
            )

            print("\nAI Answer")
            print("---------")
            print(result["answer"])

            print("\nSources")
            print("-------")
            for source in result["sources"]:
                print(
                    f"- {source['file_path']} "
                    f"(chunk {source['chunk_id']}, score: {source['score']:.4f})"
                )

        except KeyboardInterrupt:
            print("\nExiting. Goodbye!")
            break
        except Exception as e:
            print(f"\nError querying repository: {e}")


if __name__ == "__main__":
    main()