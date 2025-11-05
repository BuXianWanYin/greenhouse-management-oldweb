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
        <el-menu-item index="soil">
          <el-icon class="menu-icon"><Monitor /></el-icon><span>土壤数据</span>
        </el-menu-item>
        <div style="display: flex; align-items: center; margin-left: 24px;">
          <el-select
            v-model="queryPastureId"
            placeholder="请选择温室"
            clearable
            style="width: 300px"
            :loading="pastureLoading"
            @change="handlePastureChange"
          >
            <el-option
              v-for="item in pastureOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </div>
      </el-menu>
    </div>
    <div class="menu-content">
      <transition name="fade-slide" mode="out-in">
        <component
          :is="currentComponent"
          :key="activeMenu"
          :pasture-id="queryPastureId"
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
import SoilIndex from '../soil/index.vue'
import WeatherIndex from '../weather/index.vue'
import { AgriculturePastureService } from '@/api/agriculture/pastureApi'

const activeMenu = ref('weather')

const currentComponent = computed(() => {
  return activeMenu.value === 'soil' ? SoilIndex : WeatherIndex
})

function handleMenuSelect(key) {
  activeMenu.value = key
}

const currentDevices = ref([]) // 存储当前温室下的设备

// 温室选择器相关
const queryPastureId = ref('')
const pastureLoading = ref(false)
const pastureOptions = ref([])

// 加载温室列表
const loadPastureOptions = async () => {
  pastureLoading.value = true
  try {
    const res = await AgriculturePastureService.listPasture({ pageNum: 1, pageSize: 100 })
    if (res.code === 200) {
      pastureOptions.value = res.rows.map((item) => ({
        value: String(item.id),
        label: item.name
      }))
    }
  } catch (e) {
    console.error('加载温室列表失败:', e)
  } finally {
    pastureLoading.value = false
  }
}

const handlePastureChange = async (pastureId) => {
  if (!pastureId) {
    currentDevices.value = []
    return
  }
  // 查询该温室下的设备
  const res = await AgricultureDeviceService.listDevice({ pastureId })
  if (res.code === 200) {
    currentDevices.value = res.rows || []
  } else {
    currentDevices.value = []
  }
  console.log('选择温室:', pastureId)
}



onMounted(async () => {
  // 加载温室列表
  await loadPastureOptions()
  // 查询所有设备（不分页，pageSize设大一点）
  const res = await AgricultureDeviceService.listDevice({ })
  if (res.code === 200 && res.rows && res.rows.length > 0) {
    // 统计每个温室下的设备数量
    const countMap = {}
    res.rows.forEach(device => {
      if (device && device.pastureId) {
        const key = String(device.pastureId)
        countMap[key] = (countMap[key] || 0) + 1
      }
    })
    // 找出设备最多的温室
    let maxKey = null, maxCount = 0
    for (const key in countMap) {
      if (countMap[key] > maxCount) {
        maxCount = countMap[key]
        maxKey = key
      }
    }
    if (maxKey) {
      // 设置温室选择器的值
      queryPastureId.value = maxKey
      // 查询该温室下的设备
      await handlePastureChange(maxKey)
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
