import request from '@/utils/http'
import { AgricultureSoilDataInfoResult,AgricultureSoilDataListPageResult } from '@/types/sensor/soildata'
import { CodeMsgResult } from '@/types/axios'

// 土壤8参数传感器数据
export class AgricultureSoilDataService {
    // 查询土壤8参数传感器数据列表
    static listData(query: any) {
        return request.get<AgricultureSoilDataListPageResult>({
            url: '/device/soildata/list',
            params: query
        })
    }

    // 查询土壤8参数传感器数据详细
    static getData(id: any) {
        return request.get<AgricultureSoilDataInfoResult>({
            url: '/device/soildata/' + id,
        })
    }

    // 新增土壤8参数传感器数据
    static addData(data: any) {
        return request.post<CodeMsgResult>({
            url: '/device/soildata',
            data: data
        })
    }

    // 修改土壤8参数传感器数据
    static updateData(data: any) {
        return request.put<CodeMsgResult>({
            url: '/device/soildata',
            data: data
        })
    }

    // 删除土壤8参数传感器数据
    static deleteData(id: any) {
        return request.del<CodeMsgResult>({
            url: '/device/soildata/' + id,
        })
    }

    // 导出土壤8参数传感器数据列表
    static exportExcel(data: any) {
        return request.post({
            url: 'server/data/export',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            responseType: 'blob',
            data: data
        })
    }
}
