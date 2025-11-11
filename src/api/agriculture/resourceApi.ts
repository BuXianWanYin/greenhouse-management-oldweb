import request from '@/utils/http'
import { AgricultureResourceInfoResult, AgricultureResourceListPageResult } from '@/types/agriculture/resource'
import { CodeMsgResult } from '@/types/axios'

// 农资资源
export class AgricultureResourceService {
    // 查询农资资源列表
    static listResource(query: any) {
        return request.get<AgricultureResourceListPageResult>({
            url: '/agriculture/resource/list',
            params: query
        })
    }

    // 查询农资资源详细
    static getResource(resourceId: any) {
        return request.get<AgricultureResourceInfoResult>({
            url: '/agriculture/resource/' + resourceId,
        })
    }

    // 新增农资资源
    static addResource(data: any) {
        return request.post<CodeMsgResult>({
            url: '/agriculture/resource',
            data: data
        })
    }

    // 修改农资资源
    static updateResource(data: any) {
        return request.put<CodeMsgResult>({
            url: '/agriculture/resource',
            data: data
        })
    }

    // 删除农资资源
    static deleteResource(resourceId: any) {
        return request.del<CodeMsgResult>({
            url: '/agriculture/resource/' + resourceId,
        })
    }

    // 导出农资资源列表
    static exportExcel(data: any) {
        return request.post({
            url: 'agriculture/resource/export',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            responseType: 'blob',
            data: data
        })
    }
}

