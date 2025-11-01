import {BaseArrayResult, BaseObjectResult, BasePageResult} from '../axios'
export interface AlertData {
    id?: number
    alertId?: number
    alertType: string
    alertMessage: string
    paramName: string
    paramValue: string
    thresholdMin?: number
    thresholdMax?: number
    pastureId: string
    batchId: string
    deviceId: number
    deviceName: string
    deviceType?: string
    alertTime: string
    alertLevel: number
    pastureName: string
    batchName: string
    status?: number
    createTime?: string
  }