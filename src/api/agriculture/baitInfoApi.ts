import request from '@/utils/http'
import { AgricultureBaitInfoInfoResult,AgricultureBaitInfoListPageResult } from '@/types/agriculture/baitInfo'
import { CodeMsgResult } from '@/types/axios'

// 饵料信息
export class AgricultureBaitInfoService {
    // 查询饵料信息列表
    static listInfo(query: any) {
        return request.get<AgricultureBaitInfoListPageResult>({
            url: '/agriculture/baitInfo/list',
            params: query
        })
    }

    // 查询饵料信息详细
    static getInfo(baitId: any) {
        return request.get<AgricultureBaitInfoInfoResult>({
            url: '/agriculture/baitInfo/' + baitId,
        })
    }

    // 新增饵料信息
    static addInfo(data: any) {
        return request.post<CodeMsgResult>({
            url: '/agriculture/baitInfo',
            data: data
        })
    }

    // 修改饵料信息
    static updateInfo(data: any) {
        return request.put<CodeMsgResult>({
            url: '/agriculture/baitInfo',
            data: data
        })
    }

    // 删除饵料信息
    static deleteInfo(baitId: any) {
        return request.del<CodeMsgResult>({
            url: '/agriculture/baitInfo/' + baitId,
        })
    }

    // 导出饵料信息列表
    static exportExcel(data: any) {
        return request.post({
            url: 'agriculture/baitInfo/export',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            responseType: 'blob',
            data: data
        })
    }
}