from retriever import Retriever
from embedding import EmbeddingModel
from generator import generate_answer


class RAGPipeline:

    def __init__(
        self,
        chroma_directory,
        collection_name
    ):

        # Create the embedding model.
        # This is used only for embedding the user's question.
        self.embedding_model = EmbeddingModel()

        # Create the retriever.
        # Chroma stores and searches the repository embeddings.
        self.retriever = Retriever(
            embedding_model=self.embedding_model,
            chroma_directory=chroma_directory,
            collection_name=collection_name
        )

    def ask(self, question, top_k=5):

        # Retrieve the most relevant repository chunks.
        results = self.retriever.search(
            question,
            top_k=top_k
        )

        # Build context for the LLM.
        context_parts = []

        for result in results:

            context_parts.append(
                f"""
File: {result["file_path"]}
Chunk ID: {result["chunk_id"]}
Similarity Score: {result["score"]:.4f}

Code:
{result["content"]}
"""
            )

        context = "\n".join(context_parts)

        # Generate the final answer using Gemini.
        answer = generate_answer(
            question,
            context
        )

        return {
            "answer": answer,
            "sources": results
        }