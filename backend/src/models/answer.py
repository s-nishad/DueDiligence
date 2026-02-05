from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
from src.models.enums import AnswerStatus

class Citation(BaseModel):
    document_id: str
    document_name: str
    chunk_text: str
    page_number: Optional[int] = None
    bounding_box: Optional[dict] = None

class Answer(BaseModel):
    id: Optional[str] = None
    question_id: str
    project_id: str
    answer_text: str  # AI-generated answer
    answerable: bool  # Can this be answered?
    confidence: float  # 0.0 to 1.0
    citations: List[Citation]
    status: AnswerStatus = AnswerStatus.PENDING
    manual_answer: Optional[str] = None  # Human override
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
