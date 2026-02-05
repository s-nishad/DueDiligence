from fastapi import APIRouter, BackgroundTasks
from src.models.project import CreateProjectRequest, Project
from src.models.enums import ProjectStatus
from src.storage.memory import PROJECTS
from src.utils.ids import get_id

router = APIRouter()


@router.post("/create-project")
def create_project(req: CreateProjectRequest):
    """
    Create a new project.
    """
    project_id = get_id()

    project = Project(
        id=project_id,
        name=req.name,
        scope=req.scope,
        status=ProjectStatus.CREATED
    )

    PROJECTS[project_id] = project

    return {
        "project_id": project_id,
        "status": project.status
    }


@router.post("/update-project-async")
def update_project(project_id: str, name: str | None = None):
    """
    Update project details asynchronously.
    """
    project = PROJECTS.get(project_id)
    if not project:
        return {"error": "Project not found"}

    if name:
        project.name = name

    project.status = ProjectStatus.OUTDATED
    return {"project_id": project_id, "status": project.status}


@router.get("/get-project-info")
def get_project_info(project_id: str):
    """
    Retrieve project information.
    """
    project = PROJECTS.get(project_id)
    if not project:
        return {"error": "Project not found"}
    return project


@router.get("/get-project-status")
def get_project_status(project_id: str):
    """
    Retrieve the status of a project.
    """
    project = PROJECTS.get(project_id)
    if not project:
        return {"error": "Project not found"}
    return {"project_id": project_id, "status": project.status}


@router.get("/list-projects")
def list_projects():
    """
    List all projects.
    """
    return [project.model_dump() for project in PROJECTS.values()]