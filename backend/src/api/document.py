from fastapi import APIRouter, UploadFile, BackgroundTasks
from src.storage.memory import DOCUMENTS, PROJECTS
from src.models.enums import ProjectStatus, RequestStatus
from src.utils.ids import get_id
from src.workers.document_workers import process_document_indexing
from src.services.request_service import create_request


router = APIRouter()

@router.post("/index-document-async")
def index_document(project_id: str, file: UploadFile, background_tasks: BackgroundTasks):
    """
    Index a document asynchronously. Returns a request ID to track the status.
    """
    request_id = create_request()

    background_tasks.add_task(
        process_document_indexing,
        request_id,
        project_id,
        file
    )

    return {
        "request_id": request_id,
        "status": RequestStatus.QUEUED
    }    


@router.get("/project-documents")
def get_project_documents(project_id: str):
    """
    Retrieve all documents associated with a specific project.
    """
    project = PROJECTS.get(project_id)
    if not project:
        return {"documents": []}
    return {"documents": [doc for doc in DOCUMENTS.values() if doc["id"] in project.document_ids]}