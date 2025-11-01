<template>
    <div class="radio-select">
        <el-dropdown
            :disabled="disabled"
            @command="handleSelect"
            trigger="click"
            ref="dropdownRef"
        >
            <div class="trigger" :class="{ disabled }">
                <template v-if="selectedLabel">
                    <div class="avatar-box">
                        <span class="avatar-circle">{{ firstChar }}</span>
                        <div class="info">
                            <div class="name">{{ selectedLabel }}</div>
                            <div class="desc">责任人</div>
                        </div>
                        <span class="close" @click.stop="clearSelect">×</span>
                    </div>
                </template>
                <template v-else>
                    <span class="plus">+</span>
                    <span class="label">-- 责任人</span>
                </template>
            </div>
            <template #dropdown>
                <el-dropdown-menu>
                    <el-dropdown-item
                        v-for="item in options"
                        :key="item[valueName]"
                        :command="item[valueName]"
                    >
                        {{ item[keyName] }}
                    </el-dropdown-item>
                </el-dropdown-menu>
            </template>
        </el-dropdown>
    </div>
</template>

<script setup>
import { ref, watch, computed } from 'vue'

const props = defineProps({
    options: {
        type: Array,
        default: () => []
    },
    modelValue: {
        type: [String, Number],
        default: ''
    },
    keyName: {
        type: String,
        default: 'label'
    },
    valueName: {
        type: String,
        default: 'value'
    },
    disabled: {
        type: Boolean,
        default: false
    }
})

const emit = defineEmits(['update:modelValue', 'change'])

const selectedValue = ref(props.modelValue)
const dropdownRef = ref(null)

const selectedLabel = computed(() => {
    const found = props.options.find(
        item => item[props.valueName] === selectedValue.value
    )
    return found ? found[props.keyName] : ''
})

const firstChar = computed(() => selectedLabel.value ? selectedLabel.value[0] : '')

watch(() => props.modelValue, (newVal) => {
    selectedValue.value = newVal
})

function handleSelect(value) {
    selectedValue.value = value
    emit('update:modelValue', value)
    emit('change', value)
}

function clearSelect() {
    selectedValue.value = ''
    emit('update:modelValue', '')
    emit('change', '')
}
</script>

<style lang="scss" scoped>
.radio-select {
    width: 100%;
    margin-top: 14px;
    .trigger {
        display: flex;
        align-items: center;
        padding: 4px 12px;
        cursor: pointer;
        width: fit-content;
        background: #fff;
        user-select: none;
        &.disabled {
            opacity: 0.6;
            cursor: not-allowed;
        }
        .avatar-box {
            display: flex;
            align-items: center;
            .avatar-circle {
                width: 40px;
                height: 40px;
                border-radius: 50%;
                background: #13c2c2;
                color: #fff;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 22px;
                font-weight: bold;
                margin-right: 12px;
            }
            .info {
                display: flex;
                flex-direction: column;
                justify-content: center;
                .name {
                    font-size: 15px;
                    color: #333;
                    margin-bottom: 4px;
                }
                .desc {
                    font-size: 13px;
                    color: #aaa;
                    line-height: 1;
                }
            }
            .close {
                margin-left: 12px;
                color: #f56c6c;
                cursor: pointer;
                font-size: 22px;
                visibility: hidden;
            }
        }

        &:hover .avatar-box .close {
            visibility: visible;
        }
    }
    .plus {
        width: 24px;
        height: 24px;
        border-radius: 50%;
        border: 1px solid #bbb;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-right: 8px;
        font-size: 18px;
    }
    .close {
        margin-left: 8px;
        color: #f56c6c;
        cursor: pointer;
        font-size: 18px;
    }
}
</style>