<template>
  <el-config-provider :size="elSize" :locale="locales[language]" :z-index="3000">
    <router-view></router-view>
  </el-config-provider>
</template>

<script setup lang="ts">
import { useUserStore } from './store/modules/user'
import zh from 'element-plus/es/locale/lang/zh-cn'
import en from 'element-plus/es/locale/lang/en'
import { initState, saveUserData } from './utils/storage'
import event from '@/utils/event'
import { useMqttStore } from '@/store/modules/mqttStore'

const userStore = useUserStore()
const mqttStore = useMqttStore()
const language = computed(() => userStore.language)
const elSize = computed(() => (document.body.clientWidth >= 500 ? 'large' : 'default'))

const locales = {
  zh: zh,
  en: en
}

// 提升暗黑主题下页面刷新视觉体验
const setBodyClass = (addClass: boolean) => {
  let el = document.getElementsByTagName('body')[0]

  if (addClass) {
    el.setAttribute('class', 'theme-change')
  } else {
    setTimeout(() => {
      el.removeAttribute('class')
    }, 300)
  }
}
// 初始化mq WebSocket连接
import { useWebSocketStore } from '@/store/modules/websocket'
import { WebSocketKey } from '@/enums/agricultureEnum'
const wsStore = useWebSocketStore()
const mqWebSocket = () => {
  const { info } = useUserStore()
  wsStore.initWebSocket(
    WebSocketKey.MQ,
    `${import.meta.env.VITE_WS_BASE_URL}/${WebSocketKey.MQ}/${info.name}`
  )
}

const initEvent = () => {
  event.connect()
}

const closeEvent = () =>{
  event.disconnect()
}

onBeforeMount(() => {
  setBodyClass(true)
  // 在路由守卫执行前初始化状态
  initState()
})

onMounted(() => {
  saveUserData()
  setBodyClass(false)
  mqWebSocket()
  initEvent()
  // 初始化MQTT客户端，确保预警通知在应用启动时就开始工作
  mqttStore.initMqttClient()
})

onBeforeUnmount(() => {
  wsStore.closeWebSocket(WebSocketKey.MQ)
  closeEvent()
})
</script>
