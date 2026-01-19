from chromadb import Client
from chromadb.config import Settings
from app.vectorstore.embeddings import get_embedding_function
from typing import List, Dict, Any
from langchain_core.documents import Document as LangChainDocument
import logging

logger = logging.getLogger("chroma-client")

client = Client(Settings(
    persist_directory="./chroma_store",
    anonymized_telemetry=False
))

# Lazy initialization of collections
_rate_card_collection = None
_routing_collection = None

def get_rate_card_collection():
    """Get rate card collection with lazy initialization"""
    global _rate_card_collection
    if _rate_card_collection is None:
        _rate_card_collection = client.get_or_create_collection(
            name="rate_card",
            embedding_function=get_embedding_function()
        )
    return _rate_card_collection

def get_routing_collection():
    """Get routing collection with lazy initialization"""
    global _routing_collection
    if _routing_collection is None:
        _routing_collection = client.get_or_create_collection(
            name="routing_logic",
            embedding_function=get_embedding_function()
        )
    return _routing_collection

class ChromaClient:
    """Enhanced ChromaDB client for document storage"""
    
    def __init__(self):
        self.client = client
        self.embedding_function = get_embedding_function()
    
    async def add_documents(self, documents: List[LangChainDocument], collection_name: str):
        """Add documents to a ChromaDB collection"""
        try:
            collection = self.client.get_or_create_collection(
                name=collection_name,
                embedding_function=self.embedding_function
            )
            
            # Prepare documents for ChromaDB
            texts = [doc.page_content for doc in documents]
            metadatas = [doc.metadata for doc in documents]
            ids = [f"{collection_name}_{i}_{hash(doc.page_content) % 10000}" for i, doc in enumerate(documents)]
            
            # Add to collection
            collection.add(
                documents=texts,
                metadatas=metadatas,
                ids=ids
            )
            
            logger.info(f"Added {len(documents)} documents to collection '{collection_name}'")
            
        except Exception as e:
            logger.error(f"Error adding documents to ChromaDB: {e}")
            raise
    
    async def query_documents(self, query: str, collection_name: str, n_results: int = 5) -> List[Dict[str, Any]]:
        """Query documents from a ChromaDB collection"""
        try:
            collection = self.client.get_or_create_collection(
                name=collection_name,
                embedding_function=self.embedding_function
            )
            
            results = collection.query(
                query_texts=[query],
                n_results=n_results
            )
            
            return results
            
        except Exception as e:
            logger.error(f"Error querying ChromaDB: {e}")
            raise

# For backward compatibility
rate_card_collection = None  # Will be initialized when first accessed
routing_collection = None    # Will be initialized when first accessed
