import {BaseArrayResult, BaseObjectResult, BasePageResult} from '../axios'

export interface AgricultureRobotResult {
                id: string,
                type: string,
                content: string,
                timestamp: string,
                userId: string,
                createTime: string,
                updateTime: string
}

export type AgricultureRobotListPageResult = BasePageResult<AgricultureRobotResult>
export type AgricultureRobotListResult = BaseArrayResult<AgricultureRobotResult>
export type AgricultureRobotInfoResult = BaseObjectResult<AgricultureRobotResult>

