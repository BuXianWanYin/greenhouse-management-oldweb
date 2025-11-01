import request from '@/utils/http'
import { AgricultureTaskEmployeeInfoResult,AgricultureTaskEmployeeListPageResult } from '@/types/agriculture/taskEmployee'
import { CodeMsgResult } from '@/types/axios'

// 批次任务工人
export class AgricultureTaskEmployeeService {
    // 查询批次任务工人列表
    static listEmployee(query: any) {
        return request.get<AgricultureTaskEmployeeListPageResult>({
            url: '/agriculture/taskEmployee/list',
            params: query
        })
    }

    // 查询批次任务工人详细
    static getEmployee(id: any) {
        return request.get<AgricultureTaskEmployeeInfoResult>({
            url: '/agriculture/taskEmployee/' + id,
        })
    }

    // 新增批次任务工人
    static addEmployee(data: any) {
        return request.post<CodeMsgResult>({
            url: '/agriculture/taskEmployee',
            data: data
        })
    }

    // 修改批次任务工人
    static updateEmployee(data: any) {
        return request.put<CodeMsgResult>({
            url: '/agriculture/taskEmployee',
            data: data
        })
    }

    // 删除批次任务工人
    static deleteEmployee(employee_id: any) {
        return request.del<CodeMsgResult>({
            url: '/agriculture/taskEmployee/' + employee_id,
        })
    }

    // 导出批次任务工人列表
    static exportExcel(data: any) {
        return request.post({
            url: 'agriculture/taskEmployee/export',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            responseType: 'blob',
            data: data
        })
    }
}