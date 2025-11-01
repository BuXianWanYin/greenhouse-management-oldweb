import {BaseArrayResult, BaseObjectResult, BasePageResult} from '../axios'

export interface AgricultureAutoControlStrategyResult {
                id: string,
                pastureId: string,
                batchId: string,
                deviceId: string,
                strategyType: string,
                parameter: string,
                condition: string,
                action: string,
                status: string,
                description: string,
                createTime: string,
                updateTime: string
}

export type AgricultureAutoControlStrategyListPageResult = BasePageResult<AgricultureAutoControlStrategyResult>
export type AgricultureAutoControlStrategyListResult = BaseArrayResult<AgricultureAutoControlStrategyResult>
export type AgricultureAutoControlStrategyInfoResult = BaseObjectResult<AgricultureAutoControlStrategyResult>

