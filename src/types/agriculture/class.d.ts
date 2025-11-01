import { BaseArrayResult, BaseObjectResult, BasePageResult } from '../axios'

export interface AgricultureClassResult {
  classId: string
  className: string
  classTypeName: string
  classType: string
  classImage: string
  classDes: string
  status: string
  orderNum: string
  createBy: string
  createTime: string
  updateBy: string
  updateTime: string
  remark: string
}

export type AgricultureClassListPageResult = BasePageResult<AgricultureClassResult>
export type AgricultureClassListResult = BaseArrayResult<AgricultureClassResult>
export type AgricultureClassInfoResult = BaseObjectResult<AgricultureClassResult>
