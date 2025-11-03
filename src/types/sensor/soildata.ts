import {BaseArrayResult, BaseObjectResult, BasePageResult} from '../axios'

export interface AgricultureSoilDataResult {
                id: string,
                deviceId: string,
                pastureId: string,
                soilTemperature: string,
                soilHumidity: string,
                conductivity: string,
                salinity: string,
                nitrogen: string,
                phosphorus: string,
                potassium: string,
                phValue: string,
                collectTime: string,
                remark: string
}

export type AgricultureSoilDataListPageResult = BasePageResult<AgricultureSoilDataResult>
export type AgricultureSoilDataListResult = BaseArrayResult<AgricultureSoilDataResult>
export type AgricultureSoilDataInfoResult = BaseObjectResult<AgricultureSoilDataResult>
