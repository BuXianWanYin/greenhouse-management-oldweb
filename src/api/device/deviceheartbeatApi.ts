import request from '@/utils/http'
import { AgricultureDeviceHeartbeatInfoResult,AgricultureDeviceHeartbeatListPageResult } from '@/types/device/deviceheartbeat'
import { CodeMsgResult } from '@/types/axios'

// 设备心跳状态 
export class AgricultureDeviceHeartbeatService {
    // 查询设备心跳状态 列表
    static listHeartbeat(query: any) {
        return request.get<AgricultureDeviceHeartbeatListPageResult>({
            url: '/device/heartbeat/list',
            params: query
        })
    }

    // 查询设备心跳状态 详细
    static getHeartbeat(id: any) {
        return request.get<AgricultureDeviceHeartbeatInfoResult>({
            url: '/device/heartbeat/' + id,
        })
    }

    // 新增设备心跳状态 
    static addHeartbeat(data: any) {
        return request.post<CodeMsgResult>({
            url: '/device/heartbeat',
            data: data
        })
    }

    // 修改设备心跳状态 
    static updateHeartbeat(data: any) {
        return request.put<CodeMsgResult>({
            url: '/device/heartbeat',
            data: data
        })
    }

    // 删除设备心跳状态 
    static deleteHeartbeat(id: any) {
        return request.del<CodeMsgResult>({
            url: '/device/heartbeat/' + id,
        })
    }

    // 导出设备心跳状态 列表
    static exportExcel(data: any) {
        return request.post({
            url: 'server/heartbeat/export',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            responseType: 'blob',
            data: data
        })
    }
}