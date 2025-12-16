"""
Unit tests for data models.
"""

import pytest
from datetime import datetime, timedelta
from decimal import Decimal
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.db.database import Base
from app.models.transaction import Transaction
from app.models.rate_card import RateCard
from app.models.routing_rule import RoutingRule
from app.models.reconciliation import ReconciliationResult, Discrepancy


# Test database setup
TEST_DATABASE_URL = "sqlite:///./test_models.db"
test_engine = create_engine(TEST_DATABASE_URL, connect_args={"check_same_thread": False})
TestSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)


@pytest.fixture(scope="function")
def db_session():
    """Create a test database session."""
    Base.metadata.create_all(bind=test_engine)
    session = TestSessionLocal()
    try:
        yield session
    finally:
        session.close()
        Base.metadata.drop_all(bind=test_engine)


class TestTransaction:
    """Test cases for Transaction model."""
    
    def test_create_transaction(self, db_session):
        """Test creating a transaction."""
        transaction = Transaction(
            transaction_date=datetime.now(),
            settlement_date=datetime.now() + timedelta(days=1),
            acquirer_name="HDFC Bank",
            card_type="credit",
            network_type="visa",
            transaction_amount=Decimal("1000.00"),
            mdr_percentage=Decimal("2.50"),
            mdr_cost=Decimal("25.00"),
            gross_settlement_cost=Decimal("975.00"),
            terminal_id="TRM001"
        )
        
        db_session.add(transaction)
        db_session.commit()
        
        assert transaction.id is not None
        assert transaction.currency == "USD"  # Default value
        assert transaction.status == "pending"  # Default value
        assert transaction.created_at is not None
    
    def test_transaction_repr(self, db_session):
        """Test transaction string representation."""
        transaction = Transaction(
            transaction_date=datetime.now(),
            settlement_date=datetime.now() + timedelta(days=1),
            acquirer_name="HDFC Bank",
            card_type="credit",
            network_type="visa",
            transaction_amount=Decimal("1000.00"),
            mdr_percentage=Decimal("2.50"),
            mdr_cost=Decimal("25.00"),
            gross_settlement_cost=Decimal("975.00"),
            terminal_id="TRM001"
        )
        
        db_session.add(transaction)
        db_session.commit()
        
        repr_str = repr(transaction)
        assert "Transaction" in repr_str
        assert "TRM001" in repr_str
        assert "1000.00" in repr_str


class TestRateCard:
    """Test cases for RateCard model."""
    
    def test_create_rate_card(self, db_session):
        """Test creating a rate card."""
        rate_card = RateCard(
            acquirer="HDFC Bank",
            terminal_id="TRM001",
            payment_mode="credit",
            card_classification="consumer",
            network="visa",
            agreed_mdr_rate=Decimal("2.50"),
            applicable_sla_days=1,
            sla_type="T+1",
            effective_date=datetime.now()
        )
        
        db_session.add(rate_card)
        db_session.commit()
        
        assert rate_card.id is not None
        assert rate_card.is_active is True  # Default value
        assert rate_card.version == 1  # Default value
    
    def test_rate_card_validity_check(self, db_session):
        """Test rate card validity for dates."""
        effective_date = datetime.now() - timedelta(days=10)
        expiry_date = datetime.now() + timedelta(days=10)
        
        rate_card = RateCard(
            acquirer="HDFC Bank",
            terminal_id="TRM001",
            payment_mode="credit",
            card_classification="consumer",
            network="visa",
            agreed_mdr_rate=Decimal("2.50"),
            applicable_sla_days=1,
            sla_type="T+1",
            effective_date=effective_date,
            expiry_date=expiry_date
        )
        
        db_session.add(rate_card)
        db_session.commit()
        
        # Test valid date
        assert rate_card.is_valid_for_date(datetime.now()) is True
        
        # Test date before effective date
        assert rate_card.is_valid_for_date(effective_date - timedelta(days=1)) is False
        
        # Test date after expiry date
        assert rate_card.is_valid_for_date(expiry_date + timedelta(days=1)) is False
    
    def test_mdr_cost_calculation(self, db_session):
        """Test MDR cost calculation."""
        rate_card = RateCard(
            acquirer="HDFC Bank",
            terminal_id="TRM001",
            payment_mode="credit",
            card_classification="consumer",
            network="visa",
            agreed_mdr_rate=Decimal("2.50"),
            applicable_sla_days=1,
            sla_type="T+1",
            effective_date=datetime.now(),
            minimum_fee=Decimal("5.00"),
            maximum_fee=Decimal("100.00"),
            fixed_fee=Decimal("2.00")
        )
        
        # Test normal calculation
        cost = rate_card.calculate_mdr_cost(Decimal("1000.00"))
        expected = Decimal("1000.00") * Decimal("0.025") + Decimal("2.00")  # 25.00 + 2.00
        assert cost == expected
        
        # Test minimum fee
        cost = rate_card.calculate_mdr_cost(Decimal("100.00"))
        expected = Decimal("5.00") + Decimal("2.00")  # Minimum fee + fixed fee
        assert cost == expected
        
        # Test maximum fee cap
        cost = rate_card.calculate_mdr_cost(Decimal("10000.00"))
        expected = Decimal("100.00") + Decimal("2.00")  # Maximum fee + fixed fee
        assert cost == expected


class TestRoutingRule:
    """Test cases for RoutingRule model."""
    
    def test_create_routing_rule(self, db_session):
        """Test creating a routing rule."""
        routing_rule = RoutingRule(
            terminal_id="TRM001",
            payment_method="credit",
            card_classification="consumer",
            network="visa",
            primary_acquirer="HDFC Bank",
            secondary_acquirer="ICICI Bank",
            effective_date=datetime.now()
        )
        
        db_session.add(routing_rule)
        db_session.commit()
        
        assert routing_rule.id is not None
        assert routing_rule.routing_priority == 1  # Default value
        assert routing_rule.is_active is True  # Default value
    
    def test_transaction_matching(self, db_session):
        """Test transaction matching logic."""
        routing_rule = RoutingRule(
            terminal_id="TRM001",
            payment_method="credit",
            card_classification="consumer",
            network="visa",
            primary_acquirer="HDFC Bank",
            min_amount=Decimal("100.00"),
            max_amount=Decimal("5000.00"),
            effective_date=datetime.now()
        )
        
        # Test matching transaction
        transaction_data = {
            "payment_method": "credit",
            "card_classification": "consumer",
            "network": "visa",
            "amount": Decimal("1000.00")
        }
        assert routing_rule.matches_transaction(transaction_data) is True
        
        # Test non-matching payment method
        transaction_data["payment_method"] = "debit"
        assert routing_rule.matches_transaction(transaction_data) is False
        
        # Test amount out of range
        transaction_data["payment_method"] = "credit"
        transaction_data["amount"] = Decimal("10000.00")
        assert routing_rule.matches_transaction(transaction_data) is False
    
    def test_preferred_acquirer_selection(self, db_session):
        """Test preferred acquirer selection."""
        routing_rule = RoutingRule(
            terminal_id="TRM001",
            payment_method="credit",
            card_classification="consumer",
            network="visa",
            primary_acquirer="HDFC Bank",
            secondary_acquirer="ICICI Bank",
            tertiary_acquirer="Axis Bank",
            effective_date=datetime.now()
        )
        
        # Test primary acquirer selection
        assert routing_rule.get_preferred_acquirer() == "HDFC Bank"
        
        # Test fallback to secondary when primary excluded
        assert routing_rule.get_preferred_acquirer(["HDFC Bank"]) == "ICICI Bank"
        
        # Test fallback to tertiary when primary and secondary excluded
        assert routing_rule.get_preferred_acquirer(["HDFC Bank", "ICICI Bank"]) == "Axis Bank"
        
        # Test no available acquirer
        assert routing_rule.get_preferred_acquirer(["HDFC Bank", "ICICI Bank", "Axis Bank"]) is None


class TestReconciliationResult:
    """Test cases for ReconciliationResult model."""
    
    def test_create_reconciliation_result(self, db_session):
        """Test creating a reconciliation result."""
        reconciliation = ReconciliationResult(
            transaction_id="txn_123",
            overall_status="valid",
            cost_validation_status="valid",
            sla_validation_status="valid",
            routing_validation_status="valid"
        )
        
        db_session.add(reconciliation)
        db_session.commit()
        
        assert reconciliation.id is not None
        assert reconciliation.reconciliation_date is not None
    
    def test_discrepancy_detection(self, db_session):
        """Test discrepancy detection."""
        reconciliation = ReconciliationResult(
            transaction_id="txn_123",
            overall_status="invalid",
            cost_validation_status="invalid",
            sla_validation_status="valid",
            routing_validation_status="invalid",
            expected_mdr_cost=Decimal("25.00"),
            actual_mdr_cost=Decimal("30.00"),
            cost_variance=Decimal("5.00"),
            cost_variance_percentage=Decimal("20.00"),
            expected_acquirer="HDFC Bank",
            actual_acquirer="ICICI Bank",
            routing_cost_impact=Decimal("2.00")
        )
        
        discrepancies = reconciliation.get_discrepancies()
        
        assert len(discrepancies) == 2  # Cost and routing discrepancies
        assert any(d['type'] == 'cost_validation' for d in discrepancies)
        assert any(d['type'] == 'routing_validation' for d in discrepancies)
    
    def test_validation_status(self, db_session):
        """Test overall validation status."""
        # Valid reconciliation
        valid_reconciliation = ReconciliationResult(
            transaction_id="txn_123",
            overall_status="valid",
            cost_validation_status="valid",
            sla_validation_status="valid",
            routing_validation_status="valid"
        )
        assert valid_reconciliation.is_valid() is True
        
        # Invalid reconciliation
        invalid_reconciliation = ReconciliationResult(
            transaction_id="txn_124",
            overall_status="invalid",
            cost_validation_status="invalid",
            sla_validation_status="valid",
            routing_validation_status="valid"
        )
        assert invalid_reconciliation.is_valid() is False


class TestDiscrepancy:
    """Test cases for Discrepancy model."""
    
    def test_create_discrepancy(self, db_session):
        """Test creating a discrepancy."""
        discrepancy = Discrepancy(
            reconciliation_result_id="recon_123",
            discrepancy_type="cost",
            severity="high",
            description="MDR cost variance detected",
            expected_value="25.00",
            actual_value="30.00",
            variance=Decimal("5.00"),
            financial_impact=Decimal("5.00")
        )
        
        db_session.add(discrepancy)
        db_session.commit()
        
        assert discrepancy.id is not None
        assert discrepancy.status == "open"  # Default value
        assert discrepancy.currency == "USD"  # Default value