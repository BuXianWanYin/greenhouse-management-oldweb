<template>
  <el-dialog :title="device.deviceName" v-model="dialogVisible" width="750px" append-to-body>
    <template #title>
      {{ device.deviceName }}
      <el-tag :type="currentStatus === 'online' ? 'success' : currentStatus === 'fault' ? 'danger' : 'info'"
        :class="['tag-margin-left', { 'tag-offline': currentStatus === 'offline' }]">
        {{ currentStatus === 'online' ? '在线' : currentStatus === 'fault' ? '故障' : '离线' }}
      </el-tag>
      <span class="device-switch-title">
        <span class="switch-label">设备开关</span>
        <el-tooltip v-if="props.device?.status === '0'" content="设备未成功接入终端,请联系管理员！" placement="top">
          <el-switch v-model="deviceOn" @change="handleSwitchChange" :disabled="true" />
        </el-tooltip>
        <el-switch v-else v-model="deviceOn" @change="handleSwitchChange" />
      </span>
    </template>
    <div class="weather-status-content">
      <!-- 左侧数据 -->
      <div class="weather-data">
        <div class="data-list">
          <div v-for="item in dataList" :key="item.label" :class="['custom-data-tag', item.bgClass, item.borderClass]">
            <span :class="['custom-icon', item.colorClass]">
              <component :is="item.icon" />
            </span>
            <span class="custom-label">{{ item.label }}</span>
            <span class="custom-sep">-</span>
            <b v-if="deviceData[item.key] !== undefined" class="custom-value">{{ deviceData[item.key] }}</b>
            <span v-else class="custom-value">--</span>
            <span class="custom-unit">{{ item.unit }}</span>
          </div>
        </div>
        <!-- 日期显示 -->
        <div class="data-date">
          数据时间：<span v-if="deviceData.collectTime || deviceData.updateTime">{{ formatDateTime(deviceData.collectTime ||
            deviceData.updateTime) }}</span>
          <span v-else class="data-date-placeholder">--</span>
        </div>
        <div v-if="!defaultImg" class="ops-btns">
          <el-button type="primary" @click="save">确定</el-button>
          <el-button @click="dialogVisible = false">取消</el-button>
        </div>
      </div>
      <!-- 中间图片和按钮 -->
      <div v-if="defaultImg" class="weather-image-and-btns">
        <div class="weather-image">
          <img :src="defaultImg" alt="气象站" />
        </div>
      </div>
    </div>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch, inject, type Ref } from 'vue'
import { AgricultureDeviceService } from '@/api/device/deviceApi'
import { AgricultureDeviceHeartbeatService } from '@/api/device/deviceheartbeatApi'
import { ElMessage } from 'element-plus'
import {
  Sunny, ColdDrink, IceDrink,
  DataAnalysis, Odometer, Connection, Sugar, Coin, Watermelon
} from '@element-plus/icons-vue'

type DeviceStatus = 'online' | 'offline' | 'fault'

const props = defineProps<{
  modelValue: boolean,
  device: any,
  status: DeviceStatus
}>()
const emit = defineEmits(['update:modelValue', 'save', 'refresh'])
const dialogVisible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

type TagType = 'success' | 'info' | 'warning' | 'danger' | 'primary'
const runLevel = ref('low')
const deviceOn = ref(false)
const defaultImg = computed(() => props.device?.deviceImage || '')
const isUserAction = ref(false)

// 当前状态
const currentStatus = computed<DeviceStatus>(() => {
  if (deviceOn.value) return 'online'
  return 'offline'
})

const airDataList = [
  { label: '空气温度', key: 'temperature', unit: '℃', icon: ColdDrink, colorClass: 'data-color-orange', bgClass: 'data-bg-orange', borderClass: 'data-border-orange' },
  { label: '空气湿度', key: 'humidity', unit: '%', icon: IceDrink, colorClass: 'data-color-yellow', bgClass: 'data-bg-yellow', borderClass: 'data-border-yellow' },
  { label: '光照强度', key: 'illuminance', unit: 'Lux', icon: Sunny, colorClass: 'data-color-purple', bgClass: 'data-bg-purple', borderClass: 'data-border-purple' }
]

const soilDataList = [
  { label: '土壤温度', key: 'soilTemperature', unit: '℃', icon: ColdDrink, colorClass: 'data-color-orange', bgClass: 'data-bg-orange', borderClass: 'data-border-orange' },
  { label: '土壤湿度', key: 'soilHumidity', unit: 'm³/m³', icon: IceDrink, colorClass: 'data-color-yellow', bgClass: 'data-bg-yellow', borderClass: 'data-border-yellow' },
  { label: '土壤电导率', key: 'conductivity', unit: 'µS/cm', icon: Connection, colorClass: 'data-color-blue', bgClass: 'data-bg-blue', borderClass: 'data-border-blue' },
  { label: '土壤盐分', key: 'salinity', unit: 'mg/L', icon: Sugar, colorClass: 'data-color-yellow', bgClass: 'data-bg-yellow', borderClass: 'data-border-yellow' },
  { label: '土壤氮含量', key: 'nitrogen', unit: 'mg/kg', icon: DataAnalysis, colorClass: 'data-color-green', bgClass: 'data-bg-green', borderClass: 'data-border-green' },
  { label: '土壤磷含量', key: 'phosphorus', unit: 'mg/kg', icon: Odometer, colorClass: 'data-color-orange', bgClass: 'data-bg-orange', borderClass: 'data-border-orange' },
  { label: '土壤钾含量', key: 'potassium', unit: 'mg/kg', icon: Coin, colorClass: 'data-color-purple', bgClass: 'data-bg-purple', borderClass: 'data-border-purple' },
  { label: '土壤pH值', key: 'phValue', unit: '', icon: Watermelon, colorClass: 'data-color-blue', bgClass: 'data-bg-blue', borderClass: 'data-border-blue' }
]

// 1. inject 全局 deviceDataMap
const deviceDataMap = inject('deviceDataMap') as Ref<{ [deviceId: string]: any }>

// 2. 设备ID
const deviceId = computed(() => props.device?.deviceId ?? props.device?.id)

// 3. 设备数据直接取
const deviceData = computed(() => {
  if (!deviceOn.value) return {}
  const id = String(deviceId.value ?? '')
  return deviceDataMap?.value?.[id] || {}
})


// 监听设备数据变化，更新开关状态
watch(() => props.device, (newDevice) => {
  if (newDevice) {
    // 根据用户开关控制状态设置开关状态
    deviceOn.value = newDevice.userControlSwitch === '1'
  }
}, { immediate: true })

// 监听开关状态变化
watch(deviceOn, async (newValue, oldValue) => {
  // 只有在用户主动操作时才执行更新
  if (isUserAction.value && props.device?.id) {
    // 如果是要开启设备，先检查设备的在线状态
    if (newValue) {
      try {
        // 调用心跳API查询设备的在线状态
        const heartbeatRes: any = await AgricultureDeviceHeartbeatService.listHeartbeat({
          deviceId: props.device.id,
          pageNum: 1,
          pageSize: 1
        })
        
        if (heartbeatRes && heartbeatRes.code === 200 && heartbeatRes.rows && heartbeatRes.rows.length > 0) {
          const heartbeatData = heartbeatRes.rows[0]
          // 验证返回的数据的deviceId是否匹配当前设备
          if (heartbeatData.deviceId === props.device.id || String(heartbeatData.deviceId) === String(props.device.id)) {
            // 检查在线状态
            if (heartbeatData.onlineStatus !== 1 && heartbeatData.onlineStatus !== '1') {
              // 设备不在线，不允许开启
              deviceOn.value = false
              ElMessage.warning('设备异常，请联系负责人')
              isUserAction.value = false
              return
            }
          } else {
            // deviceId不匹配，不允许开启
            deviceOn.value = false
            ElMessage.warning('设备异常，请联系负责人')
            isUserAction.value = false
            return
          }
        } else {
          // 没有找到心跳数据，不允许开启
          deviceOn.value = false
          ElMessage.warning('设备异常，请联系负责人')
          isUserAction.value = false
          return
        }
      } catch (error) {
        // 查询心跳失败，不允许开启
        deviceOn.value = false
        ElMessage.warning('设备异常，请联系负责人')
        isUserAction.value = false
        return
      }
    }
    
    // 更新设备用户开关控制状态
    try {
      const res = await AgricultureDeviceService.updateDevice({
        ...props.device,
        userControlSwitch: newValue ? '1' : '0'
      })
      if (res.code === 200) {
        ElMessage.success(newValue ? '设备已开启' : '设备已关闭')
        emit('refresh')
      } else {
        // 如果更新失败，恢复开关状态
        deviceOn.value = oldValue
        ElMessage.error(res.msg || '操作失败')
      }
    } catch (error) {
      // 如果发生错误，恢复开关状态
      deviceOn.value = oldValue
      ElMessage.error('操作失败，请重试')
    }
  }
  // 重置用户操作标记
  isUserAction.value = false
})

// 添加开关点击事件处理
const handleSwitchChange = (value: string | number | boolean) => {
  isUserAction.value = true
  deviceOn.value = Boolean(value)
}

function save() {
  emit('save', { runLevel: runLevel.value, deviceOn: deviceOn.value })
  emit('update:modelValue', false)
}

const dataList = computed(() => {
  // 根据设备名称判断显示哪个数据列表
  const deviceName = props.device?.deviceName || ''
  // 如果设备名称包含"土壤"，显示土壤数据，否则显示气象数据
  if (deviceName.includes('土壤')) {
    return soilDataList
  }
  return airDataList
})

// 格式化日期时间为 年-月-日 时:分:秒
function formatDateTime(val: string | undefined): string {
  if (!val) return '--';
  // 兼容带T和不带T的格式
  const d = val.replace('T', ' ').replace(/\..*$/, '');
  // 若为 '2025-06-25 19:06:56' 直接返回，若为 '2025-06-25 19:06:56.2778517' 去掉小数
  return d;
}
</script>

<style scoped>
.weather-status-content {
  display: flex;
  gap: 10px;
  align-items: flex-start;
  padding: 48px 0;
}

.weather-data {
  flex: 1.5;
  min-width: 300px;
  max-width: 320px;
  padding-right: 0;
  display: flex;
  flex-direction: column;
  gap: 32px;
  min-height: 300px;
  justify-content: center;
  align-items: center;
}

.weather-image-and-btns {
  flex: 1.5;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  max-width: 360px;
}

.weather-image {
  width: 100%;
  max-width: 320px;
  max-height: 400px;
  border-radius: 16px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.10);
  display: flex;
  align-items: center;
  justify-content: center;
}

.weather-image img {
  width: 100%;
  height: auto;
  max-width: 100%;
  max-height: 320px;
  border-radius: 16px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.10);
  object-fit: contain;
}

.weather-ops {
  flex: 1.2;
  min-width: 320px;
  display: flex;
  flex-direction: column;
  gap: 48px;
}

.ops-btns {
  display: flex;
  gap: 36px;
  margin-top: 48px;
  justify-content: center;
}

.data-list {
  display: flex;
  flex-direction: column;
  gap: 28px;
  align-items: stretch;
}

.custom-data-tag {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 16px 8px 12px;
  border-radius: 24px;
  border: 2px dashed;
  background: #fff;
  min-width: 0;
  font-size: 18px;
  font-weight: 400;
  box-sizing: border-box;
  width: fit-content;
}

.custom-icon {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 20px;
  flex-shrink: 0;
}

.custom-label {
  font-size: 18px;
  color: #444;
  font-weight: 500;
}

.custom-sep {
  margin: 0 4px;
  color: #888;
  font-size: 18px;
}

.custom-value {
  font-weight: bold;
  font-size: 20px;
  color: #222;
  margin: 0 2px;
}

.custom-unit {
  color: #888;
  font-size: 16px;
  margin-left: 2px;
}

/* 背景色 */
.data-bg-danger {
  background: #ffeaea !important;
}

.data-bg-success {
  background: #eafaf3 !important;
}

.data-bg-primary {
  background: #e0f7fa !important;
}

.data-bg-warning {
  background: #fff9e1 !important;
}

.data-bg-info {
  background: #e3f2fd !important;
}

.data-bg-light {
  background: #e1f5fe !important;
}

/* 主色 */
.data-color-danger {
  color: #ff7675 !important;
  background-color: #ff7675 !important;
}

.data-color-success {
  color: #00b894 !important;
  background-color: #00b894 !important;
}

.data-color-primary {
  color: #00bcd4 !important;
  background-color: #00bcd4 !important;
}

.data-color-warning {
  color: #fbc02d !important;
  background-color: #fbc02d !important;
}

.data-color-info {
  color: #42a5f5 !important;
  background-color: #42a5f5 !important;
}

.data-color-light {
  color: #29b6f6 !important;
  background-color: #29b6f6 !important;
}

/* 只让 .data-icon 背景色生效，文字只用 color */
.data-icon.data-color-danger,
.data-icon.data-color-success,
.data-icon.data-color-primary,
.data-icon.data-color-warning,
.data-icon.data-color-info,
.data-icon.data-color-light {
  color: #fff !important;
}

.data-label.data-color-danger,
.data-label.data-color-success,
.data-label.data-color-primary,
.data-label.data-color-warning,
.data-label.data-color-info,
.data-label.data-color-light,
.data-tag b.data-color-danger,
.data-tag b.data-color-success,
.data-tag b.data-color-primary,
.data-tag b.data-color-warning,
.data-tag b.data-color-info,
.data-tag b.data-color-light {
  background: none !important;
}

.device-switch-title {
  display: inline-flex;
  align-items: center;
  font-size: 16px;
  margin-left: 16px;
  vertical-align: middle;
}

.device-switch-title .el-switch__label {
  font-size: 16px !important;
}

.device-switch-title .switch-label {
  font-size: 16px;
}

/* 响应式：小于900px时变为一列 */
@media (max-width: 900px) {
  .weather-status-content {
    flex-direction: column;
    gap: 32px;
    align-items: stretch;
  }

  .weather-data {
    min-width: 0;
    padding-right: 0;
    margin-bottom: 32px;
  }

  .data-list {
    grid-template-columns: 1fr;
    gap: 28px 0;
  }

  .weather-image-and-btns {
    align-items: center;
    justify-content: center;
  }

  .weather-image {
    max-width: 100%;
    max-height: 50vw;
  }

  .weather-image img {
    max-width: 100%;
    max-height: 50vw;
  }
}

@media (max-width: 600px) {
  .weather-image {
    max-width: 100%;
    max-height: 60vw;
  }

  .weather-image img {
    max-width: 100%;
    max-height: 60vw;
  }
}

.el-tag.tag-offline {
  background: #f4f4f5 !important;
  color: #909399 !important;
  border-color: #e4e7ed !important;
}

.tag-margin-left {
  margin-left: 16px;
}

.switch-label {
  margin: 0 8px 0 24px;
}

.data-bg-orange {
  background: #fff7ec !important;
}

.data-bg-yellow {
  background: #fffde7 !important;
}

.data-bg-green {
  background: #eafaf3 !important;
}

.data-bg-blue {
  background: #e3f2fd !important;
}

.data-bg-purple {
  background: #f3e8fd !important;
}

.data-color-orange {
  background: #e67e22 !important;
}

.data-color-yellow {
  background: #f1c40f !important;
}

.data-color-green {
  background: #27ae60 !important;
}

.data-color-blue {
  background: #2980b9 !important;
}

.data-color-purple {
  background: #8e44ad !important;
}

.data-border-orange {
  border-color: #e67e22 !important;
}

.data-border-yellow {
  border-color: #f1c40f !important;
}

.data-border-green {
  border-color: #27ae60 !important;
}

.data-border-blue {
  border-color: #2980b9 !important;
}

.data-border-purple {
  border-color: #8e44ad !important;
}

.data-date {
  color: #999;
  font-size: 14px;
  margin-top: 32px;
  text-align: center;
  width: 100%;
}

.switch-label-ml {
  margin-left: 18px;
}

.data-date-placeholder {
  color: #ccc;
}
</style>