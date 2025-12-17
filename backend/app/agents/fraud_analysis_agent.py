#!/usr/bin/env python3
"""
Fraud Analysis Agent

Specialized agent for fraud detection and risk analysis including:
- Transaction pattern analysis
- Anomaly detection
- Risk scoring
- Fraud prevention recommendations
"""

import logging
import asyncio
from datetime import datetime, date, timedelta
from typing import Dict, Any, Optional, Callable
import random
import math

logger = logging.getLogger("fraud-analysis-agent")

class FraudAnalysisAgent:
    """
    Agent responsible for analyzing transaction patterns and detecting potential fraud
    """
    
    def __init__(self):
        self.name = "Fraud Analysis Agent"
        self.description = "Analyzes transaction patterns, detects anomalies, and assesses fraud risk"
        logger.info("Fraud Analysis Agent initialized")
    
    async def execute(self, 
                     execution_date: date,
                     parameters: Dict[str, Any],
                     progress_callback: Optional[Callable] = None) -> Dict[str, Any]:
        """
        Execute fraud analysis for the given date
        """
        logger.info(f"Starting fraud analysis for {execution_date}")
        
        try:
            if progress_callback:
                await progress_callback(10, "Initializing fraud analysis")
            
            # Step 1: Load transaction data for analysis
            transaction_data = await self._load_transaction_data(execution_date)
            if progress_callback:
                await progress_callback(25, f"Loaded {transaction_data['total_transactions']} transactions for analysis")
            
            # Step 2: Analyze transaction patterns
            pattern_analysis = await self._analyze_transaction_patterns(transaction_data)
            if progress_callback:
                await progress_callback(45, "Completed transaction pattern analysis")
            
            # Step 3: Detect anomalies
            anomaly_detection = await self._detect_anomalies(transaction_data, pattern_analysis)
            if progress_callback:
                await progress_callback(65, f"Detected {len(anomaly_detection['anomalies'])} potential anomalies")
            
            # Step 4: Calculate risk scores
            risk_assessment = await self._calculate_risk_scores(transaction_data, anomaly_detection)
            if progress_callback:
                await progress_callback(80, "Calculated risk scores for transactions")
            
            # Step 5: Generate fraud prevention recommendations
            recommendations = await self._generate_fraud_recommendations(
                pattern_analysis, anomaly_detection, risk_assessment
            )
            if progress_callback:
                await progress_callback(100, "Fraud analysis completed")
            
            result = {
                "agent_name": self.name,
                "execution_date": execution_date.isoformat(),
                "status": "completed",
                "transaction_data": transaction_data,
                "pattern_analysis": pattern_analysis,
                "anomaly_detection": anomaly_detection,
                "risk_assessment": risk_assessment,
                "recommendations": recommendations,
                "fraud_score": risk_assessment["overall_fraud_score"],
                "high_risk_transactions": len([a for a in anomaly_detection["anomalies"] if a["risk_level"] == "high"]),
                "prevention_effectiveness": recommendations["prevention_effectiveness_score"]
            }
            
            logger.info(f"Fraud analysis completed. Overall fraud score: {result['fraud_score']:.2f}")
            return result
            
        except Exception as e:
            logger.error(f"Fraud analysis failed: {e}")
            return {
                "agent_name": self.name,
                "status": "failed",
                "error": str(e),
                "execution_date": execution_date.isoformat()
            }
    
    async def _load_transaction_data(self, execution_date: date) -> Dict[str, Any]:
        """Load transaction data for fraud analysis"""
        await asyncio.sleep(0.5)  # Simulate data loading
        
        # Simulate realistic transaction data with fraud indicators
        total_transactions = random.randint(8000, 15000)
        
        # Generate transaction patterns
        transactions = []
        for i in range(min(1000, total_transactions)):  # Sample for analysis
            transaction = {
                "id": f"txn_{i:06d}",
                "amount": round(random.lognormal(4, 1.5), 2),  # Log-normal distribution for amounts
                "timestamp": execution_date.isoformat() + f"T{random.randint(0,23):02d}:{random.randint(0,59):02d}:{random.randint(0,59):02d}Z",
                "merchant_id": f"merchant_{random.randint(1, 500)}",
                "customer_id": f"customer_{random.randint(1, 5000)}",
                "payment_method": random.choice(["card", "ach", "wallet", "bank_transfer"]),
                "country": random.choice(["US", "CA", "GB", "DE", "FR", "AU", "JP"]),
                "ip_address": f"{random.randint(1,255)}.{random.randint(1,255)}.{random.randint(1,255)}.{random.randint(1,255)}",
                "device_fingerprint": f"device_{random.randint(1, 10000)}",
                "is_recurring": random.random() < 0.15,  # 15% recurring
                "velocity_1h": random.randint(1, 5),  # Transactions in last hour
                "velocity_24h": random.randint(1, 20)  # Transactions in last 24h
            }
            
            # Add some suspicious patterns
            if random.random() < 0.02:  # 2% potentially fraudulent
                transaction["amount"] = random.uniform(2000, 10000)  # High amounts
                transaction["velocity_1h"] = random.randint(5, 15)  # High velocity
                transaction["country"] = random.choice(["XX", "YY", "ZZ"])  # Suspicious countries
            
            transactions.append(transaction)
        
        return {
            "execution_date": execution_date.isoformat(),
            "total_transactions": total_transactions,
            "sample_transactions": transactions,
            "sample_size": len(transactions),
            "data_quality": "high"
        }
    
    async def _analyze_transaction_patterns(self, transaction_data: Dict[str, Any]) -> Dict[str, Any]:
        """Analyze transaction patterns to establish baselines"""
        await asyncio.sleep(0.4)  # Simulate analysis
        
        transactions = transaction_data["sample_transactions"]
        
        # Amount distribution analysis
        amounts = [t["amount"] for t in transactions]
        amount_stats = {
            "mean": sum(amounts) / len(amounts),
            "median": sorted(amounts)[len(amounts) // 2],
            "std_dev": math.sqrt(sum((x - sum(amounts) / len(amounts)) ** 2 for x in amounts) / len(amounts)),
            "min": min(amounts),
            "max": max(amounts),
            "percentile_95": sorted(amounts)[int(len(amounts) * 0.95)]
        }
        
        # Velocity patterns
        velocity_1h = [t["velocity_1h"] for t in transactions]
        velocity_24h = [t["velocity_24h"] for t in transactions]
        
        velocity_stats = {
            "avg_velocity_1h": sum(velocity_1h) / len(velocity_1h),
            "avg_velocity_24h": sum(velocity_24h) / len(velocity_24h),
            "max_velocity_1h": max(velocity_1h),
            "max_velocity_24h": max(velocity_24h)
        }
        
        # Geographic distribution
        countries = {}
        for t in transactions:
            countries[t["country"]] = countries.get(t["country"], 0) + 1
        
        # Payment method distribution
        payment_methods = {}
        for t in transactions:
            payment_methods[t["payment_method"]] = payment_methods.get(t["payment_method"], 0) + 1
        
        # Time-based patterns
        hours = {}
        for t in transactions:
            hour = int(t["timestamp"].split("T")[1].split(":")[0])
            hours[hour] = hours.get(hour, 0) + 1
        
        return {
            "amount_patterns": {
                "statistics": amount_stats,
                "high_amount_threshold": amount_stats["percentile_95"],
                "suspicious_amount_threshold": amount_stats["mean"] + (3 * amount_stats["std_dev"])
            },
            "velocity_patterns": velocity_stats,
            "geographic_distribution": countries,
            "payment_method_distribution": payment_methods,
            "temporal_patterns": {
                "hourly_distribution": hours,
                "peak_hours": sorted(hours.items(), key=lambda x: x[1], reverse=True)[:3]
            },
            "baseline_established": True
        }
    
    async def _detect_anomalies(self, 
                              transaction_data: Dict[str, Any],
                              pattern_analysis: Dict[str, Any]) -> Dict[str, Any]:
        """Detect anomalous transactions based on established patterns"""
        await asyncio.sleep(0.6)  # Simulate detection
        
        transactions = transaction_data["sample_transactions"]
        patterns = pattern_analysis
        anomalies = []
        
        # Thresholds from pattern analysis
        high_amount_threshold = patterns["amount_patterns"]["high_amount_threshold"]
        suspicious_amount_threshold = patterns["amount_patterns"]["suspicious_amount_threshold"]
        avg_velocity_1h = patterns["velocity_patterns"]["avg_velocity_1h"]
        
        for transaction in transactions:
            anomaly_indicators = []
            risk_score = 0
            
            # Amount-based anomalies
            if transaction["amount"] > suspicious_amount_threshold:
                anomaly_indicators.append("extremely_high_amount")
                risk_score += 30
            elif transaction["amount"] > high_amount_threshold:
                anomaly_indicators.append("high_amount")
                risk_score += 15
            
            # Velocity-based anomalies
            if transaction["velocity_1h"] > avg_velocity_1h * 3:
                anomaly_indicators.append("high_velocity_1h")
                risk_score += 25
            
            if transaction["velocity_24h"] > patterns["velocity_patterns"]["avg_velocity_24h"] * 2:
                anomaly_indicators.append("high_velocity_24h")
                risk_score += 20
            
            # Geographic anomalies
            if transaction["country"] not in ["US", "CA", "GB", "DE", "FR", "AU", "JP"]:
                anomaly_indicators.append("suspicious_country")
                risk_score += 35
            
            # Time-based anomalies
            hour = int(transaction["timestamp"].split("T")[1].split(":")[0])
            if hour < 6 or hour > 22:  # Off-hours transactions
                anomaly_indicators.append("off_hours_transaction")
                risk_score += 10
            
            # Device/IP anomalies (simulated)
            if random.random() < 0.05:  # 5% chance of device anomaly
                anomaly_indicators.append("suspicious_device")
                risk_score += 20
            
            # If any anomalies detected, add to list
            if anomaly_indicators:
                risk_level = "low"
                if risk_score >= 50:
                    risk_level = "high"
                elif risk_score >= 25:
                    risk_level = "medium"
                
                anomalies.append({
                    "transaction_id": transaction["id"],
                    "amount": transaction["amount"],
                    "customer_id": transaction["customer_id"],
                    "merchant_id": transaction["merchant_id"],
                    "timestamp": transaction["timestamp"],
                    "anomaly_indicators": anomaly_indicators,
                    "risk_score": risk_score,
                    "risk_level": risk_level,
                    "recommended_action": self._get_recommended_action(risk_level, anomaly_indicators)
                })
        # Sort anomalies by risk score
        anomalies.sort(key=lambda x: x["risk_score"], reverse=True)
        
        # Categorize anomalies
        high_risk = [a for a in anomalies if a["risk_level"] == "high"]
        medium_risk = [a for a in anomalies if a["risk_level"] == "medium"]
        low_risk = [a for a in anomalies if a["risk_level"] == "low"]
        
        return {
            "anomalies": anomalies,
            "summary": {
                "total_anomalies": len(anomalies),
                "high_risk_count": len(high_risk),
                "medium_risk_count": len(medium_risk),
                "low_risk_count": len(low_risk),
                "anomaly_rate": round((len(anomalies) / len(transactions)) * 100, 2)
            },
            "top_risk_transactions": anomalies[:10],  # Top 10 riskiest
            "detection_rules_triggered": self._get_triggered_rules(anomalies)
        }
    
    def _get_recommended_action(self, risk_level: str, indicators: list) -> str:
        """Get recommended action based on risk level and indicators"""
        if risk_level == "high":
            if "extremely_high_amount" in indicators or "suspicious_country" in indicators:
                return "block_and_review"
            else:
                return "hold_for_review"
        elif risk_level == "medium":
            return "additional_verification"
        else:
            return "monitor"
    
    def _get_triggered_rules(self, anomalies: list) -> Dict[str, int]:
        """Count how many times each detection rule was triggered"""
        rule_counts = {}
        for anomaly in anomalies:
            for indicator in anomaly["anomaly_indicators"]:
                rule_counts[indicator] = rule_counts.get(indicator, 0) + 1
        return rule_counts
    
    async def _calculate_risk_scores(self,
                                   transaction_data: Dict[str, Any],
                                   anomaly_detection: Dict[str, Any]) -> Dict[str, Any]:
        """Calculate overall risk scores and assessments"""
        await asyncio.sleep(0.3)  # Simulate calculation
        
        anomalies = anomaly_detection["anomalies"]
        total_transactions = len(transaction_data["sample_transactions"])
        
        # Calculate overall fraud score (0-100)
        if not anomalies:
            overall_fraud_score = 5  # Baseline low risk
        else:
            # Weight by risk levels
            high_risk_weight = len([a for a in anomalies if a["risk_level"] == "high"]) * 3
            medium_risk_weight = len([a for a in anomalies if a["risk_level"] == "medium"]) * 2
            low_risk_weight = len([a for a in anomalies if a["risk_level"] == "low"]) * 1
            
            total_weighted_risk = high_risk_weight + medium_risk_weight + low_risk_weight
            overall_fraud_score = min(95, (total_weighted_risk / total_transactions) * 100 + 5)
        
        # Risk distribution
        risk_distribution = {
            "very_low": max(0, 100 - overall_fraud_score - 20),
            "low": min(20, 100 - overall_fraud_score),
            "medium": min(30, overall_fraud_score * 0.6),
            "high": min(25, overall_fraud_score * 0.3),
            "very_high": max(0, overall_fraud_score - 75)
        }
        
        # Financial impact assessment
        high_risk_amounts = sum(a["amount"] for a in anomalies if a["risk_level"] == "high")
        medium_risk_amounts = sum(a["amount"] for a in anomalies if a["risk_level"] == "medium")
        
        financial_impact = {
            "potential_fraud_amount": round(high_risk_amounts + (medium_risk_amounts * 0.3), 2),
            "high_risk_exposure": round(high_risk_amounts, 2),
            "medium_risk_exposure": round(medium_risk_amounts, 2),
            "estimated_loss_rate": round(overall_fraud_score * 0.001, 4)  # Convert to percentage
        }
        
        return {
            "overall_fraud_score": round(overall_fraud_score, 2),
            "risk_level": self._get_overall_risk_level(overall_fraud_score),
            "risk_distribution": risk_distribution,
            "financial_impact": financial_impact,
            "confidence_score": random.uniform(85, 95),  # Model confidence
            "model_version": "fraud_detector_v2.1"
        }
    
    def _get_overall_risk_level(self, score: float) -> str:
        """Convert numeric score to risk level"""
        if score >= 75:
            return "very_high"
        elif score >= 50:
            return "high"
        elif score >= 25:
            return "medium"
        elif score >= 10:
            return "low"
        else:
            return "very_low"
    
    async def _generate_fraud_recommendations(self,
                                            pattern_analysis: Dict[str, Any],
                                            anomaly_detection: Dict[str, Any],
                                            risk_assessment: Dict[str, Any]) -> Dict[str, Any]:
        """Generate fraud prevention recommendations"""
        await asyncio.sleep(0.2)  # Simulate generation
        
        recommendations = []
        priority_actions = []
        
        # Analyze current state
        anomaly_rate = anomaly_detection["summary"]["anomaly_rate"]
        high_risk_count = anomaly_detection["summary"]["high_risk_count"]
        overall_risk = risk_assessment["overall_fraud_score"]
        
        # Generate recommendations based on findings
        if high_risk_count > 10:
            recommendations.append({
                "category": "immediate_action",
                "title": "Review High-Risk Transactions",
                "description": f"{high_risk_count} high-risk transactions require immediate review",
                "priority": "high",
                "estimated_impact": "high",
                "implementation_effort": "low"
            })
            priority_actions.append("review_high_risk_transactions")
        
        if anomaly_rate > 5:
            recommendations.append({
                "category": "detection_tuning",
                "title": "Adjust Detection Sensitivity",
                "description": f"Anomaly rate of {anomaly_rate}% may indicate over-sensitive rules",
                "priority": "medium",
                "estimated_impact": "medium",
                "implementation_effort": "medium"
            })
        
        if overall_risk > 30:
            recommendations.append({
                "category": "prevention_enhancement",
                "title": "Enhance Fraud Prevention Controls",
                "description": "Implement additional verification steps for high-risk patterns",
                "priority": "high",
                "estimated_impact": "high",
                "implementation_effort": "high"
            })
            priority_actions.append("enhance_prevention_controls")
        
        # Geographic risk recommendations
        triggered_rules = anomaly_detection["detection_rules_triggered"]
        if triggered_rules.get("suspicious_country", 0) > 5:
            recommendations.append({
                "category": "geographic_controls",
                "title": "Implement Geographic Restrictions",
                "description": "Consider blocking or requiring additional verification for high-risk countries",
                "priority": "medium",
                "estimated_impact": "medium",
                "implementation_effort": "low"
            })
        
        # Velocity-based recommendations
        if triggered_rules.get("high_velocity_1h", 0) > 3:
            recommendations.append({
                "category": "velocity_controls",
                "title": "Implement Velocity Limits",
                "description": "Set stricter limits on transaction frequency per customer",
                "priority": "medium",
                "estimated_impact": "medium",
                "implementation_effort": "medium"
            })
        
        # Calculate prevention effectiveness score
        current_controls = len(triggered_rules)  # Number of active detection rules
        prevention_effectiveness = min(95, (current_controls * 10) + random.uniform(60, 80))
        
        return {
            "recommendations": recommendations,
            "priority_actions": priority_actions,
            "prevention_effectiveness_score": round(prevention_effectiveness, 1),
            "implementation_roadmap": {
                "immediate": [r for r in recommendations if r["priority"] == "high"],
                "short_term": [r for r in recommendations if r["priority"] == "medium"],
                "long_term": [r for r in recommendations if r["priority"] == "low"]
            },
            "monitoring_suggestions": [
                "Monitor anomaly detection accuracy and adjust thresholds monthly",
                "Track false positive rates and optimize rules accordingly",
                "Implement real-time alerting for high-risk transactions",
                "Regular review of geographic and velocity patterns"
            ]
        }