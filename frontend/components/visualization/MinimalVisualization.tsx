'use client'

import React from 'react'

interface MinimalVisualizationProps {
  fileId: string
  status: 'pending' | 'processing' | 'completed' | 'error'
  progress?: number
  currentStep?: string
}

const MinimalVisualization: React.FC<MinimalVisualizationProps> = ({
  fileId,
  status,
  progress = 0,
  currentStep = 'Initializing'
}) => {
  const getStatusColor = () => {
    switch (status) {
      case 'completed': return 'bg-green-500'
      case 'processing': return 'bg-blue-500'
      case 'error': return 'bg-red-500'
      default: return 'bg-gray-500'
    }
  }

  return (
    <div className="p-4 border rounded-lg bg-white">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-medium">File Processing</h3>
        <span className={`px-2 py-1 rounded text-xs text-white ${getStatusColor()}`}>
          {status}
        </span>
      </div>
      
      {status === 'processing' && (
        <>
          <div className="mb-2">
            <div className="flex justify-between text-sm mb-1">
              <span>Progress</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded h-2">
              <div 
                className="bg-blue-500 h-2 rounded transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
          
          <div className="text-sm text-gray-600">
            Current: {currentStep}
          </div>
        </>
      )}
      
      {status === 'completed' && (
        <div className="text-green-600 text-sm">
          ✓ Processing completed successfully
        </div>
      )}
      
      {status === 'error' && (
        <div className="text-red-600 text-sm">
          ✗ Processing failed
        </div>
      )}
    </div>
  )
}

export default MinimalVisualization