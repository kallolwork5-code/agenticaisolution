'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Play, 
  Square, 
  Calendar as CalendarIcon, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  Loader2,
  Bot,
  BarChart3,
  Workflow,
  ArrowLeft,
  Zap,
  DollarSign,
  Shield
} from 'lucide-react'

// Types for AI Workflows
interface Agent {
  id: string
  name: string
  description: string
  category: string
  inputs: string[]
  outputs: string[]
  estimated_duration: string
  icon: string
  status: 'idle' | 'preparing' | 'pulling_prompts' | 'retrieving_data' | 'running' | 'processing' | 'completed' | 'error'
  progress: number
  currentStep?: string
  startTime?: Date
  endTime?: Date
  results?: any
  error?: string
}

interface WorkflowTemplate {
  id: string
  name: string
  description: string
  agents: string[]
  estimated_duration: string
  frequency: string
}

interface WorkflowExecution {
  workflow_id: string
  name: string
  status: 'pending' | 'running' | 'completed' | 'failed'
  execution_date: string
  created_at: string
  started_at?: string
  completed_at?: string
  overall_progress: number
  steps: AgentStep[]
  results_summary?: any
  // Enhanced metadata
  total_duration?: number
  phases_completed?: number
  total_phases?: number
  orchestration_steps?: OrchestrationStep[]
  agent_details?: AgentExecutionDetail[]
  performance_metrics?: {
    avg_agent_duration: number
    total_insights_generated: number
    success_rate: number
    error_count: number
  }
  execution_environment?: {
    template_used: string
    agents_count: number
    user_id?: string
    execution_mode: 'manual' | 'scheduled' | 'api'
  }
}

interface AgentExecutionDetail {
  agent_id: string
  agent_name: string
  category: string
  status: 'pending' | 'running' | 'completed' | 'failed'
  start_time: string
  end_time?: string
  duration?: number
  progress: number
  steps_completed: number
  total_steps: number
  inputs_processed: string[]
  outputs_generated: string[]
  insights_count?: number
  error_message?: string
  performance_score?: number
}

interface AgentStep {
  agent_name: string
  status: 'pending' | 'running' | 'completed' | 'failed'
  start_time?: string
  end_time?: string
  progress: number
  result?: any
  error?: string
}

interface WebSocketMessage {
  type: string
  workflow_id: string
  agent_name?: string
  status?: string
  progress?: number
  message?: string
  result?: any
  error?: string
}

interface OrchestrationStep {
  id: string
  name: string
  description: string
  agentId?: string
  status: 'pending' | 'running' | 'completed' | 'error'
  progress: number
  startTime?: Date
  endTime?: Date
  duration?: number
  logs: string[]
}

interface OrchestrationPhase {
  id: string
  name: string
  description: string
  steps: OrchestrationStep[]
  status: 'pending' | 'running' | 'completed' | 'error'
  progress: number
  startTime?: Date
  endTime?: Date
}

interface OrchestrationFlow {
  phases: OrchestrationPhase[]
  currentPhase: number
  currentStep: number
  overallProgress: number
  estimatedTimeRemaining?: number
  totalSteps: number
  completedSteps: number
}

interface AIWorkflowsProps {
  onBack: () => void
}

interface AgentProgressCardProps {
  agent: Agent
  index: number
  isExecuting: boolean
}

// Enhanced Agent Progress Card Component
const AgentProgressCard: React.FC<AgentProgressCardProps> = ({ agent, index, isExecuting }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'preparing': return 'border-yellow-500/50 bg-yellow-500/10'
      case 'pulling_prompts': return 'border-purple-500/50 bg-purple-500/10'
      case 'retrieving_data': return 'border-blue-500/50 bg-blue-500/10'
      case 'running': return 'border-green-500/50 bg-green-500/10'
      case 'processing': return 'border-blue-500/50 bg-blue-500/10'
      case 'completed': return 'border-green-500/50 bg-green-500/10'
      case 'error': return 'border-red-500/50 bg-red-500/10'
      default: return 'border-white/10 bg-white/5'
    }
  }

  const getProgressBarColor = (status: string) => {
    switch (status) {
      case 'preparing':
      case 'pulling_prompts':
      case 'retrieving_data':
        return 'bg-gradient-to-r from-yellow-400 to-orange-500'
      case 'running':
      case 'processing':
        return 'bg-gradient-to-r from-blue-400 to-green-500'
      case 'completed':
        return 'bg-gradient-to-r from-green-400 to-emerald-500'
      case 'error':
        return 'bg-gradient-to-r from-red-400 to-red-600'
      default:
        return 'bg-gradient-to-r from-gray-400 to-gray-500'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'running': return <Loader2 className="h-4 w-4 animate-spin text-green-400" />
      case 'processing': return <Loader2 className="h-4 w-4 animate-spin text-blue-400" />
      case 'preparing': return <Clock className="h-4 w-4 text-yellow-400 animate-pulse" />
      case 'pulling_prompts': return <Bot className="h-4 w-4 text-purple-400 animate-pulse" />
      case 'retrieving_data': return <BarChart3 className="h-4 w-4 text-blue-400 animate-pulse" />
      case 'error': return <AlertCircle className="h-4 w-4 text-red-600" />
      default: return <Clock className="h-4 w-4 text-gray-600" />
    }
  }

  const getAgentIcon = (category: string) => {
    switch (category) {
      case 'Performance': return <BarChart3 className="h-5 w-5" />
      case 'Routing': return <Workflow className="h-5 w-5" />
      case 'Settlement': return <DollarSign className="h-5 w-5" />
      case 'Financial': return <DollarSign className="h-5 w-5" />
      case 'Security': return <Shield className="h-5 w-5" />
      case 'Compliance': return <CheckCircle className="h-5 w-5" />
      default: return <Bot className="h-5 w-5" />
    }
  }

  const getDuration = () => {
    if (agent.startTime && agent.endTime) {
      const duration = Math.round((agent.endTime.getTime() - agent.startTime.getTime()) / 1000)
      return `${duration}s`
    }
    if (agent.startTime && agent.status !== 'idle') {
      const duration = Math.round((new Date().getTime() - agent.startTime.getTime()) / 1000)
      return `${duration}s`
    }
    return null
  }

  return (
    <motion.div
      className={`border rounded-xl p-6 hover:bg-white/10 transition-all duration-300 ${getStatusColor(agent.status)}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.1 * index }}
      whileHover={{ scale: 1.02 }}
    >
      {/* Agent Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white/10 rounded-lg">
            {getAgentIcon(agent.category)}
          </div>
          <div>
            <h3 className="font-semibold text-white text-sm">{agent.name}</h3>
            <p className="text-xs text-white/60">{agent.category}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {getStatusIcon(agent.status)}
          <span className="text-xs text-white/80 capitalize font-medium">
            {agent.status.replace('_', ' ')}
          </span>
        </div>
      </div>

      {/* Agent Description */}
      <p className="text-xs text-white/70 mb-4 leading-relaxed">{agent.description}</p>

      {/* Current Step Display */}
      {agent.currentStep && agent.status !== 'idle' && (
        <motion.div
          className="mb-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex items-center gap-2 mb-1">
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
            <span className="text-xs text-blue-300 font-medium">Current Step</span>
          </div>
          <div className="text-xs text-blue-200">{agent.currentStep}</div>
        </motion.div>
      )}

      {/* Progress Section */}
      <div className="space-y-3">
        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between items-center text-xs">
            <span className="text-white/80 font-medium">Progress</span>
            <span className="text-white/60">{agent.progress}%</span>
          </div>
          <div className="w-full bg-white/10 rounded-full h-3 overflow-hidden">
            <motion.div 
              className={`h-3 rounded-full transition-all duration-500 ${getProgressBarColor(agent.status)}`}
              style={{ width: `${agent.progress}%` }}
              initial={{ width: 0 }}
              animate={{ width: `${agent.progress}%` }}
            />
          </div>
        </div>

        {/* Timing Information */}
        <div className="flex justify-between items-center text-xs text-white/60">
          <div className="flex items-center gap-4">
            {agent.startTime && agent.status !== 'idle' && (
              <span>Started: {agent.startTime.toLocaleTimeString()}</span>
            )}
            {getDuration() && (
              <span>Duration: {getDuration()}</span>
            )}
          </div>
          <span className="text-white/50">{agent.estimated_duration}</span>
        </div>

        {/* Input/Output Information */}
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div>
            <div className="text-white/60 font-medium mb-1">Inputs</div>
            <div className="space-y-1">
              {agent.inputs.slice(0, 2).map((input, i) => (
                <div key={i} className="text-white/50 bg-white/5 px-2 py-1 rounded text-xs">
                  {input.replace('_', ' ')}
                </div>
              ))}
            </div>
          </div>
          <div>
            <div className="text-white/60 font-medium mb-1">Outputs</div>
            <div className="space-y-1">
              {agent.outputs.slice(0, 2).map((output, i) => (
                <div key={i} className="text-white/50 bg-white/5 px-2 py-1 rounded text-xs">
                  {output.replace('_', ' ')}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Results Display */}
      {agent.results && (
        <motion.div
          className="mt-4 p-3 bg-green-500/20 border border-green-500/30 rounded-lg"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="w-4 h-4 text-green-400" />
            <span className="font-medium text-green-400 text-xs">Execution Completed</span>
          </div>
          <div className="text-green-300 text-xs">
            Results available for dashboard integration
          </div>
          {agent.results.insights_generated && (
            <div className="text-green-200 text-xs mt-1">
              Generated {agent.results.insights_generated} insights
            </div>
          )}
        </motion.div>
      )}

      {/* Error Display */}
      {agent.error && (
        <motion.div
          className="mt-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="w-4 h-4 text-red-400" />
            <span className="font-medium text-red-400 text-xs">Execution Failed</span>
          </div>
          <div className="text-red-300 text-xs">{agent.error}</div>
        </motion.div>
      )}
    </motion.div>
  )
}

const AIWorkflows: React.FC<AIWorkflowsProps> = ({ onBack }) => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [selectedTemplate, setSelectedTemplate] = useState<string>('comprehensive_payment_analysis')
  const [availableAgents, setAvailableAgents] = useState<Agent[]>([])
  const [workflowTemplates, setWorkflowTemplates] = useState<WorkflowTemplate[]>([])

  const [executionHistory, setExecutionHistory] = useState<WorkflowExecution[]>([])
  const [isExecuting, setIsExecuting] = useState(false)
  const [orchestratorLogs, setOrchestratorLogs] = useState<string[]>([])
  const [websocket, setWebsocket] = useState<WebSocket | null>(null)
  
  // Orchestration Flow State
  const [orchestrationFlow, setOrchestrationFlow] = useState<OrchestrationFlow | null>(null)
  const [currentOrchestrationStep, setCurrentOrchestrationStep] = useState<OrchestrationStep | null>(null)
  
  // Run History Filtering State
  const [historyFilters, setHistoryFilters] = useState({
    dateRange: { start: '', end: '' },
    status: 'all' as 'all' | 'completed' | 'running' | 'failed',
    agentFilter: 'all' as string,
    sortBy: 'created_at' as keyof WorkflowExecution,
    sortOrder: 'desc' as 'asc' | 'desc'
  })
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set())
  const [showFilters, setShowFilters] = useState(false)

  // Initialize with dummy execution history
  useEffect(() => {
    const dummyHistory: WorkflowExecution[] = [
      {
        workflow_id: 'wf_20241217_001',
        name: 'Daily Operations Analysis',
        status: 'completed',
        execution_date: '2024-12-17',
        created_at: '2024-12-17T09:00:00Z',
        started_at: '2024-12-17T09:00:15Z',
        completed_at: '2024-12-17T09:05:42Z',
        overall_progress: 100,
        steps: [
          { agent_name: 'Settlement Analysis Agent', status: 'completed', progress: 100, start_time: '09:00:15', end_time: '09:02:30' },
          { agent_name: 'Fraud Analysis Agent', status: 'completed', progress: 100, start_time: '09:02:35', end_time: '09:04:10' },
          { agent_name: 'Performance Analysis Agent', status: 'completed', progress: 100, start_time: '09:04:15', end_time: '09:05:42' }
        ],
        results_summary: { prompt_used: 'Financial Data Classifier v2.1', total_transactions: 1250, insights_generated: 15 }
      },
      {
        workflow_id: 'wf_20241216_003',
        name: 'Compliance Monitoring',
        status: 'completed',
        execution_date: '2024-12-16',
        created_at: '2024-12-16T14:30:00Z',
        started_at: '2024-12-16T14:30:20Z',
        completed_at: '2024-12-16T14:33:15Z',
        overall_progress: 100,
        steps: [
          { agent_name: 'Compliance Checker Agent', status: 'completed', progress: 100, start_time: '14:30:20', end_time: '14:32:45' },
          { agent_name: 'SLA Calculation Agent', status: 'completed', progress: 100, start_time: '14:32:50', end_time: '14:33:15' }
        ],
        results_summary: { prompt_used: 'Compliance Analyzer v1.8', violations_found: 3, recommendations: 8 }
      },
      {
        workflow_id: 'wf_20241216_002',
        name: 'Routing Optimization',
        status: 'failed',
        execution_date: '2024-12-16',
        created_at: '2024-12-16T11:15:00Z',
        started_at: '2024-12-16T11:15:10Z',
        completed_at: '2024-12-16T11:16:45Z',
        overall_progress: 45,
        steps: [
          { agent_name: 'Routing Optimization Agent', status: 'failed', progress: 45, start_time: '11:15:10', end_time: '11:16:45', error: 'Data source unavailable' }
        ],
        results_summary: { prompt_used: 'Routing Rules Engine v3.0', error: 'Connection timeout to routing database' }
      },
      {
        workflow_id: 'wf_20241215_001',
        name: 'Daily Operations Analysis',
        status: 'completed',
        execution_date: '2024-12-15',
        created_at: '2024-12-15T08:45:00Z',
        started_at: '2024-12-15T08:45:25Z',
        completed_at: '2024-12-15T08:51:10Z',
        overall_progress: 100,
        steps: [
          { agent_name: 'Settlement Analysis Agent', status: 'completed', progress: 100, start_time: '08:45:25', end_time: '08:47:30' },
          { agent_name: 'Fraud Analysis Agent', status: 'completed', progress: 100, start_time: '08:47:35', end_time: '08:49:20' },
          { agent_name: 'Performance Analysis Agent', status: 'completed', progress: 100, start_time: '08:49:25', end_time: '08:51:10' }
        ],
        results_summary: { prompt_used: 'Financial Data Classifier v2.1', total_transactions: 1180, insights_generated: 12 }
      },
      {
        workflow_id: 'wf_20241214_002',
        name: 'Risk Assessment',
        status: 'completed',
        execution_date: '2024-12-14',
        created_at: '2024-12-14T16:20:00Z',
        started_at: '2024-12-14T16:20:30Z',
        completed_at: '2024-12-14T16:24:15Z',
        overall_progress: 100,
        steps: [
          { agent_name: 'Fraud Analysis Agent', status: 'completed', progress: 100, start_time: '16:20:30', end_time: '16:22:45' },
          { agent_name: 'Compliance Checker Agent', status: 'completed', progress: 100, start_time: '16:22:50', end_time: '16:24:15' }
        ],
        results_summary: { prompt_used: 'Risk Assessment Engine v2.5', risk_score: 'Medium', alerts_generated: 5 }
      }
    ]
    
    setExecutionHistory(dummyHistory)
  }, [])

  // Load available agents and templates
  useEffect(() => {
    loadAvailableAgents()
    loadWorkflowTemplates()
    loadExecutionHistory()
  }, [])

  const loadAvailableAgents = async () => {
    // Always use dummy agents for now since API is not available
    const dummyAgents: Agent[] = [
      {
        id: 'sla_calculation',
        name: 'SLA Calculator Agent',
        description: 'Calculates SLA metrics from existing transaction data and monitors compliance performance',
        category: 'Compliance',
        inputs: ['transaction_data', 'sla_rules'],
        outputs: ['sla_metrics', 'compliance_alerts'],
        estimated_duration: '2-3 minutes',
        icon: 'check-circle',
        status: 'idle',
        progress: 0
      },
      {
        id: 'routing_optimization',
        name: 'Routing Optimization Agent',
        description: 'Analyzes routing decisions between primary and secondary acquirers to identify cost savings opportunities',
        category: 'Routing',
        inputs: ['routing_data', 'cost_matrices'],
        outputs: ['routing_recommendations', 'cost_analysis'],
        estimated_duration: '3-5 minutes',
        icon: 'workflow',
        status: 'idle',
        progress: 0
      },
      {
        id: 'settlement_analysis',
        name: 'Settlement Analysis Agent',
        description: 'Analyzes settlement efficiency and MDR optimization to ensure correct settlements with optimal rates',
        category: 'Settlement',
        inputs: ['transaction_data', 'settlement_records'],
        outputs: ['settlement_analysis', 'delay_insights'],
        estimated_duration: '2-3 minutes',
        icon: 'dollar-sign',
        status: 'idle',
        progress: 0
      }
    ]
    setAvailableAgents(dummyAgents)

    // Try to load from API as well, but don't block on it
    try {
      const response = await fetch('/api/ai-workflows/available-agents')
      const data = await response.json()
      if (data.status === 'success') {
        const agentsWithStatus = data.agents.map((agent: any) => ({
          ...agent,
          status: 'idle',
          progress: 0
        }))
        setAvailableAgents(agentsWithStatus)
      }
    } catch (error) {
      console.log('API not available, using dummy agents')
    }
  }

  const loadWorkflowTemplates = async () => {
    // Always use dummy templates for now since API is not available
    const dummyTemplates: WorkflowTemplate[] = [
      {
        id: 'daily_operations',
        name: 'Daily Operations Analysis',
        description: 'Comprehensive daily analysis of payment operations',
        agents: ['settlement_analysis', 'fraud_analysis', 'performance_analysis'],
        estimated_duration: '5-8 minutes',
        frequency: 'Daily'
      },
      {
        id: 'comprehensive_payment_analysis',
        name: 'Comprehensive Payment Analysis',
        description: 'Complete analysis of payment operations and performance',
        agents: ['settlement_analysis', 'fraud_analysis', 'performance_analysis'],
        estimated_duration: '6-10 minutes',
        frequency: 'Daily'
      },
      {
        id: 'compliance_monitoring',
        name: 'Compliance Monitoring',
        description: 'Monitor regulatory compliance and policy adherence',
        agents: ['compliance_checker', 'sla_calculation'],
        estimated_duration: '3-5 minutes',
        frequency: 'Daily'
      },
      {
        id: 'risk_assessment',
        name: 'Risk Assessment',
        description: 'Comprehensive risk analysis and fraud detection',
        agents: ['fraud_analysis', 'compliance_checker'],
        estimated_duration: '4-6 minutes',
        frequency: 'Hourly'
      },
      {
        id: 'routing_optimization',
        name: 'Routing Optimization',
        description: 'Optimize payment routing for cost and success rates',
        agents: ['routing_optimization'],
        estimated_duration: '3-5 minutes',
        frequency: 'Weekly'
      }
    ]
    setWorkflowTemplates(dummyTemplates)

    // Try to load from API as well, but don't block on it
    try {
      const response = await fetch('/api/ai-workflows/workflow-templates')
      const data = await response.json()
      if (data.status === 'success') {
        setWorkflowTemplates(data.templates)
      }
    } catch (error) {
      console.log('API not available, using dummy templates')
    }
  }

  const loadExecutionHistory = async () => {
    try {
      const response = await fetch('/api/ai-workflows/executions')
      const data = await response.json()
      if (data.status === 'success') {
        setExecutionHistory(data.executions)
      }
    } catch (error) {
      console.error('Failed to load execution history:', error)
    }
  }

  // WebSocket connection for real-time updates
  const connectWebSocket = (workflowId: string) => {
    const ws = new WebSocket(`ws://localhost:8000/api/ai-workflows/ws/${workflowId}`)
    
    ws.onopen = () => {
      console.log('WebSocket connected for workflow:', workflowId)
      setWebsocket(ws)
    }
    
    ws.onmessage = (event) => {
      const message: WebSocketMessage = JSON.parse(event.data)
      handleWebSocketMessage(message)
    }
    
    ws.onclose = () => {
      console.log('WebSocket disconnected')
      setWebsocket(null)
    }
    
    ws.onerror = (error) => {
      console.error('WebSocket error:', error)
    }
  }

  const handleWebSocketMessage = (message: WebSocketMessage) => {
    switch (message.type) {
      case 'workflow_started':
        addOrchestratorLog(`🚀 Workflow orchestration initiated`)
        addOrchestratorLog(`📋 Loading workflow configuration: ${message.message}`)
        addOrchestratorLog(`🔧 Initializing agent orchestrator...`)
        addOrchestratorLog(`🔍 Validating agent dependencies...`)
        break
      
      case 'agent_started':
        addOrchestratorLog(`🎯 Agent engagement: ${message.agent_name}`)
        addOrchestratorLog(`📥 Pulling prompts for ${message.agent_name}...`)
        updateAgentStatus(message.agent_name!, 'preparing', 5)
        
        setTimeout(() => {
          addOrchestratorLog(`📊 Retrieving data sources for ${message.agent_name}...`)
          updateAgentStatus(message.agent_name!, 'retrieving_data', 15)
          
          setTimeout(() => {
            addOrchestratorLog(`🤖 Engaging ${message.agent_name} agent execution...`)
            addOrchestratorLog(`⚡ ${message.agent_name}: Initializing processing pipeline...`)
            updateAgentStatus(message.agent_name!, 'running', 25)
          }, 1200)
        }, 800)
        break
      
      case 'agent_progress':
        updateAgentStatus(message.agent_name!, 'running', message.progress!)
        
        // Enhanced progress messaging with agent engagement details
        if (message.progress! >= 25 && message.progress! < 40) {
          addOrchestratorLog(`🔄 ${message.agent_name}: Processing input data streams...`)
        } else if (message.progress! >= 40 && message.progress! < 55) {
          addOrchestratorLog(`🧠 ${message.agent_name}: Applying AI models and algorithms...`)
        } else if (message.progress! >= 55 && message.progress! < 70) {
          addOrchestratorLog(`📈 ${message.agent_name}: Analyzing patterns and correlations...`)
        } else if (message.progress! >= 70 && message.progress! < 85) {
          addOrchestratorLog(`✨ ${message.agent_name}: Generating insights and recommendations...`)
        } else if (message.progress! >= 85 && message.progress! < 95) {
          addOrchestratorLog(`📋 ${message.agent_name}: Compiling results and metadata...`)
        } else if (message.progress! >= 95) {
          addOrchestratorLog(`🔄 ${message.agent_name}: Finalizing output and validation...`)
        }
        break
      
      case 'agent_completed':
        updateAgentStatus(message.agent_name!, 'completed', 100, message.result)
        addOrchestratorLog(`✅ ${message.agent_name} execution completed successfully`)
        addOrchestratorLog(`💾 Persisting ${message.agent_name} results to data store...`)
        addOrchestratorLog(`📊 ${message.agent_name} generated ${Math.floor(Math.random() * 50) + 10} insights`)
        break
      
      case 'agent_error':
        updateAgentStatus(message.agent_name!, 'error', 0, null, message.error)
        addOrchestratorLog(`❌ ${message.agent_name} execution failed: ${message.error}`)
        addOrchestratorLog(`🔧 Attempting error recovery for ${message.agent_name}...`)
        addOrchestratorLog(`📝 Logging error details for troubleshooting`)
        break
      
      case 'workflow_completed':
        addOrchestratorLog('🎉 All agents completed successfully!')
        addOrchestratorLog('📊 Aggregating results from all agent executions...')
        addOrchestratorLog('📋 Generating comprehensive workflow report...')
        addOrchestratorLog('💾 Saving complete execution results to history')
        addOrchestratorLog('✨ Workflow orchestration completed successfully!')
        setIsExecuting(false)
        // Add to execution history
        addExecutionToHistory()
        break
      
      default:
        console.log('Unknown WebSocket message type:', message.type)
    }
  }

  const addOrchestratorLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString()
    setOrchestratorLogs(prev => [...prev, `${timestamp} - ${message}`])
  }

  const updateAgentStatus = (agentName: string, status: string, progress: number, result?: any, error?: string) => {
    const currentStep = getStepDescription(status, progress)
    setAvailableAgents(prev => prev.map(agent => 
      agent.name.toLowerCase().includes(agentName.toLowerCase()) 
        ? { 
            ...agent, 
            status: status as any, 
            progress, 
            currentStep,
            results: result, 
            error,
            startTime: agent.startTime || (status !== 'idle' ? new Date() : undefined),
            endTime: status === 'completed' || status === 'error' ? new Date() : undefined
          }
        : agent
    ))
  }

  const getStepDescription = (status: string, progress: number): string => {
    switch (status) {
      case 'preparing': return 'Initializing agent...'
      case 'pulling_prompts': return 'Loading prompts...'
      case 'retrieving_data': return 'Fetching data sources...'
      case 'running':
        if (progress < 30) return 'Processing input data...'
        if (progress < 50) return 'Applying AI models...'
        if (progress < 70) return 'Analyzing patterns...'
        if (progress < 90) return 'Generating insights...'
        return 'Finalizing results...'
      case 'processing': return 'Post-processing results...'
      case 'completed': return 'Execution completed'
      case 'error': return 'Execution failed'
      default: return 'Waiting to start...'
    }
  }

  // Orchestration Step Management Functions
  const initializeOrchestrationFlow = (agents: string[]) => {
    const phases: OrchestrationPhase[] = [
      {
        id: 'initialization',
        name: 'Workflow Initialization',
        description: 'Setting up workflow environment and validating configuration',
        status: 'pending',
        progress: 0,
        steps: [
          {
            id: 'init-config',
            name: 'Load Configuration',
            description: 'Loading workflow configuration and agent definitions',
            status: 'pending',
            progress: 0,
            logs: []
          },
          {
            id: 'init-validation',
            name: 'Validate Dependencies',
            description: 'Validating agent dependencies and system requirements',
            status: 'pending',
            progress: 0,
            logs: []
          }
        ]
      }
    ]

    // Add phases for each agent
    agents.forEach((agentName, index) => {
      phases.push({
        id: `agent-${index}`,
        name: `${agentName} Execution`,
        description: `Complete execution cycle for ${agentName}`,
        status: 'pending',
        progress: 0,
        steps: [
          {
            id: `${agentName}-prepare`,
            name: 'Agent Preparation',
            description: `Preparing ${agentName} for execution`,
            agentId: agentName,
            status: 'pending',
            progress: 0,
            logs: []
          },
          {
            id: `${agentName}-prompts`,
            name: 'Load Prompts',
            description: `Pulling prompts for ${agentName}`,
            agentId: agentName,
            status: 'pending',
            progress: 0,
            logs: []
          },
          {
            id: `${agentName}-data`,
            name: 'Retrieve Data',
            description: `Retrieving data sources for ${agentName}`,
            agentId: agentName,
            status: 'pending',
            progress: 0,
            logs: []
          },
          {
            id: `${agentName}-execute`,
            name: 'Execute Agent',
            description: `Running ${agentName} processing pipeline`,
            agentId: agentName,
            status: 'pending',
            progress: 0,
            logs: []
          },
          {
            id: `${agentName}-complete`,
            name: 'Finalize Results',
            description: `Finalizing and storing ${agentName} results`,
            agentId: agentName,
            status: 'pending',
            progress: 0,
            logs: []
          }
        ]
      })
    })

    // Add completion phase
    phases.push({
      id: 'completion',
      name: 'Workflow Completion',
      description: 'Aggregating results and finalizing workflow execution',
      status: 'pending',
      progress: 0,
      steps: [
        {
          id: 'complete-aggregate',
          name: 'Aggregate Results',
          description: 'Aggregating results from all agent executions',
          status: 'pending',
          progress: 0,
          logs: []
        },
        {
          id: 'complete-report',
          name: 'Generate Report',
          description: 'Generating comprehensive workflow report',
          status: 'pending',
          progress: 0,
          logs: []
        },
        {
          id: 'complete-save',
          name: 'Save to History',
          description: 'Saving execution results to history',
          status: 'pending',
          progress: 0,
          logs: []
        }
      ]
    })

    const totalSteps = phases.reduce((total, phase) => total + phase.steps.length, 0)

    const flow: OrchestrationFlow = {
      phases,
      currentPhase: 0,
      currentStep: 0,
      overallProgress: 0,
      totalSteps,
      completedSteps: 0
    }

    setOrchestrationFlow(flow)
    return flow
  }

  const updateOrchestrationStep = (stepId: string, status: 'running' | 'completed' | 'error', progress: number = 100, logs: string[] = []) => {
    setOrchestrationFlow(prev => {
      if (!prev) return prev

      const updatedFlow = { ...prev }
      let stepFound = false

      // Find and update the step
      updatedFlow.phases = updatedFlow.phases.map(phase => {
        const updatedPhase = { ...phase }
        updatedPhase.steps = updatedPhase.steps.map(step => {
          if (step.id === stepId) {
            stepFound = true
            const updatedStep = {
              ...step,
              status,
              progress,
              logs: [...step.logs, ...logs],
              startTime: step.startTime || (status === 'running' ? new Date() : undefined),
              endTime: status === 'completed' || status === 'error' ? new Date() : undefined
            }
            
            if (updatedStep.startTime && updatedStep.endTime) {
              updatedStep.duration = Math.round((updatedStep.endTime.getTime() - updatedStep.startTime.getTime()) / 1000)
            }

            setCurrentOrchestrationStep(updatedStep)
            return updatedStep
          }
          return step
        })

        // Update phase status and progress
        const completedSteps = updatedPhase.steps.filter(s => s.status === 'completed').length
        const runningSteps = updatedPhase.steps.filter(s => s.status === 'running').length
        const errorSteps = updatedPhase.steps.filter(s => s.status === 'error').length

        if (errorSteps > 0) {
          updatedPhase.status = 'error'
        } else if (completedSteps === updatedPhase.steps.length) {
          updatedPhase.status = 'completed'
          updatedPhase.endTime = new Date()
        } else if (runningSteps > 0 || completedSteps > 0) {
          updatedPhase.status = 'running'
          if (!updatedPhase.startTime) updatedPhase.startTime = new Date()
        }

        updatedPhase.progress = Math.round((completedSteps / updatedPhase.steps.length) * 100)
        return updatedPhase
      })

      // Update overall progress
      const totalCompletedSteps = updatedFlow.phases.reduce((total, phase) => 
        total + phase.steps.filter(s => s.status === 'completed').length, 0
      )
      
      updatedFlow.completedSteps = totalCompletedSteps
      updatedFlow.overallProgress = Math.round((totalCompletedSteps / updatedFlow.totalSteps) * 100)

      // Update current phase and step
      for (let i = 0; i < updatedFlow.phases.length; i++) {
        const phase = updatedFlow.phases[i]
        if (phase.status === 'running' || phase.status === 'pending') {
          updatedFlow.currentPhase = i
          
          for (let j = 0; j < phase.steps.length; j++) {
            const step = phase.steps[j]
            if (step.status === 'running' || step.status === 'pending') {
              updatedFlow.currentStep = j
              break
            }
          }
          break
        }
      }

      return updatedFlow
    })
  }

  const addExecutionToHistory = () => {
    const completedAgents = availableAgents.filter(a => a.status === 'completed')
    const totalInsights = completedAgents.reduce((sum, agent) => 
      sum + (agent.results?.insights_generated || Math.floor(Math.random() * 20) + 5), 0
    )
    
    // Calculate execution timing
    const executionStartTime = completedAgents[0]?.startTime || new Date(Date.now() - 300000)
    const executionEndTime = new Date()
    const totalDuration = Math.round((executionEndTime.getTime() - executionStartTime.getTime()) / 1000)
    
    // Create detailed agent execution data
    const agentDetails: AgentExecutionDetail[] = completedAgents.map(agent => ({
      agent_id: agent.id,
      agent_name: agent.name,
      category: agent.category,
      status: agent.status as 'completed',
      start_time: agent.startTime?.toISOString() || new Date(Date.now() - 240000).toISOString(),
      end_time: agent.endTime?.toISOString() || new Date().toISOString(),
      duration: agent.endTime && agent.startTime 
        ? Math.round((agent.endTime.getTime() - agent.startTime.getTime()) / 1000)
        : Math.floor(Math.random() * 60) + 30,
      progress: 100,
      steps_completed: 5, // Each agent has 5 steps (prepare, prompts, data, execute, complete)
      total_steps: 5,
      inputs_processed: agent.inputs,
      outputs_generated: agent.outputs,
      insights_count: agent.results?.insights_generated || Math.floor(Math.random() * 20) + 5,
      performance_score: Math.floor(Math.random() * 30) + 70 // 70-100 performance score
    }))

    // Calculate performance metrics
    const avgDuration = agentDetails.reduce((sum, agent) => sum + (agent.duration || 0), 0) / agentDetails.length
    const successRate = (completedAgents.length / availableAgents.length) * 100
    const errorCount = availableAgents.filter(a => a.status === 'error').length

    const newExecution: WorkflowExecution = {
      workflow_id: `wf_${new Date().toISOString().split('T')[0].replace(/-/g, '')}_${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
      name: workflowTemplates.find(t => t.id === selectedTemplate)?.name || 'Unknown Workflow',
      status: 'completed',
      execution_date: selectedDate.toISOString().split('T')[0],
      created_at: new Date().toISOString(),
      started_at: executionStartTime.toISOString(),
      completed_at: executionEndTime.toISOString(),
      overall_progress: 100,
      
      // Basic steps for backward compatibility
      steps: completedAgents.map(agent => ({
        agent_name: agent.name,
        status: 'completed' as const,
        progress: 100,
        start_time: agent.startTime?.toLocaleTimeString() || new Date(Date.now() - 240000).toLocaleTimeString(),
        end_time: agent.endTime?.toLocaleTimeString() || new Date().toLocaleTimeString()
      })),
      
      // Enhanced metadata
      total_duration: totalDuration,
      phases_completed: orchestrationFlow?.phases.filter(p => p.status === 'completed').length || 5,
      total_phases: orchestrationFlow?.phases.length || 5,
      orchestration_steps: orchestrationFlow?.phases.flatMap(phase => phase.steps) || [],
      agent_details: agentDetails,
      
      performance_metrics: {
        avg_agent_duration: Math.round(avgDuration),
        total_insights_generated: totalInsights,
        success_rate: Math.round(successRate),
        error_count: errorCount
      },
      
      execution_environment: {
        template_used: selectedTemplate,
        agents_count: availableAgents.length,
        user_id: 'demo_user',
        execution_mode: 'manual' as const
      },
      
      results_summary: { 
        prompt_used: 'Enhanced AI Workflow Orchestrator v3.2', 
        total_transactions: Math.floor(Math.random() * 1000) + 500, 
        insights_generated: totalInsights,
        execution_efficiency: Math.round((successRate / 100) * (100 - (totalDuration / 60))),
        data_sources_accessed: agentDetails.reduce((sum, agent) => sum + agent.inputs_processed.length, 0),
        outputs_generated: agentDetails.reduce((sum, agent) => sum + agent.outputs_generated.length, 0)
      }
    }
    
    setExecutionHistory(prev => [newExecution, ...prev])
  }

  const startWorkflow = async () => {
    console.log('🚀 startWorkflow called!')
    
    // Immediate test - add a log to see if the function works
    addOrchestratorLog('🧪 Testing orchestrator logging...')
    
    console.log('Selected template:', selectedTemplate)
    console.log('Available agents:', availableAgents.length)
    console.log('Workflow templates:', workflowTemplates.length)
    console.log('All templates:', workflowTemplates.map(t => ({ id: t.id, name: t.name })))
    
    if (!selectedTemplate) {
      console.log('❌ No template selected')
      addOrchestratorLog('❌ No template selected')
      return
    }

    const template = workflowTemplates.find(t => t.id === selectedTemplate)
    console.log('Looking for template with ID:', selectedTemplate)
    console.log('Found template:', template)
    
    if (!template) {
      console.log('❌ Template not found:', selectedTemplate)
      addOrchestratorLog(`❌ Template not found: ${selectedTemplate}`)
      addOrchestratorLog(`Available templates: ${workflowTemplates.map(t => t.id).join(', ')}`)
      return
    }

    console.log('✅ Found template:', template.name)
    addOrchestratorLog(`✅ Found template: ${template.name}`)

    try {
      setIsExecuting(true)
      addOrchestratorLog('🚀 Starting workflow execution...')
      
      // Reset all agents to idle state
      setAvailableAgents(prev => prev.map(agent => ({
        ...agent,
        status: 'idle' as const,
        progress: 0,
        currentStep: undefined,
        startTime: undefined,
        endTime: undefined,
        results: undefined,
        error: undefined
      })))

      // Skip API call for now and go directly to dummy simulation
      addOrchestratorLog('🔄 Using dummy simulation mode...')
      console.log('Starting dummy simulation...')
      
      // Initialize orchestration flow
      const agents = ['SLA Calculator Agent', 'Routing Optimization Agent', 'Settlement Analysis Agent']
      const flow = initializeOrchestrationFlow(agents)
      
      // Start immediate orchestration sequence for all 3 agents
      setTimeout(() => {
        // Start initialization phase
        updateOrchestrationStep('init-config', 'running', 50, ['Loading workflow configuration...'])
        addOrchestratorLog('🚀 Workflow orchestration initiated')
        addOrchestratorLog('📋 Loading workflow configuration: 3 agents configured')
        
        setTimeout(() => {
          updateOrchestrationStep('init-config', 'completed', 100, ['Configuration loaded successfully'])
          updateOrchestrationStep('init-validation', 'running', 50, ['Validating dependencies...'])
          addOrchestratorLog('🔧 Initializing agent orchestrator...')
          addOrchestratorLog('🔍 Validating agent dependencies...')
          
          setTimeout(() => {
            updateOrchestrationStep('init-validation', 'completed', 100, ['Dependencies validated'])
            
            // Run all 3 agents sequentially
            const runAgent = (agentIndex: number) => {
              if (agentIndex >= agents.length) {
                // All agents completed - start completion phase
                setTimeout(() => {
                  updateOrchestrationStep('complete-aggregate', 'running', 50, ['Aggregating results...'])
                  addOrchestratorLog('🎉 All agents completed successfully!')
                  addOrchestratorLog('📊 Aggregating results from all agent executions...')
                  
                  setTimeout(() => {
                    updateOrchestrationStep('complete-aggregate', 'completed', 100, ['Results aggregated'])
                    updateOrchestrationStep('complete-report', 'running', 50, ['Generating report...'])
                    addOrchestratorLog('📋 Generating comprehensive workflow report...')
                    
                    setTimeout(() => {
                      updateOrchestrationStep('complete-report', 'completed', 100, ['Report generated'])
                      updateOrchestrationStep('complete-save', 'running', 50, ['Saving to history...'])
                      addOrchestratorLog('💾 Saving complete execution results to history')
                      
                      setTimeout(() => {
                        updateOrchestrationStep('complete-save', 'completed', 100, ['Saved successfully'])
                        addOrchestratorLog('✨ Workflow orchestration completed successfully!')
                        setIsExecuting(false)
                        setOrchestrationFlow(null)
                        setCurrentOrchestrationStep(null)
                        addExecutionToHistory()
                      }, 1000)
                    }, 1000)
                  }, 1000)
                }, 1000)
                return
              }
              
              const agentName = agents[agentIndex]
              
              setTimeout(() => {
                addOrchestratorLog(`🎯 Agent engagement: ${agentName}`)
                addOrchestratorLog(`📥 Pulling prompts for ${agentName}...`)
                updateAgentStatus(agentName, 'preparing', 5)
                
                setTimeout(() => {
                  addOrchestratorLog(`📊 Retrieving data sources for ${agentName}...`)
                  updateAgentStatus(agentName, 'retrieving_data', 15)
                  
                  setTimeout(() => {
                    addOrchestratorLog(`🤖 Engaging ${agentName} agent execution...`)
                    addOrchestratorLog(`⚡ ${agentName}: Initializing processing pipeline...`)
                    updateAgentStatus(agentName, 'running', 25)
                    
                    // Progress updates for current agent
                    setTimeout(() => {
                      addOrchestratorLog(`🔄 ${agentName}: Processing input data streams...`)
                      updateAgentStatus(agentName, 'running', 40)
                    }, 1000)
                    
                    setTimeout(() => {
                      addOrchestratorLog(`🧠 ${agentName}: Applying AI models and algorithms...`)
                      updateAgentStatus(agentName, 'running', 60)
                    }, 2000)
                    
                    setTimeout(() => {
                      addOrchestratorLog(`📈 ${agentName}: Analyzing patterns and correlations...`)
                      updateAgentStatus(agentName, 'running', 80)
                    }, 3000)
                    
                    setTimeout(() => {
                      addOrchestratorLog(`✨ ${agentName}: Generating insights and recommendations...`)
                      updateAgentStatus(agentName, 'running', 95)
                    }, 4000)
                    
                    setTimeout(() => {
                      addOrchestratorLog(`✅ ${agentName} execution completed successfully`)
                      addOrchestratorLog(`💾 Persisting ${agentName} results to data store...`)
                      addOrchestratorLog(`📊 ${agentName} generated ${Math.floor(Math.random() * 50) + 10} insights`)
                      updateAgentStatus(agentName, 'completed', 100)
                      
                      // Start next agent
                      runAgent(agentIndex + 1)
                    }, 5000)
                    
                  }, 1200)
                }, 800)
              }, agentIndex === 0 ? 1000 : 500) // First agent has longer delay
            }
            
            // Start with the first agent
            runAgent(0)
            
          }, 500)
        }, 500)
      }, 500)
      
    } catch (error) {
      console.error('Failed to start workflow:', error)
      addOrchestratorLog(`💥 Error starting workflow: ${error}`)
      setIsExecuting(false)
    }
  }

  const simulateDummyWorkflowExecution = () => {
    const workflowId = `wf_${Date.now()}`
    
    console.log('simulateDummyWorkflowExecution called')
    console.log('Available agents for simulation:', availableAgents.length)
    console.log('Agents:', availableAgents.map(a => a.name))
    
    // Simulate workflow started
    handleWebSocketMessage({
      type: 'workflow_started',
      workflow_id: workflowId,
      message: `${availableAgents.length} agents configured`
    })

    // If no agents are available, use a fallback
    if (availableAgents.length === 0) {
      console.log('No agents available, ending simulation')
      addOrchestratorLog('❌ No agents available for simulation')
      setIsExecuting(false)
      return
    }

    // Simulate each agent execution with realistic timing
    availableAgents.forEach((agent, index) => {
      const startDelay = 2000 + (index * 1500) // Stagger agent starts
      
      setTimeout(() => {
        // Agent started
        handleWebSocketMessage({
          type: 'agent_started',
          workflow_id: workflowId,
          agent_name: agent.name
        })

        // Simulate progress updates
        const progressSteps = [30, 45, 60, 75, 85, 95]
        progressSteps.forEach((progress, progressIndex) => {
          setTimeout(() => {
            handleWebSocketMessage({
              type: 'agent_progress',
              workflow_id: workflowId,
              agent_name: agent.name,
              progress: progress
            })
          }, 2000 + (progressIndex * 1000))
        })

        // Agent completed
        setTimeout(() => {
          handleWebSocketMessage({
            type: 'agent_completed',
            workflow_id: workflowId,
            agent_name: agent.name,
            result: {
              insights_generated: Math.floor(Math.random() * 20) + 5,
              processing_time: `${Math.floor(Math.random() * 60) + 30}s`
            }
          })

          // Check if all agents are completed
          if (index === availableAgents.length - 1) {
            setTimeout(() => {
              handleWebSocketMessage({
                type: 'workflow_completed',
                workflow_id: workflowId
              })
            }, 1500)
          }
        }, 8000)

      }, startDelay)
    })
  }

  const stopWorkflow = () => {
    setIsExecuting(false)
    if (websocket) {
      websocket.close()
    }
    addOrchestratorLog('⏹️ Workflow stopped by user')
  }

  // Run History Filtering and Sorting Functions
  const getFilteredAndSortedHistory = () => {
    let filtered = [...executionHistory]

    // Apply date range filter
    if (historyFilters.dateRange.start) {
      filtered = filtered.filter(exec => exec.execution_date >= historyFilters.dateRange.start)
    }
    if (historyFilters.dateRange.end) {
      filtered = filtered.filter(exec => exec.execution_date <= historyFilters.dateRange.end)
    }

    // Apply status filter
    if (historyFilters.status !== 'all') {
      filtered = filtered.filter(exec => exec.status === historyFilters.status)
    }

    // Apply agent filter
    if (historyFilters.agentFilter !== 'all') {
      filtered = filtered.filter(exec => 
        exec.steps.some(step => step.agent_name.includes(historyFilters.agentFilter)) ||
        exec.agent_details?.some(agent => agent.agent_name.includes(historyFilters.agentFilter))
      )
    }

    // Apply sorting
    filtered.sort((a, b) => {
      const aValue = a[historyFilters.sortBy]
      const bValue = b[historyFilters.sortBy]
      
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        const comparison = aValue.localeCompare(bValue)
        return historyFilters.sortOrder === 'asc' ? comparison : -comparison
      }
      
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        const comparison = aValue - bValue
        return historyFilters.sortOrder === 'asc' ? comparison : -comparison
      }
      
      return 0
    })

    return filtered
  }

  const toggleRowExpansion = (workflowId: string) => {
    setExpandedRows(prev => {
      const newSet = new Set(prev)
      if (newSet.has(workflowId)) {
        newSet.delete(workflowId)
      } else {
        newSet.add(workflowId)
      }
      return newSet
    })
  }

  const updateFilter = (key: string, value: any) => {
    setHistoryFilters(prev => ({
      ...prev,
      [key]: value
    }))
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'running': return <Loader2 className="h-4 w-4 animate-spin text-green-400" />
      case 'processing': return <Loader2 className="h-4 w-4 animate-spin text-blue-400" />
      case 'preparing': return <Clock className="h-4 w-4 text-yellow-400 animate-pulse" />
      case 'pulling_prompts': return <Bot className="h-4 w-4 text-purple-400 animate-pulse" />
      case 'retrieving_data': return <BarChart3 className="h-4 w-4 text-blue-400 animate-pulse" />
      case 'error': return <AlertCircle className="h-4 w-4 text-red-600" />
      default: return <Clock className="h-4 w-4 text-gray-600" />
    }
  }

  const getAgentIcon = (category: string) => {
    switch (category) {
      case 'Performance': return <BarChart3 className="h-4 w-4" />
      case 'Routing': return <Workflow className="h-4 w-4" />
      case 'Settlement': return <DollarSign className="h-4 w-4" />
      case 'Financial': return <DollarSign className="h-4 w-4" />
      case 'Security': return <Shield className="h-4 w-4" />
      case 'Compliance': return <CheckCircle className="h-4 w-4" />
      default: return <Bot className="h-4 w-4" />
    }
  }

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -inset-10 opacity-50">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-green-500/10 rounded-full mix-blend-multiply filter blur-xl animate-blob"></div>
          <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-2000"></div>
          <div className="absolute bottom-1/4 left-1/3 w-96 h-96 bg-teal-500/10 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-4000"></div>
        </div>
      </div>

      <div className="relative z-10 p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <motion.div
            className="flex items-center justify-between mb-8"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center gap-4">
              <button
                onClick={onBack}
                className="w-10 h-10 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-white" />
              </button>
              <div>
                <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                  <Workflow className="w-8 h-8 text-green-400" />
                  AI Workflows
                </h1>
                <p className="text-white/60">Visual agent orchestration for automated analysis and insights</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-green-400">
              <Zap className="w-5 h-5" />
              <span className="font-medium">Intelligent Orchestration</span>
            </div>
          </motion.div>

          {/* Control Panel */}
          <motion.div
            className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-6 mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6">
                {/* Date Selector */}
                <div className="flex items-center gap-3">
                  <CalendarIcon className="w-5 h-5 text-green-400" />
                  <div>
                    <label className="block text-xs text-white/60 mb-1">Execution Date</label>
                    <input
                      type="date"
                      value={selectedDate.toISOString().split('T')[0]}
                      onChange={(e) => setSelectedDate(new Date(e.target.value))}
                      className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-green-500/50"
                    />
                  </div>
                </div>

                {/* Workflow Selector */}
                <div className="flex items-center gap-3">
                  <Workflow className="w-5 h-5 text-green-400" />
                  <div>
                    <label className="block text-xs text-white/60 mb-1">Workflow Template</label>
                    <select
                      value={selectedTemplate}
                      onChange={(e) => setSelectedTemplate(e.target.value)}
                      className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white min-w-[200px] focus:outline-none focus:border-green-500/50"
                    >
                      {workflowTemplates.map((template) => (
                        <option key={template.id} value={template.id} className="bg-gray-800">
                          {template.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Control Buttons */}
              <div className="flex items-center gap-3">
                {!isExecuting ? (
                  <motion.button
                    onClick={startWorkflow}
                    className="flex items-center gap-2 px-6 py-3 bg-green-500 hover:bg-green-600 text-black font-medium rounded-lg transition-colors"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Play className="w-4 h-4" />
                    Run Workflow
                  </motion.button>
                ) : (
                  <motion.button
                    onClick={stopWorkflow}
                    className="flex items-center gap-2 px-6 py-3 bg-red-500 hover:bg-red-600 text-white font-medium rounded-lg transition-colors"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Square className="w-4 h-4" />
                    Stop Workflow
                  </motion.button>
                )}
              </div>
            </div>
          </motion.div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Agent Status Panel */}
            <div className="lg:col-span-2 space-y-6">
              <motion.div
                className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
                  <Bot className="w-6 h-6 text-green-400" />
                  Agent Execution Status
                </h2>
                
                <div className="grid grid-cols-1 gap-4">
                  {availableAgents.map((agent, index) => (
                    <AgentProgressCard 
                      key={agent.id} 
                      agent={agent} 
                      index={index}
                      isExecuting={isExecuting}
                    />
                  ))}
                </div>
              </motion.div>
            </div>

            {/* Right Column - Orchestrator & Templates */}
            <div className="space-y-6">
              {/* Orchestration Flow Panel */}
              {orchestrationFlow && (
                <motion.div
                  className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-6"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.5 }}
                >
                  <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-3">
                    <Workflow className="w-6 h-6 text-blue-400" />
                    Orchestration Flow
                  </h2>
                  
                  {/* Overall Progress */}
                  <div className="mb-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-blue-300">Overall Progress</span>
                      <span className="text-sm text-blue-200">{orchestrationFlow.overallProgress}%</span>
                    </div>
                    <div className="w-full bg-white/10 rounded-full h-2">
                      <motion.div 
                        className="bg-gradient-to-r from-blue-400 to-green-500 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${orchestrationFlow.overallProgress}%` }}
                        initial={{ width: 0 }}
                        animate={{ width: `${orchestrationFlow.overallProgress}%` }}
                      />
                    </div>
                    <div className="text-xs text-blue-200 mt-1">
                      {orchestrationFlow.completedSteps} of {orchestrationFlow.totalSteps} steps completed
                    </div>
                  </div>

                  {/* Current Step Display */}
                  {currentOrchestrationStep && (
                    <motion.div
                      className="mb-4 p-3 bg-green-500/10 border border-green-500/20 rounded-lg"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                        <span className="text-sm font-medium text-green-300">Current Step</span>
                      </div>
                      <div className="text-sm text-green-200">{currentOrchestrationStep.name}</div>
                      <div className="text-xs text-green-200/80 mt-1">{currentOrchestrationStep.description}</div>
                      {currentOrchestrationStep.duration && (
                        <div className="text-xs text-green-200/60 mt-1">Duration: {currentOrchestrationStep.duration}s</div>
                      )}
                    </motion.div>
                  )}

                  {/* Phase Progress */}
                  <div className="space-y-3 max-h-[200px] overflow-y-auto">
                    {orchestrationFlow.phases.map((phase, index) => (
                      <motion.div
                        key={phase.id}
                        className={`p-3 rounded-lg border transition-all duration-300 ${
                          phase.status === 'running' 
                            ? 'border-blue-500/50 bg-blue-500/10' 
                            : phase.status === 'completed'
                            ? 'border-green-500/50 bg-green-500/10'
                            : phase.status === 'error'
                            ? 'border-red-500/50 bg-red-500/10'
                            : 'border-white/10 bg-white/5'
                        }`}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-white">{phase.name}</span>
                          <div className="flex items-center gap-2">
                            {phase.status === 'running' && <Loader2 className="w-3 h-3 animate-spin text-blue-400" />}
                            {phase.status === 'completed' && <CheckCircle className="w-3 h-3 text-green-400" />}
                            {phase.status === 'error' && <AlertCircle className="w-3 h-3 text-red-400" />}
                            <span className="text-xs text-white/60">{phase.progress}%</span>
                          </div>
                        </div>
                        <div className="w-full bg-white/10 rounded-full h-1">
                          <motion.div 
                            className={`h-1 rounded-full transition-all duration-500 ${
                              phase.status === 'running' 
                                ? 'bg-gradient-to-r from-blue-400 to-blue-500'
                                : phase.status === 'completed'
                                ? 'bg-gradient-to-r from-green-400 to-green-500'
                                : phase.status === 'error'
                                ? 'bg-gradient-to-r from-red-400 to-red-500'
                                : 'bg-gradient-to-r from-gray-400 to-gray-500'
                            }`}
                            style={{ width: `${phase.progress}%` }}
                            initial={{ width: 0 }}
                            animate={{ width: `${phase.progress}%` }}
                          />
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Orchestrator Logs */}
              <motion.div
                className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-6"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
              >
                <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-3">
                  <Bot className="w-6 h-6 text-purple-400" />
                  Orchestrator Agent
                </h2>
                
                <div className="h-[300px] overflow-y-auto bg-black/20 border border-white/10 rounded-lg p-3">
                  {orchestratorLogs.length === 0 ? (
                    <div className="text-center text-white/40 text-sm py-8">
                      Orchestrator logs will appear here during execution
                    </div>
                  ) : (
                    <div className="space-y-1">
                      {orchestratorLogs.map((log, index) => (
                        <motion.div
                          key={index}
                          className="text-xs font-mono text-green-300"
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.3 }}
                        >
                          {log}
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>

              {/* Workflow Templates */}
              <motion.div
                className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-6"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.8 }}
              >
                <h2 className="text-xl font-bold text-white mb-4">Available Workflows</h2>
                
                <div className="space-y-3">
                  {workflowTemplates.map((template, index) => (
                    <motion.div
                      key={template.id}
                      className={`p-3 border rounded-lg cursor-pointer transition-all duration-300 ${
                        selectedTemplate === template.id 
                          ? 'border-green-500/50 bg-green-500/10' 
                          : 'border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20'
                      }`}
                      onClick={() => setSelectedTemplate(template.id)}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: 0.1 * index }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="font-medium text-white text-sm">{template.name}</div>
                      <div className="text-xs text-white/60 mt-1">{template.description}</div>
                      <div className="flex items-center gap-3 mt-2">
                        <div className="flex items-center gap-1">
                          <Bot className="w-3 h-3 text-green-400" />
                          <span className="text-xs text-white/60">{template.agents.length} agents</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-green-400" />
                          <span className="text-xs text-white/60">{template.estimated_duration}</span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </div>
          </div>

          {/* Enhanced Execution History */}
          {executionHistory.length > 0 && (
            <motion.div
              className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-6 mt-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1.0 }}
            >
              {/* Header with Filter Toggle */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white flex items-center gap-3">
                  <Clock className="w-6 h-6 text-blue-400" />
                  Execution History
                </h2>
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 rounded-lg text-blue-300 transition-colors"
                >
                  <BarChart3 className="w-4 h-4" />
                  {showFilters ? 'Hide Filters' : 'Show Filters'}
                </button>
              </div>

              {/* Advanced Filters */}
              {showFilters && (
                <motion.div
                  className="mb-6 p-4 bg-white/5 border border-white/10 rounded-lg"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Date Range Filter */}
                    <div>
                      <label className="block text-xs text-white/60 mb-2">Date Range</label>
                      <div className="space-y-2">
                        <input
                          type="date"
                          value={historyFilters.dateRange.start}
                          onChange={(e) => updateFilter('dateRange', { ...historyFilters.dateRange, start: e.target.value })}
                          className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-white text-xs focus:outline-none focus:border-blue-500/50"
                          placeholder="Start date"
                        />
                        <input
                          type="date"
                          value={historyFilters.dateRange.end}
                          onChange={(e) => updateFilter('dateRange', { ...historyFilters.dateRange, end: e.target.value })}
                          className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-white text-xs focus:outline-none focus:border-blue-500/50"
                          placeholder="End date"
                        />
                      </div>
                    </div>

                    {/* Status Filter */}
                    <div>
                      <label className="block text-xs text-white/60 mb-2">Status</label>
                      <select
                        value={historyFilters.status}
                        onChange={(e) => updateFilter('status', e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-white text-xs focus:outline-none focus:border-blue-500/50"
                      >
                        <option value="all" className="bg-gray-800">All Statuses</option>
                        <option value="completed" className="bg-gray-800">Completed</option>
                        <option value="running" className="bg-gray-800">Running</option>
                        <option value="failed" className="bg-gray-800">Failed</option>
                      </select>
                    </div>

                    {/* Agent Filter */}
                    <div>
                      <label className="block text-xs text-white/60 mb-2">Agent</label>
                      <select
                        value={historyFilters.agentFilter}
                        onChange={(e) => updateFilter('agentFilter', e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-white text-xs focus:outline-none focus:border-blue-500/50"
                      >
                        <option value="all" className="bg-gray-800">All Agents</option>
                        <option value="SLA Calculator" className="bg-gray-800">SLA Calculator</option>
                        <option value="Routing Optimization" className="bg-gray-800">Routing Optimization</option>
                        <option value="Settlement Analysis" className="bg-gray-800">Settlement Analysis</option>
                      </select>
                    </div>

                    {/* Sort Options */}
                    <div>
                      <label className="block text-xs text-white/60 mb-2">Sort By</label>
                      <div className="space-y-2">
                        <select
                          value={historyFilters.sortBy}
                          onChange={(e) => updateFilter('sortBy', e.target.value)}
                          className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-white text-xs focus:outline-none focus:border-blue-500/50"
                        >
                          <option value="created_at" className="bg-gray-800">Date Created</option>
                          <option value="name" className="bg-gray-800">Workflow Name</option>
                          <option value="total_duration" className="bg-gray-800">Duration</option>
                          <option value="status" className="bg-gray-800">Status</option>
                        </select>
                        <select
                          value={historyFilters.sortOrder}
                          onChange={(e) => updateFilter('sortOrder', e.target.value)}
                          className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-white text-xs focus:outline-none focus:border-blue-500/50"
                        >
                          <option value="desc" className="bg-gray-800">Newest First</option>
                          <option value="asc" className="bg-gray-800">Oldest First</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Clear Filters Button */}
                  <div className="mt-4 flex justify-end">
                    <button
                      onClick={() => setHistoryFilters({
                        dateRange: { start: '', end: '' },
                        status: 'all',
                        agentFilter: 'all',
                        sortBy: 'created_at',
                        sortOrder: 'desc'
                      })}
                      className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 rounded-lg text-red-300 text-xs transition-colors"
                    >
                      Clear Filters
                    </button>
                  </div>
                </motion.div>
              )}
              
              {/* Enhanced Execution History Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="text-left p-3 text-white/80 font-medium cursor-pointer hover:text-white transition-colors"
                          onClick={() => updateFilter('sortBy', 'name')}>
                        Workflow {historyFilters.sortBy === 'name' && (historyFilters.sortOrder === 'asc' ? '↑' : '↓')}
                      </th>
                      <th className="text-left p-3 text-white/80 font-medium cursor-pointer hover:text-white transition-colors"
                          onClick={() => updateFilter('sortBy', 'created_at')}>
                        Date {historyFilters.sortBy === 'created_at' && (historyFilters.sortOrder === 'asc' ? '↑' : '↓')}
                      </th>
                      <th className="text-left p-3 text-white/80 font-medium cursor-pointer hover:text-white transition-colors"
                          onClick={() => updateFilter('sortBy', 'status')}>
                        Status {historyFilters.sortBy === 'status' && (historyFilters.sortOrder === 'asc' ? '↑' : '↓')}
                      </th>
                      <th className="text-left p-3 text-white/80 font-medium cursor-pointer hover:text-white transition-colors"
                          onClick={() => updateFilter('sortBy', 'total_duration')}>
                        Duration {historyFilters.sortBy === 'total_duration' && (historyFilters.sortOrder === 'asc' ? '↑' : '↓')}
                      </th>
                      <th className="text-left p-3 text-white/80 font-medium">Agents</th>
                      <th className="text-left p-3 text-white/80 font-medium">Insights</th>
                      <th className="text-center p-3 text-white/80 font-medium">Details</th>
                    </tr>
                  </thead>
                  <tbody>
                    {getFilteredAndSortedHistory().slice(0, 10).map((execution, index) => (
                      <React.Fragment key={execution.workflow_id}>
                        <motion.tr
                          className="border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3, delay: 0.1 * index }}
                          onClick={() => toggleRowExpansion(execution.workflow_id)}
                        >
                          <td className="p-3 text-white">{execution.name}</td>
                          <td className="p-3 text-white/60">
                            <div>{execution.execution_date}</div>
                            <div className="text-xs text-white/40">
                              {new Date(execution.created_at).toLocaleTimeString()}
                            </div>
                          </td>
                          <td className="p-3">
                            <div className="flex items-center gap-2">
                              {getStatusIcon(execution.status)}
                              <span className="text-white/80 capitalize">{execution.status}</span>
                            </div>
                          </td>
                          <td className="p-3 text-white/60">
                            {execution.total_duration ? `${execution.total_duration}s` : 
                             execution.started_at && execution.completed_at 
                               ? `${Math.round((new Date(execution.completed_at).getTime() - new Date(execution.started_at).getTime()) / 1000)}s`
                               : '-'
                            }
                          </td>
                          <td className="p-3">
                            <div className="flex flex-wrap gap-1">
                              {(execution.agent_details || execution.steps)?.slice(0, 2).map((agent, i) => (
                                <span
                                  key={i}
                                  className="px-2 py-1 bg-blue-500/20 text-blue-300 rounded text-xs"
                                >
                                  {(agent as any)?.agent_name?.split(' ')[0] || 'Agent'}
                                </span>
                              ))}
                              {(execution.agent_details || execution.steps)?.length > 2 && (
                                <span className="px-2 py-1 bg-gray-500/20 text-gray-300 rounded text-xs">
                                  +{(execution.agent_details || execution.steps).length - 2}
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="p-3 text-white/60">
                            {execution.performance_metrics?.total_insights_generated || 
                             execution.results_summary?.insights_generated || '-'}
                          </td>
                          <td className="p-3 text-center">
                            <button className="text-blue-400 hover:text-blue-300 transition-colors">
                              {expandedRows.has(execution.workflow_id) ? '−' : '+'}
                            </button>
                          </td>
                        </motion.tr>
                        
                        {/* Expandable Row Details */}
                        {expandedRows.has(execution.workflow_id) && (
                          <motion.tr
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.3 }}
                          >
                            <td colSpan={7} className="p-0">
                              <div className="bg-white/5 border-t border-white/10 p-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                  {/* Performance Metrics */}
                                  {execution.performance_metrics && (
                                    <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
                                      <h4 className="text-sm font-medium text-blue-300 mb-2">Performance Metrics</h4>
                                      <div className="space-y-1 text-xs text-blue-200">
                                        <div>Success Rate: {execution.performance_metrics.success_rate}%</div>
                                        <div>Avg Duration: {execution.performance_metrics.avg_agent_duration}s</div>
                                        <div>Total Insights: {execution.performance_metrics.total_insights_generated}</div>
                                        <div>Errors: {execution.performance_metrics.error_count}</div>
                                      </div>
                                    </div>
                                  )}
                                  
                                  {/* Execution Environment */}
                                  {execution.execution_environment && (
                                    <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3">
                                      <h4 className="text-sm font-medium text-green-300 mb-2">Execution Environment</h4>
                                      <div className="space-y-1 text-xs text-green-200">
                                        <div>Template: {execution.execution_environment.template_used}</div>
                                        <div>Agents: {execution.execution_environment.agents_count}</div>
                                        <div>Mode: {execution.execution_environment.execution_mode}</div>
                                        <div>User: {execution.execution_environment.user_id}</div>
                                      </div>
                                    </div>
                                  )}
                                  
                                  {/* Agent Details */}
                                  {execution.agent_details && (
                                    <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-3">
                                      <h4 className="text-sm font-medium text-purple-300 mb-2">Agent Details</h4>
                                      <div className="space-y-2">
                                        {execution.agent_details.map((agent, i) => (
                                          <div key={i} className="text-xs text-purple-200">
                                            <div className="font-medium">{agent.agent_name}</div>
                                            <div className="text-purple-200/80">
                                              Duration: {agent.duration}s | Insights: {agent.insights_count}
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </td>
                          </motion.tr>
                        )}
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>
                
                {/* No Results Message */}
                {getFilteredAndSortedHistory().length === 0 && (
                  <div className="text-center text-white/40 text-sm py-8">
                    <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p>No executions match the current filters</p>
                    <button
                      onClick={() => setHistoryFilters({
                        dateRange: { start: '', end: '' },
                        status: 'all',
                        agentFilter: 'all',
                        sortBy: 'created_at',
                        sortOrder: 'desc'
                      })}
                      className="text-blue-400 hover:text-blue-300 text-xs mt-2 underline"
                    >
                      Clear all filters
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  )
}

export default AIWorkflows