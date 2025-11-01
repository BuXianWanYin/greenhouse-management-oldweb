import request from '@/utils/http'
import { AgricultureCostMachineInfoResult,AgricultureCostMachineListPageResult } from '@/types/agriculture/costMachine'
import { CodeMsgResult } from '@/types/axios'

// 机械工时
export class AgricultureCostMachineService {
    // 查询机械工时列表
    static listMachine(query: any) {
        return request.get<AgricultureCostMachineListPageResult>({
            url: '/agriculture/costMachine/list',
            params: query
        })
    }

    // 查询机械工时详细
    static getMachine(costId: any) {
        return request.get<AgricultureCostMachineInfoResult>({
            url: '/agriculture/costMachine/' + costId,
        })
    }

    // 新增机械工时
    static addMachine(data: any) {
        return request.post<CodeMsgResult>({
            url: '/agriculture/costMachine',
            data: data
        })
    }

    // 修改机械工时
    static updateMachine(data: any) {
        return request.put<CodeMsgResult>({
            url: '/agriculture/costMachine',
            data: data
        })
    }

    // 删除机械工时
    static deleteMachine(costId: any) {
        return request.del<CodeMsgResult>({
            url: '/agriculture/costMachine/' + costId,
        })
    }

    // 导出机械工时列表
    static exportExcel(data: any) {
        return request.post({
            url: 'agriculture/costMachine/export',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            responseType: 'blob',
            data: data
        })
    }
}