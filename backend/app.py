from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from src.api.router import api_router

app = FastAPI(title="Questionnaire Agent API")

# Allow all origins, methods, and headers
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix="/api")


@app.get("/health")
def health_check() -> dict:
    return {"status": "ok"}
