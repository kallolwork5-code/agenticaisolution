"""
Storage Service for dual storage (SQLite + ChromaDB)
"""

import json
import uuid
from typing import Dict, Any, List
from datetime import datetime
from sqlalchemy.orm import Session
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain.schema import Document

from app.db.models import UploadedFile, ProcessedDocument
from app.vectorstore.chroma_client import get_collection
from app.services.websocket_service import WebSocketManager

class StorageService:
    """
    Service for storing data in SQLite (structured) and ChromaDB (unstructured/insights)
    """
    
    def __init__(self, db: Session):
        self.db = db
        self.text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=1000,
            chunk_overlap=200
        )
    
    async def store_data(
        self,
        file_id: str,
        file_name: str,
        file_size: int,
        processed_data: Dict[Any, Any],
        classification: Dict[str, Any],
        websocket_manager: WebSocketManager
    ) -> Dict[str, Any]:
        """
        Store data in appropriate storage based on classification
        """
        
        storage_decisions = {
            "transaction_data": "sqlite",
            "rate_card_data": "sqlite", 
            "routing_data": "sqlite",
            "customer_data": "sqlite",
            "document": "chromadb",
            "text_data": "chromadb"
        }
        
        data_type = classification.get("data_type", "document")
        primary_storage = storage_decisions.get(data_type, "chromadb")
        
        # Send storage decision thinking
        await websocket_manager.send_agent_thinking({
            "type": "decision",
            "content": f"Routing {data_type} to {primary_storage} for optimal storage and retrieval",
            "confidence": 0.95,
            "timestamp": datetime.now().isoformat(),
            "metadata": {
                "storageType": primary_storage,
                "dataType": data_type
            }
        })
        
        storage_result = {
            "primary_storage": primary_storage,
            "secondary_storage": None,
            "sqlite_id": None,
            "chromadb_ids": [],
            "record_count": 0
        }
        
        # Store in SQLite for structured data
        if primary_storage == "sqlite":
            sqlite_result = await self._store_in_sqlite(
                file_id, file_name, file_size, processed_data, classification, websocket_manager
            )
            storage_result.update(sqlite_result)
            
            # Also store metadata in ChromaDB for insights
            chromadb_result = await self._store_metadata_in_chromadb(
                file_id, file_name, processed_data, classification, websocket_manager
            )
            storage_result["secondary_storage"] = "chromadb"
            storage_result["chromadb_ids"] = chromadb_result["chromadb_ids"]
        
        # Store in ChromaDB for unstructured data
        else:
            chromadb_result = await self._store_in_chromadb(
                file_id, file_name, processed_data, classification, websocket_manager
            )
            storage_result.update(chromadb_result)
            
            # Store basic metadata in SQLite
            sqlite_result = await self._store_metadata_in_sqlite(
                file_id, file_name, file_size, classification, websocket_manager
            )
            storage_result["secondary_storage"] = "sqlite"
            storage_result["sqlite_id"] = sqlite_result["sqlite_id"]
        
        return storage_result
    
    async def _store_in_sqlite(
        self,
        file_id: str,
        file_name: str,
        file_size: int,
        processed_data: Dict[Any, Any],
        classification: Dict[str, Any],
        websocket_manager: WebSocketManager
    ) -> Dict[str, Any]:
        """
        Store structured data in SQLite
        """
        
        # Send progress update
        await websocket_manager.send_progress_update({
            "file_id": file_id,
            "stage": "store",
            "progress": 50,
            "message": "Storing structured data in SQLite database"
        })
        
        try:
            # Create upload record
            upload_record = UploadedFile(
                id=file_id,
                filename=file_name,
                file_size=file_size,
                file_type=classification.get("data_type", "unknown"),
                upload_date=datetime.utcnow(),
                classification_result=json.dumps(classification),
                storage_location="sqlite",
                record_count=processed_data.get("row_count", 0),
                processing_status="completed"
            )
            
            self.db.add(upload_record)
            
            # Store actual data records if it's tabular data
            if "data" in processed_data and isinstance(processed_data["data"], list):
                for i, record in enumerate(processed_data["data"]):
                    doc_record = ProcessedDocument(
                        id=str(uuid.uuid4()),
                        upload_id=file_id,
                        document_index=i,
                        content=json.dumps(record),
                        metadata=json.dumps({
                            "row_index": i,
                            "columns": processed_data.get("columns", []),
                            "data_type": classification.get("data_type")
                        }),
                        created_at=datetime.utcnow()
                    )
                    self.db.add(doc_record)
            
            self.db.commit()
            
            return {
                "sqlite_id": file_id,
                "record_count": processed_data.get("row_count", 0),
                "storage_type": "structured"
            }
            
        except Exception as e:
            self.db.rollback()
            raise Exception(f"SQLite storage error: {str(e)}")
    
    async def _store_in_chromadb(
        self,
        file_id: str,
        file_name: str,
        processed_data: Dict[Any, Any],
        classification: Dict[str, Any],
        websocket_manager: WebSocketManager
    ) -> Dict[str, Any]:
        """
        Store unstructured data in ChromaDB with chunking
        """
        
        # Send progress update
        await websocket_manager.send_progress_update({
            "file_id": file_id,
            "stage": "store",
            "progress": 50,
            "message": "Processing and storing data in ChromaDB for insights"
        })
        
        try:
            # Get appropriate collection based on data type
            collection_name = f"{classification.get('data_type', 'documents')}_collection"
            collection = get_collection(collection_name)
            
            documents = []
            metadatas = []
            ids = []
            
            # Process different data types
            if "content" in processed_data:
                # Text content - split into chunks
                chunks = self.text_splitter.split_text(processed_data["content"])
                for i, chunk in enumerate(chunks):
                    doc_id = f"{file_id}_chunk_{i}"
                    documents.append(chunk)
                    metadatas.append({
                        "file_id": file_id,
                        "file_name": file_name,
                        "chunk_index": i,
                        "data_type": classification.get("data_type"),
                        "classification_confidence": classification.get("confidence", 0),
                        "upload_date": datetime.utcnow().isoformat()
                    })
                    ids.append(doc_id)
            
            elif "data" in processed_data:
                # Structured data - convert to searchable text
                for i, record in enumerate(processed_data["data"][:100]):  # Limit for demo
                    doc_id = f"{file_id}_record_{i}"
                    # Convert record to searchable text
                    text_content = " ".join([f"{k}: {v}" for k, v in record.items() if v is not None])
                    documents.append(text_content)
                    metadatas.append({
                        "file_id": file_id,
                        "file_name": file_name,
                        "record_index": i,
                        "data_type": classification.get("data_type"),
                        "classification_confidence": classification.get("confidence", 0),
                        "upload_date": datetime.utcnow().isoformat(),
                        "original_record": json.dumps(record)
                    })
                    ids.append(doc_id)
            
            # Add to ChromaDB
            if documents:
                collection.add(
                    documents=documents,
                    metadatas=metadatas,
                    ids=ids
                )
            
            return {
                "chromadb_ids": ids,
                "record_count": len(documents),
                "storage_type": "vector",
                "collection": collection_name
            }
            
        except Exception as e:
            raise Exception(f"ChromaDB storage error: {str(e)}")
    
    async def _store_metadata_in_chromadb(
        self,
        file_id: str,
        file_name: str,
        processed_data: Dict[Any, Any],
        classification: Dict[str, Any],
        websocket_manager: WebSocketManager
    ) -> Dict[str, Any]:
        """
        Store metadata in ChromaDB for insights generation
        """
        
        try:
            collection = get_collection("metadata_collection")
            
            # Create summary document for insights
            summary_text = f"""
            File: {file_name}
            Type: {classification.get('data_type', 'unknown')}
            Records: {processed_data.get('row_count', 0)}
            Columns: {', '.join(processed_data.get('columns', []))}
            Classification Confidence: {classification.get('confidence', 0):.2f}
            Sample Data: {str(processed_data.get('sample_data', [])[:3])}
            """
            
            collection.add(
                documents=[summary_text],
                metadatas=[{
                    "file_id": file_id,
                    "file_name": file_name,
                    "data_type": classification.get("data_type"),
                    "record_count": processed_data.get("row_count", 0),
                    "upload_date": datetime.utcnow().isoformat(),
                    "type": "metadata_summary"
                }],
                ids=[f"{file_id}_metadata"]
            )
            
            return {"chromadb_ids": [f"{file_id}_metadata"]}
            
        except Exception as e:
            print(f"Metadata storage warning: {str(e)}")
            return {"chromadb_ids": []}
    
    async def _store_metadata_in_sqlite(
        self,
        file_id: str,
        file_name: str,
        file_size: int,
        classification: Dict[str, Any],
        websocket_manager: WebSocketManager
    ) -> Dict[str, Any]:
        """
        Store basic metadata in SQLite
        """
        
        try:
            upload_record = UploadedFile(
                id=file_id,
                filename=file_name,
                file_size=file_size,
                file_type=classification.get("data_type", "unknown"),
                upload_date=datetime.utcnow(),
                classification_result=json.dumps(classification),
                storage_location="chromadb",
                record_count=0,
                processing_status="completed"
            )
            
            self.db.add(upload_record)
            self.db.commit()
            
            return {"sqlite_id": file_id}
            
        except Exception as e:
            self.db.rollback()
            print(f"Metadata SQLite storage warning: {str(e)}")
            return {"sqlite_id": None}