from fastapi import APIRouter
from pydantic import BaseModel
from app.vectorstore.chroma_client import (
    rate_card_collection,
    routing_collection
)
from app.llm.factory import get_llm

router = APIRouter()
llm = get_llm()


class InsightRequest(BaseModel):
    query: str


@router.post("/insights")
def generate_insight(req: InsightRequest):
    query = req.query.lower()

    # 1. Decide which data to search
    collections = []

    if "route" in query:
        collections.append(routing_collection)

    if "rate" in query or "mdr" in query or "sla" in query:
        collections.append(rate_card_collection)

    # Fallback: search everything
    if not collections:
        collections = [routing_collection, rate_card_collection]

    # 2. Retrieve documents
    docs = []
    for col in collections:
        result = col.query(
            query_texts=[req.query],
            n_results=5
        )
        docs.extend(result["documents"][0])

    # 3. Build context
    context = "\n".join(f"- {d}" for d in docs)

    # 4. Ask LLM
    prompt = f"""
You are a payments domain expert.

Using ONLY the information below, answer the question.

Context:
{context}

Question:
{req.query}

Provide a clear, business-friendly explanation.
"""

    answer = llm.generate(prompt)

    return {
        "query": req.query,
        "answer": answer,
        "sources": docs
    }
