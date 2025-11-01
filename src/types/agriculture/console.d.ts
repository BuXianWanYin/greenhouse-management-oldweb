import { BaseArrayResult } from '../axios'
export interface ConsoleTotalInfo {
  /** 描述，例如“鱼类总数” */
  label: string
  /** 数值 */
  value: number
  /** 变化趋势（如“+3%”） */
  change: string
  /** 图标名或图标路径 */
  icon: string
  /** 卡片样式类名 */
  class: string
  /** 颜色样式 */
  color: string
}

/**
 * 控制台数据总类型接口
 */
export interface ConsoleToTalData {
  /** 农业相关的统计数组 */
  agriculture: ConsoleTotalInfo[]
  /** 批量任务相关的统计数组 */
  batchTask: ConsoleTotalInfo[]
  /** 溯源统计信息的统计数组（卡片用） */
  traceTotal: TraceTotalChartData[]
}

/**
 * 控制台统计卡片接口返回类型
 */
export type ConsoleListResult = BaseArrayResult<ConsoleTotalInfo>

/**
 * 溯源统计图表数据项
 * 用于溯源统计折线图的单个时间点数据
 * @property cuisineCount 蔬菜数量
 * @property time 时间（如“2025-07-13”或“2025-01”）
 * @property fishCount 鱼类数量
 */
export interface TraceTotalChartItem {
  cuisineCount: number
  time: string
  fishCount: number
}
/**
 * 溯源统计图表数据
 * 用于溯源统计折线图的完整数据结构，按周、月、年分组
 * @property week 周维度数据
 * @property month 月维度数据
 * @property year 年维度数据
 */
export interface TraceTotalChartData {
  week: TraceTotalChartItem[]
  month: TraceTotalChartItem[]
  year: TraceTotalChartItem[]
}
