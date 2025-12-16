import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import { DecisionExplanationPanel } from '../../components/visualization/DecisionExplanationPanel'
import { AgentDecision, DataSample } from '../../lib/types/visualization'

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, onClick, ...props }: any) => <div {...props} onClick={onClick}>{children}</div>,
    button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
  },
  AnimatePresence: ({ children }: any) => <div>{children}</div>,
}))

const mockDecision: AgentDecision = {
  classification: 'transaction_data',
  confidence: 0.95,
  reasoning: [
    'Contains transaction columns like amount, date, and merchant',
    'Date format matches standard transaction patterns',
    'Amount values are in expected currency format'
  ],
  alternativeOptions: ['rate_card', 'routing_data'],
  usedLLM: false,
  processingTime: 2500
}

const mockInputData: DataSample = {
  preview: 'date,amount,merchant\n2023-01-01,100.00,Store A\n2023-01-02,50.00,Store B',
  schema: {
    date: 'string',
    amount: 'number',
    merchant: 'string'
  },
  rowCount: 1000,
  confidence: 0.85
}

const mockOutputData: DataSample = {
  preview: 'transaction_date,transaction_amount,merchant_name\n2023-01-01,100.00,Store A\n2023-01-02,50.00,Store B',
  schema: {
    transaction_date: 'datetime',
    transaction_amount: 'decimal',
    merchant_name: 'string'
  },
  rowCount: 1000,
  confidence: 0.95
}

describe('DecisionExplanationPanel', () => {
  const defaultProps = {
    decision: mockDecision,
    inputData: mockInputData,
    outputData: mockOutputData,
    isVisible: true,
    onClose: jest.fn(),
    agentName: 'Classification Agent'
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders when visible', () => {
    render(<DecisionExplanationPanel {...defaultProps} />)
    
    expect(screen.getByText('Classification Agent Decision')).toBeInTheDocument()
    expect(screen.getAllByText('Rule-Based Classification')).toHaveLength(2) // Header and overview
  })

  it('does not render when not visible', () => {
    render(<DecisionExplanationPanel {...defaultProps} isVisible={false} />)
    
    expect(screen.queryByText('Classification Agent Decision')).not.toBeInTheDocument()
  })

  it('displays LLM-assisted classification when usedLLM is true', () => {
    const llmDecision = { ...mockDecision, usedLLM: true }
    render(<DecisionExplanationPanel {...defaultProps} decision={llmDecision} />)
    
    expect(screen.getAllByText('AI-Assisted Classification')).toHaveLength(2) // Header and overview
  })

  it('shows classification result with confidence', () => {
    render(<DecisionExplanationPanel {...defaultProps} />)
    
    expect(screen.getByText('Transaction Data')).toBeInTheDocument()
    expect(screen.getAllByText('95%')).toHaveLength(3) // Multiple confidence displays
    expect(screen.getByText('High Confidence')).toBeInTheDocument()
  })

  it('displays processing time', () => {
    render(<DecisionExplanationPanel {...defaultProps} />)
    
    expect(screen.getByText('2.50s')).toBeInTheDocument()
  })

  it('calls onClose when close button is clicked', () => {
    const onCloseMock = jest.fn()
    render(<DecisionExplanationPanel {...defaultProps} onClose={onCloseMock} />)
    
    const closeButton = screen.getByLabelText('Close panel')
    fireEvent.click(closeButton)
    
    expect(onCloseMock).toHaveBeenCalledTimes(1)
  })

  it('switches between tabs', () => {
    render(<DecisionExplanationPanel {...defaultProps} />)
    
    // Click on Reasoning tab
    fireEvent.click(screen.getByText('Reasoning'))
    
    // Should show reasoning content
    expect(screen.getByText('Decision Reasoning')).toBeInTheDocument()
    mockDecision.reasoning.forEach(reason => {
      expect(screen.getByText(reason)).toBeInTheDocument()
    })
  })

  it('shows alternatives in alternatives tab', () => {
    render(<DecisionExplanationPanel {...defaultProps} />)
    
    // Click on Alternatives tab
    fireEvent.click(screen.getByText('Alternatives'))
    
    expect(screen.getByText('Alternative Classifications')).toBeInTheDocument()
    expect(screen.getByText('Rate Card')).toBeInTheDocument()
    expect(screen.getByText('Routing Data')).toBeInTheDocument()
  })

  it('displays data samples in data tab', () => {
    render(<DecisionExplanationPanel {...defaultProps} />)
    
    // Click on Data tab
    fireEvent.click(screen.getByText('Data'))
    
    expect(screen.getByText('Input Data')).toBeInTheDocument()
    expect(screen.getByText('Output Data')).toBeInTheDocument()
  })

  it('shows LLM analysis note when LLM was used', () => {
    const llmDecision = { ...mockDecision, usedLLM: true }
    render(<DecisionExplanationPanel {...defaultProps} decision={llmDecision} />)
    
    // Click on Reasoning tab
    fireEvent.click(screen.getByText('Reasoning'))
    
    expect(screen.getByText('AI Analysis')).toBeInTheDocument()
    expect(screen.getByText(/advanced language model analysis/i)).toBeInTheDocument()
  })

  it('displays confidence breakdown', () => {
    render(<DecisionExplanationPanel {...defaultProps} />)
    
    expect(screen.getByText('Confidence Factors')).toBeInTheDocument()
    expect(screen.getByText('Pattern Match')).toBeInTheDocument()
    expect(screen.getByText('Data Quality')).toBeInTheDocument()
  })

  it('handles medium confidence correctly', () => {
    const mediumConfidenceDecision = { ...mockDecision, confidence: 0.7 }
    render(<DecisionExplanationPanel {...defaultProps} decision={mediumConfidenceDecision} />)
    
    expect(screen.getByText('70%')).toBeInTheDocument()
    expect(screen.getByText('Medium Confidence')).toBeInTheDocument()
  })

  it('handles low confidence correctly', () => {
    const lowConfidenceDecision = { ...mockDecision, confidence: 0.4 }
    render(<DecisionExplanationPanel {...defaultProps} decision={lowConfidenceDecision} />)
    
    expect(screen.getByText('40%')).toBeInTheDocument()
    expect(screen.getByText('Low Confidence')).toBeInTheDocument()
  })

  it('shows no alternatives message when no alternatives exist', () => {
    const noAlternativesDecision = { ...mockDecision, alternativeOptions: [] }
    render(<DecisionExplanationPanel {...defaultProps} decision={noAlternativesDecision} />)
    
    // Click on Alternatives tab
    fireEvent.click(screen.getByText('Alternatives'))
    
    expect(screen.getByText('No alternative classifications were considered')).toBeInTheDocument()
  })
})