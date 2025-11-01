import {BaseArrayResult, BaseObjectResult, BasePageResult} from '../axios'

export interface AgricultureWeatherDataResult {
                id: string,
                deviceId: string,
                pastureId: string,
                batchId: string,
                windSpeed: string,
                windDirection: string,
                temperature: string,
                humidity: string,
                lightIntensity: string,
                rainfall: string,
                airPressure: string,
                collectTime: string,
                createBy: string,
                createTime: string,
                updateBy: string,
                updateTime: string,
                remark: string
}

export type AgricultureWeatherDataListPageResult = BasePageResult<AgricultureWeatherDataResult>
export type AgricultureWeatherDataListResult = BaseArrayResult<AgricultureWeatherDataResult>
export type AgricultureWeatherDataInfoResult = BaseObjectResult<AgricultureWeatherDataResult>

