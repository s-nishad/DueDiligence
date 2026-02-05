from fastapi import APIRouter
from src.storage.memory import REQUESTS

router = APIRouter()

@router.get("/get-request-status")
def get_request_status(request_id: str):
    """
    Retrieve the status of a specific request by its ID.
    """
    request = REQUESTS.get(request_id)
    if not request:
        return {"error": "Request not found"}

    return {
        "request_id": request.request_id,
        "status": request.status,
        "progress": request.progress,
        "error": request.error,
        "result": request.result
    }
