'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ArrowRight, 
  Eye, 
  Code, 
  BarChart3, 
  FileText, 
  Download,
  Copy,
  Check,
  ChevronDown,
  ChevronRight,
  Zap,
  AlertCircle
} from 'lucide-react'
import { DataSample } from '../../lib/types/visualization'

interface DataTransformationViewProps {
  beforeData: DataSample
  afterData: DataSample
  transformationType: string
  className?: string
}

export function DataTransformationView({
  beforeData,
  afterData,
  transformationType,
  className = ''
}: DataTransformationViewProps) {
  const [viewMode, setViewMode] = useState<'preview' | 'schema' | 'stats'>('preview')
  const [copiedSection, setCopiedSection] = useState<string | null>(null)

  const handleCopy = async (text: string, section: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedSection(section)
      setTimeout(() => setCopiedSection(null), 2000)
    } catch (error) {
      console.error('Failed to copy:', error)
    }
  }

  const getTransformationSummary = () => {
    const beforeRows = beforeData.rowCount
    const afterRows = afterData.rowCount
    const rowChange = afterRows - beforeRows
    const confidenceChange = afterData.confidence - beforeData.confidence

    return {
      rowChange,
      confidenceChange,
      hasChanges: rowChange !== 0 || Math.abs(confidenceChange) > 0.01
    }
  }

  const summary = getTransformationSummary()

  return (
    <div className={`data-transformation-view ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-medium text-white">Data Transformation</h3>
          <p className="text-sm text-gray-400">{transformationType}</p>
        </div>
        
        {/* View Mode Toggle */}
        <div className="flex items-center space-x-2">
          {[
            { id: 'preview', label: 'Preview', icon: Eye },
            { id: 'schema', label: 'Schema', icon: Code },
            { id: 'stats', label: 'Stats', icon: BarChart3 }
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setViewMode(id as any)}
              className={`
                flex items-center space-x-1 px-3 py-1 rounded text-xs font-medium transition-colors
                ${viewMode === id 
                  ? 'bg-green-600 text-white' 
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }
              `}
            >
              <Icon className="w-3 h-3" />
              <span>{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Transformation Summary */}
      {summary.hasChanges && (
        <motion.div
          className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4 mb-4"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center space-x-2 mb-2">
            <Zap className="w-4 h-4 text-blue-400" />
            <span className="text-sm font-medium text-blue-400">Transformation Applied</span>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-400">Row Count Change:</span>
              <span className={`ml-2 font-medium ${
                summary.rowChange > 0 ? 'text-green-400' : 
                summary.rowChange < 0 ? 'text-red-400' : 'text-gray-300'
              }`}>
                {summary.rowChange > 0 ? '+' : ''}{summary.rowChange.toLocaleString()}
              </span>
            </div>
            <div>
              <span className="text-gray-400">Confidence Change:</span>
              <span className={`ml-2 font-medium ${
                summary.confidenceChange > 0 ? 'text-green-400' : 
                summary.confidenceChange < 0 ? 'text-red-400' : 'text-gray-300'
              }`}>
                {summary.confidenceChange > 0 ? '+' : ''}{(summary.confidenceChange * 100).toFixed(1)}%
              </span>
            </div>
          </div>
        </motion.div>
      )}

      {/* Before/After Comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Before */}
        <DataSampleCard
          title="Before Transformation"
          sample={beforeData}
          viewMode={viewMode}
          onCopy={handleCopy}
          copiedSection={copiedSection}
          sectionPrefix="before"
        />

        {/* Arrow */}
        <div className="hidden lg:flex items-center justify-center">
          <motion.div
            className="flex items-center space-x-2 text-gray-400"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
          >
            <ArrowRight className="w-6 h-6" />
          </motion.div>
        </div>

        {/* After */}
        <DataSampleCard
          title="After Transformation"
          sample={afterData}
          viewMode={viewMode}
          onCopy={handleCopy}
          copiedSection={copiedSection}
          sectionPrefix="after"
        />
      </div>

      {/* Detailed Comparison */}
      <DetailedComparison beforeData={beforeData} afterData={afterData} />
    </div>
  )
}

interface DataSampleCardProps {
  title: string
  sample: DataSample
  viewMode: 'preview' | 'schema' | 'stats'
  onCopy: (text: string, section: string) => void
  copiedSection: string | null
  sectionPrefix: string
}

function DataSampleCard({
  title,
  sample,
  viewMode,
  onCopy,
  copiedSection,
  sectionPrefix
}: DataSampleCardProps) {
  const [isExpanded, setIsExpanded] = useState(true)

  const renderContent = () => {
    switch (viewMode) {
      case 'preview':
        return (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-400">Data Preview</span>
              <button
                onClick={() => onCopy(sample.preview, `${sectionPrefix}-preview`)}
                className="flex items-center space-x-1 text-xs text-gray-400 hover:text-white transition-colors"
              >
                {copiedSection === `${sectionPrefix}-preview` ? (
                  <Check className="w-3 h-3" />
                ) : (
                  <Copy className="w-3 h-3" />
                )}
                <span>Copy</span>
              </button>
            </div>
            <div className="bg-gray-900 rounded border border-gray-600 p-3 font-mono text-xs text-gray-300 overflow-x-auto max-h-48 overflow-y-auto">
              <pre>{sample.preview}</pre>
            </div>
          </div>
        )
      
      case 'schema':
        return (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-400">Schema Structure</span>
              <button
                onClick={() => onCopy(JSON.stringify(sample.schema, null, 2), `${sectionPrefix}-schema`)}
                className="flex items-center space-x-1 text-xs text-gray-400 hover:text-white transition-colors"
              >
                {copiedSection === `${sectionPrefix}-schema` ? (
                  <Check className="w-3 h-3" />
                ) : (
                  <Copy className="w-3 h-3" />
                )}
                <span>Copy</span>
              </button>
            </div>
            <div className="bg-gray-900 rounded border border-gray-600 p-3 font-mono text-xs text-gray-300 overflow-x-auto max-h-48 overflow-y-auto">
              <pre>{JSON.stringify(sample.schema, null, 2)}</pre>
            </div>
          </div>
        )
      
      case 'stats':
        return (
          <div className="space-y-3">
            <span className="text-xs text-gray-400">Statistics</span>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="bg-gray-800/50 rounded p-2">
                <div className="text-gray-400 text-xs">Rows</div>
                <div className="text-white font-medium">{sample.rowCount.toLocaleString()}</div>
              </div>
              <div className="bg-gray-800/50 rounded p-2">
                <div className="text-gray-400 text-xs">Confidence</div>
                <div className="text-white font-medium">{Math.round(sample.confidence * 100)}%</div>
              </div>
              <div className="bg-gray-800/50 rounded p-2">
                <div className="text-gray-400 text-xs">Columns</div>
                <div className="text-white font-medium">{Object.keys(sample.schema).length}</div>
              </div>
              <div className="bg-gray-800/50 rounded p-2">
                <div className="text-gray-400 text-xs">Size</div>
                <div className="text-white font-medium">
                  {(sample.preview.length / 1024).toFixed(1)}KB
                </div>
              </div>
            </div>
          </div>
        )
      
      default:
        return null
    }
  }

  return (
    <div className="bg-gray-800/50 rounded-lg overflow-hidden">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
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
            <div className="p-4">{renderContent()}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

interface DetailedComparisonProps {
  beforeData: DataSample
  afterData: DataSample
}

function DetailedComparison({ beforeData, afterData }: DetailedComparisonProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const getSchemaChanges = () => {
    const beforeKeys = Object.keys(beforeData.schema)
    const afterKeys = Object.keys(afterData.schema)
    
    const added = afterKeys.filter(key => !beforeKeys.includes(key))
    const removed = beforeKeys.filter(key => !afterKeys.includes(key))
    const modified = beforeKeys.filter(key => 
      afterKeys.includes(key) && 
      JSON.stringify(beforeData.schema[key]) !== JSON.stringify(afterData.schema[key])
    )

    return { added, removed, modified }
  }

  const schemaChanges = getSchemaChanges()
  const hasSchemaChanges = schemaChanges.added.length > 0 || 
                          schemaChanges.removed.length > 0 || 
                          schemaChanges.modified.length > 0

  if (!hasSchemaChanges) {
    return null
  }

  return (
    <div className="mt-6 bg-gray-800/30 rounded-lg overflow-hidden">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-700/50 transition-colors"
      >
        <div className="flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 text-yellow-400" />
          <h4 className="font-medium text-white">Schema Changes Detected</h4>
        </div>
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
            <div className="p-4 space-y-4">
              {schemaChanges.added.length > 0 && (
                <div>
                  <h5 className="text-sm font-medium text-green-400 mb-2">Added Fields</h5>
                  <div className="space-y-1">
                    {schemaChanges.added.map(field => (
                      <div key={field} className="text-sm text-gray-300 bg-green-900/20 px-2 py-1 rounded">
                        + {field}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {schemaChanges.removed.length > 0 && (
                <div>
                  <h5 className="text-sm font-medium text-red-400 mb-2">Removed Fields</h5>
                  <div className="space-y-1">
                    {schemaChanges.removed.map(field => (
                      <div key={field} className="text-sm text-gray-300 bg-red-900/20 px-2 py-1 rounded">
                        - {field}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {schemaChanges.modified.length > 0 && (
                <div>
                  <h5 className="text-sm font-medium text-yellow-400 mb-2">Modified Fields</h5>
                  <div className="space-y-1">
                    {schemaChanges.modified.map(field => (
                      <div key={field} className="text-sm text-gray-300 bg-yellow-900/20 px-2 py-1 rounded">
                        ~ {field}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}