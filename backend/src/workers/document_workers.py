import time
from src.models.enums import RequestStatus, ProjectStatus
from src.services.indexing_service import ingest_document
from src.services.request_service import update_request_status
from src.storage.memory import PROJECTS


def process_document_indexing(request_id: str, project_id: str, file):
    """
    Background task for document ingestion & indexing.

    Pipeline:
    1. Mark request RUNNING
    2. Extract text
    3. Chunk text
    4. Generate embeddings
    5. Store in vector database
    6. Mark request COMPLETED or FAILED
    """
    try:
        # 1️. Mark request as running
        update_request_status(
            request_id,
            RequestStatus.RUNNING,
            progress=0.1
        )

        # Simulate heavy work
        time.sleep(1)

        # 2️–5️ Ingest document 
        ingest_document(project_id, file)

        # 6️ Update project state
        project = PROJECTS.get(project_id)
        if project:
            project.status = ProjectStatus.INDEXING
            # Mark ALL_DOCS projects as OUTDATED when new documents are indexed
            # (Any new document makes ALL_DOCS projects outdated)
            for other_project in PROJECTS.values():
                if other_project.scope.value == "ALL_DOCS":
                    other_project.status = ProjectStatus.OUTDATED

        # Finish
        update_request_status(
            request_id,
            RequestStatus.COMPLETED,
            progress=1.0,
            result={
                "project_id": project_id,
                "filename": file.filename
            }
        )

    except Exception as e:
        update_request_status(
            request_id,
            RequestStatus.FAILED,
            error=str(e)
        )
