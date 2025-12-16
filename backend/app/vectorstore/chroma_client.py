from chromadb import Client
from chromadb.config import Settings
from app.vectorstore.embeddings import embedding_function

client = Client(Settings(
    persist_directory="./chroma_store",
    anonymized_telemetry=False
))

rate_card_collection = client.get_or_create_collection(
    name="rate_card",
    embedding_function=embedding_function
)

routing_collection = client.get_or_create_collection(
    name="routing_logic",
    embedding_function=embedding_function
)
