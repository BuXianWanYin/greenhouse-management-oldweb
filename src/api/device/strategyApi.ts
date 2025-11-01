import request from '@/utils/http'
import { AgricultureAutoControlStrategyInfoResult,AgricultureAutoControlStrategyListPageResult } from '@/types/device/strategy'
import { CodeMsgResult } from '@/types/axios'

// 设备自动调节策略
export class AgricultureAutoControlStrategyService {
    // 查询设备自动调节策略列表
    static listStrategy(query: any) {
        return request.get<AgricultureAutoControlStrategyListPageResult>({
            url: '/device/strategy/list',
            params: query
        })
    }

    // 查询设备自动调节策略详细
    static getStrategy(id: any) {
        return request.get<AgricultureAutoControlStrategyInfoResult>({
            url: '/device/strategy/' + id,
        })
    }

    // 新增设备自动调节策略
    static addStrategy(data: any) {
        return request.post<CodeMsgResult>({
            url: '/device/strategy',
            data: data
        })
    }

    // 修改设备自动调节策略
    static updateStrategy(data: any) {
        return request.put<CodeMsgResult>({
            url: '/device/strategy',
            data: data
        })
    }

    // 删除设备自动调节策略
    static deleteStrategy(id: any) {
        return request.del<CodeMsgResult>({
            url: '/device/strategy/' + id,
        })
    }

    // 导出设备自动调节策略列表
    static exportExcel(data: any) {
        return request.post({
            url: 'device/strategy/export',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            responseType: 'blob',
            data: data
        })
    }
}