import { WebSocketManager } from '../lib/services/websocket-manager'
import { WebSocketMessage } from '../lib/types/visualization'

// Mock WebSocket
class MockWebSocket {
  static CONNECTING = 0
  static OPEN = 1
  static CLOSING = 2
  static CLOSED = 3

  readyState = MockWebSocket.CONNECTING
  onopen: ((event: Event) => void) | null = null
  onclose: ((event: CloseEvent) => void) | null = null
  onmessage: ((event: MessageEvent) => void) | null = null
  onerror: ((event: Event) => void) | null = null

  constructor(public url: string) {
    // Simulate async connection
    setTimeout(() => {
      this.readyState = MockWebSocket.OPEN
      if (this.onopen) {
        this.onopen(new Event('open'))
      }
    }, 10)
  }

  send(data: string) {
    if (this.readyState !== MockWebSocket.OPEN) {
      throw new Error('WebSocket is not open')
    }
  }

  close(code?: number, reason?: string) {
    this.readyState = MockWebSocket.CLOSED
    if (this.onclose) {
      this.onclose(new CloseEvent('close', { code, reason, wasClean: true }))
    }
  }

  // Helper method to simulate receiving a message
  simulateMessage(data: any) {
    if (this.onmessage) {
      this.onmessage(new MessageEvent('message', { data: JSON.stringify(data) }))
    }
  }

  // Helper method to simulate an error
  simulateError() {
    if (this.onerror) {
      this.onerror(new Event('error'))
    }
  }
}

// Replace global WebSocket with mock
global.WebSocket = MockWebSocket as any

describe('WebSocketManager', () => {
  let wsManager: WebSocketManager

  beforeEach(() => {
    wsManager = new WebSocketManager('ws://localhost:8000/test')
  })

  afterEach(() => {
    wsManager.disconnect()
  })

  describe('connection', () => {
    it('should connect successfully', async () => {
      await expect(wsManager.connect()).resolves.toBeUndefined()
      expect(wsManager.isConnected).toBe(true)
    })

    it('should handle connection status changes', async () => {
      const statusHandler = jest.fn()
      wsManager.onConnectionStatus(statusHandler)

      await wsManager.connect()

      expect(statusHandler).toHaveBeenCalledWith({
        connected: true,
        reconnecting: false,
        lastConnected: expect.any(Date)
      })
    })

    it('should disconnect cleanly', async () => {
      await wsManager.connect()
      expect(wsManager.isConnected).toBe(true)

      wsManager.disconnect()
      expect(wsManager.isConnected).toBe(false)
    })
  })

  describe('message handling', () => {
    it('should receive and parse messages correctly', async () => {
      const messageHandler = jest.fn()
      wsManager.subscribe('processing_event', messageHandler)

      await wsManager.connect()

      const testMessage: WebSocketMessage = {
        type: 'processing_event',
        payload: { fileId: 'test-file', agentId: 'test-agent' },
        timestamp: new Date()
      }

      // Simulate receiving a message
      const ws = (wsManager as any).ws as MockWebSocket
      ws.simulateMessage(testMessage)

      expect(messageHandler).toHaveBeenCalledWith({
        ...testMessage,
        timestamp: expect.any(Date)
      })
    })

    it('should handle multiple subscribers for the same event type', async () => {
      const handler1 = jest.fn()
      const handler2 = jest.fn()
      
      wsManager.subscribe('processing_event', handler1)
      wsManager.subscribe('processing_event', handler2)

      await wsManager.connect()

      const testMessage: WebSocketMessage = {
        type: 'processing_event',
        payload: { test: 'data' },
        timestamp: new Date()
      }

      const ws = (wsManager as any).ws as MockWebSocket
      ws.simulateMessage(testMessage)

      expect(handler1).toHaveBeenCalled()
      expect(handler2).toHaveBeenCalled()
    })

    it('should allow unsubscribing from events', async () => {
      const messageHandler = jest.fn()
      const unsubscribe = wsManager.subscribe('processing_event', messageHandler)

      await wsManager.connect()

      // Unsubscribe before sending message
      unsubscribe()

      const testMessage: WebSocketMessage = {
        type: 'processing_event',
        payload: { test: 'data' },
        timestamp: new Date()
      }

      const ws = (wsManager as any).ws as MockWebSocket
      ws.simulateMessage(testMessage)

      expect(messageHandler).not.toHaveBeenCalled()
    })
  })

  describe('sending messages', () => {
    it('should send messages when connected', async () => {
      await wsManager.connect()
      
      const ws = (wsManager as any).ws as MockWebSocket
      const sendSpy = jest.spyOn(ws, 'send')

      const testData = { type: 'test', payload: 'data' }
      wsManager.send(testData)

      expect(sendSpy).toHaveBeenCalledWith(JSON.stringify(testData))
    })

    it('should not send messages when disconnected', () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation()
      
      const testData = { type: 'test', payload: 'data' }
      wsManager.send(testData)

      expect(consoleSpy).toHaveBeenCalledWith(
        'WebSocket not connected, message not sent:',
        testData
      )

      consoleSpy.mockRestore()
    })
  })

  describe('error handling', () => {
    it('should handle connection errors', async () => {
      const statusHandler = jest.fn()
      wsManager.onConnectionStatus(statusHandler)

      // Mock WebSocket to simulate immediate error
      const originalWebSocket = global.WebSocket
      global.WebSocket = class extends MockWebSocket {
        constructor(url: string) {
          super(url)
          setTimeout(() => this.simulateError(), 5)
        }
      } as any

      await expect(wsManager.connect()).rejects.toBeDefined()

      expect(statusHandler).toHaveBeenCalledWith({
        connected: false,
        reconnecting: false,
        error: 'Connection error'
      })

      global.WebSocket = originalWebSocket
    })

    it('should handle malformed messages gracefully', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation()
      
      await wsManager.connect()

      const ws = (wsManager as any).ws as MockWebSocket
      if (ws.onmessage) {
        ws.onmessage(new MessageEvent('message', { data: 'invalid json' }))
      }

      expect(consoleSpy).toHaveBeenCalledWith(
        'Failed to parse WebSocket message:',
        expect.any(Error)
      )

      consoleSpy.mockRestore()
    })
  })

  describe('reconnection', () => {
    it('should attempt reconnection on unexpected disconnect', async () => {
      const statusHandler = jest.fn()
      wsManager.onConnectionStatus(statusHandler)

      await wsManager.connect()

      // Simulate unexpected disconnect
      const ws = (wsManager as any).ws as MockWebSocket
      if (ws.onclose) {
        ws.onclose(new CloseEvent('close', { code: 1006, reason: 'Abnormal closure', wasClean: false }))
      }

      expect(statusHandler).toHaveBeenCalledWith({
        connected: false,
        reconnecting: true
      })
    })
  })
})