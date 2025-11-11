import {BaseArrayResult, BaseObjectResult, BasePageResult} from '../axios'

export interface AgriculturePartitionFoodResult {
                id: string,
                iaPartitionId: string,
                cuisineWeight: string,
                fishWeight: string,
                weight: string,
                name: string,
                date: string,
                description: string,
                status: string,
                cuisineStatus: string,
                fishStatus: string,
                foodType: string,
                firstTraceTime: string 
}

// 食品信息
export interface FoodInfo {
    id: string
    iaPartitionId: string
    date: string
    name: string
    weight: number
    status: number
    description: string
    barcode: string | null
    firstTraceTime?: string 
}

// 批次信息
export interface CropBatch {
    batchId: number
    batchName: string
    germplasmId: number
    vegetableId: number | null
    pastureId: number
    cropArea: number
    startTime: string | null
    status: string
    orderNum: number
    delFlag: string
    responsiblePersonId: number
    createBy: string
    createTime: string
    updateBy: string
    updateTime: string | null
    remark: string
    contractAddr: string | null
}

// 大棚信息
export interface PastureInfo {
    createBy: string
    createTime: string
    updateBy: string
    updateTime: string
    remark: string
    id: number
    name: string
    contractAddr: string
    address: string
    description: string
    area: string
    remainingArea: string
    bigBreedingQuantity: number
    breedingQuantity: number
    delFlag: number
}

// 批次任务
export interface BatchTask {
    searchValue: string | null
    createBy: string
    createTime: string
    updateBy: string
    updateTime: string
    remark: string
    params: any | null
    taskId: number
    batchId: number
    taskName: string
    responsiblePersonId: number
    responsiblePersonName: string
    fishDish: string | null
    planStart: string
    planFinish: string
    actualStart: string
    actualFinish: string
    taskDetail: string
    taskImages: string
    taskVideos: string
    status: string
    orderNum: number
    delFlag: string
}

// 天气平均数据
export interface WeatherAvg {
    lightIntensity?: number
    temperature: number
    humidity: number
    windSpeed?: number
  }

// 水质平均数据
export interface WaterQualityAvg {
    phValue: number
    conductivity?: number
    ammoniaNitrogen?: number
    waterTemperature?: number
    dissolvedOxygen: number
  }

// 批次任务详情
export interface BatchTaskDetail {
    batchTask: BatchTask
    weatherMergedList: any | null
    weatherAvg: WeatherAvg
    waterQualityDataList: any | null
    waterQualityAvg: WaterQualityAvg
    sensorAlertList?: any[];
}

export type AgriculturePartitionFoodListPageResult = BasePageResult<AgriculturePartitionFoodResult>
export type AgriculturePartitionFoodListResult = BaseArrayResult<AgriculturePartitionFoodResult>
export type AgriculturePartitionFoodInfoResult = BaseObjectResult<AgriculturePartitionFoodResult>

