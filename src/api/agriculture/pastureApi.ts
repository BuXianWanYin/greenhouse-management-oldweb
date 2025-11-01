import request from '@/utils/http'
import { AgriculturePastureInfoResult,AgriculturePastureListPageResult } from '@/types/agriculture/pasture'
import { CodeMsgResult } from '@/types/axios'

// 大棚
export class AgriculturePastureService {
    // 查询大棚列表
    static listPasture(query: any) {
        return request.get<AgriculturePastureListPageResult>({
            url: '/agriculture/pasture/list',
            params: query
        })
    }

    // 查询大棚详细
    static getPasture(id: any) {
        return request.get<AgriculturePastureInfoResult>({
            url: '/agriculture/pasture/' + id,
        })
    }

    // 新增大棚
    static addPasture(data: any) {
        return request.post<CodeMsgResult>({
            url: '/agriculture/pasture',
            data: data
        })
    }

    // 修改大棚
    static updatePasture(data: any) {
        return request.put<CodeMsgResult>({
            url: '/agriculture/pasture',
            data: data
        })
    }

    // 删除大棚
    static deletePasture(id: any) {
        return request.del<CodeMsgResult>({
            url: '/agriculture/pasture/' + id,
        })
    }
    
    //查询大棚剩余面积 
    static listArea(query: any){
        return request.get<AgriculturePastureListPageResult>({
            url: '/agriculture/pasture/area',
            params: query
        })
    }

    // 导出大棚列表
    static exportExcel(data: any) {
        return request.post({
            url: 'agriculture/pasture/export',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            responseType: 'blob',
            data: data
        })
    }
}