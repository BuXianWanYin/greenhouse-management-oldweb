<template>
    <div class="gantt-container">
        <div class="search">
            <el-form :model="queryParams" ref="queryFormRef" :inline="true" v-show="showSearch" label-width="100px">
                <el-form-item label="任务名称" prop="taskName">
                    <el-input v-model="queryParams.taskName" placeholder="请输入任务名称" clearable size="small" style="width: 220px"
                        @keyup.enter="handleQuery" />
                </el-form-item>
                <el-form-item label="计划开始日期" prop="psr">
                    <el-date-picker size="small" v-model="queryParams.psr" type="daterange" range-separator="-"
                        start-placeholder="时间范围开始" value-format="YYYY-MM-DD" end-placeholder="时间范围结束">
                    </el-date-picker>
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" size="small" @click="handleQuery">
                        <el-icon>
                            <Search />
                        </el-icon>搜索
                    </el-button>
                    <el-button size="small" @click="resetQuery">
                        <el-icon>
                            <Refresh />
                        </el-icon>重置
                    </el-button>
                </el-form-item>
                <el-form-item class="fr">
                    <el-button class="width-90" v-if="tableBorder && !readonly" type="primary" size="small" plain @click="handleAdd">
                        <el-icon>
                            <Plus />
                        </el-icon>新增任务
                    </el-button>
                </el-form-item>
            </el-form>
        </div>
        <div class="table">
            <div class="task-list" v-loading="loading">
                <el-card v-for="task in taskList" :key="String(task.taskId)" class="task-card"
                    :class="{ 'task-completed': task.status === '2' }" shadow="always">
                    <div class="task-content">
                        <div class="task-main">
                            <div class="task-name" :class="{ 'task-name-completed': task.status === '2' }">
                                {{ task.taskName }}
                            </div>
                            <div class="task-info">
                                <span class="info-item">
                                    <el-icon>
                                        <Calendar />
                                    </el-icon>
                                    计划时间：{{ formatDate(task.planStart) }} 至 {{ formatDate(task.planFinish) }}
                                </span>
                                <span class="info-item" v-if="shouldShowActualTime(task)">
                                    <el-icon>
                                        <Timer />
                                    </el-icon>
                                    实际时间：{{ formatDate(task.actualStart) }} 至 {{ formatDate(task.actualFinish) }}
                                </span>
                            </div>
                        </div>

                        <div class="task-actions">
                            <el-tag v-if="task.status === '0'" type="info">未分配</el-tag>
                            <el-tag v-else-if="task.status === '1'" type="warning">已分配</el-tag>
                            <el-tag v-else-if="task.status === '2'" type="warning">进行中</el-tag>
                            <el-tag v-else-if="task.status === '3'" type="success">已完成</el-tag>
                            <el-tag v-else>{{ task.status }}</el-tag>
                            <div class="action-buttons">
                                <el-button 
                                    size="small" 
                                    type="primary" 
                                    plain 
                                    @click="handleTask(Number(task.taskId))" 
                                    v-if="!tableBorder"
                                    v-auth="['agriculture:batchtask:query']">
                                    <el-icon>
                                        <Edit />
                                    </el-icon>任务处理
                                </el-button>

                                <el-button 
                                    size="small" 
                                    type="primary" 
                                    plain 
                                    @click="handleTaskDetail(Number(task.taskId))"
                                    v-if="tableBorder && readonly">
                                    <el-icon>
                                        <Document />
                                    </el-icon>详情
                                </el-button>
                                <el-button 
                                    size="small" 
                                    type="primary" 
                                    plain 
                                    @click="handleUpdate(task)"
                                    v-if="tableBorder && !readonly" 
                                    v-auth="['agriculture:batchtask:edit']">
                                    <el-icon>
                                        <Edit />
                                    </el-icon>修改
                                </el-button>
                                <el-button 
                                    size="small" 
                                    type="danger" 
                                    plain 
                                    @click="handleDelete(task)"
                                    v-if="tableBorder && !readonly" 
                                    v-auth="['agriculture:batchtask:remove']">
                                    <el-icon>
                                        <Delete />
                                    </el-icon>删除
                                </el-button>
                            </div>
                        </div>
                    </div>
                </el-card>

                <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum"
                    v-model:limit="queryParams.pageSize" @pagination="getList" />
            </div>
        </div>

        <!-- 任务详情对话框 -->
        <el-dialog
            v-model="showTaskDetailDialog"
            :title="props.readonly ? '任务详情' : '编辑任务'"
            width="65%"
            top="5vh"
            append-to-body
            :close-on-click-modal="true"   
        >
            <TaskDetail
                v-if="showTaskDetailDialog && taskId"
                :taskId="taskId"
                :oprType="oprType || 'update'"
                :batchId="props.batchId"
                :fishDish="currentTaskFishDish"
                :readonly="props.readonly"
                :key="taskId"
                @close="showTaskDetailDialog = false"
                @updated="onTaskUpdated"
            />
        </el-dialog>

        <!-- 添加或修改批次任务对话框 -->
        <el-dialog :title="title" :model-value="open" width="500px" append-to-body @close="cancel">
            <el-form ref="formRef" :model="form" :rules="rules" label-width="110px">
                <el-form-item label="任务名称" prop="taskName">
                    <el-input v-model="form.taskName" placeholder="请输入任务名称" />
                </el-form-item>
                <el-form-item label="计划开始日期" prop="planStart">
                    <el-date-picker clearable class="w100" v-model="form.planStart" type="date"
                        value-format="YYYY-MM-DD" placeholder="选择计划开始日期">
                    </el-date-picker>
                </el-form-item>
                <el-form-item label="计划结束日期" prop="planFinish">
                    <el-date-picker clearable class="w100" v-model="form.planFinish" type="date"
                        value-format="YYYY-MM-DD" placeholder="选择计划结束日期">
                    </el-date-picker>
                </el-form-item>
                <el-form-item label="任务详情" prop="remark">
                    <el-input v-model="form.remark" type="textarea" placeholder="请输入内容" />
                </el-form-item>
            </el-form>
            <template #footer>
                <div class="dialog-footer">
                    <el-button type="primary" @click="submitForm">确 定</el-button>
                    <el-button @click="cancel">取 消</el-button>
                </div>
            </template>
        </el-dialog>
    </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Refresh, Plus, Edit, Delete, Calendar, Timer } from '@element-plus/icons-vue'
import { AgricultureCropBatchTaskService } from "@/api/agriculture/cropBatchTaskApi"
import type { AgricultureCropBatchTaskResult } from '@/types/agriculture/batchTask.d'
import TaskDetail from "../../TaskDetail/index.vue"

const emit = defineEmits(['updated'])

// 类型定义
interface QueryParams {
    pageNum: number
    pageSize: number
    taskName: string | null
    planStart: string | null
    planFinish: string | null
    batchId: number | null
    psr: string[]
}

interface FormData {
    taskId: number | null
    batchId: number | null
    taskName: string | null
    planStart: string
    planFinish: string
    actualStart: string | null
    actualFinish: string | null
    taskDetail: string | null
    taskImages: string | null
    taskVideos: string | null
    remark: string | null
    status: string
    orderNum: number | null
    createBy: string | null
    createTime: string | null
    updateBy: string | null
    updateTime: string | null
    delFlag: string | null
}

// Props定义
const props = defineProps({
    batchId: {
        type: Number,
        default: null
    },
    tableBorder: {
        type: Boolean,
        default: false
    },
    //只读模式，只显示详情按钮
    readonly: {
        type: Boolean,
        default: false
    }
})

// 响应式状态
const loading = ref(true)
const showSearch = ref(true)
const total = ref(0)
const taskList = ref<AgricultureCropBatchTaskResult[]>([])
const open = ref(false)
const title = ref('')
const formRef = ref()
const queryFormRef = ref()
const taskId = ref<number | null>(null)
const oprType = ref<'add' | 'update' | 'view' | null>(null)
const showTaskDetailDialog = ref(false)
const currentTaskFishDish = ref(0)

// 查询参数
const queryParams = reactive<QueryParams>({
    pageNum: 1,
    pageSize: 10,
    taskName: null,
    planStart: null,
    planFinish: null,
    batchId: props.batchId,
    psr: []
})

// 表单数据
const form = reactive<FormData>({
    taskId: null,
    batchId: null,
    taskName: null,
    planStart: '',
    planFinish: '',
    actualStart: null,
    actualFinish: null,
    taskDetail: null,
    taskImages: null,
    taskVideos: null,
    remark: null,
    status: "0",
    orderNum: null,
    createBy: null,
    createTime: null,
    updateBy: null,
    updateTime: null,
    delFlag: null
})

// 表单校验规则
const rules = {
    taskName: [{
        required: true,
        message: "任务名称不能为空",
        trigger: "blur"
    }],
    planStart: [{
        required: true,
        message: "计划开始日期不能为空",
        trigger: "blur"
    }],
    planFinish: [{
        required: true,
        message: "计划结束日期不能为空",
        trigger: "blur"
    }]
}

// 日期格式化函数
const formatDate = (date: string | null) => {
    if (!date) return ''
    return date.split('T')[0]
}

// 获取任务列表
const getList = async () => {
    loading.value = true
    const { psr } = queryParams
    if (psr && Array.isArray(psr) && psr.length === 2) {
        queryParams.planStart = psr[0]
        queryParams.planFinish = psr[1]
    } else {
        queryParams.planStart = null
        queryParams.planFinish = null
    }
    
    try {
        const response = await AgricultureCropBatchTaskService.listBatchTask(queryParams)
        if (response.code === 200) {
            taskList.value = response.rows.sort((a, b) => {
                if (!a.planStart) return 1;
                if (!b.planStart) return -1;
                return a.planStart.localeCompare(b.planStart);
            });
            total.value = response.total
        } else {
            ElMessage.error(response.msg || '查询失败')
        }
    } catch (error) {
        console.error('查询失败:', error)
        ElMessage.error('查询失败')
    } finally {
        loading.value = false
    }
}

// 搜索按钮操作
const handleQuery = () => {
    queryParams.pageNum = 1
    getList()
}

// 重置按钮操作
const resetQuery = () => {
    queryParams.taskName = null
    queryParams.psr = []
    handleQuery()
}

// 表单重置
const reset = () => {
    Object.assign(form, {
        taskId: null,
        batchId: null,
        taskName: null,
        planStart: '',
        planFinish: '',
        actualStart: null,
        actualFinish: null,
        taskDetail: null,
        taskImages: null,
        taskVideos: null,
        remark: null,
        status: "0",
        orderNum: null,
        createBy: null,
        createTime: null,
        updateBy: null,
        updateTime: null,
        delFlag: null
    })
    formRef.value?.resetFields()
}

// 取消按钮
const cancel = () => {
    open.value = false
    reset()
}

// 新增按钮操作
const handleAdd = () => {
    reset()
    open.value = true
    title.value = "添加批次任务"
    form.batchId = props.batchId
}

// 修改按钮操作
const handleUpdate = async (row: AgricultureCropBatchTaskResult) => {
    reset()
    const taskId = Number(row.taskId)
    try {
        const response = await AgricultureCropBatchTaskService.getBatchTask(taskId)
        if (response.code === 200) {
            Object.assign(form, response.data)
            open.value = true
            title.value = "修改批次任务"
        } else {
            ElMessage.error(response.msg || '获取任务详情失败')
        }
    } catch (error) {
        console.error('获取任务详情失败:', error)
    }
}

// 提交表单
const submitForm = async () => {
    if (!formRef.value) return

    await formRef.value.validate(async (valid: boolean) => {
        if (valid) {
            try {
                if (form.taskId != null) {
                    await AgricultureCropBatchTaskService.updateBatchTask(form)
                    ElMessage.success("修改成功")
                    emit('updated')
                    open.value = false
                    getList()
                } else {
                    const response = await AgricultureCropBatchTaskService.addBatchTask(form)
                    if (response.code === 200) {
                        ElMessage.success("新增成功")
                        open.value = false
                        getList()
                    } else {
                        ElMessage.error(response.msg || '新增失败')
                    }
                }
            } catch (error) {
                console.error('提交失败:', error)
            }
        }
    })
}

// 删除操作
const handleDelete = async (row: AgricultureCropBatchTaskResult) => {
    const taskId = row.taskId
    try {
        await ElMessageBox.confirm('是否确认删除任务编号为"' + taskId + '"的数据项？')
        const res = await AgricultureCropBatchTaskService.delBatchTask(String(taskId))
        if (res.code === 200) {
            getList()
            ElMessage.success(res.msg || '删除成功')
        }
    } catch (error) {
        console.error('删除失败:', error)
    }
}

// 判断是否显示实际时间
const shouldShowActualTime = (task: AgricultureCropBatchTaskResult) => {
    return task.actualStart &&
        !(task.actualStart === '未开始' || task.actualStart === '') &&
        task.actualFinish &&
        !(task.actualFinish === '未结束' || task.actualFinish === '')
}

// 处理任务按钮
const handleTask = (id: number) => {
    const task = taskList.value.find(t => t.taskId === id);
    // dishFish 字段可能是字符串，需要转换为数字
    currentTaskFishDish.value = task?.dishFish ? (typeof task.dishFish === 'string' ? Number(task.dishFish) : task.dishFish) : 0; // 0为鱼，1为菜
    taskId.value = id;
    oprType.value = 'update';
    showTaskDetailDialog.value = true;
}

// 处理任务详情按钮（只读模式）
const handleTaskDetail = (id: number) => {
    const task = taskList.value.find(t => t.taskId === id);
    // dishFish 字段可能是字符串，需要转换为数字
    currentTaskFishDish.value = task?.dishFish ? (typeof task.dishFish === 'string' ? Number(task.dishFish) : task.dishFish) : 0;
    taskId.value = id;
    oprType.value = 'view'; // 设置为查看模式
    showTaskDetailDialog.value = true;
}

// 监听batchId变化
watch(() => props.batchId, (newVal) => {
    queryParams.batchId = newVal
    getList()
})

// 初始化
onMounted(async () => {
    getList()
})

// 处理任务更新
const onTaskUpdated = () => {
    getList()
}
</script>

<style lang="scss" scoped>
.gantt-container {
    height: 100%;
    display: flex;
    flex-direction: column;

    .search {
        background: #fff;
        padding: 16px;
        border-radius: 8px;
        margin-bottom: 16px;
        flex-shrink: 0;
    }

    .table {
        background: #fff;
        padding: 24px;
        border-radius: 8px;
        flex: 1;
        min-height: 0;
        display: flex;
        flex-direction: column;

        .task-list {
            display: flex;
            flex-direction: column;
            gap: 12px;
            flex: 1;
            min-height: 0;
            overflow: auto;

            .task-card {
                margin: 0;
                background: white;
                border-radius: 8px;
                padding: 24px 12px;
                min-height: 70px;
                box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08) !important;

                .task-content {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    gap: 24px;

                    .task-main {
                        flex: 1;
                        min-width: 0;

                        .task-name {
                            font-size: 15px;
                            font-weight: 600;
                            color: #333;
                            margin-bottom: 8px;
                        }

                        .task-info {
                            display: flex;
                            gap: 24px;

                            .info-item {
                                display: flex;
                                align-items: center;
                                font-size: 13px;
                                color: #666;
                                white-space: nowrap;

                                .el-icon {
                                    color: #409EFF;
                                    margin-right: 8px;
                                    font-size: 14px;
                                }
                            }
                        }
                    }

                    .task-actions {
                        display: flex;
                        align-items: center;
                        gap: 16px;
                        flex-shrink: 0;

                        .action-buttons {
                            display: flex;
                            gap: 8px;

                            .el-button {
                                padding: 5px 10px;
                                height: 28px;
                                font-size: 12px;
                            }
                        }
                    }
                }
            }
        }
    }
}

.search :deep(.el-form-item__label) {
    color: #222 !important;
    font-size: 14px;
}

.search :deep(.el-form-item) {
    margin-bottom: 0;
    min-height: 30px;
    align-items: center;
}

.search :deep(.el-input__wrapper),
.search :deep(.el-date-editor) {
    min-height: 35px;
    font-size: 15px;
}

.search :deep(.el-input__inner),
.search :deep(.el-range-input) {
  font-size: 13px;
}

.search :deep(.el-button) {
  height: 30px;
  line-height: 30px;
  font-size: 13px;
  padding: 0 20px;
  box-sizing: border-box;
}
</style>

