import request from '@/utils/http'
import { AgricultureDeviceInfoResult,AgricultureDeviceListPageResult } from '@/types/device/device'
import { CodeMsgResult } from '@/types/axios'

// 设备信息
export class AgricultureDeviceService {
    // 查询设备信息列表
    static listDevice(query: any) {
        return request.get<AgricultureDeviceListPageResult>({
            url: '/device/list',
            params: query
        })
    }

    

    // 查询设备信息详细
    static getDevice(id: any) {
        return request.get<AgricultureDeviceInfoResult>({
            url: '/device/' + id,
        })
    }

    // 新增设备信息
    static addDevice(data: any) {
        return request.post<CodeMsgResult>({
            url: '/device',
            data: data
        })
    }

    // 修改设备信息
    static updateDevice(data: any) {
        return request.put<CodeMsgResult>({
            url: '/device',
            data: data
        })
    }

    // 删除设备信息
    static deleteDevice(id: any) {
        return request.del<CodeMsgResult>({
            url: '/device/' + id,
        })
    }

    // 导出设备信息列表
    static exportExcel(data: any) {
        return request.post({
            url: '/device/export',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            responseType: 'blob',
            data: data
        })
    }
}