import request from '@/utils/http'
import { AgricultureDeviceMqttConfigInfoResult,AgricultureDeviceMqttConfigListPageResult } from '@/types/device/deviceConfig'
import { CodeMsgResult } from '@/types/axios'

// 设备MQTT配置
export class AgricultureDeviceMqttConfigService {
    // 查询设备MQTT配置列表
    static listConfig(query: any) {
        return request.get<AgricultureDeviceMqttConfigListPageResult>({
            url: '/device/mqttconfig/list',
            params: query
        })
    }

    // 根据 deviceId 查询设备MQTT配置
    static getConfigByDeviceId(deviceId: number | string) {
        return request.get({
            url: `/device/mqttconfig/byDeviceId/${deviceId}`,
        })
    }

    // 查询设备MQTT配置详细
    static getConfig(id: any) {
        return request.get<AgricultureDeviceMqttConfigInfoResult>({
            url: '/device/mqttconfig/' + id,
        })
    }

    // 新增设备MQTT配置
    static addConfig(data: any) {
        return request.post<CodeMsgResult>({
            url: '/device/mqttconfig',
            data: data
        })
    }

    // 修改设备MQTT配置
    static updateConfig(data: any) {
        return request.put<CodeMsgResult>({
            url: '/device/mqttconfig',
            data: data
        })
    }

    // 删除设备MQTT配置
    static deleteConfig(id: any) {
        return request.del<CodeMsgResult>({
            url: '/device/mqttconfig/' + id,
        })
    }

    // 导出设备MQTT配置列表
    static exportExcel(data: any) {
        return request.post({
            url: 'device/mqttconfig/export',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            responseType: 'blob',
            data: data
        })
    }
}