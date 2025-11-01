import request from '@/utils/http'
import { AgricultureJobInfoResult, AgricultureJobListPageResult } from '@/types/agriculture/job'
import { CodeMsgResult } from '@/types/axios'

// 作业任务
export class AgricultureJobService {
  // 查询作业任务列表
  static listJob(query: any) {
    return request.get<AgricultureJobListPageResult>({
      url: '/agriculture/job/list',
      params: query
    })
  }

  // 新增作业任务
  static addJob(data: any) {
    return request.post<CodeMsgResult>({
      url: '/agriculture/job',
      data: data
    })
  }

  // 修改作业任务
  static updateJob(data: any) {
    return request.put<CodeMsgResult>({
      url: '/agriculture/job',
      data: data
    })
  }

  // 删除作业任务
  static deleteJob(jobId: any) {
    return request.del<CodeMsgResult>({
      url: '/agriculture/job/' + jobId
    })
  }

  // 导出作业任务列表
  static exportExcel(data: any) {
    return request.post({
      url: 'agriculture/job/export',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      responseType: 'blob',
      data: data
    })
  }

  // ai处理作业任务
  static aiAddJob(data: any) {
    return request.post<CodeMsgResult>({
      url: '/agriculture/job/ai',
      data: data
    })
  }
}
