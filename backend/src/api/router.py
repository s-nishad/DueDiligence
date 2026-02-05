from fastapi import APIRouter
from src.api import project, document, answer, request, evaluation, questionnaire

api_router = APIRouter()

api_router.include_router(project.router, prefix="/projects", tags=["Projects"])
api_router.include_router(document.router, prefix="/documents", tags=["Documents"])
api_router.include_router(answer.router, prefix="/answers", tags=["Answers"])
api_router.include_router(request.router, prefix="/requests", tags=["Requests"])
api_router.include_router(evaluation.router, prefix="/evaluation", tags=["Evaluation"])
api_router.include_router(questionnaire.router, prefix="/questionnaire", tags=["Questionnaire"])