from sentence_transformers import SentenceTransformer

# Lazy load model - only loads when needed
_model = None

def get_model():
    """Lazily load the embedding model on first use"""
    global _model
    if _model is None:
        print("Loading SentenceTransformer model (first request)...")
        _model = SentenceTransformer("all-MiniLM-L6-v2")
        print("✅ Embedding model loaded!")
    return _model

def embed_texts(texts: list[str]):
    """Get embeddings for multiple texts"""
    model = get_model()
    return model.encode(texts, convert_to_numpy=True)