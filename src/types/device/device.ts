import {BaseArrayResult, BaseObjectResult, BasePageResult} from '../axios'

export interface AgricultureDeviceResult {
                id: string,
                deviceName: string,
                deviceTypeId: string,
                deviceTypeName: string,
                status: string,
                controlStatus: string,
                alarmStatus: string,
                lastOnlineTime: string,
                thresholdMin: string,
                thresholdMax: string,
                pastureId: string,
                batchId: string,
                blockAddress: string,
                sensorCommand: string,
                sensorAddress: string,
                commandOn: string,     
                commandOff: string,    
                isControllable: string,   
                date: string,
                remark: string,
                updateTime: string
}

export type AgricultureDeviceListPageResult = BasePageResult<AgricultureDeviceResult>
export type AgricultureDeviceListResult = BaseArrayResult<AgricultureDeviceResult>
export type AgricultureDeviceInfoResult = BaseObjectResult<AgricultureDeviceResult>

