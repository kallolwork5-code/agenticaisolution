#!/usr/bin/env python3
"""
SLA Calculation Agent

Specialized agent for Service Level Agreement calculations including:
- Response time analysis
- Uptime monitoring
- Performance threshold compliance
- SLA breach detection and reporting
"""

import logging
import asyncio
from datetime import datetime, date, timedelta
from typing import Dict, Any, Optional, Callable
import random
import statistics

logger = logging.getLogger("sla-calculation-agent")

class SLACalculationAgent:
    """
    Agent responsible for calculating SLA metrics and monitoring compliance
    """
    
    def __init__(self):
        self.name = "SLA Calculation Agent"
        self.description = "Calculates SLA metrics, monitors compliance, and identifies performance issues"
        logger.info("SLA Calculation Agent initialized")
    
    async def execute(self, 
                     execution_date: date,
                     parameters: Dict[str, Any],
                     progress_callback: Optional[Callable] = None) -> Dict[str, Any]:
        """
        Execute SLA calculation for the given date
        """
        logger.info(f"Starting SLA calculation for {execution_date}")
        
        try:
            if progress_callback:
                try:
                    await progress_callback(10, "Initializing SLA calculations")
                except:
                    pass  # Ignore callback errors
            
            # Step 1: Load performance and transaction data
            sla_data = await self._load_sla_data(execution_date)
            if progress_callback:
                await progress_callback(25, f"Loaded SLA data for {sla_data['total_transactions']} transactions")
            
            # Step 2: Calculate response time SLAs
            response_time_sla = await self._calculate_response_time_sla(sla_data)
            if progress_callback:
                await progress_callback(45, "Calculated response time SLA metrics")
            
            # Step 3: Calculate uptime SLAs
            uptime_sla = await self._calculate_uptime_sla(sla_data)
            if progress_callback:
                await progress_callback(65, "Calculated uptime SLA metrics")
            
            # Step 4: Calculate throughput SLAs
            throughput_sla = await self._calculate_throughput_sla(sla_data)
            if progress_callback:
                await progress_callback(80, "Calculated throughput SLA metrics")
            
            # Step 5: Generate SLA summary and breach analysis
            sla_summary = await self._generate_sla_summary(
                response_time_sla, uptime_sla, throughput_sla
            )
            if progress_callback:
                await progress_callback(100, "SLA calculation completed")
            
            result = {
                "agent_name": self.name,
                "execution_date": execution_date.isoformat(),
                "status": "completed",
                "sla_data": sla_data,
                "response_time_sla": response_time_sla,
                "uptime_sla": uptime_sla,
                "throughput_sla": throughput_sla,
                "sla_summary": sla_summary,
                "compliance_percentage": sla_summary["overall_compliance"],
                "avg_response_time": response_time_sla["avg_response_time"],
                "uptime_percentage": uptime_sla["uptime_percentage"],
                "sla_breaches": sla_summary["total_breaches"]
            }
            
            logger.info(f"SLA calculation completed. Overall compliance: {result['compliance_percentage']:.1f}%")
            return result
            
        except Exception as e:
            logger.error(f"SLA calculation failed: {e}")
            return {
                "agent_name": self.name,
                "status": "failed",
                "error": str(e),
                "execution_date": execution_date.isoformat()
            }
    
    async def _load_sla_data(self, execution_date: date) -> Dict[str, Any]:
        """Load performance data for SLA calculations"""
        await asyncio.sleep(0.5)  # Simulate data loading
        
        # Generate realistic SLA-relevant data
        total_transactions = random.randint(8000, 15000)
        
        # Generate hourly performance data
        hourly_data = []
        for hour in range(24):
            # Simulate daily patterns
            if 6 <= hour <= 22:  # Business hours
                base_response_time = random.uniform(150, 400)
                base_throughput = random.uniform(80, 150)
                uptime = random.uniform(99.5, 100.0)
            else:  # Off hours
                base_response_time = random.uniform(100, 250)
                base_throughput = random.uniform(30, 80)
                uptime = random.uniform(99.8, 100.0)
            
            # Add some variance and occasional issues
            if random.random() < 0.1:  # 10% chance of performance issue
                base_response_time *= random.uniform(2.0, 4.0)
                uptime *= random.uniform(0.95, 0.99)
            
            hourly_data.append({
                "hour": hour,
                "avg_response_time": round(base_response_time, 1),
                "max_response_time": round(base_response_time * random.uniform(1.5, 3.0), 1),
                "min_response_time": round(base_response_time * random.uniform(0.3, 0.7), 1),
                "throughput_tps": round(base_throughput, 1),
                "uptime_percentage": round(uptime, 3),
                "error_rate": round(random.uniform(0, 0.5), 4),
                "transactions": int(total_transactions / 24)
            })
        
        # System availability data
        availability_data = {
            "planned_downtime_minutes": random.randint(0, 30),
            "unplanned_downtime_minutes": random.randint(0, 15),
            "maintenance_windows": random.randint(0, 2),
            "incident_count": random.randint(0, 3)
        }
        
        return {
            "execution_date": execution_date.isoformat(),
            "total_transactions": total_transactions,
            "hourly_performance": hourly_data,
            "availability_data": availability_data,
            "sla_thresholds": {
                "response_time_ms": 500,      # 500ms SLA
                "uptime_percentage": 99.9,    # 99.9% uptime SLA
                "throughput_tps": 100,        # 100 TPS minimum
                "error_rate_max": 0.1         # 0.1% max error rate
            }
        }
    
    async def _calculate_response_time_sla(self, sla_data: Dict[str, Any]) -> Dict[str, Any]:
        """Calculate response time SLA metrics"""
        await asyncio.sleep(0.3)  # Simulate calculation
        
        hourly_data = sla_data["hourly_performance"]
        sla_threshold = sla_data["sla_thresholds"]["response_time_ms"]
        
        # Extract response time data
        avg_response_times = [h["avg_response_time"] for h in hourly_data]
        max_response_times = [h["max_response_time"] for h in hourly_data]
        
        # Calculate statistics
        overall_avg_response = statistics.mean(avg_response_times)
        overall_max_response = max(max_response_times)
        overall_min_response = min([h["min_response_time"] for h in hourly_data])
        
        # Calculate SLA compliance
        compliant_hours = len([rt for rt in avg_response_times if rt <= sla_threshold])
        compliance_percentage = (compliant_hours / len(avg_response_times)) * 100
        
        # Identify SLA breaches
        breaches = []
        for hour_data in hourly_data:
            if hour_data["avg_response_time"] > sla_threshold:
                breaches.append({
                    "hour": hour_data["hour"],
                    "avg_response_time": hour_data["avg_response_time"],
                    "max_response_time": hour_data["max_response_time"],
                    "breach_severity": "critical" if hour_data["avg_response_time"] > sla_threshold * 2 else "major",
                    "transactions_affected": hour_data["transactions"]
                })
        
        # Performance trends
        first_half_avg = statistics.mean(avg_response_times[:12])
        second_half_avg = statistics.mean(avg_response_times[12:])
        trend = "improving" if second_half_avg < first_half_avg else "degrading" if second_half_avg > first_half_avg else "stable"
        
        # Calculate percentiles
        sorted_response_times = sorted(avg_response_times)
        percentile_95 = sorted_response_times[int(len(sorted_response_times) * 0.95)]
        percentile_99 = sorted_response_times[int(len(sorted_response_times) * 0.99)]
        
        return {
            "avg_response_time": round(overall_avg_response, 1),
            "max_response_time": round(overall_max_response, 1),
            "min_response_time": round(overall_min_response, 1),
            "percentile_95": round(percentile_95, 1),
            "percentile_99": round(percentile_99, 1),
            "sla_threshold": sla_threshold,
            "compliance_percentage": round(compliance_percentage, 2),
            "compliant_hours": compliant_hours,
            "total_hours": len(avg_response_times),
            "breaches": breaches,
            "breach_count": len(breaches),
            "performance_trend": trend,
            "sla_status": "met" if compliance_percentage >= 95 else "missed",
            "improvement_needed": max(0, overall_avg_response - sla_threshold)
        }
    
    async def _calculate_uptime_sla(self, sla_data: Dict[str, Any]) -> Dict[str, Any]:
        """Calculate uptime SLA metrics"""
        await asyncio.sleep(0.3)  # Simulate calculation
        
        hourly_data = sla_data["hourly_performance"]
        availability_data = sla_data["availability_data"]
        sla_threshold = sla_data["sla_thresholds"]["uptime_percentage"]
        
        # Calculate overall uptime
        hourly_uptimes = [h["uptime_percentage"] for h in hourly_data]
        overall_uptime = statistics.mean(hourly_uptimes)
        
        # Calculate downtime
        total_minutes_in_day = 24 * 60
        planned_downtime = availability_data["planned_downtime_minutes"]
        unplanned_downtime = availability_data["unplanned_downtime_minutes"]
        total_downtime = planned_downtime + unplanned_downtime
        
        # Adjusted uptime (excluding planned maintenance)
        adjusted_uptime = ((total_minutes_in_day - total_downtime) / total_minutes_in_day) * 100
        
        # SLA compliance
        sla_compliance = overall_uptime >= sla_threshold
        
        # Identify availability incidents
        incidents = []
        for hour_data in hourly_data:
            if hour_data["uptime_percentage"] < 99.0:
                incidents.append({
                    "hour": hour_data["hour"],
                    "uptime_percentage": hour_data["uptime_percentage"],
                    "estimated_downtime_minutes": round((100 - hour_data["uptime_percentage"]) * 0.6, 1),
                    "severity": "critical" if hour_data["uptime_percentage"] < 95 else "major"
                })
        
        # Calculate availability metrics
        mtbf = 24 / max(1, len(incidents))  # Mean Time Between Failures (hours)
        mttr = total_downtime / max(1, availability_data["incident_count"])  # Mean Time To Recovery (minutes)
        
        return {
            "uptime_percentage": round(overall_uptime, 3),
            "adjusted_uptime_percentage": round(adjusted_uptime, 3),
            "sla_threshold": sla_threshold,
            "sla_compliance": sla_compliance,
            "total_downtime_minutes": total_downtime,
            "planned_downtime_minutes": planned_downtime,
            "unplanned_downtime_minutes": unplanned_downtime,
            "incidents": incidents,
            "incident_count": len(incidents),
            "mtbf_hours": round(mtbf, 2),
            "mttr_minutes": round(mttr, 1),
            "availability_grade": self._get_availability_grade(overall_uptime),
            "sla_status": "met" if sla_compliance else "missed",
            "downtime_cost_estimate": self._estimate_downtime_cost(total_downtime, sla_data["total_transactions"])
        }
    
    def _get_availability_grade(self, uptime: float) -> str:
        """Convert uptime percentage to availability grade"""
        if uptime >= 99.99:
            return "A+"
        elif uptime >= 99.9:
            return "A"
        elif uptime >= 99.5:
            return "B"
        elif uptime >= 99.0:
            return "C"
        else:
            return "D"
    
    def _estimate_downtime_cost(self, downtime_minutes: int, total_transactions: int) -> Dict[str, Any]:
        """Estimate the cost impact of downtime"""
        # Assume average transaction value and processing fee
        avg_transaction_value = 150.0
        processing_fee_rate = 0.025  # 2.5%
        
        # Estimate transactions lost during downtime
        transactions_per_minute = total_transactions / (24 * 60)
        lost_transactions = int(downtime_minutes * transactions_per_minute)
        
        # Calculate revenue impact
        lost_revenue = lost_transactions * avg_transaction_value * processing_fee_rate
        
        return {
            "downtime_minutes": downtime_minutes,
            "estimated_lost_transactions": lost_transactions,
            "estimated_revenue_loss": round(lost_revenue, 2),
            "cost_per_minute": round(lost_revenue / max(1, downtime_minutes), 2)
        }
    
    async def _calculate_throughput_sla(self, sla_data: Dict[str, Any]) -> Dict[str, Any]:
        """Calculate throughput SLA metrics"""
        await asyncio.sleep(0.3)  # Simulate calculation
        
        hourly_data = sla_data["hourly_performance"]
        sla_threshold = sla_data["sla_thresholds"]["throughput_tps"]
        
        # Extract throughput data
        throughput_values = [h["throughput_tps"] for h in hourly_data]
        
        # Calculate statistics
        avg_throughput = statistics.mean(throughput_values)
        max_throughput = max(throughput_values)
        min_throughput = min(throughput_values)
        
        # Calculate SLA compliance
        compliant_hours = len([tp for tp in throughput_values if tp >= sla_threshold])
        compliance_percentage = (compliant_hours / len(throughput_values)) * 100
        
        # Identify throughput shortfalls
        shortfalls = []
        for hour_data in hourly_data:
            if hour_data["throughput_tps"] < sla_threshold:
                shortfall_amount = sla_threshold - hour_data["throughput_tps"]
                shortfalls.append({
                    "hour": hour_data["hour"],
                    "actual_throughput": hour_data["throughput_tps"],
                    "shortfall_tps": round(shortfall_amount, 1),
                    "shortfall_percentage": round((shortfall_amount / sla_threshold) * 100, 1),
                    "severity": "critical" if shortfall_amount > sla_threshold * 0.5 else "major"
                })
        
        # Peak and off-peak analysis
        business_hours_throughput = [h["throughput_tps"] for h in hourly_data if 6 <= h["hour"] <= 22]
        off_hours_throughput = [h["throughput_tps"] for h in hourly_data if h["hour"] < 6 or h["hour"] > 22]
        
        peak_avg = statistics.mean(business_hours_throughput) if business_hours_throughput else 0
        off_peak_avg = statistics.mean(off_hours_throughput) if off_hours_throughput else 0
        
        # Capacity utilization
        theoretical_max_throughput = 200  # Assume 200 TPS theoretical maximum
        capacity_utilization = (max_throughput / theoretical_max_throughput) * 100
        
        return {
            "avg_throughput": round(avg_throughput, 1),
            "max_throughput": round(max_throughput, 1),
            "min_throughput": round(min_throughput, 1),
            "sla_threshold": sla_threshold,
            "compliance_percentage": round(compliance_percentage, 2),
            "compliant_hours": compliant_hours,
            "total_hours": len(throughput_values),
            "shortfalls": shortfalls,
            "shortfall_count": len(shortfalls),
            "peak_hours_avg": round(peak_avg, 1),
            "off_peak_avg": round(off_peak_avg, 1),
            "capacity_utilization": round(capacity_utilization, 1),
            "headroom_tps": round(theoretical_max_throughput - max_throughput, 1),
            "sla_status": "met" if compliance_percentage >= 95 else "missed",
            "performance_consistency": self._calculate_throughput_consistency(throughput_values)
        }
    
    def _calculate_throughput_consistency(self, throughput_values: list) -> Dict[str, Any]:
        """Calculate throughput consistency metrics"""
        if len(throughput_values) < 2:
            return {"coefficient_of_variation": 0, "consistency_score": 100}
        
        mean_throughput = statistics.mean(throughput_values)
        std_dev = statistics.stdev(throughput_values)
        
        coefficient_of_variation = (std_dev / mean_throughput) * 100 if mean_throughput > 0 else 0
        consistency_score = max(0, 100 - coefficient_of_variation)
        
        return {
            "coefficient_of_variation": round(coefficient_of_variation, 2),
            "consistency_score": round(consistency_score, 1),
            "consistency_grade": "excellent" if consistency_score >= 90 else "good" if consistency_score >= 80 else "fair" if consistency_score >= 70 else "poor"
        }
    
    async def _generate_sla_summary(self,
                                  response_time_sla: Dict[str, Any],
                                  uptime_sla: Dict[str, Any],
                                  throughput_sla: Dict[str, Any]) -> Dict[str, Any]:
        """Generate comprehensive SLA summary"""
        await asyncio.sleep(0.2)  # Simulate summary generation
        
        # Calculate overall compliance score
        response_weight = 0.4
        uptime_weight = 0.4
        throughput_weight = 0.2
        
        overall_compliance = (
            response_time_sla["compliance_percentage"] * response_weight +
            (100 if uptime_sla["sla_compliance"] else 0) * uptime_weight +
            throughput_sla["compliance_percentage"] * throughput_weight
        )
        
        # Count total breaches
        total_breaches = (
            response_time_sla["breach_count"] +
            uptime_sla["incident_count"] +
            throughput_sla["shortfall_count"]
        )
        
        # Determine overall SLA status
        if overall_compliance >= 99:
            sla_status = "excellent"
        elif overall_compliance >= 95:
            sla_status = "good"
        elif overall_compliance >= 90:
            sla_status = "acceptable"
        else:
            sla_status = "poor"
        
        # Generate key findings
        key_findings = []
        
        if response_time_sla["compliance_percentage"] < 95:
            key_findings.append(f"Response time SLA missed with {response_time_sla['compliance_percentage']:.1f}% compliance")
        
        if not uptime_sla["sla_compliance"]:
            key_findings.append(f"Uptime SLA missed with {uptime_sla['uptime_percentage']:.2f}% availability")
        
        if throughput_sla["compliance_percentage"] < 95:
            key_findings.append(f"Throughput SLA missed with {throughput_sla['compliance_percentage']:.1f}% compliance")
        
        if not key_findings:
            key_findings.append("All SLA targets met successfully")
        
        # Generate recommendations
        recommendations = []
        
        if response_time_sla["avg_response_time"] > response_time_sla["sla_threshold"]:
            recommendations.append("Optimize application performance to reduce response times")
        
        if uptime_sla["unplanned_downtime_minutes"] > 10:
            recommendations.append("Implement proactive monitoring to reduce unplanned downtime")
        
        if throughput_sla["capacity_utilization"] > 80:
            recommendations.append("Consider scaling infrastructure to handle peak loads")
        
        if total_breaches > 5:
            recommendations.append("Review and strengthen SLA monitoring and alerting")
        
        # SLA dashboard data
        dashboard_data = {
            "sla_scores": {
                "response_time": response_time_sla["compliance_percentage"],
                "uptime": 100 if uptime_sla["sla_compliance"] else uptime_sla["uptime_percentage"],
                "throughput": throughput_sla["compliance_percentage"],
                "overall": round(overall_compliance, 1)
            },
            "key_metrics": {
                "avg_response_time": response_time_sla["avg_response_time"],
                "uptime_percentage": uptime_sla["uptime_percentage"],
                "avg_throughput": throughput_sla["avg_throughput"],
                "total_breaches": total_breaches
            },
            "trends": {
                "response_time_trend": response_time_sla["performance_trend"],
                "availability_grade": uptime_sla["availability_grade"],
                "throughput_consistency": throughput_sla["performance_consistency"]["consistency_grade"]
            }
        }
        
        return {
            "overall_compliance": round(overall_compliance, 2),
            "sla_status": sla_status,
            "total_breaches": total_breaches,
            "key_findings": key_findings,
            "recommendations": recommendations,
            "dashboard_data": dashboard_data,
            "sla_breakdown": {
                "response_time": {
                    "status": response_time_sla["sla_status"],
                    "compliance": response_time_sla["compliance_percentage"],
                    "breaches": response_time_sla["breach_count"]
                },
                "uptime": {
                    "status": uptime_sla["sla_status"],
                    "compliance": 100 if uptime_sla["sla_compliance"] else uptime_sla["uptime_percentage"],
                    "incidents": uptime_sla["incident_count"]
                },
                "throughput": {
                    "status": throughput_sla["sla_status"],
                    "compliance": throughput_sla["compliance_percentage"],
                    "shortfalls": throughput_sla["shortfall_count"]
                }
            },
            "business_impact": {
                "estimated_revenue_loss": uptime_sla["downtime_cost_estimate"]["estimated_revenue_loss"],
                "customer_satisfaction_impact": "high" if overall_compliance < 90 else "medium" if overall_compliance < 95 else "low",
                "reputation_risk": "high" if total_breaches > 10 else "medium" if total_breaches > 5 else "low"
            }
        }