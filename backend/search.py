from fastapi import APIRouter
from pydantic import BaseModel
from database import db
from embeddings import generate_embeddings

router = APIRouter(prefix="/search", tags=["Search"])


class SearchRequest(BaseModel):
    question: str


@router.post("/")
async def search_documents(request: SearchRequest):

    # Generate embedding for the user's question
    query_embeddings = generate_embeddings([request.question])
    query_embedding = query_embeddings[0]

    pipeline = [
        {
            "$vectorSearch": {
                "index": "vector_index",
                "path": "embedding",
                "queryVector": query_embedding,
                "numCandidates": 100,
                "limit": 5
            }
        },
        {
            "$project": {
                "_id": 1,
                "document_id": 1,
                "original_filename": 1,
                "chunk_index": 1,
                "text": 1,
                "score": {
                    "$meta": "vectorSearchScore"
                }
            }
        }
    ]

    results = list(
        db.document_chunks.aggregate(pipeline)
    )

    # Convert MongoDB ObjectIds to strings
    for result in results:
        if "_id" in result:
            result["_id"] = str(result["_id"])

        if "document_id" in result:
            result["document_id"] = str(result["document_id"])

    return {
        "question": request.question,
        "results": results
    }