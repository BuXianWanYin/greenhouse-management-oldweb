import request from '@/utils/http'
import { ParamTypeDictInfoResult,ParamTypeDictListPageResult } from '@/types/device/typedict'
import { CodeMsgResult } from '@/types/axios'

// 传感器参数类型中英文对照
export class ParamTypeDictService {
    // 查询传感器参数类型中英文对照列表
    static listDict(query: any) {
        return request.get<ParamTypeDictListPageResult>({
            url: '/device/dict/list',
            params: query
        })
    }

    // 查询传感器参数类型中英文对照详细
    static getDict(id: any) {
        return request.get<ParamTypeDictInfoResult>({
            url: '/device/dict/' + id,
        })
    }

    // 新增传感器参数类型中英文对照
    static addDict(data: any) {
        return request.post<CodeMsgResult>({
            url: '/device/dict',
            data: data
        })
    }

    // 修改传感器参数类型中英文对照
    static updateDict(data: any) {
        return request.put<CodeMsgResult>({
            url: '/device/dict',
            data: data
        })
    }

    // 删除传感器参数类型中英文对照
    static deleteDict(id: any) {
        return request.del<CodeMsgResult>({
            url: '/device/dict/' + id,
        })
    }

    // 导出传感器参数类型中英文对照列表
    static exportExcel(data: any) {
        return request.post({
            url: 'device/dict/export',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            responseType: 'blob',
            data: data
        })
    }
}