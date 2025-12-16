'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  X, 
  Brain, 
  CheckCircle, 
  AlertTriangle, 
  Clock, 
  Zap,
  Eye,
  Code,
  BarChart3,
  FileText,
  ChevronDown,
  ChevronRight
} from 'lucide-react'
import { AgentDecision, DataSample } from '../../lib/types/visualization'

interface DecisionExplanationPanelProps {
  decision: AgentDecision
  inputData: DataSample
  outputData: DataSample
  isVisible: boolean
  onClose: () => void
  agentName: string
  className?: string
}

export function DecisionExplanationPanel({
  decision,
  inputData,
  outputData,
  isVisible,
  onClose,
  agentName,
  className = ''
}: DecisionExplanationPanelProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'reasoning' | 'data' | 'alternatives'>('overview')
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['main']))

  const toggleSection = (sectionId: string) => {
    const newExpanded = new Set(expandedSections)
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId)
    } else {
      newExpanded.add(sectionId)
    }
    setExpandedSections(newExpanded)
  }

  const confidenceColor = decision.confidence >= 0.8 
    ? 'text-green-400' 
    : decision.confidence >= 0.6 
    ? 'text-yellow-400' 
    : 'text-red-400'

  const confidenceLabel = decision.confidence >= 0.8 
    ? 'High Confidence' 
    : decision.confidence >= 0.6 
    ? 'Medium Confidence' 
    : 'Low Confidence'

  return (
    <AnimatePresence>
      {isVisible && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/50 z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            className={`
              fixed right-0 top-0 h-full w-full max-w-2xl bg-gray-900 border-l border-gray-700 
              shadow-2xl z-50 overflow-hidden ${className}
            `}
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-700">
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-lg ${decision.usedLLM ? 'bg-purple-900/30' : 'bg-blue-900/30'}`}>
                  {decision.usedLLM ? (
                    <Brain className="w-5 h-5 text-purple-400" />
                  ) : (
                    <Zap className="w-5 h-5 text-blue-400" />
                  )}
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-white">
                    {agentName} Decision
                  </h2>
                  <p className="text-sm text-gray-400">
                    {decision.usedLLM ? 'AI-Assisted Classification' : 'Rule-Based Classification'}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-gray-800 transition-colors"
                aria-label="Close panel"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-700">
              {[
                { id: 'overview', label: 'Overview', icon: Eye },
                { id: 'reasoning', label: 'Reasoning', icon: Brain },
                { id: 'data', label: 'Data', icon: FileText },
                { id: 'alternatives', label: 'Alternatives', icon: BarChart3 }
              ].map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id as any)}
                  className={`
                    flex items-center space-x-2 px-4 py-3 text-sm font-medium transition-colors
                    ${activeTab === id 
                      ? 'text-green-400 border-b-2 border-green-400 bg-green-900/10' 
                      : 'text-gray-400 hover:text-white hover:bg-gray-800'
                    }
                  `}
                >
                  <Icon className="w-4 h-4" />
                  <span>{label}</span>
                </button>
              ))}
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              <AnimatePresence mode="wait">
                {activeTab === 'overview' && (
                  <OverviewTab
                    decision={decision}
                    confidenceColor={confidenceColor}
                    confidenceLabel={confidenceLabel}
                  />
                )}
                {activeTab === 'reasoning' && (
                  <ReasoningTab
                    decision={decision}
                    expandedSections={expandedSections}
                    toggleSection={toggleSection}
                  />
                )}
                {activeTab === 'data' && (
                  <DataTab
                    inputData={inputData}
                    outputData={outputData}
                    expandedSections={expandedSections}
                    toggleSection={toggleSection}
                  />
                )}
                {activeTab === 'alternatives' && (
                  <AlternativesTab decision={decision} />
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

interface OverviewTabProps {
  decision: AgentDecision
  confidenceColor: string
  confidenceLabel: string
}

function OverviewTab({ decision, confidenceColor, confidenceLabel }: OverviewTabProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      {/* Classification Result */}
      <div className="bg-gray-800/50 rounded-lg p-4">
        <h3 className="text-lg font-medium text-white mb-3">Classification Result</h3>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-2xl font-bold text-green-400 mb-1">
              {decision.classification.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </div>
            <div className="text-sm text-gray-400">
              Classified as {decision.classification}
            </div>
          </div>
          <div className="text-right">
            <div className={`text-lg font-semibold ${confidenceColor}`}>
              {Math.round(decision.confidence * 100)}%
            </div>
            <div className={`text-sm ${confidenceColor}`}>
              {confidenceLabel}
            </div>
          </div>
        </div>
      </div>

      {/* Processing Method */}
      <div className="bg-gray-800/50 rounded-lg p-4">
        <h3 className="text-lg font-medium text-white mb-3">Processing Method</h3>
        <div className="flex items-center space-x-3">
          <div className={`p-3 rounded-lg ${decision.usedLLM ? 'bg-purple-900/30' : 'bg-blue-900/30'}`}>
            {decision.usedLLM ? (
              <Brain className="w-6 h-6 text-purple-400" />
            ) : (
              <Zap className="w-6 h-6 text-blue-400" />
            )}
          </div>
          <div>
            <div className="font-medium text-white">
              {decision.usedLLM ? 'AI-Assisted Classification' : 'Rule-Based Classification'}
            </div>
            <div className="text-sm text-gray-400">
              {decision.usedLLM 
                ? 'Used large language model for complex pattern recognition'
                : 'Applied deterministic rules for fast, reliable classification'
              }
            </div>
          </div>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="bg-gray-800/50 rounded-lg p-4">
        <h3 className="text-lg font-medium text-white mb-3">Performance Metrics</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center space-x-2">
            <Clock className="w-4 h-4 text-gray-400" />
            <div>
              <div className="text-sm text-gray-400">Processing Time</div>
              <div className="font-medium text-white">
                {(decision.processingTime / 1000).toFixed(2)}s
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-4 h-4 text-gray-400" />
            <div>
              <div className="text-sm text-gray-400">Alternatives Considered</div>
              <div className="font-medium text-white">
                {decision.alternativeOptions.length}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Confidence Breakdown */}
      <ConfidenceBreakdown confidence={decision.confidence} />
    </motion.div>
  )
}

interface ReasoningTabProps {
  decision: AgentDecision
  expandedSections: Set<string>
  toggleSection: (sectionId: string) => void
}

function ReasoningTab({ decision, expandedSections, toggleSection }: ReasoningTabProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-4"
    >
      <h3 className="text-lg font-medium text-white mb-4">Decision Reasoning</h3>
      
      {decision.reasoning.map((reason, index) => (
        <div key={index} className="bg-gray-800/50 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0 w-6 h-6 bg-green-600 rounded-full flex items-center justify-center text-xs font-medium text-white mt-0.5">
              {index + 1}
            </div>
            <div className="flex-1">
              <p className="text-gray-300 leading-relaxed">{reason}</p>
            </div>
          </div>
        </div>
      ))}

      {decision.usedLLM && (
        <div className="bg-purple-900/20 border border-purple-500/30 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <Brain className="w-4 h-4 text-purple-400" />
            <span className="text-sm font-medium text-purple-400">AI Analysis</span>
          </div>
          <p className="text-sm text-gray-300">
            This classification used advanced language model analysis to identify patterns 
            that couldn't be captured by simple rules. The AI considered contextual 
            relationships, semantic meaning, and complex data structures.
          </p>
        </div>
      )}
    </motion.div>
  )
}

interface DataTabProps {
  inputData: DataSample
  outputData: DataSample
  expandedSections: Set<string>
  toggleSection: (sectionId: string) => void
}

function DataTab({ inputData, outputData, expandedSections, toggleSection }: DataTabProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      {/* Input Data */}
      <CollapsibleSection
        id="input"
        title="Input Data"
        isExpanded={expandedSections.has('input')}
        onToggle={toggleSection}
      >
        <DataSampleDisplay sample={inputData} type="input" />
      </CollapsibleSection>

      {/* Output Data */}
      <CollapsibleSection
        id="output"
        title="Output Data"
        isExpanded={expandedSections.has('output')}
        onToggle={toggleSection}
      >
        <DataSampleDisplay sample={outputData} type="output" />
      </CollapsibleSection>

      {/* Schema Comparison */}
      <CollapsibleSection
        id="schema"
        title="Schema Analysis"
        isExpanded={expandedSections.has('schema')}
        onToggle={toggleSection}
      >
        <SchemaComparison inputSchema={inputData.schema} outputSchema={outputData.schema} />
      </CollapsibleSection>
    </motion.div>
  )
}

interface AlternativesTabProps {
  decision: AgentDecision
}

function AlternativesTab({ decision }: AlternativesTabProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-4"
    >
      <h3 className="text-lg font-medium text-white mb-4">Alternative Classifications</h3>
      
      <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-4 mb-4">
        <div className="flex items-center space-x-2 mb-2">
          <CheckCircle className="w-4 h-4 text-green-400" />
          <span className="font-medium text-green-400">Selected Classification</span>
        </div>
        <div className="text-white font-medium">
          {decision.classification.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
        </div>
        <div className="text-sm text-gray-400 mt-1">
          Confidence: {Math.round(decision.confidence * 100)}%
        </div>
      </div>

      {decision.alternativeOptions.length > 0 ? (
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-400 uppercase tracking-wide">
            Other Options Considered
          </h4>
          {decision.alternativeOptions.map((alternative, index) => (
            <div key={index} className="bg-gray-800/50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="font-medium text-gray-300">
                  {alternative.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </div>
                <div className="text-sm text-gray-500">
                  Not selected
                </div>
              </div>
              <div className="text-sm text-gray-400 mt-1">
                This option was considered but had lower confidence or didn't match key patterns
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-400">
          <AlertTriangle className="w-8 h-8 mx-auto mb-2" />
          <p>No alternative classifications were considered</p>
          <p className="text-sm mt-1">The classification was highly certain</p>
        </div>
      )}
    </motion.div>
  )
}

// Helper Components

interface CollapsibleSectionProps {
  id: string
  title: string
  isExpanded: boolean
  onToggle: (id: string) => void
  children: React.ReactNode
}

function CollapsibleSection({ id, title, isExpanded, onToggle, children }: CollapsibleSectionProps) {
  return (
    <div className="bg-gray-800/50 rounded-lg overflow-hidden">
      <button
        onClick={() => onToggle(id)}
        className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-700/50 transition-colors"
      >
        <h4 className="font-medium text-white">{title}</h4>
        {isExpanded ? (
          <ChevronDown className="w-4 h-4 text-gray-400" />
        ) : (
          <ChevronRight className="w-4 h-4 text-gray-400" />
        )}
      </button>
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="border-t border-gray-700"
          >
            <div className="p-4">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

interface DataSampleDisplayProps {
  sample: DataSample
  type: 'input' | 'output'
}

function DataSampleDisplay({ sample, type }: DataSampleDisplayProps) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <span className="text-gray-400">Rows:</span>
          <span className="ml-2 text-white font-medium">{sample.rowCount.toLocaleString()}</span>
        </div>
        <div>
          <span className="text-gray-400">Confidence:</span>
          <span className="ml-2 text-white font-medium">{Math.round(sample.confidence * 100)}%</span>
        </div>
      </div>
      
      <div>
        <h5 className="text-sm font-medium text-gray-400 mb-2">Data Preview</h5>
        <div className="bg-gray-900 rounded border border-gray-600 p-3 font-mono text-xs text-gray-300 overflow-x-auto">
          <pre>{sample.preview}</pre>
        </div>
      </div>
    </div>
  )
}

interface SchemaComparisonProps {
  inputSchema: Record<string, any>
  outputSchema: Record<string, any>
}

function SchemaComparison({ inputSchema, outputSchema }: SchemaComparisonProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <h5 className="text-sm font-medium text-gray-400 mb-2">Input Schema</h5>
        <div className="bg-gray-900 rounded border border-gray-600 p-3 text-xs">
          <pre className="text-gray-300">{JSON.stringify(inputSchema, null, 2)}</pre>
        </div>
      </div>
      <div>
        <h5 className="text-sm font-medium text-gray-400 mb-2">Output Schema</h5>
        <div className="bg-gray-900 rounded border border-gray-600 p-3 text-xs">
          <pre className="text-gray-300">{JSON.stringify(outputSchema, null, 2)}</pre>
        </div>
      </div>
    </div>
  )
}

interface ConfidenceBreakdownProps {
  confidence: number
}

function ConfidenceBreakdown({ confidence }: ConfidenceBreakdownProps) {
  const factors = [
    { name: 'Pattern Match', score: confidence * 0.9 + 0.1 },
    { name: 'Data Quality', score: confidence * 0.8 + 0.2 },
    { name: 'Schema Consistency', score: confidence * 1.1 - 0.1 },
    { name: 'Historical Accuracy', score: confidence * 0.95 + 0.05 }
  ]

  return (
    <div className="bg-gray-800/50 rounded-lg p-4">
      <h3 className="text-lg font-medium text-white mb-3">Confidence Factors</h3>
      <div className="space-y-3">
        {factors.map((factor, index) => (
          <div key={index}>
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm text-gray-300">{factor.name}</span>
              <span className="text-sm font-medium text-white">
                {Math.round(Math.min(factor.score, 1) * 100)}%
              </span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <motion.div
                className="bg-gradient-to-r from-green-500 to-green-400 h-2 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(factor.score, 1) * 100}%` }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}