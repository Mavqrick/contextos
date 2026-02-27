from sentence_transformers import SentenceTransformer
from functools import lru_cache

@lru_cache(maxsize=1)
def get_model():
    # Downloads once (~90MB), cached forever after
    return SentenceTransformer('all-MiniLM-L6-v2')

def embed_text(text: str) -> list[float]:
    model = get_model()
    embedding = model.encode(text, normalize_embeddings=True)
    return embedding.tolist()

def embed_batch(texts: list[str]) -> list[list[float]]:
    model = get_model()
    embeddings = model.encode(texts, normalize_embeddings=True, batch_size=32)
    return embeddings.tolist()