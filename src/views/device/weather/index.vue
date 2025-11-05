<template>
  <div class="weather-quality">
    <!-- 气象参数监测卡片区 -->
    <div class="monitor-cards">
      <el-row :gutter="20">
        <el-col :span="8" v-for="item in monitorParams" :key="item.name">
          <el-card class="box-card">
            <template #header>
              <div class="card-header">
                <span>{{ item.label }}</span>
                <el-tag :type="item.status.type" size="small">{{ item.status.text }}</el-tag>
              </div>
            </template>
            <div class="card-content">
              <div class="value">
                {{ item.value }} {{ item.unit }}
              </div>
              <div class="range">安全范围: {{ item.range }}</div>
              <el-progress :percentage="item.percentage" :color="item.status.color" />
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>

      <!-- 气象历史趋势图表 -->
    <div class="trend-charts">
      <el-card class="box-card">
        <template #header>
          <div class="card-header">
            <span>气象参数历史趋势</span>
            <div class="header-right">
              <el-select v-model="selectedParams" multiple size="small" style="width: 260px" placeholder="选择参数">
                <el-option
                  v-for="item in monitorParams"
                  :key="item.name"
                  :label="item.label"
                  :value="item.name"
                />
              </el-select>
              <el-radio-group v-model="chartTimeRange" size="small">
                <el-radio-button :value="'day'">24小时</el-radio-button>
                <el-radio-button :value="'week'">7天</el-radio-button>
                <el-radio-button :value="'month'">30天</el-radio-button>
              </el-radio-group>
            </div>
          </div>
        </template>
        <div class="chart-container" ref="trendChart" style="height: 400px; width: 100%;" v-loading="trendChartLoading"></div>
      </el-card>
    </div>

    <el-card class="box-card" style="flex: 1;">
          <template #header>
            <div class="card-header">
              <span>预警规则设置</span>
          
            </div>
          </template>
          <el-table :data="alarmRules" style="width: 100%">
            <el-table-column prop="parameter" label="监测参数" width="400">
              <template #default="scope">
                {{ paramTypeDict[scope.row.parameter] || scope.row.parameter }}
              </template>
            </el-table-column>
            <el-table-column prop="threshold" label="阈值范围" width="400" />
            <el-table-column prop="notify" label="通知方式">
              <template #default="scope">
                <el-tag
                  :type="getNotifyTagType(scope.row.notify)"
                  size="small"
                >
                  {{ scope.row.notify }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="status" label="状态" width="150">
              <template #default="scope">
                <el-switch
                  v-model="scope.row.status"
                  @change="onAlarmRuleStatusChange(scope.row)"
                />
              </template>
            </el-table-column>
            <el-table-column label="操作" width="200">
              <template #default="scope">
                <el-button link size="small" @click="onEditAlarmRule(scope.row)">编辑</el-button>
                <el-button link size="small" @click="onDeleteAlarmRule(scope.row)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-card>

       <!-- 气象异常报警列表 -->
       <div class="warning-list">
      <el-card class="box-card">
        <template #header>
          <div class="card-header">
            <span>气象异常报警</span>
            <div class="header-right">
              <el-select v-model="warningLevel" size="small" placeholder="预警级别">
                <el-option label="全部" value="" />
                <el-option label="警告" value="warning" />
                <el-option label="严重" value="danger" />
              </el-select>
              <el-select v-model="warningStatus" size="small" placeholder="处理状态">
                <el-option label="全部" value="" />
                <el-option label="未处理" :value="0" />
                <el-option label="已处理" :value="1" />
              </el-select>
              <el-button type="primary" size="small" @click="markAllAsHandled">全部标记处理</el-button>
            </div>
          </div>
        </template>
        <el-table :data="warningList" v-loading="warningLoading" style="width: 100%">
          <el-table-column prop="createTime" label="时间" />
          <el-table-column prop="paramName" label="参数">
            <template #default="scope">
              {{ paramTypeDict[scope.row.paramName] || scope.row.paramName }}
            </template>
          </el-table-column>
          <el-table-column prop="paramValue" label="当前值">
            <template #default="scope">
              {{ scope.row.paramValue }}{{ paramUnitMap[scope.row.paramName] || '' }}
            </template>
          </el-table-column>
          <el-table-column label="正常范围">
            <template #default="scope">
              {{ scope.row.thresholdMin }} ~ {{ scope.row.thresholdMax }}{{ paramUnitMap[scope.row.paramName] || '' }}
            </template>
          </el-table-column>
          <el-table-column prop="alertLevel" label="级别">
            <template #default="scope">
              <el-tag :type="scope.row.alertLevel === 0 ? 'danger' : 'warning'">
                {{ scope.row.alertLevel === 0 ? '严重' : '警告' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="status" label="状态">
            <template #default="scope">
              <el-tag :type="scope.row.status === 0 ? 'danger' : 'success'" size="small">
                {{ scope.row.status === 0 ? '未处理' : '已处理' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="remark" label="备注">
            <template #default="scope">
              {{ scope.row.remark || '/' }}
            </template>
          </el-table-column>
          <el-table-column label="操作">
            <template #default="scope">
              <el-button link size="small" @click="onHandleWarning(scope.row)">处理</el-button>
              <el-button link size="small" @click="onDetailWarning(scope.row)">详情</el-button>
            </template>
          </el-table-column>
        </el-table>
        <!-- 分页 -->
        <el-pagination background layout="total, sizes, prev, pager, next, jumper" :total="warningTotal"
          :page-size="warningQueryParams.pageSize" :current-page="warningQueryParams.pageNum" @size-change="handleWarningSizeChange"
          @current-change="handleWarningCurrentChange" :page-sizes="[5, 10, 20, 50]"
          style="margin-top: 20px; text-align: center; display: flex; justify-content: center;" />
      </el-card>
    </div>
    

    <!-- 编辑预警规则弹窗 -->
    <el-dialog v-model="editDialogVisible" title="编辑预警规则" width="500px">
      <el-form :model="editForm" label-width="100px">
        <el-form-item label="监测参数">
          <el-input :value="paramTypeDict[editForm.parameter] || editForm.parameter" disabled />
        </el-form-item>
        <el-form-item label="阈值范围">
          <el-input v-model="editForm.threshold" disabled />
        </el-form-item>
        <el-form-item label="通知方式">
          <el-select v-model="editForm.notify" placeholder="请选择">
            <el-option label="系统通知" value="系统通知" />
            <el-option label="邮箱提醒" value="邮箱提醒" />
            <el-option label="短信" value="短信" />
          </el-select>
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="editForm.description" type="textarea" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button type="primary" @click="onEditAlarmRuleSave">保存</el-button>
        <el-button @click="editDialogVisible = false">取消</el-button>

      </template>
    </el-dialog>

    <!-- 处理预警弹窗 -->
    <el-dialog v-model="handleDialogVisible" :title="isDetailMode ? '预警详情' : '处理预警'" width="500px">
      <el-form :model="handleForm" label-width="100px">
        <el-form-item v-if="isDetailMode" label="异常详细">
          <el-input v-model="handleForm.alertMessage" disabled />
        </el-form-item>
        <el-form-item v-if="isDetailMode" label="设备名称">
          <el-input v-model="handleForm.deviceName" disabled />
        </el-form-item>
        <el-form-item label="处理状态">
          <el-select v-model="handleForm.status" :disabled="isDetailMode">
            <el-option label="未处理" :value="0" />
            <el-option label="已处理" :value="1" />
          </el-select>
        </el-form-item>
        <el-form-item label="处理备注">
          <el-input v-model="handleForm.remark" type="textarea" :disabled="isDetailMode" />
        </el-form-item>
        <el-form-item label="处理人">
          <el-input v-model="handleForm.updateBy" disabled />
        </el-form-item>
        <el-form-item label="处理时间">
          <el-input v-model="handleForm.updateTime" disabled />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button v-if="!isDetailMode" type="primary" @click="onHandleSave">确定</el-button>
        <el-button @click="handleDialogVisible = false">取消</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
// 1. 依赖导入
import { ref, onMounted, computed, watch, nextTick, onBeforeUnmount } from 'vue' // Vue 核心 API
import * as echarts from 'echarts' // ECharts 图表库
import { ColdDrink, IceDrink, Compass, Flag, Sunny } from '@element-plus/icons-vue' // Element Plus 图标
import { ElMessage, ElMessageBox } from 'element-plus' // Element Plus 消息弹窗
import { useMqttStore } from '@/store/modules/mqttStore' // MQTT 状态管理
import { storeToRefs } from 'pinia' // Pinia store 工具
import { AgricultureThresholdConfigService } from '@/api/device/thresholdConfig' // 阈值配置 API
import { ParamTypeDictService } from '@/api/device/typedictApi' // 参数字典 API
import { AgricultureDeviceSensorAlertService } from '@/api/sensor/alertApi'// 报警信息API
import { AgricultureDeviceMqttConfigService } from '@/api/device/deviceConfigApi' // 设备MQTT配置 API
import { useUserStore } from '@/store/modules/user'//获取用户API
import { AgricultureAirDataService } from '@/api/sensor/airdataApi' // 气象数据API

// 2. 父组件传递的参数 props
const props = defineProps({
  pastureId: String,   // 温室ID
  deviceList: Array    // 设备列表
})
// 3. 变量/响应式数据定义

// --- Pinia store 相关 ---
const mqttStore = useMqttStore() // 获取 MQTT store 实例
const { deviceDataMap } = storeToRefs(mqttStore) // 解构出设备数据映射
// --- 阈值、字典、缓存相关 ---
const thresholdMap = ref({}) // 各设备阈值配置映射
const paramTypeDict = ref({}) // 参数类型中英文对照字典
const paramUnitDict = ref({}) // 参数类型单位字典 { paramTypeEn: unit }
const deviceTopicMap = ref({}) // 设备ID到MQTT topic的映射 { deviceId: topic }
// --- 预警相关 ---
const userStore = useUserStore()
const currentUser = computed(() => userStore.getUserInfo)
const handleDialogVisible = ref(false)
const handleForm = ref({
  id: '',
  status: 1,
  remark: '',
  updateTime: '',
  updateBy: '',
  alertMessage: '', // 异常详细
  deviceName: ''    // 设备名称
})
const isDetailMode = ref(false)

// 从参数类型字典动态获取单位映射
const paramUnitMap = computed(() => {
  return paramUnitDict.value || {}
})
// --- 报警规则相关 ---
const alarmRules = ref([]) // 报警规则列表
let updateTimeTimer = null //定时器
const warningList = ref([])
const warningLoading = ref(false)
// --- 分页相关 ---
const warningQueryParams = ref({
  pageNum: 1,
  pageSize: 10
})
const warningTotal = ref(0) // 预警列表总数

const fetchWarningList = async () => {
  warningLoading.value = true
  try {
    const pastureId = currentPastureIdRef.value
    if (!pastureId) {
      warningList.value = []
      warningTotal.value = 0
      return
    }
    
    const params = {
      pastureId: pastureId,
      deviceType:'weather',
      pageNum: warningQueryParams.value.pageNum,
      pageSize: warningQueryParams.value.pageSize
    }
    
    // 添加筛选条件
    if (warningLevel.value) {
      params.alertLevel = warningLevel.value === 'danger' ? 0 : 1
    }
    if (warningStatus.value !== '') {
      params.status = warningStatus.value
    }
    
    const res = await AgricultureDeviceSensorAlertService.listAlert(params)
    if (res && res.code === 200) {
      warningList.value = res.rows || []
      // 更新总数，用于分页组件
      warningTotal.value = res.total || 0
    }
  } finally {
    warningLoading.value = false
  }
}


// --- 图表相关 ---
const chartTimeRange = ref('day') // 趋势图时间范围
const selectedParams = ref(['temperature', 'humidity', 'lightIntensity']) // 选中的气象参数
const trendChart = ref(null) // 趋势图 DOM 引用
let chartInstance = null // ECharts 实例
const chartOption = ref({}) // 图表 option 配置
const trendChartLoading = ref(false)

// --- 其他界面状态 ---
const analysisDrawer = ref(false) // 数据分析抽屉显示状态
const analysisTab = ref('trend') // 当前分析 tab
const warningLevel = ref('') // 预警等级筛选 '' | 'warning' | 'danger'
const warningStatus = ref('') // 预警状态筛选 '' | 0 | 1
const editDialogVisible = ref(false) // 编辑报警规则弹窗显示状态
const editForm = ref({}) // 编辑报警规则表单
const currentPage = ref(1) // 当前页码
const pageSize = ref(10) // 每页条数
const dateRange = ref([]) // 检测记录日期范围



// 计算属性 computed
/**
 * 动态监测参数卡片
 * 根据 deviceList 设备类型，自动生成气象参数卡片，包含温度、湿度、风速、光照强度、风向等
 */
 const monitorParams = computed(() => {
  // 过滤出气象类设备（deviceTypeId == 1）
  const deviceListArr = (props.deviceList || []).filter(d => d && d.deviceTypeId == 1)
  // 获取气象设备ID（通过设备名称匹配）
  const weatherId = getDeviceIdByType(deviceListArr, '气象') || 
                     getDeviceIdByType(deviceListArr, '百叶箱') ||
                     (deviceListArr.length > 0 && deviceListArr[0] && deviceListArr[0].id ? String(deviceListArr[0].id) : null)

  // 如果找到了设备ID，从 deviceDataMap 中获取数据
  let weatherData = null
  if (weatherId) {
    weatherData = deviceDataMap.value[weatherId]
    // 验证数据是否匹配：检查topic和pastureId
    if (weatherData) {
      const expectedTopic = deviceTopicMap.value[weatherId]
      if (expectedTopic && weatherData.topic && weatherData.topic !== expectedTopic) {
        // topic不匹配，清空数据
        weatherData = null
      } else {
        const pastureId = currentPastureIdRef.value
        if (pastureId && weatherData.pastureId && String(weatherData.pastureId) !== pastureId) {
          // pastureId不匹配，清空数据
          weatherData = null
        }
      }
    }
  }
  
  // 如果通过deviceId找不到，尝试根据topic匹配（兜底逻辑）
  if (!weatherData && deviceTopicMap.value) {
    const pastureId = currentPastureIdRef.value
    for (const [deviceId, topic] of Object.entries(deviceTopicMap.value)) {
      if (topic && (topic.includes('air-data') || topic.includes('weather'))) {
        const data = deviceDataMap.value[deviceId]
        if (data && data.topic === topic && pastureId && data.pastureId && String(data.pastureId) === pastureId) {
          weatherData = data
          break
        }
      }
    }
  }

  return [
    {
      name: 'temperature',
      label: '空气温度',
      value: weatherData?.temperature ?? '--',
      unit: paramUnitMap.value['temperature'] || '℃',
      range: getThresholdRange(weatherId, 'temperature'),
      percentage: (() => {
        const v = Number(weatherData?.temperature)
        const config = getThresholdConfig(weatherId, 'temperature')
        return config ? calcPercentage(v, config.thresholdMin, config.thresholdMax) : 0
      })(),
      status: (() => {
        const v = Number(weatherData?.temperature)
        const config = getThresholdConfig(weatherId, 'temperature')
        return config ? calcStatus(v, config.thresholdMin, config.thresholdMax) : { type: 'info', text: '无数据', color: '#909399' }
      })(),
      icon: ColdDrink,
      description: '影响作物生长和蒸发量'
    },
    {
      name: 'humidity',
      label: '空气湿度',
      value: weatherData?.humidity ?? '--',
      unit: paramUnitMap.value['humidity'] || '%',
      range: getThresholdRange(weatherId, 'humidity'),
      percentage: (() => {
        const v = Number(weatherData?.humidity)
        const config = getThresholdConfig(weatherId, 'humidity')
        return config ? calcPercentage(v, config.thresholdMin, config.thresholdMax) : 0
      })(),
      status: (() => {
        const v = Number(weatherData?.humidity)
        const config = getThresholdConfig(weatherId, 'humidity')
        return config ? calcStatus(v, config.thresholdMin, config.thresholdMax) : { type: 'info', text: '无数据', color: '#909399' }
      })(),
      icon: IceDrink,
      description: '影响作物蒸腾和病害发生'
    },
    {
      name: 'lightIntensity',
      label: '光照强度',
      value: weatherData?.illuminance ?? '--',
      unit: paramUnitMap.value['light_intensity'] || 'lux',
      range: getThresholdRange(weatherId, 'light_intensity'),
      percentage: (() => {
        const v = Number(weatherData?.illuminance)
        const config = getThresholdConfig(weatherId, 'light_intensity')
        return config ? calcPercentage(v, config.thresholdMin, config.thresholdMax) : 0
      })(),
      status: (() => {
        const v = Number(weatherData?.illuminance)
        const config = getThresholdConfig(weatherId, 'light_intensity')
        return config ? calcStatus(v, config.thresholdMin, config.thresholdMax) : { type: 'info', text: '无数据', color: '#909399' }
      })(),
      icon: Sunny,
      description: '影响光合作用'
    },
  ]
})


/**
 * 加载设备阈值配置
 * @param {Array} deviceIds 设备ID数组
 */
 const loadThresholds = async (deviceIds) => {
  const map = {}
  for (const id of deviceIds) {
    const res = await AgricultureThresholdConfigService.listByDeviceId(id)
    if (res && res.data) {
      map[id] = res.data
    }
  }
  thresholdMap.value = map
}

/**
 * 加载设备MQTT topic配置
 * @param {Array} deviceIds 设备ID数组
 */
const loadDeviceTopics = async (deviceIds) => {
  const map = {}
  for (const deviceId of deviceIds) {
    try {
      const res = await AgricultureDeviceMqttConfigService.getConfigByDeviceId(deviceId)
      if (res && res.code === 200 && res.data && res.data.mqttTopic) {
        map[String(deviceId)] = res.data.mqttTopic
      }
    } catch (e) {
      console.error(`加载设备 ${deviceId} 的MQTT topic失败:`, e)
    }
  }
  deviceTopicMap.value = map
  console.log('设备MQTT topic映射:', map)
}

// 侦听器 watch

/**
 * 安全地获取 pastureId 字符串
 */
const currentPastureIdRef = computed(() => {
  try {
    // 使用可选链和空值合并来安全访问
    if (!props) {
      return null
    }
    const id = props.pastureId
    if (id == null || id === '') {
      return null
    }
    // 安全地转换为字符串
    return String(id)
  } catch (e) {
    console.error('currentPastureIdRef error:', e)
    return null
  }
})

/**
 * 侦听 pastureId、deviceList 的变化
 * 1. 设备列表变化时加载阈值和订阅
 * 2. id变化时刷新报警规则、读取缓存
 * 3. 每次变化都请求气象趋势数据
 */
// 使用 computed 来安全地访问 props
const propsWatchSource = computed(() => {
  try {
    // 确保 props 存在且是对象
    if (!props || typeof props !== 'object') {
      return [null, null]
    }
    // 安全地访问 props 属性
    const pastureId = props.pastureId
    const deviceList = props.deviceList
    return [
      (pastureId != null && pastureId !== '') ? pastureId : null,
      (deviceList && Array.isArray(deviceList)) ? deviceList : null
    ]
  } catch (e) {
    console.error('propsWatchSource error:', e)
    return [null, null]
  }
})

watch(
  propsWatchSource,
  async (
    [newPastureId, newDeviceList],
    [oldPastureId, oldDeviceList] = []
  ) => {
    try {
      // 1. 设备列表变化时加载阈值、MQTT topic配置和订阅
      if (newDeviceList !== oldDeviceList && newDeviceList) {
        const weatherDevices = (newDeviceList || []).filter(d => d && d.deviceTypeId == 1)
        const deviceIds = weatherDevices.map(d => d && d.id).filter(id => id != null)
        if (deviceIds.length > 0) {
          await loadThresholds(deviceIds)
          await loadDeviceTopics(deviceIds) // 加载设备MQTT topic配置
        }
        if (newDeviceList && newDeviceList.length > 0) {
          console.log('watch订阅设备列表:', newDeviceList)
          mqttStore.subscribeAllDeviceTopics(newDeviceList)
        }
      }
      // 2. id变化时刷新报警规则、读取缓存
      if (newPastureId !== oldPastureId && newPastureId) {
        // 先读取缓存，保证 deviceDataMap 有数据
        readDeviceDataMapCache()
        loadAlarmRules(newPastureId) // 刷新报警规则
        fetchWarningList() // <<=== 加载气象异常预警数据
      }
      // 3. 每次变化都请求气象趋势数据
      fetchWeatherTrendData()
    } catch (e) {
      console.error('watch propsWatchSource error:', e)
    }
  },
  { immediate: true, deep: true }
)

//侦听自动处理时间
watch(handleDialogVisible, (visible) => {
  if (visible && !isDetailMode.value) {
    // 只在"处理"模式下自动更新时间
    updateTimeTimer = setInterval(() => {
      handleForm.value.updateTime = formatDateTime(new Date())
    }, 1000)
  } else {
    if (updateTimeTimer) {
      clearInterval(updateTimeTimer)
      updateTimeTimer = null
    }
  }
})
/**
 * 侦听 chartTimeRange 和 selectedParams 的变化
 * 变化时刷新气象趋势图
 */
watch([chartTimeRange, selectedParams], () => {
  fetchWeatherTrendData()
})

/**
 * 侦听 deviceDataMap 的变化
 * 变化时写入本地缓存
 */
watch(deviceDataMap, (newVal) => {
  try {
    const pastureId = currentPastureIdRef.value
    if (!pastureId) {
      return
    }
    
    const cacheKey = `deviceDataMap_${pastureId}`
    const cacheObj = {
      data: newVal,
      ts: Date.now()
    }
    localStorage.setItem(cacheKey, JSON.stringify(cacheObj))
    // console.log(`[deviceDataMap] 已写入缓存:`, cacheKey, cacheObj)
  } catch (e) {
    console.error('watch deviceDataMap error:', e)
  }
}, { deep: true })

/**
 * 监听筛选条件变化，重置分页并重新获取数据
 */
watch([warningLevel, warningStatus], () => {
  warningQueryParams.value.pageNum = 1
  fetchWarningList() // 重新获取数据
})

// 生命周期钩子

/**
 * 组件挂载时执行
 * 1. 读取设备数据缓存，保证 deviceDataMap 有数据
 * 2. 初始化 ECharts 实例
 * 3. 加载报警规则、参数字典
 */
 onMounted(async () => {
  // 先读取缓存，保证 deviceDataMap 有数据
  readDeviceDataMapCache()
  // 加载设备MQTT topic配置和阈值配置
  if (props.deviceList && props.deviceList.length > 0) {
    const weatherDevices = (props.deviceList || []).filter(d => d && d.deviceTypeId == 1)
    const deviceIds = weatherDevices.map(d => d && d.id).filter(id => id != null)
    if (deviceIds.length > 0) {
      await loadThresholds(deviceIds) // 确保加载阈值配置
      await loadDeviceTopics(deviceIds)
    }
  }
  // 初始化 ECharts 实例
  nextTick(() => {
    if (trendChart.value) {
      chartInstance = echarts.init(trendChart.value)
      window._echarts = chartInstance // 可全局调试
      fetchWeatherTrendData()
    }
  })
  // 加载报警规则
  const pastureId = currentPastureIdRef.value
  if (pastureId) {
    loadAlarmRules(pastureId)
  }
  // 加载参数类型字典
  loadParamTypeDict()
  // 加载气象异常预警数据
  fetchWarningList()  
})

/**
 * 组件卸载前执行
 * 1. 销毁 ECharts 实例，释放内存
 */
onBeforeUnmount(() => {
  if (chartInstance) {
    chartInstance.dispose()
    chartInstance = null
  }
  //清理定时器
  if (updateTimeTimer) {
    clearInterval(updateTimeTimer)
    updateTimeTimer = null
  }
})


// 方法
// ========== 报警规则相关 ==========
/**
 * 加载报警规则
 * @param {String} pastureId 温室ID
 */
const loadAlarmRules = async (pastureId) => {
  // 从设备列表中动态获取气象设备类型ID
  const weatherDevices = (props.deviceList || []).filter(d => d && (d.deviceTypeId == 1 || d.deviceTypeId == '1'))
  const deviceType = weatherDevices.length > 0 ? (weatherDevices[0].deviceTypeId == '1' ? 1 : Number(weatherDevices[0].deviceTypeId)) : 1
  
  if (!pastureId) {
    alarmRules.value = []
    return
  }
  try {
    const res = await AgricultureThresholdConfigService.listByPastureAndBatch(pastureId, null, deviceType)
    if (res && res.data && Array.isArray(res.data)) {
      alarmRules.value = res.data.map(item => {
        let threshold = ''
        const min = item.thresholdMin
        const max = item.thresholdMax
        const unit = item.unit || ''
        if (min != null && max != null && min !== '' && max !== '') {
          if (min === max) {
            threshold = `${min}${unit}`
          } else {
            threshold = `${min}${unit} ~ ${max}${unit}`
          }
        } else if (min != null && min !== '') {
          threshold = `大于 ${min}${unit}`
        } else if (max != null && max !== '') {
          threshold = `小于 ${max}${unit}`
        } else {
          threshold = '--'
        }
        return {
          id: item.id,
          parameter: item.paramType,
          threshold,
          notify: notifyTypeMap[item.notifyType] || item.notifyType || '--',
          status: item.isEnabled === 1 || item.isEnabled === true || item.isEnabled === '1',
          description: item.remark || ''
        }
      })
    } else {
      alarmRules.value = []
    }
  } catch (e) {
    alarmRules.value = []
  }
}

/**
 * 编辑报警规则弹窗
 * @param {Object} row 报警规则行数据
 */
const onEditAlarmRule = (row) => {
  editForm.value = { ...row }
  editDialogVisible.value = true
}

/**
 * 保存报警规则
 */
const onEditAlarmRuleSave = async () => {
  try {
    const notifyTypeMapReverse = { '系统通知': 'system', '邮箱提醒': 'email', '短信': 'sms' }
    await AgricultureThresholdConfigService.updateConfig({
      id: editForm.value.id,
      paramType: editForm.value.parameter,
      notifyType: notifyTypeMapReverse[editForm.value.notify] || 'system',
      isEnabled: editForm.value.status ? 1 : 0,
      remark: editForm.value.description,
    })
    ElMessage.success('保存成功')
    editDialogVisible.value = false
    const pastureId = currentPastureIdRef.value
    if (pastureId) {
      loadAlarmRules(pastureId)
    }
  } catch (e) {
    ElMessage.error('保存失败')
  }
}

/**
 * 删除报警规则
 * @param {Object} row 报警规则行数据
 */
const onDeleteAlarmRule = async (row) => {
  try {
    await ElMessageBox.confirm('确定要删除该报警规则吗？', '提示', { type: 'warning' })
    await AgricultureThresholdConfigService.deleteConfig(row.id)
    ElMessage.success('删除成功')
    loadAlarmRules(props.pastureId)
  } catch (e) {
    if (e !== 'cancel') ElMessage.error('删除失败')
  }
}

/**
 * 报警规则状态改变
 * @param {Object} row 报警规则行数据
 */
const onAlarmRuleStatusChange = async (row) => {
  try {
    await AgricultureThresholdConfigService.updateConfig({
      ...row,
      isEnabled: row.status ? 1 : 0
    })
    ElMessage.success('状态更新成功')
    loadAlarmRules(props.pastureId)
  } catch (e) {
    ElMessage.error('状态更新失败')
    // 恢复原状态
    row.status = !row.status
  }
}
// ========== 预警操作相关 ==========
//处理按钮
const onHandleWarning = (row) => {
  console.log('currentUser:', currentUser.value); // 调试用，打印当前用户
  isDetailMode.value = false
  handleForm.value = {
    id: row.id,
    status: row.status,
    remark: row.remark || '',
    updateTime: formatDateTime(new Date()),
    updateBy: currentUser.value?.name || '未知',
    alertMessage: row.alertMessage || '',
    deviceName: row.deviceName || ''
  }
  handleDialogVisible.value = true
}
//保存处理按钮
const onHandleSave = async () => {
  try {
    await AgricultureDeviceSensorAlertService.updateAlertIot({
      id: handleForm.value.id,
      status: handleForm.value.status,
      remark: handleForm.value.remark,
      updateTime: handleForm.value.updateTime,
      updateBy: handleForm.value.updateBy
    })
    ElMessage.success('处理成功')
    handleDialogVisible.value = false
    fetchWarningList()
  } catch (e) {
    ElMessage.error('处理失败')
  }
}
//详情按钮
const onDetailWarning = (row) => {
  isDetailMode.value = true
  handleForm.value = {
    id: row.id,
    status: row.status,
    remark: row.remark || '',
    updateTime: row.updateTime || '',
    updateBy: row.updateBy || '',
    alertMessage: row.alertMessage || '',
    deviceName: row.deviceName || ''
  }
  handleDialogVisible.value = true
}




// 分页大小改变
const handleWarningSizeChange = (size) => {
  warningQueryParams.value.pageSize = size
  warningQueryParams.value.pageNum = 1
  fetchWarningList() // 重新获取数据
}

// 当前页改变
const handleWarningCurrentChange = (page) => {
  warningQueryParams.value.pageNum = page
  fetchWarningList() // 重新获取数据
}

// 全部标记处理
const markAllAsHandled = async () => {
  // 找出当前筛选下未处理的预警
  const toHandle = warningList.value.filter(item => item.status === 0)
  if (toHandle.length === 0) {
    ElMessage.info('没有未处理的预警')
    return
  }
  try {
    await Promise.all(toHandle.map(item =>
      AgricultureDeviceSensorAlertService.updateAlertIot({
        id: item.id,
        status: 1,
        remark: item.remark,
        updateTime: formatDateTime(new Date()),
        updateBy: currentUser.value?.name || '未知'
      })
    ))
    ElMessage.success('全部标记为已处理')
    fetchWarningList()
  } catch (e) {
    ElMessage.error('批量处理失败')
  }
}

// ========== 控制操作相关 ==========
/**
 * 执行调控操作
 * @param {Object} control 操作对象
 */
const executeControl = async (control) => {
  try {
    // 这里可以调用后端API执行实际操作
    console.log('执行操作:', control)
    ElMessage.success(`${control.label}操作执行成功`)
    // 更新最后执行时间
    control.lastExecute = formatDateTime(new Date())
    // 刷新数据
    await getList()
  } catch (error) {
    ElMessage.error(`${control.label}操作执行失败`)
  }
}

/**
 * 显示调控详情
 * @param {Object} control 操作对象
 */
const showControlDetail = (control) => {
  ElMessageBox.alert(
    `<div>
      <p><strong>操作说明:</strong> ${control.description}</p>
      <div style="margin-top: 10px;">
        <strong>参数设置:</strong>
        ${control.params.map(param => 
          `<div style="margin-top: 5px;">
            ${param.label}: ${param.value}${param.unit}
           </div>`
        ).join('')}
      </div>
      ${control.lastExecute ? 
        `<div style="margin-top: 10px;">
          <strong>上次执行:</strong> ${control.lastExecute}
         </div>` : ''
      }
    </div>`,
    '操作详情',
    {
      dangerouslyUseHTMLString: true,
      confirmButtonText: '确定'
    }
  )
}


// ========== 图表相关 ==========
/**
 * 请求气象趋势数据
 */
const fetchWeatherTrendData = async () => {
  trendChartLoading.value = true
  try {
    const pastureId = currentPastureIdRef.value
    if (pastureId) {
      const res = await AgricultureAirDataService.getTrendData(
        pastureId,
        chartTimeRange.value
      )
      if (res && res.code === 200 && res.data) {
        // 处理API返回的数据格式，将xaxis转换为xAxis
        const processedData = {
          xAxis: res.data.xaxis || res.data.xAxis || [],
          temperature: res.data.temperature || [],
          humidity: res.data.humidity || [],
          windSpeed: res.data.windSpeed || [],
          lightIntensity: res.data.lightIntensity || []
        }
        updateTrendChart(processedData)
      } else {
        // 如果API返回失败或没有数据，使用空数据
        const emptyData = {
          xAxis: [],
          temperature: [],
          humidity: [],
          windSpeed: [],
          lightIntensity: []
        }
        updateTrendChart(emptyData)
      }
    }
  } catch (error) {
    console.error('请求气象趋势数据失败:', error)
    // 错误时使用空数据
    const emptyData = {
      xAxis: [],
      temperature: [],
      humidity: [],
      windSpeed: [],
      lightIntensity: []
    }
    updateTrendChart(emptyData)
  } finally {
    trendChartLoading.value = false
  }
}

/**
 * 处理数据，生成 ECharts option 并渲染趋势图
 * @param {Object} data 趋势数据
 */
function updateTrendChart(data) {
  // 确保xAxis字段存在，兼容xaxis（小写）
  const xAxisData = data.xAxis || data.xaxis || []
  const len = xAxisData.length || 0

  function fixSeriesData(arr, len) {
    if (!arr) return Array(len).fill(0)
    const fixed = arr.map(v => v == null ? 0 : v)
    if (fixed.length < len) {
      return fixed.concat(Array(len - fixed.length).fill(0))
    }
    return fixed
  }

  // 参数映射（从字典动态获取单位）
  const paramMap = {
    temperature: { name: '空气温度', data: fixSeriesData(data.temperature, len), unit: paramUnitMap.value['temperature'] || '℃' },
    humidity: { name: '空气湿度', data: fixSeriesData(data.humidity, len), unit: paramUnitMap.value['humidity'] || '%' },
    windSpeed: { name: '风速', data: fixSeriesData(data.windSpeed, len), unit: paramUnitMap.value['wind_speed'] || 'm/s' },
    lightIntensity: { name: '光照强度', data: fixSeriesData(data.lightIntensity, len), unit: paramUnitMap.value['light_intensity'] || 'lux' }
  }

  // 只保留选中的参数，过滤掉不存在的数据
  const validParams = selectedParams.value.filter(key => paramMap[key])
  const legendData = validParams.map(key => paramMap[key].name)
  const series = validParams.map(key => ({
    name: paramMap[key].name,
    type: 'line',
    data: paramMap[key].data
  }))

  const isWeek = chartTimeRange.value === 'week';

  const option = {
    grid: {
      left: isWeek ? '5%' : '2%',
      right: isWeek ? '3%' : '2%',
      top: 60,
      bottom: 40,
      containLabel: true
    },
    tooltip: {
      trigger: 'axis',
      formatter: function(params) {
        let html = params[0].axisValue + '<br/>';
        params.forEach(item => {
          // 找到 unit
          let unit = ''
          for (const k in paramMap) {
            if (paramMap[k].name === item.seriesName) {
              unit = paramMap[k].unit
              break
            }
          }
          html += `${item.marker}${item.seriesName} <b>${item.data}${unit}</b><br/>`;
        });
        return html;
      }
    },
    legend: { data: legendData },
    xAxis: {
      type: 'category',
      data: xAxisData,
      boundaryGap: false
    },
    yAxis: { type: 'value' },
    series
  }

  if (chartInstance) {
    chartInstance.setOption(option, true)
  }
}

// ========== 分页与数据相关 ==========
/**
 * 分页大小变化
 * @param {Number} val 新的每页条数
 */
const handleSizeChange = (val) => {
  pageSize.value = val
  getList()
}

/**
 * 当前页码变化
 * @param {Number} val 新的页码
 */
const handleCurrentChange = (val) => {
  currentPage.value = val
  getList()
}

/**
 * 获取数据列表（可根据实际业务补充）
 */
const getList = async () => {
  try {
    // loading.value = true // 如有 loading 状态可解开
    // 这里可以调用后端API获取实际数据
    // const res = await AgricultureWaterQualityDataService.listData(queryParams)
    // if (res.code === 200) {
    //   // 处理数据
    // }
  } catch (error) {
    console.error('获取数据失败:', error)
  } finally {
    // loading.value = false
  }
}

/**
 * 获取通知类型的标签样式
 * @param {String} notify 通知类型
 */
const getNotifyTagType = (notify) => {
  switch (notify) {
    case '系统通知':
      return 'success'
    case '邮箱提醒':
      return 'warning'
    case '短信':
      return 'success'
    default:
      return 'default'
  }
}

// 其他工具函数
/**
 * 计算百分比
 * @param {Number} value 当前值
 * @param {Number} min 最小阈值
 * @param {Number} max 最大阈值
 * @returns {Number} 百分比（0~100）
 */
 const calcPercentage = (value, min, max) => {
  if (
    value == null ||
    min == null ||
    max == null ||
    max === min ||
    isNaN(value) ||
    isNaN(min) ||
    isNaN(max)
  ) return 0
  if (value <= min) return 0
  if (value >= max) return 100
  const percent = Math.round(((value - min) / (max - min)) * 100)
  // 保证百分比在0~100之间
  return Math.max(0, Math.min(100, percent))
}

/**
 * 通知类型映射
 */
const notifyTypeMap = {
  system: '系统通知',
  email: '邮箱提醒',
  sms: '短信'
}

/**
 * 计算状态
 * @param {Number} value 当前值
 * @param {Number} min 最小阈值
 * @param {Number} max 最大阈值
 * @returns {Object} 状态对象（type, text, color）
 */
const calcStatus = (value, min, max) => {
  if (value == null || min == null || max == null) {
    return { type: 'info', text: '无数据', color: '#909399' }
  }
  if (value < min) {
    return { type: 'warning', text: '偏低', color: '#E6A23C' }
  }
  if (value > max) {
    return { type: 'danger', text: '偏高', color: '#F56C6C' }
  }
  return { type: 'success', text: '正常', color: '#67C23A' }
}

/**
 * 获取阈值配置
 * @param {String} deviceId 设备ID
 * @param {String} paramType 参数类型
 * @returns {Object|undefined} 阈值配置对象
 */
const getThresholdConfig = (deviceId, paramType) => {
  const configs = thresholdMap.value[deviceId] || []
  return configs.find(c => c.paramType === paramType && c.isEnabled)
}

/**
 * 获取阈值范围字符串
 * @param {String} deviceId 设备ID
 * @param {String} paramType 参数类型
 * @returns {String} 阈值范围字符串
 */
const getThresholdRange = (deviceId, paramType) => {
  const configs = thresholdMap.value[deviceId] || []
  const config = configs.find(c => c.paramType === paramType && c.isEnabled)
  if (config && config.thresholdMin != null && config.thresholdMax != null) {
    return `${config.thresholdMin}${config.unit || ''} - ${config.thresholdMax}${config.unit || ''}`
  }
  return '--'
}

/**
 * 根据设备类型和关键字获取设备ID
 * @param {Array} devices 设备列表
 * @param {String} keyword 关键字
 * @returns {String|null} 设备ID
 */
const getDeviceIdByType = (devices, keyword) => {
  const dev = devices.find(d => d.deviceTypeId == 1 && d.deviceName && d.deviceName.includes(keyword))
  return dev ? dev.id : null
}

/**
 * 读取设备数据缓存到 store
 */
const readDeviceDataMapCache = () => {
  const pastureId = currentPastureIdRef.value
  if (!pastureId) return
  const cacheKey = `deviceDataMap_${pastureId}`
  const cache = localStorage.getItem(cacheKey)
  if (cache) {
    try {
      const cacheObj = JSON.parse(cache)
      // 2小时内有效
      if (cacheObj.ts && (Date.now() - cacheObj.ts < 7200000)) {
        // 直接写入 store
        mqttStore.deviceDataMap = cacheObj.data
      } else {
        localStorage.removeItem(cacheKey)
      }
    } catch (e) {
      // 解析缓存失败
    }
  }
}
//日期格式化
function formatDateTime(date) {
  const pad = n => n < 10 ? '0' + n : n
  return date.getFullYear() + '-' +
    pad(date.getMonth() + 1) + '-' +
    pad(date.getDate()) + ' ' +
    pad(date.getHours()) + ':' +
    pad(date.getMinutes()) + ':' +
    pad(date.getSeconds())
}
/**
 * 获取设备名
 * @param {String} deviceId 设备ID
 * @returns {String} 设备名
 */
const getDeviceName = (deviceId) => {
  const dev = (props.deviceList || []).find(d => d.id == deviceId);
  return dev ? dev.deviceName : deviceId || '';
}

/**
 * 加载参数类型字典
 */
const loadParamTypeDict = async () => {
  try {
    const res = await ParamTypeDictService.listDict({})
    if (res && res.rows && Array.isArray(res.rows)) {
      // 加载中英文对照字典
      paramTypeDict.value = Object.fromEntries(
        res.rows.map(item => [item.paramTypeEn, item.paramTypeCn])
      )
      // 加载单位字典
      paramUnitDict.value = Object.fromEntries(
        res.rows.map(item => [item.paramTypeEn, item.unit || ''])
      )
    }
  } catch (e) {
    paramTypeDict.value = {}
    paramUnitDict.value = {}
  }
}

/**
 * 生成假数据（临时使用，等后端接口实现后删除）
 */
const generateMockWeatherData = () => {
  const now = new Date()
  const xAxisData = []
  const dataPoints = chartTimeRange.value === 'week' ? 7 : chartTimeRange.value === 'month' ? 30 : 24
  
  // 生成时间轴数据
  for (let i = dataPoints - 1; i >= 0; i--) {
    const time = new Date(now.getTime() - i * (chartTimeRange.value === 'week' ? 86400000 : chartTimeRange.value === 'month' ? 86400000 : 3600000))
    const timeStr = chartTimeRange.value === 'week' || chartTimeRange.value === 'month' 
      ? `${time.getMonth() + 1}/${time.getDate()}`
      : `${time.getHours()}:00`
    xAxisData.push(timeStr)
  }
  
  // 生成随机数据（带一些波动）
  const generateSeriesData = (base, range, trend = 0) => {
    return Array(dataPoints).fill(0).map((_, i) => {
      const baseValue = base + trend * (i / dataPoints)
      const random = (Math.random() - 0.5) * range
      return Math.round((baseValue + random) * 10) / 10
    })
  }
  
  return {
    xAxis: xAxisData,
    temperature: generateSeriesData(25, 8, -3), // 温度 17-33℃
    humidity: generateSeriesData(65, 20, 5), // 湿度 45-85%
    windSpeed: generateSeriesData(3, 2, 0.5), // 风速 1-5 m/s
    lightIntensity: generateSeriesData(8000, 4000, -2000) // 光照强度 4000-12000 Lux
  }
}

function resizeChart() {
  if (chartInstance) {
    chartInstance.resize()
  }
}
onMounted(() => {
  window.addEventListener('resize', resizeChart)
})
onBeforeUnmount(() => {
  window.removeEventListener('resize', resizeChart)
})


</script>

<style lang="scss" scoped>
.weather-quality {
  padding: 20px;
  
  .dashboard-header {
    margin-bottom: 20px;
    
    .dashboard-item {
      display: flex;
      align-items: center;
      
      .item-icon {
        width: 48px;
        height: 48px;
        border-radius: 8px;
        background-color: #409EFF;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-right: 12px;
        
        :deep(.el-icon) {
          font-size: 24px;
          color: #fff;
        }
        
        &.warning {
          background-color: #E6A23C;
        }
        
        &.success {
          background-color: #67C23A;
        }
        
        &.info {
          background-color: #909399;
        }
      }
      
      .item-info {
        flex: 1;
        
        .item-title {
          font-size: 14px;
          color: #909399;
        }
        
        .item-value {
          font-size: 24px;
          font-weight: bold;
          margin: 4px 0;
        }
        
        .item-compare {
          font-size: 12px;
          color: #909399;
          
          .up {
            color: #67C23A;
          }
          
          .down {
            color: #F56C6C;
          }
        }
      }
    }
  }
  
  .monitor-cards {
    margin-bottom: 20px;

    .box-card {
      .card-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      
      .card-content {
        text-align: center;
        
        .value {
          font-size: 24px;
          font-weight: bold;
          margin: 10px 0;
        }
        
        .range {
          color: #909399;
          font-size: 14px;
          margin-bottom: 10px;
        }
      }
    }
  }
  
  .trend-charts {
    margin-bottom: 20px;
    
    .chart-container {
      width: 100%;
      height: 400px;
    }
  }
  
  
  .warning-list {
    margin-bottom: 20px;
  }
  
  .control-panel {
    margin-bottom: 20px;
    
    .control-card {
      cursor: pointer;
      
      .control-item {
        text-align: center;
        
        :deep(.el-icon) {
          font-size: 24px;
          margin-bottom: 10px;
        }
        
        span {
          display: block;
          margin-bottom: 10px;
        }
        
        .control-buttons {
          display: flex;
          gap: 8px;
          justify-content: center;
          margin-bottom: 8px;
        }
        
        .last-execute {
          font-size: 12px;
          color: #909399;
        }
      }
    }
  }
  
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    
    .header-right {
      display: flex;
      gap: 10px;
    }
  }
  
  .analysis-chart,
  .correlation-chart,
  .anomaly-chart {
    height: 500px;
  }
}

.value.wind-direction-center {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 110px; /* 可根据实际高度调整 */
  font-size: 42px; /* 可根据实际需要调整 */
  font-weight: bold;
  box-sizing: border-box;
}
</style>