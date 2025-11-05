<template>
  <el-dialog :title="device.deviceName + ' 配置'" v-model="visible" :width="dialogWidth" append-to-body>
    <el-tabs v-model="activeTab">
      <template v-if="props.device.deviceTypeId === '5'">
        <el-tab-pane label="摄像头参数" name="camera">
          <div style="display: flex; justify-content: center;">
            <el-form :model="cameraForm" :rules="cameraRules" ref="cameraFormRef" label-width="80px"
              style="width: 540px;">
              <!-- 表单项 -->
              <el-form-item label="用户名" prop="username">
                <el-input v-model="cameraForm.username" autocomplete="new-username" placeholder="请输入用户名" />
              </el-form-item>
              <el-form-item label="密码" prop="password">
                <el-input v-model="cameraForm.password" type="password" autocomplete="new-password"
                  placeholder="请输入密码" />
              </el-form-item>
              <el-form-item label="IP" prop="ip">
                <el-input v-model="cameraForm.ip" autocomplete="off" placeholder="如：192.168.31.198" />
              </el-form-item>
              <el-form-item label="端口" prop="port">
                <el-input v-model="cameraForm.port" autocomplete="off" placeholder="如：8000" />
              </el-form-item>
              <el-form-item label="通道" prop="channel">
                <el-input v-model="cameraForm.channel" autocomplete="off" placeholder="如：1" />
              </el-form-item>
              <el-form-item label="码流类型" prop="subtype">
                <el-select v-model="cameraForm.subtype" placeholder="请选择码流类型">
                  <el-option label="主码流" :value="0" />
                  <el-option label="子码流" :value="1" />
                </el-select>
              </el-form-item>

            </el-form>
          </div>
        </el-tab-pane>
      </template>
      <template v-else>
        <el-tab-pane label="阈值配置" name="threshold">
          <div>
            <div class="dialog-header">
              <span></span>
              <div class="header-buttons">
                <el-button type="primary" @click="showAddDialog">
                  <el-icon class="icon-with-margin">
                    <Plus />
                  </el-icon> 新建
                </el-button>
                <el-button type="danger" @click="deleteSelectedThresholds"
                  :disabled="!hasSelected || hasSelectedChanged">
                  <el-icon class="icon-with-margin">
                    <Delete />
                  </el-icon> 删除
                </el-button>
              </div>
            </div>
            <el-table ref="tableRef" :data="thresholds" style="width: 100%" @selection-change="handleSelectionChange">
              <el-table-column type="selection" width="55" :selectable="selectable" v-slot="{ row, $index }">
                <template v-if="!selectable(row, $index)">
                  <el-tooltip content="有变动未保存，无法取消选中" placement="top">
                    <span class="el-checkbox is-disabled el-checkbox--small custom-checkbox-disabled">
                      <span class="el-checkbox__input is-checked is-disabled custom-checkbox-disabled-input">
                        <span class="el-checkbox__inner"></span>
                      </span>
                    </span>
                  </el-tooltip>
                </template>
              </el-table-column>
              <el-table-column prop="name" label="监测项" width="120" />
              <el-table-column label="阈值范围" min-width="260">
                <template #default="{ row }">
                  <el-input-number v-model="row.min" :min="-9999" :max="999999" size="default" />
                  ~
                  <el-input-number v-model="row.max" :min="-9999" :max="999999" size="default" />
                </template>
              </el-table-column>
              <el-table-column prop="unit" label="单位" width="80">
                <template #default="{ row }">
                  <span style="color:#999;">
                    {{ row.unit || '—' }}
                  </span>
                </template>
              </el-table-column>
              <el-table-column prop="notifyType" label="通知方式" width="140">
                <template #default="{ row }">
                  <el-select v-model="row.notifyType" placeholder="请选择" style="width: 120px" class="notify-select">
                    <el-option label="系统通知" value="system" />
                    <el-option label="邮箱提醒" value="email" />
                    <el-option label="短信" value="sms" />
                  </el-select>
                </template>
              </el-table-column>

              <el-table-column label="告警开关" width="100">
                <template #default="{ row }">
                  <el-switch v-model="row.enabled" />
                </template>
              </el-table-column>


              <el-table-column label="备注" min-width="180">
                <template #default="{ row, $index }">
                  <template v-if="editingRemarkIndex === $index">
                    <el-input v-model="row.remark" size="small" @blur="stopEditRemark"
                      @keydown="(e) => handleRemarkKeydown(e as KeyboardEvent)" autofocus />
                  </template>
                  <template v-else>
                    <span class="remark-text" @click="startEditRemark($index)" style="cursor:pointer;color:#999;">
                      {{ row.remark || '—' }}
                    </span>
                  </template>
                </template>
              </el-table-column>
            </el-table>
            <!-- 新建阈值配置对话框 -->
            <el-dialog v-model="addDialogVisible" title="新建阈值配置" width="500px" append-to-body>
              <el-form ref="addFormRef" :model="newThreshold" :rules="rules" label-width="100px">
                <el-form-item label="参数类型" prop="paramType">
                  <el-select v-model="newThreshold.paramType" placeholder="请选择参数类型"
                    @change="onParamTypeChange">
                    <el-option v-for="item in paramTypeOptions" :key="item.value" :label="item.label"
                      :value="item.value" />
                    <template #footer>
                      <div style="padding: 8px 12px; text-align: center;">
                        <el-button type="primary" link @click.stop="showAddParamTypeDialog = true">+ 新增参数类型</el-button>
                      </div>
                    </template>
                  </el-select>
                </el-form-item>
                <el-form-item label="单位" prop="unit">
                  <el-input v-model="newThreshold.unit" placeholder="单位将自动填充" disabled />
                </el-form-item>
                <el-form-item label="阈值范围">
                  <el-col :span="11">
                    <el-form-item prop="thresholdMin">
                      <el-input-number v-model="newThreshold.thresholdMin" :precision="2" :step="0.1"
                        placeholder="最小值" />
                    </el-form-item>
                  </el-col>
                  <el-col :span="2" class="text-center">-</el-col>
                  <el-col :span="11">
                    <el-form-item prop="thresholdMax">
                      <el-input-number v-model="newThreshold.thresholdMax" :precision="2" :step="0.1"
                        placeholder="最大值" />
                    </el-form-item>
                  </el-col>
                </el-form-item>
                <el-form-item label="通知方式" prop="notifyType">
                  <el-select v-model="newThreshold.notifyType" placeholder="请选择通知方式">
                    <el-option label="系统通知" value="system" />
                    <el-option label="邮箱提醒" value="email" />
                    <el-option label="短信" value="sms" />
                  </el-select>
                </el-form-item>
                <el-form-item label="是否启用" prop="isEnabled">
                  <el-switch v-model="newThreshold.isEnabled" />
                </el-form-item>
                <el-form-item label="备注" prop="remark">
                  <el-input v-model="newThreshold.remark" type="textarea" placeholder="请输入备注信息" />
                </el-form-item>
              </el-form>
              <template #footer>
                <el-button @click="addDialogVisible = false">取消</el-button>
                <el-button type="primary" @click="submitNewThreshold">确定</el-button>
              </template>
            </el-dialog>
          </div>
        </el-tab-pane>
        <!-- MQTT配置 -->
        <el-tab-pane label="MQTT配置" name="mqtt">
          <div class="tab-content-center">
            <el-form :model="mqttForm" :rules="mqttRules" ref="mqttFormRef" label-width="140px" class="mqtt-form">
              <el-form-item label="MQTT Broker地址" prop="mqttBroker">
                <el-input v-model="mqttForm.mqttBroker" placeholder="如 tcp://ip:port" />
              </el-form-item>
              <el-form-item label="发布主题" prop="mqttTopic">
                <el-input v-model="mqttForm.mqttTopic" placeholder="如 greenhouse-management/air-data 或 greenhouse-management/soil-data" />
              </el-form-item>
              <el-form-item label="QOS等级" prop="mqttQos">
                <el-select v-model="mqttForm.mqttQos" placeholder="请选择QOS">
                  <el-option :label="'QoS 0 -不保证送达，性能最高，可能丢失消息'" :value="0" />
                  <el-option :label="'QoS 1 -保证送达，可能重复消息'" :value="1" />
                  <el-option :label="'QoS 2 -保证送达且不重复，可靠性最高，开销较大'" :value="2" />
                </el-select>
              </el-form-item>
              <el-form-item label="MQTT用户名" prop="mqttUsername">
                <el-input v-model="mqttForm.mqttUsername" autocomplete="off" name="mqtt-username-random" />
              </el-form-item>
              <el-form-item label="MQTT密码" prop="mqttPassword">
                <el-input v-model="mqttForm.mqttPassword" type="password" show-password autocomplete="new-password"
                  name="mqtt-password-random" />
              </el-form-item>
              <el-form-item label="备注" prop="remark">
                <el-input v-model="mqttForm.remark" type="textarea" />
              </el-form-item>
            </el-form>
          </div>
        </el-tab-pane>
        <!-- 数据采集配置 -->
        <el-tab-pane label="数据采集配置" name="sensor">
          <div class="tab-content-center">
            <el-form :model="heartbeatForm" :rules="heartbeatRules" ref="heartbeatFormRef" label-width="220px" style="width: 800px;">
              <el-form-item label="传感器指令(Modbus-RTU)">
                <el-input v-model="sensorCommand" placeholder="请输入指令" />
              </el-form-item>
              <el-form-item label="采集间隔(秒)">
                <el-input-number v-model="collectInterval" :min="1" :max="999999" placeholder="请输入采集间隔" style="width: 100%" />
              </el-form-item>
              <el-divider>心跳指令配置</el-divider>
              <el-form-item label="心跳指令(Modbus-RTU)" prop="heartbeatCmdHex">
                <el-input v-model="heartbeatForm.heartbeatCmdHex" placeholder="请输入心跳指令" />
              </el-form-item>
              <el-form-item label="发送间隔(秒)" prop="sendInterval">
                <el-input-number v-model="heartbeatForm.sendInterval" :min="1" :max="999999" placeholder="请输入发送间隔" style="width: 100%" />
              </el-form-item>
            </el-form>
          </div>
        </el-tab-pane>
      </template>
    </el-tabs>
    
    <!-- 底部按钮区域 -->
    <div class="dialog-footer" style="display:flex;justify-content:center;gap:12px;margin-top:24px;flex-wrap:wrap;">
      <el-button v-if="activeTab === 'camera'" type="primary" @click="saveCameraParams">保存</el-button>
      <el-button v-if="activeTab === 'mqtt'" type="primary" @click="onSaveMqtt">保存</el-button>
      <el-button v-if="activeTab === 'mqtt'" @click="onResetMqtt">重置</el-button>
      <el-button v-if="activeTab === 'sensor'" type="primary" @click="onSaveSensorConfig">保存</el-button>
      <el-button v-if="activeTab === 'threshold' && changedRowsCount > 0" type="primary"
        @click="changedRowsCount === 1 ? saveSelected() : saveAll()">{{ changedRowsCount === 1 ? '保存' : '全部保存'
        }}</el-button>
    </div>
    
    <!-- 新增参数类型对话框 -->
    <el-dialog v-model="showAddParamTypeDialog" title="新增参数类型" width="400px" append-to-body>
      <el-form :model="addParamTypeForm" :rules="addParamTypeRules" ref="addParamTypeFormRef" label-width="90px">
        <el-form-item label="中文名称" prop="paramTypeCn">
          <el-input v-model="addParamTypeForm.paramTypeCn" placeholder="请输入中文名称" />
        </el-form-item>
        <el-form-item label="英文名称" prop="paramTypeEn">
          <el-input v-model="addParamTypeForm.paramTypeEn" placeholder="请输入英文名称" />
        </el-form-item>
        <el-form-item label="单位" prop="unit">
          <el-input v-model="addParamTypeForm.unit" placeholder="请输入参数单位，如：℃、%、lux等" />
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="addParamTypeForm.remark" placeholder="请输入备注" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showAddParamTypeDialog = false">取消</el-button>
        <el-button type="primary" @click="submitAddParamType">确定</el-button>
      </template>
    </el-dialog>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, watch, nextTick, computed } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'
import { AgricultureThresholdConfigService } from '@/api/device/thresholdConfig'
import { AgricultureDeviceMqttConfigService } from '@/api/device/deviceConfigApi'
import { AgricultureDeviceService } from '@/api/device/deviceApi'
import { AgricultureDeviceHeartbeatService } from '@/api/device/deviceheartbeatApi'
import { ElMessage } from 'element-plus'
import { cloneDeep, isEqual } from 'lodash-es'
import { Plus, Delete } from '@element-plus/icons-vue'
import { ParamTypeDictService } from '@/api/device/typedictApi'
import { AgricultureCameraService } from '@/api/device/cameraApi'
import { AgricultureDeviceTypeService } from '@/api/device/devicetypeApi'

const props = defineProps<{
  modelValue: boolean,
  device: any,
  thresholds?: any[],
  mqttConfig?: any,
  sensorCommand?: string
}>()

const CAMERA_TYPE_ID = '5'
const cameraForm = reactive({
  id: '',
  username: '',
  password: '',
  ip: '',
  port: '',
  channel: '',
  subtype: 0
})
const cameraFormRef = ref<FormInstance>()
const cameraRules = reactive({
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
  ip: [{ required: true, message: '请输入IP', trigger: 'blur' }],
  port: [{ required: true, message: '请输入端口', trigger: 'blur' }],
  channel: [{ required: true, message: '请输入通道', trigger: 'blur' }],
  subtype: [{ required: true, message: '请选择码流类型', trigger: 'change' }]
})

async function saveCameraParams() {
  if (!cameraFormRef.value) return
  cameraFormRef.value.validate(async (valid: boolean) => {
    if (!valid) return
    let res
    const data = { ...cameraForm, deviceId: props.device.id }
    if (cameraForm.id) {
      res = await AgricultureCameraService.updateCamera(data)
    } else {
      res = await AgricultureCameraService.addCamera(data)
    }
    if (res && res.code === 200) {
      ElMessage.success('保存成功')
    } else {
      ElMessage.error(res.msg || '保存失败')
    }
  })
}
const emit = defineEmits(['update:modelValue'])

const visible = ref(props.modelValue)
const activeTab = ref('threshold')

watch(() => props.modelValue, v => visible.value = v)
watch(visible, v => {
  emit('update:modelValue', v)
  if (v) {
    // 弹窗打开时先清空表单，再获取数据
    Object.assign(heartbeatForm.value, { ...heartbeatFormInitial })
    // 弹窗打开时自动选中第一个tab
    if (props.device?.deviceTypeId === CAMERA_TYPE_ID) {
      activeTab.value = 'camera'
    } else {
      activeTab.value = 'threshold'
    }
    // 根据设备类型获取参数类型选项（会过滤）
    fetchParamTypeOptions()
    fetchMqttConfig()
    fetchSensorCommand()
    fetchHeartbeatConfig()
  }
})

// 阈值配置相关
const thresholds = ref<any[]>(props.thresholds || [])
const originalThresholds = ref<any[]>([])
const addDialogVisible = ref(false)
const addFormRef = ref<FormInstance>()
const editingRemarkIndex = ref<number | null>(null)
const tableRef = ref()
const selectedRows = ref<any[]>([])
const hasSelected = ref(false)

// 参数类型下拉选项
const paramTypeOptions = ref<any[]>([])
// 参数类型完整数据（包含unit等信息）
const paramTypeDictData = ref<any[]>([])

const notifyTypeMap: Record<string, string> = {
  system: '系统通知',
  email: '邮箱提醒',
  sms: '短信'
}
// 判断是否为气象传感器
function isWeatherSensor(deviceTypeName?: string): boolean {
  if (!deviceTypeName) return false
  const typeName = deviceTypeName.toLowerCase()
  return typeName.includes('气象') || 
         typeName.includes('天气') || 
         typeName.includes('weather') ||
         typeName.includes('air')
}

// 判断是否为土壤传感器
function isSoilSensor(deviceTypeName?: string): boolean {
  if (!deviceTypeName) return false
  const typeName = deviceTypeName.toLowerCase()
  return typeName.includes('土壤') || 
         typeName.includes('soil')
}

// 获取设备类型名称
async function getDeviceTypeName(): Promise<string | undefined> {
  // 优先使用设备对象中的设备类型名称
  if (props.device?.deviceTypeName) {
    return props.device.deviceTypeName
  }
  
  // 如果没有设备类型名称，通过设备类型ID查询
  if (props.device?.deviceTypeId) {
    try {
      const res = await AgricultureDeviceTypeService.getType(props.device.deviceTypeId)
      if (res && res.code === 200 && res.data) {
        return res.data.typeName
      }
    } catch (e) {
      console.error('获取设备类型信息失败:', e)
    }
  }
  
  return undefined
}

// 获取参数类型数据（下拉选项）
async function fetchParamTypeOptions() {
  try {
    const res = await ParamTypeDictService.listDict({ pageNum: 1, pageSize: 100 })
    if (res && res.code === 200 && res.rows) {
      // 保存完整数据，用于后续查找unit
      paramTypeDictData.value = res.rows
      
      // 获取设备类型名称
      const deviceTypeName = await getDeviceTypeName()
      let filteredRows = res.rows
      
      if (isWeatherSensor(deviceTypeName)) {
        // 气象传感器：只显示气象相关参数（排除soil开头的参数）
        filteredRows = res.rows.filter((item: any) => {
          const paramTypeEn = (item.paramTypeEn || '').toLowerCase()
          // 排除土壤相关参数
          return !paramTypeEn.startsWith('soil') && 
                 !paramTypeEn.includes('conductivity') && 
                 !paramTypeEn.includes('phvalue') && 
                 !paramTypeEn.includes('salinity') && 
                 !paramTypeEn.includes('nitrogen') && 
                 !paramTypeEn.includes('phosphorus') && 
                 !paramTypeEn.includes('potassium')
        })
      } else if (isSoilSensor(deviceTypeName)) {
        // 土壤传感器：只显示土壤相关参数
        filteredRows = res.rows.filter((item: any) => {
          const paramTypeEn = (item.paramTypeEn || '').toLowerCase()
          // 包含土壤相关参数
          return paramTypeEn.startsWith('soil') || 
                 paramTypeEn.includes('conductivity') || 
                 paramTypeEn.includes('phvalue') || 
                 paramTypeEn.includes('salinity') || 
                 paramTypeEn.includes('nitrogen') || 
                 paramTypeEn.includes('phosphorus') || 
                 paramTypeEn.includes('potassium')
        })
      }
      
      // 构建下拉选项
      paramTypeOptions.value = filteredRows.map((item: any) => ({
        label: item.paramTypeCn, // 中文名
        value: item.paramTypeEn  // 英文名，作为实际值
      }))
    }
  } catch (e) {
    paramTypeOptions.value = []
    paramTypeDictData.value = []
  }
}

// 参数类型选择变化时，自动填充单位
function onParamTypeChange(value: string) {
  if (value) {
    // 从保存的完整数据中查找对应的参数类型
    const paramType = paramTypeDictData.value.find(item => item.paramTypeEn === value)
    if (paramType && paramType.unit) {
      newThreshold.unit = paramType.unit
    } else {
      newThreshold.unit = ''
    }
  } else {
    newThreshold.unit = ''
  }
}

watch(
  () => props.thresholds,
  (val) => {
    thresholds.value = (val || [])
    originalThresholds.value = cloneDeep(thresholds.value)
  },
  { immediate: true }
)

function rowChanged(row: any, index: number) {
  return !isEqual(row, originalThresholds.value[index])
}

function handleSelectionChange(selection: any[]) {
  const changedRows = thresholds.value
    .map((row, idx) => rowChanged(row, idx) ? row : null)
    .filter(Boolean)
  nextTick(() => {
    if (tableRef.value) {
      changedRows.forEach(row => {
        tableRef.value.toggleRowSelection(row, true)
      })
    }
  })
  selectedRows.value = [
    ...changedRows,
    ...selection.filter(row => !changedRows.includes(row))
  ]
  hasSelected.value = selectedRows.value.length > 0
}

function addNewThreshold() {
  const newThreshold = {
    key: 'new_' + Date.now(),
    name: '新建监测项',
    min: 0,
    max: 100,
    unit: '',
    enabled: true,
    editing: true,
    notifyType: []
  }
  thresholds.value.push(newThreshold)
}

async function deleteSelectedThresholds() {
  if (selectedRows.value.length === 0) return
  try {
    const promises = selectedRows.value.map(row => {
      if (row.id) {
        return AgricultureThresholdConfigService.deleteConfig(row.id)
      }
      return Promise.resolve()
    })
    await Promise.all(promises)
    await fetchThresholds()
    selectedRows.value = []
    hasSelected.value = false
    ElMessage.success('删除成功')
  } catch (error) {
    ElMessage.error('删除失败')
  }
}

function editRow(row: any) {
  row.editing = true
}

async function saveSelected() {
  try {
    const promises = selectedRows.value.map(row => {
      const data = {
        deviceId: props.device.id,
        deviceType: row.deviceType,
        paramType: getParamTypeEnByName(row.name), // 这里做转换
        thresholdMin: row.min,
        thresholdMax: row.max,
        isEnabled: row.enabled ? 1 : 0,
        unit: row.unit,
        notifyType: Array.isArray(row.notifyType) ? row.notifyType.join(',') : row.notifyType,
        remark: row.remark
      }
      if (row.id) {
        return AgricultureThresholdConfigService.updateConfig({ ...data, id: row.id })
      } else {
        return AgricultureThresholdConfigService.addConfig(data)
      }
    })
    await Promise.all(promises)
    ElMessage.success('保存成功')
    await fetchThresholds()
  } catch (error) {
    ElMessage.error('保存失败')
  }
}

async function saveAll() {
  try {
    const promises = thresholds.value.map(row => {
      const data = {
        deviceId: props.device.id,
        deviceType: row.deviceType,
        paramType: getParamTypeEnByName(row.name),
        thresholdMin: row.min,
        thresholdMax: row.max,
        isEnabled: row.enabled ? 1 : 0,
        unit: row.unit,
        notifyType: Array.isArray(row.notifyType) ? row.notifyType.join(',') : row.notifyType,
        remark: row.remark
      }
      if (row.id) {
        return AgricultureThresholdConfigService.updateConfig({ ...data, id: row.id })
      } else {
        return AgricultureThresholdConfigService.addConfig(data)
      }
    })
    await Promise.all(promises)
    thresholds.value.forEach(row => (row.editing = false))
    ElMessage.success('保存成功')
    await fetchThresholds()
  } catch (error) {
    ElMessage.error('保存失败')
  }
}

const newThreshold = reactive({
  deviceType: '',
  paramType: '',
  unit: '',
  thresholdMin: undefined as number | undefined,
  thresholdMax: undefined as number | undefined,
  notifyType: [],
  isEnabled: true,
  remark: ''
})

const rules = reactive<FormRules>({
  paramType: [{ required: true, message: '请输入参数类型', trigger: 'blur' }],
  unit: [{ required: true, message: '请输入单位', trigger: 'blur' }],
  thresholdMin: [{ required: true, message: '请输入最小值', trigger: 'blur' }],
  thresholdMax: [{ required: true, message: '请输入最大值', trigger: 'blur' }],
  notifyType: [{ required: true, message: '请选择通知方式', trigger: 'change' }]
})

// 打开新增阈值对话框时，重置表单并拉取参数类型
function showAddDialog() {
  addDialogVisible.value = true
  Object.assign(newThreshold, {
    deviceType: props.device.deviceType,
    paramType: '',
    unit: '',
    thresholdMin: undefined,
    thresholdMax: undefined,
    isEnabled: true,
    remark: '',
    notifyType: []
  })
  fetchParamTypeOptions()
}

async function submitNewThreshold() {
  if (!addFormRef.value) return
  addFormRef.value.validate(async (valid) => {
    if (valid) {
      try {
        const data = {
          deviceId: props.device.id,
          deviceType: props.device.deviceType,
          paramType: newThreshold.paramType,
          unit: newThreshold.unit,
          thresholdMin: newThreshold.thresholdMin,
          thresholdMax: newThreshold.thresholdMax,
          notifyType: Array.isArray(newThreshold.notifyType) ? newThreshold.notifyType.join(',') : newThreshold.notifyType,
          isEnabled: newThreshold.isEnabled ? 1 : 0,
          remark: newThreshold.remark
        }
        await AgricultureThresholdConfigService.addConfig(data)
        addDialogVisible.value = false
        await fetchThresholds()
        ElMessage.success('添加成功')
      } catch (error) {
        ElMessage.error('添加失败')
      }
    }
  })
}

function startEditRemark(index: number) {
  editingRemarkIndex.value = index
}
function stopEditRemark() {
  editingRemarkIndex.value = null
}
function handleRemarkKeydown(e: KeyboardEvent) {
  if (e.key === 'Enter') {
    stopEditRemark()
  }
}

watch(
  thresholds,
  (val) => {
    const changedRows = val
      .map((row, idx) => rowChanged(row, idx) ? row : null)
      .filter(Boolean)
    selectedRows.value = changedRows
    hasSelected.value = changedRows.length > 0
    nextTick(() => {
      if (tableRef.value) {
        tableRef.value.clearSelection()
        changedRows.forEach(row => {
          tableRef.value.toggleRowSelection(row, true)
        })
      }
    })
  },
  { deep: true }
)

function selectable(row: any, index: number) {
  return !rowChanged(row, index)
}

// 获取阈值配置列表，并将英文参数类型转为中文名显示
async function fetchThresholds() {
  if (!props.device?.id) return
  try {
    const res = await AgricultureThresholdConfigService.listByDeviceId(props.device.id)
    const list = res?.data || []
    // 获取参数类型映射表（英文->中文）
    // 使用完整的paramTypeDictData，而不是过滤后的paramTypeOptions，确保所有参数都能找到中文名
    let paramTypeMap: Record<string, string> = {}
    if (paramTypeDictData.value.length === 0) {
      await fetchParamTypeOptions()
    }
    // 使用完整的参数类型字典数据构建映射表
    paramTypeDictData.value.forEach((item: any) => {
      paramTypeMap[item.paramTypeEn] = item.paramTypeCn
    })
    thresholds.value = list.map((t: any) => ({
      ...t,
      name: paramTypeMap[t.paramType] || t.paramType,
      min: t.thresholdMin,
      max: t.thresholdMax,
      enabled: t.isEnabled === 1,
      notifyType: t.notifyType || '',
      remark: t.remark,
      unit: t.unit
    }))
    originalThresholds.value = cloneDeep(thresholds.value)
  } catch (e) {
    thresholds.value = []
    originalThresholds.value = []
  }
}

watch(
  () => props.device?.id,
  (id, oldId) => {
    // 设备ID变化时，先清空心跳表单，再获取新数据
    if (id && id !== oldId) {
      Object.assign(heartbeatForm.value, { ...heartbeatFormInitial })
    }
    if (id) {
      fetchThresholds()
      fetchMqttConfig()
      fetchSensorCommand()
      fetchHeartbeatConfig()
    }
  },
  { immediate: true }
)

// 监听设备类型ID变化，重新获取参数类型选项
watch(
  () => props.device?.deviceTypeId,
  (deviceTypeId, oldDeviceTypeId) => {
    // 设备类型变化时，重新获取参数类型选项（会根据设备类型过滤）
    if (deviceTypeId && deviceTypeId !== oldDeviceTypeId) {
      fetchParamTypeOptions()
    }
  },
  { immediate: false }
)

// 监听设备类型名称变化，重新获取参数类型选项
watch(
  () => props.device?.deviceTypeName,
  (deviceTypeName, oldDeviceTypeName) => {
    // 设备类型名称变化时，重新获取参数类型选项（会根据设备类型过滤）
    if (deviceTypeName && deviceTypeName !== oldDeviceTypeName) {
      fetchParamTypeOptions()
    }
  },
  { immediate: false }
)

const hasSelectedChanged = computed(() =>
  selectedRows.value.some((row) => {
    const idx = thresholds.value.findIndex(r => (r.key && row.key && r.key === row.key) || (r.id && row.id && r.id === row.id))
    return idx !== -1 && rowChanged(row, idx)
  })
)

const changedRowsCount = computed(() => {
  return thresholds.value.filter((row, idx) => rowChanged(row, idx)).length
})

// MQTT配置相关
const mqttFormInitial = {
  id: undefined,
  mqttBroker: '',
  mqttTopic: '',
  mqttQos: 0,
  mqttUsername: '',
  mqttPassword: '',
  remark: ''
}
const mqttForm = ref({ ...mqttFormInitial })
const mqttFormRef = ref<FormInstance>()
const mqttRules = {
  mqttBroker: [{ required: true, message: '请输入MQTT Broker地址', trigger: 'blur' }],
  mqttTopic: [{ required: true, message: '请输入订阅主题', trigger: 'blur' }],
  mqttQos: [{ required: true, message: '请选择QOS等级', trigger: 'change' }],
  mqttUsername: [{ required: true, message: '请输入MQTT用户名', trigger: 'blur' }],
  mqttPassword: [{ required: true, message: '请输入MQTT密码', trigger: 'blur' }]
} as FormRules

watch(() => props.mqttConfig, (val) => {
  if (val) Object.assign(mqttForm.value, val)
}, { immediate: true })

async function fetchMqttConfig() {
  if (!props.device?.id) return
  try {
    const res: any = await AgricultureDeviceMqttConfigService.getConfigByDeviceId(props.device.id)
    if (res && res.code === 200 && res.data) {
      Object.assign(mqttForm.value, mqttFormInitial)
      Object.assign(mqttForm.value, res.data)
    } else {
      Object.assign(mqttForm.value, mqttFormInitial)
    }
  } catch (e) {
    Object.assign(mqttForm.value, mqttFormInitial)
  }
}

async function onSaveMqtt() {
  if (!mqttFormRef.value) {
    ElMessage.warning('表单未初始化')
    return
  }
  mqttFormRef.value.validate(async (valid) => {
    if (!valid) {
      ElMessage.warning('请检查表单填写是否正确')
      return
    }
    try {
      if (mqttForm.value.id) {
        await AgricultureDeviceMqttConfigService.updateConfig({
          ...mqttForm.value,
          deviceId: props.device.id
        })
      } else {
        await AgricultureDeviceMqttConfigService.addConfig({
          ...mqttForm.value,
          deviceId: props.device.id
        })
      }
      ElMessage.success('保存成功')
      await fetchMqttConfig()
    } catch (e) {
      ElMessage.error('保存失败：' + (e as Error).message || '未知错误')
    }
  })
}

function onResetMqtt() {
  fetchMqttConfig()
}

// 传感器指令配置相关
const sensorCommand = ref(props.sensorCommand || '')
watch(() => props.sensorCommand, (val) => {
  sensorCommand.value = val || ''
})

// 采集间隔配置相关
const collectInterval = ref<number | undefined>(undefined)
watch(() => props.device?.collectInterval, (val) => {
  collectInterval.value = val ? Number(val) : undefined
})

// 获取设备指令
async function fetchSensorCommand() {
  if (!props.device?.id) return
  try {
    const res = await AgricultureDeviceService.getDevice(props.device.id)
    sensorCommand.value = res.data?.sensorCommand || ''
    collectInterval.value = res.data?.collectInterval ? Number(res.data.collectInterval) : undefined
  } catch (e) {
    sensorCommand.value = ''
    collectInterval.value = undefined
  }
}

// 统一保存数据采集配置（传感器指令、采集间隔、心跳指令）
async function onSaveSensorConfig() {
  if (!heartbeatFormRef.value) {
    ElMessage.warning('表单未初始化')
    return
  }
  
  // 验证心跳指令表单
  const valid = await new Promise<boolean>((resolve) => {
    heartbeatFormRef.value?.validate((isValid: boolean) => {
      resolve(isValid)
    })
  })
  
  if (!valid) {
    ElMessage.warning('请检查表单填写是否正确')
    return
  }
  
  try {
    // 1. 保存设备配置（传感器指令和采集间隔）
    await AgricultureDeviceService.updateDevice({
      id: props.device.id,
      sensorCommand: sensorCommand.value,
      collectInterval: collectInterval.value
    })
    
    // 2. 保存心跳指令配置
    const data = {
      deviceId: props.device.id,
      heartbeatCmdHex: heartbeatForm.value.heartbeatCmdHex,
      sendInterval: heartbeatForm.value.sendInterval
    }
    let res: any
    if (heartbeatForm.value.id) {
      res = await AgricultureDeviceHeartbeatService.updateHeartbeat({
        ...data,
        id: heartbeatForm.value.id
      })
    } else {
      res = await AgricultureDeviceHeartbeatService.addHeartbeat(data)
      // 新增成功后，保存返回的id
      if (res && res.code === 200 && res.data) {
        heartbeatForm.value.id = res.data.id || res.data
      }
    }
    
    if (res && res.code === 200) {
      ElMessage.success('保存成功')
      // 延迟一下再刷新，确保数据已保存到数据库
      await new Promise(resolve => setTimeout(resolve, 100))
      await fetchHeartbeatConfig()
    } else {
      ElMessage.error(res?.msg || '保存失败')
    }
  } catch (e) {
    ElMessage.error('保存失败：' + ((e as Error).message || '未知错误'))
  }
}

// 心跳指令配置相关
const heartbeatFormInitial = {
  id: undefined,
  heartbeatCmdHex: '',
  sendInterval: undefined as number | undefined
}
const heartbeatForm = ref({ ...heartbeatFormInitial })
const heartbeatFormRef = ref<FormInstance>()
const heartbeatRules = {
  heartbeatCmdHex: [{ required: false, message: '请输入心跳指令', trigger: 'blur' }],
  sendInterval: [{ required: false, message: '请输入发送间隔', trigger: 'blur' }]
} as FormRules

async function fetchHeartbeatConfig() {
  if (!props.device?.id) return
  try {
    // 通过列表查询，根据deviceId筛选
    const res: any = await AgricultureDeviceHeartbeatService.listHeartbeat({
      deviceId: props.device.id,
      pageNum: 1,
      pageSize: 1
    })
    if (res && res.code === 200 && res.rows && res.rows.length > 0) {
      const heartbeatData = res.rows[0]
      // 验证返回的数据的deviceId是否匹配当前设备
      if (heartbeatData.deviceId === props.device.id || String(heartbeatData.deviceId) === String(props.device.id)) {
        Object.assign(heartbeatForm.value, {
          id: heartbeatData.id,
          heartbeatCmdHex: heartbeatData.heartbeatCmdHex || '',
          sendInterval: heartbeatData.sendInterval ? Number(heartbeatData.sendInterval) : undefined
        })
      } else {
        // 如果deviceId不匹配，清空表单
        Object.assign(heartbeatForm.value, { ...heartbeatFormInitial })
      }
    } else {
      Object.assign(heartbeatForm.value, { ...heartbeatFormInitial })
    }
  } catch (e) {
    Object.assign(heartbeatForm.value, { ...heartbeatFormInitial })
  }
}


const dialogWidth = computed(() => {
  if (props.device?.deviceTypeId === '5') {
    return '620px'
  }
  if (activeTab.value === 'threshold') {
    return '1300px'
  }
  return '900px'
})

// 新增参数类型弹窗显示控制
const showAddParamTypeDialog = ref(false)
// 新增参数类型表单引用
const addParamTypeFormRef = ref<FormInstance>()
// 新增参数类型表单数据
const addParamTypeForm = reactive({
  paramTypeCn: '', // 中文名称
  paramTypeEn: '', // 英文名称
  unit: '',        // 单位
  remark: ''       // 备注
})
// 新增参数类型表单校验规则
const addParamTypeRules = reactive<FormRules>({
  paramTypeCn: [{ required: true, message: '请输入中文名称', trigger: 'blur' }],
  paramTypeEn: [{ required: true, message: '请输入英文名称', trigger: 'blur' }]
})

// 下拉框显示时自动刷新选项
function onParamTypeDropdownVisible(visible: boolean) {
  if (visible && paramTypeOptions.value.length === 0) {
    fetchParamTypeOptions()
  }
}

// 新增参数类型提交
async function submitAddParamType() {
  if (!addParamTypeFormRef.value) return
  addParamTypeFormRef.value.validate(async (valid) => {
    if (valid) {
      try {
        const data = {
          paramTypeCn: addParamTypeForm.paramTypeCn, // 中文名
          paramTypeEn: addParamTypeForm.paramTypeEn, // 英文名
          unit: addParamTypeForm.unit,               // 单位
          remark: addParamTypeForm.remark            // 备注
        }
        await ParamTypeDictService.addDict(data) // 调用API新增
        ElMessage.success('新增成功')
        showAddParamTypeDialog.value = false
        // 刷新下拉选项并选中新添加的类型
        await fetchParamTypeOptions()
        newThreshold.paramType = addParamTypeForm.paramTypeEn
        // 手动触发单位填充（因为新增的类型会自动选中）
        onParamTypeChange(addParamTypeForm.paramTypeEn)
        // 清空表单
        addParamTypeForm.paramTypeCn = ''
        addParamTypeForm.paramTypeEn = ''
        addParamTypeForm.unit = ''
        addParamTypeForm.remark = ''
      } catch (e) {
        ElMessage.error('新增失败')
      }
    }
  })
}

// 找中英文映射
function getParamTypeEnByName(name: string) {
  const found = paramTypeOptions.value.find(item => item.label === name)
  return found ? found.value : name // 如果找不到就返回原值
}

watch(
  () => props.device,
  async (device) => {
    if (device && device.deviceTypeId === CAMERA_TYPE_ID && device.id) {
      // 查询摄像头参数
      const res = await AgricultureCameraService.getCameraByDeviceId(device.id)
      if (res && res.code === 200 && res.data) {
        Object.assign(cameraForm, res.data)
      } else {
        cameraForm.id = ''
        cameraForm.username = ''
        cameraForm.password = ''
        cameraForm.ip = ''
        cameraForm.port = ''
        cameraForm.channel = ''
        cameraForm.subtype = 0
      }
    }
  },
  { immediate: true }
)

</script>

<style scoped>
.mqtt-form {
  min-width: 600px;
  max-width: 700px;
  margin: 0 auto;
}

.mqtt-form .el-form-item__label {
  white-space: nowrap;
}

.tab-content-center {
  display: flex;
  justify-content: center;
  align-items: flex-start;
  min-height: 400px;
}

.dialog-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.header-buttons {
  display: flex;
  gap: 8px;
  margin-right: 32px;
}

.text-center {
  text-align: center;
  line-height: 32px;
}

.remark-text:hover {
  color: #409EFF;
  text-decoration: underline;
}

.icon-with-margin {
  margin-right: 6px;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
}

/* 修复通知方式下拉框的样式问题 */
.notify-select {
  margin-right: 8px;
}

.notify-select :deep(.el-select__wrapper) {
  border-radius: 4px;
}

.notify-select :deep(.el-select__caret) {
  color: #c0c4cc;
  font-size: 12px;
  transition: transform 0.3s;
}

.notify-select :deep(.el-select__caret.is-reverse) {
  transform: rotateZ(180deg);
}

/* 防止指令配置标签换行 */
:deep(.el-form-item__label) {
  white-space: nowrap;
}
</style>