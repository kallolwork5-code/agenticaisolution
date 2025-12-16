"""
Test script to verify database operations are working correctly.
"""

from app.db.database import SessionLocal
from app.models.transaction import Transaction
from app.models.rate_card import RateCard
from app.models.routing_rule import RoutingRule
from app.models.reconciliation import ReconciliationResult
from datetime import datetime, timedelta
from decimal import Decimal


def test_database_operations():
    """Test basic database operations."""
    print("Testing database operations...")
    
    db = SessionLocal()
    try:
        # Test querying existing data
        transactions = db.query(Transaction).limit(5).all()
        print(f"Found {len(transactions)} transactions")
        
        rate_cards = db.query(RateCard).limit(5).all()
        print(f"Found {len(rate_cards)} rate cards")
        
        routing_rules = db.query(RoutingRule).limit(5).all()
        print(f"Found {len(routing_rules)} routing rules")
        
        # Test creating a new transaction
        new_transaction = Transaction(
            transaction_date=datetime.now(),
            settlement_date=datetime.now() + timedelta(days=1),
            acquirer_name="Test Bank",
            card_type="credit",
            network_type="visa",
            transaction_amount=Decimal("500.00"),
            mdr_percentage=Decimal("2.25"),
            mdr_cost=Decimal("11.25"),
            gross_settlement_cost=Decimal("488.75"),
            terminal_id="TEST001",
            status="pending"
        )
        
        db.add(new_transaction)
        db.commit()
        print(f"Created new transaction with ID: {new_transaction.id}")
        
        # Test rate card matching
        if rate_cards:
            rate_card = rate_cards[0]
            test_amount = Decimal("1000.00")
            calculated_cost = rate_card.calculate_mdr_cost(test_amount)
            print(f"Rate card {rate_card.id} calculated MDR cost for {test_amount}: {calculated_cost}")
        
        # Test routing rule matching
        if routing_rules:
            routing_rule = routing_rules[0]
            test_transaction_data = {
                "payment_method": routing_rule.payment_method,
                "card_classification": routing_rule.card_classification,
                "network": routing_rule.network,
                "amount": Decimal("1000.00")
            }
            matches = routing_rule.matches_transaction(test_transaction_data)
            print(f"Routing rule {routing_rule.id} matches test transaction: {matches}")
        
        # Test reconciliation result creation
        reconciliation = ReconciliationResult(
            transaction_id=new_transaction.id,
            overall_status="valid",
            cost_validation_status="valid",
            sla_validation_status="valid",
            routing_validation_status="valid",
            expected_mdr_cost=Decimal("11.25"),
            actual_mdr_cost=Decimal("11.25"),
            cost_variance=Decimal("0.00")
        )
        
        db.add(reconciliation)
        db.commit()
        print(f"Created reconciliation result with ID: {reconciliation.id}")
        
        print("✓ All database operations completed successfully!")
        
    except Exception as e:
        print(f"Error during database operations: {e}")
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    test_database_operations()