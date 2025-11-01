import {BaseArrayResult, BaseObjectResult, BasePageResult} from '../axios'

export interface AgricultureTaskLogResult {
                logId: string,
                taskId: string,
                operName: string,
                operId: string,
                operDes: string,
                remark: string,
                status: string,
                orderNum: string,
                createBy: string,
                createTime: string,
                updateBy: string,
                updateTime: string,
                delFlag: string
}

export type AgricultureTaskLogListPageResult = BasePageResult<AgricultureTaskLogResult>
export type AgricultureTaskLogListResult = BaseArrayResult<AgricultureTaskLogResult>
export type AgricultureTaskLogInfoResult = BaseObjectResult<AgricultureTaskLogResult>

