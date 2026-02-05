from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
from src.models.enums import ProjectScope, ProjectStatus

class CreateProjectRequest(BaseModel):
    name: str
    scope: ProjectScope

class Project(BaseModel):
    id: str
    name: str
    scope: ProjectScope
    status: ProjectStatus = ProjectStatus.CREATED
    document_ids: List[str] = []
    questionnaire_file_id: Optional[str] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None