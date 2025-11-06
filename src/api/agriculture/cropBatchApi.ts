import request from '@/utils/http'

import { AgricultureCropBatchInfoResult, AgricultureCropBatchListPageResult } from '@/types/agriculture/batch'

import { CodeMsgResult } from '@/types/axios'

// 种植批次
export class AgricultureCropBatchService {

    // 查询批次列表
    static listBatch(query: any) {
        return request.get<AgricultureCropBatchListPageResult>({
            url: '/agriculture/batch/list',
            params: query
        })
    }

    // 根据温室ID查询批次列表
    static listBatchByPasture(pastureId: string | number) {
        return request.get<AgricultureCropBatchListPageResult>({
            url: `/agriculture/batch/listByPasture/${pastureId}`
        })
    }

    // 查询批次详细
    static getBatch(batchId: number | string) {
        return request.get<AgricultureCropBatchInfoResult>({
            url: `/agriculture/batch/${batchId}`,
        })
    }

    // 新增种植批次
    static addBatch(data: any) {
        return request.post<CodeMsgResult>({
            url: '/agriculture/batch',
            data: data
        })
    }

    // 修改种植批次
    static updateBatch(data: any) {
        return request.put<CodeMsgResult>({
            url: '/agriculture/batch',
            data: data
        })
    }

    // 删除种植批次
    static deleteBatch(batchId: number | string) {
        return request.del<CodeMsgResult>({
            url: `/agriculture/batch/${batchId}`,
        })
    }

    // 导出批次列表
    static exportExcel(data: any) {
        return request.post({
            url: '/agriculture/batch/export',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            responseType: 'blob',
            data: data
        })
    }

    // 根据批次ID查询批次任务列表
    static getBatchTasks(batchId: number | string) {
        return request.get<AgricultureCropBatchTaskInfoResult[]>({
            url: `/agriculture/batch/${batchId}/tasks`
        })
    }
}