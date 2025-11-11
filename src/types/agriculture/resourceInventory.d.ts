import {BaseArrayResult, BaseObjectResult, BasePageResult} from '../axios'

export interface AgricultureResourceInventoryResult {
    inventoryId: string
    resourceId: string
    currentStock: number // decimal(10,2)
    minStock: number // decimal(10,2)
    maxStock: number // decimal(10,2)
    remark: string
    createBy: string
    createTime: string
    updateBy: string
    updateTime: string
    delFlag: string
}

export type AgricultureResourceInventoryListPageResult = BasePageResult<AgricultureResourceInventoryResult>
export type AgricultureResourceInventoryListResult = BaseArrayResult<AgricultureResourceInventoryResult>
export type AgricultureResourceInventoryInfoResult = BaseObjectResult<AgricultureResourceInventoryResult>

