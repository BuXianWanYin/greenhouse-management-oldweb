import {BaseArrayResult, BaseObjectResult, BasePageResult} from '../axios'

export interface AgricultureAirDataResult {
                id: string,
                deviceId: string,
                pastureId: string,
                temperature: string,
                humidity: string,
                illuminance: string,
                collectTime: string,
                remark: string
}

export type AgricultureAirDataListPageResult = BasePageResult<AgricultureAirDataResult>
export type AgricultureAirDataListResult = BaseArrayResult<AgricultureAirDataResult>
export type AgricultureAirDataInfoResult = BaseObjectResult<AgricultureAirDataResult>

