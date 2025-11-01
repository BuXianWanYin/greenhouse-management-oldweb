import request from '@/utils/http'
import { AgricultureDeviceTypeInfoResult,AgricultureDeviceTypeListPageResult } from '@/types/device/devicetype'
import { CodeMsgResult } from '@/types/axios'

// 设备类型
export class AgricultureDeviceTypeService {
    // 查询设备类型列表
    static listType(query: any) {
        return request.get<AgricultureDeviceTypeListPageResult>({
            url: '/device/type/list',
            params: query
        })
    }

    // 查询设备类型详细
    static getType(id: any) {
        return request.get<AgricultureDeviceTypeInfoResult>({
            url: '/device/type/' + id,
        })
    }

    // 新增设备类型
    static addType(data: any) {
        return request.post<CodeMsgResult>({
            url: '/device/type',
            data: data
        })
    }

    // 修改设备类型
    static updateType(data: any) {
        return request.put<CodeMsgResult>({
            url: '/device/type',
            data: data
        })
    }

    // 删除设备类型
    static deleteType(id: any) {
        return request.del<CodeMsgResult>({
            url: '/device/type/' + id,
        })
    }

    // 导出设备类型列表
    static exportExcel(data: any) {
        return request.post({
            url: 'device/type/export',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            responseType: 'blob',
            data: data
        })
    }
}