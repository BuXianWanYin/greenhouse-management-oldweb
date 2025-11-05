import request from '@/utils/http'
import { AgricultureAirDataInfoResult,AgricultureAirDataListPageResult } from '@/types/sensor/airdata'
import { CodeMsgResult } from '@/types/axios'

// 温度湿度光照传感器数据
export class AgricultureAirDataService {
    // 查询温度湿度光照传感器数据列表
    static listData(query: any) {
        return request.get<AgricultureAirDataListPageResult>({
            url: '/device/airdata/list',
            params: query
        })
    }

    // 查询温度湿度光照传感器数据详细
    static getData(id: any) {
        return request.get<AgricultureAirDataInfoResult>({
            url: '/device/airdata/' + id,
        })
    }

    // 新增温度湿度光照传感器数据
    static addData(data: any) {
        return request.post<CodeMsgResult>({
            url: '/device/airdata',
            data: data
        })
    }

    // 修改温度湿度光照传感器数据
    static updateData(data: any) {
        return request.put<CodeMsgResult>({
            url: '/device/airdata',
            data: data
        })
    }

    // 删除温度湿度光照传感器数据
    static deleteData(id: any) {
        return request.del<CodeMsgResult>({
            url: '/device/airdata/' + id,
        })
    }

    // 导出温度湿度光照传感器数据列表
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

      // 查询气象趋势数据
  static getTrendData(pastureId: string | number, range: 'day' | 'week' | 'month' | '') {
    return request.get<CodeMsgResult>({
      url: '/device/airdata/trend',
      params: {
        pastureId,
        range
      }
    })
  }
}