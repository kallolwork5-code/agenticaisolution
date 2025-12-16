"""
Setup script to create ingestion prompts for the enhanced data classification system.
"""

import sys
from pathlib import Path

# Add the parent directory to the path so we can import from app
sys.path.append(str(Path(__file__).parent))

from app.db.database import SessionLocal
from app.db.models import Prompt


def setup_ingestion_prompts():
    """Create the required prompts for the ingestion system"""
    
    db = SessionLocal()
    try:
        prompts = [
            {
                "agent_role": "ingestion",
                "prompt_type": "system",
                "prompt_text": """You are an expert data classification agent for financial transaction systems. 
Your role is to analyze uploaded data files and accurately classify them into the correct data type categories.

You have deep expertise in:
- Financial transaction data structures and patterns
- Rate card configurations and pricing models  
- Payment routing rules and acquirer networks
- Data quality assessment and validation
- Financial industry standards and compliance requirements

You must provide accurate, confident classifications to ensure proper data processing and storage."""
            },
            {
                "agent_role": "ingestion",
                "prompt_type": "task",
                "prompt_text": """Analyze the provided file data and classify it into one of these categories:

1. **transaction** - Financial transaction records containing:
   - Transaction amounts, dates, and settlement information
   - Acquirer details and merchant information
   - MDR (Merchant Discount Rate) percentages and costs
   - Card type, network type, and terminal information

2. **reference** - Configuration and lookup data including:
   - Rate cards with agreed MDR rates and SLA terms
   - Routing rules with acquirer hierarchies and priorities
   - Terminal configurations and merchant mappings
   - Pricing structures and fee schedules

3. **document** - Unstructured content such as:
   - PDF reports, contracts, or documentation
   - Word documents with policies or procedures
   - Any non-tabular data requiring text processing

Examine the column names, data patterns, and sample values to make your classification."""
            },
            {
                "agent_role": "ingestion",
                "prompt_type": "safety",
                "prompt_text": """SAFETY AND PRIVACY REQUIREMENTS:

1. **Data Privacy**: Never log, store, or expose actual financial data values, account numbers, or personally identifiable information.

2. **Security**: Only analyze data structure and patterns, not sensitive content values.

3. **Compliance**: Ensure classifications align with financial industry data handling standards.

4. **Error Handling**: If uncertain about classification, default to 'document' type for safer processing.

5. **Validation**: Double-check your analysis against the provided column names and data patterns.

Remember: You are analyzing data structure for classification purposes only, not processing actual financial transactions."""
            },
            {
                "agent_role": "ingestion",
                "prompt_type": "response",
                "prompt_text": """Provide your classification response in the following JSON format:

{
  "data_type": "transaction|reference|document",
  "confidence": 0.85,
  "reasoning": "Detailed explanation of why this classification was chosen, including specific column patterns or data characteristics that led to this decision. Mention key indicators like presence of transaction dates, MDR rates, acquirer information, etc."
}

Requirements:
- data_type: Must be exactly one of: "transaction", "reference", or "document"
- confidence: Float between 0.0 and 1.0 indicating classification certainty
- reasoning: Clear, specific explanation of the classification decision with evidence

Example reasoning: "Classified as 'transaction' due to presence of transaction_date, settlement_date, transaction_amount, mdr_percentage, and acquirer_name columns, which are core indicators of financial transaction records."

Ensure your response is valid JSON that can be parsed programmatically."""
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
                print(f"Updated prompt: {prompt_data['agent_role']}/{prompt_data['prompt_type']} (v{existing.version})")
            else:
                # Create new prompt
                prompt = Prompt(**prompt_data)
                db.add(prompt)
                print(f"Created prompt: {prompt_data['agent_role']}/{prompt_data['prompt_type']}")
        
        db.commit()
        print("✅ All ingestion prompts have been set up successfully!")
        
    except Exception as e:
        print(f"❌ Error setting up prompts: {e}")
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    setup_ingestion_prompts()