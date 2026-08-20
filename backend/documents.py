from fastapi import APIRouter, UploadFile, File, HTTPException
from database import db
from datetime import datetime, timezone
from pypdf import PdfReader
from embeddings import create_chunks, generate_embeddings
import os
import uuid

router = APIRouter(prefix="/documents", tags=["Documents"])

UPLOAD_DIR = "uploads"

os.makedirs(UPLOAD_DIR, exist_ok=True)


# =========================
# GET ALL DOCUMENTS
# =========================

@router.get("/")
def get_documents():

    documents = list(
        db.documents.find(
            {},
            {
                "extracted_text": 0,
                "chunks": 0,
                "embeddings": 0
            }
        ).sort("created_at", -1)
    )

    result = []

    for document in documents:
        result.append({
            "id": str(document["_id"]),
            "filename": document["original_filename"],
            "content_type": document["content_type"],
            "size": document["size"],
            "created_at": document["created_at"].isoformat()
        })

    return {
        "documents": result
    }


# =========================
# GET SINGLE DOCUMENT
# =========================

@router.get("/{document_id}")
def get_document(document_id: str):

    from bson import ObjectId

    try:
        object_id = ObjectId(document_id)
    except Exception:
        raise HTTPException(
            status_code=400,
            detail="Invalid document ID"
        )

    document = db.documents.find_one(
        {"_id": object_id},
        {
            "extracted_text": 0,
            "chunks": 0,
            "embeddings": 0
        }
    )

    if not document:
        raise HTTPException(
            status_code=404,
            detail="Document not found"
        )

    return {
        "id": str(document["_id"]),
        "filename": document["original_filename"],
        "content_type": document["content_type"],
        "size": document["size"],
        "created_at": document["created_at"].isoformat()
    }


# =========================
# UPLOAD DOCUMENT
# =========================

@router.post("/upload")
async def upload_document(file: UploadFile = File(...)):

    allowed_types = [
        "application/pdf",
        "text/plain",
    ]

    if file.content_type not in allowed_types:
        raise HTTPException(
            status_code=400,
            detail="Only PDF and TXT files are supported."
        )

    file_extension = os.path.splitext(file.filename)[1]

    saved_filename = f"{uuid.uuid4()}{file_extension}"

    file_path = os.path.join(
        UPLOAD_DIR,
        saved_filename
    )

    content = await file.read()

    with open(file_path, "wb") as buffer:
        buffer.write(content)

    # Extract text
    extracted_text = ""

    if file.content_type == "application/pdf":

        try:
            reader = PdfReader(file_path)

            for page in reader.pages:

                text = page.extract_text()

                if text:
                    extracted_text += text + "\n"

        except Exception as e:

            raise HTTPException(
                status_code=500,
                detail=f"Failed to extract PDF text: {str(e)}"
            )

    elif file.content_type == "text/plain":

        extracted_text = content.decode(
            "utf-8",
            errors="ignore"
        )

    # Create chunks
    chunks = create_chunks(extracted_text)

    if not chunks:
        raise HTTPException(
            status_code=400,
            detail="No readable text found in the document."
        )

    # Generate embeddings
    embeddings = generate_embeddings(chunks)

    # Save document
    document = {
        "original_filename": file.filename,
        "saved_filename": saved_filename,
        "file_path": file_path,
        "content_type": file.content_type,
        "size": len(content),
        "extracted_text": extracted_text,
        "chunks": chunks,
        "embeddings": embeddings,
        "created_at": datetime.now(timezone.utc)
    }

    result = db.documents.insert_one(document)

    # Store chunks for vector search
    chunk_documents = []

    for i, chunk in enumerate(chunks):

        chunk_documents.append({
            "document_id": result.inserted_id,
            "original_filename": file.filename,
            "chunk_index": i,
            "text": chunk,
            "embedding": embeddings[i]
        })

    if chunk_documents:
        db.document_chunks.insert_many(chunk_documents)

    return {
        "message": "Document uploaded successfully",
        "document_id": str(result.inserted_id),
        "filename": file.filename,
        "chunks_created": len(chunks),
        "embedding_size": len(embeddings[0]) if embeddings else 0
    }