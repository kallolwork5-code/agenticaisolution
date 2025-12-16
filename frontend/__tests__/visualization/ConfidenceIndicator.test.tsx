import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { ConfidenceIndicator, ConfidenceComparison } from '../../components/visualization/ConfidenceIndicator'

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
}))

describe('ConfidenceIndicator', () => {
  it('renders high confidence correctly', () => {
    render(<ConfidenceIndicator confidence={0.9} />)
    
    expect(screen.getByText('90%')).toBeInTheDocument()
    expect(screen.getByText('High Confidence')).toBeInTheDocument()
  })

  it('renders medium confidence correctly', () => {
    render(<ConfidenceIndicator confidence={0.7} />)
    
    expect(screen.getByText('70%')).toBeInTheDocument()
    expect(screen.getByText('Medium Confidence')).toBeInTheDocument()
  })

  it('renders low confidence correctly', () => {
    render(<ConfidenceIndicator confidence={0.4} />)
    
    expect(screen.getByText('40%')).toBeInTheDocument()
    expect(screen.getByText('Low Confidence')).toBeInTheDocument()
  })

  it('shows LLM indicator when usedLLM is true', () => {
    render(<ConfidenceIndicator confidence={0.8} usedLLM={true} />)
    
    expect(screen.getByText('AI-Assisted')).toBeInTheDocument()
  })

  it('hides label when showLabel is false', () => {
    render(<ConfidenceIndicator confidence={0.8} showLabel={false} />)
    
    expect(screen.getByText('80%')).toBeInTheDocument()
    expect(screen.queryByText('High Confidence')).not.toBeInTheDocument()
  })

  it('applies small size classes', () => {
    const { container } = render(<ConfidenceIndicator confidence={0.8} size="sm" />)
    
    expect(container.querySelector('.confidence-indicator')).toHaveClass('text-xs')
  })

  it('applies large size classes', () => {
    const { container } = render(<ConfidenceIndicator confidence={0.8} size="lg" />)
    
    expect(container.querySelector('.confidence-indicator')).toHaveClass('text-base')
  })
})

describe('ConfidenceComparison', () => {
  const mockConfidences = [
    {
      label: 'Transaction Data',
      confidence: 0.95,
      usedLLM: false,
      isSelected: true
    },
    {
      label: 'Rate Card',
      confidence: 0.3,
      usedLLM: false,
      isSelected: false
    },
    {
      label: 'Routing Data',
      confidence: 0.2,
      usedLLM: true,
      isSelected: false
    }
  ]

  it('renders all confidence options', () => {
    render(<ConfidenceComparison confidences={mockConfidences} />)
    
    expect(screen.getByText('Transaction Data')).toBeInTheDocument()
    expect(screen.getByText('Rate Card')).toBeInTheDocument()
    expect(screen.getByText('Routing Data')).toBeInTheDocument()
  })

  it('highlights selected option', () => {
    render(<ConfidenceComparison confidences={mockConfidences} />)
    
    // Find the container div that has the selected styling
    const selectedContainer = screen.getByText('Transaction Data').closest('.bg-green-900\\/20')
    expect(selectedContainer).toBeInTheDocument()
  })

  it('shows confidence percentages', () => {
    render(<ConfidenceComparison confidences={mockConfidences} />)
    
    expect(screen.getByText('95%')).toBeInTheDocument()
    expect(screen.getByText('30%')).toBeInTheDocument()
    expect(screen.getByText('20%')).toBeInTheDocument()
  })

  it('displays header text', () => {
    render(<ConfidenceComparison confidences={mockConfidences} />)
    
    expect(screen.getByText('Classification Confidence')).toBeInTheDocument()
  })
})