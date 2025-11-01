import {BaseArrayResult, BaseObjectResult, BasePageResult} from '../axios'

export interface AgricultureCropBatchTaskResult {
    taskId: number;
    batchId: number;
    taskName: string;
    planStart: string;
    planFinish: string;
    dishFish: string;
    actualStart: string | null;
    actualFinish: string | null;
    taskDetail: string | null;
    taskImages: string | null;
    taskVideos: string | null;
    remark: string | null;
    status: string;
    orderNum: number | null;
    createBy: string | null;
    createTime: string | null;
    updateBy: string | null;
    updateTime: string | null;
    delFlag: string | null;
}

export type AgricultureCropBatchTaskListPageResult = BasePageResult<AgricultureCropBatchTaskResult>
export type AgricultureCropBatchTaskListResult = BaseArrayResult<AgricultureCropBatchTaskResult>
export type AgricultureCropBatchTaskInfoResult = BaseObjectResult<AgricultureCropBatchTaskResult>