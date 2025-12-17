#!/usr/bin/env python3
"""
Performance Analysis Agent

Specialized agent for system performance analysis including:
- Transaction throughput analysis
- Response time monitoring
- System capacity assessment
- Performance optimization recommendations
"""

import logging
import asyncio
from datetime import datetime, date, timedelta
from typing import Dict, Any, Optional, Callable
import random
import statistics

logger = logging.getLogger("performance-analysis-agent")

class PerformanceAnalysisAgent:
    """
    Agent responsible for analyzing system performance metrics and identifying optimization opportunities
    """
    
    def __init__(self):
        self.name = "Performance Analysis Agent"
        self.description = "Analyzes system performance, throughput, and identifies optimization opportunities"
        logger.info("Performance Analysis Agent initialized")
    
    async def execute(self, 
                     execution_date: date,
                     parameters: Dict[str, Any],
                     progress_callback: Optional[Callable] = None) -> Dict[str, Any]:
        """
        Execute performance analysis for the given date
        """
        logger.info(f"Starting performance analysis for {execution_date}")
        
        try:
            if progress_callback:
                await progress_callback(10, "Initializing performance analysis")
            
            # Step 1: Load system performance data
            performance_data = await self._load_performance_data(execution_date)
            if progress_callback:
                await progress_callback(25, f"Loaded performance data for {performance_data['total_data_points']} measurements")
            
            # Step 2: Analyze throughput metrics
            throughput_analysis = await self._analyze_throughput(performance_data)
            if progress_callback:
                await progress_callback(45, "Completed throughput analysis")
            
            # Step 3: Analyze response times and latency
            latency_analysis = await self._analyze_latency(performance_data)
            if progress_callback:
                await progress_callback(65, "Completed latency and response time analysis")
            
            # Step 4: Assess system capacity and utilization
            capacity_analysis = await self._analyze_capacity(performance_data)
            if progress_callback:
                await progress_callback(80, "Completed capacity utilization analysis")
            
            # Step 5: Generate performance optimization recommendations
            optimization_recommendations = await self._generate_optimization_recommendations(
                throughput_analysis, latency_analysis, capacity_analysis
            )
            if progress_callback:
                await progress_callback(100, "Performance analysis completed")
            
            result = {
                "agent_name": self.name,
                "execution_date": execution_date.isoformat(),
                "status": "completed",
                "performance_data": performance_data,
                "throughput_analysis": throughput_analysis,
                "latency_analysis": latency_analysis,
                "capacity_analysis": capacity_analysis,
                "optimization_recommendations": optimization_recommendations,
                "throughput": throughput_analysis["avg_tps"],
                "avg_response_time": latency_analysis["avg_response_time"],
                "error_rate": throughput_analysis["error_rate"],
                "capacity_utilization": capacity_analysis["overall_utilization"]
            }
            
            logger.info(f"Performance analysis completed. Avg TPS: {result['throughput']:.1f}, Avg Response: {result['avg_response_time']:.0f}ms")
            return result
            
        except Exception as e:
            logger.error(f"Performance analysis failed: {e}")
            return {
                "agent_name": self.name,
                "status": "failed",
                "error": str(e),
                "execution_date": execution_date.isoformat()
            }
    
    async def _load_performance_data(self, execution_date: date) -> Dict[str, Any]:
        """Load system performance data for analysis"""
        await asyncio.sleep(0.5)  # Simulate data loading
        
        # Generate realistic performance data for 24 hours
        hours = 24
        data_points_per_hour = 60  # One measurement per minute
        total_data_points = hours * data_points_per_hour
        
        performance_metrics = []
        
        for hour in range(hours):
            # Simulate daily traffic patterns
            if 6 <= hour <= 22:  # Business hours
                base_tps = random.uniform(80, 150)
                base_response_time = random.uniform(150, 300)
                base_cpu = random.uniform(40, 70)
            else:  # Off hours
                base_tps = random.uniform(20, 50)
                base_response_time = random.uniform(100, 200)
                base_cpu = random.uniform(15, 35)
            
            # Add peak hour variations
            if 10 <= hour <= 14:  # Peak hours
                base_tps *= random.uniform(1.3, 1.8)
                base_response_time *= random.uniform(1.2, 1.6)
                base_cpu *= random.uniform(1.4, 1.7)
            
            for minute in range(data_points_per_hour):
                # Add minute-level variations
                tps_variance = random.uniform(0.8, 1.2)
                response_variance = random.uniform(0.9, 1.3)
                cpu_variance = random.uniform(0.9, 1.1)
                
                # Simulate occasional spikes
                if random.random() < 0.05:  # 5% chance of spike
                    tps_variance *= random.uniform(1.5, 2.5)
                    response_variance *= random.uniform(1.8, 3.0)
                    cpu_variance *= random.uniform(1.6, 2.2)
                
                timestamp = datetime.combine(execution_date, datetime.min.time()) + timedelta(hours=hour, minutes=minute)
                
                metric = {
                    "timestamp": timestamp.isoformat(),
                    "transactions_per_second": round(base_tps * tps_variance, 2),
                    "avg_response_time_ms": round(base_response_time * response_variance, 1),
                    "cpu_utilization": min(100, round(base_cpu * cpu_variance, 1)),
                    "memory_utilization": random.uniform(30, 80),
                    "disk_io_utilization": random.uniform(10, 60),
                    "network_utilization": random.uniform(20, 70),
                    "active_connections": random.randint(50, 500),
                    "error_count": random.randint(0, 5) if random.random() < 0.3 else 0,
                    "success_count": int(base_tps * tps_variance * 60)  # Approximate successful transactions per minute
                }
                
                performance_metrics.append(metric)
        
        return {
            "execution_date": execution_date.isoformat(),
            "total_data_points": total_data_points,
            "measurement_interval": "1_minute",
            "metrics": performance_metrics,
            "data_quality": "high"
        }
    
    async def _analyze_throughput(self, performance_data: Dict[str, Any]) -> Dict[str, Any]:
        """Analyze transaction throughput patterns"""
        await asyncio.sleep(0.4)  # Simulate analysis
        
        metrics = performance_data["metrics"]
        
        # Extract throughput data
        tps_values = [m["transactions_per_second"] for m in metrics]
        success_counts = [m["success_count"] for m in metrics]
        error_counts = [m["error_count"] for m in metrics]
        
        # Calculate throughput statistics
        throughput_stats = {
            "avg_tps": round(statistics.mean(tps_values), 2),
            "median_tps": round(statistics.median(tps_values), 2),
            "max_tps": round(max(tps_values), 2),
            "min_tps": round(min(tps_values), 2),
            "std_dev_tps": round(statistics.stdev(tps_values), 2),
            "percentile_95": round(sorted(tps_values)[int(len(tps_values) * 0.95)], 2),
            "percentile_99": round(sorted(tps_values)[int(len(tps_values) * 0.99)], 2)
        }
        
        # Calculate error rates
        total_transactions = sum(success_counts) + sum(error_counts)
        total_errors = sum(error_counts)
        error_rate = (total_errors / total_transactions) * 100 if total_transactions > 0 else 0
        
        # Identify peak periods
        peak_threshold = throughput_stats["percentile_95"]
        peak_periods = []
        
        current_peak = None
        for i, metric in enumerate(metrics):
            if metric["transactions_per_second"] >= peak_threshold:
                if current_peak is None:
                    current_peak = {
                        "start_time": metric["timestamp"],
                        "peak_tps": metric["transactions_per_second"],
                        "duration_minutes": 1
                    }
                else:
                    current_peak["duration_minutes"] += 1
                    current_peak["peak_tps"] = max(current_peak["peak_tps"], metric["transactions_per_second"])
            else:
                if current_peak is not None:
                    current_peak["end_time"] = metrics[i-1]["timestamp"]
                    peak_periods.append(current_peak)
                    current_peak = None
        
        # Throughput trends
        hourly_averages = {}
        for metric in metrics:
            hour = int(metric["timestamp"].split("T")[1].split(":")[0])
            if hour not in hourly_averages:
                hourly_averages[hour] = []
            hourly_averages[hour].append(metric["transactions_per_second"])
        
        hourly_tps = {hour: round(statistics.mean(values), 2) for hour, values in hourly_averages.items()}
        
        return {
            "throughput_statistics": throughput_stats,
            "error_rate": round(error_rate, 4),
            "total_transactions_processed": total_transactions,
            "total_errors": total_errors,
            "peak_periods": peak_periods[:10],  # Top 10 peak periods
            "hourly_throughput": hourly_tps,
            "throughput_stability": self._calculate_stability_score(tps_values),
            "capacity_headroom": max(0, 200 - throughput_stats["max_tps"])  # Assuming 200 TPS capacity
        }
    
    def _calculate_stability_score(self, values: list) -> float:
        """Calculate stability score based on coefficient of variation"""
        if not values:
            return 0
        
        mean_val = statistics.mean(values)
        std_dev = statistics.stdev(values) if len(values) > 1 else 0
        
        if mean_val == 0:
            return 0
        
        coefficient_of_variation = std_dev / mean_val
        stability_score = max(0, 100 - (coefficient_of_variation * 100))
        return round(stability_score, 2)
    
    async def _analyze_latency(self, performance_data: Dict[str, Any]) -> Dict[str, Any]:
        """Analyze response time and latency patterns"""
        await asyncio.sleep(0.3)  # Simulate analysis
        
        metrics = performance_data["metrics"]
        response_times = [m["avg_response_time_ms"] for m in metrics]
        
        # Calculate latency statistics
        latency_stats = {
            "avg_response_time": round(statistics.mean(response_times), 1),
            "median_response_time": round(statistics.median(response_times), 1),
            "max_response_time": round(max(response_times), 1),
            "min_response_time": round(min(response_times), 1),
            "std_dev_response_time": round(statistics.stdev(response_times), 1),
            "percentile_95": round(sorted(response_times)[int(len(response_times) * 0.95)], 1),
            "percentile_99": round(sorted(response_times)[int(len(response_times) * 0.99)], 1)
        }
        
        # SLA compliance (assuming 500ms SLA)
        sla_threshold = 500
        sla_compliant = len([rt for rt in response_times if rt <= sla_threshold])
        sla_compliance_rate = (sla_compliant / len(response_times)) * 100
        
        # Identify latency spikes
        spike_threshold = latency_stats["percentile_95"]
        latency_spikes = []
        
        for i, metric in enumerate(metrics):
            if metric["avg_response_time_ms"] >= spike_threshold:
                latency_spikes.append({
                    "timestamp": metric["timestamp"],
                    "response_time": metric["avg_response_time_ms"],
                    "tps_at_spike": metric["transactions_per_second"],
                    "cpu_utilization": metric["cpu_utilization"]
                })
        
        # Hourly latency trends
        hourly_latency = {}
        for metric in metrics:
            hour = int(metric["timestamp"].split("T")[1].split(":")[0])
            if hour not in hourly_latency:
                hourly_latency[hour] = []
            hourly_latency[hour].append(metric["avg_response_time_ms"])
        
        hourly_avg_latency = {hour: round(statistics.mean(values), 1) for hour, values in hourly_latency.items()}
        
        return {
            "latency_statistics": latency_stats,
            "sla_compliance": {
                "threshold_ms": sla_threshold,
                "compliance_rate": round(sla_compliance_rate, 2),
                "violations": len(response_times) - sla_compliant
            },
            "latency_spikes": latency_spikes[:20],  # Top 20 spikes
            "hourly_latency": hourly_avg_latency,
            "latency_stability": self._calculate_stability_score(response_times),
            "performance_grade": self._calculate_performance_grade(latency_stats, sla_compliance_rate)
        }
    
    def _calculate_performance_grade(self, latency_stats: Dict[str, Any], sla_compliance: float) -> str:
        """Calculate overall performance grade"""
        avg_response = latency_stats["avg_response_time"]
        
        if sla_compliance >= 99 and avg_response <= 200:
            return "A+"
        elif sla_compliance >= 95 and avg_response <= 300:
            return "A"
        elif sla_compliance >= 90 and avg_response <= 400:
            return "B"
        elif sla_compliance >= 80 and avg_response <= 600:
            return "C"
        else:
            return "D"
    
    async def _analyze_capacity(self, performance_data: Dict[str, Any]) -> Dict[str, Any]:
        """Analyze system capacity and resource utilization"""
        await asyncio.sleep(0.4)  # Simulate analysis
        
        metrics = performance_data["metrics"]
        
        # Extract resource utilization data
        cpu_values = [m["cpu_utilization"] for m in metrics]
        memory_values = [m["memory_utilization"] for m in metrics]
        disk_values = [m["disk_io_utilization"] for m in metrics]
        network_values = [m["network_utilization"] for m in metrics]
        connection_values = [m["active_connections"] for m in metrics]
        
        # Calculate resource statistics
        resource_stats = {
            "cpu": {
                "avg_utilization": round(statistics.mean(cpu_values), 1),
                "max_utilization": round(max(cpu_values), 1),
                "percentile_95": round(sorted(cpu_values)[int(len(cpu_values) * 0.95)], 1)
            },
            "memory": {
                "avg_utilization": round(statistics.mean(memory_values), 1),
                "max_utilization": round(max(memory_values), 1),
                "percentile_95": round(sorted(memory_values)[int(len(memory_values) * 0.95)], 1)
            },
            "disk_io": {
                "avg_utilization": round(statistics.mean(disk_values), 1),
                "max_utilization": round(max(disk_values), 1),
                "percentile_95": round(sorted(disk_values)[int(len(disk_values) * 0.95)], 1)
            },
            "network": {
                "avg_utilization": round(statistics.mean(network_values), 1),
                "max_utilization": round(max(network_values), 1),
                "percentile_95": round(sorted(network_values)[int(len(network_values) * 0.95)], 1)
            }
        }
        
        # Calculate overall utilization
        overall_utilization = statistics.mean([
            resource_stats["cpu"]["avg_utilization"],
            resource_stats["memory"]["avg_utilization"],
            resource_stats["disk_io"]["avg_utilization"],
            resource_stats["network"]["avg_utilization"]
        ])
        
        # Identify resource bottlenecks
        bottlenecks = []
        for resource, stats in resource_stats.items():
            if stats["percentile_95"] > 80:
                bottlenecks.append({
                    "resource": resource,
                    "severity": "high" if stats["percentile_95"] > 90 else "medium",
                    "peak_utilization": stats["max_utilization"],
                    "avg_utilization": stats["avg_utilization"]
                })
        
        # Connection analysis
        connection_stats = {
            "avg_connections": round(statistics.mean(connection_values), 0),
            "max_connections": max(connection_values),
            "connection_stability": self._calculate_stability_score(connection_values)
        }
        
        # Capacity headroom analysis
        headroom_analysis = {}
        for resource, stats in resource_stats.items():
            headroom_analysis[resource] = {
                "current_peak": stats["percentile_95"],
                "headroom_percent": round(100 - stats["percentile_95"], 1),
                "estimated_capacity_days": self._estimate_capacity_days(stats["percentile_95"])
            }
        
        return {
            "resource_utilization": resource_stats,
            "overall_utilization": round(overall_utilization, 1),
            "bottlenecks": bottlenecks,
            "connection_analysis": connection_stats,
            "headroom_analysis": headroom_analysis,
            "capacity_status": self._get_capacity_status(overall_utilization),
            "scaling_recommendations": self._get_scaling_recommendations(resource_stats, bottlenecks)
        }
    
    def _estimate_capacity_days(self, current_utilization: float) -> int:
        """Estimate days until capacity limit based on current utilization"""
        if current_utilization >= 95:
            return 0
        elif current_utilization >= 85:
            return random.randint(7, 30)
        elif current_utilization >= 70:
            return random.randint(30, 90)
        else:
            return random.randint(90, 365)
    
    def _get_capacity_status(self, utilization: float) -> str:
        """Get capacity status based on utilization"""
        if utilization >= 85:
            return "critical"
        elif utilization >= 70:
            return "warning"
        elif utilization >= 50:
            return "healthy"
        else:
            return "optimal"
    
    def _get_scaling_recommendations(self, resource_stats: Dict[str, Any], bottlenecks: list) -> list:
        """Generate scaling recommendations based on resource analysis"""
        recommendations = []
        
        for bottleneck in bottlenecks:
            resource = bottleneck["resource"]
            severity = bottleneck["severity"]
            
            if resource == "cpu" and severity == "high":
                recommendations.append("Consider CPU scaling or optimization")
            elif resource == "memory" and severity == "high":
                recommendations.append("Increase memory allocation or optimize memory usage")
            elif resource == "disk_io" and severity == "high":
                recommendations.append("Upgrade to faster storage or implement caching")
            elif resource == "network" and severity == "high":
                recommendations.append("Optimize network usage or increase bandwidth")
        
        if not bottlenecks:
            recommendations.append("System is operating within normal capacity limits")
        
        return recommendations
    
    async def _generate_optimization_recommendations(self,
                                                   throughput_analysis: Dict[str, Any],
                                                   latency_analysis: Dict[str, Any],
                                                   capacity_analysis: Dict[str, Any]) -> Dict[str, Any]:
        """Generate comprehensive performance optimization recommendations"""
        await asyncio.sleep(0.3)  # Simulate generation
        
        recommendations = []
        priority_actions = []
        
        # Throughput optimization
        if throughput_analysis["throughput_stability"] < 80:
            recommendations.append({
                "category": "throughput",
                "title": "Improve Throughput Stability",
                "description": f"Throughput stability is {throughput_analysis['throughput_stability']:.1f}%. Investigate load balancing and resource allocation.",
                "priority": "high",
                "estimated_impact": "high",
                "implementation_effort": "medium"
            })
            priority_actions.append("stabilize_throughput")
        
        # Latency optimization
        if latency_analysis["sla_compliance"]["compliance_rate"] < 95:
            recommendations.append({
                "category": "latency",
                "title": "Improve Response Time SLA Compliance",
                "description": f"SLA compliance is {latency_analysis['sla_compliance']['compliance_rate']:.1f}%. Target 95%+ compliance.",
                "priority": "high",
                "estimated_impact": "high",
                "implementation_effort": "medium"
            })
            priority_actions.append("improve_sla_compliance")
        
        if latency_analysis["latency_statistics"]["avg_response_time"] > 300:
            recommendations.append({
                "category": "latency",
                "title": "Optimize Average Response Time",
                "description": f"Average response time is {latency_analysis['latency_statistics']['avg_response_time']:.1f}ms. Target <300ms.",
                "priority": "medium",
                "estimated_impact": "medium",
                "implementation_effort": "medium"
            })
        
        # Capacity optimization
        if capacity_analysis["capacity_status"] in ["critical", "warning"]:
            recommendations.append({
                "category": "capacity",
                "title": "Address Capacity Constraints",
                "description": f"System capacity is at {capacity_analysis['capacity_status']} level. Consider scaling resources.",
                "priority": "high" if capacity_analysis["capacity_status"] == "critical" else "medium",
                "estimated_impact": "high",
                "implementation_effort": "high"
            })
            priority_actions.append("scale_resources")
        
        # Bottleneck-specific recommendations
        for bottleneck in capacity_analysis["bottlenecks"]:
            recommendations.append({
                "category": "bottleneck",
                "title": f"Address {bottleneck['resource'].upper()} Bottleneck",
                "description": f"{bottleneck['resource'].upper()} utilization peaks at {bottleneck['peak_utilization']:.1f}%",
                "priority": bottleneck["severity"],
                "estimated_impact": "medium",
                "implementation_effort": "medium"
            })
        
        # Error rate optimization
        if throughput_analysis["error_rate"] > 0.1:
            recommendations.append({
                "category": "reliability",
                "title": "Reduce Error Rate",
                "description": f"Error rate is {throughput_analysis['error_rate']:.4f}%. Investigate and fix error sources.",
                "priority": "high",
                "estimated_impact": "high",
                "implementation_effort": "medium"
            })
            priority_actions.append("reduce_errors")
        
        # Performance monitoring recommendations
        recommendations.append({
            "category": "monitoring",
            "title": "Enhance Performance Monitoring",
            "description": "Implement real-time alerting for performance degradation",
            "priority": "low",
            "estimated_impact": "medium",
            "implementation_effort": "low"
        })
        
        # Calculate optimization potential
        optimization_potential = self._calculate_optimization_potential(
            throughput_analysis, latency_analysis, capacity_analysis
        )
        
        return {
            "recommendations": recommendations,
            "priority_actions": priority_actions,
            "optimization_potential": optimization_potential,
            "implementation_roadmap": {
                "immediate": [r for r in recommendations if r["priority"] == "high"],
                "short_term": [r for r in recommendations if r["priority"] == "medium"],
                "long_term": [r for r in recommendations if r["priority"] == "low"]
            },
            "expected_improvements": {
                "throughput_increase": f"{random.randint(10, 30)}%",
                "latency_reduction": f"{random.randint(15, 40)}%",
                "capacity_headroom": f"{random.randint(20, 50)}%",
                "error_reduction": f"{random.randint(30, 70)}%"
            }
        }
    
    def _calculate_optimization_potential(self,
                                        throughput_analysis: Dict[str, Any],
                                        latency_analysis: Dict[str, Any],
                                        capacity_analysis: Dict[str, Any]) -> Dict[str, Any]:
        """Calculate overall optimization potential score"""
        
        # Score components (0-100)
        throughput_score = min(100, throughput_analysis["throughput_stability"])
        latency_score = min(100, latency_analysis["sla_compliance"]["compliance_rate"])
        capacity_score = max(0, 100 - capacity_analysis["overall_utilization"])
        error_score = max(0, 100 - (throughput_analysis["error_rate"] * 1000))  # Convert to reasonable scale
        
        overall_score = (throughput_score + latency_score + capacity_score + error_score) / 4
        
        return {
            "overall_score": round(overall_score, 1),
            "throughput_score": round(throughput_score, 1),
            "latency_score": round(latency_score, 1),
            "capacity_score": round(capacity_score, 1),
            "reliability_score": round(error_score, 1),
            "optimization_level": self._get_optimization_level(overall_score)
        }
    
    def _get_optimization_level(self, score: float) -> str:
        """Convert optimization score to level"""
        if score >= 90:
            return "excellent"
        elif score >= 80:
            return "good"
        elif score >= 70:
            return "fair"
        elif score >= 60:
            return "needs_improvement"
        else:
            return "critical"