<template>
  <div class="weather-quality">
    <!-- 气象参数监测卡片区 -->
    <div class="monitor-cards">
      <el-row style="display: flex; justify-content: space-between;">
           <el-col style="width: 22%;" :span="4" v-for="item in monitorParams" :key="item.name">
          <el-card class="box-card">
            <template #header>
              <div class="card-header">
                <span>{{ item.label }}</span>
                <el-tag :type="item.status.type" size="small">{{ item.status.text }}</el-tag>
              </div>
            </template>
            <div class="card-content">
              <div
                class="value"
                :class="{ 'wind-direction-center': item.name === 'windDirection' }"
              >
                {{ item.value }} {{ item.unit }}
              </div>
              <div class="range" v-if="item.name !== 'windDirection'">安全范围: {{ item.range }}</div>
              <el-progress v-if="item.name !== 'windDirection'" :percentage="item.percentage" :color="item.status.color" />
              <div class="trend" v-if="item.name !== 'windDirection'">
                <span>24h趋势:</span>
                <el-tag v-if="item.trend" size="small" :type="item.trend.type">{{ item.trend.text }}</el-tag>
                <span v-else>--</span>
              </div>
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
              <el-select v-model="selectedParams" multiple size="small" style="width: 320px" placeholder="选择参数">
                <el-option
                  v-for="item in monitorParams.filter(i => i.name !== 'windDirection')"
                  :key="item.name"
                  :label="item.label"
                  :value="item.name"
                />
              </el-select>
              <el-radio-group v-model="chartTimeRange" size="small">
                <el-radio-button :value="'day'">24小时</el-radio-button>
                <el-radio-button :value="'week'">7天</el-radio-button>
                <el-radio-button :value="'month'">30天</el-radio-button>
                <el-radio-button :value="''">历史数据</el-radio-button>
              </el-radio-group>
            </div>
          </div>
        </template>
        <div class="chart-container" ref="trendChart" style="height: 400px; width: 100%;" v-loading="trendChartLoading"></div>
      </el-card>
    </div>


          <!-- 气象自动调节策略配置 -->
    <el-row :gutter="20" class="strategy-config" style="align-items: stretch;">
      <el-col :span="12" style="display: flex; flex-direction: column;display: none;">
        <el-card class="box-card" style="flex: 1;">
          <template #header>
            <div class="card-header">
              <span>自动调节策略</span>
              <el-button type="primary" size="small" @click="addStrategy">新增策略</el-button>
            </div>
          </template>
          <el-table :data="strategies" style="width: 100%">
            <el-table-column prop="parameter" label="监测参数">
              <template #default="scope">
                {{ paramTypeDict[scope.row.parameter] || scope.row.parameter }}
              </template>
            </el-table-column>
            <el-table-column label="触发条件" width="120">
              <template #default="scope">
                {{ scope.row.conditionOperator }} {{ scope.row.conditionValue }}{{ paramUnitMap[scope.row.parameter] || '' }}
              </template>
            </el-table-column>
            <el-table-column prop="executeDuration" label="执行时长(秒)" width="120" />
            <el-table-column label="执行动作/设备">
              <template #default="scope">
                {{ actionDict[scope.row.action] || scope.row.action }}
                {{ getDeviceName(scope.row.deviceId) }}
              </template>
            </el-table-column>
            <el-table-column prop="status" label="状态">
              <template #default="scope">
                <el-switch
                  v-model="scope.row.status"
                  :active-value="1"
                  :inactive-value="0"
                  @change="onStrategyStatusChange(scope.row)"
                />
              </template>
            </el-table-column>
            <el-table-column prop="description" label="策略说明" />

            <el-table-column label="操作" width="150">
              <template #default="scope">
                <el-button link size="small" @click="onEditStrategy(scope.row)">编辑</el-button>
                <el-button link size="small" @click="onDeleteStrategy(scope.row)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
      <el-col :span="24" style="display: flex; flex-direction: column;">
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
            <el-table-column prop="level" label="预警级别" width="200">
              <template #default="scope">
                <el-tag :type="scope.row.level === '严重' ? 'danger' : 'warning'">
                  {{ scope.row.level }}
                </el-tag>
              </template>
            </el-table-column>
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
          <!-- <el-table :data="alarmRules" style="width: 100%">
            <el-table-column prop="parameter" label="监测参数" width="120">
              <template #default="scope">
                {{ paramTypeDict[scope.row.parameter] || scope.row.parameter }}
              </template>
            </el-table-column>
            <el-table-column prop="threshold" label="阈值范围" width="200" />
            <el-table-column prop="level" label="报警级别" width="100">
              <template #default="scope">
                <el-tag :type="scope.row.level === '严重' ? 'danger' : 'warning'">
                  {{ scope.row.level }}
                </el-tag>
              </template>
            </el-table-column>
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
            <el-table-column prop="status" label="状态" width="100">
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
          </el-table> -->
        </el-card>
      </el-col>
    </el-row>

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
          <el-table-column prop="blockAddress" label="合约地址" />
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
          <!-- <el-table-column prop="alertType" label="偏低/偏高">
            <template #default="scope">
              <el-tag :type="scope.row.alertType === 'LOW' ? 'info' : 'danger'">
                {{ scope.row.alertType === 'LOW' ? '偏低' : '偏高' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="deviceName" label="设备" />
          <el-table-column prop="alertMessage" label="说明" /> -->
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
    

    <!-- 新增/编辑策略弹窗 -->
    <el-dialog
      v-model="strategyDialog"
      :title="editingStrategy ? '编辑策略' : '新增策略'"
      width="600px"
    >
      <el-form :model="strategyForm" label-width="100px">
        <!-- 监测参数 -->
        <el-form-item label="监测参数">
          <el-select v-model="strategyForm.parameter" placeholder="请选择参数">
              <el-option
                v-for="item in paramTypeDictList.filter(i =>
                  ['temperature', 'humidity', 'wind_speed', 'light_intensity', 'wind_direction'].includes(i.paramTypeEn)
                )"
                :key="item.paramTypeEn"
                :label="item.paramTypeCn"
                :value="item.paramTypeEn"
              />
            </el-select>
        </el-form-item>
        <!-- 触发条件 -->
        <el-form-item label="触发条件">
          <div style="display: flex; gap: 8px; align-items: center;">
            <el-select v-model="strategyForm.conditionOperator" placeholder="请选择" style="width: 120px;">
              <el-option label="等于" value="=" />
              <el-option label="大于" value=">" />
              <el-option label="小于" value="<" />
              <el-option label="大于等于" value=">=" />
              <el-option label="小于等于" value="<=" />
              <el-option label="不等于" value="!=" />
            </el-select>
            <el-input
              v-model="strategyForm.conditionValue"
              placeholder="请输入数值"
              style="width: 120px;"
              type="number"
            />
          </div>
        </el-form-item>
        <!-- 执行时长(秒) -->
        <el-form-item label="执行时长(秒)">
          <el-input
            v-model="strategyForm.executeDuration"
            placeholder="请输入执行时长"
            style="width: 120px;"
            type="number"
            min="0"
          />
        </el-form-item>
        <!-- 执行动作/设备 -->
        <el-form-item label="执行动作/设备">
          <div style="display: flex; align-items: center; gap: 12px; width: 100%;">
            <el-select
              v-model="strategyForm.action"
              placeholder="请选择动作"
              size="default"
              style="width: 120px;"
              @change="() => { strategyForm.deviceId = '' }"
              filterable
              clearable
            >
              <el-option label="打开" value="on" />
              <el-option label="关闭" value="off" />
            </el-select>
            <el-select
              v-model="strategyForm.deviceId"
              placeholder="请选择设备"
              size="default"
              style="width: 180px;"
              :disabled="!strategyForm.action"
              filterable
              clearable
            >
            <el-option
                v-for="item in props.deviceList.filter(d => d.isControllable == 1)"
                :key="item.id"
                :label="item.deviceName"
                :value="String(item.id)"
              />
            </el-select>
          </div>
        </el-form-item>
        <!-- 启用状态 -->
        <el-form-item label="启用状态">
          <el-switch v-model="strategyForm.status" :active-value="1" :inactive-value="0" />
        </el-form-item>
        <!-- 策略说明 -->
        <el-form-item label="策略说明">
          <el-input v-model="strategyForm.description" type="textarea" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button type="primary" @click="saveStrategy">确定</el-button>
          <el-button @click="strategyDialog = false">取消</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 编辑预警规则弹窗 -->
    <el-dialog v-model="editDialogVisible" title="编辑预警规则" width="500px">
      <el-form :model="editForm" label-width="100px">
        <el-form-item label="监测参数">
          <el-input :value="paramTypeDict[editForm.parameter] || editForm.parameter" disabled />
        </el-form-item>
        <el-form-item label="阈值范围">
          <el-input v-model="editForm.threshold" disabled />
        </el-form-item>
        <el-form-item label="预警级别">
          <el-select v-model="editForm.level" placeholder="请选择">
            <el-option label="严重" value="严重" />
            <el-option label="警告" value="警告" />
          </el-select>
        </el-form-item>
        <el-form-item label="通知方式">
          <el-select v-model="editForm.notify" placeholder="请选择">
            <el-option label="系统通知" value="系统通知" />
            <el-option label="强提醒" value="强提醒" />
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
import { AgricultureDeviceSensorAlertService } from '@/api/device/alertApi'// 报警信息API
import { useUserStore } from '@/store/modules/user'//获取用户API

// 2. 父组件传递的参数 props
const props = defineProps({
  pastureId: String,   // 大棚ID
  batchId: String,     // 分区ID
  deviceList: Array    // 设备列表
})
// 3. 变量/响应式数据定义

// --- Pinia store 相关 ---
const mqttStore = useMqttStore() // 获取 MQTT store 实例
const { weatherTrendData, deviceDataMap } = storeToRefs(mqttStore) // 解构出气象趋势数据和设备数据映射

// --- 阈值、字典、缓存相关 ---
const thresholdMap = ref({}) // 各设备阈值配置映射
const cachedTrendData = ref(null) // 气象趋势数据缓存
const paramTypeDict = ref({}) // 参数类型中英文对照字典
const paramTypeDictList = ref([]) //策略下拉框
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

// --- 策略相关 ---
const strategyLoading = ref(false) // 策略加载状态
const strategies = ref([]) // 自动调节策略列表
const paramUnitMap = {  //单位映射
  wind_speed: 'm/s',
  humidity: '%',
  temperature: '℃',
  light_intensity: 'Lux',
}
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
    const params = {
      pastureId: props.pastureId,
      batchId: props.batchId,
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
const selectedParams = ref(['temperature', 'humidity', 'windSpeed', 'lightIntensity']) // 选中的气象参数
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

// --- 策略弹窗相关 ---
const strategyDialog = ref(false) // 策略弹窗显示状态
const editingStrategy = ref(false) // 是否为编辑状态
const strategyForm = ref({
  pastureId: '',
  batchId: '',
  deviceId: '',
  strategyType: 'weather',
  parameter: '',
  conditionOperator: '',
  conditionValue: '',
  executeDuration: 0,
  action: '',
  status: 1,
  description: ''
}) // 策略表单


// 计算属性 computed
/**
 * 动态监测参数卡片
 * 根据 deviceList 设备类型，自动生成气象参数卡片，包含温度、湿度、风速、光照强度、风向等
 */
 const monitorParams = computed(() => {
  // 过滤出气象类设备
  const deviceListArr = (props.deviceList || []).filter(d => d.deviceTypeId == 1)
  // 获取各类设备ID
  const windSpeedId = getDeviceIdByType(deviceListArr, '风速')
  const windDirectionId = getDeviceIdByType(deviceListArr, '风向')
  const weatherId = getDeviceIdByType(deviceListArr, '气象') || getDeviceIdByType(deviceListArr, '百叶箱')

  // 获取各类设备数据
  const windSpeedData = windSpeedId ? deviceDataMap.value[windSpeedId] : null
  const windDirectionData = windDirectionId ? deviceDataMap.value[windDirectionId] : null
  const weatherData = weatherId ? deviceDataMap.value[weatherId] : null

  return [
    {
      name: 'temperature',
      label: '空气温度',
      value: weatherData?.temperature ?? '--',
      unit: '℃',
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
      description: '影响作物生长和蒸发量',
      trend: getTrend('temperature')
    },
    {
      name: 'humidity',
      label: '空气湿度',
      value: weatherData?.humidity ?? '--',
      unit: '%',
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
      description: '影响作物蒸腾和病害发生',
      trend: getTrend('humidity')
    },
    {
      name: 'windSpeed',
      label: '风速',
      value: windSpeedData?.windSpeed ?? '--',
      unit: 'm/s',
      range: getThresholdRange(windSpeedId, 'wind_speed'),
      percentage: (() => {
        const v = Number(windSpeedData?.windSpeed)
        const config = getThresholdConfig(windSpeedId, 'wind_speed')
        return config ? calcPercentage(v, config.thresholdMin, config.thresholdMax) : 0
      })(),
      status: (() => {
        const v = Number(windSpeedData?.windSpeed)
        const config = getThresholdConfig(windSpeedId, 'wind_speed')
        return config ? calcStatus(v, config.thresholdMin, config.thresholdMax) : { type: 'info', text: '无数据', color: '#909399' }
      })(),
      icon: Flag,
      description: '影响作物倒伏和蒸发',
      trend: getTrend('windSpeed')
    },
    {
      name: 'lightIntensity',
      label: '光照强度',
      value: weatherData?.lightIntensity ?? '--',
      unit: 'Lux',
      range: getThresholdRange(weatherId, 'light_intensity'),
      percentage: (() => {
        const v = Number(weatherData?.lightIntensity)
        const config = getThresholdConfig(weatherId, 'light_intensity')
        return config ? calcPercentage(v, config.thresholdMin, config.thresholdMax) : 0
      })(),
      status: (() => {
        const v = Number(weatherData?.lightIntensity)
        const config = getThresholdConfig(weatherId, 'light_intensity')
        return config ? calcStatus(v, config.thresholdMin, config.thresholdMax) : { type: 'info', text: '无数据', color: '#909399' }
      })(),
      icon: Sunny,
      description: '影响光合作用',
      trend: getTrend('lightIntensity')
    },
    {
      name: 'windDirection',
      label: '风向',
      value: windDirectionData?.windDirection ?? '--',
      unit: '',
      range: '',
      percentage: '', // 风向不做百分比
      status: { type: 'success', text: '无阈值', color: '#67C23A' }, // 风向不做阈值判断
      icon: Compass,
      description: '',
      trend: ''
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

// 侦听器 watch

/**
 * 侦听气象趋势数据 weatherTrendData 的变化
 * 1. 如果数据属于当前大棚/分区，则写入本地缓存
 */
 watch(
  weatherTrendData,
  (newVal) => {
    if (
      newVal &&
      newVal.deviceInfo &&
      String(newVal.deviceInfo.pastureId) === String(props.pastureId) &&
      String(newVal.deviceInfo.batchId) === String(props.batchId)
    ) {
      // 打印日志
      console.log('本页面大棚/分区趋势数据:', newVal)
      // 写入缓存
      const cacheKey = `weatherTrendData_${props.pastureId}_${props.batchId}`
      const cacheObj = {
        data: newVal,
        ts: Date.now() // 当前时间戳
      }
      localStorage.setItem(cacheKey, JSON.stringify(cacheObj))
      console.log(`[weatherTrendData] 已写入缓存:`, cacheKey, cacheObj)
    }
  },
  { immediate: true }
)

/**
 * 侦听 pastureId、batchId、deviceList 的变化
 * 1. 设备列表变化时加载阈值和订阅
 * 2. id变化时刷新报警规则、读取缓存
 * 3. id变化时读取趋势缓存
 * 4. 每次变化都请求气象趋势数据
 */
 watch(
  () => [props.pastureId, props.batchId, props.deviceList],
  async (
    [newPastureId, newBatchId, newDeviceList],
    [oldPastureId, oldBatchId, oldDeviceList] = []
  ) => {
    // 1. 设备列表变化时加载阈值和订阅
    if (newDeviceList !== oldDeviceList) {
      const weatherDevices = (newDeviceList || []).filter(d => d.deviceTypeId == 1)
      const deviceIds = weatherDevices.map(d => d.id)
      await loadThresholds(deviceIds)
      if (newDeviceList && newDeviceList.length > 0) {
        console.log('watch订阅设备列表:', newDeviceList)
        mqttStore.subscribeAllDeviceTopics(newDeviceList)
        loadStrategies(); // 加载自动策略
      }
    }
    // 2. id变化时刷新报警规则、读取缓存
    if (newPastureId !== oldPastureId || newBatchId !== oldBatchId) {
      // 先读取缓存，保证 deviceDataMap 有数据
      readDeviceDataMapCache()
      loadAlarmRules(newPastureId, newBatchId) // 刷新报警规则
      fetchWarningList() // <<=== 加载气象异常预警数据
    }
    // 3. id变化时读取趋势缓存
    if (newPastureId && newBatchId) {
      readTrendCache()
    }
    // 4. 每次变化都请求气象趋势数据
    fetchWeatherTrendData()
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
  if (props.pastureId && props.batchId) {
    const cacheKey = `deviceDataMap_${props.pastureId}_${props.batchId}`
    const cacheObj = {
      data: newVal,
      ts: Date.now()
    }
    localStorage.setItem(cacheKey, JSON.stringify(cacheObj))
    // console.log(`[deviceDataMap] 已写入缓存:`, cacheKey, cacheObj)
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
 * 3. 加载策略、报警规则、参数字典
 */
 onMounted(() => {
  // 先读取缓存，保证 deviceDataMap 有数据
  readDeviceDataMapCache()
  // 初始化 ECharts 实例
  nextTick(() => {
    if (trendChart.value) {
      chartInstance = echarts.init(trendChart.value)
      window._echarts = chartInstance // 可全局调试
      fetchWeatherTrendData()
    }
  })
  // 加载自动调节策略
  if (props.pastureId && props.batchId) {
    loadStrategies();
  }
  // 加载报警规则
  loadAlarmRules(props.pastureId, props.batchId)
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
// ========== 策略相关 ==========
/**
 * 加载自动调节策略列表
 */
 const loadStrategies = async () => {
  strategyLoading.value = true
  try {
    const params = {
      pastureId: props.pastureId,
      batchId: props.batchId,
      strategyType: 'weather'
    }
    // 只有有值时才加 deviceId
    if (strategyForm.value.deviceId) {
      params.deviceId = strategyForm.value.deviceId
    }
    // 策略API已删除
    // const res = await AgricultureAutoControlStrategyService.listStrategy(params)
    // if (res && Array.isArray(res.rows)) {
    //   strategies.value = res.rows;
    // } else {
    //   strategies.value = [];
    // }
    strategies.value = [];
  } finally {
    strategyLoading.value = false
  }
}

/**
 * 新增策略弹窗
 */
const addStrategy = () => {
  editingStrategy.value = false
  strategyForm.value = {
    pastureId: props.pastureId,
    batchId: props.batchId,
    deviceId: '',
    strategyType: 'weather',
    parameter: '',
    conditionOperator: '',
    conditionValue: '',
    executeDuration: 0,
    action: '',
    status: 1,
    description: ''
  }
  strategyDialog.value = true
}

/**
 * 编辑策略弹窗
 * @param {Object} row 策略行数据
 */
const onEditStrategy = (row) => {
  editingStrategy.value = true
  strategyForm.value = {
    ...row,
    deviceId: row.deviceId ? String(row.deviceId) : ''
  }
  strategyDialog.value = true
}

/**
 * 保存策略（新增或编辑）
 */
 const saveStrategy = async () => {
  if (!strategyForm.value.conditionOperator || !strategyForm.value.conditionValue) {
    ElMessage.warning('请填写完整的触发条件')
    return
  }
  try {
    // 策略API已删除
    // if (editingStrategy.value) {
    //   await AgricultureAutoControlStrategyService.updateStrategy(strategyForm.value)
    //   ElMessage.success('策略修改成功')
    // } else {
    //   await AgricultureAutoControlStrategyService.addStrategy(strategyForm.value)
    //   ElMessage.success('策略添加成功')
    // }
    ElMessage.warning('策略功能已移除')
    strategyForm.value.deviceId = ''
    strategyDialog.value = false
    loadStrategies()
  } catch (e) {
    ElMessage.error('操作失败')
  }
}

/**
 * 删除策略
 * @param {Object} row 策略行数据
 */
const onDeleteStrategy = async (row) => {
  try {
    await ElMessageBox.confirm('确定要删除该策略吗？', '提示', { type: 'warning' })
    // 策略API已删除
    // await AgricultureAutoControlStrategyService.deleteStrategy(row.id)
    ElMessage.warning('策略功能已移除')
    loadStrategies()
  } catch (e) {
    if (e !== 'cancel') ElMessage.error('删除失败')
  }
}

/**
 * 策略状态改变
 * @param {Object} row 策略行数据
 */
const onStrategyStatusChange = async (row) => {
  try {
    // 策略API已删除
    // await AgricultureAutoControlStrategyService.updateStrategy({
    //   ...row,
    //   status: row.status ? 1 : 0 // 1 或 0
    // });
    ElMessage.warning('策略功能已移除')
    // 恢复原状态
    row.status = !row.status
  } catch (e) {
    ElMessage.error('状态更新失败');
    // 恢复原状态
    row.status = !row.status
  }
};

// ========== 报警规则相关 ==========
/**
 * 加载报警规则
 * @param {String} pastureId 大棚ID
 * @param {String} batchId 分区ID
 */
const loadAlarmRules = async (pastureId, batchId) => {
  const deviceType = 1 // 设备类型
  if (!pastureId || !batchId) {
    alarmRules.value = []
    return
  }
  try {
    const res = await AgricultureThresholdConfigService.listByPastureAndBatch(pastureId, batchId, deviceType)
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
          level: item.alarmLevel === 'danger' ? '严重' : '警告',
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
    const alarmLevelMap = { '严重': 'danger', '警告': 'warning' }
    const notifyTypeMapReverse = { '系统通知': 'system', '强提醒': 'ring', '短信': 'sms' }
    await AgricultureThresholdConfigService.updateConfig({
      id: editForm.value.id,
      paramType: editForm.value.parameter,
      alarmLevel: alarmLevelMap[editForm.value.level] || 'warning',
      notifyType: notifyTypeMapReverse[editForm.value.notify] || 'system',
      isEnabled: editForm.value.status ? 1 : 0,
      remark: editForm.value.description,
    })
    ElMessage.success('保存成功')
    editDialogVisible.value = false
    loadAlarmRules(props.pastureId, props.batchId)
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
    loadAlarmRules(props.pastureId, props.batchId)
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
    loadAlarmRules(props.pastureId, props.batchId)
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
    if (props.pastureId && props.batchId) {
      // 气象数据API已删除
      // const res = await AgricultureWeatherDataService.getTrendData({
      //   pastureId: props.pastureId,
      //   batchId: props.batchId,
      //   range: chartTimeRange.value
      // })
      // if (res && res.code === 200 && res.data) {
      //   updateTrendChart(res.data)
      // }
    }
  } catch (error) {
    console.error('请求气象趋势数据失败:', error)
  } finally {
    trendChartLoading.value = false
  }
}

/**
 * 处理数据，生成 ECharts option 并渲染趋势图
 * @param {Object} data 趋势数据
 */
function updateTrendChart(data) {
  const xAxisData = data.xAxis
  const len = xAxisData.length

  function fixSeriesData(arr, len) {
    if (!arr) return Array(len).fill(0)
    const fixed = arr.map(v => v == null ? 0 : v)
    if (fixed.length < len) {
      return fixed.concat(Array(len - fixed.length).fill(0))
    }
    return fixed
  }

  // 参数映射
  const paramMap = {
    temperature: { name: '空气温度', data: fixSeriesData(data.temperature, len), unit: '℃' },
    humidity: { name: '空气湿度', data: fixSeriesData(data.humidity, len), unit: '%' },
    windSpeed: { name: '风速', data: fixSeriesData(data.windSpeed, len), unit: 'm/s' },
    lightIntensity: { name: '光照强度', data: fixSeriesData(data.lightIntensity, len), unit: 'Lux' }
  }

  // 只保留选中的参数
  const legendData = selectedParams.value.map(key => paramMap[key].name)
  const series = selectedParams.value.map(key => ({
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
    case '强提醒':
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
  ring: '强提醒',
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
 * 读取气象趋势数据缓存
 */
const readTrendCache = () => {
  const cacheKey = `weatherTrendData_${props.pastureId}_${props.batchId}`
  const cache = localStorage.getItem(cacheKey)
  if (cache) {
    try {
      const cacheObj = JSON.parse(cache)
      if (cacheObj.ts && (Date.now() - cacheObj.ts < 86400000)) { //缓存24小时
        cachedTrendData.value = cacheObj.data
        // console.log(`[weatherTrendData] 从缓存读取成功:`, cacheKey, cacheObj)
      } else {
        localStorage.removeItem(cacheKey)
        cachedTrendData.value = null
        // console.log(`[weatherTrendData] 缓存已过期，已清除:`, cacheKey, cacheObj)
      }
    } catch (e) {
      cachedTrendData.value = null
      console.log(`[weatherTrendData] 解析缓存失败:`, cacheKey, cache)
    }
  } else {
    console.log(`[weatherTrendData] 缓存不存在:`, cacheKey)
  }
}

/**
 * 趋势分析
 * @param {String} paramName 参数名
 * @returns {Object} 趋势对象（type, text）
 */
const getTrend = (paramName) => {
  let trendMsg = weatherTrendData.value
  if (
    !trendMsg ||
    !trendMsg.deviceInfo ||
    String(trendMsg.deviceInfo.pastureId) !== String(props.pastureId) ||
    String(trendMsg.deviceInfo.batchId) !== String(props.batchId)
  ) {
    trendMsg = cachedTrendData.value
  }
  if (
    trendMsg &&
    trendMsg.deviceInfo &&
    String(trendMsg.deviceInfo.pastureId) === String(props.pastureId) &&
    String(trendMsg.deviceInfo.batchId) === String(props.batchId) &&
    trendMsg.data &&
    trendMsg.data[paramName] &&
    trendMsg.data[paramName].trend
  ) {
    let type = 'info'
    if (trendMsg.data[paramName].trend === '上升') type = 'warning'
    else if (trendMsg.data[paramName].trend === '下降') type = 'warning'
    else if (trendMsg.data[paramName].trend === '剧烈下降') type = 'danger'
    else if (trendMsg.data[paramName].trend === '稳定') type = 'success'
    return { type, text: trendMsg.data[paramName].trend }
  }
  return { type: 'info', text: '--' }
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
  const cacheKey = `deviceDataMap_${props.pastureId}_${props.batchId}`
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
 * 动作英文转中文
 */
const actionDict = {
  on: '打开',
  off: '关闭'
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
      paramTypeDict.value = Object.fromEntries(
        res.rows.map(item => [item.paramTypeEn, item.paramTypeCn])
      )
      paramTypeDictList.value = res.rows
      
    }
  } catch (e) {
    paramTypeDict.value = {}
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
        
        .trend {
          margin-top: 10px;
          font-size: 14px;
          
          span {
            color: #909399;
            margin-right: 8px;
          }
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
  
  .strategy-config {
    margin-bottom: 20px;
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