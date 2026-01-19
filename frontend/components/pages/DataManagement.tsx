'use client'

import React, { useState, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft,
  Upload,
  X,
  Search,
  CheckCircle
} from 'lucide-react'
import FileUploadZone from '../upload/FileUploadZone'
import AgentThinkingPanel from '../upload/AgentThinkingPanel'
import ProgressTracker from '../upload/ProgressTracker'
import UploadHistory from '../upload/UploadHistory'

interface DataManagementProps {
  onBack: () => void
}

interface UploadState {
  isUploading: boolean
  currentFile: File | null
  progress: number
  stage: 'upload' | 'analyze' | 'classify' | 'store' | 'complete'
  error: string | null
}

interface ProgressStage {
  id: string
  name: string
  status: 'pending' | 'active' | 'completed' | 'error'
  progress: number
  startTime?: Date
  endTime?: Date
  error?: string
}

interface AgentThought {
  id: string
  timestamp: Date
  type: 'analysis' | 'prompt' | 'rule' | 'decision'
  content: string
  confidence: number
  metadata?: {
    promptUsed?: string
    ruleApplied?: string
    dataPoints?: number
    processingTime?: number
    stageIndex?: number
    totalStages?: number
    fileSize?: number
    promptId?: string
    category?: string
  }
}

interface DataInsight {
  type: 'pattern' | 'quality' | 'recommendation' | 'anomaly'
  title: string
  description: string
  confidence: number
  actionable: boolean
}

interface UploadHistoryItem {
  id: string
  fileName: string
  fileSize: number
  uploadDate: Date
  classification: string
  storageLocation: 'sqlite' | 'chromadb'
  recordCount: number
  status: 'success' | 'failed' | 'processing'
  aiSummary?: string
  insights?: DataInsight[]
}

const DataManagement: React.FC<DataManagementProps> = ({ onBack }) => {
  // State management for upload processes
  const [uploadState, setUploadState] = useState<UploadState>({
    isUploading: false,
    currentFile: null,
    progress: 0,
    stage: 'upload',
    error: null
  })

  const [agentThoughts, setAgentThoughts] = useState<AgentThought[]>([])
  const [, setSelectedHistoryItem] = useState<UploadHistoryItem | null>(null)
  const [progressStages, setProgressStages] = useState<ProgressStage[]>([])
  const [estimatedTimeRemaining, setEstimatedTimeRemaining] = useState<number>(0)
  const [uploadStartTime, setUploadStartTime] = useState<Date | null>(null)
  const [isCancelling, setIsCancelling] = useState(false)

  // Prompt selector state
  const [showPromptSelector, setShowPromptSelector] = useState(false)
  const [selectedPrompt, setSelectedPrompt] = useState<any>(null)
  const [availablePrompts, setAvailablePrompts] = useState<any[]>([])

  // Upload history from database
  const [uploadHistory, setUploadHistory] = useState<UploadHistoryItem[]>([])
  
  // History expansion state
  const [isHistoryExpanded, setIsHistoryExpanded] = useState(false)

  // Initialize progress stages
  const initializeProgressStages = () => {
    const stages: ProgressStage[] = [
      { id: 'upload', name: 'File Upload', status: 'pending', progress: 0 },
      { id: 'analyze', name: 'Data Analysis', status: 'pending', progress: 0 },
      { id: 'classify', name: 'AI Classification', status: 'pending', progress: 0 },
      { id: 'store', name: 'Storage Routing', status: 'pending', progress: 0 },
      { id: 'complete', name: 'Completion', status: 'pending', progress: 0 }
    ]
    setProgressStages(stages)
  }

  // Update progress stage
  const updateProgressStage = (stageId: string, updates: Partial<ProgressStage>) => {
    setProgressStages(prev =>
      prev.map(stage =>
        stage.id === stageId ? { ...stage, ...updates } : stage
      )
    )
  }

  // Calculate estimated time remaining
  const calculateEstimatedTime = useCallback((currentProgress: number, startTime: Date) => {
    if (currentProgress <= 0) return 0

    const elapsedTime = (Date.now() - startTime.getTime()) / 1000 // in seconds
    const progressRate = currentProgress / elapsedTime // progress per second
    const remainingProgress = 100 - currentProgress

    return remainingProgress / progressRate
  }, [])

  // Add agent thought
  const addAgentThought = useCallback((type: AgentThought['type'], content: string, confidence: number, metadata?: AgentThought['metadata']) => {
    const newThought: AgentThought = {
      id: `${Date.now()}-${Math.random()}`,
      timestamp: new Date(),
      type,
      content,
      confidence,
      metadata
    }

    setAgentThoughts(prev => [...prev, newThought])
  }, [])

  // Handle upload cancellation
  const handleCancelUpload = useCallback(() => {
    setIsCancelling(true)

    // Mark current active stage as error
    setProgressStages(prev =>
      prev.map(stage =>
        stage.status === 'active'
          ? { ...stage, status: 'error', error: 'Upload cancelled by user' }
          : stage
      )
    )

    // Reset upload state
    setTimeout(() => {
      setUploadState({
        isUploading: false,
        currentFile: null,
        progress: 0,
        stage: 'upload',
        error: 'Upload cancelled'
      })
      setIsCancelling(false)
      setUploadStartTime(null)
      setEstimatedTimeRemaining(0)

      // Add cancellation thought
      addAgentThought('decision', 'Upload process cancelled by user', 0.0, {
        processingTime: uploadStartTime ? Date.now() - uploadStartTime.getTime() : 0
      })
    }, 1000)
  }, [uploadStartTime, addAgentThought])

  // Handle file selection
  const handleFileSelect = (files: FileList) => {
    if (files.length === 0) return

    const file = files[0] // Take the first file
    const startTime = new Date()

    setUploadState({
      isUploading: true,
      currentFile: file,
      progress: 0,
      stage: 'upload',
      error: null
    })

    setUploadStartTime(startTime)
    setIsCancelling(false)
    setEstimatedTimeRemaining(0)

    // Initialize progress tracking
    initializeProgressStages()

    // Clear previous agent thoughts
    setAgentThoughts([])

    // Add initial agent thought about the selected prompt
    if (selectedPrompt) {
      addAgentThought('prompt', 
        `Selected prompt: ${selectedPrompt.name} - ${selectedPrompt.description}`, 
        0.95,
        { promptId: selectedPrompt.id, category: selectedPrompt.category }
      )
    }

    // Start real upload process with backend integration
    processUploadWithBackend(file, startTime)
  }

  // Real upload process with backend integration
  const processUploadWithBackend = async (file: File, startTime: Date) => {
    let wsConnected = false
    let ws: WebSocket | null = null
    
    try {
      // Try to connect to WebSocket for real-time updates (optional)
      ws = new WebSocket('ws://localhost:8000/api/upload/ws/upload')
      
      ws.onopen = () => {
        wsConnected = true
        console.log('WebSocket connected for real-time updates')
      }
      
      ws.onmessage = (event) => {
        const data = JSON.parse(event.data)
        
        if (data.type === 'progress') {
          // Update progress stage
          updateProgressStage(data.stage, {
            status: 'active',
            progress: data.progress,
            startTime: new Date()
          })
          
          // Update overall progress
          setUploadState(prev => ({ 
            ...prev, 
            progress: data.progress,
            stage: data.stage as any
          }))
          
          // Calculate estimated time remaining
          if (data.progress > 0) {
            const estimatedTime = calculateEstimatedTime(data.progress, startTime)
            setEstimatedTimeRemaining(estimatedTime)
          }
          
        } else if (data.type === 'agent_thought') {
          // Add real agent thinking update from backend
          addAgentThought(
            data.thought_type as any,
            data.content,
            data.confidence,
            data.metadata
          )
        }
      }
      
      ws.onerror = (error) => {
        console.warn('WebSocket error (will continue without real-time updates):', error)
        wsConnected = false
      }
      
      // Wait a moment for WebSocket to connect, but don't block the upload
      await new Promise(resolve => setTimeout(resolve, 500))
      
    } catch (error) {
      console.warn('WebSocket connection failed (will continue without real-time updates):', error)
      wsConnected = false
    }
    
    // Always upload the file via HTTP POST (regardless of WebSocket status)
    try {
      // If no WebSocket, show manual progress updates
      if (!wsConnected) {
        addAgentThought('analysis', `Starting upload process for ${file.name}`, 0.9)
        updateProgressStage('upload', { status: 'active', progress: 20, startTime: new Date() })
      }
      
      // Upload file to backend
      const formData = new FormData()
      formData.append('file', file)
      if (selectedPrompt) {
        formData.append('prompt_id', selectedPrompt.id.toString())
      }
      
      const response = await fetch('http://localhost:8000/api/upload/process', {
        method: 'POST',
        body: formData
      })
      
      if (response.ok) {
        const result = await response.json()
        
        // If no WebSocket, show manual completion
        if (!wsConnected) {
          addAgentThought('decision', `File classified as ${result.classification} with ${(result.confidence * 100).toFixed(0)}% confidence`, result.confidence)
          
          // Mark all stages as completed
          const stages = ['upload', 'analyze', 'classify', 'store', 'complete']
          stages.forEach((stage, index) => {
            updateProgressStage(stage, {
              status: 'completed',
              progress: 100,
              endTime: new Date()
            })
          })
        }
        
        // Final completion
        setUploadState(prev => ({ 
          ...prev, 
          isUploading: false, 
          stage: 'complete',
          progress: 100 
        }))
        
        // Reset time tracking
        setEstimatedTimeRemaining(0)
        setUploadStartTime(null)
        
        // Add final success thought
        addAgentThought('decision', `Upload completed successfully! File stored in ${result.storage_location.toUpperCase()} with ${result.record_count} records.`, 0.95)
        
        // Reload upload history to show the new upload
        await loadUploadHistory()
        
      } else {
        throw new Error(`Upload failed: ${response.status} ${response.statusText}`)
      }
      
    } catch (error) {
      console.error('Upload error:', error)
      addAgentThought('analysis', `Upload failed: ${error}`, 0.1)
      
      setUploadState(prev => ({ 
        ...prev, 
        isUploading: false, 
        error: error instanceof Error ? error.message : 'Upload failed'
      }))
    } finally {
      // Close WebSocket if it was opened
      if (ws) {
        ws.close()
      }
    }
  }
  
  // Fallback simulation for when backend is not available
  const simulateUploadProcess = async (file: File, startTime: Date) => {
    const stages = ['upload', 'analyze', 'classify', 'store', 'complete']
    
    for (let i = 0; i < stages.length; i++) {
      const stage = stages[i]
      
      // Update stage to active
      updateProgressStage(stage, { 
        status: 'active', 
        startTime: new Date(),
        progress: 0 
      })

      // Add agent thoughts for this stage
      if (stage === 'classify') {
        addAgentThought('prompt', `Using ${selectedPrompt?.name || 'default'} prompt for classification`, 0.9)
        addAgentThought('rule', 'Checking rule-based classification patterns...', 0.8)
        addAgentThought('decision', `Classified as ${getFileTypeFromName(file.name)} based on file structure`, 0.85)
      } else {
        addAgentThought('analysis', `Starting ${stage} phase for ${file.name}`, 0.9)
      }

      // Simulate progress for this stage
      for (let progress = 0; progress <= 100; progress += 10) {
        await new Promise(resolve => setTimeout(resolve, 200))
        updateProgressStage(stage, { progress })
        
        // Update overall progress
        const overallProgress = ((i * 100) + progress) / stages.length
        setUploadState(prev => ({ ...prev, progress: overallProgress }))
        
        // Calculate estimated time remaining
        if (overallProgress > 0) {
          const estimatedTime = calculateEstimatedTime(overallProgress, startTime)
          setEstimatedTimeRemaining(estimatedTime)
        }
      }

      // Mark stage as completed
      updateProgressStage(stage, { 
        status: 'completed', 
        progress: 100,
        endTime: new Date()
      })
      
      // Add completion thought
      addAgentThought('decision', `${stage} phase completed successfully`, 0.95)
    }

    // Final completion
    setUploadState(prev => ({ 
      ...prev, 
      isUploading: false, 
      stage: 'complete',
      progress: 100 
    }))

    // Reset time tracking
    setEstimatedTimeRemaining(0)
    setUploadStartTime(null)

    // Reload upload history
    loadUploadHistory()
  }
  
  // Helper function to determine file type from name
  const getFileTypeFromName = (fileName: string): string => {
    const extension = fileName.split('.').pop()?.toLowerCase()
    
    // Document types
    if (['pdf', 'doc', 'docx', 'txt'].includes(extension || '')) {
      return 'Document'
    }
    
    // Data types
    if (fileName.includes('transaction') || fileName.includes('payment')) return 'Transaction Data'
    if (fileName.includes('rate') || fileName.includes('mdr')) return 'Rate Card Data'
    if (fileName.includes('route') || fileName.includes('routing')) return 'Routing Data'
    if (fileName.includes('customer') || fileName.includes('user')) return 'Customer Data'
    
    // Default based on extension
    if (['csv', 'xlsx', 'xls'].includes(extension || '')) return 'Structured Data'
    if (extension === 'json') return 'JSON Data'
    
    return 'Document Data'
  }



  // Load upload history from database
  const loadUploadHistory = useCallback(async () => {
    try {
      const response = await fetch('http://localhost:8000/api/upload/history')
      if (response.ok) {
        const history = await response.json()
        // Convert uploadDate strings to Date objects and parse aiInsights
        const processedHistory = history.map((item: any) => {
          let insights: DataInsight[] | undefined = undefined
          
          // Parse aiInsights - check different formats
          if (item.aiInsights && Array.isArray(item.aiInsights) && item.aiInsights.length > 0) {
            try {
              const firstInsight = item.aiInsights[0]
              
              if (firstInsight.type === 'summary' && firstInsight.title && firstInsight.description) {
                // Document summary type - convert to insights format
                insights = [{
                  type: 'quality',
                  title: 'Document Processed',
                  description: `Document "${item.fileName}" has been successfully processed and summarized.`,
                  confidence: firstInsight.confidence || 0.9,
                  actionable: false
                }]
              } else if (firstInsight.type === 'analysis' && firstInsight.description && firstInsight.description.includes('```json')) {
                // Analysis type with JSON in description - extract the JSON
                const desc = firstInsight.description
                const jsonStart = desc.indexOf('[')
                const jsonEnd = desc.lastIndexOf(']') + 1
                if (jsonStart !== -1 && jsonEnd !== -1) {
                  const jsonStr = desc.substring(jsonStart, jsonEnd)
                  insights = JSON.parse(jsonStr)
                }
              } else if (firstInsight.type && firstInsight.title && firstInsight.description) {
                // Already structured insights - use directly
                insights = item.aiInsights.map((insight: any) => ({
                  type: insight.type,
                  title: insight.title,
                  description: insight.description,
                  confidence: insight.confidence || 0.8,
                  actionable: insight.actionable || false
                }))
              }
            } catch (error) {
              console.error('Failed to parse aiInsights:', error)
            }
          }
          
          return {
            ...item,
            uploadDate: new Date(item.uploadDate),
            insights
          }
        })
        setUploadHistory(processedHistory)
      } else {
        // Fallback to mock data if API doesn't exist yet
        const mockHistory: UploadHistoryItem[] = [
          {
            id: '1',
            fileName: 'customer_data.csv',
            fileSize: 2048576,
            uploadDate: new Date('2024-12-15T10:30:00'),
            classification: 'Customer Data',
            storageLocation: 'sqlite',
            recordCount: 15420,
            status: 'success',
            aiSummary: 'Customer dataset with demographics and purchase history. High data quality detected.'
          },
          {
            id: '2',
            fileName: 'product_reviews.json',
            fileSize: 1536000,
            uploadDate: new Date('2024-12-14T14:22:00'),
            classification: 'Text Data',
            storageLocation: 'chromadb',
            recordCount: 8750,
            status: 'success',
            aiSummary: 'Product review text data suitable for sentiment analysis and NLP processing.'
          }
        ]
        setUploadHistory(mockHistory)
      }
    } catch (error) {
      console.error('Failed to load upload history:', error)
      // Provide empty array as fallback
      setUploadHistory([])
    }
  }, [])

  // Load history on component mount
  useEffect(() => {
    loadUploadHistory()
  }, [loadUploadHistory])

  // Load available prompts on component mount
  useEffect(() => {
    const loadPrompts = async () => {
      try {
        const response = await fetch('http://localhost:8000/api/prompts/agents/roles')
        if (response.ok) {
          const roles = await response.json()
          // Transform agent roles into prompt options for the UI
          const transformedPrompts = roles.map((role: string, index: number) => {
            // Create user-friendly names and descriptions based on agent roles
            const promptInfo = getPromptInfo(role)
            return {
              id: index + 1,
              name: promptInfo.name,
              description: promptInfo.description,
              category: promptInfo.category,
              agent_role: role
            }
          })
          setAvailablePrompts(transformedPrompts)
        } else {
          // Fallback to mock prompts
          setAvailablePrompts([
            { id: 1, name: 'Financial Data Classifier', description: 'Specialized for transaction and payment data', category: 'finance', agent_role: 'financial_classifier' },
            { id: 2, name: 'Customer Data Analyzer', description: 'Optimized for customer demographics and behavior', category: 'customer', agent_role: 'customer_analyzer' },
            { id: 3, name: 'Document Parser', description: 'General purpose document and text analysis', category: 'document', agent_role: 'document_summarizer' },
            { id: 4, name: 'Rate Card Processor', description: 'Specialized for pricing and rate information', category: 'finance', agent_role: 'rate_processor' },
            { id: 5, name: 'Routing Rules Engine', description: 'Payment routing and decision logic', category: 'routing', agent_role: 'routing_optimizer' }
          ])
        }
      } catch (error) {
        console.error('Failed to load prompts:', error)
        // Fallback to mock prompts
        setAvailablePrompts([
          { id: 1, name: 'Financial Data Classifier', description: 'Specialized for transaction and payment data', category: 'finance', agent_role: 'financial_classifier' },
          { id: 2, name: 'Customer Data Analyzer', description: 'Optimized for customer demographics and behavior', category: 'customer', agent_role: 'customer_analyzer' },
          { id: 3, name: 'Document Parser', description: 'General purpose document and text analysis', category: 'document', agent_role: 'document_summarizer' },
          { id: 4, name: 'Rate Card Processor', description: 'Specialized for pricing and rate information', category: 'finance', agent_role: 'rate_processor' },
          { id: 5, name: 'Routing Rules Engine', description: 'Payment routing and decision logic', category: 'routing', agent_role: 'routing_optimizer' }
        ])
      }
    }
    loadPrompts()
  }, [])

  // Helper function to get prompt info based on agent role
  const getPromptInfo = (role: string) => {
    const roleMap: Record<string, { name: string; description: string; category: string }> = {
      'document_summarizer': {
        name: 'Document Summarizer',
        description: 'AI-powered document analysis and summarization for compliance and validation reports',
        category: 'document'
      },
      'data_classifier': {
        name: 'Data Classifier',
        description: 'Intelligent classification of uploaded data files and content analysis',
        category: 'document'
      },
      'custom_fraud_detector': {
        name: 'Fraud Detection Agent',
        description: 'Advanced fraud detection and risk assessment for financial transactions',
        category: 'finance'
      },
      'cost_calculation_agent': {
        name: 'Cost Calculator',
        description: 'Payment processing cost analysis and optimization recommendations',
        category: 'finance'
      },
      'routing_optimization_agent': {
        name: 'Routing Optimizer',
        description: 'Payment routing optimization and decision logic analysis',
        category: 'routing'
      },
      'compliance_checker_agent': {
        name: 'Compliance Checker',
        description: 'Regulatory compliance validation and audit trail analysis',
        category: 'finance'
      },
      'performance_analysis_agent': {
        name: 'Performance Analyzer',
        description: 'System performance metrics and optimization insights',
        category: 'routing'
      },
      'settlement_analysis_agent': {
        name: 'Settlement Analyzer',
        description: 'Settlement process analysis and reconciliation insights',
        category: 'finance'
      }
    }

    return roleMap[role] || {
      name: role.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      description: `AI agent for ${role.replace(/_/g, ' ')} processing and analysis`,
      category: 'document'
    }
  }

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -inset-10 opacity-50">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-green-500/10 rounded-full mix-blend-multiply filter blur-xl animate-blob"></div>
          <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-2000"></div>
          <div className="absolute bottom-1/4 left-1/3 w-96 h-96 bg-teal-500/10 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-4000"></div>
        </div>
      </div>

      <div className="relative z-10 p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <motion.div
            className="flex items-center justify-between mb-8"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center gap-4">
              <button
                onClick={onBack}
                className="w-10 h-10 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-white" />
              </button>
              <div>
                <h1 className="text-3xl font-bold text-white">Data Management</h1>
                <p className="text-white/60">Upload, classify, and manage your data with AI assistance</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-green-400">
              <Upload className="w-5 h-5" />
              <span className="font-medium">Smart Upload System</span>
            </div>
          </motion.div>

          {/* Main Content Grid - Responsive to History Expansion */}
          <div className={`grid grid-cols-1 gap-8 transition-all duration-500 ${
            isHistoryExpanded 
              ? 'lg:grid-cols-2' // 50/50 split when expanded
              : 'lg:grid-cols-3' // 2/3 + 1/3 split when collapsed
          }`}>
            {/* Left Column - Upload Section */}
            <div className={`space-y-6 transition-all duration-500 ${
              isHistoryExpanded 
                ? 'lg:col-span-1' // Takes 1/2 when expanded
                : 'lg:col-span-2' // Takes 2/3 when collapsed
            }`}>
              {/* File Upload Zone with Prompt Selector - Improved Layout */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="relative"
              >
                {/* Upload Section Header */}
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-xl font-semibold text-white">File Upload</h2>
                    <p className="text-white/60 text-sm">Upload your data files for AI processing and analysis</p>
                  </div>
                  {selectedPrompt && (
                    <div className="flex items-center gap-2 px-3 py-2 bg-green-500/20 border border-green-500/30 rounded-lg">
                      <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                      <span className="text-green-400 text-sm font-medium">{selectedPrompt.name}</span>
                    </div>
                  )}
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                  {/* Upload Zone - Takes most space */}
                  <div className="lg:col-span-3">
                    <FileUploadZone
                      onFileSelect={handleFileSelect}
                      acceptedTypes={['.csv', '.xlsx', '.xls', '.json', '.txt', '.pdf', '.doc', '.docx']}
                      maxSize={100 * 1024 * 1024} // 100MB for larger document files
                      isUploading={uploadState.isUploading}
                    />
                  </div>

                  {/* Prompt Selector Panel */}
                  <div className="lg:col-span-1 space-y-3">
                    <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                      <h3 className="text-white font-medium text-sm mb-3 flex items-center gap-2">
                        <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        Processing Agent
                      </h3>
                      
                      <button
                        onClick={() => setShowPromptSelector(true)}
                        className="w-full p-3 bg-green-500/20 hover:bg-green-500/30 border border-green-500/30 rounded-lg transition-all duration-300 group text-left"
                      >
                        <div className="text-green-400 text-sm font-medium mb-1">
                          {selectedPrompt ? selectedPrompt.name : 'Select Agent'}
                        </div>
                        <div className="text-white/60 text-xs">
                          {selectedPrompt ? selectedPrompt.description : 'Choose how your data should be processed'}
                        </div>
                      </button>
                      
                      {selectedPrompt && (
                        <button
                          onClick={() => setSelectedPrompt(null)}
                          className="w-full mt-2 p-2 text-xs text-white/60 hover:text-white/80 transition-colors"
                        >
                          Clear Selection
                        </button>
                      )}
                    </div>
                    
                    {/* Quick Stats */}
                    <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                      <h3 className="text-white font-medium text-sm mb-3">Upload Stats</h3>
                      <div className="space-y-2 text-xs">
                        <div className="flex justify-between">
                          <span className="text-white/60">Total Files:</span>
                          <span className="text-white">{uploadHistory.length}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-white/60">Success Rate:</span>
                          <span className="text-green-400">
                            {uploadHistory.length > 0 
                              ? Math.round((uploadHistory.filter(item => item.status === 'success').length / uploadHistory.length) * 100)
                              : 0}%
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-white/60">Total Records:</span>
                          <span className="text-white">
                            {uploadHistory.reduce((acc, item) => acc + item.recordCount, 0).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Progress Tracker */}
              {uploadState.isUploading && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                >
                  <ProgressTracker
                    stages={progressStages}
                    currentStage={uploadState.stage}
                    overallProgress={uploadState.progress}
                    estimatedTimeRemaining={estimatedTimeRemaining}
                    onCancel={handleCancelUpload}
                    isCancelling={isCancelling}
                  />
                </motion.div>
              )}

              {/* Agent Thinking Panel */}
              {agentThoughts.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.6 }}
                >
                  <AgentThinkingPanel
                    thoughts={agentThoughts}
                    isActive={uploadState.isUploading}
                    currentStage={uploadState.stage}
                  />
                </motion.div>
              )}
            </div>

            {/* Right Column - Upload History with Expansion */}
            <div className={`space-y-6 transition-all duration-500 ${
              isHistoryExpanded 
                ? 'lg:col-span-1' // Takes 1/2 when expanded
                : 'lg:col-span-1' // Takes 1/3 when collapsed
            }`}>
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.8 }}
                className="relative"
              >
                {/* Expansion Toggle Button */}
                <button
                  onClick={() => setIsHistoryExpanded(!isHistoryExpanded)}
                  className="absolute -top-2 -right-2 z-10 w-8 h-8 bg-green-500/20 hover:bg-green-500/30 border border-green-500/30 rounded-lg flex items-center justify-center transition-all duration-300 group"
                  title={isHistoryExpanded ? "Collapse History" : "Expand History"}
                >
                  <motion.div
                    animate={{ rotate: isHistoryExpanded ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <svg className="w-4 h-4 text-green-400 group-hover:text-green-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                    </svg>
                  </motion.div>
                </button>
                
                <UploadHistory
                  items={uploadHistory}
                  onItemClick={setSelectedHistoryItem}
                  className={`transition-all duration-500 ${
                    isHistoryExpanded 
                      ? 'min-h-[600px]' // Taller when expanded
                      : 'min-h-[400px]' // Normal height when collapsed
                  }`}
                />
              </motion.div>
            </div>
          </div>

          {/* Prompt Selector Modal */}
          <AnimatePresence>
            {showPromptSelector && (
              <motion.div
                className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowPromptSelector(false)}
              >
                <motion.div
                  className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto"
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Modal Header */}
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-xl font-bold text-white">Select Processing Prompt</h3>
                      <p className="text-white/60 text-sm">Choose how your data should be analyzed and classified</p>
                    </div>
                    <button
                      onClick={() => setShowPromptSelector(false)}
                      className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                    >
                      <X className="w-4 h-4 text-white" />
                    </button>
                  </div>

                  {/* Search Bar */}
                  <div className="relative mb-6">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/40" />
                    <input
                      type="text"
                      placeholder="Search prompts..."
                      className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-green-500/50"
                    />
                  </div>

                  {/* Prompt Categories */}
                  <div className="space-y-4">
                    {['finance', 'customer', 'document', 'routing'].map((category) => {
                      const categoryPrompts = availablePrompts.filter(p => p.category === category)
                      if (categoryPrompts.length === 0) return null

                      return (
                        <div key={category}>
                          <h4 className="text-green-400 font-medium mb-3 capitalize">{category} Prompts</h4>
                          <div className="grid gap-3">
                            {categoryPrompts.map((prompt) => (
                              <motion.div
                                key={prompt.id}
                                className={`
                                  p-4 rounded-lg border cursor-pointer transition-all duration-200
                                  ${selectedPrompt?.id === prompt.id
                                    ? 'bg-green-500/20 border-green-500/50'
                                    : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'
                                  }
                                `}
                                onClick={() => setSelectedPrompt(prompt)}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                              >
                                <div className="flex items-center justify-between mb-2">
                                  <h5 className="text-white font-medium">{prompt.name}</h5>
                                  {selectedPrompt?.id === prompt.id && (
                                    <CheckCircle className="w-5 h-5 text-green-400" />
                                  )}
                                </div>
                                <p className="text-white/60 text-sm">{prompt.description}</p>
                              </motion.div>
                            ))}
                          </div>
                        </div>
                      )
                    })}
                  </div>

                  {/* Modal Actions */}
                  <div className="flex items-center justify-between mt-8 pt-6 border-t border-white/10">
                    <button
                      onClick={() => {
                        setSelectedPrompt(null)
                        setShowPromptSelector(false)
                      }}
                      className="px-4 py-2 text-white/60 hover:text-white transition-colors"
                    >
                      Clear Selection
                    </button>
                    <div className="flex gap-3">
                      <button
                        onClick={() => setShowPromptSelector(false)}
                        className="px-6 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => setShowPromptSelector(false)}
                        disabled={!selectedPrompt}
                        className="px-6 py-2 bg-green-500 hover:bg-green-600 disabled:bg-green-500/50 text-black font-medium rounded-lg transition-colors disabled:cursor-not-allowed"
                      >
                        Apply Prompt
                      </button>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}

export default DataManagement