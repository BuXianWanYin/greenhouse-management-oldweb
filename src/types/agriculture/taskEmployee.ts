import {BaseArrayResult, BaseObjectResult, BasePageResult} from '../axios'

export interface AgricultureTaskEmployeeResult {
                id: string,
                taskId: string,
                employeeId: string,
                remark: string,
                status: string,
                orderNum: string,
                createBy: string,
                createTime: string,
                updateBy: string,
                updateTime: string,
                delFlag: string
}

export type AgricultureTaskEmployeeListPageResult = BasePageResult<AgricultureTaskEmployeeResult>
export type AgricultureTaskEmployeeListResult = BaseArrayResult<AgricultureTaskEmployeeResult>
export type AgricultureTaskEmployeeInfoResult = BaseObjectResult<AgricultureTaskEmployeeResult>

