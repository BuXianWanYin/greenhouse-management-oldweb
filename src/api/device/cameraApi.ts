import request from '@/utils/http'
import { AgricultureCameraInfoResult,AgricultureCameraListPageResult } from '@/types/device/camera'
import { CodeMsgResult } from '@/types/axios'

// 摄像头参数
export class AgricultureCameraService {
    // 查询摄像头参数列表
    static listCamera(query: any) {
        return request.get<AgricultureCameraListPageResult>({
            url: '/device/camera/list',
            params: query
        })
    }
    
    // 根据 deviceId 查询摄像头参数
    static getCameraByDeviceId(deviceId: any) {
        return request.get<AgricultureCameraInfoResult>({
            url: '/device/camera/byDeviceId/' + deviceId,
        })
    }
    // 查询摄像头参数详细
    static getCamera(id: any) {
        return request.get<AgricultureCameraInfoResult>({
            url: '/device/camera/' + id,
        })
    }

    // 新增摄像头参数
    static addCamera(data: any) {
        return request.post<CodeMsgResult>({
            url: '/device/camera',
            data: data
        })
    }

    // 修改摄像头参数
    static updateCamera(data: any) {
        return request.put<CodeMsgResult>({
            url: '/device/camera',
            data: data
        })
    }

    // 删除摄像头参数
    static deleteCamera(id: any) {
        return request.del<CodeMsgResult>({
            url: '/device/camera/' + id,
        })
    }

    // 导出摄像头参数列表
    static exportExcel(data: any) {
        return request.post({
            url: 'device/camera/export',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            responseType: 'blob',
            data: data
        })
    }
}