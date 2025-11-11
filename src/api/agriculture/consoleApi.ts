import request from '@/utils/http'
import { ConsoleListResult } from '@/types/agriculture/console'

/** 控制台信息 */
class AgricultureConsoleService {
  /** 查询农场信息*/
  static listAgriculture() {
    return request.get<ConsoleListResult>({
      url: '/agriculture/console/agriculture'
    })
  }

   /** 查询任务信息 */
   static listBatchTask() {
    return request.get<ConsoleListResult>({
      url: '/agriculture/console/batchTask'
    })
  }
}

export default AgricultureConsoleService
