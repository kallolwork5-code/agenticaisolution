'use client'

import React, { useState } from 'react'
import Card from '../ui/Card'
import Button from '../ui/Button'

interface ProcessingStep {
  id: string
  name: string
  status: 'pending' | 'active' | 'completed' | 'error'
  progress: number
}

interface SimpleVisualizationProps {
  fileId?: string
  fileName?: string
}

const SimpleVisualization: React.FC<SimpleVisualizationProps> = ({
  fileId = 'demo-file',
  fileName = 'sample-data.csv'
}) => {
  const [steps] = useState<ProcessingStep[]>([
    { id: 'upload', name: 'File Upload', status: 'completed', progress: 100 },
    { id: 'ingestion', name: 'Data Ingestion', status: 'active', progress: 65 },
    { id: 'classification', name: 'Classification', status: 'pending', progress: 0 },
    { id: 'normalization', name: 'Normalization', status: 'pending', progress: 0 },
    { id: 'storage', name: 'Storage', status: 'pending', progress: 0 }
  ])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500'
      case 'active': return 'bg-blue-500'
      case 'error': return 'bg-red-500'
      default: return 'bg-gray-300'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return '✓'
      case 'active': return '⚡'
      case 'error': return '✗'
      default: return '○'
    }
  }

  const overallProgress = Math.round(steps.reduce((sum, step) => sum + step.progress, 0) / steps.length)

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card title="Agentic Data Processing Pipeline">
        <div className="space-y-4">
          {/* File Info */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <h4 className="font-medium text-gray-900">Processing: {fileName}</h4>
              <p className="text-sm text-gray-600">File ID: {fileId}</p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-blue-600">{overallProgress}%</div>
              <div className="text-sm text-gray-500">Overall Progress</div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div 
              className="bg-blue-500 h-3 rounded-full transition-all duration-500"
              style={{ width: `${overallProgress}%` }}
            />
          </div>

          {/* Processing Steps */}
          <div className="grid gap-4">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center space-x-4 p-4 border rounded-lg">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium ${getStatusColor(step.status)}`}>
                  {getStatusIcon(step.status)}
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h5 className="font-medium text-gray-900">{step.name}</h5>
                    <span className="text-sm text-gray-500">{step.progress}%</span>
                  </div>
                  
                  {step.status === 'active' && (
                    <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${step.progress}%` }}
                      />
                    </div>
                  )}
                </div>
                
                <div className="text-sm font-medium capitalize text-gray-600">
                  {step.status}
                </div>
              </div>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-4 pt-4">
            <Button variant="primary">View Details</Button>
            <Button variant="outline">Download Results</Button>
          </div>
        </div>
      </Card>

      {/* Status Summary */}
      <Card title="Processing Summary">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">1</div>
            <div className="text-sm text-gray-600">Completed</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">1</div>
            <div className="text-sm text-gray-600">Active</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-600">3</div>
            <div className="text-sm text-gray-600">Pending</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">0</div>
            <div className="text-sm text-gray-600">Errors</div>
          </div>
        </div>
      </Card>
    </div>
  )
}

export default SimpleVisualization