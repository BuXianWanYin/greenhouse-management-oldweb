import request from '@/utils/http'
import { AgricultureResourceUsageInfoResult, AgricultureResourceUsageListPageResult } from '@/types/agriculture/resourceUsage'
import { CodeMsgResult } from '@/types/axios'

// 农资使用管理
export class AgricultureResourceUsageService {
    // 查询农资使用记录列表
    static listUsage(query: any) {
        return request.get<AgricultureResourceUsageListPageResult>({
            url: '/agriculture/resource/usage/list',
            params: query
        })
    }

    // 查询农资使用记录详细
    static getUsage(usageId: any) {
        return request.get<AgricultureResourceUsageInfoResult>({
            url: '/agriculture/resource/usage/' + usageId,
        })
    }

    // 根据批次ID查询使用记录
    static getUsageByBatchId(batchId: any) {
        return request.get<AgricultureResourceUsageListPageResult>({
            url: '/agriculture/resource/usage/batch/' + batchId,
        })
    }

    // 根据任务ID查询使用记录
    static getUsageByTaskId(taskId: any) {
        return request.get<AgricultureResourceUsageListPageResult>({
            url: '/agriculture/resource/usage/task/' + taskId,
        })
    }

    // 新增农资使用记录（自动扣减库存）
    static addUsage(data: any) {
        return request.post<CodeMsgResult>({
            url: '/agriculture/resource/usage',
            data: data
        })
    }

    // 修改农资使用记录
    static updateUsage(data: any) {
        return request.put<CodeMsgResult>({
            url: '/agriculture/resource/usage',
            data: data
        })
    }

    // 删除农资使用记录
    static deleteUsage(usageId: any) {
        return request.del<CodeMsgResult>({
            url: '/agriculture/resource/usage/' + usageId,
        })
    }

    // 归还农资（机械类型农资归还，增加库存并更新状态）
    static returnUsage(usageId: any) {
        return request.put<CodeMsgResult>({
            url: '/agriculture/resource/usage/return/' + usageId,
        })
    }

    // 导出农资使用记录列表
    static exportExcel(data: any) {
        return request.post({
            url: 'agriculture/resource/usage/export',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            responseType: 'blob',
            data: data
        })
    }
}

