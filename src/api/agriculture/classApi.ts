import request from '@/utils/http'
import { AgricultureClassListPageResult } from '@/types/agriculture/class'
import { CodeMsgResult } from '@/types/axios'

// 种类信息
export class AgricultureClassService {
  // 查询种类信息列表
  static listClass(query: any) {
    return request.get<AgricultureClassListPageResult>({
      url: '/agriculture/class/list',
      params: query
    })
  }

  // 新增种类信息
  static addClass(data: any) {
    return request.post<CodeMsgResult>({
      url: '/agriculture/class',
      data: data
    })
  }

  // 修改种类信息
  static updateClass(data: any) {
    return request.put<CodeMsgResult>({
      url: '/agriculture/class',
      data: data
    })
  }

  // 删除种类信息
  static deleteClass(classId: any) {
    return request.del<CodeMsgResult>({
      url: '/agriculture/class/' + classId
    })
  }

  // 导出种类信息列表
  static exportExcel(data: any) {
    return request.post({
      url: 'agriculture/class/export',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      responseType: 'blob',
      data: data
    })
  }

  // AI种类智能报告
  static aiAddClassReport(data: any) {
    return request.post<CodeMsgResult>({
      url: '/agriculture/class/ai',
      data: data
    })
  }
}
