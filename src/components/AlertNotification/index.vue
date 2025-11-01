<template>
  
</template>

<script setup lang="ts">
import { watch, onMounted, onUnmounted } from 'vue'
import { useMqttStore } from '@/store/modules/mqttStore'
import { ElNotification } from 'element-plus'
import type { AlertData } from '@/types/agriculture/alertData'
import { createNotificationMessage } from './message.vue'  // 封装好的弹窗

const mqttStore = useMqttStore() //全栈
 


// 获取预警等级文本 全栈
const getAlertLevelText = (alertLevel: number) => {
  return alertLevel === 0 ? '警告' : '严重'
}

// 组件挂载时订阅预警主题 全栈
onMounted(() => {
  mqttStore.subscribeAlertTopics()
})

// 组件卸载时取消订阅预警主题
onUnmounted(() => {
  mqttStore.unsubscribeAlertTopics()
})
</script>

<style lang="scss" scoped>

</style> 