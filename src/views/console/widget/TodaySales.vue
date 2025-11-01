<template>
  <div class="custom-card art-custom-card today-sales">
    <div class="custom-card-header">
      <span class="title">任务统计</span>
    </div>
    <div class="custom-card-body">
      <div ref="chartRef" class="sales-mapping-chart"></div>
    </div>
    <div class="sales-summary">
      <el-row :gutter="20">
        <el-col :span="6" :xs="24" v-for="(item, index) in salesData" :key="index">
          <div :class="['sales-card art-custom-card']">
            <i class="iconfont-sys" :class="item.class" v-html="item.icon" :style="{backgroundColor: item.color}"></i>
            <h2>
              <MoCountTo class="number box-title" :num="item.value" :duration="800" :separator="2" />
            </h2>
            <p>{{ item.label }}</p>
            <small>{{ item.change }} {{ t('analysis.todaySales.fromYesterday') }}</small>
          </div>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useECharts } from '@/utils/echarts/useECharts'
import type { EChartsOption } from 'echarts'
import { useSettingStore } from '@/store/modules/setting'
import type { ConsoleTotalInfo } from '@/types/agriculture/console'

const props = defineProps({
  salesData: { type: Array<ConsoleTotalInfo>, default: () => [] }
})

const chartRef = ref<HTMLDivElement>()
const { setOptions, removeResize, resize } = useECharts(chartRef as Ref<HTMLDivElement>)

const settingStore = useSettingStore()
const menuOpen = computed(() => settingStore.menuOpen)

// 新增：class 到颜色的映射表
const classColorMap: Record<string, string> = {
  'bg-primary': '#409EFF',
  'bg-warning': '#E6A23C',
  'bg-error': '#F56C6C',
  'bg-success': '#67C23A'
}

// 收缩菜单时，重新计算图表大小
watch(menuOpen, () => {
  const delays = [100, 200, 300]
  delays.forEach((delay) => {
    setTimeout(resize, delay)
  })
})

// 饼图数据与卡片数据同步，颜色一致
const chartData = computed(() =>
  props.salesData.map(item => ({
    value: item.value,
    name: item.label,
    itemStyle: { color: item.color || classColorMap[item.class] || '#409EFF' }
  }))
)

const initChart = () => {
  const option: EChartsOption = {
    tooltip: {
      trigger: 'item',
      formatter: (params: any) => `${params.seriesName}<br/>${params.marker} ${params.name} <b>${params.value}</b>`
    },
    series: [
      {
        name: '任务统计',
        type: 'pie',
        radius: ['40%', '60%'],
        avoidLabelOverlap: false,
        padAngle: 5,
        itemStyle: {
          borderRadius: 10
        },
        label: {
          show: false,
          position: 'center'
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 12,
            fontWeight: 'bold'
          }
        },
        labelLine: {
          show: false
        },
        data: chartData.value
      }
    ]
  }
  setOptions(option)
}

watch(chartData, () => {
  initChart()
})

onMounted(() => {
  initChart()
})

onUnmounted(() => {
  removeResize()
})

const { t } = useI18n()
</script>

<style lang="scss" scoped>
.today-sales {
  width: 42%;
  min-height: 400px;

  .sales-summary {
    padding: 20px;

    .sales-card {
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items:center;
      height: 180px;
      padding: 0 20px;
      overflow: hidden;
      border-radius: calc(var(--custom-radius) / 2 + 4px) !important;

      .iconfont-sys {
        width: 48px;
        height: 48px;
        font-size: 20px;
        line-height: 48px;
        color: #fff;
        color: var(--el-color-primary);
        text-align: center;
        background-color: var(--el-color-primary-light-9);
        border-radius: 50%;
      }

      h2 {
        margin-top: 10px;
        font-size: 26px;
        font-weight: 400;
        color: var(--art-text-gray-900) !important;
      }

      p {
        margin-top: 10px;
        font-size: 16px;
        color: var(--art-text-gray-700) !important;

        @include ellipsis;
      }

      small {
        display: block;
        margin-top: 10px;
        color: var(--art-text-gray-500) !important;

        @include ellipsis;
      }
    }
  }
}

// 暗黑模式降低颜色强度
.dark {
  .today-sales {
    .sales-summary {
      .sales-card {
        .iconfont-sys {

          &.red,
          &.yellow,
          &.green,
          &.purple {
            background-color: #222 !important;
          }
        }
      }
    }
  }
}

@media (max-width: $device-notebook) {
  .today-sales {
    height: 280px;

    .sales-summary {
      .sales-card {
        height: 170px;
      }
    }
  }
}

@media (width <=768px) {
  .today-sales {
    height: auto;

    .sales-summary {
      padding-bottom: 0;

      .sales-card {
        margin-bottom: 20px;
      }
    }
  }
}
</style>
<style lang="scss" scoped>
.sales-mapping-chart {
  width: 100%;
  height: 150px;
}
</style>
