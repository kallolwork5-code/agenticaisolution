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

embedding_function = ChromaEmbeddingFunction()
