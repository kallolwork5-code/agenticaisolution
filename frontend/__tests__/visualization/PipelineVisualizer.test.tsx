import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import { PipelineVisualizer } from '../../components/visualization/PipelineVisualizer'
import { ProcessingState } from '../../lib/types/visualization'

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
}))

// Mock the visualization store
jest.mock('../../lib/stores/visualization-store', () => ({
  useVisualizationStore: () => ({
    viewMode: 'detailed',
    showMetrics: true,
    selectedStep: null
  })
}))

// Mock AgentStep component
jest.mock('../../components/visualization/AgentStep', () => ({
  AgentStep: ({ step, onClick, isActive, isSelected }: any) => (
    <div 
      data-testid={`agent-step-${step.id}`}
      onClick={onClick}
      className={`${isActive ? 'active' : ''} ${isSelected ? 'selected' : ''}`}
    >
      {step.name} - {step.progress}%
    </div>
  )
}))

const mockProcessingState: ProcessingState = {
  currentStep: 'ingestion',
  steps: [
    {
      id: 'upload',
      name: 'File Upload',
      description: 'Uploading file',
      status: 'completed',
      progress: 100,
      metrics: {
        processingTime: 1000,
        memoryUsage: 0,
        cpuUsage: 0,
        throughput: 0,
        errorCount: 0
      }
    },
    {
      id: 'ingestion',
      name: 'Data Ingestion',
      description: 'Processing file',
      status: 'active',
      progress: 45,
      metrics: {
        processingTime: 2000,
        memoryUsage: 0,
        cpuUsage: 0,
        throughput: 0,
        errorCount: 0
      }
    },
    {
      id: 'classification',
      name: 'Data Classification',
      description: 'Classifying data',
      status: 'pending',
      progress: 0,
      metrics: {
        processingTime: 0,
        memoryUsage: 0,
        cpuUsage: 0,
        throughput: 0,
        errorCount: 0
      }
    }
  ],
  overallProgress: 48,
  estimatedTimeRemaining: 30000,
  errors: []
}

describe('PipelineVisualizer', () => {
  const defaultProps = {
    fileId: 'test-file-123',
    processingState: mockProcessingState,
    onStepClick: jest.fn()
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders pipeline header with file info', () => {
    render(<PipelineVisualizer {...defaultProps} />)
    
    expect(screen.getByText('Processing Pipeline')).toBeInTheDocument()
    expect(screen.getByText('File: test-file-123')).toBeInTheDocument()
    expect(screen.getByText('Progress: 48%')).toBeInTheDocument()
    expect(screen.getByText('ETA: 30s')).toBeInTheDocument()
  })

  it('renders all agent steps', () => {
    render(<PipelineVisualizer {...defaultProps} />)
    
    expect(screen.getByTestId('agent-step-upload')).toBeInTheDocument()
    expect(screen.getByTestId('agent-step-ingestion')).toBeInTheDocument()
    expect(screen.getByTestId('agent-step-classification')).toBeInTheDocument()
  })

  it('shows overall progress bar', () => {
    render(<PipelineVisualizer {...defaultProps} />)
    
    expect(screen.getByText('Overall Progress')).toBeInTheDocument()
    expect(screen.getByText('48%')).toBeInTheDocument()
  })

  it('calls onStepClick when step is clicked', () => {
    const onStepClickMock = jest.fn()
    render(<PipelineVisualizer {...defaultProps} onStepClick={onStepClickMock} />)
    
    fireEvent.click(screen.getByTestId('agent-step-upload'))
    expect(onStepClickMock).toHaveBeenCalledWith('upload')
  })

  it('displays errors when present', () => {
    const stateWithErrors: ProcessingState = {
      ...mockProcessingState,
      errors: [
        {
          type: 'validation',
          severity: 'error',
          message: 'Invalid file format',
          technicalDetails: 'File does not contain expected columns',
          suggestedActions: ['Check file format'],
          retryable: true
        }
      ]
    }

    render(<PipelineVisualizer {...defaultProps} processingState={stateWithErrors} />)
    
    expect(screen.getByText('Processing Errors')).toBeInTheDocument()
    expect(screen.getByText('validation:')).toBeInTheDocument()
    expect(screen.getByText('Invalid file format')).toBeInTheDocument()
  })

  it('hides ETA when estimatedTimeRemaining is 0', () => {
    const stateWithoutETA: ProcessingState = {
      ...mockProcessingState,
      estimatedTimeRemaining: 0
    }

    render(<PipelineVisualizer {...defaultProps} processingState={stateWithoutETA} />)
    
    expect(screen.queryByText(/ETA:/)).not.toBeInTheDocument()
  })

  it('displays step progress correctly', () => {
    render(<PipelineVisualizer {...defaultProps} />)
    
    expect(screen.getByText('File Upload - 100%')).toBeInTheDocument()
    expect(screen.getByText('Data Ingestion - 45%')).toBeInTheDocument()
    expect(screen.getByText('Data Classification - 0%')).toBeInTheDocument()
  })

  it('marks active step correctly', () => {
    render(<PipelineVisualizer {...defaultProps} />)
    
    const uploadStep = screen.getByTestId('agent-step-upload')
    const ingestionStep = screen.getByTestId('agent-step-ingestion')
    const classificationStep = screen.getByTestId('agent-step-classification')
    
    expect(uploadStep).not.toHaveClass('active')
    expect(ingestionStep).toHaveClass('active')
    expect(classificationStep).not.toHaveClass('active')
  })
})