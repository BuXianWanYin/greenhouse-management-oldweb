import { BaseArrayResult, BaseObjectResult, BasePageResult } from '../axios'

export interface AgricultureClassResult {
  classId: string
  className: string
  category: string // 类别（fruit=瓜果,vegetable=蔬菜,other=其他）
  classImage: string
  classDes: string
  status: string
  createBy: string
  createTime: string
  updateBy: string
  updateTime: string
  remark: string
}

export type AgricultureClassListPageResult = BasePageResult<AgricultureClassResult>
export type AgricultureClassListResult = BaseArrayResult<AgricultureClassResult>
export type AgricultureClassInfoResult = BaseObjectResult<AgricultureClassResult>
