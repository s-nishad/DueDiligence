from fastapi import APIRouter, UploadFile, HTTPException
from src.storage.memory import PROJECTS
from src.services.questionnaire_parser import parse_questionnaire
from src.storage.objects import save_file
import os

router = APIRouter()


@router.post("/parse")
def parse_questionnaire_file(file: UploadFile):
    """
    Parse a questionnaire file into structured sections and questions.
    Returns parsed questionnaire structure.
    """
    # Save file temporarily
    temp_path = save_file("temp", file)
    
    try:
        # Parse questionnaire
        parsed = parse_questionnaire(temp_path)
        
        return {
            "filename": file.filename,
            "sections": parsed
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to parse questionnaire: {str(e)}")
    finally:
        # Clean up temp file
        if os.path.exists(temp_path):
            os.remove(temp_path)


@router.get("/{project_id}")
def get_project_questionnaire(project_id: str):
    """
    Get parsed questionnaire for a project.
    """
    project = PROJECTS.get(project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    # In a real implementation, this would fetch from storage
    # For now, return placeholder
    return {
        "project_id": project_id,
        "sections": []
    }
