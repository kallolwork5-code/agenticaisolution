import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import { AgentStep } from '../../components/visualization/AgentStep'
import { AgentStep as AgentStepType } from '../../lib/types/visualization'
import { it } from 'node:test'
import { it } from 'node:test'
import { it } from 'node:test'
import { it } from 'node:test'
import { it } from 'node:test'
import { it } from 'node:test'
import { it } from 'node:test'
import { it } from 'node:test'
import { it } from 'node:test'
import { it } from 'node:test'
import { it } from 'node:test'
import { it } from 'node:test'
import { beforeEach } from 'node:test'
import { describe } from 'node:test'

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, onClick, ...props }: any) => <div {...props} onClick={onClick} role={onClick ? "button" : undefined}>{children}</div>,
    button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
    circle: ({ children, ...props }: any) => <circle {...props}>{children}</circle>,
  },
}))

const mockStep: AgentStepType = {
  id: 'upload',
  name: 'File Upload',
  description: 'Uploading and validating file',
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

describe('AgentStep', () => {
  const defaultProps = {
    step: mockStep,
    isActive: false,
    onClick: jest.fn(),
    showDetails: true,
    showMetrics: true,
    animationSpeed: 1
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders step name and description', () => {
    render(<AgentStep {...defaultProps} />)
    
    expect(screen.getByText('File Upload')).toBeInTheDocument()
    expect(screen.getByText('Uploading and validating file')).toBeInTheDocument()
  })

  it('displays progress correctly', () => {
    const stepWithProgress = {
      ...mockStep,
      progress: 75
    }
    
    render(<AgentStep {...defaultProps} step={stepWithProgress} />)
    
    expect(screen.getByText('75%')).toBeInTheDocument()
  })

  it('shows confidence score when available', () => {
    const stepWithConfidence = {
      ...mockStep,
      confidence: 0.85
    }
    
    render(<AgentStep {...defaultProps} step={stepWithConfidence} />)
    
    expect(screen.getByText('85%')).toBeInTheDocument()
    expect(screen.getByText('Confidence')).toBeInTheDocument()
  })

  it('displays metrics when showMetrics is true', () => {
    const stepWithMetrics = {
      ...mockStep,
      metrics: {
        processingTime: 5000,
        memoryUsage: 1024 * 1024 * 50, // 50MB
        cpuUsage: 0,
        throughput: 100,
        errorCount: 0
      }
    }
    
    render(<AgentStep {...defaultProps} step={stepWithMetrics} />)
    
    expect(screen.getByText('5.0s')).toBeInTheDocument()
    expect(screen.getByText('50.0MB')).toBeInTheDocument()
    expect(screen.getByText('100.0/s')).toBeInTheDocument()
  })

  it('hides metrics when showMetrics is false', () => {
    const stepWithMetrics = {
      ...mockStep,
      metrics: {
        processingTime: 5000,
        memoryUsage: 1024 * 1024 * 50,
        cpuUsage: 0,
        throughput: 100,
        errorCount: 0
      }
    }
    
    render(<AgentStep {...defaultProps} step={stepWithMetrics} showMetrics={false} />)
    
    expect(screen.queryByText('Time:')).not.toBeInTheDocument()
    expect(screen.queryByText('Memory:')).not.toBeInTheDocument()
  })

  it('shows decision information when available', () => {
    const stepWithDecision = {
      ...mockStep,
      decision: {
        classification: 'transaction_data',
        confidence: 0.95,
        reasoning: ['Contains transaction columns'],
        alternativeOptions: ['rate_card'],
        usedLLM: false,
        processingTime: 2000
      }
    }
    
    render(<AgentStep {...defaultProps} step={stepWithDecision} />)
    
    expect(screen.getByText('transaction_data')).toBeInTheDocument()
    expect(screen.getByText('Classification:')).toBeInTheDocument()
  })

  it('indicates LLM usage when decision used LLM', () => {
    const stepWithLLMDecision = {
      ...mockStep,
      decision: {
        classification: 'transaction_data',
        confidence: 0.95,
        reasoning: ['Contains transaction columns'],
        alternativeOptions: ['rate_card'],
        usedLLM: true,
        processingTime: 2000
      }
    }
    
    render(<AgentStep {...defaultProps} step={stepWithLLMDecision} />)
    
    expect(screen.getByText('LLM Assisted')).toBeInTheDocument()
  })

  it('displays timing information when available', () => {
    const startTime = new Date('2023-01-01T10:00:00Z')
    const endTime = new Date('2023-01-01T10:05:00Z')
    
    const stepWithTiming = {
      ...mockStep,
      startTime,
      endTime
    }
    
    render(<AgentStep {...defaultProps} step={stepWithTiming} />)
    
    expect(screen.getByText(/Started:/)).toBeInTheDocument()
    expect(screen.getByText(/Completed:/)).toBeInTheDocument()
  })

  it('calls onClick when clicked', () => {
    const onClickMock = jest.fn()
    
    render(<AgentStep {...defaultProps} onClick={onClickMock} />)
    
    fireEvent.click(screen.getByRole('button'))
    expect(onClickMock).toHaveBeenCalledTimes(1)
  })

  it('renders in compact mode', () => {
    render(<AgentStep {...defaultProps} compact={true} />)
    
    // In compact mode, description should not be visible
    expect(screen.queryByText('Uploading and validating file')).not.toBeInTheDocument()
    // But the step should still be clickable
    expect(screen.getByRole('button')).toBeInTheDocument()
  })

  it('applies correct status styling', () => {
    const activeStep = { ...mockStep, status: 'active' as const }
    const { rerender } = render(<AgentStep {...defaultProps} step={activeStep} isActive={true} />)
    
    // Should have active styling
    const stepElement = screen.getByRole('button')
    expect(stepElement).toHaveClass('border-green-400')
    
    // Test error status
    const errorStep = { ...mockStep, status: 'error' as const }
    rerender(<AgentStep {...defaultProps} step={errorStep} />)
    
    expect(stepElement).toHaveClass('text-red-400')
  })

  it('shows selected state when isSelected is true', () => {
    render(<AgentStep {...defaultProps} isSelected={true} />)
    
    const stepElement = screen.getByRole('button')
    expect(stepElement).toHaveClass('ring-2', 'ring-blue-400/50')
  })
})