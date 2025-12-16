"""
Data Classification Agent with AI-powered decision making
"""

import json
import asyncio
from typing import Dict, Any, Optional
from sqlalchemy.orm import Session
from datetime import datetime

from app.db.models import Prompt
from app.services.websocket_service import WebSocketManager

class DataClassificationAgent:
    """
    AI Agent for classifying uploaded data using prompts and rules
    """
    
    def __init__(self, db: Session, websocket_manager: WebSocketManager):
        self.db = db
        self.websocket_manager = websocket_manager
        
        # Predefined classification rules
        self.classification_rules = {
            "transaction_data": {
                "keywords": ["transaction", "payment", "amount", "merchant", "card", "debit", "credit"],
                "columns": ["transaction_id", "amount", "merchant_name", "card_number", "date"],
                "confidence_threshold": 0.8
            },
            "rate_card_data": {
                "keywords": ["rate", "mdr", "fee", "percentage", "slab", "pricing", "cost"],
                "columns": ["rate", "mdr_rate", "fee_percentage", "slab", "pricing_tier"],
                "confidence_threshold": 0.8
            },
            "routing_data": {
                "keywords": ["route", "gateway", "processor", "priority", "fallback", "routing"],
                "columns": ["gateway", "processor", "priority", "routing_rule", "fallback"],
                "confidence_threshold": 0.8
            },
            "customer_data": {
                "keywords": ["customer", "user", "profile", "demographics", "contact", "address"],
                "columns": ["customer_id", "name", "email", "phone", "address", "age"],
                "confidence_threshold": 0.7
            }
        }
    
    async def classify_data(
        self, 
        file_data: Dict[Any, Any], 
        file_name: str, 
        file_size: int,
        prompt: Optional[Prompt] = None
    ) -> Dict[str, Any]:
        """
        Classify data using rules and AI prompts
        """
        
        # Send thinking update - Starting classification
        await self.websocket_manager.send_agent_thinking({
            "type": "analysis",
            "content": f"Starting classification analysis for {file_name}",
            "confidence": 0.9,
            "timestamp": datetime.now().isoformat()
        })
        
        # Step 1: Rule-based classification
        rule_result = await self._rule_based_classification(file_data, file_name)
        
        # Send thinking update - Rule analysis
        await self.websocket_manager.send_agent_thinking({
            "type": "rule",
            "content": f"Rule-based analysis suggests: {rule_result['data_type']} (confidence: {rule_result['confidence']:.2f})",
            "confidence": rule_result['confidence'],
            "timestamp": datetime.now().isoformat(),
            "metadata": {
                "ruleApplied": rule_result.get('rule_applied', 'general'),
                "dataPoints": rule_result.get('matching_features', 0)
            }
        })
        
        # Step 2: Check if we need AI prompt-based classification
        if rule_result['confidence'] < 0.7 or prompt:
            # Send thinking update - Using AI prompt
            await self.websocket_manager.send_agent_thinking({
                "type": "prompt",
                "content": f"Rule confidence low ({rule_result['confidence']:.2f}), using AI prompt for better classification",
                "confidence": 0.8,
                "timestamp": datetime.now().isoformat(),
                "metadata": {
                    "promptUsed": prompt.agent_role if prompt else "default_classifier"
                }
            })
            
            ai_result = await self._ai_prompt_classification(file_data, file_name, prompt)
            
            # Combine results
            if ai_result['confidence'] > rule_result['confidence']:
                final_result = ai_result
                method = "ai_prompt"
            else:
                final_result = rule_result
                method = "rule_based"
        else:
            final_result = rule_result
            method = "rule_based"
        
        # Send final decision
        await self.websocket_manager.send_agent_thinking({
            "type": "decision",
            "content": f"Final classification: {final_result['data_type']} using {method} (confidence: {final_result['confidence']:.2f})",
            "confidence": final_result['confidence'],
            "timestamp": datetime.now().isoformat(),
            "metadata": {
                "method": method,
                "processingTime": 2500  # Mock processing time
            }
        })
        
        return {
            **final_result,
            "method": method,
            "file_name": file_name,
            "file_size": file_size,
            "timestamp": datetime.now().isoformat()
        }
    
    async def _rule_based_classification(self, file_data: Dict[Any, Any], file_name: str) -> Dict[str, Any]:
        """
        Classify data using predefined rules
        """
        
        # Simulate processing time
        await asyncio.sleep(1)
        
        best_match = {
            "data_type": "document",
            "confidence": 0.3,
            "reasoning": "Default classification - no strong matches found",
            "rule_applied": "default",
            "matching_features": 0
        }
        
        # Extract features for analysis
        features = self._extract_features(file_data, file_name)
        
        # Check against each rule
        for data_type, rule in self.classification_rules.items():
            score = self._calculate_rule_score(features, rule)
            
            if score > best_match["confidence"]:
                best_match = {
                    "data_type": data_type,
                    "confidence": score,
                    "reasoning": f"Matched {data_type} based on keywords and column patterns",
                    "rule_applied": data_type,
                    "matching_features": len([k for k in rule["keywords"] if k in features["text_content"].lower()])
                }
        
        return best_match
    
    async def _ai_prompt_classification(self, file_data: Dict[Any, Any], file_name: str, prompt: Optional[Prompt]) -> Dict[str, Any]:
        """
        Classify data using AI prompts (mock implementation)
        """
        
        # Simulate AI processing time
        await asyncio.sleep(2)
        
        # Mock AI classification based on file characteristics
        features = self._extract_features(file_data, file_name)
        
        # Simple AI logic based on features
        if "transaction" in features["text_content"].lower() or "payment" in features["text_content"].lower():
            return {
                "data_type": "transaction_data",
                "confidence": 0.92,
                "reasoning": "AI detected transaction-related patterns in the data structure and content",
                "prompt_used": prompt.agent_role if prompt else "default_ai_classifier"
            }
        elif "rate" in features["text_content"].lower() or "mdr" in features["text_content"].lower():
            return {
                "data_type": "rate_card_data", 
                "confidence": 0.88,
                "reasoning": "AI identified rate and pricing patterns typical of rate card data",
                "prompt_used": prompt.agent_role if prompt else "default_ai_classifier"
            }
        elif "route" in features["text_content"].lower() or "gateway" in features["text_content"].lower():
            return {
                "data_type": "routing_data",
                "confidence": 0.85,
                "reasoning": "AI detected routing and gateway configuration patterns",
                "prompt_used": prompt.agent_role if prompt else "default_ai_classifier"
            }
        else:
            return {
                "data_type": "customer_data",
                "confidence": 0.75,
                "reasoning": "AI classified as customer data based on general data patterns",
                "prompt_used": prompt.agent_role if prompt else "default_ai_classifier"
            }
    
    def _extract_features(self, file_data: Dict[Any, Any], file_name: str) -> Dict[str, Any]:
        """
        Extract features from file data for classification
        """
        features = {
            "file_name": file_name.lower(),
            "columns": [],
            "text_content": "",
            "row_count": 0,
            "data_types": []
        }
        
        # Extract columns if available
        if "columns" in file_data:
            features["columns"] = [col.lower() for col in file_data["columns"]]
            features["text_content"] += " ".join(features["columns"])
        
        # Extract sample data content
        if "sample_data" in file_data:
            sample_text = str(file_data["sample_data"])
            features["text_content"] += " " + sample_text.lower()
        
        # Add file name content
        features["text_content"] += " " + file_name.lower()
        
        # Row count
        features["row_count"] = file_data.get("row_count", 0)
        
        return features
    
    def _calculate_rule_score(self, features: Dict[str, Any], rule: Dict[str, Any]) -> float:
        """
        Calculate confidence score for a rule match
        """
        score = 0.0
        total_checks = 0
        
        # Check keyword matches
        keyword_matches = 0
        for keyword in rule["keywords"]:
            if keyword in features["text_content"]:
                keyword_matches += 1
        
        if rule["keywords"]:
            keyword_score = keyword_matches / len(rule["keywords"])
            score += keyword_score * 0.6  # 60% weight for keywords
            total_checks += 0.6
        
        # Check column matches
        column_matches = 0
        for expected_col in rule["columns"]:
            if any(expected_col in col for col in features["columns"]):
                column_matches += 1
        
        if rule["columns"]:
            column_score = column_matches / len(rule["columns"])
            score += column_score * 0.4  # 40% weight for columns
            total_checks += 0.4
        
        # Normalize score
        if total_checks > 0:
            score = score / total_checks
        
        return min(score, 1.0)