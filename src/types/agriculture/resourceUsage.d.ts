import {BaseArrayResult, BaseObjectResult, BasePageResult} from '../axios'

export interface AgricultureResourceUsageResult {
    usageId: string
    resourceId: string
    batchId: string | null
    taskId: string | null
    usageQuantity: number // decimal(10,2)
    measureUnit: string
    usageDate: string // datetime
    usageType: string // 使用类型(0是领用,1是消耗,2是入库)
    operator: string | null
    remark: string
    status: string // 状态(0正常,1已撤销)
    orderNum: number
    createBy: string
    createTime: string
    updateBy: string
    updateTime: string
    delFlag: string
}

export type AgricultureResourceUsageListPageResult = BasePageResult<AgricultureResourceUsageResult>
export type AgricultureResourceUsageListResult = BaseArrayResult<AgricultureResourceUsageResult>
export type AgricultureResourceUsageInfoResult = BaseObjectResult<AgricultureResourceUsageResult>

