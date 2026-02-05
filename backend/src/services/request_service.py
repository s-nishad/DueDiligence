from datetime import datetime
from typing import Optional, Any
from src.models.request import Request
from src.models.enums import RequestStatus
from src.storage.memory import REQUESTS
from src.utils.ids import get_id


def create_request() -> str:
    """
    Create a new async request and return its ID.
    """
    request_id = get_id()

    REQUESTS[request_id] = Request(
        request_id=request_id,
        status=RequestStatus.QUEUED,
        progress=0.0,
        created_at=datetime.utcnow(),
        completed_at=None,
        error=None,
        result=None
    )

    return request_id


def update_request_status(
    request_id: str,
    status: RequestStatus,
    progress: Optional[float] = None,
    error: Optional[str] = None,
    result: Optional[dict[str, Any]] = None
):
    """
    Update the status of an async request.
    """
    request = REQUESTS.get(request_id)
    if not request:
        return  # skeleton: silently ignore

    request.status = status

    if progress is not None:
        request.progress = progress

    if error is not None:
        request.error = error

    if result is not None:
        request.result = result

    if status in (RequestStatus.COMPLETED, RequestStatus.FAILED):
        request.completed_at = datetime.utcnow()

    REQUESTS[request_id] = request
