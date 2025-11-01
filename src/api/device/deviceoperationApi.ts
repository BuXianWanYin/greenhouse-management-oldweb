import request from '@/utils/http'
import { DeviceControlRequest } from '@/types/device/deviceoperation'
import { CodeMsgResult } from '@/types/axios'

export class DeviceOperationService {
  /**
   * 控制设备开关
   */
  static controlDevice(data: DeviceControlRequest) {
    return request.post<CodeMsgResult>({
      url: 'http://192.168.31.120:8081/deviceOperation/control',
      data: data
    })
  }
}