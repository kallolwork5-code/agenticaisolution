from chromadb import Client
from chromadb.config import Settings
from app.vectorstore.embeddings import get_embedding_function

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

# For backward compatibility
rate_card_collection = None  # Will be initialized when first accessed
routing_collection = None    # Will be initialized when first accessed
