from uuid import uuid4
from app.vectorstore.chroma_client import (
    rate_card_collection,
    routing_collection,
)
from app.utils.data_cleaning import row_to_text

BATCH_SIZE = 32  # safe for OpenAI


def _batch_add(collection, texts, metadatas):
    ids = [str(uuid4()) for _ in texts]
    collection.add(
        documents=texts,
        metadatas=metadatas,
        ids=ids,
    )


def ingest_rate_card(df):
    texts, metadatas = [], []

    for _, row in df.iterrows():
        row_dict = row.to_dict()
        text = row_to_text(row_dict)
        if not text:
            continue

        texts.append(text)
        metadatas.append(row_dict)

        if len(texts) >= BATCH_SIZE:
            _batch_add(rate_card_collection, texts, metadatas)
            texts, metadatas = [], []

    if texts:
        _batch_add(rate_card_collection, texts, metadatas)


def ingest_routing_logic(df):
    texts, metadatas = [], []

    for _, row in df.iterrows():
        row_dict = row.to_dict()
        text = row_to_text(row_dict)
        if not text:
            continue

        texts.append(text)
        metadatas.append(row_dict)

        if len(texts) >= BATCH_SIZE:
            _batch_add(routing_collection, texts, metadatas)
            texts, metadatas = [], []

    if texts:
        _batch_add(routing_collection, texts, metadatas)
