<template>
    <span> {{ formattedOutputValue }}</span>
  </template>
  
  <script setup lang="ts">
  import { ref, watch, nextTick, computed } from 'vue'
  import { useTransition } from '@vueuse/core'
  
  interface Props {
    num: number
    duration?: number
    precision?: number // 数字精度
  }
  
  const props = defineProps<Props>()
  const source = ref(0)
  let outputValue = useTransition(source, {
    duration: props.duration || 1000
  })
  
  const precision = ref(
    props.precision !== undefined && Number.isInteger(props.precision) ? props.precision : 0
  )
  const formattedOutputValue = computed(() => outputValue.value.toFixed(precision.value))
  
  watch(
    () => props.num,
    async (newVal) => {
      if (Number.isNaN(newVal)) {
        console.warn('Invalid number provided, defaulting to 0.')
        newVal = 0
      }
  
      await nextTick()
      source.value = newVal
    },
    { immediate: true }
  )
  </script>