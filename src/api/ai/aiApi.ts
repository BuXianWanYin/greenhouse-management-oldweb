import request from '@/utils/http'
import { IdentifyInfoResult } from '@/types/ai'

// AI
class AiService {
  // 在线聊天
  static chatStream(data: object) {
    return request.post({
      url: '/agriculture/ai/chatStream',
      data: data
    })
  }
  
  // 智能分析
  static identify(data: object) {
    return request.post<IdentifyInfoResult>({
      url: '/agriculture/ai/identify',
      data: data
    })
  }
}

export default AiService
