import request from '@/utils/http'
import { AgricultureClassAiReportInfoResult } from '@/types/agriculture/classReport'

// 种类智能报告
export class AgricultureClassAiReportService {
  // 查询种类智能报告详细
  static getReport(query: any) {
    return request.get<AgricultureClassAiReportInfoResult>({
      url: '/agriculture/class/report/info',
      params: query
    })
  }
}
