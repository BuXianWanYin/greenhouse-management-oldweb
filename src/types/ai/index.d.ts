import { BaseObjectResult } from '../axios'

// 诊断结果相关信息
export interface Diagnosis {
  /** 置信度（百分比） */
  confidence: number
  /** 症状描述 */
  symptoms: string
  /** 主要致病原因 */
  primary_causes: string
  /** 推荐处理措施 */
  recommended_measures: string
}

// 建议措施相关信息
export interface Suggestions {
  /** 预防措施 */
  prevention_measures: string
  /** 需注意事项 */
  attention_items: string
}

// 快速检测结果信息
export interface QuickCheck {
  /** 问题名称 */
  name: string
  /** 感染等级（0为无感染） */
  infection_level: number
  /** 是否需要处理 */
  requires_treatment: boolean
  /** 是否紧急 */
  urgency: boolean
}

// AI 诊断完整结果类型
export interface IdentifyResult {
  /** 诊断结果 */
  diagnosis: Diagnosis
  /** 建议措施 */
  suggestions: Suggestions
  /** 快速检测结果 */
  quick_check: QuickCheck
}

export type IdentifyInfoResult = BaseObjectResult<IdentifyResult>
