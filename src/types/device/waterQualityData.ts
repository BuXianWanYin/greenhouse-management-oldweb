import {BaseArrayResult, BaseObjectResult, BasePageResult} from '../axios'

export interface AgricultureWaterQualityDataResult {
                id: string,
                deviceId: string,
                pastureId: string,
                batchId: string,
                phValue: string,
                dissolvedOxygen: string,
                ammoniaNitrogen: string,
                waterTemperature: string,
                conductivity: string,
                collectTime: string,
                createBy: string,
                createTime: string,
                updateBy: string,
                updateTime: string,
                remark: string
}

export type AgricultureWaterQualityDataListPageResult = BasePageResult<AgricultureWaterQualityDataResult>
export type AgricultureWaterQualityDataListResult = BaseArrayResult<AgricultureWaterQualityDataResult>
export type AgricultureWaterQualityDataInfoResult = BaseObjectResult<AgricultureWaterQualityDataResult>

