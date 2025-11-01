import request from '@/utils/http'
import { AgricultureWaterQualityDataInfoResult,AgricultureWaterQualityDataListPageResult } from '@/types/device/waterQualityData'
import { CodeMsgResult } from '@/types/axios'

// 水质数据
export class AgricultureWaterQualityDataService {

     // 查询水质趋势数据
     static getTrendData(params: { pastureId: string, batchId: string, range: string }) {
        return request.get<any>({
            url: '/device/quality/trend',
            params
        })
    }
    // 查询水质数据列表
    static listData(query: any) {
        return request.get<AgricultureWaterQualityDataListPageResult>({
            url: '/device/quality/list',
            params: query
        })
    }

      // 获取最新一条水质数据
      static getLatestData(pastureId: string) {
        return request.get<AgricultureWaterQualityDataInfoResult>({
            url: '/device/quality/latest',
            params: { pastureId }
        })
    }
    
    // 查询水质数据详细
    static getData(id: any) {
        return request.get<AgricultureWaterQualityDataInfoResult>({
            url: '/device/quality/' + id,
        })
    }

    // 新增水质数据
    static addData(data: any) {
        return request.post<CodeMsgResult>({
            url: '/device/quality',
            data: data
        })
    }

    // 修改水质数据
    static updateData(data: any) {
        return request.put<CodeMsgResult>({
            url: '/device/quality',
            data: data
        })
    }

    // 删除水质数据
    static deleteData(id: any) {
        return request.del<CodeMsgResult>({
            url: '/device/quality/' + id,
        })
    }

    // 导出水质数据列表
    static exportExcel(data: any) {
        return request.post({
            url: '/device/quality/export',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            responseType: 'blob',
            data: data
        })
    }
}