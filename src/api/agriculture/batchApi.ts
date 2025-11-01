import request from '@/utils/http'
import { AgricultureCropBatchInfoResult } from '@/types/agriculture/batch'
import { CodeMsgResult } from '@/types/axios'

// 定义分区列表返回类型
interface BatchListResult {
    code: number;
    msg: string;
    rows: Array<{
        batchName: string;
        batchId: string;
        germplasmId: number;
        pastureId: number;
        startTime: string | null;
        cropArea: number;
        fishArea: number;
        contractAddr: string | null;
        createTime: string;
        classImage: string;
        className: string | null;
        harvest: string
    }>;
    total: number;
}

// 分区
export class AgricultureCropBatchService {
    // 查询分区列表
    static listBatch(query: any) {
        return request.get<BatchListResult>({
            url: '/agriculture/batch/list',
            params: query
        })
    }

    // 根据大棚ID查询分区列表
    static listBatchByPasture(pastureId: string | number) {
        return request.get<BatchListResult>({
            url: `/agriculture/batch/listByPasture/${pastureId}`
        })
    }


    // 查询分区详细
    static getBatch(batchId: any) {
        return request.get<AgricultureCropBatchInfoResult>({
            url: '/agriculture/batch/' + batchId,
        })
    }

    // 新增分区
    static addBatch(data: any) {
        return request.post<CodeMsgResult>({
            url: '/agriculture/batch',
            data: data
        })
    }

    // 修改分区
    static updateBatch(data: any) {
        return request.put<CodeMsgResult>({
            url: '/agriculture/batch',
            data: data
        })
    }

    // 删除分区
    static deleteBatch(batchId: any) {
        return request.del<CodeMsgResult>({
            url: '/agriculture/batch/' + batchId,
        })
    }

    // 导出分区列表
    static exportExcel(data: any) {
        return request.post({
            url: 'agriculture/batch/export',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            responseType: 'blob',
            data: data
        })
    }
}