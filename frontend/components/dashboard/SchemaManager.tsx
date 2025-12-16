'use client'

import { useState, useEffect } from 'react'
import {
  Database,
  FileText,
  Sparkles,
  CheckCircle2,
  Clock,
  RefreshCw,
  ChevronDown,
  ChevronRight
} from 'lucide-react'

interface Schema {
  table_name: string
  data_type?: string
  file_count: number
  actual_row_count: number
  columns: Array<{ name: string; type: string }>
  created_at: string
  last_updated: string
  files: Array<{
    file_id: string
    filename: string
    records: number
    uploaded_at: string
    status: string
  }>
}

interface FileSummary {
  id: string
  summary_text: string
  key_insights: string[]
  data_quality_score: string
  generated_at: string
  model_used: string
}

export default function SchemaManager() {
  const [schemas, setSchemas] = useState<Schema[]>([])
  const [expandedSchemas, setExpandedSchemas] = useState<string[]>([])
  const [summaries, setSummaries] = useState<Record<string, FileSummary>>({})
  const [loadingSummaries, setLoadingSummaries] = useState<Set<string>>(new Set())
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadSchemas()
  }, [])

  const loadSchemas = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/schemas/list')
      if (response.ok) {
        const data = await response.json()
        setSchemas(data.schemas || [])
      }
    } catch (error) {
      console.error('Error loading schemas:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const toggleSchema = (tableName: string) => {
    setExpandedSchemas(prev =>
      prev.includes(tableName)
        ? prev.filter(t => t !== tableName)
        : [...prev, tableName]
    )
  }

  const generateSummary = async (fileId: string) => {
    try {
      setLoadingSummaries(prev => new Set([...Array.from(prev), fileId]))

      const response = await fetch(
        `/api/schemas/files/${fileId}/generate-summary`,
        { method: 'POST' }
      )

      if (response.ok) {
        const data = await response.json()
        if (data.summary) {
          setSummaries(prev => ({ ...prev, [fileId]: data.summary }))
        }
      }
    } catch (error) {
      console.error('Error generating summary:', error)
    } finally {
      setLoadingSummaries(prev => {
        const s = new Set(Array.from(prev))
        s.delete(fileId)
        return s
      })
    }
  }

  const formatDate = (date: string) =>
    new Date(date).toLocaleString()

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-600 bg-green-50'
      case 'duplicate':
        return 'text-yellow-600 bg-yellow-50'
      case 'processing':
        return 'text-blue-600 bg-blue-50'
      case 'error':
        return 'text-red-600 bg-red-50'
      default:
        return 'text-gray-600 bg-gray-50'
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 animate-spin text-gray-400" />
        <span className="ml-2 text-gray-600">Loading schemas...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Data Schemas</h2>
          <p className="text-gray-600">
            Manage schemas and generate AI summaries
          </p>
        </div>
        <button
          onClick={loadSchemas}
          className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Refresh</span>
        </button>
      </div>

      {/* Schema List */}
      {schemas.length === 0 ? (
        <div className="text-center py-12">
          <Database className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No schemas found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {schemas.map(schema => (
            <div
              key={schema.table_name}
              className="bg-white border rounded-lg overflow-hidden"
            >
              {/* Schema Header */}
              <div
                className="p-4 cursor-pointer hover:bg-gray-50"
                onClick={() => toggleSchema(schema.table_name)}
              >
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-3">
                    {expandedSchemas.includes(schema.table_name) ? (
                      <ChevronDown className="w-5 h-5 text-gray-400" />
                    ) : (
                      <ChevronRight className="w-5 h-5 text-gray-400" />
                    )}
                    <Database className="w-5 h-5 text-green-600" />
                    <div>
                      <div className="font-semibold text-gray-900">
                        {schema.table_name}
                      </div>
                      <div className="text-sm text-gray-700 font-medium">
                        {(schema.data_type ?? 'mixed')} •{' '}
                        {schema.file_count} files •{' '}
                        {schema.actual_row_count.toLocaleString()} rows
                      </div>
                    </div>
                  </div>
                  <div className="text-sm text-gray-600 font-medium">
                    {schema.columns?.length ?? 0} columns
                  </div>
                </div>
              </div>

              {/* Details */}
              {expandedSchemas.includes(schema.table_name) && (
                <div className="border-t p-4 space-y-4">
                  {/* Columns */}
                  <div>
                    <div className="text-sm font-medium mb-2">Columns</div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      {schema.columns?.slice(0, 8).map(col => (
                        <div
                          key={col.name}
                          className="text-xs bg-gray-100 px-2 py-1 rounded"
                        >
                          {col.name} ({col.type})
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Files */}
                  <div>
                    <div className="text-sm font-medium mb-2">Files</div>
                    <div className="space-y-2">
                      {schema.files.map(file => (
                        <div
                          key={file.file_id}
                          className="flex justify-between items-center bg-gray-50 p-3 rounded"
                        >
                          <div className="flex items-center space-x-3">
                            <FileText className="w-4 h-4 text-gray-400" />
                            <div>
                              <div className="text-sm font-medium">
                                {file.filename}
                              </div>
                              <div className="text-xs text-gray-500">
                                {file.records.toLocaleString()} records •{' '}
                                {formatDate(file.uploaded_at)}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center space-x-2">
                            <span
                              className={`text-xs px-2 py-1 rounded-full ${getStatusColor(
                                file.status
                              )}`}
                            >
                              {file.status}
                            </span>

                            {summaries[file.file_id] ? (
                              <CheckCircle2 className="w-4 h-4 text-green-600" />
                            ) : (
                              <button
                                onClick={e => {
                                  e.stopPropagation()
                                  generateSummary(file.file_id)
                                }}
                                disabled={loadingSummaries.has(file.file_id)}
                                className="flex items-center space-x-1 px-3 py-1 bg-green-600 text-white text-xs rounded disabled:opacity-50"
                              >
                                {loadingSummaries.has(file.file_id) ? (
                                  <>
                                    <Clock className="w-3 h-3 animate-spin" />
                                    <span>Generating</span>
                                  </>
                                ) : (
                                  <>
                                    <Sparkles className="w-3 h-3" />
                                    <span>Generate</span>
                                  </>
                                )}
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
