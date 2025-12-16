/**
 * WebSocket service for real-time progress tracking and agentic updates
 */

export interface AgentUpdate {
  type: 'agent_update' | 'classification_result' | 'ingestion_result' | 'connection_established' | 'heartbeat'
  timestamp: string
  file_id: string
  agent?: string
  status?: 'starting' | 'processing' | 'completed' | 'error'
  message?: string
  data?: any
  data_type?: string
  confidence?: number
  reasoning?: string
  method?: string
}

export interface ProgressCallback {
  (update: AgentUpdate): void
}

export class WebSocketService {
  private ws: WebSocket | null = null
  private fileId: string
  private callbacks: Set<ProgressCallback> = new Set()
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private reconnectDelay = 1000
  private isConnecting = false

  constructor(fileId: string) {
    this.fileId = fileId
  }

  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        resolve()
        return
      }

      if (this.isConnecting) {
        return
      }

      this.isConnecting = true
      
      try {
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
        const host = window.location.hostname
        const port = process.env.NODE_ENV === 'development' ? '8000' : window.location.port
        const wsUrl = `${protocol}//${host}:${port}/ws/upload/${this.fileId}`
        
        console.log(`Connecting to WebSocket: ${wsUrl}`)
        
        this.ws = new WebSocket(wsUrl)

        this.ws.onopen = () => {
          console.log(`WebSocket connected for file ${this.fileId}`)
          this.isConnecting = false
          this.reconnectAttempts = 0
          
          // Send ping to confirm connection
          this.send('ping')
          resolve()
        }

        this.ws.onmessage = (event) => {
          try {
            const update: AgentUpdate = JSON.parse(event.data)
            console.log('WebSocket update received:', update)
            
            // Notify all callbacks
            this.callbacks.forEach(callback => {
              try {
                callback(update)
              } catch (error) {
                console.error('Error in WebSocket callback:', error)
              }
            })
          } catch (error) {
            console.error('Error parsing WebSocket message:', error)
          }
        }

        this.ws.onclose = (event) => {
          console.log(`WebSocket closed for file ${this.fileId}:`, event.code, event.reason)
          this.isConnecting = false
          this.ws = null
          
          // Attempt to reconnect if not a normal closure
          if (event.code !== 1000 && this.reconnectAttempts < this.maxReconnectAttempts) {
            this.scheduleReconnect()
          }
        }

        this.ws.onerror = (error) => {
          console.error(`WebSocket error for file ${this.fileId}:`, error)
          this.isConnecting = false
          
          if (this.reconnectAttempts === 0) {
            reject(new Error('Failed to connect to WebSocket'))
          }
        }

      } catch (error) {
        this.isConnecting = false
        reject(error)
      }
    })
  }

  private scheduleReconnect() {
    this.reconnectAttempts++
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1) // Exponential backoff
    
    console.log(`Scheduling WebSocket reconnect attempt ${this.reconnectAttempts} in ${delay}ms`)
    
    setTimeout(() => {
      if (this.reconnectAttempts <= this.maxReconnectAttempts) {
        this.connect().catch(error => {
          console.error('Reconnect failed:', error)
        })
      }
    }, delay)
  }

  addCallback(callback: ProgressCallback) {
    this.callbacks.add(callback)
  }

  removeCallback(callback: ProgressCallback) {
    this.callbacks.delete(callback)
  }

  send(message: string) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(message)
    }
  }

  disconnect() {
    if (this.ws) {
      this.ws.close(1000, 'Client disconnect')
      this.ws = null
    }
    this.callbacks.clear()
  }

  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN
  }
}

export default WebSocketService