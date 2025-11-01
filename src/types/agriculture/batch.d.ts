import {BaseArrayResult, BaseObjectResult, BasePageResult} from '../axios'

export interface AgricultureCropBatchResult {
    batchId: string,
    batchName: string,
    pastureId: string,
    vegetableId: string,
    fishArea: string,
    cropArea: string,
    contractAddr: string,
    createTime: string,
    classImage: string,
    className: string,
    nickName: string,
    responsiblePersonId: string,
    germplasmId: string,
    classType?: number,
    displayClassName?: string,
    displayAreaLabel?: string,
    classImages?: string[];
    harvest: string
}

export type AgricultureCropBatchListPageResult = BasePageResult<AgricultureCropBatchResult>
export type AgricultureCropBatchListResult = BaseArrayResult<AgricultureCropBatchResult>
export type AgricultureCropBatchInfoResult = BaseObjectResult<AgricultureCropBatchResult>

