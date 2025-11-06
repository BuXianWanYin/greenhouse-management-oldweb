import request from '@/utils/http'

import { AgricultureCropBatchTaskInfoResult, AgricultureCropBatchTaskListPageResult } from '@/types/agriculture/batchTask'

import { CodeMsgResult } from '@/types/axios'

// 批次任务
export class AgricultureCropBatchTaskService {

    // 查询批次任务列表
    static listBatchTask(query: any) {
        return request.get<AgricultureCropBatchTaskListPageResult>({
            url: '/agriculture/batchTask/list',
            params: query
        })
    }

    // 查询批次任务详细
    static getBatchTask(taskId: number) {
        return request.get<AgricultureCropBatchTaskInfoResult>({
            url: '/agriculture/batchTask/' + taskId
        })
    }

    // 新增批次任务
    static addBatchTask(data: any) {
        return request.post<CodeMsgResult>({
            url: '/agriculture/batchTask',
            data: data
        })
    }

    // 修改批次任务
    static updateBatchTask(data: any) {
        return request.put<CodeMsgResult>({
            url: '/agriculture/batchTask',
            data: data
        })
    }

    // 删除批次任务
    static delBatchTask(taskId: string) {
        return request.del<AgricultureCropBatchTaskListPageResult>({
            url: '/agriculture/batchTask/' + taskId
        })
    }

    // 根据批次ID查询批次任务列表
    static listBatchTaskByBatchId(batchId: number | string) {
        return request.get<AgricultureCropBatchTaskInfoResult[]>({
            url: `/agriculture/batchTask/batch/${batchId}`
        })
    }
}