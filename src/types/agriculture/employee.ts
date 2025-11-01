import {BaseArrayResult, BaseObjectResult, BasePageResult} from '../axios'

export interface AgricultureEmployeeResult {
                employeeId: string,
                employeeCode: string,
                employeeName: string,
                employeeType: string,
                employeeTel: string,
                employeeSex: string,
                employeeAddress: string,
                remark: string,
                status: string,
                orderNum: string,
                createBy: string,
                createTime: string,
                updateBy: string,
                updateTime: string,
                delFlag: string
}

export type AgricultureEmployeeListPageResult = BasePageResult<AgricultureEmployeeResult>
export type AgricultureEmployeeListResult = BaseArrayResult<AgricultureEmployeeResult>
export type AgricultureEmployeeInfoResult = BaseObjectResult<AgricultureEmployeeResult>

