"""
Deduplication Service for preventing duplicate data ingestion

This service provides:
- File-level duplicate detection (by hash)
- Record-level duplicate detection (by content)
- Configurable deduplication strategies
- Audit trail for duplicate handling decisions
"""

import hashlib
import pandas as pd
from typing import Dict, List, Optional, Tuple, Any
from sqlalchemy.orm import Session
from sqlalchemy import text
import logging
from datetime import datetime, timezone

from app.models.file_upload import UploadedFile
from app.models.user import User

logger = logging.getLogger(__name__)

class DeduplicationService:
    """Service for handling data deduplication across the system"""
    
    def __init__(self, db: Session):
        self.db = db
    
    def check_file_duplicate(self, file_hash: str, filename: str) -> Optional[UploadedFile]:
        """
        Check if a file with the same hash already exists
        
        Args:
            file_hash: SHA256 hash of the file content
            filename: Original filename for additional context
            
        Returns:
            UploadedFile if duplicate found, None otherwise
        """
        logger.info(f"Checking for file duplicate: {filename} (hash: {file_hash[:16]}...)")
        
        existing_file = self.db.query(UploadedFile).filter(
            UploadedFile.file_hash == file_hash
        ).first()
        
        if existing_file:
            logger.warning(f"Duplicate file detected: {existing_file.filename} uploaded at {existing_file.uploaded_at}")
            return existing_file
        
        logger.info("No file duplicate found")
        return None
    
    def check_record_duplicates(self, df: pd.DataFrame, table_name: str, 
                              key_columns: List[str] = None) -> Dict[str, Any]:
        """
        Check for record-level duplicates against existing database data
        
        Args:
            df: DataFrame containing new records
            table_name: Target database table name
            key_columns: Columns to use for duplicate detection (if None, uses all columns)
            
        Returns:
            Dictionary with duplicate analysis results
        """
        logger.info(f"Checking record duplicates for table: {table_name}")
        
        if df.empty:
            return {
                "total_records": 0,
                "duplicates_found": 0,
                "new_records": 0,
                "duplicate_records": [],
                "strategy": "no_data"
            }
        
        # If no key columns specified, use all columns for comparison
        if key_columns is None:
            key_columns = list(df.columns)
        
        # Check internal duplicates first
        internal_duplicates = df.duplicated(subset=key_columns, keep='first')
        internal_dup_count = internal_duplicates.sum()
        
        logger.info(f"Found {internal_dup_count} internal duplicates in uploaded data")
        
        # Check against existing database records
        external_duplicates = self._check_external_duplicates(df, table_name, key_columns)
        
        # Combine results
        total_duplicates = internal_dup_count + len(external_duplicates)
        new_records = len(df) - total_duplicates
        
        result = {
            "total_records": len(df),
            "internal_duplicates": int(internal_dup_count),
            "external_duplicates": len(external_duplicates),
            "total_duplicates": total_duplicates,
            "new_records": max(0, new_records),
            "duplicate_records": external_duplicates,
            "key_columns": key_columns,
            "strategy": self._determine_strategy(total_duplicates, len(df))
        }
        
        logger.info(f"Duplicate analysis complete: {result['new_records']} new records, {total_duplicates} duplicates")
        return result
    
    def _check_external_duplicates(self, df: pd.DataFrame, table_name: str, 
                                 key_columns: List[str]) -> List[Dict]:
        """Check for duplicates against existing database records"""
        
        try:
            # Build a query to check for existing records
            # This is a simplified version - in production, you'd want more sophisticated matching
            
            if table_name == "acquirer_transactions":
                return self._check_transaction_duplicates(df, key_columns)
            elif table_name == "rate_cards":
                return self._check_rate_card_duplicates(df, key_columns)
            elif table_name == "routing_rules":
                return self._check_routing_duplicates(df, key_columns)
            else:
                logger.warning(f"No duplicate checking implemented for table: {table_name}")
                return []
                
        except Exception as e:
            logger.error(f"Error checking external duplicates: {e}")
            return []
    
    def _check_transaction_duplicates(self, df: pd.DataFrame, key_columns: List[str]) -> List[Dict]:
        """Check for duplicate transactions"""
        
        duplicates = []
        
        # Key fields for transaction uniqueness
        transaction_keys = ['acquirer_name', 'transaction_date', 'transaction_amount', 'terminal_id']
        available_keys = [col for col in transaction_keys if col in df.columns]
        
        if not available_keys:
            logger.warning("No key columns available for transaction duplicate checking")
            return duplicates
        
        try:
            # Check each row against existing transactions
            for idx, row in df.iterrows():
                # Build WHERE clause for matching
                conditions = []
                params = {}
                
                for key in available_keys:
                    if pd.notna(row[key]):
                        conditions.append(f"{key} = :{key}")
                        params[key] = row[key]
                
                if conditions:
                    query = f"SELECT COUNT(*) as count FROM acquirer_transactions WHERE {' AND '.join(conditions)}"
                    result = self.db.execute(text(query), params).fetchone()
                    
                    if result and result.count > 0:
                        duplicates.append({
                            "row_index": idx,
                            "matching_fields": available_keys,
                            "existing_count": result.count
                        })
                        
        except Exception as e:
            logger.error(f"Error checking transaction duplicates: {e}")
        
        return duplicates
    
    def _check_rate_card_duplicates(self, df: pd.DataFrame, key_columns: List[str]) -> List[Dict]:
        """Check for duplicate rate cards"""
        
        duplicates = []
        
        # Key fields for rate card uniqueness
        rate_card_keys = ['acquirer', 'terminal_id', 'payment_mode', 'card_classification']
        available_keys = [col for col in rate_card_keys if col in df.columns]
        
        if not available_keys:
            return duplicates
        
        try:
            for idx, row in df.iterrows():
                conditions = []
                params = {}
                
                for key in available_keys:
                    if pd.notna(row[key]):
                        conditions.append(f"{key} = :{key}")
                        params[key] = row[key]
                
                if conditions:
                    query = f"SELECT COUNT(*) as count FROM rate_cards WHERE {' AND '.join(conditions)}"
                    result = self.db.execute(text(query), params).fetchone()
                    
                    if result and result.count > 0:
                        duplicates.append({
                            "row_index": idx,
                            "matching_fields": available_keys,
                            "existing_count": result.count
                        })
                        
        except Exception as e:
            logger.error(f"Error checking rate card duplicates: {e}")
        
        return duplicates
    
    def _check_routing_duplicates(self, df: pd.DataFrame, key_columns: List[str]) -> List[Dict]:
        """Check for duplicate routing rules"""
        
        duplicates = []
        
        # Key fields for routing rule uniqueness
        routing_keys = ['terminal_id', 'payment_method', 'card_classification', 'network']
        available_keys = [col for col in routing_keys if col in df.columns]
        
        if not available_keys:
            return duplicates
        
        try:
            for idx, row in df.iterrows():
                conditions = []
                params = {}
                
                for key in available_keys:
                    if pd.notna(row[key]):
                        conditions.append(f"{key} = :{key}")
                        params[key] = row[key]
                
                if conditions:
                    query = f"SELECT COUNT(*) as count FROM routing_rules WHERE {' AND '.join(conditions)}"
                    result = self.db.execute(text(query), params).fetchone()
                    
                    if result and result.count > 0:
                        duplicates.append({
                            "row_index": idx,
                            "matching_fields": available_keys,
                            "existing_count": result.count
                        })
                        
        except Exception as e:
            logger.error(f"Error checking routing duplicates: {e}")
        
        return duplicates
    
    def _determine_strategy(self, duplicate_count: int, total_count: int) -> str:
        """Determine the appropriate deduplication strategy"""
        
        if duplicate_count == 0:
            return "insert_all"
        elif duplicate_count == total_count:
            return "skip_all"
        elif duplicate_count < total_count * 0.1:  # Less than 10% duplicates
            return "insert_new"
        elif duplicate_count < total_count * 0.5:  # Less than 50% duplicates
            return "insert_new_warn"
        else:  # More than 50% duplicates
            return "review_required"
    
    def remove_duplicates(self, df: pd.DataFrame, duplicate_info: Dict[str, Any], 
                         strategy: str = "auto") -> Tuple[pd.DataFrame, Dict[str, Any]]:
        """
        Remove duplicates from DataFrame based on strategy
        
        Args:
            df: Original DataFrame
            duplicate_info: Results from duplicate checking
            strategy: Deduplication strategy ("auto", "keep_first", "keep_last", "remove_all")
            
        Returns:
            Tuple of (cleaned_dataframe, removal_stats)
        """
        
        if df.empty:
            return df, {"removed": 0, "kept": 0}
        
        original_count = len(df)
        
        # Remove internal duplicates first
        if duplicate_info.get("internal_duplicates", 0) > 0:
            key_columns = duplicate_info.get("key_columns", list(df.columns))
            
            if strategy == "keep_last":
                df_cleaned = df.drop_duplicates(subset=key_columns, keep='last')
            else:  # Default to keep_first
                df_cleaned = df.drop_duplicates(subset=key_columns, keep='first')
        else:
            df_cleaned = df.copy()
        
        # Remove external duplicates (records that exist in database)
        external_duplicates = duplicate_info.get("duplicate_records", [])
        if external_duplicates:
            duplicate_indices = [dup["row_index"] for dup in external_duplicates]
            df_cleaned = df_cleaned.drop(index=duplicate_indices, errors='ignore')
        
        final_count = len(df_cleaned)
        removed_count = original_count - final_count
        
        removal_stats = {
            "original_count": original_count,
            "removed": removed_count,
            "kept": final_count,
            "removal_rate": removed_count / original_count if original_count > 0 else 0
        }
        
        logger.info(f"Deduplication complete: {removed_count} duplicates removed, {final_count} records kept")
        
        return df_cleaned, removal_stats
    
    def create_duplicate_hash(self, record: Dict[str, Any], key_fields: List[str] = None) -> str:
        """
        Create a hash for duplicate detection
        
        Args:
            record: Dictionary representing a data record
            key_fields: Specific fields to use for hashing (if None, uses all fields)
            
        Returns:
            SHA256 hash string
        """
        
        if key_fields is None:
            key_fields = sorted(record.keys())
        
        # Create a normalized string representation
        hash_data = []
        for field in sorted(key_fields):
            if field in record:
                value = record[field]
                # Normalize the value for consistent hashing
                if isinstance(value, str):
                    value = value.strip().lower()
                elif pd.isna(value):
                    value = ""
                hash_data.append(f"{field}:{value}")
        
        hash_string = "|".join(hash_data)
        return hashlib.sha256(hash_string.encode('utf-8')).hexdigest()
    
    def log_deduplication_action(self, file_id: str, action: str, details: Dict[str, Any]):
        """Log deduplication actions for audit trail"""
        
        log_entry = {
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "file_id": file_id,
            "action": action,
            "details": details
        }
        
        logger.info(f"Deduplication action logged: {action} for file {file_id}")
        
        # In a production system, you might want to store this in a dedicated audit table
        # For now, we'll just log it
        return log_entry