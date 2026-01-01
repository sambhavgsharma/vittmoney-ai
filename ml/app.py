from fastapi import FastAPI
from pydantic import BaseModel
from model import classify_expense
from embeddings import embed_texts
from typing import List

app = FastAPI(title="VittMoney NLP Service")

class ExpenseRequest(BaseModel):
    text: str

class ExpenseResponse(BaseModel):
    category: str
    confidence: float

class EmbedRequest(BaseModel):
    texts: List[str]

class EmbedResponse(BaseModel):
    embeddings: List[List[float]]

@app.post("/classify", response_model=ExpenseResponse)
def classify(req: ExpenseRequest):
    category, confidence = classify_expense(req.text)
    return {
        "category": category,
        "confidence": confidence
    }

@app.post("/embed", response_model=EmbedResponse)
def embed(req: EmbedRequest):
    """Get embeddings for multiple texts"""
    embeddings = embed_texts(req.texts)
    return {
        "embeddings": embeddings.tolist()
    }

@app.get("/health")
def health():
    return {"status": "healthy"}
