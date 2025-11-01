import { BaseArrayResult, BaseObjectResult, BasePageResult } from '../axios'

export interface AgricultureMachineResult {
    machineId: string,
    machineCode: string,
    machineName: string,
    machineImage: string,
    measureUnit: string,
    remark: string,
    status: string,
    orderNum: string,
    createBy: string,
    createTime: string,
    updateBy: string,
    updateTime: string,
    delFlag: string
}

export type AgricultureMachineListPageResult = BasePageResult<AgricultureMachineResult>
export type AgricultureMachineListResult = BaseArrayResult<AgricultureMachineResult>
export type AgricultureMachineInfoResult = BaseObjectResult<AgricultureMachineResult>

