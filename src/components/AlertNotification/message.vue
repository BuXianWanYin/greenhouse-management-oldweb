<template>
  
</template>

<script lang="ts">
import type { AlertData } from '@/types/agriculture/alertData'

// 格式化时间工具方法
export const formatTime = (timeStr: string) => {
  if (!timeStr) return ''
  const date = new Date(timeStr)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}

// 生成通知消息内容
export const createNotificationMessage = (alert: AlertData) => {
  return `
    <div style="padding: 8px;">
      <div style="font-weight: bold; margin-bottom: 8px; color: ${alert.alertLevel === 0 ? '#E6A23C' : '#F56C6C'};">${alert.alertMessage}</div>
      <div style="color: #606266; line-height: 1.5; font-size: 12px;">设备: ${alert.deviceName}</div>
      <div style="color: #909399; line-height: 1.5; font-size: 12px;">时间: ${formatTime(alert.alertTime)}</div>
    </div>
  `
}
</script>

<style lang="scss" scoped>
/* 样式 */
</style>
