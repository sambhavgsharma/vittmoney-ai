import faiss
import numpy as np

class VectorStore:
    def __init__(self, dim: int):
        self.index = faiss.IndexFlatL2(dim)
        self.metadata = []

    def add(self, vectors, meta):
        self.index.add(vectors)
        self.metadata.extend(meta)

    def search(self, vector, k=5):
        D, I = self.index.search(vector, k)
        return [self.metadata[i] for i in I[0]]
