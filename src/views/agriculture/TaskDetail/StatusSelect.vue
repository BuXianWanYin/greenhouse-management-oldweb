<template>
    <el-popover
        placement="bottom-start"
        width="150"
        trigger="manual"
        v-model:visible="visible"
        popper-class="message-popover"
    >
        <ul class="group" v-if="options.length>0" @click.stop>
            <li
                class="radio"
                :class="{active: item.value === activeIndex}"
                v-for="(item,index) in dataList"
                :key="item.value"
                @click="select(item)"
            >{{item.label}}</li>
        </ul>
        <div class="empty" v-else>无数据</div>
        <template #reference>
            <div class="radioSelect" :style="{cursor:disabled?'not-allowed':'pointer'}" @click="handleClick">
                <div style="display:flex;align-items:center;height:100%">
                    <div class="icon" :style="{background:color,borderColor:color}">
                        <el-icon :size="20" color="#fff">
                            <component :is="activeIcon"></component>
                        </el-icon>
                    </div>
                    <span class="title">
                        <div>{{activeName}}</div>
                        <div><slot></slot></div>
                    </span>
                    <div class="del">
                        <el-icon v-if="!disabled" @click.stop="clear"><Close /></el-icon>
                    </div>
                </div>
            </div>
        </template>
    </el-popover>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { Minus, Promotion, Check, Close, SuccessFilled } from '@element-plus/icons-vue'

const props = defineProps({
    modelValue: {
        type: [Number, String],
        default: null
    },
    options: {
        type: Array,
        default: () => [
            {label:"未分配",activeIcon:Minus,color:"#F71653",value:0},
            {label:"已分配",activeIcon:SuccessFilled,color:"#ffba00",value:1},
            {label:"进行中",activeIcon:Promotion,color:"#ff4949",value:2},
            {label:"已完成",activeIcon:Check,color:"#13ce66",value:3},
        ]
    },
    disabled: {
        default: false,
        type: Boolean
    },
    keyName: String,
    valueName: String,
    colorName: String,
    iconName: String,
})

const emit = defineEmits(['update:modelValue', 'change'])

const visible = ref(false)
const activeIndex = ref(null)
const activeName = ref('--')
const activeIcon = ref(Minus)
const color = ref('#70B4E0')

const dataList = computed(() => {
    if(props.options.length > 0) {
        return props.options.map(item => {
            return {
                label: item[props.keyName || 'label'],
                value: item[props.valueName || 'value'],
                color: item[props.colorName || 'color'],
                activeIcon: item[props.iconName || 'activeIcon']
            }
        })
    }
    return []
})

const select = (data) => {
    activeIndex.value = data.value
    activeName.value = data.label
    color.value = data.color
    activeIcon.value = data.activeIcon
    emit('update:modelValue', data.value)
    visible.value = false
    if (props.modelValue != data.value) {
        emit('change', data.value)
    }
}

watch(() => props.modelValue, (val) => {
    dataList.value.forEach(item => {
        if (item.value == val) {
            select(item)
        }
    })
}, { immediate: true })

onMounted(() => {
    document.addEventListener('mouseup', e => {
        const dom1 = document.querySelector('.radioSelect')
        if (dom1) {
            if (!dom1.contains(e.target)) {
                visible.value = false
            }
        }
    })
})

const clear = () => {
    const data = {
        value: null,
        label: "--",
        color: "#70B4E0",
        activeIcon: Minus
    }
    select(data)
}

const handleClick = () => {
    if (!props.disabled) {
        visible.value = true
    }
}
</script>

<style>
.message-popover{
  padding: 0 !important;
}
</style>

<style lang="scss" scoped>
.radioSelect{
    margin-top: 14px;
    cursor: pointer;
    user-select: none;
    height: 50px;
    display: flex;
    align-items: center;
    .icon{
        width: 35px;
        height: 35px;
        border-radius: 50%;
        margin-right:10px;
        display: flex;
        align-items: center;
        justify-content: center;
        i{
            font-size: 20px;
        }
    }
    .el-avatar{
        margin-right: 10px;
        font-size: 20px;
    }
    .title{
        user-select: none;
        color: #aaa;
        width: 70px;
        height:40px;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        div{
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            &:first-of-type{
                color: #666;
                font-size:16px;
            }
            &:last-of-type{
                color: #999;
                font-size:12px;
            }
        }
    }
    .del{
        width: 20px;
        height: 100%;
        display: flex;
        align-items: center;
        .el-icon{
            visibility: hidden;
            cursor: pointer;
        }
    }
    &:hover{
       .del .el-icon{
            visibility:visible;
            &:hover{
                color:red
            }
       }
    }
}
.group :deep(){
    list-style: none;
    padding: 0;
    margin: 0;
    max-height: 200px;
    overflow:auto;
    .radio{
        cursor: pointer;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        height: 35px;
        line-height: 35px;
        padding: 0 10px;
        box-sizing: border-box;
        &:hover{
            background: #eee;
        }
    }
}
.empty{
    text-align: center;
}
</style>