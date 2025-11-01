import { BaseArrayResult, BaseObjectResult, BasePageResult } from '../axios'

export interface AgricultureCostMachineResult {
    costId: string,
    taskId: string,
    machineId: string,
    machineCount: string,
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

export type AgricultureCostMachineListPageResult = BasePageResult<AgricultureCostMachineResult>
export type AgricultureCostMachineListResult = BaseArrayResult<AgricultureCostMachineResult>
export type AgricultureCostMachineInfoResult = BaseObjectResult<AgricultureCostMachineResult>

