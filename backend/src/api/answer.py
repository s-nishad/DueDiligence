from fastapi import APIRouter, HTTPException

from src.storage.memory import ANSWERS
from src.models.enums import AnswerStatus
from src.services.answer_service import (
    generate_single_answer,
    generate_all_answers,
    update_answer,
)

router = APIRouter()

@router.post("/generate-single-answer")
def generate_single_answer_endpoint(project_id: str, question: str):
    """
    Generate an answer for a single question within a project.
    """
    answer = generate_single_answer(project_id, question)

    ANSWERS[answer["id"]] = answer
    return answer


@router.post("/generate-all-answers")
def generate_all_answers_endpoint(project_id: str, questions: list[str]):
    """
    Generate answers for a list of questions within a project.
    """
    answers = generate_all_answers(project_id, questions)

    for answer in answers:
        ANSWERS[answer["id"]] = answer

    return {
        "project_id": project_id,
        "answers": answers,
    }


@router.post("/update-answer")
def update_answer_endpoint(answer_id: str, status: AnswerStatus, manual_text: str | None = None):
    answer = ANSWERS.get(answer_id)
    if not answer:
        raise HTTPException(status_code=404, detail="Answer not found")

    updated = update_answer(answer, status, manual_text)
    ANSWERS[answer_id] = updated
    return updated
