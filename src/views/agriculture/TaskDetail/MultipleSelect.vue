<template>
  <div class="multipleSelect">
    <div style="display:flex;align-items:center;">
      <ul class="selected">
        <el-tooltip
          v-for="item in selectList"
          :key="item.value"
          effect="dark"
          :content="item.label"
          placement="top"
        >
          <li class="item">
            {{ item.label.slice(0, 1) }}
            <span
              v-if="!disabled"
              class="avatar-remove"
              @click="delItem(item)"
            >
              <el-icon><Close /></el-icon>
            </span>
          </li>
        </el-tooltip>
      </ul>
      <el-popover
        placement="bottom-start"
        width="150"
        trigger="manual"
        v-model:visible="visible"
        popper-class="message-popover"
      >
        <ul class="group" v-if="options.length > 0">
          <li
            class="multiple"
            v-for="(item, index) in dataList"
            :key="index"
            @click="select(item)"
            :style="{
              color: currentValue.includes(item.value)
                ? 'rgb(29, 167, 106)'
                : '#000',
              background: currentValue.includes(item.value)
                ? 'rgb(240, 240, 240)'
                : '#fff',
            }"
          >
            <div class="label">{{ item.label }}</div>
            <div class="icon" v-show="currentValue.includes(item.value)">
              <i class="el-icon-check"></i>
            </div>
          </li>
        </ul>
        <div v-else class="empty">无数据</div>
        <template #reference>
          <div
            :style="{ cursor: disabled ? 'not-allowed' : 'pointer' }"
            class="icon-add"
            @click="disabled ? (visible = false) : (visible = true)"
          ></div>
        </template>
      </el-popover>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { ElIcon } from 'element-plus'
import { Close } from '@element-plus/icons-vue'

const props = defineProps({
  options: {
    type: Array,
    default: () => [],
  },
  value: {
    type: Array,
    default: undefined,
  },
  modelValue: {
    type: Array,
    default: undefined,
  },
  keyName: String,
  valueName: String,
  disabled: {
    type: Boolean,
    default: false,
  },
});
const emit = defineEmits(['update:value', 'update:modelValue', 'change']);

const visible = ref(false);

const dataList = computed(() => {
  if (props.options.length > 0) {
    return props.options.map((item) => ({
      label: item[props.keyName ? props.keyName : 'label'],
      value: item[props.valueName ? props.valueName : 'value'],
    }));
  } else {
    return [];
  }
});

// 统一当前值，优先 modelValue
const currentValue = computed(() => {
  return props.modelValue !== undefined ? props.modelValue : (props.value || []);
});

const selectList = computed(() => {
  return currentValue.value
    .map(i => dataList.value.find(j => i === j.value))
    .filter(Boolean);
});

function updateValue(newVal) {
  emit('update:modelValue', newVal);
  emit('update:value', newVal);
}

const select = (data) => {
  if (!currentValue.value.includes(data.value)) {
    const check = [...currentValue.value, data.value];
    updateValue(check);
    emit('change', { type: 'add', value: data.value, values: check });
    visible.value = false;
  }
};

const delItem = (data) => {
  console.log('delItem data:', data);
  const idx = currentValue.value.indexOf(data.value);
  if (idx !== -1) {
    const check = currentValue.value.filter(v => v !== data.value);
    updateValue(check);
    emit('change', { type: 'del', value: data.value, values: check });
  }
};

onMounted(() => {
  document.addEventListener('mouseup', (e) => {
    const dom1 = document.querySelector('.icon-add');
    if (dom1 && !dom1.contains(e.target)) {
      visible.value = false;
    }
  });
});
</script>

<style>
.message-popover {
  padding: 0 !important;
}
</style>
<style lang="scss" scoped>
.multipleSelect {
  user-select: none;
  display: flex;
  align-items: center;
  .selected {
    display: flex;
    list-style: none;
    padding: 0;
    margin: 0;
    .item {
      width: 35px;
      height: 35px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-right: 10px;
      cursor: pointer;
      color: rgb(29, 167, 106);
      background: rgb(235, 250, 243);
      position: relative;
      font-weight: bold;
      .el-icon-close, .avatar-remove {
        position: absolute;
        right: -4px;
        top: -4px;
        z-index: 10;
        background: #3bb77e;
        color: #fff;
        border-radius: 50%;
        width: 16px;
        height: 16px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        box-shadow: 0 0 2px #ccc;
        border: 1px solid #fff;
        font-size: 12px;
        transition: background 0.2s, color 0.2s;
        visibility: hidden;
      }
      &:hover .el-icon-close,
      &:hover .avatar-remove {
        visibility: visible;
      }
    }
  }
  .icon-add {
    cursor: pointer;
    width: 35px;
    height: 35px;
    border: 1px solid #aaa;
    box-sizing: border-box;
    color: #aaa;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    &:hover {
      border-color: rgb(29, 167, 106);
      &::before {
        background: rgb(29, 167, 106);
      }
      &::after {
        background: rgb(29, 167, 106);
      }
    }
    &::before {
      display: block;
      content: '';
      width: 30%;
      height: 2px;
      background: #aaa;
      position: absolute;
      left: 50%;
      top: 50%;
      transform: translate(-50%, -50%);
    }
    &::after {
      display: block;
      content: '';
      height: 30%;
      width: 2px;
      background: #aaa;
      position: absolute;
      left: 50%;
      top: 50%;
      transform: translate(-50%, -50%);
    }
  }
}
.group :deep() {
  list-style: none;
  padding: 0;
  margin: 0;
  max-height: 200px;
  overflow: auto;
  .multiple {
    cursor: pointer;
    display: flex;
    justify-content: space-between;
    height: 35px;
    line-height: 35px;
    &:hover {
      background: rgb(240, 240, 240) !important;
    }
    .label {
      width: 70%;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      padding-left: 10px;
    }
    .icon {
      width: 20%;
    }
  }
}
.empty {
  text-align: center;
}
</style>