import {BaseArrayResult, BaseObjectResult, BasePageResult} from '../axios'

export interface FishCostBaitResult {
                costId: string,
                taskId: string,
                baitId: string,
                baitCount: string,
                measureUnit: string,
                workingStart: string,
                workingFinish: string,
                remark: string,
                status: string,
                orderNum: string,
                createBy: string,
                createTime: string,
                updateBy: string,
                updateTime: string,
                delFlag: string
}

export type FishCostBaitListPageResult = BasePageResult<FishCostBaitResult>
export type FishCostBaitListResult = BaseArrayResult<FishCostBaitResult>
export type FishCostBaitInfoResult = BaseObjectResult<FishCostBaitResult>

