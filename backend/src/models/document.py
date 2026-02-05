from pydantic import BaseModel

class Document(BaseModel):
    id: str
    filename: str
    indexed: bool = False
