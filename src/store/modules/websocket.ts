import { defineStore } from 'pinia'
import { createWebSocket, WebSocketMessage } from '@/utils/webSocket'

/**
 * WebSocket连接配置接口
 * @interface WebSocketConnection
 * @property {any} ws - WebSocket实例
 * @property {boolean} isConnected - 连接状态
 * @property {Map<string, (data: WebSocketMessage) => void>} messageHandlers - 消息处理器映射表
 * @property {number} reconnectAttempts - 当前重连次数
 * @property {number} maxReconnectAttempts - 最大重连次数
 * @property {number} reconnectInterval - 重连间隔(毫秒)
 */
interface WebSocketConnection {
  ws: any
  isConnected: boolean
  messageHandlers: Map<string, (data: WebSocketMessage) => void>
  reconnectAttempts: number
  maxReconnectAttempts: number
  reconnectInterval: number
}

/**
 * WebSocket状态接口
 * @interface WebSocketState
 * @property {Map<string, WebSocketConnection>} connections - WebSocket连接映射表，key为服务器标识
 */
interface WebSocketState {
  connections: Map<string, WebSocketConnection>
}

/**
 * WebSocket状态管理Store
 * 支持多服务器连接管理，自动重连，消息分发等功能
 */
export const useWebSocketStore = defineStore('websocket', {
  state: (): WebSocketState => ({
    connections: new Map()
  }),

  actions: {
    /**
     * 初始化特定服务器的WebSocket连接
     * @param {string} serverKey - 服务器唯一标识
     * @param {string} url - WebSocket服务器地址
     * @param {Object} options - 连接配置选项
     * @param {number} [options.maxReconnectAttempts=5] - 最大重连次数
     * @param {number} [options.reconnectInterval=3000] - 重连间隔(毫秒)
     */
    initWebSocket(
      serverKey: string,
      url: string,
      options: {
        maxReconnectAttempts?: number
        reconnectInterval?: number
      } = {}
    ) {
      const { maxReconnectAttempts = 5, reconnectInterval = 3000 } = options

      // 如果连接已存在，直接返回
      if (this.connections.has(serverKey)) {
        return
      }

      // 创建新的连接配置
      const connection: WebSocketConnection = {
        ws: null,
        isConnected: false,
        messageHandlers: new Map(),
        reconnectAttempts: 0,
        maxReconnectAttempts,
        reconnectInterval
      }

      // 连接函数
      const connect = () => {
        connection.ws = createWebSocket(url)
        connection.ws.connect()

        // 消息处理
        connection.ws.onMessage = (data: any) => {
          // 触发注册的消息处理器
          const handler = connection.messageHandlers.get(data.type)
          if (handler) {
            handler(data)
          }
        }

        // 连接成功处理
        connection.ws.onOpen = () => {
          connection.isConnected = true
          connection.reconnectAttempts = 0
        }

        // 连接关闭处理
        connection.ws.onClose = () => {
          connection.isConnected = false
          connection.ws = null

          // 自动重连逻辑
          if (connection.reconnectAttempts < connection.maxReconnectAttempts) {
            connection.reconnectAttempts++
            setTimeout(() => {
              connect()
            }, connection.reconnectInterval)
          }
        }
      }

      connect()
      this.connections.set(serverKey, connection)
    },

    /**
     * 为特定服务器注册消息处理器
     * @param {string} serverKey - 服务器标识
     * @param {string} type - 消息类型
     * @param {Function} handler - 消息处理函数
     */
    registerMessageHandler(
      serverKey: string,
      type: string,
      handler: (data: WebSocketMessage) => void
    ) {
      const connection = this.connections.get(serverKey)
      if (connection) {
        connection.messageHandlers.set(type, handler)
      }
    },

    /**
     * 移除特定服务器的消息处理器
     * @param {string} serverKey - 服务器标识
     * @param {string} type - 消息类型
     */
    removeMessageHandler(serverKey: string, type: string) {
      const connection = this.connections.get(serverKey)
      if (connection) {
        connection.messageHandlers.delete(type)
      }
    },

    /**
     * 关闭特定服务器的WebSocket连接
     * @param {string} serverKey - 服务器标识
     */
    closeWebSocket(serverKey: string) {
      const connection = this.connections.get(serverKey)
      if (connection && connection.ws) {
        connection.ws.close()
        connection.ws = null
        connection.isConnected = false
        this.connections.delete(serverKey)
      }
    },

    /**
     * 关闭所有WebSocket连接
     */
    closeAllWebSockets() {
      this.connections.forEach((connection, serverKey) => {
        this.closeWebSocket(serverKey)
      })
    },

    /**
     * 获取特定服务器的连接状态
     * @param {string} serverKey - 服务器标识
     * @returns {boolean} 连接状态
     */
    isConnected(serverKey: string): boolean {
      const connection = this.connections.get(serverKey)
      return connection?.isConnected || false
    }
  }
})
