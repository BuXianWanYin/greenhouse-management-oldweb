import { BaseArrayResult, BaseObjectResult, BasePageResult } from '../axios'

export interface AgricultureJobResult {
  jobId: string
  classId: string
  jobName: string // 作业任务名称
  cycleUnit: string // 作业周期单位（0代表周 1代表天）
  jobStart: number | string // 起始周/天
  jobFinish: number | string // 结束周/天
  status: string
  createBy: string
  createTime: string
  updateBy: string
  updateTime: string
  remark: string
}

export type AgricultureJobListPageResult = BasePageResult<AgricultureJobResult>
export type AgricultureJobListResult = BaseArrayResult<AgricultureJobResult>
export type AgricultureJobInfoResult = BaseObjectResult<AgricultureJobResult>
