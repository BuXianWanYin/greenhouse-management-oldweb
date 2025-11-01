import {BaseArrayResult, BaseObjectResult, BasePageResult} from '../axios'

export interface AgricultureDeviceSensorAlertResult {
                id: string,
                alertType: string,
                alertMessage: string,
                paramName: string,
                paramValue: string,
                thresholdMin: string,
                thresholdMax: string,
                pastureId: string,
                batchId: string,
                deviceId: string,
                deviceName: string,
                deviceType: string,
                sensorType: string,
                address: string,
                alertTime: string,
                alertLevel: string,
                status: string,
                remark: string,
                createBy: string,
                createTime: string,
                updateBy: string,
                updateTime: string
}

export type AgricultureDeviceSensorAlertListPageResult = BasePageResult<AgricultureDeviceSensorAlertResult>
export type AgricultureDeviceSensorAlertListResult = BaseArrayResult<AgricultureDeviceSensorAlertResult>
export type AgricultureDeviceSensorAlertInfoResult = BaseObjectResult<AgricultureDeviceSensorAlertResult>

