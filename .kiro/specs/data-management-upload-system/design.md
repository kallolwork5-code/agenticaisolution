# Design Document

## Overview

This design document outlines the enhancement of the CollectiSense Data Management system with intelligent data upload functionality, AI-powered classification, dual storage routing (SQLite/ChromaDB), real-time agent reasoning display, and comprehensive upload history with AI-generated insights.

## Architecture

### System Architecture Overview

```
Frontend (React/Next.js)
├── DataManagement.tsx (Enhanced)
├── UploadWizard.tsx (New)
├── AgentThinkingPanel.tsx (New)
├── UploadHistory.tsx (New)
└── ClassificationConfig.tsx (New)
        ↓
Backend API (FastAPI)
├── /api/upload (File Upload)
├── /api/classify (AI Classification)
├── /api/storage (Storage Routing)
└── /api/insights (AI Insights)
        ↓
AI Classification Engine
├── Prompt Repository Integration
├── Rule Engine
├── LLM Classification
└── Decision Logic
        ↓
Dual Storage System
├── SQLite (Structured Data)
└── ChromaDB (Vector/Unstructured)
```

### Component Architecture

```
DataManagement (Main Container)
├── UploadSection (Left Column - 60%)
│   ├── FileUploadZone
│   ├── AgentThinkingPanel
│   ├── ProgressTracker
│   └── ClassificationResults
└── HistorySection (Right Column - 40%)
    ├── UploadHistoryList
    ├── InsightsSummary
    └── QuickStats
```

## Components and Interfaces

### 1. Enhanced DataManagement Component

```typescript
interface DataManagementProps {
  onBack: () => void
}

interface UploadState {
  isUploading: boolean
  currentFile: File | null
  progress: number
  stage: 'upload' | 'analyze' | 'classify' | 'store' | 'complete'
  agentThinking: AgentThought[]
  classification: ClassificationResult | null
  error: string | null
}

interface AgentThought {
  id: string
  timestamp: Date
  type: 'analysis' | 'prompt' | 'rule' | 'decision'
  content: string
  confidence: number
  metadata?: any
}

interface ClassificationResult {
  dataType: string
  storageDestination: 'sqlite' | 'chromadb'
  confidence: number
  reasoning: string
  promptsUsed: string[]
  rulesApplied: string[]
  schema?: any
}
```

### 2. File Upload Zone Component

```typescript
interface FileUploadZoneProps {
  onFileSelect: (files: FileList) => void
  acceptedTypes: string[]
  maxSize: number
  isUploading: boolean
}

const FileUploadZone: React.FC<FileUploadZoneProps> = ({
  onFileSelect,
  acceptedTypes = ['.csv', '.xlsx', '.json', '.txt'],
  maxSize = 50 * 1024 * 1024, // 50MB
  isUploading
}) => {
  // Drag & drop functionality
  // File validation
  // Preview capabilities
  // Multiple file support
}
```

### 3. Agent Thinking Panel Component

```typescript
interface AgentThinkingPanelProps {
  thoughts: AgentThought[]
  isActive: boolean
  currentStage: string
}

const AgentThinkingPanel: React.FC<AgentThinkingPanelProps> = ({
  thoughts,
  isActive,
  currentStage
}) => {
  return (
    <div className="bg-white/5 rounded-xl p-6 border border-white/10">
      <div className="flex items-center gap-3 mb-4">
        <div className={`w-3 h-3 rounded-full ${isActive ? 'bg-green-400 animate-pulse' : 'bg-gray-400'}`} />
        <h3 className="text-white font-semibold">Agent Thinking</h3>
        <span className="text-white/60 text-sm">({currentStage})</span>
      </div>
      
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {thoughts.map((thought) => (
          <div key={thought.id} className="bg-white/5 rounded-lg p-3">
            <div className="flex items-center justify-between mb-2">
              <span className={`text-xs px-2 py-1 rounded ${getThoughtTypeColor(thought.type)}`}>
                {thought.type}
              </span>
              <span className="text-white/40 text-xs">
                {thought.timestamp.toLocaleTimeString()}
              </span>
            </div>
            <p className="text-white/80 text-sm">{thought.content}</p>
            {thought.confidence && (
              <div className="mt-2">
                <div className="flex justify-between text-xs text-white/60 mb-1">
                  <span>Confidence</span>
                  <span>{Math.round(thought.confidence * 100)}%</span>
                </div>
                <div className="w-full bg-white/10 rounded-full h-1">
                  <div 
                    className="bg-green-400 h-1 rounded-full transition-all duration-300"
                    style={{ width: `${thought.confidence * 100}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
```

### 4. Upload History Component

```typescript
interface UploadHistoryItem {
  id: string
  fileName: string
  fileSize: number
  uploadDate: Date
  classification: ClassificationResult
  storageLocation: string
  recordCount: number
  status: 'success' | 'failed' | 'processing'
  aiSummary?: string
  insights?: DataInsight[]
}

interface DataInsight {
  type: 'pattern' | 'quality' | 'recommendation' | 'anomaly'
  title: string
  description: string
  confidence: number
  actionable: boolean
}

const UploadHistory: React.FC<{ onItemClick: (item: UploadHistoryItem) => void }> = ({
  onItemClick
}) => {
  const [selectedItem, setSelectedItem] = useState<UploadHistoryItem | null>(null)
  const [isGeneratingInsights, setIsGeneratingInsights] = useState(false)

  return (
    <div className="bg-white/5 rounded-xl p-6 border border-white/10">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-white font-semibold">Upload History</h3>
        <button className="text-green-400 hover:text-green-300 text-sm">
          View All
        </button>
      </div>
      
      <div className="space-y-3">
        {historyItems.map((item) => (
          <div 
            key={item.id}
            className="bg-white/5 rounded-lg p-4 cursor-pointer hover:bg-white/10 transition-all duration-300"
            onClick={() => onItemClick(item)}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-white font-medium text-sm truncate">
                {item.fileName}
              </span>
              <StatusBadge status={item.status} />
            </div>
            
            <div className="flex justify-between text-xs text-white/60 mb-2">
              <span>{formatFileSize(item.fileSize)}</span>
              <span>{item.recordCount.toLocaleString()} records</span>
            </div>
            
            <div className="text-xs text-white/40">
              {item.uploadDate.toLocaleDateString()} • {item.classification.storageDestination}
            </div>
            
            {item.aiSummary && (
              <div className="mt-2 text-xs text-green-400 italic">
                "AI: {item.aiSummary.substring(0, 60)}..."
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
```

### 5. Classification Configuration Component

```typescript
interface ClassificationRule {
  id: string
  name: string
  conditions: RuleCondition[]
  actions: RuleAction[]
  priority: number
  isActive: boolean
}

interface RuleCondition {
  field: string
  operator: 'contains' | 'equals' | 'matches' | 'greater_than' | 'less_than'
  value: string | number
  logicalOperator?: 'AND' | 'OR'
}

interface RuleAction {
  type: 'classify_as' | 'route_to' | 'apply_schema' | 'set_metadata'
  value: string
}

const ClassificationConfig: React.FC = () => {
  const [rules, setRules] = useState<ClassificationRule[]>([])
  const [prompts, setPrompts] = useState<ClassificationPrompt[]>([])
  
  return (
    <div className="space-y-6">
      {/* Prompt Configuration */}
      <div className="bg-white/5 rounded-xl p-6 border border-white/10">
        <h3 className="text-white font-semibold mb-4">Classification Prompts</h3>
        <div className="space-y-4">
          {prompts.map((prompt) => (
            <PromptEditor key={prompt.id} prompt={prompt} onChange={updatePrompt} />
          ))}
        </div>
      </div>
      
      {/* Rule Configuration */}
      <div className="bg-white/5 rounded-xl p-6 border border-white/10">
        <h3 className="text-white font-semibold mb-4">Classification Rules</h3>
        <RuleBuilder rules={rules} onChange={setRules} />
      </div>
    </div>
  )
}
```

## Data Models

### Upload Processing Pipeline

```typescript
interface UploadPipeline {
  stages: PipelineStage[]
  currentStage: number
  startTime: Date
  estimatedCompletion?: Date
}

interface PipelineStage {
  name: string
  status: 'pending' | 'running' | 'completed' | 'failed'
  progress: number
  startTime?: Date
  endTime?: Date
  thoughts: AgentThought[]
  error?: string
}

// Stage definitions
const UPLOAD_STAGES: PipelineStage[] = [
  { name: 'File Upload', status: 'pending', progress: 0, thoughts: [] },
  { name: 'Data Analysis', status: 'pending', progress: 0, thoughts: [] },
  { name: 'AI Classification', status: 'pending', progress: 0, thoughts: [] },
  { name: 'Storage Routing', status: 'pending', progress: 0, thoughts: [] },
  { name: 'Indexing & Completion', status: 'pending', progress: 0, thoughts: [] }
]
```

### Storage Integration Models

```typescript
interface StorageMetadata {
  id: string
  originalFileName: string
  storageType: 'sqlite' | 'chromadb'
  tableName?: string // For SQLite
  collectionName?: string // For ChromaDB
  schema?: any
  indexes: string[]
  relationships: StorageRelationship[]
  createdAt: Date
  updatedAt: Date
}

interface StorageRelationship {
  type: 'foreign_key' | 'reference' | 'embedding_similarity'
  targetStorage: string
  targetTable: string
  confidence: number
}
```

## Error Handling

### Upload Error Recovery

```typescript
interface UploadError {
  code: string
  message: string
  stage: string
  recoverable: boolean
  suggestions: string[]
  retryOptions?: RetryOption[]
}

interface RetryOption {
  label: string
  action: 'retry' | 'skip_stage' | 'manual_classification' | 'change_storage'
  parameters?: any
}

const ErrorRecoveryStrategies = {
  FILE_TOO_LARGE: {
    suggestions: ['Split file into smaller chunks', 'Compress file', 'Use streaming upload'],
    retryOptions: [
      { label: 'Split & Upload', action: 'retry', parameters: { chunk: true } },
      { label: 'Compress First', action: 'retry', parameters: { compress: true } }
    ]
  },
  CLASSIFICATION_FAILED: {
    suggestions: ['Try manual classification', 'Update classification prompts', 'Use fallback rules'],
    retryOptions: [
      { label: 'Manual Classification', action: 'manual_classification' },
      { label: 'Use Default Rules', action: 'retry', parameters: { useDefaults: true } }
    ]
  },
  STORAGE_ERROR: {
    suggestions: ['Try alternative storage', 'Check storage capacity', 'Retry with different schema'],
    retryOptions: [
      { label: 'Switch Storage', action: 'change_storage' },
      { label: 'Retry Storage', action: 'retry' }
    ]
  }
}
```

## AI Integration

### Classification Engine Design

```typescript
interface ClassificationEngine {
  analyzeFile(file: File): Promise<FileAnalysis>
  classifyData(analysis: FileAnalysis, prompts: string[], rules: ClassificationRule[]): Promise<ClassificationResult>
  generateInsights(data: any[], classification: ClassificationResult): Promise<DataInsight[]>
  explainDecision(classification: ClassificationResult): Promise<string>
}

interface FileAnalysis {
  fileType: string
  structure: DataStructure
  sampleData: any[]
  statistics: DataStatistics
  quality: QualityMetrics
}

interface DataStructure {
  columns: ColumnInfo[]
  rowCount: number
  hasHeaders: boolean
  encoding: string
  delimiter?: string
}

interface ColumnInfo {
  name: string
  type: 'string' | 'number' | 'date' | 'boolean' | 'mixed'
  nullCount: number
  uniqueCount: number
  sampleValues: any[]
}
```

### Real-time Thinking Stream

```typescript
interface ThinkingStream {
  subscribe(callback: (thought: AgentThought) => void): void
  unsubscribe(): void
  addThought(type: string, content: string, confidence?: number): void
}

// WebSocket integration for real-time updates
const useAgentThinking = (uploadId: string) => {
  const [thoughts, setThoughts] = useState<AgentThought[]>([])
  
  useEffect(() => {
    const ws = new WebSocket(`ws://localhost:8000/ws/thinking/${uploadId}`)
    
    ws.onmessage = (event) => {
      const thought: AgentThought = JSON.parse(event.data)
      setThoughts(prev => [...prev, thought])
    }
    
    return () => ws.close()
  }, [uploadId])
  
  return thoughts
}
```

## Testing Strategy

### Component Testing
1. **Upload Flow Testing**: Test file upload, validation, and progress tracking
2. **Classification Testing**: Test AI classification with various data types
3. **Storage Integration Testing**: Test routing to SQLite and ChromaDB
4. **Real-time Updates Testing**: Test WebSocket connections and thinking stream

### Integration Testing
1. **End-to-End Upload**: Test complete upload pipeline from file to storage
2. **Error Recovery Testing**: Test error handling and recovery mechanisms
3. **Performance Testing**: Test with large files and concurrent uploads
4. **AI Accuracy Testing**: Test classification accuracy with known datasets

### User Experience Testing
1. **Upload UX**: Test drag & drop, progress indicators, and feedback
2. **Agent Thinking Display**: Test real-time thinking panel updates
3. **History Navigation**: Test upload history and insights generation
4. **Responsive Design**: Test on various screen sizes and devices

## Implementation Approach

### Phase 1: Core Upload Infrastructure
1. Enhance DataManagement component with upload zone
2. Implement file upload API endpoints
3. Create progress tracking system
4. Add basic file validation

### Phase 2: AI Classification System
1. Integrate with prompt repository
2. Implement classification engine
3. Add real-time thinking display
4. Create rule-based classification

### Phase 3: Storage Integration
1. Implement SQLite storage routing
2. Add ChromaDB integration
3. Create storage metadata system
4. Add data relationship tracking

### Phase 4: History & Insights
1. Implement upload history tracking
2. Add AI-generated insights
3. Create detailed upload summaries
4. Add search and filtering

### Phase 5: Advanced Features
1. Add classification configuration UI
2. Implement error recovery mechanisms
3. Add performance optimizations
4. Create comprehensive testing suite

## Performance Considerations

### File Upload Optimization
- **Chunked Upload**: Split large files into chunks for better reliability
- **Progress Tracking**: Real-time progress updates without blocking UI
- **Concurrent Processing**: Process multiple files simultaneously
- **Memory Management**: Stream processing for large files

### AI Processing Optimization
- **Prompt Caching**: Cache frequently used prompts and results
- **Batch Processing**: Process multiple files in batches when possible
- **Model Optimization**: Use efficient models for classification
- **Result Caching**: Cache classification results for similar files

### Storage Performance
- **Connection Pooling**: Efficient database connection management
- **Batch Inserts**: Optimize database writes with batch operations
- **Indexing Strategy**: Create appropriate indexes for fast queries
- **Data Partitioning**: Partition large datasets for better performance