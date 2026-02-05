"""
Questionnaire Parsing Service

Responsible for parsing questionnaire files (e.g. ILPA PDF)
into structured sections and ordered questions.
"""

def parse_questionnaire(file_path: str):
    """
    Expected output format:
    [
        {
            "section": "General Information",
            "order": 1,
            "questions": [
                {"id": "q1", "text": "What is the legal name of the company?"},
                {"id": "q2", "text": "When was the company founded?"}
            ]
        }
    ]
    """

    # TODO:
    # - Extract text from questionnaire PDF
    # - Identify sections
    # - Extract ordered questions
    # - Normalize into structured schema

    return [
        {
            "section": "Sample Section",
            "order": 1,
            "questions": [
                {
                    "id": "q1",
                    "text": "Sample parsed question from questionnaire"
                }
            ]
        }
    ]
