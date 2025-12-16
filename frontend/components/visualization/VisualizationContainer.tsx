'use client'

import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { PipelineVisualizer } from './PipelineVisualizer'
import { ConnectionStatus } from './ConnectionStatus'
import { ViewModeToggle } from './ViewModeToggle'
import { useVisualizationWebSocket } from '../../lib/hooks/useVisualizationWebSocket'
import { 
  useVisualizationStore, 
  useConnectionStatus, 
  useActiveFiles,
  useVisualizationActions 
} from '../../lib/stores/visualization-store'
import { ProcessingFile } from '../../lib/types/visualization'

interface VisualizationContainerProps {
  className?: string
}

export function VisualizationContainer({ className = '' }: VisualizationContainerProps) {
  const { isConnected, startFileMonitoring, stopFileMonitoring } = useVisualizationWebSocket()
  const connectionStatus = useConnectionStatus()
  const activeFiles = useActiveFiles()
  const actions = useVisualizationActions()
  const [selectedFileId, setSelectedFileId] = useState<string | null>(null)

  // Auto-select first file if none selected
  useEffect(() => {
    const fileIds = Array.from(activeFiles.keys())
    if (fileIds.length > 0 && !selectedFileId) {
      setSelectedFileId(fileIds[0])
    } else if (fileIds.length === 0) {
      setSelectedFileId(null)
    }
  }, [activeFiles, selectedFileId])

  const handleStepClick = (stepId: string) => {
    actions.setSelectedStep(stepId)
  }

  const handleFileSelect = (fileId: string) => {
    setSelectedFileId(fileId)
  }

  const selectedProcessingState = selectedFileId ? activeFiles.get(selectedFileId) : null

  return (
    <div className={`visualization-container ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white mb-1">
            Agentic Data Processing
          </h2>
          <p className="text-gray-400">
            Real-time visualization of AI agent pipeline
          </p>
        </div>
        
        <div className="flex items-center space-x-4">
          <ConnectionStatus status={connectionStatus} />
          <ViewModeToggle />
        </div>
      </div>

      {/* File Tabs */}
      {activeFiles.size > 0 && (
        <div className="mb-6">
          <div className="flex space-x-2 overflow-x-auto pb-2">
            {Array.from(activeFiles.keys()).map((fileId) => (
              <motion.button
                key={fileId}
                className={`
                  px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap
                  transition-colors duration-200
                  ${selectedFileId === fileId
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }
                `}
                onClick={() => handleFileSelect(fileId)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {fileId}
              </motion.button>
            ))}
          </div>
        </div>
      )}

      {/* Main Content */}
      <AnimatePresence mode="wait">
        {!isConnected ? (
          <motion.div
            key="disconnected"
            className="text-center py-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <div className="text-gray-400 mb-4">
              <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" />
              </svg>
              <h3 className="text-lg font-medium text-gray-300 mb-2">
                Connecting to Processing Pipeline
              </h3>
              <p className="text-sm">
                Establishing real-time connection with the agent system...
              </p>
            </div>
          </motion.div>
        ) : activeFiles.size === 0 ? (
          <motion.div
            key="empty"
            className="text-center py-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <div className="text-gray-400 mb-4">
              <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              <h3 className="text-lg font-medium text-gray-300 mb-2">
                No Active Processing
              </h3>
              <p className="text-sm">
                Upload a file to see the agentic processing pipeline in action
              </p>
            </div>
          </motion.div>
        ) : selectedProcessingState ? (
          <motion.div
            key={selectedFileId}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <PipelineVisualizer
              fileId={selectedFileId!}
              processingState={selectedProcessingState}
              onStepClick={handleStepClick}
            />
          </motion.div>
        ) : null}
      </AnimatePresence>

      {/* Debug Panel (Development Only) */}
      {process.env.NODE_ENV === 'development' && (
        <DebugPanel 
          activeFiles={activeFiles}
          connectionStatus={connectionStatus}
          onStartMonitoring={startFileMonitoring}
          onStopMonitoring={stopFileMonitoring}
        />
      )}
    </div>
  )
}

interface DebugPanelProps {
  activeFiles: Map<string, any>
  connectionStatus: any
  onStartMonitoring: (file: ProcessingFile) => void
  onStopMonitoring: (fileId: string) => void
}

function DebugPanel({ 
  activeFiles, 
  connectionStatus, 
  onStartMonitoring, 
  onStopMonitoring 
}: DebugPanelProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const simulateFileUpload = () => {
    const mockFile: ProcessingFile = {
      id: `test-file-${Date.now()}`,
      name: 'sample-data.csv',
      size: 1024 * 1024, // 1MB
      type: 'text/csv',
      priority: 1,
      processingState: {
        currentStep: 'upload',
        steps: [],
        overallProgress: 0,
        estimatedTimeRemaining: 0,
        errors: []
      }
    }
    onStartMonitoring(mockFile)
  }

  return (
    <motion.div
      className="fixed bottom-4 right-4 bg-gray-800 border border-gray-600 rounded-lg shadow-lg"
      initial={{ opacity: 0, y: 100 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <button
        className="w-full px-4 py-2 text-left text-sm font-medium text-gray-300 hover:text-white"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        Debug Panel {isExpanded ? '▼' : '▲'}
      </button>
      
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            className="p-4 border-t border-gray-600"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
          >
            <div className="space-y-3 text-xs">
              <div>
                <strong>Connection:</strong> {connectionStatus.connected ? 'Connected' : 'Disconnected'}
              </div>
              <div>
                <strong>Active Files:</strong> {activeFiles.size}
              </div>
              <button
                className="px-3 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700"
                onClick={simulateFileUpload}
              >
                Simulate Upload
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}