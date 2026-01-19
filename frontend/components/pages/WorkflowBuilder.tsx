'use client'

import React, { useState, useCallback } from 'react'
import ReactFlow, {
  Node,
  Edge,
  addEdge,
  Connection,
  useNodesState,
  useEdgesState,
  Controls,
  Background,
  BackgroundVariant,
  MiniMap,
  Panel,
  Handle,
  Position,
} from 'reactflow'
import 'reactflow/dist/style.css'
import { motion } from 'framer-motion'
import { 
  ArrowLeft,
  Play,
  Save,
  Plus,
  Trash2,
  Database,
  Shield,
  DollarSign,
  Route,
  BarChart3,
  Zap,
  FileText,
  AlertCircle,
  TrendingUp,
  Calendar,
  Monitor,
  X,
  Settings2
} from 'lucide-react'

// Custom Node Component
const CustomNode = ({ data, selected }: any) => {
  const IconComponent = data.icon
  
  return (
    <div className={`px-4 py-3 shadow-lg rounded-lg bg-gray-800 border-2 min-w-[180px] relative ${
      selected ? 'border-green-400' : 'border-gray-600'
    }`}>
      {/* Input Handles */}
      {data.inputs?.map((input: string, idx: number) => (
        <Handle
          key={`input-${idx}`}
          type="target"
          position={Position.Left}
          id={`input-${idx}`}
          className="!w-3 !h-3 !border-2 !border-blue-600 !bg-blue-400 hover:!bg-blue-300 transition-colors"
          style={{
            top: `${35 + idx * 25}px`,
            left: '-6px'
          }}
        />
      ))}
      
      {/* Output Handles */}
      {data.outputs?.map((output: string, idx: number) => (
        <Handle
          key={`output-${idx}`}
          type="source"
          position={Position.Right}
          id={`output-${idx}`}
          className="!w-3 !h-3 !border-2 !border-green-600 !bg-green-400 hover:!bg-green-300 transition-colors"
          style={{
            top: `${35 + idx * 25}px`,
            right: '-6px'
          }}
        />
      ))}

      <div className="flex items-center gap-3 mb-2">
        <div className={`w-8 h-8 ${data.color} rounded-lg flex items-center justify-center`}>
          <IconComponent className="w-4 h-4 text-white" />
        </div>
        <div className="flex-1">
          <div className="text-white font-semibold text-sm">{data.label}</div>
          <div className="text-gray-400 text-xs">{data.type}</div>
        </div>
      </div>
      
      <div className="text-gray-300 text-xs mb-3">
        {data.description}
      </div>
      
      {/* Input/Output indicators */}
      <div className="flex justify-between items-center">
        <div className="flex flex-col gap-1">
          {data.inputs?.map((input: string, idx: number) => (
            <div key={`${input}-${idx}`} className="text-xs text-blue-400 flex items-center gap-1">
              <div className="w-2 h-2 bg-blue-400 rounded-full" />
              {input}
            </div>
          ))}
        </div>
        <div className="flex flex-col gap-1">
          {data.outputs?.map((output: string, idx: number) => (
            <div key={`${output}-${idx}`} className="text-xs text-green-400 flex items-center gap-1">
              <div className="w-2 h-2 bg-green-400 rounded-full" />
              {output}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

const nodeTypes = {
  custom: CustomNode,
}

interface WorkflowBuilderProps {
  onBack: () => void
  workflowId?: string | null
  isModal?: boolean
}

const WorkflowBuilder: React.FC<WorkflowBuilderProps> = ({ onBack, workflowId, isModal = false }) => {
  const [nodes, setNodes, onNodesChange] = useNodesState([])
  const [edges, setEdges, onEdgesChange] = useEdgesState([])
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null)

  // Available agent types - based on backend agents
  const availableAgents = [
    {
      type: 'data_classifier',
      name: 'Data Classifier',
      description: 'Classifies and categorizes incoming data',
      icon: Database,
      color: 'bg-blue-500',
      inputs: ['raw_data'],
      outputs: ['classified_data', 'metadata']
    },
    {
      type: 'sla_calculation_agent',
      name: 'SLA Calculator',
      description: 'Calculates and monitors SLA compliance',
      icon: BarChart3,
      color: 'bg-green-500',
      inputs: ['classified_data', 'transaction_data'],
      outputs: ['sla_metrics', 'compliance_status']
    },
    {
      type: 'routing_optimization_agent',
      name: 'Routing Optimizer',
      description: 'Optimizes payment routing decisions',
      icon: Route,
      color: 'bg-purple-500',
      inputs: ['classified_data', 'sla_metrics'],
      outputs: ['routing_decision', 'alternatives']
    },
    {
      type: 'cost_calculation_agent',
      name: 'Cost Calculator',
      description: 'Calculates processing costs and fees',
      icon: DollarSign,
      color: 'bg-yellow-500',
      inputs: ['classified_data', 'routing_decision'],
      outputs: ['cost_analysis', 'fee_breakdown']
    },
    {
      type: 'fraud_analysis_agent',
      name: 'Fraud Analyzer',
      description: 'Analyzes transactions for fraud patterns',
      icon: Shield,
      color: 'bg-red-500',
      inputs: ['classified_data', 'transaction_data'],
      outputs: ['risk_score', 'fraud_alerts']
    },
    {
      type: 'compliance_checker_agent',
      name: 'Compliance Checker',
      description: 'Ensures regulatory compliance',
      icon: AlertCircle,
      color: 'bg-orange-500',
      inputs: ['classified_data', 'routing_decision'],
      outputs: ['compliance_status', 'violations']
    },
    {
      type: 'performance_analysis_agent',
      name: 'Performance Analyzer',
      description: 'Analyzes system and transaction performance',
      icon: TrendingUp,
      color: 'bg-indigo-500',
      inputs: ['classified_data', 'sla_metrics'],
      outputs: ['performance_report', 'recommendations']
    },
    {
      type: 'document_processor',
      name: 'Document Processor',
      description: 'Processes and extracts information from documents',
      icon: FileText,
      color: 'bg-teal-500',
      inputs: ['document_data'],
      outputs: ['extracted_text', 'document_summary']
    },
    {
      type: 'settlement_analysis_agent',
      name: 'Settlement Analyzer',
      description: 'Analyzes settlement patterns and timing',
      icon: Calendar,
      color: 'bg-pink-500',
      inputs: ['classified_data', 'routing_decision'],
      outputs: ['settlement_analysis', 'timing_recommendations']
    },
    {
      type: 'settlement_analyzer_agent',
      name: 'Settlement Processor',
      description: 'Processes settlement transactions and reconciliation',
      icon: Calendar,
      color: 'bg-rose-500',
      inputs: ['settlement_data', 'routing_decision'],
      outputs: ['processed_settlements', 'reconciliation_report']
    },
    {
      type: 'ai_query_agent',
      name: 'AI Query Agent',
      description: 'Handles intelligent queries and data retrieval',
      icon: Database,
      color: 'bg-violet-500',
      inputs: ['query_data', 'context'],
      outputs: ['query_results', 'insights']
    },
    {
      type: 'data_ingestion',
      name: 'Data Ingestion',
      description: 'Ingests and processes raw data from various sources',
      icon: Database,
      color: 'bg-slate-500',
      inputs: ['raw_sources'],
      outputs: ['ingested_data', 'processing_status']
    },
    {
      type: 'workflow_orchestrator',
      name: 'Workflow Orchestrator',
      description: 'Orchestrates and manages workflow execution',
      icon: Settings2,
      color: 'bg-gray-500',
      inputs: ['workflow_config', 'agent_outputs'],
      outputs: ['orchestration_status', 'execution_results']
    },
    {
      type: 'dashboard_generator',
      name: 'Dashboard Generator',
      description: 'Generates analytics dashboards and reports',
      icon: Monitor,
      color: 'bg-cyan-500',
      inputs: ['performance_report', 'cost_analysis', 'sla_metrics'],
      outputs: ['dashboard_data', 'reports']
    }
  ]

  // Initialize with dummy workflow if workflowId is provided
  React.useEffect(() => {
    if (workflowId === 'wf_1') {
      // Load the "Payment Processing Pipeline" workflow
      const initialNodes: Node[] = [
        {
          id: '1',
          type: 'custom',
          position: { x: 100, y: 100 },
          data: {
            label: 'Data Classifier',
            type: 'data_classifier',
            description: 'Classifies incoming payment data',
            icon: Database,
            color: 'bg-blue-500',
            inputs: ['raw_data'],
            outputs: ['classified_data', 'metadata']
          }
        },
        {
          id: '2',
          type: 'custom',
          position: { x: 400, y: 50 },
          data: {
            label: 'SLA Calculator',
            type: 'sla_calculation_agent',
            description: 'Calculates SLA compliance',
            icon: BarChart3,
            color: 'bg-green-500',
            inputs: ['classified_data'],
            outputs: ['sla_metrics', 'compliance_status']
          }
        },
        {
          id: '3',
          type: 'custom',
          position: { x: 400, y: 200 },
          data: {
            label: 'Routing Optimizer',
            type: 'routing_optimization_agent',
            description: 'Optimizes routing decisions',
            icon: Route,
            color: 'bg-purple-500',
            inputs: ['classified_data', 'sla_metrics'],
            outputs: ['routing_decision', 'alternatives']
          }
        },
        {
          id: '4',
          type: 'custom',
          position: { x: 700, y: 125 },
          data: {
            label: 'Cost Calculator',
            type: 'cost_calculation_agent',
            description: 'Calculates processing costs',
            icon: DollarSign,
            color: 'bg-yellow-500',
            inputs: ['classified_data', 'routing_decision'],
            outputs: ['cost_analysis', 'fee_breakdown']
          }
        },
        {
          id: '5',
          type: 'custom',
          position: { x: 1000, y: 125 },
          data: {
            label: 'Dashboard Generator',
            type: 'dashboard_generator',
            description: 'Generates analytics dashboards',
            icon: Monitor,
            color: 'bg-cyan-500',
            inputs: ['cost_analysis', 'sla_metrics'],
            outputs: ['dashboard_data', 'reports']
          }
        }
      ]

      const initialEdges: Edge[] = [
        {
          id: 'e1-2',
          source: '1',
          target: '2',
          type: 'smoothstep',
          animated: true,
          style: { stroke: '#10b981' }
        },
        {
          id: 'e1-3',
          source: '1',
          target: '3',
          type: 'smoothstep',
          animated: true,
          style: { stroke: '#10b981' }
        },
        {
          id: 'e2-3',
          source: '2',
          target: '3',
          type: 'smoothstep',
          animated: true,
          style: { stroke: '#10b981' }
        },
        {
          id: 'e3-4',
          source: '3',
          target: '4',
          type: 'smoothstep',
          animated: true,
          style: { stroke: '#10b981' }
        },
        {
          id: 'e4-5',
          source: '4',
          target: '5',
          type: 'smoothstep',
          animated: true,
          style: { stroke: '#10b981' }
        },
        {
          id: 'e2-5',
          source: '2',
          target: '5',
          type: 'smoothstep',
          animated: true,
          style: { stroke: '#10b981' }
        }
      ]

      setNodes(initialNodes)
      setEdges(initialEdges)
    }
  }, [workflowId, setNodes, setEdges])

  const onNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
    event.stopPropagation()
    setSelectedNodeId(node.id)
  }, [])

  const onPaneClick = useCallback(() => {
    setSelectedNodeId(null)
  }, [])

  const selectedNode = selectedNodeId ? nodes.find(n => n.id === selectedNodeId) : null

  const onConnect = useCallback(
    (params: Connection) => {
      // Add validation to ensure proper connections
      const sourceNode = nodes.find(n => n.id === params.source)
      const targetNode = nodes.find(n => n.id === params.target)
      
      if (sourceNode && targetNode) {
        setEdges((eds) => addEdge({
          ...params,
          type: 'smoothstep',
          animated: true,
          style: { stroke: '#10b981', strokeWidth: 2 }
        }, eds))
      }
    },
    [setEdges, nodes]
  )

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault()
    event.dataTransfer.dropEffect = 'move'
  }, [])

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault()

      const reactFlowBounds = event.currentTarget.getBoundingClientRect()
      const agentType = event.dataTransfer.getData('application/reactflow')

      if (typeof agentType === 'undefined' || !agentType) {
        return
      }

      const agent = availableAgents.find(a => a.type === agentType)
      if (!agent) return

      const position = {
        x: event.clientX - reactFlowBounds.left - 90,
        y: event.clientY - reactFlowBounds.top - 50,
      }

      const newNode: Node = {
        id: `${agentType}_${Date.now()}`,
        type: 'custom',
        position,
        data: {
          label: agent.name,
          type: agent.type,
          description: agent.description,
          icon: agent.icon,
          color: agent.color,
          inputs: agent.inputs,
          outputs: agent.outputs
        }
      }

      setNodes((nds) => nds.concat(newNode))
    },
    [availableAgents, setNodes]
  )

  const onDragStart = (event: React.DragEvent<HTMLDivElement>, agentType: string) => {
    event.dataTransfer.setData('application/reactflow', agentType)
    event.dataTransfer.effectAllowed = 'move'
  }

  const clearWorkflow = () => {
    setNodes([])
    setEdges([])
  }

  const executeWorkflow = () => {
    // Simulate workflow execution
    console.log('Executing workflow with nodes:', nodes.length, 'edges:', edges.length)
  }

  return (
    <div className={`${isModal ? 'h-full' : 'min-h-screen'} bg-gradient-to-br from-gray-900 via-black to-gray-900 flex`}>
      {/* Left Sidebar - Agent Library */}
      <div className="w-80 bg-black/50 backdrop-blur-sm border-r border-white/10 p-6">
        <div className="flex items-center gap-3 mb-6">
          {!isModal && (
            <button
              onClick={onBack}
              className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
            >
              <ArrowLeft className="w-4 h-4 text-white" />
            </button>
          )}
          <h2 className="text-lg font-bold text-white">Agent Library</h2>
        </div>

        {/* Available Agents */}
        <div>
          <h3 className="text-sm font-semibold text-white/80 mb-3">Available Agents</h3>
          <div className="space-y-2">
            {availableAgents.map((agent) => (
              <div
                key={agent.type}
                draggable
                onDragStart={(event: React.DragEvent<HTMLDivElement>) => onDragStart(event, agent.type)}
                className="p-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg cursor-grab active:cursor-grabbing transition-colors"
              >
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="pointer-events-none"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 ${agent.color} rounded-lg flex items-center justify-center`}>
                      <agent.icon className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-white truncate">{agent.name}</div>
                      <div className="text-xs text-white/60 truncate">{agent.description}</div>
                    </div>
                  </div>
                </motion.div>
              </div>
            ))}
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-8 p-4 bg-white/5 rounded-lg border border-white/10">
          <h4 className="text-sm font-semibold text-white mb-2">Instructions</h4>
          <ul className="text-xs text-white/60 space-y-1">
            <li>• Drag agents from above to the canvas</li>
            <li>• Connect agents by dragging from blue/green handles</li>
            <li>• Blue handles = inputs, Green handles = outputs</li>
            <li>• Click nodes to view/edit properties</li>
            <li>• Move nodes by dragging them around</li>
          </ul>
        </div>
      </div>

      {/* Main Canvas Area */}
      <div className="flex-1 flex flex-col">
        {/* Top Toolbar */}
        <div className="bg-black/50 backdrop-blur-sm border-b border-white/10 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-xl font-bold text-white flex items-center gap-2">
                <Zap className="w-6 h-6 text-green-400" />
                {workflowId ? 'Edit Workflow' : 'Create New Workflow'}
              </h1>
              <div className="text-sm text-white/60">
                Drag agents to build your workflow, then connect them
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <motion.button
                onClick={clearWorkflow}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors flex items-center gap-2"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Trash2 className="w-4 h-4" />
                Clear
              </motion.button>
              
              <motion.button
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-2"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Save className="w-4 h-4" />
                Save
              </motion.button>
              
              <motion.button
                onClick={executeWorkflow}
                disabled={nodes.length === 0}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors flex items-center gap-2"
                whileHover={{ scale: nodes.length > 0 ? 1.05 : 1 }}
                whileTap={{ scale: nodes.length > 0 ? 0.95 : 1 }}
              >
                <Play className="w-4 h-4" />
                Execute
              </motion.button>
            </div>
          </div>
        </div>

        {/* React Flow Canvas */}
        <div className="flex-1" style={{ height: isModal ? 'calc(100% - 80px)' : 'calc(100vh - 160px)' }}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onDrop={onDrop}
            onDragOver={onDragOver}
            onNodeClick={onNodeClick}
            onPaneClick={onPaneClick}
            nodeTypes={nodeTypes}
            fitView
            className="bg-gray-900"
            connectionLineStyle={{ stroke: '#10b981', strokeWidth: 2 }}
            defaultEdgeOptions={{
              type: 'smoothstep',
              animated: true,
              style: { stroke: '#10b981', strokeWidth: 2 }
            }}
          >
            <Background 
              variant={BackgroundVariant.Dots} 
              gap={20} 
              size={1} 
              color="#374151" 
            />
            <Controls className="bg-gray-800 border-gray-600" />
            <MiniMap 
              className="bg-gray-800 border-gray-600"
              nodeColor="#374151"
              maskColor="rgba(0, 0, 0, 0.2)"
            />
            
            {/* Drop Zone Hint */}
            {nodes.length === 0 && (
              <Panel position="top-center">
                <div className="text-center text-white/40 pointer-events-none">
                  <Plus className="w-16 h-16 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Build Your Workflow</h3>
                  <p className="text-sm">Drag agents from the left panel to get started</p>
                  <p className="text-xs mt-2">Connect agents by dragging from outputs to inputs</p>
                </div>
              </Panel>
            )}
          </ReactFlow>
        </div>
      </div>

      {/* Right Sidebar - Node Properties */}
      {selectedNode && (
        <motion.div
          className="w-80 bg-black/50 backdrop-blur-sm border-l border-white/10 p-6"
          initial={{ x: 320, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 320, opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Settings2 className="w-5 h-5" />
              Node Properties
            </h2>
            <button
              onClick={() => setSelectedNodeId(null)}
              className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4 text-white" />
            </button>
          </div>

          {/* Node Details */}
          <div className="space-y-6">
            {/* Basic Info */}
            <div>
              <h3 className="text-sm font-semibold text-white/80 mb-3">Basic Information</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
                  <div className={`w-10 h-10 ${selectedNode.data.color} rounded-lg flex items-center justify-center`}>
                    <selectedNode.data.icon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className="font-medium text-white">{selectedNode.data.label}</div>
                    <div className="text-xs text-white/60">{selectedNode.data.type}</div>
                  </div>
                </div>
                <div className="p-3 bg-white/5 rounded-lg">
                  <div className="text-xs text-white/60 mb-1">Description</div>
                  <div className="text-sm text-white">{selectedNode.data.description}</div>
                </div>
              </div>
            </div>

            {/* Inputs */}
            <div>
              <h3 className="text-sm font-semibold text-white/80 mb-3">Input Parameters</h3>
              <div className="space-y-2">
                {selectedNode.data.inputs?.map((input: string, idx: number) => (
                  <div key={`input-${idx}`} className="flex items-center gap-2 p-2 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                    <div className="w-3 h-3 bg-blue-400 rounded-full" />
                    <span className="text-sm text-blue-300">{input}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Outputs */}
            <div>
              <h3 className="text-sm font-semibold text-white/80 mb-3">Output Parameters</h3>
              <div className="space-y-2">
                {selectedNode.data.outputs?.map((output: string, idx: number) => (
                  <div key={`output-${idx}`} className="flex items-center gap-2 p-2 bg-green-500/10 border border-green-500/20 rounded-lg">
                    <div className="w-3 h-3 bg-green-400 rounded-full" />
                    <span className="text-sm text-green-300">{output}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Configuration */}
            <div>
              <h3 className="text-sm font-semibold text-white/80 mb-3">Configuration</h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs text-white/60 mb-1">Agent Name</label>
                  <input
                    type="text"
                    value={selectedNode.data.label}
                    onChange={(e) => {
                      setNodes(nodes => nodes.map(node => 
                        node.id === selectedNodeId 
                          ? { ...node, data: { ...node.data, label: e.target.value } }
                          : node
                      ))
                    }}
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm focus:outline-none focus:border-green-400"
                  />
                </div>
                <div>
                  <label className="block text-xs text-white/60 mb-1">Description</label>
                  <textarea
                    value={selectedNode.data.description}
                    onChange={(e) => {
                      setNodes(nodes => nodes.map(node => 
                        node.id === selectedNodeId 
                          ? { ...node, data: { ...node.data, description: e.target.value } }
                          : node
                      ))
                    }}
                    rows={3}
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm focus:outline-none focus:border-green-400 resize-none"
                  />
                </div>
              </div>
            </div>

            {/* Actions */}
            <div>
              <h3 className="text-sm font-semibold text-white/80 mb-3">Actions</h3>
              <div className="space-y-2">
                <motion.button
                  onClick={() => {
                    setNodes(nodes => nodes.filter(node => node.id !== selectedNodeId))
                    setEdges(edges => edges.filter(edge => edge.source !== selectedNodeId && edge.target !== selectedNodeId))
                    setSelectedNodeId(null)
                  }}
                  className="w-full px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors flex items-center justify-center gap-2"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Trash2 className="w-4 h-4" />
                  Delete Node
                </motion.button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  )
}

export default WorkflowBuilder