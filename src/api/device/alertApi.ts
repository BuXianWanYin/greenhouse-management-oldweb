import request from '@/utils/http'
import { AgricultureDeviceSensorAlertInfoResult,AgricultureDeviceSensorAlertListPageResult } from '@/types/device/alert'
import { CodeMsgResult } from '@/types/axios'

// 传感器预警信息
export class AgricultureDeviceSensorAlertService {
    // 查询传感器预警信息列表
    static listAlert(query: any) {
        return request.get<AgricultureDeviceSensorAlertListPageResult>({
            url: '/device/alert/list',
            params: query
        })
    }

    // 查询传感器预警信息详细
    static getAlert(id: any) {
        return request.get<AgricultureDeviceSensorAlertInfoResult>({
            url: '/device/alert/' + id,
        })
    }

    // 新增传感器预警信息
    static addAlert(data: any) {
        return request.post<CodeMsgResult>({
            url: '/device/alert',
            data: data
        })
    }

    // 修改传感器预警信息
    static updateAlert(data: any) {
        return request.put<CodeMsgResult>({
            url: '/device/alert',
            data: data
        })
    }

        // 修改传感器预警信息
    static updateAlertIot(data: any) {
         return request.put<CodeMsgResult>({
            url: 'http://192.168.31.120:8081/device/iot/alert',
            data: data
        })
    }
    // 删除传感器预警信息
    static deleteAlert(id: any) {
        return request.del<CodeMsgResult>({
            url: '/device/alert/' + id,
        })
    }

    // 导出传感器预警信息列表
    static exportExcel(data: any) {
        return request.post({
            url: 'device/alert/export',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            responseType: 'blob',
            data: data
        })
    }
}