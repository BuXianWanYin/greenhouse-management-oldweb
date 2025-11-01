import request from '@/utils/http'
import { AgricultureThresholdConfigInfoResult,AgricultureThresholdConfigListPageResult, AgricultureThresholdConfigListResult } from '@/types/device/thresholdConfig'
import { CodeMsgResult } from '@/types/axios'

// 阈值配置
export class AgricultureThresholdConfigService {
    // 查询阈值配置列表
    static listConfig(query: any) {
        return request.get<AgricultureThresholdConfigListPageResult>({
            url: '/device/config/list',
            params: query
        })
    }

    // 通过设备ID获取阈值配置列表
    static listByDeviceId(deviceId: any) {
        return request.get<AgricultureThresholdConfigListResult>({
            url: '/device/config/listByDeviceId/' + deviceId,
        })
    }

       // 通过大棚ID和分区ID获取所有设备的阈值配置
       static listByPastureAndBatch(pastureId: any, batchId: any, deviceType?: any) {
        return request.get<AgricultureThresholdConfigListResult>({
            url: '/device/config/listByPastureAndBatch',
            params: { pastureId, batchId, deviceType }
        })
    }

    // 查询阈值配置详细
    static getConfig(id: any) {
        return request.get<AgricultureThresholdConfigInfoResult>({
            url: '/device/config/' + id,
        })
    }

    // 新增阈值配置
    static addConfig(data: any) {
        return request.post<CodeMsgResult>({
            url: '/device/config',
            data: data
        })
    }

    // 修改阈值配置
    static updateConfig(data: any) {
        return request.put<CodeMsgResult>({
            url: '/device/config',
            data: data
        })
    }

    // 删除阈值配置
    static deleteConfig(id: any) {
        return request.del<CodeMsgResult>({
            url: '/device/config/' + id,
        })
    }

    // 导出阈值配置列表
    static exportExcel(data: any) {
        return request.post({
            url: '/device/config/export',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            responseType: 'blob',
            data: data
        })
    }


}