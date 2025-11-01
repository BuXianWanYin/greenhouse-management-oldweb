import request from '@/utils/http'
import { AgricultureMachineInfoResult,AgricultureMachineListPageResult } from '@/types/agriculture/machine'
import { CodeMsgResult } from '@/types/axios'

// 机械信息
export class AgricultureMachineService {
    // 查询机械信息列表
    static listMachine(query: any) {
        return request.get<AgricultureMachineListPageResult>({
            url: '/agriculture/machine/list',
            params: query
        })
    }

    // 查询机械信息详细
    static getMachine(machineId: any) {
        return request.get<AgricultureMachineInfoResult>({
            url: '/agriculture/machine/' + machineId,
        })
    }

    // 新增机械信息
    static addMachine(data: any) {
        return request.post<CodeMsgResult>({
            url: '/agriculture/machine',
            data: data
        })
    }

    // 修改机械信息
    static updateMachine(data: any) {
        return request.put<CodeMsgResult>({
            url: '/agriculture/machine',
            data: data
        })
    }

    // 删除机械信息
    static deleteMachine(machineId: any) {
        return request.del<CodeMsgResult>({
            url: '/agriculture/machine/' + machineId,
        })
    }

    // 导出机械信息列表
    static exportExcel(data: any) {
        return request.post({
            url: '/agriculture/machine/export',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            responseType: 'blob',
            data: data
        })
    }
}