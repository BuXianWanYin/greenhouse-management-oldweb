import {BaseArrayResult, BaseObjectResult, BasePageResult} from '../axios'

export interface AgricultureDeviceHeartbeatResult {
                id: string,
                deviceId: string,
                heartbeatCmdHex: string,
                cmdFunctionCode: string,
                cmdRegStart: string,
                cmdRegLength: string,
                crc16Low: string,
                crc16High: string,
                sendInterval: string,
                lastSendTime: string,
                lastRecvTime: string,
                onlineStatus: string,
                offlineCount: string,
                createTime: string,
                updateTime: string,
                lastOnlineTime: string
}

export type AgricultureDeviceHeartbeatListPageResult = BasePageResult<AgricultureDeviceHeartbeatResult>
export type AgricultureDeviceHeartbeatListResult = BaseArrayResult<AgricultureDeviceHeartbeatResult>
export type AgricultureDeviceHeartbeatInfoResult = BaseObjectResult<AgricultureDeviceHeartbeatResult>

