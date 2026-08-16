import os

from fastapi import APIRouter
from pydantic import BaseModel
from groq import Groq

from database import db
from embeddings import generate_embeddings


router = APIRouter(prefix="/qa", tags=["Q&A"])

client = Groq(api_key=os.getenv("GROQ_API_KEY"))


class QuestionRequest(BaseModel):
    question: str


@router.post("/")
async def ask_question(request: QuestionRequest):

    # 1. Convert the user's question into an embedding
    query_embeddings = generate_embeddings([request.question])
    query_embedding = query_embeddings[0]

    # 2. Search MongoDB for the most relevant document chunks
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
                "_id": 0,
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

    # 3. Check whether relevant content was found
    if not results:
        return {
            "question": request.question,
            "answer": "I could not find relevant information in the uploaded documents.",
            "sources": []
        }

    # 4. Combine the retrieved chunks
    context = "\n\n".join(
        result["text"]
        for result in results
        if result.get("text")
    )

    # 5. Ask Groq to answer using only the retrieved context
    prompt = f"""
You are a document question-answering assistant.

Answer the user's question using ONLY the information provided
in the document context below.

If the answer cannot be found in the context, say:
"I could not find the answer in the uploaded document."

Do not make up information.

Document context:
{context}

User question:
{request.question}
"""

    # 6. Generate the final answer
    response = client.chat.completions.create(
        model="llama-3.1-8b-instant",
        messages=[
            {
                "role": "user",
                "content": prompt
            }
        ],
        temperature=0
    )

    answer = response.choices[0].message.content

    # 7. Return answer + source information
    sources = []

    for result in results:
        sources.append({
            "filename": result.get("original_filename"),
            "chunk_index": result.get("chunk_index"),
            "score": result.get("score")
        })

    return {
        "question": request.question,
        "answer": answer,
        "sources": sources
    }