from enum import Enum

class ProjectScope(str, Enum):
    ALL_DOCS = "ALL_DOCS"
    SELECTED_DOCS = "SELECTED_DOCS"

class ProjectStatus(str, Enum):
    CREATED = "CREATED"
    INDEXING = "INDEXING"
    READY = "READY"
    OUTDATED = "OUTDATED"

class AnswerStatus(str, Enum):
    PENDING = "PENDING"
    CONFIRMED = "CONFIRMED"
    REJECTED = "REJECTED"
    MANUAL_UPDATED = "MANUAL_UPDATED"
    MISSING_DATA = "MISSING_DATA"

class RequestStatus(str, Enum):
    QUEUED = "QUEUED"
    RUNNING = "RUNNING"
    COMPLETED = "COMPLETED"
    FAILED = "FAILED"
