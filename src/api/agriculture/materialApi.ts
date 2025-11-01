import request from '@/utils/http'
import { AgricultureMaterialInfoResult,AgricultureMaterialListPageResult } from '@/types/agriculture/material'
import { CodeMsgResult } from '@/types/axios'

// 农资信息
export class AgricultureMaterialService {
    // 查询农资信息列表
    static listMaterial(query: any) {
        return request.get<AgricultureMaterialListPageResult>({
            url: '/agriculture/material/list',
            params: query
        })
    }

    // 查询农资信息详细
    static getMaterial(materialId: any) {
        return request.get<AgricultureMaterialInfoResult>({
            url: '/agriculture/material/' + materialId,
        })
    }

    // 新增农资信息
   static addMaterial(data: any) {
    return request.post<CodeMsgResult>({
        url: '/agriculture/material',
        data: data
    })
   }

    // 修改农资信息
    static updateMaterial(data: any) {
        return request.put<CodeMsgResult>({
            url: '/agriculture/material',
            data: data
        })
    }

    // 删除农资信息
    static deleteMaterial(materialId: any) {
        return request.del<CodeMsgResult>({
            url: '/agriculture/material/' + materialId,
        })
    }

    // 导出农资信息列表
    static exportExcel(data: any) {
        return request.post({
            url: 'agriculture/material/export',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            responseType: 'blob',
            data: data
        })
    }
}