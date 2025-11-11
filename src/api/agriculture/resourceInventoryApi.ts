import request from '@/utils/http'
import { AgricultureResourceInventoryInfoResult, AgricultureResourceInventoryListPageResult } from '@/types/agriculture/resourceInventory'
import { CodeMsgResult } from '@/types/axios'

// 农资库存
export class AgricultureResourceInventoryService {
    // 查询农资库存列表
    static listInventory(query: any) {
        return request.get<AgricultureResourceInventoryListPageResult>({
            url: '/agriculture/resource/inventory/list',
            params: query
        })
    }

    // 查询农资库存详细
    static getInventory(inventoryId: any) {
        return request.get<AgricultureResourceInventoryInfoResult>({
            url: '/agriculture/resource/inventory/' + inventoryId,
        })
    }

    // 根据农资ID获取库存信息
    static getInventoryByResourceId(resourceId: any) {
        return request.get<AgricultureResourceInventoryInfoResult>({
            url: '/agriculture/resource/inventory/resource/' + resourceId,
        })
    }

    // 新增农资库存
    static addInventory(data: any) {
        return request.post<CodeMsgResult>({
            url: '/agriculture/resource/inventory',
            data: data
        })
    }

    // 修改农资库存
    static updateInventory(data: any) {
        return request.put<CodeMsgResult>({
            url: '/agriculture/resource/inventory',
            data: data
        })
    }

    // 删除农资库存
    static deleteInventory(inventoryId: any) {
        return request.del<CodeMsgResult>({
            url: '/agriculture/resource/inventory/' + inventoryId,
        })
    }

    // 导出农资库存列表
    static exportExcel(data: any) {
        return request.post({
            url: 'agriculture/resource/inventory/export',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            responseType: 'blob',
            data: data
        })
    }
}

