import request from '@/utils/http'
import type { CodeMsgResult } from '@/types/axios'

/** SSE */
class SseService {
  /** SSE连接地址 */
  static getSseUrl(id: string | number) {
    return import.meta.env.VITE_API_BASE_URL + '/sse/' + id
  }

  /** 主动关闭SSE连接 */
  static closeSse(id: string | number) {
    return request.del<CodeMsgResult>({
      url: '/sse/' + id
    })
  }
}

export default SseService
