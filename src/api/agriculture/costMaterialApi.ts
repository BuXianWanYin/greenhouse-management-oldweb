import request from '@/utils/http'
import { FishCostBaitInfoResult,FishCostBaitListPageResult } from '@/types/agriculture/costMaterial'
import { CodeMsgResult } from '@/types/axios'

// 饵料投喂
export class FishCostBaitService {
    // 查询饵料投喂列表
    static listBait(query: any) {
        return request.get<FishCostBaitListPageResult>({
            url: '/agriculture/costBait/list',
            params: query
        })
    }

    // 查询饵料投喂详细
    static getBait(costId: any) {
        return request.get<FishCostBaitInfoResult>({
            url: '/agriculture/costBait/' + costId,
        })
    }

    // 新增饵料投喂
    static addBait(data: any) {
        return request.post<CodeMsgResult>({
            url: '/agriculture/costBait',
            data: data
        })
    }

    // 修改饵料投喂
    static updateBait(data: any) {
        return request.put<CodeMsgResult>({
            url: '/agriculture/costBait',
            data: data
        })
    }

    // 删除饵料投喂
    static deleteBait(costId: any) {
        return request.del<CodeMsgResult>({
            url: '/agriculture/costBait/' + costId,
        })
    }

    // 导出饵料投喂列表
    static exportExcel(data: any) {
        return request.post({
            url: 'agriculture/costBait/export',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            responseType: 'blob',
            data: data
        })
    }
}