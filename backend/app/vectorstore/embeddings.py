from typing import Union, List
from sentence_transformers import SentenceTransformer

class ChromaEmbeddingFunction:
    def __init__(self):
        self.model = SentenceTransformer("all-MiniLM-L6-v2")

    def __call__(self, input: Union[str, List[str]]):
        if isinstance(input, str):
            input = [input]
        return self.model.encode(input).tolist()

    def name(self) -> str:
        return "sentence-transformers-all-MiniLM-L6-v2"

# Lazy initialization of embedding function
_embedding_function = None

def get_embedding_function():
    """Get embedding function with lazy initialization"""
    global _embedding_function
    if _embedding_function is None:
        _embedding_function = ChromaEmbeddingFunction()
    return _embedding_function

# For backward compatibility
embedding_function = None  # Will be initialized when first accessed
