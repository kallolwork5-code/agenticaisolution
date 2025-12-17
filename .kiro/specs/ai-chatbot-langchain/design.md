# Design Document

## Overview

This design implements an AI chatbot using LangChain that provides intelligent, context-aware responses about payment analytics data. The chatbot will use the comprehensive demo data (transactions, rate cards, routing rules, and derived analytics) as its knowledge base to answer user questions about payment operations, compliance, cost savings, and performance metrics.

## Architecture

### System Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Frontend UI   │────│   LangChain      │────│   Data Context  │
│                 │    │   Chatbot        │    │                 │
│ - Chat Interface│    │ - Query Processing│    │ - Demo Data     │
│ - Message Display│   │ - Context Mgmt   │    │ - Vector Store  │
│ - User Input    │    │ - Response Gen   │    │ - Embeddings    │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                        │                        │
         │                        │                        │
    ┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
    │   Chat State    │    │   LLM Provider   │    │   Knowledge     │
    │                 │    │                  │    │   Base          │
    │ - Conversation  │    │ - OpenAI/Anthropic│   │                 │
    │ - Context       │    │ - Response Stream│    │ - Transactions  │
    │ - History       │    │ - Token Mgmt     │    │ - Rate Cards    │
    └─────────────────┘    └──────────────────┘    └─────────────────┘
```

### LangChain Components

1. **Document Loader**: Load demo data into LangChain documents
2. **Text Splitter**: Split data into manageable chunks for embeddings
3. **Vector Store**: Store embeddings for semantic search
4. **Retrieval Chain**: Find relevant data based on user queries
5. **Conversation Chain**: Maintain chat context and history
6. **Response Generator**: Generate natural language responses

## Components and Interfaces

### 1. Data Context Manager

**Demo Data Structure**
```typescript
interface PaymentAnalyticsContext {
  transactions: Transaction[]
  rateCards: RateCard[]
  routingRules: RoutingRule[]
  rateReconciliation: RateReconciliationError[]
  slaDelays: SLADelayError[]
  routingErrors: RoutingError[]
  kpis: DashboardKPIs
}

interface Transaction {
  txn_id: string
  txn_date: string
  settlement_date: string
  acquirer: string
  network: string
  card_type: string
  card_category: string
  amount_inr: number
  applied_mdr_pct: number
  applied_mdr_amt: number
  settlement_amount: number
}

interface RateCard {
  acquirer: string
  network: string
  card_type: string
  card_category: string
  agreed_mdr_pct: number
  sla_days: number
  sla_interest_pct: number
}
```

**Context Preparation**
```typescript
class PaymentDataContextManager {
  prepareDocuments(): Document[]
  createEmbeddings(): VectorStore
  formatDataForLLM(data: any): string
  calculateKPIs(): DashboardKPIs
}
```

### 2. LangChain Integration

**Chatbot Engine**
```typescript
interface ChatbotEngine {
  initializeChain(): ConversationalRetrievalChain
  processQuery(query: string, history: ChatMessage[]): Promise<string>
  retrieveRelevantData(query: string): Document[]
  generateResponse(query: string, context: string): Promise<string>
}

interface ChatMessage {
  id: string
  type: 'user' | 'assistant'
  content: string
  timestamp: Date
  context?: string[]
}
```

**Chain Configuration**
```typescript
const chatbotChain = ConversationalRetrievalChain.fromLLM(
  llm,
  vectorStore.asRetriever(),
  {
    memory: new ConversationBufferWindowMemory({
      memoryKey: "chat_history",
      returnMessages: true,
      k: 10 // Keep last 10 exchanges
    }),
    questionGeneratorChain: questionGeneratorChain,
    combineDocsChain: combineDocsChain,
  }
)
```

### 3. Frontend Chat Interface Enhancement

**Keep Existing Simple Design with Modern Features**
The current AIChatbot.tsx provides a clean, ChatGPT-like interface. We'll enhance it by adding:

```typescript
interface EnhancedChatState {
  messages: ChatMessage[]
  conversations: SavedConversation[]
  currentConversationId: string
  isLoading: boolean
  showHistory: boolean
  theme: 'light' | 'dark'
}

interface ChatMessage {
  id: string
  type: 'user' | 'assistant'
  content: string
  timestamp: Date
  reactions?: MessageReaction[]
  quickActions?: QuickAction[]
}

interface SavedConversation {
  id: string
  title: string
  lastMessage: string
  timestamp: Date
  messageCount: number
}

interface MessageReaction {
  type: 'thumbs_up' | 'thumbs_down'
  timestamp: Date
}

interface QuickAction {
  label: string
  action: string
  icon: string
}
```

**Enhanced Features for Existing Interface**
- **History Sidebar**: Collapsible left panel showing saved conversations
- **Message Reactions**: Small thumbs up/down buttons on assistant messages
- **Quick Actions**: Contextual buttons below assistant responses
- **Theme Toggle**: Simple dark/light mode switch in header
- **Export Button**: Download conversation as text/JSON
- **Search**: Simple search bar in history sidebar
- **Auto-save**: Automatically save conversations to localStorage
- **Suggested Questions**: Enhanced welcome screen with more suggestions

**UI Enhancement Strategy**
1. Keep the existing full-screen layout and clean design
2. Add a collapsible sidebar for conversation history
3. Enhance messages with subtle reaction buttons
4. Add quick action buttons below relevant responses
5. Implement theme switching with existing color scheme
6. Add export and search functionality without cluttering UI

## Data Models

### Knowledge Base Structure

**Document Types**
1. **Transaction Documents**: Individual transaction records with metadata
2. **Summary Documents**: Aggregated statistics and KPIs
3. **Error Documents**: Specific error cases with explanations
4. **Rule Documents**: Business rules and calculations

**Embedding Strategy**
```typescript
const documentTypes = {
  transaction: "Individual payment transaction with acquirer, network, amounts",
  rateCard: "Contractual MDR rates and SLA terms by acquirer and card type",
  routing: "Preferred acquirer routing rules by network and card type",
  error: "Compliance violations, delays, and cost impacts",
  kpi: "Key performance indicators and summary metrics"
}
```

### Context Templates

**System Prompt Template**
```
You are a payment analytics expert assistant. You have access to comprehensive payment transaction data, rate cards, routing rules, and compliance information.

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

Current Context: {context}
Chat History: {chat_history}
Question: {question}
```

**Response Format Templates**
```typescript
const responseTemplates = {
  costSavings: "Based on the rate reconciliation data, you saved ₹{amount} across {count} transactions. Key examples: {examples}",
  slaBreaches: "Found {count} SLA breaches with average delay of {avgDelay} days. Most impacted: {examples}",
  routingErrors: "Detected {count} routing non-compliance cases with total cost impact of ₹{impact}. Details: {examples}",
  volumeAnalysis: "Transaction volume analysis shows {totalVolume} across {timeframe}. Breakdown: {breakdown}"
}
```

## Error Handling

### Query Processing Errors
- Invalid or unclear questions → Ask for clarification
- Out-of-scope questions → Polite redirection to payment topics
- Data not found → Explain available data limitations
- Technical errors → Graceful fallback with error message

### LangChain Integration Errors
- LLM API failures → Retry mechanism with fallback responses
- Vector store errors → Fallback to keyword search
- Memory overflow → Clear old conversation history
- Rate limiting → Queue requests with user feedback

### Data Context Errors
- Missing demo data → Load default dataset
- Calculation errors → Show raw data with explanation
- Inconsistent data → Flag discrepancies in response

## Testing Strategy

### Unit Tests
1. **Data Context Manager**
   - Test demo data loading and formatting
   - Verify KPI calculations match expected values
   - Test document preparation for embeddings

2. **LangChain Integration**
   - Test query processing and retrieval
   - Verify conversation memory management
   - Test response generation with mock data

3. **Chat Interface**
   - Test message sending and receiving
   - Verify UI state management
   - Test error handling and loading states

### Integration Tests
1. **End-to-End Chat Flow**
   - Test complete question-answer cycles
   - Verify context retention across conversation
   - Test various question types and formats

2. **Data Accuracy Tests**
   - Verify chatbot answers match actual demo data
   - Test calculation accuracy for cost savings, delays
   - Confirm KPI consistency between chatbot and dashboard

### Manual Testing Scenarios
1. **Payment Analytics Questions**
   - "What are my total cost savings this month?"
   - "Which transactions had SLA breaches?"
   - "Show me routing errors for VISA transactions"
   - "What's the average MDR rate for HDFC?"

2. **Context and Follow-up**
   - Ask about specific transaction, then ask for more details
   - Reference previous answers in follow-up questions
   - Test conversation flow and context retention

3. **Edge Cases**
   - Ask questions outside payment domain
   - Ask about non-existent data
   - Test very long conversations
   - Test rapid-fire questions

## Implementation Notes

### LangChain Setup
- Use OpenAI GPT-4 or Anthropic Claude for LLM
- Implement FAISS or Chroma for vector storage
- Use RecursiveCharacterTextSplitter for document chunking
- Configure ConversationBufferWindowMemory for chat history

### Performance Optimization
- Pre-compute embeddings for demo data
- Cache frequent query responses
- Implement streaming responses for better UX
- Optimize vector search with proper indexing

### Security Considerations
- Validate all user inputs before processing
- Implement rate limiting for API calls
- Sanitize responses to prevent data leakage
- Use environment variables for API keys

### Deployment Requirements
- Backend API endpoint for LangChain processing
- Frontend integration with existing dashboard
- Environment configuration for LLM providers
- Monitoring and logging for chat interactions