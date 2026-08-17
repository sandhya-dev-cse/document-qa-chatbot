from sentence_transformers import SentenceTransformer

_model = None


def get_model():
    global _model

    if _model is None:
        _model = SentenceTransformer(
            "all-MiniLM-L6-v2",
            device="cpu"
        )

    return _model


def create_chunks(text, chunk_size=500, overlap=50):
    """
    Split document text into overlapping chunks.
    """

    words = text.split()
    chunks = []

    start = 0

    while start < len(words):
        end = start + chunk_size

        chunk = " ".join(words[start:end])

        if chunk.strip():
            chunks.append(chunk)

        start += chunk_size - overlap

    return chunks


def generate_embeddings(chunks):
    """
    Generate embeddings for document chunks.
    """

    if not chunks:
        return []

    model = get_model()

    embeddings = model.encode(
        chunks,
        normalize_embeddings=True,
        batch_size=16,
        show_progress_bar=False
    )

    return embeddings.tolist()