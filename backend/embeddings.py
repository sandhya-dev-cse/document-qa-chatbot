from fastembed import TextEmbedding

_model = None


def get_model():
    global _model

    if _model is None:
        _model = TextEmbedding(
            model_name="BAAI/bge-small-en-v1.5"
        )

    return _model


def create_chunks(text, chunk_size=500, overlap=50):
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
    if not chunks:
        return []

    model = get_model()

    embeddings = model.embed(chunks)

    return [embedding.tolist() for embedding in embeddings]