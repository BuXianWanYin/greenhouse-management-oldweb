import {BaseArrayResult, BaseObjectResult, BasePageResult} from '../axios'

export interface AgriculturePartitionFoodResult {
                id: number | string,
                iaPartitionId: string,
                classId: number,
                date: string,
                weight: number
}

export type AgriculturePartitionFoodListPageResult = BasePageResult<AgriculturePartitionFoodResult>
export type AgriculturePartitionFoodListResult = BaseArrayResult<AgriculturePartitionFoodResult>
export type AgriculturePartitionFoodInfoResult = BaseObjectResult<AgriculturePartitionFoodResult>

