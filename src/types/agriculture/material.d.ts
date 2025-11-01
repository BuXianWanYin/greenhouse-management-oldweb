import {BaseArrayResult, BaseObjectResult, BasePageResult} from '../axios'

export interface AgricultureMaterialResult {
                materialId: string,
                materialCode: string,
                materialName: string,
                materialImage: string
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

export type AgricultureMaterialListPageResult = BasePageResult<AgricultureMaterialResult>
export type AgricultureMaterialListResult = BaseArrayResult<AgricultureMaterialResult>
export type AgricultureMaterialInfoResult = BaseObjectResult<AgricultureMaterialResult>

