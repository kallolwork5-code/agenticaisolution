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
  }
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

  // Prompt selector state
  const [showPromptSelector, setShowPromptSelector] = useState(false)
  const [selectedPrompt, setSelectedPrompt] = useState<any>(null)
  const [availablePrompts, setAvailablePrompts] = useState<any[]>([])

  // Upload history from database
  const [uploadHistory, setUploadHistory] = useState<UploadHistoryItem[]>([])

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

  // Handle file selection
  const handleFileSelect = (files: FileList) => {
    if (files.length === 0) return

    const file = files[0] // Take the first file
    setUploadState({
      isUploading: true,
      currentFile: file,
      progress: 0,
      stage: 'upload',
      error: null
    })

    // Initialize progress tracking
    initializeProgressStages()

    // Start upload simulation
    simulateUploadProcess(file)
  }

  // Simulate upload process with stages
  const simulateUploadProcess = async (file: File) => {
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
      addAgentThought('analysis', `Starting ${stage} phase for ${file.name}`, 0.9)

      // Simulate progress for this stage
      for (let progress = 0; progress <= 100; progress += 10) {
        await new Promise(resolve => setTimeout(resolve, 200))
        updateProgressStage(stage, { progress })

        // Update overall progress
        const overallProgress = ((i * 100) + progress) / stages.length
        setUploadState(prev => ({ ...prev, progress: overallProgress }))
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

    // Reload upload history
    loadUploadHistory()
  }

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

  // Load upload history from database
  const loadUploadHistory = useCallback(async () => {
    try {
      const response = await fetch('/api/upload/history')
      if (response.ok) {
        const history = await response.json()
        setUploadHistory(history)
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
        const response = await fetch('/api/prompts')
        if (response.ok) {
          const prompts = await response.json()
          setAvailablePrompts(prompts)
        } else {
          // Mock prompts for now
          setAvailablePrompts([
            { id: 1, name: 'Financial Data Classifier', description: 'Specialized for transaction and payment data', category: 'finance' },
            { id: 2, name: 'Customer Data Analyzer', description: 'Optimized for customer demographics and behavior', category: 'customer' },
            { id: 3, name: 'Document Parser', description: 'General purpose document and text analysis', category: 'document' },
            { id: 4, name: 'Rate Card Processor', description: 'Specialized for pricing and rate information', category: 'finance' },
            { id: 5, name: 'Routing Rules Engine', description: 'Payment routing and decision logic', category: 'routing' }
          ])
        }
      } catch (error) {
        console.error('Failed to load prompts:', error)
      }
    }
    loadPrompts()
  }, [])

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

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Upload Section (2/3 width) */}
            <div className="lg:col-span-2 space-y-6">
              {/* File Upload Zone with Prompt Selector */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="relative"
              >
                <div className="flex gap-4">
                  {/* Upload Zone - Takes most space */}
                  <div className="flex-1">
                    <FileUploadZone
                      onFileSelect={handleFileSelect}
                      acceptedTypes={['.csv', '.xlsx', '.xls', '.json', '.txt', '.pdf', '.doc', '.docx', '.png', '.jpg', '.jpeg']}
                      maxSize={100 * 1024 * 1024} // 100MB for larger files
                      isUploading={uploadState.isUploading}
                    />
                  </div>

                  {/* Prompt Selector Button */}
                  <div className="flex flex-col gap-2">
                    <button
                      className="w-12 h-12 bg-green-500/20 hover:bg-green-500/30 border border-green-500/30 rounded-xl flex items-center justify-center transition-all duration-300 group"
                      title="Select Processing Prompt"
                      onClick={() => setShowPromptSelector(true)}
                    >
                      <svg className="w-6 h-6 text-green-400 group-hover:text-green-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </button>
                    {selectedPrompt && (
                      <div className="text-xs text-green-400 text-center max-w-12 truncate">
                        {selectedPrompt.name}
                      </div>
                    )}
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
                    onCancel={() => setUploadState(prev => ({ ...prev, isUploading: false }))}
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

            {/* Right Column - Upload History (1/3 width) */}
            <div className="space-y-6">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.8 }}
              >
                <UploadHistory
                  items={uploadHistory}
                  onItemClick={setSelectedHistoryItem}
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