import {BaseArrayResult, BaseObjectResult, BasePageResult} from '../axios'

export interface AgricultureBaitInfoResult {
                baitId: string,
                baitCode: string,
                baitName: string,
                baitSl: string,
                measureUnit: string,
                remark: string,
                status: string,
                orderNum: string,
                createBy: string,
                createTime: string,
                updateBy: string,
                updateTime: string,
                delFlag: string
}

export type AgricultureBaitInfoListPageResult = BasePageResult<AgricultureBaitInfoResult>
export type AgricultureBaitInfoListResult = BaseArrayResult<AgricultureBaitInfoResult>
export type AgricultureBaitInfoInfoResult = BaseObjectResult<AgricultureBaitInfoResult>

