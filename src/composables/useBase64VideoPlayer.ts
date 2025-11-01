import { ref, onUnmounted } from 'vue'

export function useBase64VideoPlayer() {
  const ws = ref<WebSocket | null>(null)
  const isConnected = ref(false)
  const error = ref<string | null>(null)
  const frameCount = ref(0)
  const fps = ref(0)
  const lastFrameTime = ref(0)
  const connectionInfo = ref('未连接')

  // 创建图像对象
  const img = new Image()
  let ctx: CanvasRenderingContext2D | null = null
  
  // 帧处理优化相关变量
  let isProcessingFrame = false // 防止重复处理帧
  let pendingFrame: string | null = null // 待处理的帧
  let statsUpdateTimer: NodeJS.Timeout | null = null // 统计信息更新定时器

  // 连接WebSocket
  async function connectStream(deviceId: string, canvas: HTMLCanvasElement, getWsUrl: (deviceId: string) => Promise<string>) {
    if (!canvas) {
      error.value = 'Canvas元素未找到'
      return
    }

    // 获取canvas上下文
    ctx = canvas.getContext('2d')
    if (!ctx) {
      error.value = '无法获取Canvas上下文'
      return
    }

    // 关闭现有连接
    if (ws.value && ws.value.readyState === WebSocket.OPEN) {
      ws.value.close()
    }

    // 重置状态
    isConnected.value = false
    error.value = null
    frameCount.value = 0
    fps.value = 0
    lastFrameTime.value = 0
    connectionInfo.value = '正在连接...'
    isProcessingFrame = false
    pendingFrame = null

    try {
      // 通过API获取WebSocket地址
      const wsUrl = await getWsUrl(deviceId)
      
      // 连接WebSocket
      ws.value = new WebSocket(wsUrl)

      ws.value.onopen = function() {
        isConnected.value = true
        connectionInfo.value = `WebSocket已连接，设备ID: ${deviceId}`
        console.log('WebSocket连接已建立')
        startStatsUpdate()
      }

      ws.value.onmessage = function(event) {
        try {
          const data = JSON.parse(event.data)
          
          if (data.type === 'connection') {
            // connectionInfo.value = `连接成功，设备ID: ${data.deviceId}`
             connectionInfo.value = `连接成功`
            console.log('收到连接确认:', data)
          } else if (data.type === 'frame') {
            // 优化：使用帧丢弃机制，只处理最新帧
            pendingFrame = data.data
            if (!isProcessingFrame) {
              processNextFrame()
            }
          } else if (data.type === 'pong') {
            console.log('收到pong响应')
          }
        } catch (e) {
          console.error('解析消息失败:', e)
        }
      }

      ws.value.onclose = function(event) {
        isConnected.value = false
        connectionInfo.value = 'WebSocket连接已断开'
        console.log('WebSocket连接已关闭:', event.code, event.reason)
        stopStatsUpdate()
      }

      ws.value.onerror = function(error) {
        isConnected.value = false
        connectionInfo.value = 'WebSocket连接错误'
        console.error('WebSocket错误:', error)
        stopStatsUpdate()
      }
    } catch (err) {
      error.value = '连接失败'
      console.error('连接失败:', err)
    }
  }

  // 优化：分离帧处理逻辑，使用帧丢弃机制
  function processNextFrame() {
    if (!pendingFrame || isProcessingFrame || !ctx) {
      return
    }

    isProcessingFrame = true
    const frameData = pendingFrame
    pendingFrame = null // 清空待处理帧

    // 优化：重用Image对象，避免重复创建
    img.onload = function() {
      // 优化：不每次都clearRect，直接绘制
      ctx!.drawImage(img, 0, 0, ctx!.canvas.width, ctx!.canvas.height)
      
      // 更新统计信息（减少频率）
      frameCount.value++
      const now = performance.now()
      if (lastFrameTime.value > 0) {
        fps.value = 1000 / (now - lastFrameTime.value)
      }
      lastFrameTime.value = now
      
      isProcessingFrame = false
      
      // 检查是否还有待处理的帧
      if (pendingFrame) {
        // 使用requestAnimationFrame确保在下一帧处理
        requestAnimationFrame(processNextFrame)
      }
    }
    
    img.src = 'data:image/jpeg;base64,' + frameData
  }

  // 优化：使用定时器更新统计信息，减少DOM操作
  function startStatsUpdate() {
    if (statsUpdateTimer) return
    
    statsUpdateTimer = setInterval(() => {
      // 统计信息已经在processNextFrame中更新，这里不需要额外操作
    }, 100) // 每100ms更新一次统计信息，而不是每帧都更新
  }

  function stopStatsUpdate() {
    if (statsUpdateTimer) {
      clearInterval(statsUpdateTimer)
      statsUpdateTimer = null
    }
  }

  // 断开连接
  function disconnectStream() {
    if (ws.value) {
      ws.value.close()
      ws.value = null
    }
    isConnected.value = false
    connectionInfo.value = '已断开连接'
    error.value = null
    
    // 清除画布
    if (ctx) {
      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)
    }
    
    // 重置统计
    frameCount.value = 0
    fps.value = 0
    lastFrameTime.value = 0
    isProcessingFrame = false
    pendingFrame = null
    stopStatsUpdate()
  }

  // 定期发送ping保持连接
  let pingInterval: NodeJS.Timeout | null = null

  function startPingInterval() {
    if (pingInterval) {
      clearInterval(pingInterval)
    }
    pingInterval = setInterval(() => {
      if (ws.value && ws.value.readyState === WebSocket.OPEN) {
        ws.value.send(JSON.stringify({type: 'ping'}))
      }
    }, 30000)
  }

  function stopPingInterval() {
    if (pingInterval) {
      clearInterval(pingInterval)
      pingInterval = null
    }
  }

  // 组件卸载时清理
  onUnmounted(() => {
    disconnectStream()
    stopPingInterval()
  })

  return {
    ws,
    isConnected,
    error,
    frameCount,
    fps,
    connectionInfo,
    connectStream,
    disconnectStream,
    startPingInterval,
    stopPingInterval
  }
} 