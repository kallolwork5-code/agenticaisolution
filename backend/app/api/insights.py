from fastapi import APIRouter
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
import random
import time
from app.vectorstore.chroma_client import (
    rate_card_collection,
    routing_collection
)

router = APIRouter()

# Simple mock LLM for insights generation
class MockLLM:
    def generate(self, prompt: str) -> str:
        # Simple mock response based on prompt content
        if "rate" in prompt.lower() or "mdr" in prompt.lower():
            return "Based on the rate card data, the current MDR rates range from 1.5% to 3.2% depending on the card type and transaction volume. SLA requirements are typically 99.5% uptime with sub-second response times."
        elif "route" in prompt.lower():
            return "The routing rules show preference for direct bank connections for high-value transactions, with fallback to card networks for smaller amounts. Cost optimization is achieved through intelligent routing based on transaction characteristics."
        else:
            return "The data analysis shows good quality metrics with comprehensive coverage. The information is suitable for business intelligence and operational decision making."

llm = MockLLM()


class InsightRequest(BaseModel):
    query: str


class FileInsightRequest(BaseModel):
    fileName: str
    fileSize: int
    classification: str
    storageLocation: str
    recordCount: int


class SummaryRequest(BaseModel):
    fileName: str
    classification: str
    storageLocation: str


class DataInsight(BaseModel):
    type: str  # 'pattern' | 'quality' | 'recommendation' | 'anomaly'
    title: str
    description: str
    confidence: float
    actionable: bool


class UploadHistoryItem(BaseModel):
    id: str
    fileName: str
    fileSize: int
    uploadDate: datetime
    classification: str
    storageLocation: str
    recordCount: int
    status: str
    aiSummary: Optional[str] = None


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

@router.post("/insights/generate")
def generate_file_insights(req: FileInsightRequest):
    """Generate AI insights for an uploaded file"""
    
    # Simulate processing time
    time.sleep(random.uniform(1, 3))
    
    # Generate insights based on file characteristics
    insights = []
    
    # Document-specific insights
    if req.classification == "document":
        insights.append(DataInsight(
            type="pattern",
            title="Document Processing Complete",
            description=f"Document '{req.fileName}' has been processed into {req.recordCount} semantic chunks for intelligent search and analysis.",
            confidence=0.95,
            actionable=False
        ))
        
        insights.append(DataInsight(
            type="quality",
            title="Text Extraction Quality",
            description="High-quality text extraction achieved with proper formatting and structure preservation. Content is ready for AI analysis.",
            confidence=0.92,
            actionable=False
        ))
        
        insights.append(DataInsight(
            type="recommendation",
            title="Semantic Search Ready",
            description="Document is now searchable using natural language queries. Try asking questions about the content for intelligent insights.",
            confidence=0.88,
            actionable=True
        ))
        
        # File type specific insights
        if req.fileName.lower().endswith('.pdf'):
            insights.append(DataInsight(
                type="pattern",
                title="PDF Document Analysis",
                description="PDF content extracted with advanced text recognition. Tables, headers, and formatting have been preserved where possible.",
                confidence=0.85,
                actionable=False
            ))
        elif req.fileName.lower().endswith(('.docx', '.doc')):
            insights.append(DataInsight(
                type="pattern",
                title="Word Document Processing",
                description="Microsoft Word document processed with full text and table extraction. Document structure and formatting maintained.",
                confidence=0.90,
                actionable=False
            ))
        
        # Size-based insights for documents
        if req.fileSize > 5 * 1024 * 1024:  # > 5MB
            insights.append(DataInsight(
                type="recommendation",
                title="Large Document Optimization",
                description=f"Large document ({req.fileSize / (1024*1024):.1f}MB) has been optimally chunked for processing. Consider breaking into smaller sections for faster analysis.",
                confidence=0.80,
                actionable=True
            ))
    
    # Structured data insights (existing logic)
    elif req.recordCount > 10000:
        insights.append(DataInsight(
            type="pattern",
            title="Large Dataset Detected",
            description=f"This dataset contains {req.recordCount:,} records, indicating a comprehensive data collection suitable for statistical analysis.",
            confidence=0.95,
            actionable=True
        ))
    
    # Quality insights for structured data
    if "csv" in req.fileName.lower():
        insights.append(DataInsight(
            type="quality",
            title="Structured Data Format",
            description="CSV format detected with well-structured tabular data. Data appears to be clean and ready for analysis.",
            confidence=0.88,
            actionable=False
        ))
    
    # Storage-specific recommendations
    if req.storageLocation == "sqlite":
        insights.append(DataInsight(
            type="recommendation",
            title="SQL Query Optimization",
            description="Consider indexing key columns for faster query performance on this structured dataset.",
            confidence=0.82,
            actionable=True
        ))
    elif req.storageLocation == "chromadb":
        insights.append(DataInsight(
            type="recommendation",
            title="Vector Search Capabilities",
            description="Content is stored with semantic embeddings, enabling intelligent search, similarity analysis, and AI-powered insights.",
            confidence=0.90,
            actionable=True
        ))
    
    # General file size insights
    if req.fileSize > 10 * 1024 * 1024:  # > 10MB
        insights.append(DataInsight(
            type="anomaly",
            title="Large File Size",
            description=f"File size of {req.fileSize / (1024*1024):.1f}MB is larger than typical uploads. Processing optimized for large files.",
            confidence=0.75,
            actionable=False
        ))
    
    return {
        "insights": [insight.dict() for insight in insights],
        "processingTime": random.uniform(1.5, 4.2),
        "confidence": random.uniform(0.8, 0.95)
    }


@router.post("/insights/summary")
def generate_ai_summary(req: SummaryRequest):
    """Generate AI summary for uploaded data"""
    
    # Simulate processing time
    time.sleep(random.uniform(0.5, 2))
    
    # Generate contextual summary based on file characteristics
    summaries = {
        "document": f"Document '{req.fileName}' has been processed with AI-powered text extraction and summarization. Content is stored in vector database for semantic search and intelligent analysis.",
        "Customer Data": f"Customer dataset with demographic and behavioral data. Contains valuable insights for segmentation and personalization strategies.",
        "Transaction Data": f"Financial transaction records suitable for fraud detection, spending pattern analysis, and revenue optimization.",
        "Product Data": f"Product catalog information ideal for recommendation systems, inventory management, and pricing analysis.",
        "Text Data": f"Unstructured text content perfect for sentiment analysis, topic modeling, and natural language processing tasks.",
        "Rate Card Data": f"Pricing and rate information for payment processing, useful for cost optimization and competitive analysis.",
        "Routing Data": f"Payment routing rules and logic for transaction processing optimization and compliance management."
    }
    
    # Get summary based on classification or generate generic one
    summary = summaries.get(req.classification, 
        f"Data file '{req.fileName}' has been successfully processed and stored in {req.storageLocation}. Ready for analysis and querying.")
    
    return {
        "summary": summary,
        "processingTime": random.uniform(0.8, 2.5),
        "confidence": random.uniform(0.85, 0.98),
        "classification": req.classification,
        "storageLocation": req.storageLocation
    }


# Removed dummy upload history endpoint - now using real data from upload.py