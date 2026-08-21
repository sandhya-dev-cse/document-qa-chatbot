from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from database import client
from auth import router as auth_router
from documents import router as documents_router
from qa import router as qa_router
from search import router as search_router


app = FastAPI(title="Document Q&A Chatbot API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "https://document-qa-chatbot.vercel.app",
        "https://document-qa-chatbot-1mxx.vercel.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(documents_router)
app.include_router(search_router)
app.include_router(qa_router)


@app.get("/")
def root():
    return {
        "message": "Document Q&A Chatbot Backend is running"
    }


@app.get("/health")
def health():
    try:
        client.admin.command("ping")

        return {
            "status": "healthy",
            "database": "connected"
        }

    except Exception as e:
        return {
            "status": "unhealthy",
            "database": "disconnected",
            "error": str(e)
        }