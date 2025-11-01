<template>
    <div class="calendarSelect" :style="{cursor: disabled ? 'not-allowed' : 'pointer'}">
        <div class="content_wrapper">
            <el-date-picker
                :class="{'disableClass': disabled}"
                v-model="date"
                :type="showTime ? 'datetime' : 'date'"
                :format="showTime ? 'YYYY-MM-DD ' : 'YYYY-MM-DD'"
                :value-format="showTime ? 'YYYY-MM-DD HH:mm:ss' : 'YYYY-MM-DD'"
                :editable="false"
                :clearable="false"
                :disabled="disabled"
                @change="changeData"
                :prefix-icon="Calendar"
                popper-class="no-footer-datepicker"
                :disabled-date="computedDisabledDate"
            />
             <i v-if="!disabled && date" @click="clearDate" class="el-icon-close"></i>
        </div>
        <div class="label">
            <slot />
        </div>
    </div>
</template>

<script setup>
import { ref, watch, computed } from 'vue'
import { Calendar } from '@element-plus/icons-vue'

const props = defineProps({
    modelValue: { type: String },
    startDate: { type: String },
    disabled: { type: Boolean, default: false },
    showTime: { type: Boolean, default: false },
    disabledDate: { type: Function }
})

const emit = defineEmits(['update:modelValue', 'change'])

const date = ref(props.modelValue)

const computedDisabledDate = (time) => {
    if (props.disabledDate) {
        return props.disabledDate(time)
    }
    if (!props.startDate) return false
    return time.getTime() < Date.parse(props.startDate)
}

watch(() => props.modelValue, (newValue) => {
    date.value = newValue
}, { immediate: true })

watch(date, (newValue) => {
    emit('update:modelValue', newValue)
}, { immediate: true })

const clearDate = () => {
    if (date.value) {
        date.value = null
        emit('change', date.value)
    }
}

const changeData = (value) => {
    emit('change', value)
}
</script>

<style lang="scss" scoped>
.calendarSelect {
    user-select: none;
    cursor: pointer;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    // gap: -20px;
    position: relative;
    .content_wrapper {
        display: flex;
        align-items: center;
        position: relative;
        .el-icon-close {
            position: absolute;
            right: 8px;
            top: 50%;
            transform: translateY(-50%);
            color: #c0c4cc;
            cursor: pointer;
            visibility: hidden;
            &:hover {
                color: #909399;
            }
        }
        &:hover .el-icon-close {
            visibility: visible;
        }
        :deep(.el-date-editor){
            width: 150px;
        }
        :deep(.el-input__wrapper){
            margin-top: 16px;
            height: 20px;
            padding-right: 25px;
            //时间的边框样式
            box-shadow: none !important;
            .el-input__prefix {
                font-size: 20px;
            }
            .el-input__inner {
                text-align: center;
                color: #999;
                font-size: 15px;
            }
        }

    }
    :deep(.el-input.is-disabled .el-input__wrapper) {
        background-color: transparent !important;
    }
    .label {
        font-size: 15px;
        color: #999;
        margin-left: 12px;
    }
}
</style>

<style>
.no-footer-datepicker .el-picker-panel__footer {
    display: none;
}
</style>