"""
Seed data script for CollectiSense AI application.

This script creates sample data for testing and development purposes.
"""

import sys
from pathlib import Path
from datetime import datetime, timedelta
from decimal import Decimal
import uuid

# Add the parent directory to the path so we can import from app
sys.path.append(str(Path(__file__).parent.parent.parent))

from app.db.database import SessionLocal
from app.models.transaction import Transaction
from app.models.rate_card import RateCard
from app.models.routing_rule import RoutingRule
from app.models.user import User


def create_sample_users(db):
    """Create sample users for testing."""
    from app.services.auth_service import AuthService
    
    users_data = [
        {
            "id": "user_admin_001",
            "username": "admin",
            "email": "admin@collectisense.ai",
            "password": "admin123"  # Updated to match expected credentials
        },
        {
            "id": "user_analyst_001",
            "username": "analyst",
            "email": "analyst@collectisense.ai", 
            "password": "secret"  # Keep this as is
        }
    ]
    
    created_count = 0
    for user_data in users_data:
        existing_user = db.query(User).filter(User.username == user_data["username"]).first()
        if not existing_user:
            # Hash the password properly
            hashed_password = AuthService.get_password_hash(user_data["password"])
            
            user = User(
                id=user_data["id"],
                username=user_data["username"],
                email=user_data["email"],
                hashed_password=hashed_password,
                is_active=True
            )
            db.add(user)
            created_count += 1
    
    db.commit()
    print(f"Created {created_count} sample users")


def create_sample_rate_cards(db):
    """Create sample rate cards for testing."""
    rate_cards = [
        {
            "acquirer": "HDFC Bank",
            "terminal_id": "TRM001",
            "payment_mode": "credit",
            "card_classification": "consumer",
            "network": "visa",
            "agreed_mdr_rate": Decimal("2.50"),
            "applicable_sla_days": 1,
            "sla_type": "T+1",
            "effective_date": datetime.now() - timedelta(days=30),
            "is_active": True
        },
        {
            "acquirer": "ICICI Bank", 
            "terminal_id": "TRM002",
            "payment_mode": "debit",
            "card_classification": "consumer",
            "network": "mastercard",
            "agreed_mdr_rate": Decimal("1.75"),
            "applicable_sla_days": 2,
            "sla_type": "T+2",
            "effective_date": datetime.now() - timedelta(days=30),
            "is_active": True
        },
        {
            "acquirer": "Axis Bank",
            "terminal_id": "TRM003", 
            "payment_mode": "credit",
            "card_classification": "premium",
            "network": "amex",
            "agreed_mdr_rate": Decimal("3.25"),
            "applicable_sla_days": 1,
            "sla_type": "T+1",
            "effective_date": datetime.now() - timedelta(days=30),
            "is_active": True
        }
    ]
    
    for rate_card_data in rate_cards:
        rate_card = RateCard(**rate_card_data)
        db.add(rate_card)
    
    db.commit()
    print(f"Created {len(rate_cards)} sample rate cards")


def create_sample_routing_rules(db):
    """Create sample routing rules for testing."""
    routing_rules = [
        {
            "terminal_id": "TRM001",
            "payment_method": "credit",
            "card_classification": "consumer", 
            "network": "visa",
            "primary_acquirer": "HDFC Bank",
            "secondary_acquirer": "ICICI Bank",
            "routing_priority": 1,
            "effective_date": datetime.now() - timedelta(days=30),
            "is_active": True
        },
        {
            "terminal_id": "TRM002",
            "payment_method": "debit",
            "card_classification": "consumer",
            "network": "mastercard", 
            "primary_acquirer": "ICICI Bank",
            "secondary_acquirer": "HDFC Bank",
            "routing_priority": 1,
            "effective_date": datetime.now() - timedelta(days=30),
            "is_active": True
        },
        {
            "terminal_id": "TRM003",
            "payment_method": "credit",
            "card_classification": "premium",
            "network": "amex",
            "primary_acquirer": "Axis Bank",
            "secondary_acquirer": "HDFC Bank",
            "routing_priority": 1,
            "effective_date": datetime.now() - timedelta(days=30),
            "is_active": True
        }
    ]
    
    for routing_rule_data in routing_rules:
        routing_rule = RoutingRule(**routing_rule_data)
        db.add(routing_rule)
    
    db.commit()
    print(f"Created {len(routing_rules)} sample routing rules")


def create_sample_transactions(db):
    """Create sample transactions for testing."""
    base_date = datetime.now() - timedelta(days=7)
    
    transactions = []
    for i in range(50):
        transaction_date = base_date + timedelta(hours=i*2)
        settlement_date = transaction_date + timedelta(days=1)
        
        # Vary the data to create realistic scenarios
        acquirers = ["HDFC Bank", "ICICI Bank", "Axis Bank"]
        card_types = ["credit", "debit"]
        networks = ["visa", "mastercard", "amex"]
        terminals = ["TRM001", "TRM002", "TRM003"]
        
        acquirer = acquirers[i % len(acquirers)]
        card_type = card_types[i % len(card_types)]
        network = networks[i % len(networks)]
        terminal = terminals[i % len(terminals)]
        
        amount = Decimal(str(100 + (i * 50)))  # Varying amounts
        mdr_rate = Decimal("2.50") if card_type == "credit" else Decimal("1.75")
        mdr_cost = amount * (mdr_rate / 100)
        
        transaction = {
            "transaction_date": transaction_date,
            "settlement_date": settlement_date,
            "acquirer_name": acquirer,
            "card_type": card_type,
            "network_type": network,
            "transaction_amount": amount,
            "mdr_percentage": mdr_rate,
            "mdr_cost": mdr_cost,
            "gross_settlement_cost": amount - mdr_cost,
            "currency": "USD",
            "terminal_id": terminal,
            "merchant_id": f"MER{i:03d}",
            "transaction_reference": f"TXN{i:06d}",
            "status": "validated"
        }
        
        transactions.append(Transaction(**transaction))
    
    db.add_all(transactions)
    db.commit()
    print(f"Created {len(transactions)} sample transactions")


def seed_database():
    """Seed the database with sample data."""
    print("Seeding database with sample data...")
    
    db = SessionLocal()
    try:
        create_sample_users(db)
        create_sample_rate_cards(db)
        create_sample_routing_rules(db)
        create_sample_transactions(db)
        
        print("Database seeding completed successfully!")
        
    except Exception as e:
        print(f"Error seeding database: {e}")
        db.rollback()
        raise
    finally:
        db.close()


def clear_sample_data():
    """Clear all sample data from the database."""
    print("Clearing sample data...")
    
    db = SessionLocal()
    try:
        # Clear in reverse order to handle foreign key constraints
        db.query(Transaction).delete()
        db.query(RoutingRule).delete()
        db.query(RateCard).delete()
        db.query(User).delete()
        
        db.commit()
        print("Sample data cleared successfully!")
        
    except Exception as e:
        print(f"Error clearing sample data: {e}")
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    import argparse
    
    parser = argparse.ArgumentParser(description="Seed CollectiSense AI database with sample data")
    parser.add_argument("--clear", action="store_true", help="Clear existing sample data")
    
    args = parser.parse_args()
    
    if args.clear:
        clear_sample_data()
    else:
        seed_database()