<template>
  <div class="history-data">
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span>设备历史数据</span>
        </div>
      </template>

      <!-- 查询条件 -->
      <el-form :model="queryParams" :inline="true" class="query-form">
        <el-form-item label="采集时间">
          <el-date-picker
            v-model="dateRange"
            type="datetimerange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            format="YYYY-MM-DD HH:mm:ss"
            value-format="YYYY-MM-DD HH:mm:ss"
            style="width: 400px"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleQuery" :loading="loading">
            <el-icon><Search /></el-icon> 查询
          </el-button>
          <el-button @click="resetQuery">
            <el-icon><Refresh /></el-icon> 重置
          </el-button>
          <el-button type="success" @click="handleExport" :loading="exportLoading">
            <el-icon><Download /></el-icon> 导出
          </el-button>
        </el-form-item>
      </el-form>

      <!-- Tab切换 -->
      <el-tabs v-model="activeTab" @tab-change="handleTabChange">
        <!-- 气象数据Tab -->
        <el-tab-pane label="气象数据" name="weather">
          <el-table
            v-loading="weatherLoading"
            :data="weatherData"
            border
            stripe
            style="width: 100%"
            :max-height="800"
          >
            <el-table-column prop="deviceName" label="设备名称" width="400" align="center" />
            <el-table-column prop="temperature" label="温度(℃)" width="400" align="center">
              <template #default="scope">
                {{ scope.row.temperature || '-' }}
              </template>
            </el-table-column>
            <el-table-column prop="humidity" label="湿度(%)" width="400" align="center">
              <template #default="scope">
                {{ scope.row.humidity || '-' }}
              </template>
            </el-table-column>
            <el-table-column prop="illuminance" label="光照强度(lux)" width="400" align="center">
              <template #default="scope">
                {{ scope.row.illuminance || '-' }}
              </template>
            </el-table-column>
            <el-table-column prop="collectTime" label="采集时间" width="450" align="center">
              <template #default="scope">
                {{ formatDateTime(scope.row.collectTime) }}
              </template>
            </el-table-column>
            <el-table-column prop="remark" label="备注" width="168" align="center" show-overflow-tooltip />
          </el-table>

          <!-- 气象数据分页 -->
          <div class="pagination-container">
            <el-pagination
              v-model:current-page="weatherQueryParams.pageNum"
              v-model:page-size="weatherQueryParams.pageSize"
              :page-sizes="[10, 20, 50, 100]"
              :total="weatherTotal"
              layout="total, sizes, prev, pager, next, jumper"
              @size-change="handleWeatherQuery"
              @current-change="handleWeatherQuery"
            />
          </div>
        </el-tab-pane>

        <!-- 土壤数据Tab -->
        <el-tab-pane label="土壤数据" name="soil">
          <el-table
            v-loading="soilLoading"
            :data="soilData"
            border
            stripe
            style="width: 100%"
            :max-height="800"
          >
            <el-table-column prop="deviceName" label="设备名称" width="300" align="center" />
            <el-table-column prop="soilTemperature" label="土壤温度(℃)" width="140" align="center">
              <template #default="scope">
                {{ scope.row.soilTemperature || '-' }}
              </template>
            </el-table-column>
            <el-table-column prop="soilHumidity" label="土壤湿度(%)" width="200" align="center">
              <template #default="scope">
                {{ scope.row.soilHumidity || '-' }}
              </template>
            </el-table-column>
            <el-table-column prop="conductivity" label="电导率(μS/cm)" width="200" align="center">
              <template #default="scope">
                {{ scope.row.conductivity || '-' }}
              </template>
            </el-table-column>
            <el-table-column prop="salinity" label="盐分(mg/L)" width="200" align="center">
              <template #default="scope">
                {{ scope.row.salinity || '-' }}
              </template>
            </el-table-column>
            <el-table-column prop="nitrogen" label="氮含量(mg/kg)" width="200" align="center">
              <template #default="scope">
                {{ scope.row.nitrogen || '-' }}
              </template>
            </el-table-column>
            <el-table-column prop="phosphorus" label="磷含量(mg/kg)" width="200" align="center">
              <template #default="scope">
                {{ scope.row.phosphorus || '-' }}
              </template>
            </el-table-column>
            <el-table-column prop="potassium" label="钾含量(mg/kg)" width="200" align="center">
              <template #default="scope">
                {{ scope.row.potassium || '-' }}
              </template>
            </el-table-column>
            <el-table-column prop="phValue" label="pH值" width="200" align="center">
              <template #default="scope">
                {{ scope.row.phValue || '-' }}
              </template>
            </el-table-column>
            <el-table-column prop="collectTime" label="采集时间" width="250" align="center">
              <template #default="scope">
                {{ formatDateTime(scope.row.collectTime) }}
              </template>
            </el-table-column>
            <el-table-column prop="remark" label="备注" width="126" align="center" show-overflow-tooltip />
          </el-table>

          <!-- 土壤数据分页 -->
          <div class="pagination-container">
            <el-pagination
              v-model:current-page="soilQueryParams.pageNum"
              v-model:page-size="soilQueryParams.pageSize"
              :page-sizes="[10, 20, 50, 100]"
              :total="soilTotal"
              layout="total, sizes, prev, pager, next, jumper"
              @size-change="handleSoilQuery"
              @current-change="handleSoilQuery"
            />
          </div>
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'
import { Search, Refresh, Download } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { AgricultureAirDataService } from '@/api/sensor/airdataApi'
import { AgricultureSoilDataService } from '@/api/sensor/soilDataApi'
import { parseTime, downloadExcel, tansParams } from '@/utils/utils'

// 父组件传递的参数
const props = defineProps({
  pastureId: String,
  deviceList: Array
})

// Tab切换
const activeTab = ref('weather')

// 响应式数据
const loading = ref(false)
const weatherLoading = ref(false)
const soilLoading = ref(false)
const exportLoading = ref(false)

// 气象数据
const weatherData = ref([])
const weatherTotal = ref(0)
const weatherQueryParams = ref({
  pageNum: 1,
  pageSize: 20
})

// 土壤数据
const soilData = ref([])
const soilTotal = ref(0)
const soilQueryParams = ref({
  pageNum: 1,
  pageSize: 20
})

// 日期范围
const dateRange = ref([])

// 基础查询参数
const baseQueryParams = ref({
  pastureId: '',
  deviceId: '',
  beginTime: '',
  endTime: ''
})

// 格式化日期时间
const formatDateTime = (dateTime) => {
  if (!dateTime) return '-'
  return parseTime(dateTime, '{y}-{m}-{d} {h}:{i}:{s}')
}

// 获取基础查询参数
const getBaseParams = () => {
  const params = {
    ...baseQueryParams.value,
    ...weatherQueryParams.value
  }
  
  // 处理日期范围
  if (dateRange.value && dateRange.value.length === 2) {
    params.beginTime = dateRange.value[0]
    params.endTime = dateRange.value[1]
  } else {
    params.beginTime = ''
    params.endTime = ''
  }
  
  delete params.pageNum
  delete params.pageSize
  
  return params
}

// 查询气象数据
const handleWeatherQuery = async () => {
  weatherLoading.value = true
  try {
    const params = {
      ...getBaseParams(),
      pageNum: weatherQueryParams.value.pageNum,
      pageSize: weatherQueryParams.value.pageSize
    }
    
    const res = await AgricultureAirDataService.listData(params)
    if (res.code === 200) {
      weatherData.value = (res.rows || []).map(item => ({
        ...item,
        deviceName: getDeviceName(item.deviceId)
      }))
      weatherTotal.value = res.total || 0
    } else {
      ElMessage.error(res.msg || '查询气象数据失败')
      weatherData.value = []
      weatherTotal.value = 0
    }
  } catch (error) {
    console.error('查询气象数据失败:', error)
    ElMessage.error('查询气象数据失败')
    weatherData.value = []
    weatherTotal.value = 0
  } finally {
    weatherLoading.value = false
  }
}

// 查询土壤数据
const handleSoilQuery = async () => {
  soilLoading.value = true
  try {
    const params = {
      ...getBaseParams(),
      pageNum: soilQueryParams.value.pageNum,
      pageSize: soilQueryParams.value.pageSize
    }
    
    const res = await AgricultureSoilDataService.listData(params)
    if (res.code === 200) {
      soilData.value = (res.rows || []).map(item => ({
        ...item,
        deviceName: getDeviceName(item.deviceId)
      }))
      soilTotal.value = res.total || 0
    } else {
      ElMessage.error(res.msg || '查询土壤数据失败')
      soilData.value = []
      soilTotal.value = 0
    }
  } catch (error) {
    console.error('查询土壤数据失败:', error)
    ElMessage.error('查询土壤数据失败')
    soilData.value = []
    soilTotal.value = 0
  } finally {
    soilLoading.value = false
  }
}

// 统一查询入口
const handleQuery = () => {
  if (activeTab.value === 'weather') {
    weatherQueryParams.value.pageNum = 1
    handleWeatherQuery()
  } else {
    soilQueryParams.value.pageNum = 1
    handleSoilQuery()
  }
}

// Tab切换处理
const handleTabChange = (tabName) => {
  if (tabName === 'weather') {
    if (weatherData.value.length === 0) {
      handleWeatherQuery()
    }
  } else if (tabName === 'soil') {
    if (soilData.value.length === 0) {
      handleSoilQuery()
    }
  }
}

// 获取设备名称
const getDeviceName = (deviceId) => {
  if (!deviceId || !props.deviceList) return '-'
  const device = props.deviceList.find(d => {
    const dId = String(d.id)
    const targetId = String(deviceId)
    return dId === targetId || d.id === deviceId
  })
  return device ? (device.deviceName || device.name || '-') : '-'
}

// 重置查询
const resetQuery = () => {
  baseQueryParams.value = {
    pastureId: props.pastureId || '',
    deviceId: '',
    beginTime: '',
    endTime: ''
  }
  weatherQueryParams.value.pageNum = 1
  soilQueryParams.value.pageNum = 1
  dateRange.value = []
  handleQuery()
}

// 导出数据
const handleExport = async () => {
  // 检查是否有温室ID
  if (!props.pastureId && !baseQueryParams.value.pastureId) {
    ElMessage.warning('请先选择温室')
    return
  }
  
  const currentData = activeTab.value === 'weather' ? weatherData.value : soilData.value
  if (currentData.length === 0) {
    ElMessage.warning('没有数据可导出')
    return
  }
  
  exportLoading.value = true
  try {
    // 构建导出参数，确保包含所有必要的查询条件
    const params = {
      pastureId: baseQueryParams.value.pastureId || props.pastureId || ''
    }
    
    // 只有在有值时才添加设备ID
    if (baseQueryParams.value.deviceId) {
      params.deviceId = baseQueryParams.value.deviceId
    }
    
    // 处理日期范围
    if (dateRange.value && dateRange.value.length === 2) {
      params.beginTime = dateRange.value[0]
      params.endTime = dateRange.value[1]
    }
    
    // 生成文件名
    const dataTypeName = activeTab.value === 'weather' ? '气象数据' : '土壤数据'
    const now = new Date()
    const fileName = `${dataTypeName}_${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}${String(now.getSeconds()).padStart(2, '0')}`
    
    console.log('导出参数:', params) // 调试用
    
    // 使用downloadExcel工具函数处理导出
    if (activeTab.value === 'weather') {
      await downloadExcel(AgricultureAirDataService.exportExcel(params), fileName)
    } else {
      await downloadExcel(AgricultureSoilDataService.exportExcel(params), fileName)
    }
    
    exportLoading.value = false
  } catch (error) {
    console.error('导出失败:', error)
    ElMessage.error('导出失败，请检查网络连接或联系管理员')
    exportLoading.value = false
  }
}

// 监听温室ID变化，自动查询
watch(() => props.pastureId, (newVal) => {
  if (newVal) {
    baseQueryParams.value.pastureId = newVal
    weatherQueryParams.value.pageNum = 1
    soilQueryParams.value.pageNum = 1
    handleQuery()
  } else {
    weatherData.value = []
    weatherTotal.value = 0
    soilData.value = []
    soilTotal.value = 0
  }
}, { immediate: true })

// 监听设备列表变化
watch(() => props.deviceList, () => {
  // 更新表格中的设备名称
  weatherData.value = weatherData.value.map(item => ({
    ...item,
    deviceName: getDeviceName(item.deviceId)
  }))
  soilData.value = soilData.value.map(item => ({
    ...item,
    deviceName: getDeviceName(item.deviceId)
  }))
}, { deep: true })

onMounted(() => {
  if (props.pastureId) {
    baseQueryParams.value.pastureId = props.pastureId
    handleQuery()
  }
})
</script>

<style scoped>
.history-data {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.box-card {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.box-card :deep(.el-card__body) {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 16px;
  font-weight: 500;
}

.query-form {
  margin-bottom: 20px;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

/* Tab样式优化 */
:deep(.el-tabs__content) {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

:deep(.el-tab-pane) {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
</style>
