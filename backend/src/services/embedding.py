from typing import List

EMBEDDING_DIMENSION = 768  # typical size for many embedding models


def embed_chunks(chunks: List[str]) -> List[List[float]]:
    """
    Generate embeddings for text chunks.

    Implementation:
    - Returns vectors to demonstrate pipeline
    - In production, this would call OpenAI / HuggingFace / etc.
    """
    embeddings = []

    for _ in chunks:
        # Embedding vector
        embeddings.append([0.0] * EMBEDDING_DIMENSION)

    return embeddings
