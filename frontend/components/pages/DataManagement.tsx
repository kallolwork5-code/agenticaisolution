'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  ArrowLeft, 
  Upload, 
  Database, 
  FileSpreadsheet, 
  Download,
  Eye,
  Trash2,
  Filter,
  RefreshCw,
  Brain,
  History,
  Settings
} from 'lucide-react'
import FileUploadZone from '../upload/FileUploadZone'
import AgentThinkingPanel from '../upload/AgentThinkingPanel'

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

interface AgentThought {
  id: string
  timestamp: Date
  type: 'analysis' | 'prompt' | 'rule' | 'decision'
  content: string
  confidence: number
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
  const [selectedHistoryItem, setSelectedHistoryItem] = useState<UploadHistoryItem | null>(null)
  const [currentView, setCurrentView] = useState<'upload' | 'history'>('upload')

  // Handle file selection from FileUploadZone
  const handleFileSelect = (files: FileList) => {
    if (files.length > 0) {
      const file = files[0] // For now, handle one file at a time
      setUploadState(prev => ({
        ...prev,
        isUploading: true,
        currentFile: file,
        progress: 0,
        stage: 'upload',
        error: null
      }))
      
      // Simulate upload process with agent thinking
      simulateUploadProcess(file)
    }
  }

  // Simulate the upload and classification process
  const simulateUploadProcess = async (file: File) => {
    const stages = ['upload', 'analyze', 'classify', 'store', 'complete'] as const
    
    for (let i = 0; i < stages.length; i++) {
      const stage = stages[i]
      
      setUploadState(prev => ({
        ...prev,
        stage,
        progress: (i / stages.length) * 100
      }))

      // Add agent thoughts for each stage
      addAgentThought(stage, file)
      
      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 2000))
    }

    // Complete the upload
    setUploadState(prev => ({
      ...prev,
      isUploading: false,
      progress: 100,
      stage: 'complete'
    }))
  }

  // Add agent thoughts based on stage
  const addAgentThought = (stage: string, file: File) => {
    const thoughts = {
      upload: `Receiving file "${file.name}" (${(file.size / 1024 / 1024).toFixed(2)} MB). Validating file integrity and format.`,
      analyze: `Analyzing data structure... Detected ${file.type || 'unknown'} format. Examining column headers and data patterns.`,
      classify: `Applying classification prompts... File appears to contain ${file.name.includes('transaction') ? 'transaction data' : file.name.includes('rate') ? 'rate card information' : 'routing rules'}. Confidence: 92%`,
      store: `Routing to ${file.name.includes('json') ? 'ChromaDB for vector storage' : 'SQLite for structured storage'}. Creating indexes and relationships.`,
      complete: `Upload completed successfully! File processed and stored with full metadata tracking.`
    }

    const newThought: AgentThought = {
      id: `${Date.now()}-${Math.random()}`,
      timestamp: new Date(),
      type: stage === 'classify' ? 'prompt' : stage === 'store' ? 'decision' : 'analysis',
      content: thoughts[stage as keyof typeof thoughts] || 'Processing...',
      confidence: stage === 'classify' ? 0.92 : 0.85
    }

    setAgentThoughts(prev => [...prev, newThought])
  }

  // Sample upload history data
  const uploadHistory: UploadHistoryItem[] = [
    {
      id: '1',
      fileName: 'Transaction_Data_Dec2024.csv',
      fileSize: 2400000,
      uploadDate: new Date('2024-12-16'),
      classification: 'Transaction Data',
      storageLocation: 'sqlite',
      recordCount: 15420,
      status: 'success',
      aiSummary: 'High-quality transaction data with complete payment information and minimal missing values.'
    },
    {
      id: '2',
      fileName: 'MDR_Rate_Card_Q4.xlsx',
      fileSize: 856000,
      uploadDate: new Date('2024-12-15'),
      classification: 'Rate Card',
      storageLocation: 'sqlite',
      recordCount: 2340,
      status: 'processing'
    },
    {
      id: '3',
      fileName: 'Routing_Logic_Rules.json',
      fileSize: 124000,
      uploadDate: new Date('2024-12-14'),
      classification: 'Routing Rules',
      storageLocation: 'chromadb',
      recordCount: 89,
      status: 'success',
      aiSummary: 'Complex routing rules with decision trees. Suitable for vector search and similarity matching.'
    }
  ]

  const dataFiles = [
    {
      id: 1,
      name: 'Transaction_Data_Dec2024.csv',
      type: 'Transaction Data',
      size: '2.4 MB',
      records: 15420,
      uploadDate: '2024-12-16',
      status: 'Processed',
      statusColor: 'text-green-400'
    },
    {
      id: 2,
      name: 'MDR_Rate_Card_Q4.xlsx',
      type: 'Rate Card',
      size: '856 KB',
      records: 2340,
      uploadDate: '2024-12-15',
      status: 'Processing',
      statusColor: 'text-yellow-400'
    },
    {
      id: 3,
      name: 'Routing_Logic_Rules.json',
      type: 'Routing Rules',
      size: '124 KB',
      records: 89,
      uploadDate: '2024-12-14',
      status: 'Processed',
      statusColor: 'text-green-400'
    },
    {
      id: 4,
      name: 'SLA_Requirements_2024.csv',
      type: 'SLA Data',
      size: '445 KB',
      records: 567,
      uploadDate: '2024-12-13',
      status: 'Failed',
      statusColor: 'text-red-400'
    }
  ]

  const stats = [
    { label: 'Total Files', value: '247', icon: Database, color: 'bg-green-500' },
    { label: 'Total Records', value: '1.2M', icon: FileSpreadsheet, color: 'bg-green-600' },
    { label: 'Processing Queue', value: '12', icon: RefreshCw, color: 'bg-white' },
    { label: 'Storage Used', value: '45.2 GB', icon: Database, color: 'bg-green-400' }
  ]

  return (
    <div className="min-h-screen bg-black p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          className="flex items-center justify-between mb-12"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center gap-6">
            <button
              onClick={onBack}
              className="w-12 h-12 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 flex items-center justify-center transition-all duration-300"
            >
              <ArrowLeft className="w-5 h-5 text-white" />
            </button>
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">Data Management</h1>
              <p className="text-white/60 text-lg">Upload and manage transaction data, rate cards, and routing rules</p>
            </div>
          </div>
          
          <button className="bg-green-500 hover:bg-green-600 text-black font-semibold px-8 py-4 rounded-xl flex items-center gap-3 transition-all duration-300 shadow-lg hover:shadow-green-500/25">
            <Upload className="w-5 h-5" />
            Upload Data
          </button>
        </motion.div>

        {/* Two-Column Layout: Upload Section (60%) + History Section (40%) */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Upload Section - Left Column (60%) */}
          <div className="lg:col-span-3 space-y-8">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {stats.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white/60 text-sm">{stat.label}</p>
                      <p className="text-2xl font-bold text-white">{stat.value}</p>
                    </div>
                    <div className={`w-12 h-12 ${stat.color} rounded-xl flex items-center justify-center`}>
                      <stat.icon className={`w-6 h-6 ${stat.color === 'bg-white' ? 'text-black' : 'text-white'}`} />
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* File Upload Zone */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <FileUploadZone
                onFileSelect={handleFileSelect}
                acceptedTypes={['.csv', '.xlsx', '.xls', '.json', '.txt']}
                maxSize={50 * 1024 * 1024} // 50MB
                maxFiles={5}
                isUploading={uploadState.isUploading}
              />
            </motion.div>

            {/* Agent Thinking Panel */}
            {(uploadState.isUploading || agentThoughts.length > 0) && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <AgentThinkingPanel
                  thoughts={agentThoughts}
                  isActive={uploadState.isUploading}
                  currentStage={uploadState.stage}
                />
              </motion.div>
            )}

            {/* Recent Files Table */}
            <motion.div
              className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 overflow-hidden"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <div className="p-6 border-b border-white/10">
                <h3 className="text-lg font-semibold text-white">Recent Files</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-white/10">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-medium text-white">File Name</th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-white">Type</th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-white">Status</th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-white">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10">
                    {dataFiles.slice(0, 3).map((file) => (
                      <tr key={file.id} className="hover:bg-white/5 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <FileSpreadsheet className="w-5 h-5 text-green-400" />
                            <span className="text-white font-medium">{file.name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-white/70">{file.type}</td>
                        <td className="px-6 py-4">
                          <span className={`${file.statusColor} font-medium`}>{file.status}</span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <button className="w-8 h-8 rounded-lg bg-white/10 hover:bg-green-500 hover:text-black flex items-center justify-center transition-all duration-300">
                              <Eye className="w-4 h-4" />
                            </button>
                            <button className="w-8 h-8 rounded-lg bg-white/10 hover:bg-green-500 hover:text-black flex items-center justify-center transition-all duration-300">
                              <Download className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          </div>

          {/* History Section - Right Column (40%) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Upload History */}
            <motion.div
              className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <History className="w-5 h-5 text-green-400" />
                  <h3 className="text-lg font-semibold text-white">Upload History</h3>
                </div>
                <button className="text-green-400 hover:text-green-300 text-sm transition-colors">
                  View All
                </button>
              </div>
              
              <div className="space-y-4">
                {uploadHistory.map((item) => (
                  <div 
                    key={item.id}
                    className="bg-white/5 rounded-lg p-4 cursor-pointer hover:bg-white/10 transition-all duration-300"
                    onClick={() => setSelectedHistoryItem(item)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-white font-medium text-sm truncate">
                        {item.fileName}
                      </span>
                      <div className={`px-2 py-1 rounded-full text-xs ${
                        item.status === 'success' ? 'bg-green-500/20 text-green-400' :
                        item.status === 'processing' ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-red-500/20 text-red-400'
                      }`}>
                        {item.status}
                      </div>
                    </div>
                    
                    <div className="flex justify-between text-xs text-white/60 mb-2">
                      <span>{(item.fileSize / 1024 / 1024).toFixed(1)} MB</span>
                      <span>{item.recordCount.toLocaleString()} records</span>
                    </div>
                    
                    <div className="flex items-center justify-between text-xs text-white/40">
                      <span>{item.uploadDate.toLocaleDateString()}</span>
                      <div className="flex items-center gap-1">
                        <Database className="w-3 h-3" />
                        <span>{item.storageLocation}</span>
                      </div>
                    </div>
                    
                    {item.aiSummary && (
                      <div className="mt-2 text-xs text-green-400 italic">
                        "AI: {item.aiSummary.substring(0, 60)}..."
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Quick Insights */}
            <motion.div
              className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
            >
              <div className="flex items-center gap-3 mb-6">
                <Brain className="w-5 h-5 text-green-400" />
                <h3 className="text-lg font-semibold text-white">Quick Insights</h3>
              </div>
              
              <div className="space-y-4">
                <div className="bg-white/5 rounded-lg p-4">
                  <h4 className="text-white font-medium mb-2">Data Quality Score</h4>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 bg-white/10 rounded-full h-2">
                      <div className="bg-green-400 h-2 rounded-full" style={{ width: '85%' }}></div>
                    </div>
                    <span className="text-green-400 font-semibold">85%</span>
                  </div>
                </div>
                
                <div className="bg-white/5 rounded-lg p-4">
                  <h4 className="text-white font-medium mb-2">Storage Distribution</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-white/70">SQLite</span>
                      <span className="text-white">67%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-white/70">ChromaDB</span>
                      <span className="text-white">33%</span>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white/5 rounded-lg p-4">
                  <h4 className="text-white font-medium mb-2">Recent Activity</h4>
                  <p className="text-white/60 text-sm">3 files uploaded today</p>
                  <p className="text-white/60 text-sm">2 classifications completed</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DataManagement