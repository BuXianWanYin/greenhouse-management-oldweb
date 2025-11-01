<template>
  <el-dialog :title="device.deviceName" v-model="dialogVisible" :width="dialogWidth" append-to-body @open="onDialogOpen"
    @close="onDialogClose">
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
    <div v-if="String(device.deviceTypeId) === CAMERA_TYPE_ID"
      style="width:100%;text-align:center;min-height:400px;display:flex;flex-direction:column;align-items:center;justify-content:center;position:relative;">
      <!-- 设备关闭时显示提示 -->
      <div v-if="!deviceOn" class="video-placeholder">
        <div class="placeholder-content">
          <div class="placeholder-icon">
            <el-icon size="48" color="#909399">
              <VideoCamera />
            </el-icon>
          </div>
          <div class="loading-text">设备已关闭，请开启设备后查看监控画面</div>
        </div>
      </div>
      <!-- 设备开启时的视频内容 -->
      <div v-else>
        <!-- 视频占位符和加载提示 -->
        <div v-if="cameraLoading" class="video-placeholder">
          <div class="placeholder-content">
            <div class="placeholder-icon">
              <el-icon size="48" color="#909399">
                <VideoCamera />
              </el-icon>
            </div>
            <div class="loading-text">监控画面加载中...</div>
            <div class="loading-spinner">
              <el-icon class="is-loading" size="24" color="#409EFF">
                <Loading />
              </el-icon>
            </div>
          </div>
        </div>
        <div v-else-if="cameraError || videoError" style="color:red;">{{ cameraError || videoError }}</div>

        <!-- Canvas 元素始终存在，通过 CSS 控制显示 -->
        <div class="video-container" :class="{ 'video-hidden': cameraLoading || cameraError || videoError }">
          <canvas ref="videoCanvas" id="video-canvas" width="1920" height="1080"
            style="border-radius: 10px; display:block; margin:0 auto; max-width:100%; height:auto;" />
        </div>
        
        <!-- 连接状态信息
        <div v-if="isConnected && !cameraLoading && !cameraError && !videoError" class="video-info">
          <div class="info-item">
            <span class="info-label">连接状态:</span>
            <span class="info-value">{{ connectionInfo }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">帧率:</span>
            <span class="info-value">{{ fps.toFixed(1) }} FPS</span>
          </div>
        </div> -->


      </div>
    </div>
    <div v-else class="weather-status-content">
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
import { ref, computed, watch, inject, onMounted, nextTick } from 'vue'
import { ElIcon } from 'element-plus'
import { AgricultureDeviceService } from '@/api/device/deviceApi'
import { ElMessage } from 'element-plus'
import {
  Sunny, ColdDrink, IceDrink, Compass, Odometer, DataAnalysis,
  Coin, Watermelon, Sugar, Flag, Star, VideoCamera, Loading
} from '@element-plus/icons-vue'
import { useBase64VideoPlayer } from '@/composables/useBase64VideoPlayer'
import { getStreamWsUrl } from '@/api/device/cameraStreamApi'

type DeviceStatus = 'online' | 'offline' | 'fault'

const props = defineProps<{
  modelValue: boolean,
  device: any,
  status: DeviceStatus
}>()
const emit = defineEmits(['update:modelValue', 'save', 'refresh'])
const player = ref<any>(null);
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

const weatherDataList = [
  { label: '空气温度', key: 'temperature', unit: '℃', icon: ColdDrink, colorClass: 'data-color-orange', bgClass: 'data-bg-orange', borderClass: 'data-border-orange' },
  { label: '空气湿度', key: 'humidity', unit: '%', icon: IceDrink, colorClass: 'data-color-yellow', bgClass: 'data-bg-yellow', borderClass: 'data-border-yellow' },
  { label: '风向', key: 'windDirection', unit: '', icon: Compass, colorClass: 'data-color-green', bgClass: 'data-bg-green', borderClass: 'data-border-green' },
  { label: '风速', key: 'windSpeed', unit: 'm/s', icon: Flag, colorClass: 'data-color-orange', bgClass: 'data-bg-orange', borderClass: 'data-border-orange' },
  { label: '光照强度', key: 'lightIntensity', unit: 'Lux', icon: Sunny, colorClass: 'data-color-purple', bgClass: 'data-bg-purple', borderClass: 'data-border-purple' }
]

const waterQualityList = [
  { label: 'PH值', key: 'phValue', unit: '', icon: DataAnalysis, colorClass: 'data-color-blue', bgClass: 'data-bg-blue', borderClass: 'data-border-blue' },
  { label: '溶解氧', key: 'dissolvedOxygen', unit: 'mg/L', icon: Odometer, colorClass: 'data-color-green', bgClass: 'data-bg-green', borderClass: 'data-border-green' },
  { label: '氨氮', key: 'ammoniaNitrogen', unit: 'mg/L', icon: Coin, colorClass: 'data-color-yellow', bgClass: 'data-bg-yellow', borderClass: 'data-border-yellow' },
  { label: '水温', key: 'waterTemperature', unit: '℃', icon: ColdDrink, colorClass: 'data-color-orange', bgClass: 'data-bg-orange', borderClass: 'data-border-orange' }
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

const CAMERA_TYPE_ID = '5'
const videoCanvas = ref<HTMLCanvasElement | null>(null)
const cameraLoading = ref(false)
const cameraError = ref('')

const { 
  connectStream, 
  disconnectStream, 
  isConnected, 
  error: videoError, 
  frameCount, 
  fps, 
  connectionInfo,
  startPingInterval,
  stopPingInterval
} = useBase64VideoPlayer()

const onDialogOpen = async () => {
  if (String(props.device.deviceTypeId) === CAMERA_TYPE_ID) {
    // 如果设备关闭，不加载视频流
    if (!deviceOn.value) {
      cameraLoading.value = false;
      cameraError.value = '';
      return;
    }

    cameraLoading.value = true;
    cameraError.value = '';

    setTimeout(async () => {
      try {
        // 获取canvas元素
        const canvas = videoCanvas.value;
        if (!canvas) {
          cameraError.value = '视频画布初始化失败';
          cameraLoading.value = false;
          return;
        }
        
        // 断开现有连接
        disconnectStream();
        
        // 连接Base64视频流
        connectStream(props.device.id, canvas, getStreamWsUrl);
        startPingInterval();
        
        console.log('Base64 video player connected');
        cameraLoading.value = false;
      } catch (error) {
        console.error('视频加载失败:', error);
        cameraError.value = '视频流加载失败，请检查网络连接';
        cameraLoading.value = false;
      }
    }, 800);
  }
};

const onDialogClose = () => {
  disconnectStream();
  stopPingInterval();
  cameraLoading.value = false;
  cameraError.value = '';
};

defineExpose({ onDialogOpen, onDialogClose });

// 监听设备数据变化，更新开关状态
watch(() => props.device, (newDevice) => {
  if (newDevice) {
    // 根据设备控制状态设置开关状态
    deviceOn.value = newDevice.controlStatus === '1'
  }
}, { immediate: true })

// 监听开关状态变化
watch(deviceOn, async (newValue, oldValue) => {
  // 只有在用户主动操作时才执行更新
  if (isUserAction.value && props.device?.id) {
    try {
      const res = await AgricultureDeviceService.updateDevice({
        ...props.device,
        controlStatus: newValue ? '1' : '0'
      })
      if (res.code === 200) {
        ElMessage.success(newValue ? '设备已开启' : '设备已关闭')
        emit('refresh')

        // 如果是摄像头设备，根据开关状态处理视频流
        if (String(props.device.deviceTypeId) === CAMERA_TYPE_ID) {
          if (newValue) {
            // 设备开启，加载视频流
            cameraLoading.value = true;
            cameraError.value = '';

            setTimeout(async () => {
              try {
                const canvas = videoCanvas.value;
                if (!canvas) {
                  cameraError.value = '视频画布初始化失败';
                  cameraLoading.value = false;
                  return;
                }
                
                // 断开现有连接
                disconnectStream();
                
                // 连接Base64视频流
                connectStream(props.device.id, canvas, getStreamWsUrl);
                startPingInterval();
                
                console.log('Base64 video player connected');
                cameraLoading.value = false;
              } catch (error) {
                console.error('视频加载失败:', error);
                cameraError.value = '视频流加载失败，请检查网络连接';
                cameraLoading.value = false;
              }
            }, 800);
          } else {
            // 设备关闭，断开连接
            disconnectStream();
            stopPingInterval();
            cameraLoading.value = false;
            cameraError.value = '';
          }
        }
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
  const name = props.device?.deviceName || ''
  if (name.includes('风速')) return weatherDataList.filter(item => item.key === 'windSpeed')
  if (name.includes('风向')) return weatherDataList.filter(item => item.key === 'windDirection')
  if (name.includes('百叶箱')) return weatherDataList.filter(item => ['temperature', 'humidity', 'lightIntensity'].includes(item.key))
  if (name.includes('水质')) return waterQualityList
  return []
})

// 格式化日期时间为 年-月-日 时:分:秒
function formatDateTime(val: string | undefined): string {
  if (!val) return '--';
  // 兼容带T和不带T的格式
  const d = val.replace('T', ' ').replace(/\..*$/, '');
  // 若为 '2025-06-25 19:06:56' 直接返回，若为 '2025-06-25 19:06:56.2778517' 去掉小数
  return d;
}
//计算宽度
const dialogWidth = computed(() => {
  return String(props.device?.deviceTypeId) === CAMERA_TYPE_ID ? '1000px' : '750px';
});
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

.video-placeholder {
  width: 948px;
  height: 520px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f5f7fa;
  border-radius: 10px;
  position: relative;
}

.placeholder-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

.placeholder-icon {
  background-color: #e0e0e0;
  border-radius: 50%;
  width: 80px;
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #909399;
}

.loading-text {
  font-size: 18px;
  color: #909399;
  font-weight: 500;
}

.loading-spinner {
  display: flex;
  align-items: center;
  gap: 8px;
}

.video-container {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.video-hidden {
  display: none;
}

.video-info {
  margin-top: 16px;
  padding: 12px;
  background: rgba(0, 0, 0, 0.05);
  border-radius: 8px;
  display: flex;
  gap: 24px;
  justify-content: center;
  flex-wrap: wrap;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.info-label {
  font-size: 14px;
  color: #666;
  font-weight: 500;
}

.info-value {
  font-size: 14px;
  color: #333;
  font-weight: 600;
}
</style>