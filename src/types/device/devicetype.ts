import {BaseArrayResult, BaseObjectResult, BasePageResult} from '../axios'

export interface AgricultureDeviceTypeResult {
                id: string,
                typeCode: string,
                typeName: string,
                typeDesc: string
}

export type AgricultureDeviceTypeListPageResult = BasePageResult<AgricultureDeviceTypeResult>
export type AgricultureDeviceTypeListResult = BaseArrayResult<AgricultureDeviceTypeResult>
export type AgricultureDeviceTypeInfoResult = BaseObjectResult<AgricultureDeviceTypeResult>

