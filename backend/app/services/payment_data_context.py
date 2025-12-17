import pandas as pd
from typing import Dict, List, Any
from datetime import datetime, timedelta
import random

class PaymentDataContextManager:
    """Manages payment analytics demo data context for the chatbot"""
    
    def __init__(self):
        self.demo_data = self._generate_demo_data()
    
    def _generate_demo_data(self) -> Dict[str, Any]:
        """Generate comprehensive demo data matching the dashboard"""
        
        # Base transaction data (scaled up from the 10 sample transactions)
        transactions = self._generate_transactions()
        rate_cards = self._generate_rate_cards()
        routing_rules = self._generate_routing_rules()
        
        # Derived error tables
        rate_reconciliation_errors = self._generate_rate_reconciliation_errors(transactions, rate_cards)
        sla_delay_errors = self._generate_sla_delay_errors(transactions, rate_cards)
        routing_errors = self._generate_routing_errors(transactions, routing_rules)
        
        # Calculate KPIs
        kpis = self._calculate_kpis(transactions, rate_reconciliation_errors, sla_delay_errors, routing_errors)
        
        return {
            "transactions": transactions,
            "rate_cards": rate_cards,
            "routing_rules": routing_rules,
            "rate_reconciliation_errors": rate_reconciliation_errors,
            "sla_delay_errors": sla_delay_errors,
            "routing_errors": routing_errors,
            "kpis": kpis
        }
    
    def _generate_transactions(self) -> List[Dict[str, Any]]:
        """Generate scaled transaction data"""
        base_transactions = [
            {"txn_id": "TXN0001", "txn_date": "2024-01-05", "settlement_date": "2024-01-06", "acquirer": "HDFC", "network": "VISA", "card_type": "Credit", "card_category": "Consumer", "amount_inr": 125000, "applied_mdr_pct": 1.85, "applied_mdr_amt": 2313, "settlement_amount": 122687},
            {"txn_id": "TXN0002", "txn_date": "2024-01-05", "settlement_date": "2024-01-10", "acquirer": "Axis", "network": "VISA", "card_type": "Credit", "card_category": "Consumer", "amount_inr": 125000, "applied_mdr_pct": 2.40, "applied_mdr_amt": 3000, "settlement_amount": 122000},
            {"txn_id": "TXN0003", "txn_date": "2024-01-06", "settlement_date": "2024-01-07", "acquirer": "ICICI", "network": "MC", "card_type": "Debit", "card_category": "Consumer", "amount_inr": 98000, "applied_mdr_pct": 1.20, "applied_mdr_amt": 1176, "settlement_amount": 96824},
            {"txn_id": "TXN0004", "txn_date": "2024-01-06", "settlement_date": "2024-01-12", "acquirer": "SBI", "network": "MC", "card_type": "Debit", "card_category": "Consumer", "amount_inr": 98000, "applied_mdr_pct": 1.50, "applied_mdr_amt": 1470, "settlement_amount": 96530},
            {"txn_id": "TXN0005", "txn_date": "2024-01-08", "settlement_date": "2024-01-09", "acquirer": "HDFC", "network": "VISA", "card_type": "Credit", "card_category": "Commercial", "amount_inr": 210000, "applied_mdr_pct": 2.10, "applied_mdr_amt": 4410, "settlement_amount": 205590},
            {"txn_id": "TXN0006", "txn_date": "2024-01-08", "settlement_date": "2024-01-14", "acquirer": "Axis", "network": "VISA", "card_type": "Credit", "card_category": "Commercial", "amount_inr": 210000, "applied_mdr_pct": 2.60, "applied_mdr_amt": 5460, "settlement_amount": 204540},
            {"txn_id": "TXN0007", "txn_date": "2024-01-10", "settlement_date": "2024-01-11", "acquirer": "ICICI", "network": "MC", "card_type": "Credit", "card_category": "Consumer", "amount_inr": 56000, "applied_mdr_pct": 1.90, "applied_mdr_amt": 1064, "settlement_amount": 54936},
            {"txn_id": "TXN0008", "txn_date": "2024-01-10", "settlement_date": "2024-01-18", "acquirer": "SBI", "network": "MC", "card_type": "Credit", "card_category": "Consumer", "amount_inr": 56000, "applied_mdr_pct": 2.30, "applied_mdr_amt": 1288, "settlement_amount": 54712},
            {"txn_id": "TXN0009", "txn_date": "2024-01-12", "settlement_date": "2024-01-13", "acquirer": "HDFC", "network": "RUPAY", "card_type": "Debit", "card_category": "Consumer", "amount_inr": 42000, "applied_mdr_pct": 0.90, "applied_mdr_amt": 378, "settlement_amount": 41622},
            {"txn_id": "TXN0010", "txn_date": "2024-01-12", "settlement_date": "2024-01-20", "acquirer": "Axis", "network": "RUPAY", "card_type": "Debit", "card_category": "Consumer", "amount_inr": 42000, "applied_mdr_pct": 1.20, "applied_mdr_amt": 504, "settlement_amount": 41496}
        ]
        
        # Scale up to ~800 transactions by repeating patterns with variations
        transactions = []
        for i in range(80):  # 80 * 10 = 800 transactions
            for j, base_txn in enumerate(base_transactions):
                txn = base_txn.copy()
                txn["txn_id"] = f"TXN{i:04d}{j:02d}"
                
                # Vary dates across the month
                base_date = datetime(2024, 1, 5) + timedelta(days=i % 25)
                txn["txn_date"] = base_date.strftime("%Y-%m-%d")
                
                # Vary settlement dates (some with delays)
                settlement_delay = random.choice([1, 1, 2, 2, 3, 5, 6, 8])  # Weighted towards normal delays
                settlement_date = base_date + timedelta(days=settlement_delay)
                txn["settlement_date"] = settlement_date.strftime("%Y-%m-%d")
                
                # Add some amount variation
                amount_variation = random.uniform(0.8, 1.2)
                txn["amount_inr"] = int(txn["amount_inr"] * amount_variation)
                txn["applied_mdr_amt"] = int(txn["amount_inr"] * txn["applied_mdr_pct"] / 100)
                txn["settlement_amount"] = txn["amount_inr"] - txn["applied_mdr_amt"]
                
                transactions.append(txn)
        
        return transactions
    
    def _generate_rate_cards(self) -> List[Dict[str, Any]]:
        """Generate rate card data"""
        return [
            {"acquirer": "HDFC", "network": "VISA", "card_type": "Credit", "card_category": "Consumer", "agreed_mdr_pct": 1.85, "sla_days": 2, "sla_interest_pct": 0.05},
            {"acquirer": "HDFC", "network": "VISA", "card_type": "Credit", "card_category": "Commercial", "agreed_mdr_pct": 2.10, "sla_days": 2, "sla_interest_pct": 0.05},
            {"acquirer": "ICICI", "network": "MC", "card_type": "Debit", "card_category": "Consumer", "agreed_mdr_pct": 1.20, "sla_days": 2, "sla_interest_pct": 0.05},
            {"acquirer": "ICICI", "network": "MC", "card_type": "Credit", "card_category": "Consumer", "agreed_mdr_pct": 1.90, "sla_days": 2, "sla_interest_pct": 0.05},
            {"acquirer": "SBI", "network": "MC", "card_type": "Debit", "card_category": "Consumer", "agreed_mdr_pct": 1.40, "sla_days": 3, "sla_interest_pct": 0.07},
            {"acquirer": "SBI", "network": "MC", "card_type": "Credit", "card_category": "Consumer", "agreed_mdr_pct": 1.90, "sla_days": 3, "sla_interest_pct": 0.07},
            {"acquirer": "Axis", "network": "VISA", "card_type": "Credit", "card_category": "Consumer", "agreed_mdr_pct": 1.85, "sla_days": 2, "sla_interest_pct": 0.05},
            {"acquirer": "Axis", "network": "VISA", "card_type": "Credit", "card_category": "Commercial", "agreed_mdr_pct": 2.10, "sla_days": 2, "sla_interest_pct": 0.05},
            {"acquirer": "Axis", "network": "RUPAY", "card_type": "Debit", "card_category": "Consumer", "agreed_mdr_pct": 0.90, "sla_days": 1, "sla_interest_pct": 0.03}
        ]
    
    def _generate_routing_rules(self) -> List[Dict[str, Any]]:
        """Generate routing rules data"""
        return [
            {"network": "VISA", "card_type": "Credit", "preferred_acquirer": "HDFC", "secondary_acquirer": "ICICI"},
            {"network": "VISA", "card_type": "Debit", "preferred_acquirer": "HDFC", "secondary_acquirer": "Axis"},
            {"network": "MC", "card_type": "Credit", "preferred_acquirer": "ICICI", "secondary_acquirer": "HDFC"},
            {"network": "MC", "card_type": "Debit", "preferred_acquirer": "ICICI", "secondary_acquirer": "SBI"},
            {"network": "RUPAY", "card_type": "Debit", "preferred_acquirer": "HDFC", "secondary_acquirer": "Axis"}
        ]
    
    def _generate_rate_reconciliation_errors(self, transactions: List[Dict], rate_cards: List[Dict]) -> List[Dict[str, Any]]:
        """Generate rate reconciliation errors"""
        errors = []
        rate_card_lookup = {
            (rc["acquirer"], rc["network"], rc["card_type"], rc["card_category"]): rc["agreed_mdr_pct"]
            for rc in rate_cards
        }
        
        error_count = 0
        for txn in transactions:
            key = (txn["acquirer"], txn["network"], txn["card_type"], txn["card_category"])
            if key in rate_card_lookup:
                agreed_mdr = rate_card_lookup[key]
                if txn["applied_mdr_pct"] > agreed_mdr:
                    saving = (txn["applied_mdr_pct"] - agreed_mdr) * txn["amount_inr"] / 100
                    errors.append({
                        "sl_no": error_count + 1,
                        "txn_id": txn["txn_id"],
                        "acquirer": txn["acquirer"],
                        "network": txn["network"],
                        "card_category": txn["card_category"],
                        "txn_amount": txn["amount_inr"],
                        "applied_mdr": txn["applied_mdr_pct"],
                        "agreed_mdr": agreed_mdr,
                        "saving_inr": int(saving)
                    })
                    error_count += 1
                    
                    if error_count >= 150:  # Limit to ~150 errors as per KPI
                        break
        
        return errors
    
    def _generate_sla_delay_errors(self, transactions: List[Dict], rate_cards: List[Dict]) -> List[Dict[str, Any]]:
        """Generate SLA delay errors"""
        errors = []
        sla_lookup = {
            (rc["acquirer"], rc["network"]): rc["sla_days"]
            for rc in rate_cards
        }
        
        error_count = 0
        for txn in transactions:
            key = (txn["acquirer"], txn["network"])
            if key in sla_lookup:
                sla_days = sla_lookup[key]
                txn_date = datetime.strptime(txn["txn_date"], "%Y-%m-%d")
                settlement_date = datetime.strptime(txn["settlement_date"], "%Y-%m-%d")
                delay_days = (settlement_date - txn_date).days
                
                if delay_days > sla_days:
                    errors.append({
                        "sl_no": error_count + 1,
                        "txn_id": txn["txn_id"],
                        "acquirer": txn["acquirer"],
                        "network": txn["network"],
                        "txn_date": txn["txn_date"],
                        "settlement_date": txn["settlement_date"],
                        "delay_days": delay_days
                    })
                    error_count += 1
                    
                    if error_count >= 89:  # Limit to ~89 errors as per KPI
                        break
        
        return errors
    
    def _generate_routing_errors(self, transactions: List[Dict], routing_rules: List[Dict]) -> List[Dict[str, Any]]:
        """Generate routing errors"""
        errors = []
        routing_lookup = {
            (rr["network"], rr["card_type"]): rr["preferred_acquirer"]
            for rr in routing_rules
        }
        
        error_count = 0
        for txn in transactions:
            key = (txn["network"], txn["card_type"])
            if key in routing_lookup:
                expected_acquirer = routing_lookup[key]
                if txn["acquirer"] != expected_acquirer:
                    # Calculate cost impact (simplified)
                    cost_impact = random.randint(50, 500)  # Random cost impact
                    errors.append({
                        "txn_id": txn["txn_id"],
                        "network": txn["network"],
                        "card_type": txn["card_type"],
                        "expected_acquirer": expected_acquirer,
                        "actual_acquirer": txn["acquirer"],
                        "cost_impact_inr": cost_impact
                    })
                    error_count += 1
                    
                    if error_count >= 156:  # Limit to ~156 errors as per KPI
                        break
        
        return errors
    
    def _calculate_kpis(self, transactions: List[Dict], rate_errors: List[Dict], sla_errors: List[Dict], routing_errors: List[Dict]) -> Dict[str, Any]:
        """Calculate dashboard KPIs"""
        total_volume = sum(txn["amount_inr"] for txn in transactions)
        total_savings = sum(err["saving_inr"] for err in rate_errors)
        
        # Calculate averages
        avg_mdr_rate = sum(txn["applied_mdr_pct"] for txn in transactions) / len(transactions)
        
        # Calculate On-Us vs Off-Us (simplified)
        on_us_count = len([txn for txn in transactions if txn["acquirer"] == "HDFC"])  # Assume HDFC is "On-Us"
        on_us_percentage = (on_us_count / len(transactions)) * 100
        off_us_percentage = 100 - on_us_percentage
        
        return {
            "total_volume": total_volume,
            "total_savings": total_savings,
            "rate_errors": len(rate_errors),
            "sla_errors": len(sla_errors),
            "routing_errors": len(routing_errors),
            "avg_mdr_rate": round(avg_mdr_rate, 2),
            "on_us_percentage": round(on_us_percentage, 1),
            "off_us_percentage": round(off_us_percentage, 1),
            "total_transactions": len(transactions)
        }
    
    def get_all_context(self) -> Dict[str, Any]:
        """Get all payment analytics context data"""
        return self.demo_data
    
    def get_transactions(self) -> List[Dict[str, Any]]:
        """Get transaction data"""
        return self.demo_data["transactions"]
    
    def get_rate_cards(self) -> List[Dict[str, Any]]:
        """Get rate card data"""
        return self.demo_data["rate_cards"]
    
    def get_kpis(self) -> Dict[str, Any]:
        """Get calculated KPIs"""
        return self.demo_data["kpis"]
    
    def get_errors_by_type(self, error_type: str) -> List[Dict[str, Any]]:
        """Get errors by type (rate_reconciliation, sla_delay, routing)"""
        error_key = f"{error_type}_errors"
        return self.demo_data.get(error_key, [])
    
    def search_transactions(self, **filters) -> List[Dict[str, Any]]:
        """Search transactions with filters"""
        transactions = self.demo_data["transactions"]
        
        for key, value in filters.items():
            if key in ["acquirer", "network", "card_type", "card_category"]:
                transactions = [txn for txn in transactions if txn.get(key) == value]
        
        return transactions