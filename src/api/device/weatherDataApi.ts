import request from '@/utils/http'
import { AgricultureWeatherDataInfoResult,AgricultureWeatherDataListPageResult } from '@/types/device/weatherData'
import { CodeMsgResult } from '@/types/axios'

// 气象数据
export class AgricultureWeatherDataService {
    // 查询气象趋势数据
    static getTrendData(params: { pastureId: string, batchId: string, range: string }) {
        return request.get<any>({
            url: '/device/weather/trend',
            params
        })
    }

      // 获取最新一条气象数据
      static getLatestData(pastureId: string) {
        return request.get<AgricultureWeatherDataInfoResult>({
            url: '/device/weather/latest',
            params: { pastureId }
        })
    }
    
    // 查询气象数据列表
    static listData(query: any) {
        return request.get<AgricultureWeatherDataListPageResult>({
            url: '/device/weather/list',
            params: query
        })
    }

    // 查询气象数据详细
    static getData(id: any) {
        return request.get<AgricultureWeatherDataInfoResult>({
            url: '/device/weather/' + id,
        })
    }

    // 新增气象数据
    static addData(data: any) {
        return request.post<CodeMsgResult>({
            url: '/device/weather',
            data: data
        })
    }

    // 修改气象数据
    static updateData(data: any) {
        return request.put<CodeMsgResult>({
            url: '/device/weather',
            data: data
        })
    }

    // 删除气象数据
    static deleteData(id: any) {
        return request.del<CodeMsgResult>({
            url: '/device/weather/' + id,
        })
    }

    // 导出气象数据列表
    static exportExcel(data: any) {
        return request.post({
            url: '/device/weather/export',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            responseType: 'blob',
            data: data
        })
    }
}