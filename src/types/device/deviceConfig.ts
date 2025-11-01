import {BaseArrayResult, BaseObjectResult, BasePageResult} from '../axios'

export interface AgricultureDeviceMqttConfigResult {
                id: string,
                deviceId: string,
                mqttBroker: string,
                mqttTopic: string,
                mqttQos: string,
                mqttUsername: string,
                mqttPassword: string,
                remark: string,
                createBy: string,
                createTime: string,
                updateBy: string,
                updateTime: string
}

export type AgricultureDeviceMqttConfigListPageResult = BasePageResult<AgricultureDeviceMqttConfigResult>
export type AgricultureDeviceMqttConfigListResult = BaseArrayResult<AgricultureDeviceMqttConfigResult>
export type AgricultureDeviceMqttConfigInfoResult = BaseObjectResult<AgricultureDeviceMqttConfigResult>

