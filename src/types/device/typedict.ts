import {BaseArrayResult, BaseObjectResult, BasePageResult} from '../axios'

export interface ParamTypeDictResult {
                id: string,
                paramTypeEn: string,
                paramTypeCn: string,
                remark: string
}

export type ParamTypeDictListPageResult = BasePageResult<ParamTypeDictResult>
export type ParamTypeDictListResult = BaseArrayResult<ParamTypeDictResult>
export type ParamTypeDictInfoResult = BaseObjectResult<ParamTypeDictResult>

