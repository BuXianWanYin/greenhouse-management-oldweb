import request from '@/utils/http'
import { AgricultureEmployeeInfoResult,AgricultureEmployeeListPageResult } from '@/types/agriculture/employee'
import { CodeMsgResult } from '@/types/axios'

// 雇员
export class AgricultureEmployeeService {
    // 查询雇员列表
    static listEmployee(query: any) {
        return request.get<AgricultureEmployeeListPageResult>({
            url: '/agriculture/employee/list',
            params: query
        })
    }

    // 查询雇员详细
    static getEmployee(employeeId: any) {
        return request.get<AgricultureEmployeeInfoResult>({
            url: '/agriculture/employee/' + employeeId,
        })
    }

    // 新增雇员
    static addEmployee(data: any) {
        return request.post<CodeMsgResult>({
            url: '/agriculture/employee',
            data: data
        })
    }

    // 修改雇员
    static updateEmployee(data: any) {
        return request.put<CodeMsgResult>({
            url: '/agriculture/employee',
            data: data
        })
    }

    // 删除雇员
    static deleteEmployee(employeeId: any) {
        return request.del<CodeMsgResult>({
            url: '/agriculture/employee/' + employeeId,
        })
    }

    // 导出雇员列表
    static exportExcel(data: any) {
        return request.post({
            url: 'agriculture/employee/export',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            responseType: 'blob',
            data: data
        })
    }
}