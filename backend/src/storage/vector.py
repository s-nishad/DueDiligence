class VectorStore:
    """
    Vector database.
    Can be replaced with Qdrant / FAISS / Chroma / Pinecone later.
    """

    _vectors = []

    @classmethod
    def add(
        cls,
        project_id: str,
        chunk: str,
        embedding: list[float],
        metadata: dict
    ):
        cls._vectors.append({
            "project_id": project_id,
            "chunk": chunk,
            "embedding": embedding,
            "metadata": metadata
        })

    @classmethod
    def search(
        cls,
        project_id: str,
        query_embedding: list[float],
        top_k: int = 5
    ):
        """
        similarity search.
        """
        return [
            v for v in cls._vectors
            if v["project_id"] == project_id
        ][:top_k]
