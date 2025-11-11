import {BaseArrayResult, BaseObjectResult, BasePageResult} from '../axios'

export interface AgricultureResourceResult {
    resourceId: string
    resourceCode: string
    resourceName: string
    resourceType: string // 农资类型(0是物料,1是机械)
    resourceImage: string | null
    measureUnit: string
    remark: string
    orderNum: number
    createBy: string
    createTime: string
    updateBy: string
    updateTime: string
    delFlag: string
}

export type AgricultureResourceListPageResult = BasePageResult<AgricultureResourceResult>
export type AgricultureResourceListResult = BaseArrayResult<AgricultureResourceResult>
export type AgricultureResourceInfoResult = BaseObjectResult<AgricultureResourceResult>

