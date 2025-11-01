import {BaseArrayResult, BaseObjectResult, BasePageResult} from '../axios'

export interface AgricultureCameraResult {
                id: string,
                deviceId: string,
                username: string,
                password: string,
                ip: string,
                port: string,
                channel: string,
                subtype: string
}

export type AgricultureCameraListPageResult = BasePageResult<AgricultureCameraResult>
export type AgricultureCameraListResult = BaseArrayResult<AgricultureCameraResult>
export type AgricultureCameraInfoResult = BaseObjectResult<AgricultureCameraResult>

