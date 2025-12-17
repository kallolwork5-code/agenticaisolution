import os
import uuid
import json
from datetime import datetime
from typing import List, Dict, Any, Optional, AsyncGenerator
import asyncio

try:
    from langchain.chains import ConversationalRetrievalChain
    from langchain.memory import ConversationBufferWindowMemory
    from langchain.schema import BaseMessage, HumanMessage, AIMessage
    from langchain_openai import ChatOpenAI, OpenAIEmbeddings
    from langchain_core.documents import Document
    from langchain.text_splitter import RecursiveCharacterTextSplitter
    from langchain.vectorstores import Chroma
    from langchain.prompts import PromptTemplate
    LANGCHAIN_AVAILABLE = True
except ImportError:
    print("⚠️ LangChain not fully available, running in demo mode")
    LANGCHAIN_AVAILABLE = False

from .payment_data_context import PaymentDataContextManager

class ChatbotService:
    def __init__(self):
        self.llm = None
        self.vector_store = None
        self.chain = None
        self.conversations = {}  # In-memory storage for demo
        self.context_manager = PaymentDataContextManager()
        self._initialize_chatbot()
    
    def _initialize_chatbot(self):
        """Initialize LangChain components"""
        if not LANGCHAIN_AVAILABLE:
            self._initialize_demo_mode()
            return
            
        try:
            # Check if OpenAI API key is available
            api_key = os.getenv("OPENAI_API_KEY")
            if not api_key or api_key == "demo-key":
                print("⚠️ No OpenAI API key found, using demo mode")
                self._initialize_demo_mode()
                return
            
            # Initialize OpenAI LLM
            self.llm = ChatOpenAI(
                model="gpt-4",
                temperature=0.1,
                streaming=True,
                openai_api_key=api_key
            )
            
            # Initialize embeddings
            embeddings = OpenAIEmbeddings(openai_api_key=api_key)
            
            # Load and prepare payment analytics context
            documents = self._prepare_payment_context()
            
            # Create vector store
            self.vector_store = Chroma.from_documents(
                documents=documents,
                embedding=embeddings,
                persist_directory="./chroma_db"
            )
            
            # Create conversational chain
            self._create_conversational_chain()
            
            print("✅ Chatbot service initialized with LangChain")
            
        except Exception as e:
            print(f"❌ Error initializing LangChain: {e}")
            # Fallback for demo mode
            self._initialize_demo_mode()
    
    def _initialize_demo_mode(self):
        """Initialize demo mode without external APIs"""
        print("🔄 Initializing chatbot in demo mode...")
        self.demo_mode = True
        
        # Load payment context for demo responses
        self.payment_context = self.context_manager.get_all_context()
        
    def _prepare_payment_context(self) -> List:
        """Prepare payment analytics data as LangChain documents"""
        documents = []
        
        # Get all payment context data
        context_data = self.context_manager.get_all_context()
        
        # Create documents for transactions
        for txn in context_data["transactions"]:
            doc_content = f"""
            Transaction ID: {txn['txn_id']}
            Date: {txn['txn_date']}
            Settlement Date: {txn['settlement_date']}
            Acquirer: {txn['acquirer']}
            Network: {txn['network']}
            Card Type: {txn['card_type']}
            Card Category: {txn['card_category']}
            Amount: ₹{txn['amount_inr']:,}
            Applied MDR: {txn['applied_mdr_pct']}%
            MDR Amount: ₹{txn['applied_mdr_amt']:,}
            Settlement Amount: ₹{txn['settlement_amount']:,}
            """
            
            if LANGCHAIN_AVAILABLE:
                documents.append(Document(
                    page_content=doc_content,
                    metadata={
                        "type": "transaction",
                        "txn_id": txn['txn_id'],
                        "acquirer": txn['acquirer'],
                        "network": txn['network']
                    }
                ))
            else:
                documents.append({
                    "content": doc_content,
                    "metadata": {
                        "type": "transaction",
                        "txn_id": txn['txn_id'],
                        "acquirer": txn['acquirer'],
                        "network": txn['network']
                    }
                })
        
        # Create documents for rate cards
        for rate in context_data["rate_cards"]:
            doc_content = f"""
            Rate Card Entry:
            Acquirer: {rate['acquirer']}
            Network: {rate['network']}
            Card Type: {rate['card_type']}
            Card Category: {rate['card_category']}
            Agreed MDR Rate: {rate['agreed_mdr_pct']}%
            SLA Days: {rate['sla_days']}
            SLA Interest: {rate['sla_interest_pct']}%
            """
            
            if LANGCHAIN_AVAILABLE:
                documents.append(Document(
                    page_content=doc_content,
                    metadata={
                        "type": "rate_card",
                        "acquirer": rate['acquirer'],
                        "network": rate['network']
                    }
                ))
            else:
                documents.append({
                    "content": doc_content,
                    "metadata": {
                        "type": "rate_card",
                        "acquirer": rate['acquirer'],
                        "network": rate['network']
                    }
                })
        
        # Create documents for errors and KPIs
        kpis = context_data["kpis"]
        kpi_content = f"""
        Payment Analytics KPIs:
        Total Transaction Volume: ₹{kpis['total_volume']:,}
        Total Cost Savings: ₹{kpis['total_savings']:,}
        Rate Reconciliation Errors: {kpis['rate_errors']}
        SLA Delay Errors: {kpis['sla_errors']}
        Routing Errors: {kpis['routing_errors']}
        Average MDR Rate: {kpis['avg_mdr_rate']}%
        On-Us Percentage: {kpis['on_us_percentage']}%
        Off-Us Percentage: {kpis['off_us_percentage']}%
        """
        
        if LANGCHAIN_AVAILABLE:
            documents.append(Document(
                page_content=kpi_content,
                metadata={"type": "kpis"}
            ))
        else:
            documents.append({
                "content": kpi_content,
                "metadata": {"type": "kpis"}
            })
        
        return documents
    
    def _create_conversational_chain(self):
        """Create the conversational retrieval chain"""
        
        # Custom prompt template
        system_template = """You are a payment analytics expert assistant. You have access to comprehensive payment transaction data, rate cards, routing rules, and compliance information.

Available Data Context:
- Transaction records with amounts, MDR rates, settlement dates
- Rate card agreements with contracted MDR rates and SLA terms  
- Routing rules showing preferred vs actual acquirer usage
- Error analysis including rate reconciliation, SLA delays, routing compliance
- KPIs including total volumes, cost savings, error counts

Guidelines:
1. Only answer questions related to payment analytics and the provided data
2. Provide specific data points and calculations when possible
3. Reference transaction IDs, dates, and amounts for concrete examples
4. Explain the business impact of findings
5. If asked about data not available, clearly state the limitation
6. Keep responses concise but informative
7. Use currency formatting (₹) for Indian Rupee amounts

Context: {context}
Chat History: {chat_history}
Question: {question}

Answer:"""

        prompt = PromptTemplate(
            template=system_template,
            input_variables=["context", "chat_history", "question"]
        )
        
        # Create memory
        memory = ConversationBufferWindowMemory(
            memory_key="chat_history",
            return_messages=True,
            k=10  # Keep last 10 exchanges
        )
        
        # Create chain
        self.chain = ConversationalRetrievalChain.from_llm(
            llm=self.llm,
            retriever=self.vector_store.as_retriever(search_kwargs={"k": 5}),
            memory=memory,
            combine_docs_chain_kwargs={"prompt": prompt},
            return_source_documents=True
        )
    
    async def process_message(
        self, 
        message: str, 
        conversation_id: Optional[str] = None,
        user_id: Optional[str] = None,
        context: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """Process a chat message and return response"""
        
        # Create conversation ID if not provided
        if not conversation_id:
            conversation_id = str(uuid.uuid4())
        
        # Get or create conversation
        if conversation_id not in self.conversations:
            self.conversations[conversation_id] = {
                "messages": [],
                "user_id": user_id,
                "created_at": datetime.now()
            }
        
        # Add user message to conversation
        user_message = {
            "id": str(uuid.uuid4()),
            "type": "user",
            "content": message,
            "timestamp": datetime.now()
        }
        self.conversations[conversation_id]["messages"].append(user_message)
        
        try:
            if hasattr(self, 'demo_mode') and self.demo_mode:
                # Demo mode response
                response_content = self._generate_demo_response(message)
            else:
                # LangChain response
                result = await asyncio.get_event_loop().run_in_executor(
                    None, self.chain, {"question": message}
                )
                response_content = result["answer"]
            
            # Add assistant message to conversation
            assistant_message = {
                "id": str(uuid.uuid4()),
                "type": "assistant", 
                "content": response_content,
                "timestamp": datetime.now()
            }
            self.conversations[conversation_id]["messages"].append(assistant_message)
            
            return {
                "message": assistant_message,
                "conversation_id": conversation_id
            }
            
        except Exception as e:
            error_message = {
                "id": str(uuid.uuid4()),
                "type": "assistant",
                "content": f"I apologize, but I encountered an error processing your question. Please try rephrasing your question about payment analytics data.",
                "timestamp": datetime.now()
            }
            self.conversations[conversation_id]["messages"].append(error_message)
            
            return {
                "message": error_message,
                "conversation_id": conversation_id
            }
    
    def _generate_demo_response(self, message: str) -> str:
        """Generate demo responses based on message content"""
        message_lower = message.lower()
        
        if "cost saving" in message_lower or "saving" in message_lower:
            return """Based on the rate reconciliation analysis, you have achieved significant cost savings:

**Total Cost Savings: ₹25.6 Cr**

Key examples:
• Transaction TXN0002: Saved ₹688 (Applied 2.40% vs Agreed 1.85% with Axis)
• Transaction TXN0006: Saved ₹1,050 (Applied 2.60% vs Agreed 2.10% with Axis) 
• Transaction TXN0008: Saved ₹224 (Applied 2.30% vs Agreed 1.90% with SBI)

The savings come from rate reconciliation where actual applied MDR rates were higher than contractually agreed rates, indicating opportunities for better rate negotiations."""

        elif "sla" in message_lower or "delay" in message_lower:
            return """SLA compliance analysis shows several breaches:

**SLA Breaches Found: 89 transactions**

Critical delays:
• Transaction TXN0002: 5 days delay (Axis, settled Jan 10 vs SLA of 2 days)
• Transaction TXN0008: 8 days delay (SBI, settled Jan 18 vs SLA of 2 days)
• Transaction TXN0010: 8 days delay (Axis, settled Jan 20 vs SLA of 1 day)

**Average Delay: 6.2 days**

Most impacted acquirers: SBI (8 day avg), Axis (6.5 day avg). Consider penalty discussions and process improvements."""

        elif "routing" in message_lower or "error" in message_lower:
            return """Routing compliance analysis reveals optimization opportunities:

**Routing Errors: 156 transactions**
**Total Cost Impact: ₹12.3 Cr**

Key violations:
• VISA Credit transactions routed to Axis instead of preferred HDFC
• MC Debit transactions routed to SBI instead of preferred ICICI
• Cost impact ranges from ₹96 to ₹421 per transaction

**Recommendation:** Implement routing logic enforcement to ensure transactions go to preferred acquirers for optimal rates."""

        elif "mdr" in message_lower or "rate" in message_lower:
            return """MDR Rate Analysis:

**Average Applied MDR Rate: 1.89%**

Breakdown by acquirer:
• HDFC: 1.98% average (VISA Credit: 1.85%, VISA Commercial: 2.10%)
• ICICI: 1.55% average (MC Debit: 1.20%, MC Credit: 1.90%)
• SBI: 1.90% average (MC Debit: 1.50%, MC Credit: 2.30%)
• Axis: 2.07% average (VISA: 2.40-2.60%, RUPAY: 1.20%)

**Insight:** Axis has highest rates, ICICI most competitive for debit transactions."""

        elif "transaction" in message_lower and any(tid in message for tid in ["TXN0001", "TXN0002", "TXN0003"]):
            txn_id = next((tid for tid in ["TXN0001", "TXN0002", "TXN0003"] if tid in message), "TXN0002")
            return f"""Transaction {txn_id} Details:

**Amount:** ₹1,25,000
**Date:** Jan 5, 2024 → Settled Jan 10, 2024
**Acquirer:** Axis Bank
**Network:** VISA Credit Consumer
**Applied MDR:** 2.40% (₹3,000)
**Settlement:** ₹1,22,000

**Issues Identified:**
1. **SLA Breach:** 5 days delay (SLA: 2 days)
2. **Rate Issue:** Applied 2.40% vs Agreed 1.85% = ₹688 potential saving
3. **Routing Error:** Should have gone to HDFC (preferred) instead of Axis

**Business Impact:** This transaction represents typical optimization opportunities in your payment processing."""

        else:
            return """I'm here to help with payment analytics questions! I can provide insights on:

• **Cost Savings:** Rate reconciliation and optimization opportunities
• **SLA Compliance:** Settlement delays and breach analysis  
• **Routing Performance:** Preferred vs actual acquirer usage
• **Transaction Analysis:** Detailed breakdown of specific transactions
• **MDR Rates:** Comparison across acquirers and card types

Try asking: "What are my total cost savings?" or "Show me SLA breaches" or "Analyze transaction TXN0002"."""

    async def process_message_stream(
        self,
        message: str,
        conversation_id: Optional[str] = None,
        user_id: Optional[str] = None,
        context: Optional[Dict[str, Any]] = None
    ) -> AsyncGenerator[Dict[str, Any], None]:
        """Process message with streaming response"""
        
        # For demo, simulate streaming by yielding chunks
        response = await self.process_message(message, conversation_id, user_id, context)
        content = response["message"]["content"]
        
        # Simulate streaming by yielding word by word
        words = content.split()
        current_content = ""
        
        for i, word in enumerate(words):
            current_content += word + " "
            yield {
                "type": "content",
                "content": current_content.strip(),
                "conversation_id": response["conversation_id"],
                "is_complete": i == len(words) - 1
            }
            await asyncio.sleep(0.05)  # Small delay for streaming effect
    
    async def get_conversation_history(
        self, 
        conversation_id: str, 
        user_id: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        """Get conversation history"""
        if conversation_id in self.conversations:
            return self.conversations[conversation_id]["messages"]
        return []
    
    async def create_new_conversation(self, user_id: Optional[str] = None) -> str:
        """Create a new conversation"""
        conversation_id = str(uuid.uuid4())
        self.conversations[conversation_id] = {
            "messages": [],
            "user_id": user_id,
            "created_at": datetime.now()
        }
        return conversation_id
    
    async def delete_conversation(
        self, 
        conversation_id: str, 
        user_id: Optional[str] = None
    ):
        """Delete a conversation"""
        if conversation_id in self.conversations:
            del self.conversations[conversation_id]