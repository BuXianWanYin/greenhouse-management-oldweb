import {BaseArrayResult, BaseObjectResult, BasePageResult} from '../axios'

export interface AgriculturePastureResult {
                id: string,
                name: string,
                contractAddr: string,
                address: string,
                description: string,
                area: string,
                remainingArea: string,
                bigBreedingQuantity: string,
                breedingQuantity: string,
                createBy: string,
                createTime: string,
                updateBy: string,
                updateTime: string,
                remark: string,
                delFlag: string
}

export type AgriculturePastureListPageResult = BasePageResult<AgriculturePastureResult>
export type AgriculturePastureListResult = BaseArrayResult<AgriculturePastureResult>
export type AgriculturePastureInfoResult = BaseObjectResult<AgriculturePastureResult>

