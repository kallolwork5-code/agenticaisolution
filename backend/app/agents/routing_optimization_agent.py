#!/usr/bin/env python3
"""
Routing Optimization Agent

Specialized agent for analyzing routing decisions including:
- Primary vs secondary acquirer routing analysis
- Cost savings identification through optimal routing
- MDR comparison between routing options
- Routing efficiency recommendations
"""

import logging
import asyncio
from datetime import datetime, date, timedelta
from typing import Dict, Any, Optional, Callable
import random
import statistics

logger = logging.getLogger("routing-optimization-agent")

class RoutingOptimizationAgent:
    """
    Agent responsible for analyzing routing decisions and identifying cost optimization opportunities
    """
    
    def __init__(self):
        self.name = "Routing Optimization Agent"
        self.description = "Analyzes routing decisions between primary and secondary acquirers to identify cost savings opportunities"
        logger.info("Routing Optimization Agent initialized")
    
    async def execute(self, 
                     execution_date: date,
                     parameters: Dict[str, Any],
                     progress_callback: Optional[Callable] = None) -> Dict[str, Any]:
        """
        Execute routing optimization analysis for the given date
        """
        logger.info(f"Starting routing optimization analysis for {execution_date}")
        
        try:
            if progress_callback:
                try:
                    await progress_callback(10, "Initializing routing analysis")
                except:
                    pass
            
            # Step 1: Load transaction routing data
            routing_data = await self._load_routing_data(execution_date)
            if progress_callback:
                try:
                    await progress_callback(25, f"Loaded {routing_data['total_transactions']} transactions for routing analysis")
                except:
                    pass
            
            # Step 2: Analyze primary vs secondary routing decisions
            routing_analysis = await self._analyze_routing_decisions(routing_data)
            if progress_callback:
                try:
                    await progress_callback(50, "Completed routing decision analysis")
                except:
                    pass
            
            # Step 3: Calculate cost savings opportunities
            cost_savings = await self._calculate_cost_savings(routing_data, routing_analysis)
            if progress_callback:
                try:
                    await progress_callback(75, "Calculated potential cost savings")
                except:
                    pass
            
            # Step 4: Generate routing optimization recommendations
            recommendations = await self._generate_routing_recommendations(
                routing_analysis, cost_savings
            )
            if progress_callback:
                try:
                    await progress_callback(100, "Routing optimization analysis completed")
                except:
                    pass
            
            result = {
                "agent_name": self.name,
                "execution_date": execution_date.isoformat(),
                "status": "completed",
                "routing_data": routing_data,
                "routing_analysis": routing_analysis,
                "cost_savings": cost_savings,
                "recommendations": recommendations,
                "total_potential_savings": cost_savings["total_potential_savings"],
                "routing_efficiency": routing_analysis["routing_efficiency_score"],
                "optimal_routing_percentage": routing_analysis["optimal_routing_percentage"]
            }
            
            logger.info(f"Routing optimization completed. Potential savings: ${result['total_potential_savings']:.2f}")
            return result
            
        except Exception as e:
            logger.error(f"Routing optimization analysis failed: {e}")
            return {
                "agent_name": self.name,
                "status": "failed",
                "error": str(e),
                "execution_date": execution_date.isoformat()
            }
    
    async def _load_routing_data(self, execution_date: date) -> Dict[str, Any]:
        """Load transaction routing data for analysis"""
        await asyncio.sleep(0.5)  # Simulate data loading
        
        # Simulate realistic routing data
        total_transactions = random.randint(8000, 15000)
        
        # Generate routing decisions
        routing_decisions = []
        acquirers = {
            "HDFC_Primary": {"mdr_rate": 1.8, "success_rate": 98.5, "is_primary": True},
            "HDFC_Secondary": {"mdr_rate": 2.1, "success_rate": 97.2, "is_primary": False},
            "ICICI_Primary": {"mdr_rate": 1.9, "success_rate": 98.1, "is_primary": True},
            "ICICI_Secondary": {"mdr_rate": 2.3, "success_rate": 96.8, "is_primary": False},
            "SBI_Primary": {"mdr_rate": 2.0, "success_rate": 97.8, "is_primary": True},
            "SBI_Secondary": {"mdr_rate": 2.4, "success_rate": 96.5, "is_primary": False}
        }
        
        for i in range(min(1000, total_transactions)):  # Sample for analysis
            # Simulate routing decision
            primary_acquirer = random.choice(["HDFC_Primary", "ICICI_Primary", "SBI_Primary"])
            secondary_acquirer = primary_acquirer.replace("_Primary", "_Secondary")
            
            # Determine if routing was optimal (85% of time it should be)
            should_use_primary = random.random() < 0.85
            actual_acquirer = primary_acquirer if should_use_primary else secondary_acquirer
            
            # Sometimes routing goes to secondary due to primary failure
            if random.random() < 0.1:  # 10% primary failure rate
                actual_acquirer = secondary_acquirer
                routing_reason = "primary_failure"
            else:
                routing_reason = "normal_routing"
            
            transaction = {
                "transaction_id": f"txn_{i:06d}",
                "amount": round(random.uniform(50, 5000), 2),
                "primary_acquirer": primary_acquirer,
                "secondary_acquirer": secondary_acquirer,
                "actual_acquirer": actual_acquirer,
                "routing_reason": routing_reason,
                "primary_mdr": acquirers[primary_acquirer]["mdr_rate"],
                "secondary_mdr": acquirers[secondary_acquirer]["mdr_rate"],
                "actual_mdr": acquirers[actual_acquirer]["mdr_rate"],
                "timestamp": execution_date.isoformat() + f"T{random.randint(0,23):02d}:{random.randint(0,59):02d}:{random.randint(0,59):02d}Z",
                "was_optimal": actual_acquirer == primary_acquirer and routing_reason == "normal_routing"
            }
            
            routing_decisions.append(transaction)
        
        return {
            "execution_date": execution_date.isoformat(),
            "total_transactions": total_transactions,
            "sample_transactions": routing_decisions,
            "sample_size": len(routing_decisions),
            "acquirer_config": acquirers
        }
    
    async def _analyze_routing_decisions(self, routing_data: Dict[str, Any]) -> Dict[str, Any]:
        """Analyze routing decisions for efficiency and correctness"""
        await asyncio.sleep(0.4)  # Simulate analysis
        
        transactions = routing_data["sample_transactions"]
        
        # Calculate routing statistics
        total_transactions = len(transactions)
        optimal_routings = len([t for t in transactions if t["was_optimal"]])
        suboptimal_routings = total_transactions - optimal_routings
        
        # Analyze routing by acquirer
        acquirer_stats = {}
        for transaction in transactions:
            acquirer = transaction["actual_acquirer"]
            if acquirer not in acquirer_stats:
                acquirer_stats[acquirer] = {
                    "transaction_count": 0,
                    "total_volume": 0,
                    "total_mdr_cost": 0,
                    "optimal_count": 0
                }
            
            stats = acquirer_stats[acquirer]
            stats["transaction_count"] += 1
            stats["total_volume"] += transaction["amount"]
            stats["total_mdr_cost"] += transaction["amount"] * (transaction["actual_mdr"] / 100)
            if transaction["was_optimal"]:
                stats["optimal_count"] += 1
        
        # Calculate efficiency metrics
        routing_efficiency_score = (optimal_routings / total_transactions) * 100
        
        # Analyze routing reasons
        routing_reasons = {}
        for transaction in transactions:
            reason = transaction["routing_reason"]
            routing_reasons[reason] = routing_reasons.get(reason, 0) + 1
        
        # Primary vs Secondary usage
        primary_usage = len([t for t in transactions if "_Primary" in t["actual_acquirer"]])
        secondary_usage = len([t for t in transactions if "_Secondary" in t["actual_acquirer"]])
        
        return {
            "total_transactions_analyzed": total_transactions,
            "optimal_routings": optimal_routings,
            "suboptimal_routings": suboptimal_routings,
            "routing_efficiency_score": round(routing_efficiency_score, 2),
            "optimal_routing_percentage": round((optimal_routings / total_transactions) * 100, 2),
            "acquirer_performance": acquirer_stats,
            "routing_reasons": routing_reasons,
            "primary_vs_secondary": {
                "primary_usage": primary_usage,
                "secondary_usage": secondary_usage,
                "primary_percentage": round((primary_usage / total_transactions) * 100, 2),
                "secondary_percentage": round((secondary_usage / total_transactions) * 100, 2)
            },
            "analysis_summary": {
                "routing_health": "good" if routing_efficiency_score > 80 else "needs_improvement",
                "primary_failure_rate": round((routing_reasons.get("primary_failure", 0) / total_transactions) * 100, 2)
            }
        }
    
    async def _calculate_cost_savings(self, 
                                    routing_data: Dict[str, Any],
                                    routing_analysis: Dict[str, Any]) -> Dict[str, Any]:
        """Calculate potential cost savings from optimal routing"""
        await asyncio.sleep(0.3)  # Simulate calculation
        
        transactions = routing_data["sample_transactions"]
        
        # Calculate actual costs vs optimal costs
        actual_total_cost = 0
        optimal_total_cost = 0
        savings_opportunities = []
        
        for transaction in transactions:
            actual_cost = transaction["amount"] * (transaction["actual_mdr"] / 100)
            optimal_cost = transaction["amount"] * (transaction["primary_mdr"] / 100)
            
            actual_total_cost += actual_cost
            optimal_total_cost += optimal_cost
            
            if not transaction["was_optimal"] and transaction["routing_reason"] != "primary_failure":
                savings_opportunity = actual_cost - optimal_cost
                if savings_opportunity > 0:
                    savings_opportunities.append({
                        "transaction_id": transaction["transaction_id"],
                        "amount": transaction["amount"],
                        "actual_acquirer": transaction["actual_acquirer"],
                        "optimal_acquirer": transaction["primary_acquirer"],
                        "actual_mdr": transaction["actual_mdr"],
                        "optimal_mdr": transaction["primary_mdr"],
                        "savings_amount": round(savings_opportunity, 2),
                        "savings_percentage": round((savings_opportunity / actual_cost) * 100, 2)
                    })
        
        total_potential_savings = actual_total_cost - optimal_total_cost
        
        # Calculate savings by acquirer pair
        acquirer_savings = {}
        for opportunity in savings_opportunities:
            pair = f"{opportunity['actual_acquirer']} -> {opportunity['optimal_acquirer']}"
            if pair not in acquirer_savings:
                acquirer_savings[pair] = {
                    "transaction_count": 0,
                    "total_savings": 0,
                    "avg_savings_per_transaction": 0
                }
            
            acquirer_savings[pair]["transaction_count"] += 1
            acquirer_savings[pair]["total_savings"] += opportunity["savings_amount"]
        
        # Calculate average savings per transaction for each pair
        for pair_data in acquirer_savings.values():
            if pair_data["transaction_count"] > 0:
                pair_data["avg_savings_per_transaction"] = round(
                    pair_data["total_savings"] / pair_data["transaction_count"], 2
                )
        
        # Monthly projection
        monthly_projection = total_potential_savings * 30  # Assuming daily analysis
        
        return {
            "actual_total_cost": round(actual_total_cost, 2),
            "optimal_total_cost": round(optimal_total_cost, 2),
            "total_potential_savings": round(total_potential_savings, 2),
            "savings_percentage": round((total_potential_savings / actual_total_cost) * 100, 2) if actual_total_cost > 0 else 0,
            "monthly_savings_projection": round(monthly_projection, 2),
            "savings_opportunities": savings_opportunities[:20],  # Top 20 opportunities
            "savings_by_acquirer_pair": acquirer_savings,
            "optimization_impact": {
                "transactions_with_savings": len(savings_opportunities),
                "avg_savings_per_opportunity": round(statistics.mean([s["savings_amount"] for s in savings_opportunities]), 2) if savings_opportunities else 0,
                "max_single_transaction_savings": max([s["savings_amount"] for s in savings_opportunities], default=0)
            }
        }
    
    async def _generate_routing_recommendations(self,
                                              routing_analysis: Dict[str, Any],
                                              cost_savings: Dict[str, Any]) -> Dict[str, Any]:
        """Generate routing optimization recommendations"""
        await asyncio.sleep(0.2)  # Simulate generation
        
        recommendations = []
        priority_actions = []
        
        # Analyze current performance
        efficiency_score = routing_analysis["routing_efficiency_score"]
        potential_savings = cost_savings["total_potential_savings"]
        primary_failure_rate = routing_analysis["analysis_summary"]["primary_failure_rate"]
        
        # Generate recommendations based on analysis
        if efficiency_score < 85:
            recommendations.append({
                "category": "routing_optimization",
                "title": "Improve Routing Decision Logic",
                "description": f"Routing efficiency is {efficiency_score:.1f}%. Target 85%+ for optimal performance",
                "priority": "high",
                "estimated_impact": "high",
                "implementation_effort": "medium",
                "potential_savings": round(potential_savings * 0.7, 2)
            })
            priority_actions.append("optimize_routing_logic")
        
        if potential_savings > 1000:
            recommendations.append({
                "category": "cost_optimization",
                "title": "Implement Smart Routing Rules",
                "description": f"Potential daily savings of ${potential_savings:.2f} through better routing decisions",
                "priority": "high",
                "estimated_impact": "high",
                "implementation_effort": "medium",
                "potential_savings": potential_savings
            })
            priority_actions.append("implement_smart_routing")
        
        if primary_failure_rate > 15:
            recommendations.append({
                "category": "reliability",
                "title": "Investigate Primary Acquirer Issues",
                "description": f"Primary failure rate is {primary_failure_rate:.1f}%. Investigate connectivity or capacity issues",
                "priority": "high",
                "estimated_impact": "medium",
                "implementation_effort": "low"
            })
            priority_actions.append("investigate_primary_failures")
        
        # Acquirer-specific recommendations
        acquirer_performance = routing_analysis["acquirer_performance"]
        for acquirer, stats in acquirer_performance.items():
            if "_Secondary" in acquirer and stats["transaction_count"] > 100:
                usage_rate = (stats["transaction_count"] / routing_analysis["total_transactions_analyzed"]) * 100
                if usage_rate > 25:  # High secondary usage
                    recommendations.append({
                        "category": "acquirer_optimization",
                        "title": f"Review {acquirer} Usage",
                        "description": f"{acquirer} handling {usage_rate:.1f}% of transactions. Consider primary acquirer optimization",
                        "priority": "medium",
                        "estimated_impact": "medium",
                        "implementation_effort": "low"
                    })
        
        # Cost savings recommendations
        if cost_savings["savings_by_acquirer_pair"]:
            top_savings_pair = max(cost_savings["savings_by_acquirer_pair"].items(), 
                                 key=lambda x: x[1]["total_savings"])
            recommendations.append({
                "category": "mdr_optimization",
                "title": "Focus on High-Impact Routing Pairs",
                "description": f"Routing pair '{top_savings_pair[0]}' has highest savings potential: ${top_savings_pair[1]['total_savings']:.2f}",
                "priority": "medium",
                "estimated_impact": "medium",
                "implementation_effort": "low"
            })
        
        # Calculate implementation roadmap
        implementation_roadmap = {
            "immediate": [r for r in recommendations if r["priority"] == "high"],
            "short_term": [r for r in recommendations if r["priority"] == "medium"],
            "long_term": [r for r in recommendations if r["priority"] == "low"]
        }
        
        return {
            "recommendations": recommendations,
            "priority_actions": priority_actions,
            "implementation_roadmap": implementation_roadmap,
            "expected_improvements": {
                "routing_efficiency_increase": f"{min(15, 100 - efficiency_score)}%",
                "cost_reduction": f"${potential_savings:.2f}/day",
                "monthly_savings": f"${cost_savings['monthly_savings_projection']:.2f}",
                "roi_timeline": "2-4 weeks"
            },
            "monitoring_kpis": [
                "Routing efficiency percentage",
                "Primary vs secondary usage ratio",
                "Daily cost savings achieved",
                "Primary acquirer failure rate",
                "Average MDR by routing decision"
            ]
        }