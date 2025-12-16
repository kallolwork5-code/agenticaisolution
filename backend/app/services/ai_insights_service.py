"""
AI Insights Service using LangChain for real AI-generated insights
"""

import os
import json
import asyncio
from typing import List, Dict, Any, Optional
from datetime import datetime
import pandas as pd
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

from langchain_openai import ChatOpenAI
from langchain_core.messages import HumanMessage, SystemMessage
from langchain_core.prompts import PromptTemplate
from app.db.database import SessionLocal
from app.db.models import Prompt
import logging

logger = logging.getLogger("ai-insights")

class AIInsightsService:
    def __init__(self):
        """Initialize the AI Insights Service with LangChain components"""
        self.llm = None
        
        # Initialize LLM if API key is available
        try:
            openai_key = os.getenv("OPENAI_API_KEY")
            if openai_key and openai_key.strip():
                self.llm = ChatOpenAI(
                    api_key=openai_key,
                    model="gpt-4o-mini",
                    temperature=0.3,
                    max_tokens=1000
                )
                logger.info("AI Insights Service initialized with OpenAI LLM")
            else:
                logger.warning("OpenAI API key not found. Using mock insights.")
        except Exception as e:
            logger.error(f"Failed to initialize LLM: {e}")
            self.llm = None

    async def generate_classification_thoughts(self, 
                                            file_content: str, 
                                            file_name: str,
                                            websocket_manager=None) -> List[Dict[str, Any]]:
        """Generate real-time classification thoughts using proper data classification prompts from database"""
        
        thoughts = []
        
        if not self.llm:
            # Fallback to rule-based thoughts
            return await self._generate_fallback_thoughts(file_content, file_name)
        
        try:
            # Send initial analysis thought
            if websocket_manager:
                await websocket_manager.send_agent_update(
                    "prompt",
                    f"Loading CollectiSense data classification prompts from database for {file_name}",
                    0.9,
                    {"model": "gpt-4o-mini", "file_name": file_name, "prompt_source": "database"}
                )
            
            # Get proper data classification prompts from database
            classification_result = await self._classify_with_proper_prompts(file_content, file_name, websocket_manager)
            
            # Send prompt usage thought with actual prompt details
            db = SessionLocal()
            try:
                prompts = db.query(Prompt).filter(
                    Prompt.agent_role == 'data_classification'
                ).all()
                
                prompt_types = [p.prompt_type for p in prompts]
                prompt_details = f"Loaded {len(prompts)} prompts: {', '.join(prompt_types)}"
                
                thoughts.append({
                    "type": "prompt",
                    "content": f"Using CollectiSense data classification prompts from database: {prompt_details}",
                    "confidence": 0.95,
                    "metadata": {
                        "prompt_source": "database",
                        "agent_role": "data_classification",
                        "model": "gpt-4o-mini",
                        "prompt_types": prompt_types,
                        "prompt_count": len(prompts)
                    }
                })
                
                if websocket_manager:
                    await websocket_manager.send_agent_update(
                        "prompt",
                        f"Using CollectiSense data classification prompts from database: {prompt_details}",
                        0.95,
                        {
                            "prompt_source": "database",
                            "agent_role": "data_classification",
                            "model": "gpt-4o-mini",
                            "prompt_types": prompt_types,
                            "prompt_count": len(prompts)
                        }
                    )
            finally:
                db.close()
            
            # Send classification result
            if classification_result:
                thoughts.append({
                    "type": "decision",
                    "content": f"AI Classification: {classification_result.get('classification', 'UNKNOWN')} - {classification_result.get('reasoning', 'No reasoning provided')}",
                    "confidence": classification_result.get('confidence', 0.5),
                    "metadata": {
                        "classification": classification_result.get('classification', 'UNKNOWN'),
                        "model": "gpt-4o-mini",
                        "reasoning_type": "database_prompts",
                        "detected_columns": classification_result.get('detected_columns', []),
                        "data_quality": classification_result.get('data_quality', {}),
                        "recommendations": classification_result.get('recommendations', [])
                    }
                })
                
                if websocket_manager:
                    await websocket_manager.send_agent_update(
                        "decision",
                        f"AI Classification: {classification_result.get('classification', 'UNKNOWN')} - {classification_result.get('reasoning', 'No reasoning provided')}",
                        classification_result.get('confidence', 0.5),
                        {
                            "classification": classification_result.get('classification', 'UNKNOWN'),
                            "model": "gpt-4o-mini",
                            "reasoning_type": "database_prompts",
                            "detected_columns": classification_result.get('detected_columns', []),
                            "data_quality": classification_result.get('data_quality', {}),
                            "recommendations": classification_result.get('recommendations', [])
                        }
                    )
                
                # Send data quality insights
                if classification_result.get('data_quality'):
                    quality = classification_result['data_quality']
                    quality_text = f"Data Quality Assessment - Completeness: {quality.get('completeness', 0):.1%}, Consistency: {quality.get('consistency', 0):.1%}, Validity: {quality.get('validity', 0):.1%}"
                    
                    thoughts.append({
                        "type": "analysis",
                        "content": quality_text,
                        "confidence": 0.85,
                        "metadata": {
                            "analysis_type": "data_quality",
                            "model": "gpt-4o-mini",
                            "quality_scores": quality
                        }
                    })
                    
                    if websocket_manager:
                        await websocket_manager.send_agent_update(
                            "analysis",
                            quality_text,
                            0.85,
                            {
                                "analysis_type": "data_quality",
                                "model": "gpt-4o-mini",
                                "quality_scores": quality
                            }
                        )
                
                # Send recommendations
                if classification_result.get('recommendations'):
                    for i, rec in enumerate(classification_result['recommendations'][:2]):  # Limit to 2 recommendations
                        thoughts.append({
                            "type": "analysis",
                            "content": f"Recommendation {i+1}: {rec}",
                            "confidence": 0.80,
                            "metadata": {
                                "analysis_type": "recommendation",
                                "model": "gpt-4o-mini",
                                "recommendation_index": i+1
                            }
                        })
                        
                        if websocket_manager:
                            await websocket_manager.send_agent_update(
                                "analysis",
                                f"Recommendation {i+1}: {rec}",
                                0.80,
                                {
                                    "analysis_type": "recommendation",
                                    "model": "gpt-4o-mini",
                                    "recommendation_index": i+1
                                }
                            )
            
            return thoughts
            
        except Exception as e:
            logger.error(f"Error generating AI thoughts: {e}")
            if websocket_manager:
                await websocket_manager.send_agent_update(
                    "analysis",
                    f"AI analysis encountered an error: {str(e)}",
                    0.1,
                    {"error": str(e)}
                )
            
            # Fallback to rule-based thoughts
            return await self._generate_fallback_thoughts(file_content, file_name)

    async def _classify_with_proper_prompts(self, file_content: str, file_name: str, websocket_manager=None) -> Dict[str, Any]:
        """Use proper data classification prompts from database"""
        
        db = SessionLocal()
        try:
            # Get data classification prompts
            prompts = db.query(Prompt).filter(
                Prompt.agent_role == 'data_classification'
            ).all()
            
            if not prompts:
                logger.warning("No data classification prompts found in database")
                return None
            
            # Build complete prompt
            system_prompt = next((p.prompt_text for p in prompts if p.prompt_type == 'system'), "")
            task_prompt = next((p.prompt_text for p in prompts if p.prompt_type == 'task'), "")
            safety_prompt = next((p.prompt_text for p in prompts if p.prompt_type == 'safety'), "")
            output_prompt = next((p.prompt_text for p in prompts if p.prompt_type == 'output'), "")
            
            # Combine prompts properly
            full_prompt = f"""
{system_prompt}

{safety_prompt}

{task_prompt}

{output_prompt}

Now analyze this data file:

File: {file_name}
Content:
{file_content[:2000]}
"""
            
            # Send to GPT-4o-mini
            response = await self.llm.ainvoke([HumanMessage(content=full_prompt)])
            response_text = response.content
            
            # Parse JSON response
            try:
                # Extract JSON from response (handle markdown code blocks)
                if "```json" in response_text:
                    json_start = response_text.find("```json") + 7
                    json_end = response_text.find("```", json_start)
                    json_text = response_text[json_start:json_end].strip()
                elif "```" in response_text:
                    json_start = response_text.find("```") + 3
                    json_end = response_text.find("```", json_start)
                    json_text = response_text[json_start:json_end].strip()
                else:
                    json_text = response_text.strip()
                
                classification_result = json.loads(json_text)
                return classification_result
                
            except json.JSONDecodeError as e:
                logger.error(f"Failed to parse classification JSON: {e}")
                logger.error(f"Response text: {response_text}")
                
                # Return a basic result if JSON parsing fails
                return {
                    "classification": "UNKNOWN",
                    "confidence": 0.5,
                    "reasoning": f"JSON parsing failed: {response_text[:200]}...",
                    "detected_columns": [],
                    "data_quality": {"completeness": 0.5, "consistency": 0.5, "validity": 0.5},
                    "recommendations": ["Review data format and structure"],
                    "metadata": {"error": "json_parse_failed"}
                }
                
        except Exception as e:
            logger.error(f"Error in proper prompt classification: {e}")
            return None
        finally:
            db.close()

    async def generate_data_insights(self, 
                                   data: Any, 
                                   data_type: str,
                                   websocket_manager=None) -> List[Dict[str, Any]]:
        """Generate comprehensive data insights using LangChain"""
        
        insights = []
        
        if not self.llm:
            return self._generate_fallback_insights(data, data_type)
        
        try:
            # Convert data to analyzable format
            if isinstance(data, pd.DataFrame):
                data_summary = f"Dataset with {len(data)} rows and {len(data.columns)} columns.\\n"
                data_summary += f"Columns: {', '.join(data.columns)}\\n"
                data_summary += f"Sample data:\\n{data.head(3).to_string()}"
            elif isinstance(data, dict):
                data_summary = json.dumps(data, indent=2)[:1500]
            else:
                data_summary = str(data)[:1500]
            
            # Generate insights using LangChain
            insights_prompt = PromptTemplate(
                input_variables=["data_summary", "data_type"],
                template="""
                Analyze this {data_type} dataset and generate actionable business insights:
                
                Data Summary:
                {data_summary}
                
                Generate insights in this JSON format:
                [
                  {{
                    "type": "quality|pattern|recommendation|anomaly",
                    "title": "Brief title",
                    "description": "Detailed description",
                    "confidence": 0.0-1.0,
                    "actionable": true/false
                  }}
                ]
                
                Focus on:
                1. Data quality assessment
                2. Business patterns and trends
                3. Actionable recommendations
                4. Potential issues or anomalies
                
                Provide 3-5 insights maximum.
                """
            )
            
            # Use direct LLM call instead of LLMChain
            formatted_prompt = insights_prompt.format(
                data_summary=data_summary,
                data_type=data_type
            )
            insights_result = await self.llm.ainvoke([HumanMessage(content=formatted_prompt)])
            insights_result = insights_result.content
            
            # Parse JSON response
            try:
                parsed_insights = json.loads(insights_result)
                if isinstance(parsed_insights, list):
                    insights.extend(parsed_insights)
                else:
                    insights.append(parsed_insights)
            except json.JSONDecodeError:
                # Fallback if JSON parsing fails
                insights.append({
                    "type": "analysis",
                    "title": "AI Analysis Result",
                    "description": insights_result.strip(),
                    "confidence": 0.75,
                    "actionable": True
                })
            
            # Send insights via WebSocket
            if websocket_manager:
                for insight in insights:
                    await websocket_manager.send_agent_update(
                        "analysis",
                        f"{insight['title']}: {insight['description']}",
                        insight.get('confidence', 0.8),
                        {
                            "insight_type": insight['type'],
                            "actionable": insight.get('actionable', False)
                        }
                    )
            
            return insights
            
        except Exception as e:
            logger.error(f"Error generating data insights: {e}")
            return self._generate_fallback_insights(data, data_type)

    def _parse_classification_result(self, result: str) -> Dict[str, Any]:
        """Parse LLM classification result"""
        try:
            lines = result.strip().split('|')
            category = "document"  # default
            confidence = 0.5  # default
            reasoning = result.strip()
            
            for line in lines:
                line = line.strip()
                if line.startswith('CLASSIFICATION:'):
                    category = line.split(':', 1)[1].strip()
                elif line.startswith('CONFIDENCE:'):
                    confidence = float(line.split(':', 1)[1].strip())
                elif line.startswith('REASONING:'):
                    reasoning = line.split(':', 1)[1].strip()
            
            return {
                "category": category,
                "confidence": confidence,
                "reasoning": reasoning
            }
        except Exception as e:
            logger.error(f"Error parsing classification result: {e}")
            return {
                "category": "document",
                "confidence": 0.5,
                "reasoning": "Classification parsing failed"
            }

    async def _generate_fallback_thoughts(self, file_content: str, file_name: str) -> List[Dict[str, Any]]:
        """Generate fallback thoughts when LLM is not available"""
        thoughts = []
        
        # Basic file analysis
        thoughts.append({
            "type": "analysis",
            "content": f"Analyzing file structure of {file_name} (fallback mode)",
            "confidence": 0.7,
            "metadata": {"mode": "fallback"}
        })
        
        # Simple classification based on filename
        if 'transaction' in file_name.lower():
            classification = "transaction"
        elif 'rate' in file_name.lower() or 'mdr' in file_name.lower():
            classification = "rate_card"
        elif 'route' in file_name.lower():
            classification = "routing"
        elif 'customer' in file_name.lower():
            classification = "customer"
        else:
            classification = "document"
        
        thoughts.append({
            "type": "decision",
            "content": f"Classified as {classification} based on filename pattern",
            "confidence": 0.6,
            "metadata": {"method": "filename_pattern", "classification": classification}
        })
        
        return thoughts

    def _generate_fallback_insights(self, data: Any, data_type: str) -> List[Dict[str, Any]]:
        """Generate fallback insights when LLM is not available"""
        insights = []
        
        if data_type == "transaction":
            insights.extend([
                {
                    "type": "pattern",
                    "title": "Transaction Volume Analysis",
                    "description": f"Detected transaction records suitable for fraud detection and spending analysis.",
                    "confidence": 0.85,
                    "actionable": True
                },
                {
                    "type": "recommendation",
                    "title": "Data Processing Strategy",
                    "description": "Recommend implementing real-time fraud scoring and transaction categorization.",
                    "confidence": 0.80,
                    "actionable": True
                }
            ])
        elif data_type == "rate_card":
            insights.extend([
                {
                    "type": "quality",
                    "title": "Rate Structure Analysis",
                    "description": "Rate card data contains pricing tiers suitable for cost optimization analysis.",
                    "confidence": 0.90,
                    "actionable": False
                },
                {
                    "type": "recommendation",
                    "title": "Pricing Optimization",
                    "description": "Consider implementing dynamic pricing based on transaction volume and merchant categories.",
                    "confidence": 0.85,
                    "actionable": True
                }
            ])
        else:
            insights.append({
                "type": "quality",
                "title": "Data Quality Assessment",
                "description": f"Dataset appears well-structured and ready for further processing.",
                "confidence": 0.75,
                "actionable": False
            })
        
        return insights

# Global instance
ai_insights_service = AIInsightsService()