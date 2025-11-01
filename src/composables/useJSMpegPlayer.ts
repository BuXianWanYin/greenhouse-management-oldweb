import { ref, onUnmounted } from 'vue'

declare global {
  interface Window {
    JSMpeg: any
  }
}

export function useJSMpegPlayer() {
  const player = ref<any>(null)
  const isLoaded = ref(false)
  const error = ref<string | null>(null)

  // 动态加载 JSMpeg 脚本
  function loadJSMpegScript(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (window.JSMpeg) {
        isLoaded.value = true
        resolve()
        return
      }
      const script = document.createElement('script')
      script.src = '/jsmpeg/jsmpeg.min.js'
      script.onload = () => {
        isLoaded.value = true
        resolve()
      }
      script.onerror = () => {
        error.value = 'JSMpeg 脚本加载失败'
        reject(new Error('JSMpeg 脚本加载失败'))
      }
      document.body.appendChild(script)
    })
  }

  // 创建播放器
  async function createPlayer(wsUrl: string, canvas: HTMLCanvasElement) {
    await loadJSMpegScript()
    if (!window.JSMpeg) {
      error.value = 'JSMpeg 未加载'
      return
    }
    player.value = new window.JSMpeg.Player(wsUrl, {
      canvas,
      autoplay: true,
      audio: false,
      loop: true
    })
    ;(window as any)._jsmpegPlayer = player.value // 方便全局调试
  }

  // 销毁播放器
  function destroyPlayer() {
    if (player.value && typeof player.value.destroy === 'function') {
      player.value.destroy()
    }
    player.value = null
  }

  onUnmounted(() => {
    destroyPlayer()
  })

  return {
    player,
    isLoaded,
    error,
    createPlayer,
    destroyPlayer
  }
}