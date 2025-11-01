import { BaseArrayResult, BaseObjectResult, BasePageResult } from '../axios'

export interface AgricultureJobResult {
  jobId: string
  classId: string
  jobName: string
  cycleUnit: string
  jobStart: string
  jobFinish: string
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
