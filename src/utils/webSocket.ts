import { ref } from 'vue'

// 定义WebSocket消息类型
export interface WebSocketMessage {
  id: string
  type: string
  content: string
}

// 定义WebSocket配置选项
interface WebSocketOptions {
  maxReconnectAttempts?: number
  reconnectInterval?: number
  heartbeatInterval?: number
}

export class WebSocketClient {
  private ws: WebSocket | null = null
  private url: string
  private reconnectAttempts = 0
  private maxReconnectAttempts: number
  private reconnectInterval: number
  private heartbeatInterval: number | null = null
  private messageQueue: string[] = []
  private options: WebSocketOptions

  public isConnected = ref(false)
  public onMessage: ((data: WebSocketMessage) => void) | null = null
  public onError: ((error: Event) => void) | null = null
  public onClose: (() => void) | null = null
  

  constructor(url: string, options: WebSocketOptions = {}) {
    this.url = url
    this.options = options
    this.maxReconnectAttempts = options.maxReconnectAttempts || 5
    this.reconnectInterval = options.reconnectInterval || 3000
  }

  connect() {
    try {
      this.ws = new WebSocket(this.url)
      this.setupEventListeners()
    } catch (error) {
      console.error('WebSocket连接失败:', error)
      this.handleError(error as Event)
    }
  }

  private setupEventListeners() {
    if (!this.ws) return

    this.ws.onopen = () => {
      console.log('WebSocket连接成功')
      this.isConnected.value = true
      this.reconnectAttempts = 0
      this.startHeartbeat()
      this.flushMessageQueue()
    }

    this.ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data) as WebSocketMessage
        if (this.onMessage) {
          this.onMessage(data)
        }
      } catch (error) {
        console.error('消息解析失败:', error)
        this.handleError(error as Event)
      }
    }

    this.ws.onerror = (error) => {
      console.error('WebSocket错误:', error)
      this.handleError(error)
    }

    this.ws.onclose = () => {
      console.log('WebSocket连接关闭')
      this.isConnected.value = false
      this.stopHeartbeat()
      if (this.onClose) {
        this.onClose()
      }
      this.reconnect()
    }
  }

  private handleError(error: Event) {
    if (this.onError) {
      this.onError(error)
    }
  }

  private reconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++
      console.log(`尝试重新连接 (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`)
      setTimeout(() => {
        this.connect()
      }, this.reconnectInterval)
    } else {
      console.error('达到最大重连次数，停止重连')
    }
  }

  private startHeartbeat() {
    this.heartbeatInterval = window.setInterval(() => {
      this.send({
        id: 'heartbeat',
        type: 'heartbeat',
        content: 'ping'
      })
    }, 30000) // 每30秒发送一次心跳
  }

  private stopHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval)
      this.heartbeatInterval = null
    }
  }

  send(data: WebSocketMessage | string) {
    const message = typeof data === 'string' ? data : JSON.stringify(data)
    
    if (this.isConnected.value && this.ws?.readyState === WebSocket.OPEN) {
      try {
        this.ws.send(message)
      } catch (error) {
        console.error('发送消息失败:', error)
        this.messageQueue.push(message)
        this.handleError(error as Event)
      }
    } else {
      console.log('WebSocket未连接，消息已加入队列')
      this.messageQueue.push(message)
    }
  }

  private flushMessageQueue() {
    while (this.messageQueue.length > 0) {
      const message = this.messageQueue.shift()
      if (message) {
        this.send(message)
      }
    }
  }

  close() {
    if (this.ws) {
      this.ws.close()
      this.ws = null
    }
    this.stopHeartbeat()
    this.isConnected.value = false
  }
}

// 创建WebSocket实例
export const createWebSocket = (url: string) => {
  return new WebSocketClient(url)
}