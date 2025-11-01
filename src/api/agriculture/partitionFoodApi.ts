import request from '@/utils/http'
import { AgriculturePartitionFoodInfoResult, AgriculturePartitionFoodListPageResult, TraceDetailResult } from '@/types/agriculture/partitionFood'
import { CodeMsgResult } from '@/types/axios'

// 分区食品 采摘
export class partitionFoodService {
    // 查询分区食品 采摘列表
    static listFood(query: any) {
        return request.get<AgriculturePartitionFoodListPageResult>({
            url: '/agriculture/partitionFood/list',
            params: query
        })
    }

    // 查询溯源详情（分区、大棚、批次任务、环境数据等）传递 traceId 和 firstTraceTime
    static getTraceDetail(traceId: string, firstTraceTime?: string) {
        const params: any = { traceId };
        if (firstTraceTime) params.firstTraceTime = firstTraceTime;
        return request.get<TraceDetailResult>({
            url: '/agriculture/partitionFood/traceDetail',
            params
        });
    }
    
    // 查询分区食品 采摘详细
    static getFood(id: any) {
        return request.get<AgriculturePartitionFoodInfoResult>({
            url: '/agriculture/partitionFood/' + id,
        })
    }

    // 新增分区食品 采摘
    static addFood(data: any) {
        return request.post<CodeMsgResult>({
            url: '/agriculture/partitionFood',
            data: data
        })
    }

    // 修改分区食品 采摘
    static updateFood(data: any) {
        return request.put<CodeMsgResult>({
            url: '/agriculture/partitionFood',
            data: data
        })
    }

    // 删除分区食品 采摘
    static deleteFood(id: any) {
        return request.del<CodeMsgResult>({
            url: '/agriculture/partitionFood' + id,
        })
    }

    // 查询分区食品 采摘列表
    static page(query: any) {
        return request.get<AgriculturePartitionFoodListPageResult>({
            url: '/agriculture/partitionFood/page',
            params: query
        })
    }

    // 导出分区食品 采摘列表
    static exportExcel(data: any) {
        return request.post({
            url: 'agriculture/partitionFood/export',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            responseType: 'blob',
            data: data
        })
    }
}