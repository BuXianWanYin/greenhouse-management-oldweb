<template>
  <div class="console">
    <CardList :data-list="cardList"></CardList>
    <div class="column column2 analysis-dashboard">
      <TodaySales :sales-data="countList"></TodaySales>
      <SalesOverview :mock-data="traceChartData" :growth-map="growthMap"></SalesOverview>
    </div>
    <div class="bottom-wrap art-custom-card" style="margin-bottom: 60px;">
      <div>
        <h2 class="box-title">关于智链兴农</h2>
        <p>{{ systemName }} 是一款基于区块链和人工智能的鱼菜共生智慧物链平台</p>
        <p>集成了智能水质监测、鱼菜共生管理、区块链溯源、AI决策分析等核心功能，打造绿色循环农业生态</p>

        <div class="button-wrap">
          <!-- <div class="btn art-custom-card" @click="goPage(WEB_LINKS.GITHUB_HOME)">
            <span>项目源码</span>
            <i class="iconfont-sys">&#xe703;</i>
          </div>
          <div class="btn art-custom-card" @click="goPage(WEB_LINKS.GITHUB_HOME)">
            <span>技术文档</span>
            <i class="iconfont-sys">&#xe703;</i>
          </div>
          <div class="btn art-custom-card" @click="goPage(WEB_LINKS.GITHUB_HOME)">
            <span>使用指南</span>
            <i class="iconfont-sys">&#xe703;</i>
          </div>
          <div class="btn art-custom-card" @click="goPage(WEB_LINKS.GITHUB_HOME)">
            <span>联系我们</span>
            <i class="iconfont-sys">&#xe703;</i>
          </div> -->
          <img src="@imgs/3d/fish-over.png" width="600" height="250"></img>
        </div>
      </div>
      <img class="right-img" src="@imgs/draw/draw1.png" />
    </div>
  </div>
</template>

<script setup lang="ts">
import CardList from './widget/CardList.vue'
import SalesOverview from './widget/SalesOverview.vue'
import TodaySales from './widget/TodaySales.vue'
import { useSettingStore } from '@/store/modules/setting'
import { useCommon } from '@/composables/useCommon'
import { useSystemInfo } from '@/composables/useSystemInfo'
import { WEB_LINKS } from '@/utils/links'
import { ref, onMounted, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import AgricultureConsoleService from '@/api/agriculture/consoleApi'
import type {
  ConsoleTotalInfo,
  ConsoleToTalData,
  TraceTotalChartData,
  TraceTotalChartItem
} from '@/types/agriculture/console'
import event from '@/utils/event'

const settingStore = useSettingStore()
const router = useRouter()
const { getSystemName } = useSystemInfo()

// 系统名称
const systemName = computed(() => getSystemName())

// 页面跳转函数
const goPage = (url: string) => {
  if (url.startsWith('http')) {
    window.open(url, '_blank')
  } else {
    router.push(url)
  }
}

const currentGlopTheme = computed(() => settingStore.systemThemeType)

// 系统主题风格变化时，刷新页面重写渲染 Echarts
watch(currentGlopTheme, () => {
  settingStore.reload()
})

useCommon().scrollToTop()

// 卡片数据（农业统计）
const cardList = ref<ConsoleTotalInfo[]>([])
// 批量任务统计数据
const countList = ref<ConsoleTotalInfo[]>([])
// 溯源统计图表数据，供 SalesOverview 组件使用
const traceChartData = ref<{
  week: { xAxis: string[]; fish: number[]; vegetable: number[] }
  month: { xAxis: string[]; fish: number[]; vegetable: number[] }
  year: { xAxis: string[]; fish: number[]; vegetable: number[]; fullLabels?: string[] }
}>({
  week: { xAxis: [], fish: [], vegetable: [] },
  month: { xAxis: [], fish: [], vegetable: [] },
  year: { xAxis: [], fish: [], vegetable: [], fullLabels: [] }
})

// 获取农业统计卡片数据
const getCardList = async () => {
  const res = await AgricultureConsoleService.listAgriculture()
  cardList.value = res.data
}

// 获取批量任务统计数据
const getCountList = async () => {
  const res = await AgricultureConsoleService.listBatchTask()
  countList.value = res.data
}

// 获取溯源统计数据，并转换为 SalesOverview 组件所需格式
const getTraceTotal = async () => {
  const res = await AgricultureConsoleService.listTraceTotal()
  setTraceTotal(res.data)
}

const setTraceTotal = (data: any) => {
  // 解构 week, month, year 数据
  const { week, month, year } = data as unknown as TraceTotalChartData
  // 转换为 ECharts 所需格式
  traceChartData.value = {
    week: {
      xAxis: week.map((item: TraceTotalChartItem) => item.time.substring(5)), // 取日期后缀
      fish: week.map((item: TraceTotalChartItem) => item.fishCount),
      vegetable: week.map((item: TraceTotalChartItem) => item.cuisineCount)
    },
    month: {
      xAxis: month.map((item: TraceTotalChartItem) => item.time.substring(5)),
      fish: month.map((item: TraceTotalChartItem) => item.fishCount),
      vegetable: month.map((item: TraceTotalChartItem) => item.cuisineCount)
    },
    year: {
      xAxis: year.map((item: TraceTotalChartItem) => `${new Date(item.time).getMonth() + 1}月`), // 转换为“X月”
      fish: year.map((item: TraceTotalChartItem) => item.fishCount),
      vegetable: year.map((item: TraceTotalChartItem) => item.cuisineCount),
      fullLabels: year.map((item: TraceTotalChartItem) => {
        const date = new Date(item.time)
        return `${date.getFullYear()}年${date.getMonth() + 1}月`
      })
    }
  }

  growthMap.value = {
    week: formatGrowthRate(data.weekGrowth?.weekGrowth) || '+0%',
    month: formatGrowthRate(data.monthGrowth?.monthGrowth) || '+0%',
    year: formatGrowthRate(data.yearGrowth?.yearGrowth) || '+0%'
  }
}

// 处理增长率数据，去掉小数部分
const formatGrowthRate = (growthStr: string) => {
  if (!growthStr) return '+0%'
  // 提取数字部分，去掉小数
  const match = String(growthStr).match(/^([+-]?\d+)/)
  if (match) {
    return match[1] + '%'
  }
  return '+0%'
}

// 监听全局 event 总线，实时更新统计数据
event.on('message', (data: ConsoleToTalData) => {
  cardList.value = data.agriculture
  countList.value = data.batchTask
  setTraceTotal(data.traceTotal)
})

// 增长率数据，传递给 SalesOverview 组件
const growthMap = ref({
  week: '+0%',
  month: '+0%',
  year: '+0%'
})

// 页面挂载时获取所有统计数据
onMounted(() => {
  getCardList()
  getCountList()
  getTraceTotal()
})
</script>

<style lang="scss" scoped>
.console {
  padding-bottom: 15px;

  :deep(.card-header) {
    display: flex;
    justify-content: space-between;
    padding: 20px 25px 5px 0;

    .title {
      h4 {
        font-size: 18px;
        font-weight: 500;
        color: var(--art-text-gray-800);
      }

      p {
        margin-top: 3px;
        font-size: 13px;

        span {
          margin-left: 10px;
          color: #52c41a;
        }
      }
    }
  }

  // 主标题
  :deep(.box-title) {
    color: var(--art-gray-900) !important;
  }

  // 副标题
  :deep(.subtitle) {
    color: var(--art-gray-600) !important;
  }

  :deep(.card-list li),
  .region,
  .dynamic,
  .bottom-wrap {
    background: var(--art-main-bg-color);
    border-radius: calc(var(--custom-radius) + 4px) !important;
  }

  .column {
    display: flex;
    justify-content: space-between;
    margin-top: var(--console-margin);
    background-color: transparent !important;
  }

  .column2 {
    align-items: stretch;
    min-height: 450px;
  }

  .bottom-wrap {
    box-sizing: border-box;
    display: flex;
    justify-content: space-between;
    height: 300px;
    padding: 20px;
    margin-top: var(--console-margin);
    background: var(--art-main-bg-color);

    h2 {
      margin-top: 10px;
      font-size: 20px;
      font-weight: 500;
    }

    p {
      margin-top: 5px;
      font-size: 14px;
      color: var(--art-gray-600);
    }

    .button-wrap {
      display: flex;
      flex-wrap: wrap;
      width: 600px;
      margin-top: 15px;

      .btn {
        display: flex;
        justify-content: space-between;
        width: 240px;
        height: 50px;
        padding: 0 15px;
        margin: 0 15px 15px 0;
        font-size: 14px;
        line-height: 50px;
        color: var(--art-gray-800);
        text-align: center;
        cursor: pointer;
        background: var(--art-bg-color);
        border-radius: calc(var(--custom-radius) / 2 + 2px) !important;
        transition: all 0.3s;

        &:hover {
          box-shadow: 0 5px 10px rgb(0 0 0 / 5%);
          transform: translateY(-4px);
        }
      }
    }
  }
}
</style>

<!-- 移动端处理 -->
<style lang="scss" scoped>
.console {
  @media screen and (max-width: $device-ipad-pro) {
    .column2 {
      margin-top: 15px;

      :deep(.active-user) {
        width: 50%;
      }

      :deep(.sales-overview) {
        width: calc(50% - 15px);
      }
    }

    .column3 {
      display: flex;
      flex-wrap: wrap;
      margin-top: 15px;

      :deep(.new-user) {
        width: 100%;
        margin-top: 0;
      }

      :deep(.dynamic) {
        flex: 1;
        margin: 15px 0 0;
      }

      :deep(.todo-list) {
        flex: 1;
        margin: 15px 0 0 15px;
      }
    }

    .bottom-wrap {
      height: auto;
      margin-top: 15px;

      .button-wrap {
        width: 470px;
        margin-top: 20px;

        .btn {
          width: 180px;
        }
      }

      .right-img {
        width: 300px;
        height: 230px;
      }
    }
  }

  @media screen and (max-width: $device-ipad-vertical) {
    :deep(.card-list) {
      width: calc(100% + 15px);
      margin-left: -15px;

      li {
        width: calc(50% - 15px);
        margin: 0 0 15px 15px;
      }
    }

    .column2 {
      display: block;
      margin-top: 0;

      :deep(.active-user) {
        width: 100%;
      }

      :deep(.sales-overview) {
        width: 100%;
        margin-top: 15px;
      }
    }

    .column3 {
      display: block;
      margin-top: 15px;

      :deep(.new-user) {
        width: 100%;
        margin-top: 15px;
      }

      :deep(.dynamic) {
        width: 100%;
        margin: 15px 0 0;
      }

      :deep(.todo-list) {
        width: 100%;
        margin: 15px 0 0;
      }
    }

    .bottom-wrap {
      height: auto;
      margin-top: 15px;

      .button-wrap {
        width: 100%;
        margin-top: 20px;

        .btn {
          width: 190px;
          height: 50px;
          line-height: 50px;
        }
      }

      .right-img {
        display: none;
      }
    }
  }

  @media screen and (max-width: $device-phone) {
    :deep(.card-list) {
      width: 100%;
      margin: 0;

      li {
        width: 100%;
        margin: 0 0 15px;
      }
    }

    :deep(.active-user) {
      .chart {
        padding: 10px;
      }
    }

    .sales-overview {
      height: 300px;
      padding: 20px 15px;

      :deep(.card-header) {
        padding: 0 0 0 5px !important;
      }
    }

    .bottom-wrap {
      padding: 0 15px;

      .button-wrap {
        width: 100%;
        margin-top: 20px;

        .btn {
          width: 100%;
          margin-right: 0;
        }
      }
    }
  }
}
</style>
<style lang="scss" scoped>
.analysis-dashboard {
  :deep(.custom-card) {
    background: var(--art-main-bg-color);
    border-radius: calc(var(--custom-radius) + 4px) !important;
  }

  // 卡片头部
  :deep(.custom-card-header) {
    position: relative;
    box-sizing: border-box;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 18px 20px;

    .title {
      font-size: 20px;
      font-weight: 400;
      color: var(--art-text-gray-900);
    }

    .subtitle {
      position: absolute;
      bottom: 2px;
      left: 21px;
      font-size: 13px;
      color: var(--art-gray-600);
    }
  }

  .el-card {
    border: 1px solid #e8ebf1;
    box-shadow: none;
  }

  .mt-20 {
    margin-top: 20px;
  }
}

.dark {
  .analysis-dashboard {
    :deep(.custom-card) {
      box-shadow: 0 4px 20px rgb(0 0 0 / 50%);
    }
  }
}

@media (width <=1200px) {
  .analysis-dashboard {
    .mt-20 {
      margin-top: 0;
    }

    :deep(.custom-card) {
      margin-bottom: 20px;
    }
  }
}

.env-monitor-table {
  margin-top: 24px;
  background: #fff;
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.03);
}

.env-monitor-table .table-title {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 12px;
}

.env-monitor {
  width: 100%;
  background: #fff;
  border-radius: 8px;
  padding: 0 0 20px 0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.03);

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 18px 25px 0 25px;

    .title {
      h4.box-title {
        font-size: 20px;
        font-weight: 600;
        color: var(--art-gray-900);
      }

      .subtitle {
        font-size: 14px;
        color: var(--art-gray-500);
        margin-top: 4px;
      }
    }
  }

  .el-table {
    margin-top: 10px;
    font-size: 14px;
  }
}
</style>
