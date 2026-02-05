from pydantic import BaseModel

class CompareAnswerRequest(BaseModel):
    answer_id: str
    human_answer: str


class EvaluateProjectRequest(BaseModel):
    project_id: str
    human_answers: dict[str, str]  # question_id -> human_answer