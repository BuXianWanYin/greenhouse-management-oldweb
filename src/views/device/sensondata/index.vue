<template>
  <div class="data-manage full-height">
    <div class="menu-row">
      <el-menu
        :default-active="activeMenu"
        class="custom-menu full-height"
        mode="horizontal"
        @select="handleMenuSelect"
        background-color="#fff"
        text-color="#303133"
        active-text-color="#409EFF"
      >
        <el-menu-item index="weather">
          <el-icon class="menu-icon"><Sunny /></el-icon><span>气象数据</span>
        </el-menu-item>
        <el-menu-item index="water">
          <el-icon class="menu-icon"><Monitor /></el-icon><span>水质数据</span>
        </el-menu-item>
        <div style="display: flex; align-items: center; margin-left: 24px;">
          <el-cascader
            v-model="queryCascader"
            :props="cascaderProps"
            placeholder="请选择大棚和分区"
            clearable
            style="width: 300px"
            :loading="cascaderLoading"
            :options="cascaderOptions"
            @change="handleCascaderChange"
          />
        </div>
      </el-menu>
    </div>
    <div class="menu-content">
      <transition name="fade-slide" mode="out-in">
        <component
          :is="currentComponent"
          :key="activeMenu"
          :pasture-id="queryCascader[0]"
          :batch-id="queryCascader[1]"
          :device-list="currentDevices"
        />
      </transition>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { Select, Sunny, Monitor } from '@element-plus/icons-vue'
import { AgricultureDeviceService } from '@/api/device/deviceApi'
// 动态导入页面组件
import WaterIndex from '../water/index.vue'
import WeatherIndex from '../weather/index.vue'
import { AgriculturePastureService } from '@/api/agriculture/pastureApi'
import { AgricultureCropBatchService } from '@/api/agriculture/batchApi'

const activeMenu = ref('weather')

const currentComponent = computed(() => {
  return activeMenu.value === 'water' ? WaterIndex : WeatherIndex
})

function handleMenuSelect(key) {
  activeMenu.value = key
}

const currentDevices = ref([]) // 存储当前分区下的设备

// 级联选择器相关
const queryCascader = ref([])
const cascaderLoading = ref(false)
const cascaderOptions = ref([])

const cascaderProps = {
  lazy: true,
  value: 'value',
  label: 'label',
  async lazyLoad(node, resolve) {
    const { level, value } = node
    try {
      cascaderLoading.value = true
      if (level === 0) {
        // 加载大棚列表
        const res = await AgriculturePastureService.listPasture({ pageNum: 1, pageSize: 100 })
        if (res.code === 200) {
          const pastureList = res.rows.map((item) => ({
            value: String(item.id),
            label: item.name,
            leaf: false
          }))
          resolve(pastureList)
        } else {
          resolve([])
        }
      } else if (level === 1) {
        // 加载分区列表
        const res = await AgricultureCropBatchService.listBatchByPasture(value)
        if (res.code === 200) {
          const batchList = (res.data || []).map((item) => ({
            value: String(item.batchId),
            label: item.batchName,
            leaf: true
          }))
          resolve(batchList)
        } else {
          resolve([])
        }
      }
    } catch (e) {
      resolve([])
    } finally {
      cascaderLoading.value = false
    }
  }
}

const handleCascaderChange = async (val) => {
  const [pastureId, batchId] = val
  // 查询该分区下的设备
  const res = await AgricultureDeviceService.listDevice({ pastureId, batchId})
  if (res.code === 200) {
    currentDevices.value = res.rows
  } else {
    currentDevices.value = []
  }
  // 这里可以继续做：把 pastureId, batchId, currentDevices 传递给子组件
    console.log('选择大棚和分区:', val)
}



onMounted(async () => {
  // 查询所有设备（不分页，pageSize设大一点）
  const res = await AgricultureDeviceService.listDevice({ })
  if (res.code === 200) {
    // 统计每个大棚-分区下的设备数量
    const countMap = {}
    res.rows.forEach(device => {
      const key = `${device.pastureId}-${device.batchId}`
      countMap[key] = (countMap[key] || 0) + 1
    })
    // 找出设备最多的分区
    let maxKey = null, maxCount = 0
    for (const key in countMap) {
      if (countMap[key] > maxCount) {
        maxCount = countMap[key]
        maxKey = key
      }
    }
    if (maxKey) {
      const [pastureId, batchId] = maxKey.split('-')
      // 设置级联选择器的值
      queryCascader.value = [pastureId, batchId]
      // 查询该分区下的设备
      await handleCascaderChange([pastureId, batchId])
    }
  }
})


</script>

<style scoped>
.full-height {
  height: 100%;
}

.data-manage {
  padding: 0 0 20px 0;
  height: 100%;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
}

.menu-row {
  display: flex;
  align-items: center;
  background: #fff;
  padding: 0 24px;
  border-radius: 10px 10px 0 0;
  box-shadow: 0 2px 8px 0 rgba(64,158,255,0.06);
  min-height: 64px;
  width: 100%;
  box-sizing: border-box;
}

.custom-menu {
  display: flex;
  flex: 1 1 auto;
  min-width: 320px;
  border-radius: 10px;
  margin-bottom: 0;
  box-shadow: none;
  height: 48px;
  font-size: 16px;
  background: #fff;
}

.custom-menu .el-menu-item {
  min-width: 160px;
  height: 48px;
  line-height: 48px;
  font-size: 14px;
  font-weight: 500;
  border-radius: 8px 8px 0 0;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.35s cubic-bezier(.55,0,.1,1),
              color 0.25s cubic-bezier(.55,0,.1,1),
              box-shadow 0.35s cubic-bezier(.55,0,.1,1),
              border-bottom 0.25s cubic-bezier(.55,0,.1,1);
}

.menu-icon {
  margin-right: 6px;
  font-size: 18px;
}

.custom-menu .el-menu-item.is-active {
  background: #f0f7ff;
  color: #409EFF;
}

.custom-menu .el-menu-item:not(.is-active):hover {
  background: #f5f7fa !important;
  color: #409EFF !important;
  box-shadow: 0 2px 8px 0 rgba(64,158,255,0.08);
  border-bottom: 2px solid #409EFF;
  transition: background 0.2s, color 0.2s, box-shadow 0.2s;
}

.menu-content {
  margin-top: 16px;
  flex: 1;
  min-height: 0;
}

.fade-slide-enter-active, .fade-slide-leave-active {
  transition: all 0.4s cubic-bezier(.55,0,.1,1);
}
.fade-slide-enter-from, .fade-slide-leave-to {
  opacity: 0;
  transform: translateY(20px);
}
.fade-slide-enter-to, .fade-slide-leave-from {
  opacity: 1;
  transform: translateY(0);
}
</style>
