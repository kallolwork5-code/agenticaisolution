#!/usr/bin/env python3
"""
Script to create ingestion prompts for the enhanced data classification system.
"""

from app.db.database import SessionLocal
from app.db.models import Prompt

def create_ingestion_prompts():
    db = SessionLocal()
    
    try:
        # Create ingestion prompts
        prompts = [
            {
                'agent_role': 'ingestion',
                'prompt_type': 'system',
                'prompt_text': '''You are an expert data classification agent for financial transaction systems. You specialize in analyzing structured data files and determining their purpose within payment processing workflows.

Your expertise includes:
- Transaction data patterns and structures
- Rate card configurations and pricing models  
- Routing rules and acquirer management
- Financial data validation and compliance
- Payment industry standards and terminology

You analyze data with precision and provide confident classifications based on column patterns, data relationships, and domain knowledge.'''
            },
            {
                'agent_role': 'ingestion',
                'prompt_type': 'task',
                'prompt_text': '''Analyze the provided structured data and classify it into one of these categories:

1. **transaction**: Financial transaction records containing:
   - Transaction amounts, dates, and settlement information
   - Acquirer details and merchant data
   - MDR (Merchant Discount Rate) percentages and costs
   - Card types, networks, and terminal information

2. **reference**: Configuration and lookup data including:
   - Rate cards with agreed MDR rates and SLA terms
   - Routing rules with primary/secondary acquirer hierarchies
   - Terminal configurations and payment method mappings
   - Pricing structures and compliance parameters

3. **document**: Unstructured content such as:
   - PDF reports, contracts, or documentation
   - Word documents with policies or procedures
   - Any non-tabular data requiring text processing

Focus on column names, data patterns, and relationships to make accurate classifications.'''
            },
            {
                'agent_role': 'ingestion',
                'prompt_type': 'safety',
                'prompt_text': '''IMPORTANT SAFETY AND PRIVACY GUIDELINES:

1. **Data Privacy**: Never log, store, or expose actual financial data values
2. **Security**: Focus only on structural analysis, not sensitive content
3. **Compliance**: Ensure classifications support regulatory requirements
4. **Accuracy**: Provide honest confidence scores - uncertainty is acceptable
5. **Scope**: Only classify based on provided context, avoid assumptions

If data appears sensitive or you cannot determine the type with confidence, indicate lower confidence rather than guessing.'''
            },
            {
                'agent_role': 'ingestion',
                'prompt_type': 'response',
                'prompt_text': '''Respond with a valid JSON object containing exactly these fields:

{
  "data_type": "transaction|reference|document",
  "confidence": 0.0-1.0,
  "reasoning": "Clear explanation of classification decision including key factors"
}

Example response:
{
  "data_type": "transaction",
  "confidence": 0.92,
  "reasoning": "Contains transaction_date, settlement_date, transaction_amount, mdr_percentage, and acquirer_name columns indicating financial transaction records with MDR cost calculations."
}

Ensure the JSON is valid and parseable.'''
            }
        ]

        for prompt_data in prompts:
            # Check if prompt already exists
            existing = db.query(Prompt).filter(
                Prompt.agent_role == prompt_data['agent_role'],
                Prompt.prompt_type == prompt_data['prompt_type']
            ).first()
            
            if existing:
                # Update existing prompt
                existing.prompt_text = prompt_data['prompt_text']
                existing.version += 1
                print(f"Updated {prompt_data['agent_role']}/{prompt_data['prompt_type']} prompt")
            else:
                # Create new prompt
                prompt = Prompt(**prompt_data)
                db.add(prompt)
                print(f"Created {prompt_data['agent_role']}/{prompt_data['prompt_type']} prompt")

        db.commit()
        print('✅ Ingestion prompts created/updated successfully!')
        
    except Exception as e:
        print(f"❌ Error creating prompts: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    create_ingestion_prompts()