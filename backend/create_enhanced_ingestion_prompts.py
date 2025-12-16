#!/usr/bin/env python3
"""
Enhanced ingestion prompts based on actual CollectiSense data structure.
"""

import sys
from pathlib import Path

# Add the parent directory to the path so we can import from app
sys.path.append(str(Path(__file__).parent))

from app.db.database import SessionLocal
from app.db.models import Prompt


def create_enhanced_ingestion_prompts():
    """Create enhanced ingestion prompts based on actual data structure"""
    
    db = SessionLocal()
    try:
        prompts = [
            {
                "agent_role": "ingestion",
                "prompt_type": "system",
                "prompt_text": """You are an expert data classification agent for CollectiSense, a digital reconciliation platform specializing in SLA transaction processing, MDR rate management, and intelligent routing logic.

Your expertise includes:
- Transaction data analysis with MID, Terminal, Payment Types, and Acquirer information
- Rate card structures with MDR rates, SLA terms, and transaction amount ranges
- Routing logic with primary/secondary acquirer hierarchies
- Card classification systems (Credit/Debit, Network types, Card categories)
- Financial reconciliation workflows and compliance requirements

You must accurately classify uploaded data to ensure proper processing in the CollectiSense reconciliation pipeline."""
            },
            {
                "agent_role": "ingestion",
                "prompt_type": "task",
                "prompt_text": """Analyze the uploaded file and classify it into one of these CollectiSense data categories:

**1. TRANSACTION DATA** - Financial transaction records containing:
   - Core identifiers: MID, Terminal, Terminal ID, BIN Number
   - Transaction details: Transaction Date, Settlement Date, Transaction Amount, Transaction Currency
   - Payment information: Payment Type, Acquirer Name, Transaction Type
   - Card details: Card Classification (Credit/Debit), Card Network (Visa/Mastercard/Amex), Card Category, Card Type, Card Sub Type
   - Financial calculations: Applied MDR Rate, MDR Amount, Gross Amount, Net Transaction Amount, Settlement Currency

**2. RATE CARD DATA** - MDR pricing and SLA configuration containing:
   - Acquirer and Terminal information
   - Payment Mode and Card Classification rules
   - Network and Card Category specifications
   - Transaction amount ranges: Min/Max Transaction Amount, Min/Max Inclusive flags
   - Pricing: Agreed MDR Rate (in %), Applied SLA terms
   - Penalty terms: Interest Rate for SLA Delay (in %)

**3. ROUTING LOGIC DATA** - Payment routing configuration containing:
   - Terminal and Payment Method specifications
   - Card Classification and Network routing rules
   - Acquirer hierarchy: Primary Acquirer, Secondary Acquirer
   - Fallback routing mechanisms

**4. DOCUMENT DATA** - Any unstructured content like PDFs, reports, or documentation

Examine column names, data patterns, and sample values to determine the correct classification."""
            },
            {
                "agent_role": "ingestion",
                "prompt_type": "classification_rules",
                "prompt_text": """CLASSIFICATION DECISION RULES:

**TRANSACTION DATA Indicators:**
- Presence of: MID, Terminal ID, Transaction Date, Settlement Date, Transaction Amount
- Financial fields: Applied MDR Rate, MDR Amount, Net Transaction Amount, Gross Amount
- Card identifiers: BIN Number, Card Classification, Card Network
- Acquirer processing: Acquirer Name, Transaction Type, Payment Type

**RATE CARD DATA Indicators:**
- Pricing structure: Agreed MDR Rate, Applied SLA, Interest Rate (SLA Delay)
- Amount ranges: Min/Max Transaction Amount, Min/Max Inclusive
- Configuration rules: Terminal, Payment Mode, Card Classification, Network, Card Category
- Acquirer-specific pricing terms

**ROUTING LOGIC DATA Indicators:**
- Routing hierarchy: Primary Acquirer, Secondary Acquirer
- Routing criteria: Terminal, Payment Method, Card Classification, Network
- Fallback mechanisms and acquirer preferences

**DOCUMENT DATA Indicators:**
- Non-tabular content, PDFs, Word documents
- Unstructured text requiring document processing
- Any content not matching the above structured patterns

**Priority Rules:**
1. If contains transaction amounts + dates + MDR calculations → TRANSACTION
2. If contains MDR rates + SLA terms + amount ranges → RATE CARD  
3. If contains Primary/Secondary Acquirer routing → ROUTING LOGIC
4. If unstructured or unclear → DOCUMENT"""
            },
            {
                "agent_role": "ingestion",
                "prompt_type": "safety",
                "prompt_text": """SECURITY AND COMPLIANCE REQUIREMENTS:

**Data Privacy:**
- Never log or expose actual BIN numbers, card details, or transaction amounts
- Analyze only column structure and data patterns, not sensitive values
- Maintain PCI DSS compliance standards for payment data handling

**Financial Compliance:**
- Ensure classifications support proper SLA monitoring and reconciliation
- Maintain audit trails for regulatory compliance
- Handle MDR calculations and settlement data with appropriate security

**Error Handling:**
- If classification is uncertain, default to 'document' for safer processing
- Require minimum 0.8 confidence for automated processing
- Flag ambiguous data for manual review

**Validation:**
- Cross-reference column patterns against known CollectiSense schemas
- Verify data integrity and completeness before classification
- Ensure compatibility with downstream reconciliation processes"""
            },
            {
                "agent_role": "ingestion",
                "prompt_type": "response",
                "prompt_text": """Provide classification response in this exact JSON format:

{
  "data_type": "transaction|rate_card|routing_logic|document",
  "confidence": 0.95,
  "reasoning": "Detailed explanation with specific evidence from column analysis",
  "detected_columns": ["list", "of", "key", "columns", "found"],
  "data_quality": {
    "completeness": 0.98,
    "consistency": 0.95,
    "validity": 0.97
  },
  "processing_recommendations": {
    "suggested_validation": ["specific validation rules"],
    "potential_issues": ["any data quality concerns"],
    "reconciliation_impact": "impact on reconciliation workflow"
  }
}

**Field Requirements:**
- data_type: Exactly one of: "transaction", "rate_card", "routing_logic", "document"
- confidence: Float 0.0-1.0 (require ≥0.8 for auto-processing)
- reasoning: Specific evidence including column names and patterns
- detected_columns: Key columns that influenced the classification
- data_quality: Assessment scores for completeness, consistency, validity
- processing_recommendations: Actionable insights for data processing

**Example reasoning:**
"Classified as 'transaction' based on presence of core transaction columns: MID, Terminal ID, Transaction Date, Settlement Date, Transaction Amount, Applied MDR Rate, and MDR Amount. The data structure matches CollectiSense transaction schema with proper card classification fields (Card Network, Card Classification) and settlement information (Gross Amount, Net Transaction Amount)."

Ensure valid JSON that can be parsed programmatically."""
            }
        ]
        
        for prompt_data in prompts:
            # Check if prompt already exists
            existing = db.query(Prompt).filter(
                Prompt.agent_role == prompt_data["agent_role"],
                Prompt.prompt_type == prompt_data["prompt_type"]
            ).first()
            
            if existing:
                # Update existing prompt
                existing.prompt_text = prompt_data["prompt_text"]
                existing.version += 1
                print(f"✅ Updated prompt: {prompt_data['agent_role']}/{prompt_data['prompt_type']} (v{existing.version})")
            else:
                # Create new prompt
                prompt = Prompt(**prompt_data)
                db.add(prompt)
                print(f"✅ Created prompt: {prompt_data['agent_role']}/{prompt_data['prompt_type']}")
        
        db.commit()
        print("\n🎯 Enhanced CollectiSense ingestion prompts created successfully!")
        print("📊 Data types supported:")
        print("   • Transaction Data (MID, Terminal, MDR calculations)")
        print("   • Rate Card Data (MDR rates, SLA terms)")
        print("   • Routing Logic Data (Primary/Secondary acquirers)")
        print("   • Document Data (Unstructured content)")
        
    except Exception as e:
        print(f"❌ Error creating enhanced prompts: {e}")
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    create_enhanced_ingestion_prompts()