import {BaseArrayResult, BaseObjectResult, BasePageResult} from '../axios'
export interface DeviceControlRequest {
  deviceId: number | string;
  action: 'on' | 'off';
  index?: number; // 可选，默认0  1为多组指令
}

export type AgricultureDeviceListPageResult = BasePageResult<DeviceControlRequest>
export type AgricultureDeviceListResult = BaseArrayResult<DeviceControlRequest>
export type AgricultureDeviceInfoResult = BaseObjectResult<DeviceControlRequest>