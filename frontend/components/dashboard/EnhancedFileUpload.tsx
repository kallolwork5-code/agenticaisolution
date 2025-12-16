'use client';

import React, { useState, useCallback, useRef } from 'react';
import { Upload, FileText, CheckCircle, AlertCircle, Loader2, Eye, Brain, Database, Zap } from 'lucide-react';
import { useWebSocket } from '../../lib/hooks/useWebSocket';

interface UploadedFile {
  file_id: string;
  filename: string;
  size: number;
  type: string;
  status: string;
  websocket_url: string;
}

interface AgentUpdate {
  type: string;
  timestamp: string;
  agent: string;
  status: string;
  message: string;
  data?: any;
}

interface ClassificationResult {
  type: string;
  data_type: string;
  confidence: number;
  reasoning: string;
  method: string;
}

const EnhancedFileUpload: React.FC = () => {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [currentFileId, setCurrentFileId] = useState<string | null>(null);
  const [agentUpdates, setAgentUpdates] = useState<AgentUpdate[]>([]);
  const [classificationResult, setClassificationResult] = useState<ClassificationResult | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // WebSocket connection for real-time updates
  const { connectionStatus, lastMessage, messages } = useWebSocket(
    currentFileId ? `ws://localhost:8000/ws/upload/${currentFileId}` : null,
    {
      onMessage: (message) => {
        console.log('WebSocket message received:', message);
        
        if (message.type === 'agent_update') {
          setAgentUpdates(prev => [...prev, message as AgentUpdate]);
        } else if (message.type === 'classification_result') {
          setClassificationResult(message as ClassificationResult);
        }
      },
      onOpen: () => {
        console.log('WebSocket connected');
      },
      onClose: () => {
        console.log('WebSocket disconnected');
      }
    }
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileUpload(files[0]);
    }
  }, []);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileUpload(files[0]);
    }
  }, []);

  const handleFileUpload = async (file: File) => {
    setIsUploading(true);
    setAgentUpdates([]);
    setClassificationResult(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/enhanced-upload/upload', {
        method: 'POST',
        body: formData,
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}` // Assuming JWT token
        }
      });

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
      }

      const result = await response.json();
      
      // Set up WebSocket connection for this file
      setCurrentFileId(result.file_id);
      
      // Add to uploaded files list
      const uploadedFile: UploadedFile = {
        file_id: result.file_id,
        filename: result.filename,
        size: file.size,
        type: file.type,
        status: result.status,
        websocket_url: result.websocket_url
      };
      
      setUploadedFiles(prev => [uploadedFile, ...prev]);

    } catch (error) {
      console.error('Upload error:', error);
      alert(`Upload failed: ${error}`);
    } finally {
      setIsUploading(false);
    }
  };

  const getAgentIcon = (agentName: string) => {
    if (agentName.includes('Validator')) return <CheckCircle className="w-4 h-4" />;
    if (agentName.includes('Parser')) return <FileText className="w-4 h-4" />;
    if (agentName.includes('Deduplication')) return <Eye className="w-4 h-4" />;
    if (agentName.includes('AI') || agentName.includes('Classification')) return <Brain className="w-4 h-4" />;
    if (agentName.includes('Ingestion')) return <Database className="w-4 h-4" />;
    return <Zap className="w-4 h-4" />;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600';
      case 'processing': return 'text-blue-600';
      case 'error': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Upload Area */}
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          isDragging
            ? 'border-blue-400 bg-blue-50'
            : 'border-gray-300 hover:border-gray-400'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Upload your data file
        </h3>
        <p className="text-gray-600 mb-4">
          Drag and drop your file here, or click to browse
        </p>
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
        >
          {isUploading ? (
            <>
              <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
              Processing...
            </>
          ) : (
            'Select File'
          )}
        </button>
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          onChange={handleFileSelect}
          accept=".csv,.xlsx,.xls,.json,.pdf,.docx"
        />
      </div>

      {/* Real-time Processing Updates */}
      {agentUpdates.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Processing Pipeline
          </h3>
          <div className="space-y-3">
            {agentUpdates.map((update, index) => (
              <div key={index} className="flex items-start space-x-3">
                <div className={`flex-shrink-0 ${getStatusColor(update.status)}`}>
                  {update.status === 'processing' ? (
                    <Loader2 className="animate-spin w-4 h-4" />
                  ) : (
                    getAgentIcon(update.agent)
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-gray-900">
                      {update.agent}
                    </span>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      update.status === 'completed' ? 'bg-green-100 text-green-800' :
                      update.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                      update.status === 'error' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {update.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    {update.message}
                  </p>
                  {update.data && (
                    <div className="mt-2 text-xs text-gray-500">
                      <pre className="bg-gray-50 p-2 rounded text-xs overflow-x-auto">
                        {JSON.stringify(update.data, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
                <div className="text-xs text-gray-400">
                  {new Date(update.timestamp).toLocaleTimeString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Classification Results */}
      {classificationResult && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            AI Classification Results
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="text-sm font-medium text-blue-900">Data Type</div>
              <div className="text-lg font-semibold text-blue-700">
                {classificationResult.data_type}
              </div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="text-sm font-medium text-green-900">Confidence</div>
              <div className="text-lg font-semibold text-green-700">
                {(classificationResult.confidence * 100).toFixed(1)}%
              </div>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <div className="text-sm font-medium text-purple-900">Method</div>
              <div className="text-lg font-semibold text-purple-700">
                {classificationResult.method}
              </div>
            </div>
          </div>
          <div className="mt-4">
            <div className="text-sm font-medium text-gray-900 mb-2">Reasoning</div>
            <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
              {classificationResult.reasoning}
            </p>
          </div>
        </div>
      )}

      {/* Upload History */}
      {uploadedFiles.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Recent Uploads
          </h3>
          <div className="space-y-3">
            {uploadedFiles.map((file) => (
              <div key={file.file_id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <FileText className="w-5 h-5 text-gray-400" />
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {file.filename}
                    </div>
                    <div className="text-xs text-gray-500">
                      {(file.size / 1024).toFixed(1)} KB
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    file.status === 'success' ? 'bg-green-100 text-green-800' :
                    file.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {file.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* WebSocket Connection Status */}
      <div className="text-xs text-gray-500 text-center">
        WebSocket: {connectionStatus} | Messages: {messages.length}
      </div>
    </div>
  );
};

export default EnhancedFileUpload;