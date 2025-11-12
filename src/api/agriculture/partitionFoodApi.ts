import request from '@/utils/http'
import { AgriculturePartitionFoodInfoResult, AgriculturePartitionFoodListPageResult } from '@/types/agriculture/partitionFood'
import { CodeMsgResult } from '@/types/axios'

// 采摘记录
export class partitionFoodService {
    // 查询 采摘列表
    static listFood(query: any) {
        return request.get<AgriculturePartitionFoodListPageResult>({
            url: '/agriculture/partitionFood/list',
            params: query
        })
    }
    
    // 查询 采摘详细
    static getFood(id: any) {
        return request.get<AgriculturePartitionFoodInfoResult>({
            url: '/agriculture/partitionFood/' + id,
        })
    }

    // 新增 采摘
    static addFood(data: any) {
        return request.post<CodeMsgResult>({
            url: '/agriculture/partitionFood',
            data: data
        })
    }

    // 修改 采摘
    static updateFood(data: any) {
        return request.put<CodeMsgResult>({
            url: '/agriculture/partitionFood',
            data: data
        })
    }

    // 删除 采摘
    static deleteFood(id: any) {
        return request.del<CodeMsgResult>({
            url: '/agriculture/partitionFood' + id,
        })
    }

    // 查询 采摘列表
    static page(query: any) {
        return request.get<AgriculturePartitionFoodListPageResult>({
            url: '/agriculture/partitionFood/page',
            params: query
        })
    }

    // 导出 采摘列表
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