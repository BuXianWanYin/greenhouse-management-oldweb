import {BaseArrayResult, BaseObjectResult, BasePageResult} from '../axios'

export interface AgricultureCostEmployeeResult {
                costId: number,
                taskId: string,
                employeeId: string,
                workingHours: string,
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

export type AgricultureCostEmployeeListPageResult = BasePageResult<AgricultureCostEmployeeResult>
export type AgricultureCostEmployeeListResult = BaseArrayResult<AgricultureCostEmployeeResult>
export type AgricultureCostEmployeeInfoResult = BaseObjectResult<AgricultureCostEmployeeResult>

