import {BaseArrayResult, BaseObjectResult, BasePageResult} from '../axios'

export interface AgricultureThresholdConfigResult {
                id: string,
                deviceId: string,
                deviceType: string,
                paramType: string,
                thresholdMin: string,
                thresholdMax: string,
                alarmLevel: string,
                notifyType: string,
                isEnabled: string,
                createBy: string,
                createTime: string,
                updateBy: string,
                updateTime: string,
                remark: string
}

export type AgricultureThresholdConfigListPageResult = BasePageResult<AgricultureThresholdConfigResult>
export type AgricultureThresholdConfigListResult = BaseArrayResult<AgricultureThresholdConfigResult>
export type AgricultureThresholdConfigInfoResult = BaseObjectResult<AgricultureThresholdConfigResult>

