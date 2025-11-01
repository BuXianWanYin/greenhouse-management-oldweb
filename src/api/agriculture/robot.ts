import request from '@/utils/http'
import { AgricultureRobotInfoResult,AgricultureRobotListPageResult } from '@/types/agriculture/robot'
import { CodeMsgResult } from '@/types/axios'

// 机器人
export class AgricultureRobotService {
    // 查询机器人列表
    static listInfo(query: any) {
        return request.get<AgricultureRobotListPageResult>({
            url: '/agriculture/robot/list',
            params: query
        })
    }

      // 新增小农机器人聊天记录
      static addRobot(data: any) {
        return request.post<CodeMsgResult>({
            url: '/agriculture/robot',
            data: data
        })
    }
}