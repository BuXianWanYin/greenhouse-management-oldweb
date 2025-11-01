<template>
  <div class="region sales-overview art-custom-card">
    <div class="card-header">
      <div class="title">
        <h4 class="box-title">溯源统计</h4>
        <p class="subtitle">
          {{ growthLabel }}<span class="text-success">{{ growthPercent }}</span>
        </p>
      </div>
      <div class="time-filter">
        <el-radio-group v-model="currentTimeRange" @change="handleTimeRangeChange" size="small">
          <el-radio-button value="week">周</el-radio-button>
          <el-radio-button value="month">月</el-radio-button>
          <el-radio-button value="year">年</el-radio-button>
        </el-radio-group>
      </div>
    </div>
    <div class="chart" ref="chartRef"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import echarts from '@/plugins/echarts'
import { useECharts } from '@/utils/echarts/useECharts'
import { hexToRgba } from '@/utils/colors'
import { useSettingStore } from '@/store/modules/setting'
import { SystemThemeEnum } from '@/enums/appEnum'

const props = defineProps<{
  mockData: Record<'week' | 'month' | 'year', { xAxis: string[], fish: number[], vegetable: number[], fullLabels?: string[] }>,
  growthMap: Record<'week' | 'month' | 'year', string>
}>()

const chartRef = ref<HTMLDivElement>()
const { setOptions, removeResize, resize } = useECharts(chartRef as Ref<HTMLDivElement>)

const store = useSettingStore()
const theme = computed(() => store.systemThemeType)
const isLight = computed(() => theme.value === SystemThemeEnum.LIGHT)
const settingStore = useSettingStore()
const menuOpen = computed(() => settingStore.menuOpen)

// 当前时间范围
const currentTimeRange = ref<'week' | 'month' | 'year'>('week')

// 增长标签和百分比
const growthLabel = computed(() => {
  if (currentTimeRange.value === 'year') return '近一年增长';
  if (currentTimeRange.value === 'month') return '近一月增长';
  if (currentTimeRange.value === 'week') return '近一周增长';
  return ''
})
const growthPercent = computed(() => props.growthMap[currentTimeRange.value])

// 收缩菜单时，重新计算图表大小
watch(menuOpen, () => {
  const delays = [100, 200, 300]
  delays.forEach((delay) => {
    setTimeout(resize, delay)
  })
})

onMounted(() => {
  createChart()
})

watch(
  () => props.mockData,
  () => {
    createChart()
  },
  { deep: true }
)
onUnmounted(() => {
  removeResize()
})

// 处理时间范围变化
const handleTimeRangeChange = () => {
  createChart()
}

const createChart = () => {
  const data = props.mockData[currentTimeRange.value]

  setOptions({
    grid: {
      left: '2.2%',
      right: '3%',
      bottom: '0%',
      top: '5px',
      containLabel: true
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'line',
        lineStyle: {
          color: '#bbb',
          width: 1,
          type: 'dashed'
        }
      },
      formatter: function(params: any) {
        const idx = params[0].dataIndex
        // 取 fullLabels，如果没有就用 xAxis
        const fullLabels = data.fullLabels || data.xAxis
        let str = fullLabels[idx] + '<br/>'
        params.forEach((item: any) => {
          str += item.marker + item.seriesName + ':' + item.value + '<br/>'
        })
        return str
      }
    },
    legend: {
      data: ['鱼类', '蔬菜'],
      top: 10,
      textStyle: {
        color: isLight.value ? '#333' : '#fff',
        fontSize: 12
      }
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: data.xAxis,
      axisLabel: {
        show: true,
        color: isLight.value ? '#999' : '#ccc',
        margin: 20,
        interval: currentTimeRange.value === 'month' ? 2 : 0,
        fontSize: 12
      },
      axisLine: {
        show: false
      }
    },
    yAxis: {
      type: 'value',
      axisLabel: {
        show: true,
        color: isLight.value ? '#999' : '#ccc',
        fontSize: 12
      },
      axisLine: {
        show: isLight.value ? true : false,
        lineStyle: {
          color: '#E8E8E8',
          width: 1
        }
      },
      splitLine: {
        show: true,
        lineStyle: {
          color: isLight.value ? '#e8e8e8' : '#444',
          width: 1,
          type: 'dashed'
        }
      }
    },
    series: [
      {
        name: '鱼类',
        color: '#409EFF',
        type: 'line',
        data: data.fish,
        smooth: true,
        symbol: 'none',
        lineStyle: {
          width: 3
        },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            {
              offset: 0,
              color: hexToRgba('#409EFF', 0.3).rgba
            },
            {
              offset: 1,
              color: hexToRgba('#409EFF', 0.05).rgba
            }
          ])
        }
      },
      {
        name: '蔬菜',
        color: '#67C23A',
        type: 'line',
        data: data.vegetable,
        smooth: true,
        symbol: 'none',
        lineStyle: {
          width: 3
        },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            {
              offset: 0,
              color: hexToRgba('#67C23A', 0.3).rgba
            },
            {
              offset: 1,
              color: hexToRgba('#67C23A', 0.05).rgba
            }
          ])
        }
      }
    ]
  })
}
</script>

<style lang="scss" scoped>
.region {
  box-sizing: border-box;
  width: calc(58% - var(--console-margin));
  padding: 20px 0 30px;

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 18px !important;

    .title {
      flex: 1;
    }

    .time-filter {
      :deep(.el-radio-group) {
        .el-radio-button__inner {
          background: var(--art-bg-color);
          border-color: var(--art-border-color);
          color: var(--art-text-color);

          &:hover {
            color: var(--el-color-primary);
          }
        }

        .el-radio-button__original-radio:checked+.el-radio-button__inner {
          background: var(--el-color-primary);
          border-color: var(--el-color-primary);
          color: #fff;
        }
      }
    }
  }

  .chart {
    width: 100%;
    height: calc(100% - 80px);
    margin-top: 30px;
  }
}
</style>