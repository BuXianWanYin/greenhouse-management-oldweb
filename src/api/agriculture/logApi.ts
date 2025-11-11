import request from '@/utils/http'
import { AgricultureTaskLogInfoResult,AgricultureTaskLogListPageResult } from '@/types/agriculture/log'
import { CodeMsgResult } from '@/types/axios'

// 批次任务日志
export class AgricultureTaskLogService {
    // 查询批次任务日志列表
    static listLog(query: any) {
        return request.get<AgricultureTaskLogListPageResult>({
            url: '/agriculture/log/list',
            params: query
        })
    }

    // 根据任务ID查询批次任务日志列表
    static listByTaskId(taskId: string | number) {
        return request.get<AgricultureTaskLogListPageResult>({
            url: `/agriculture/log/task/${taskId}`
        })
    }

    // 查询批次任务日志详细
    static getLog(logId: any) {
        return request.get<AgricultureTaskLogInfoResult>({
            url: '/agriculture/log/' + logId,
        })
    }

    // 新增批次任务日志
    static addLog(data: any) {
        return request.post<CodeMsgResult>({
            url: '/agriculture/log',
            data: data
        })
    }

    // 修改批次任务日志
    static updateLog(data: any) {
        return request.put<CodeMsgResult>({
            url: '/agriculture/log',
            data: data
        })
    }

    // 删除批次任务日志
    static deleteLog(logId: any) {
        return request.del<CodeMsgResult>({
            url: '/agriculture/log/' + logId,
        })
    }

    // 导出批次任务日志列表
    static exportExcel(data: any) {
        return request.post({
            url: 'agriculture/log/export',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            responseType: 'blob',
            data: data
        })
    }
}