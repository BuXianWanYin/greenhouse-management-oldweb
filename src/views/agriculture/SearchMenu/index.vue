<!-- 搜索菜单组件：用于展示可搜索的列表数据，支持分页和选择功能 -->
<template>
  <div class="search-menu">
    <!-- 标题区域 -->
    <div class="search-menu-header">{{ title }}</div>
    <div class="search-menu-body">
      <!-- 搜索输入框 -->
      <el-input
        v-model="queryParams[searchParma]"
        @input="handleInput"
        :placeholder="searchPlaceholder"
        prefix-icon="el-icon-search"
        class="search-input"
      />

      <!-- 列表展示区域 -->
      <div v-if="list.length > 0" class="batch-list" v-loading="loading">
        <el-card
          v-for="(item, index) in list"
          :key="item[keyName]"
          :class="['batch-card', { 'is-active': selectedIndex === index }]"
          @click="handleSelect(index)"
          shadow="hover"
        >
          <div class="batch-content">
            <div class="batch-main">
              <svg-icon :icon-class="icon" class="batch-icon" />
              <span class="batch-name" :title="item[labelName]">
                {{ item[labelName].length > 11 ? `${item[labelName].substring(0, 11)}...` : item[labelName] }}
              </span>
            </div>
            <!-- 自定义插槽，允许父组件添加额外的内容 -->
            <slot :data="item"></slot>
          </div>
        </el-card>
      </div>
      <!-- 空数据提示 -->
      <el-empty v-else :image-size="100" description="暂无数据"></el-empty>
    </div>
    <!-- 分页区域 -->
    <div class="search-menu-footer">
      <el-pagination
        small
        background
        layout="prev, pager, next"
        :page-size="queryParams.pageSize"
        :total="total"
        @current-change="handlePagination"
        @prev-click="handlePagination"
        @next-click="handlePagination"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'

// 定义组件属性
const props = defineProps({
  // 组件标题
  title: {
    type: String,
    required: true
  },
  // 获取列表数据的函数
  fun: {
    type: Function,
    required: true
  },
  // 搜索参数名
  searchParma: {
    type: String,
    required: true
  },
  // 搜索框占位符
  searchPlaceholder: {
    type: String,
    required: true
  },
  // 列表项的唯一标识字段名
  keyName: {
    type: String,
    required: true
  },
  // 列表项显示名称的字段名
  labelName: {
    type: String,
    required: true
  },
  // 激活菜单配置
  activeMenu: {
    type: Object,
    default: () => ({
      isActive: false,
      name: '', // 属性
      value: '' // 值
    })
  },
  // 列表项图标
  icon: {
    type: String,
    default: 'land'
  },
  // 是否为子菜单
  isSub: {
    type: Boolean,
    default: false
  },
  // 子菜单图标
  subIcon: {
    type: String,
    default: 'channel'
  },
  // 子菜单唯一标识字段名
  subKeyName: String,
  // 子菜单显示名称字段名
  subLabelName: String,
  // 子菜单标签配置
  subTag: Object,
  // 自定义类名
  customClass: {
    type: String,
    default: ''
  }
})

// 定义事件
const emit = defineEmits(['select'])

// 响应式状态
const loading = ref(false)
const list = ref([])
const total = ref(null)
const selectedIndex = ref(null)
const queryParams = ref({
  pageNum: 1,
  pageSize: 16,
  [props.searchParma]: null
})

// 计算属性：默认选中项
const defaultActive = computed(() => {
  const { isActive, name, value } = props.activeMenu
  if (isActive) {
    if (name && value) {
      const index = list.value.findIndex(item => item[name] === value)
      return index === -1 ? '0' : index.toString()
    }
    return '0'
  }
  return ''
})

// 获取列表数据
const getList = async () => {
  loading.value = true
  try {
    if (typeof props.fun === 'function') {
      const { rows, total: totalCount } = await props.fun(queryParams.value)
      list.value = rows
      total.value = totalCount
      
      // 当列表更新时，如果有数据则选中第一项
      if (list.value && list.value.length > 0) {
        selectedIndex.value = 0
        emit('select', list.value[0])
      } else {
        selectedIndex.value = null
      }
    }
  } finally {
    loading.value = false
  }
}

// 处理列表项选择
const handleSelect = (index) => {
  selectedIndex.value = index
  if (props.isSub) {
    let childrenList = []
    list.value.forEach(item => {
      childrenList = childrenList.concat(item.children)
    })
    emit('select', childrenList.filter(item => item.channelSipId === index)[0])
  } else {
    emit('select', list.value[Number(index)])
  }
}

// 处理搜索输入
const handleInput = (value) => {
  queryParams.value[props.searchParma] = value
  queryParams.value.pageNum = 1
  getList()
}

// 处理分页变化
const handlePagination = (e) => {
  queryParams.value.pageNum = e
  getList()
}

// 组件挂载时获取数据
onMounted(async () => {
  await getList()
})
</script>

<style lang="scss" scoped>
.search-menu {
  &-header {
    height: 56px;
    display: flex;
    align-items: center;
    padding: 0 20px;
    font-size: 16px;
    font-weight: 500;
    border-bottom: 1px solid #ebeef5;
  }

  &-body {
    height: calc(100vh - 84px - 56px - 50px - 30px);
    padding: 15px 20px;
    display: flex;
    flex-direction: column;

    .search-input {
      margin-bottom: 20px;
      
      :deep(.el-input__inner) {
        border-radius: 4px;
        &:focus {
          border-color: #409EFF;
        }
      }
    }

    .batch-list {
      flex: 1;
      overflow-y: auto;
      padding-right: 5px;

      &::-webkit-scrollbar {
        width: 6px;
      }

      &::-webkit-scrollbar-thumb {
        background: #e0e0e0;
        border-radius: 3px;
      }

      .batch-card {
        margin-bottom: 12px;
        cursor: pointer;
        transition: all 0.2s;
        border-radius: 4px;
        border: 1px solid transparent;

        &:hover {
          transform: translateY(-2px);
          box-shadow: 0 2px 12px 0 rgba(0,0,0,.1);
        }

        &.is-active {
          background-color: #f0f7ff !important;
          border: 1px solid transparent !important;
          box-shadow: none !important;
          
          :deep(.el-card__body) {
            border: none;
          }
          
          .batch-name {
            color: #409EFF;
            font-weight: 500;
          }

          .batch-icon {
            color: #409EFF;
          }
        }

        .batch-content {
          .batch-main {
            display: flex;
            align-items: center;
            
            .batch-icon {
              margin-right: 10px;
              font-size: 18px;
              color: #606266;
            }

            .batch-name {
              flex: 1;
              font-size: 14px;
              color: #303133;
              overflow: hidden;
              text-overflow: ellipsis;
              white-space: nowrap;
            }
          }
        }
      }
    }
  }

  &-footer {
    height: 50px;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 10px 0;
    border-top: 1px solid #ebeef5;
  }
}

:deep() {
  .el-card__body {
    padding: 14px 16px;
    border: none;
  }

  .el-card {
    border: 1px solid transparent;
    box-shadow: none !important;
    
    &:hover, &:focus {
      border-color: transparent;
    }
  }
  
  .el-card.is-active {
    border: none !important;
    box-shadow: none !important;
  }

  .el-pagination {
    .el-pager li {
      background: transparent;
      &.active {
        background-color: #409EFF;
        color: #fff;
      }
      &:hover {
        color: #409EFF;
      }
    }
  }
}
</style>