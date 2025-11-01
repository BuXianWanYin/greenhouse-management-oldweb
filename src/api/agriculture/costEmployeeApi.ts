import request from '@/utils/http'
import { AgricultureCostEmployeeInfoResult,AgricultureCostEmployeeListPageResult } from '@/types/agriculture/costEmployee'
import { CodeMsgResult } from '@/types/axios'

// 人工工时
export class AgricultureCostEmployeeService {
    // 查询人工工时列表
    static listEmployee(query: any) {
        return request.get<AgricultureCostEmployeeListPageResult>({
            url: '/agriculture/costEmployee/list',
            params: query
        })
    }

    // 查询人工工时详细
    static getEmployee(costId: any) {
        return request.get<AgricultureCostEmployeeInfoResult>({
            url: '/agriculture/costEmployee/' + costId,
        })
    }

    // 新增人工工时
    static addEmployee(data: any) {
        return request.post<CodeMsgResult>({
            url: '/agriculture/costEmployee',
            data: data
        })
    }

    // 修改人工工时
    static updateEmployee(data: any) {
        return request.put<CodeMsgResult>({
            url: '/agriculture/costEmployee',
            data: data
        })
    }

    // 删除人工工时
    static deleteEmployee(costId: any) {
        return request.del<CodeMsgResult>({
            url: '/agriculture/costEmployee/' + costId,
        })
    }

    // 导出人工工时列表
    static exportExcel(data: any) {
        return request.post({
            url: 'agriculture/costEmployee/export',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            responseType: 'blob',
            data: data
        })
    }
}