"""
Database initialization script for CollectiSense AI application.

This script creates all necessary tables and sets up the database schema
for the financial data management and reconciliation system.
"""

import os
import sys
from pathlib import Path

# Add the parent directory to the path so we can import from app
sys.path.append(str(Path(__file__).parent.parent.parent))

from app.db.database import engine, create_tables, drop_tables, Base
from app.db.models import Prompt, AcquirerTransaction
from app.models.user import User
from app.models.transaction import Transaction
from app.models.rate_card import RateCard
from app.models.routing_rule import RoutingRule
from app.models.reconciliation import ReconciliationResult, Discrepancy
from app.models.file_upload import UploadedFile, DataSchema, ProcessedDocument, UploadHistory
from app.models.file_summary import FileSummary


def init_database(drop_existing: bool = False):
    """
    Initialize the database with all required tables.
    
    Args:
        drop_existing: If True, drop existing tables before creating new ones
    """
    print("Initializing CollectiSense AI database...")
    
    if drop_existing:
        print("Dropping existing tables...")
        drop_tables()
        print("Existing tables dropped.")
    
    print("Creating database tables...")
    create_tables()
    print("Database tables created successfully.")
    
    # Print created tables
    print("\nCreated tables:")
    for table_name in Base.metadata.tables.keys():
        print(f"  - {table_name}")
    
    print("\nDatabase initialization completed!")


def verify_database():
    """Verify that all expected tables exist in the database."""
    expected_tables = {
        'users',
        'transactions', 
        'rate_cards',
        'routing_rules',
        'reconciliation_results',
        'discrepancies',
        'uploaded_files',
        'data_schemas',
        'processed_documents',
        'upload_history',
        'file_summaries',
        'prompts',
        'acquirer_transactions'
    }
    
    existing_tables = set(Base.metadata.tables.keys())
    
    print("Database verification:")
    print(f"Expected tables: {len(expected_tables)}")
    print(f"Existing tables: {len(existing_tables)}")
    
    missing_tables = expected_tables - existing_tables
    extra_tables = existing_tables - expected_tables
    
    if missing_tables:
        print(f"Missing tables: {missing_tables}")
        return False
    
    if extra_tables:
        print(f"Extra tables: {extra_tables}")
    
    print("✓ All expected tables exist")
    return True


def create_indexes():
    """Create additional database indexes for performance optimization."""
    from sqlalchemy import text
    
    print("Creating performance indexes...")
    
    # Transaction indexes
    indexes = [
        "CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(transaction_date)",
        "CREATE INDEX IF NOT EXISTS idx_transactions_terminal ON transactions(terminal_id)",
        "CREATE INDEX IF NOT EXISTS idx_transactions_acquirer ON transactions(acquirer_name)",
        "CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status)",
        "CREATE INDEX IF NOT EXISTS idx_transactions_settlement_date ON transactions(settlement_date)",
        
        # Rate card indexes
        "CREATE INDEX IF NOT EXISTS idx_rate_cards_terminal ON rate_cards(terminal_id)",
        "CREATE INDEX IF NOT EXISTS idx_rate_cards_acquirer ON rate_cards(acquirer)",
        "CREATE INDEX IF NOT EXISTS idx_rate_cards_effective_date ON rate_cards(effective_date)",
        "CREATE INDEX IF NOT EXISTS idx_rate_cards_active ON rate_cards(is_active)",
        
        # Routing rule indexes
        "CREATE INDEX IF NOT EXISTS idx_routing_rules_terminal ON routing_rules(terminal_id)",
        "CREATE INDEX IF NOT EXISTS idx_routing_rules_priority ON routing_rules(routing_priority)",
        "CREATE INDEX IF NOT EXISTS idx_routing_rules_active ON routing_rules(is_active)",
        
        # Reconciliation indexes
        "CREATE INDEX IF NOT EXISTS idx_reconciliation_transaction ON reconciliation_results(transaction_id)",
        "CREATE INDEX IF NOT EXISTS idx_reconciliation_status ON reconciliation_results(overall_status)",
        "CREATE INDEX IF NOT EXISTS idx_reconciliation_date ON reconciliation_results(reconciliation_date)",
        
        # File upload indexes
        "CREATE INDEX IF NOT EXISTS idx_uploaded_files_status ON uploaded_files(status)",
        "CREATE INDEX IF NOT EXISTS idx_uploaded_files_created ON uploaded_files(upload_timestamp)",
    ]
    
    with engine.connect() as conn:
        for index_sql in indexes:
            try:
                conn.execute(text(index_sql))
                conn.commit()
            except Exception as e:
                print(f"Warning: Could not create index: {e}")
    
    print("Performance indexes created.")


if __name__ == "__main__":
    import argparse
    
    parser = argparse.ArgumentParser(description="Initialize CollectiSense AI database")
    parser.add_argument("--drop", action="store_true", help="Drop existing tables before creating")
    parser.add_argument("--verify", action="store_true", help="Verify database structure")
    parser.add_argument("--indexes", action="store_true", help="Create performance indexes")
    
    args = parser.parse_args()
    
    if args.verify:
        verify_database()
    elif args.indexes:
        create_indexes()
    else:
        init_database(drop_existing=args.drop)
        if args.indexes:
            create_indexes()