<template>
    <span :class="['typewriter', { 'typing-complete': isComplete }]">{{ displayText }}</span>
</template>

<script setup lang="ts">

const emit = defineEmits(['update'])

const props = defineProps<{
    text: string
    delay?: number
    startDelay?: number
}>()

const displayText = ref('')
const isComplete = ref(false)
let typing = false

const typeText = async (from = 0) => {
    typing = true
    isComplete.value = false
    for (let i = from; i <= props.text.length; i++) {
        displayText.value = props.text.slice(0, i)
        await new Promise(resolve => setTimeout(resolve, props.delay || 30))
        emit('update')
    }
    isComplete.value = true
    typing = false
}

let lastText = ''
watch(() => props.text, async (newVal, oldVal) => {
    if (!oldVal || newVal.length < oldVal.length) {
        // 新消息或被清空，重新打字
        await typeText()
    } else if (newVal.length > oldVal.length) {
        // 追加内容，逐字补充
        if (!typing) {
            // 如果不是正在打字，直接补充
            displayText.value = newVal
            emit('update')
            isComplete.value = true
        } else {
            // 如果正在打字，等 typeText 自然补全
        }
    }
    lastText = newVal
})

onMounted(() => {
    typeText()
})
</script>

<style scoped>
.typewriter {
    white-space: pre-wrap;
    word-break: break-word;
}

.typing-complete {
    /* border-right: none; */
    /* animation: none; */
}
</style> 