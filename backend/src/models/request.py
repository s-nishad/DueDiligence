from pydantic import BaseModel
from datetime import datetime
from typing import Optional, Any
from src.models.enums import RequestStatus

class Request(BaseModel):
    request_id: str
    status: RequestStatus
    progress: Optional[float] = None  # 0.0 to 100.0
    error: Optional[str] = None
    result: Optional[dict[str, Any]] = None
    created_at: datetime
    completed_at: Optional[datetime] = None