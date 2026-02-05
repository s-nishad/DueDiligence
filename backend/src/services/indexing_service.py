from src.storage.objects import save_file
from src.storage.vector import VectorStore
from src.services.chunking import chunk_text
from src.services.embedding import embed_chunks
from src.utils.extract import extract_text


def ingest_document(project_id: str, file):
    """
    Pipeline: save → extract → chunk → embed → store
    """
    file_path = save_file(project_id, file)

    text = extract_text(file_path)
    chunks = chunk_text(text)
    embeddings = embed_chunks(chunks)

    for chunk, emb in zip(chunks, embeddings):
        VectorStore.add(
            project_id=project_id,
            chunk=chunk,
            embedding=emb,
            metadata={"source": file.filename}
        )
