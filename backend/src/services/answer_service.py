from src.storage.vector import VectorStore
from src.utils.ids import get_id
from src.models.enums import AnswerStatus
from datetime import datetime
# from langchain.chat_models import ChatOpenAI
# from src.storage.vector_store import vector_store
# llm = ChatOpenAI(temperature=0)


def generate_single_answer(project_id: str, question: str, question_id: str = None) -> dict:
    # TODO: replace with real embedding + retrieval
    hits = VectorStore.search(project_id, [0.0] * 768)

    # Determine if answer is possible based on retrieved documents
    answerable = len(hits) > 0
    
    # If no documents found, return answerable=False
    if not answerable:
        return {
            "id": get_id(),
            "question_id": question_id or get_id(),
            "project_id": project_id,
            "question": question,
            "answer_text": "No relevant documents found to answer this question.",
            "answerable": False,
            "confidence": 0.0,
            "citations": [],
            "status": AnswerStatus.MISSING_DATA,
            "manual_answer": None,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow(),
        }

    # docs = hits
    # context = "\n".join(d.page_content for d in docs)
    # citation = docs[0].metadata["source"]

    # prompt = f"""
    # Answer the question using the context below.
    # Return a short, factual answer.

    # Context:
    # {context}

    # Question:
    # {question}
    # """

    # response = llm.predict(prompt)

    # confidence = round(min(1.0, 0.6 + len(docs) * 0.1), 2)
    
    # Format citations properly
    formatted_citations = []
    for hit in hits:
        citation = {
            "document_id": hit.get("metadata", {}).get("source", "unknown"),
            "document_name": hit.get("metadata", {}).get("source", "unknown"),
            "chunk_text": hit.get("chunk", ""),
            "page_number": hit.get("metadata", {}).get("page_number"),
            "bounding_box": hit.get("metadata", {}).get("bounding_box"),
        }
        formatted_citations.append(citation)

    return {
        "id": get_id(),
        "question_id": question_id or get_id(),
        "project_id": project_id,
        "question": question,
        "answer_text": "Answer generated from documents.",
        "answerable": True,
        "confidence": 0.82,
        "citations": formatted_citations,
        "status": AnswerStatus.PENDING,
        "manual_answer": None,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow(),
    }



def generate_all_answers(project_id: str, questions: list[str]) -> list[dict]:
    answers = []

    for q in questions:
        answers.append(generate_single_answer(project_id, q))

    return answers


def update_answer(answer: dict, status: AnswerStatus, manual_text: str | None = None) -> dict:
    from datetime import datetime
    
    answer["status"] = status
    answer["updated_at"] = datetime.utcnow()

    if manual_text:
        answer["manual_answer"] = manual_text
        # Preserve AI answer in answer_text, manual override in manual_answer

    return answer
