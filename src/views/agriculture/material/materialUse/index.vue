<template>
  <div class="page-content">
    <!-- 农资使用管理 -->
    <table-bar
      :showTop="false"
      @search="search"
      @reset="resetForm(searchFormRef)"
      @changeColumn="changeColumn"
      :columns="columns"
    >
      <template #top>
        <el-form :model="queryParams" ref="searchFormRef" label-width="82px">
          <el-row :gutter="20">
            <el-col :xs="24" :sm="12" :lg="6">
              <el-form-item label="农资" prop="resourceId">
                <el-select v-model="queryParams.resourceId" filterable clearable placeholder="全部" style="width: 100%" @change="handleQuery">
                  <el-option v-for="r in resourceList" :key="r.resourceId" :label="r.resourceName" :value="r.resourceId" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12" :lg="6">
              <el-form-item label="批次" prop="batchId">
                <el-select v-model="queryParams.batchId" filterable clearable placeholder="全部" style="width: 100%" @change="handleQuery">
                  <el-option v-for="b in batchList" :key="b.batchId" :label="b.batchName" :value="b.batchId" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12" :lg="6">
              <el-form-item label="任务" prop="taskId">
                <el-select v-model="queryParams.taskId" filterable clearable placeholder="全部" style="width: 100%" @change="handleQuery">
                  <el-option v-for="t in filteredTaskList" :key="t.taskId" :label="t.taskName" :value="t.taskId" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12" :lg="6">
              <el-form-item label="类型" prop="usageType">
                <el-select v-model="queryParams.usageType" clearable placeholder="全部" style="width: 100%" @change="handleQuery">
                  <el-option label="领用" value="0" />
                  <el-option label="消耗" value="1" />
                  <el-option label="入库" value="2" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12" :lg="12">
              <el-form-item label="日期" prop="dateRange">
                <el-date-picker
                  v-model="queryParams.dateRange"
                  type="daterange"
                  range-separator="至"
                  start-placeholder="开始日期"
                  end-placeholder="结束日期"
                  format="YYYY-MM-DD"
                  value-format="YYYY-MM-DD"
                  style="width: 100%"
                  @change="handleQuery"
                />
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
      </template>
      <template #bottom>
        <el-button @click="handleAdd" v-auth="['agriculture:resourceusage:add']" v-ripple>新增</el-button>
        <el-button @click="handleExport" v-auth="['agriculture:resourceusage:export']" v-ripple>导出</el-button>
      </template>
    </table-bar>

    <!-- 农资使用记录列表 -->
    <art-table
      :data="usageList"
      :total="total"
      :current-page="queryParams.pageNum"
      :page-size="queryParams.pageSize"
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
      v-loading="loading"
    >
      <template #default>
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column label="农资名称" width="150" v-if="columns[1].show">
          <template #default="{ row }">
            {{ getResourceName(row.resourceId) }}
          </template>
        </el-table-column>
        <el-table-column label="批次名称" width="150" v-if="columns[2].show">
          <template #default="{ row }">
            {{ getBatchName(row.batchId) }}
          </template>
        </el-table-column>
        <el-table-column label="任务名称" width="150" v-if="columns[3].show">
          <template #default="{ row }">
            {{ getTaskName(row.taskId) }}
          </template>
        </el-table-column>
        <el-table-column label="使用数量" prop="usageQuantity" width="120" align="center" v-if="columns[4].show" />
        <el-table-column label="计量单位" prop="measureUnit" width="100" align="center" v-if="columns[5].show" />
        <el-table-column label="使用日期" prop="usageDate" width="120" align="center" v-if="columns[6].show">
          <template #default="{ row }">
            {{ (row.usageDate || '').split(' ')[0] }}
          </template>
        </el-table-column>
        <el-table-column label="使用类型" width="100" align="center" v-if="columns[7].show">
          <template #default="{ row }">
            {{ getUsageTypeLabel(row.usageType) }}
          </template>
        </el-table-column>
        <el-table-column label="操作人员" prop="operator" width="100" align="center" v-if="columns[8].show" />
        <el-table-column label="备注" prop="remark" min-width="200" show-overflow-tooltip v-if="columns[9].show" />
        <el-table-column label="创建时间" prop="createTime" width="180" align="center" v-if="columns[10].show" />
        <el-table-column label="操作" width="200" align="center" fixed="right">
          <template #default="scope">
            <el-button link type="primary" @click="handleUpdate(scope.row)">
              <el-icon><Document /></el-icon>详情
            </el-button>
            <el-button link type="danger" @click="handleDelete(scope.row)" v-auth="['agriculture:resourceusage:remove']">
              <el-icon><Delete /></el-icon>删除
            </el-button>
          </template>
        </el-table-column>
      </template>
    </art-table>

    <!-- 添加或查看农资使用记录对话框（查看时只读） -->
    <el-dialog :title="title" v-model="open" width="600px" append-to-body>
      <el-form ref="usageRef" :model="form" :rules="rules" label-width="120px">
        <el-form-item label="农资" prop="resourceId">
          <el-select v-model="form.resourceId" placeholder="请选择农资" filterable style="width: 100%" :disabled="isViewMode">
            <el-option
              v-for="r in resourceList"
              :key="r.resourceId"
              :label="r.resourceName"
              :value="r.resourceId"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="批次" prop="batchId">
          <el-select v-model="form.batchId" placeholder="请选择批次" filterable style="width: 100%" @change="handleBatchChange" :disabled="isViewMode">
            <el-option
              v-for="b in batchList"
              :key="b.batchId"
              :label="b.batchName"
              :value="b.batchId"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="任务" prop="taskId">
          <el-select v-model="form.taskId" placeholder="请选择任务" filterable style="width: 100%" :disabled="isViewMode">
            <el-option
              v-for="t in filteredTaskList"
              :key="t.taskId"
              :label="t.taskName"
              :value="t.taskId"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="使用数量" prop="usageQuantity">
          <el-input-number v-model="form.usageQuantity" :min="0" :precision="0" style="width: 100%" :disabled="isViewMode" />
        </el-form-item>
        <el-form-item label="使用日期" prop="usageDate">
          <el-date-picker
            v-model="form.usageDate"
            type="date"
            placeholder="选择使用日期"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
            style="width: 100%"
            :disabled="isViewMode"
          />
        </el-form-item>
        <el-form-item label="使用类型" prop="usageType">
          <el-select v-model="form.usageType" placeholder="请选择使用类型" style="width: 100%" :disabled="isViewMode">
            <el-option label="领用" value="0" />
            <el-option label="消耗" value="1" />
            <el-option label="入库" value="2" />
          </el-select>
        </el-form-item>
        <el-form-item label="操作人员" prop="operator">
          <el-input v-model="form.operator" placeholder="请输入操作人员" :disabled="isViewMode" />
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="form.remark" type="textarea" :rows="3" placeholder="请输入备注" :disabled="isViewMode" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button v-if="!isViewMode" type="primary" @click="submitForm">确 定</el-button>
          <el-button @click="cancel">关 闭</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { EditPen, Delete, Document } from '@element-plus/icons-vue'
import { ref, reactive, onMounted, computed } from 'vue'
import { resetForm } from '@/utils/utils'
import { ElMessage, ElMessageBox } from 'element-plus'
import { FormInstance } from 'element-plus'
import { downloadExcel } from '@/utils/utils'
import { AgricultureResourceUsageService } from '@/api/agriculture/resourceUsageApi'
import { AgricultureResourceUsageResult } from '@/types/agriculture/resourceUsage'
import { AgricultureResourceService } from '@/api/agriculture/resourceApi'
import { AgricultureResourceResult } from '@/types/agriculture/resource'
import { AgricultureCropBatchService } from '@/api/agriculture/cropBatchApi'
import { AgricultureCropBatchResult } from '@/types/agriculture/batch'
import { AgricultureCropBatchTaskService } from '@/api/agriculture/cropBatchTaskApi'
import { AgricultureCropBatchTaskResult } from '@/types/agriculture/batchTask'

const usageList = ref<AgricultureResourceUsageResult[]>([])
const resourceList = ref<AgricultureResourceResult[]>([])
const batchList = ref<AgricultureCropBatchResult[]>([])
const taskList = ref<AgricultureCropBatchTaskResult[]>([])
const filteredTaskList = computed(() => {
  const bid = form.batchId
  if (!bid) return taskList.value
  return taskList.value.filter(t => String(t.batchId) === String(bid))
})
const open = ref(false)
const loading = ref(true)
const total = ref(0)
const title = ref('')
const isViewMode = ref(false)
const searchFormRef = ref<FormInstance>()
const usageRef = ref<FormInstance>()

const columns = reactive([
  { name: '使用记录ID', show: false },
  { name: '农资名称', show: true },
  { name: '批次名称', show: true },
  { name: '任务名称', show: true },
  { name: '使用数量', show: true },
  { name: '计量单位', show: true },
  { name: '使用日期', show: true },
  { name: '使用类型', show: true },
  { name: '操作人员', show: true },
  { name: '备注', show: true },
  { name: '创建时间', show: true }
])

const changeColumn = (list: any) => {
  columns.forEach((col, index) => {
    if (list[index]) {
      col.show = list[index].show
    }
  })
}

const initialFormState = {
  usageId: null as any,
  resourceId: '' as any, // 与 el-select 绑定，避免 null 类型冲突
  batchId: '' as any,
  taskId: '' as any,
  usageQuantity: 0,
  measureUnit: '',
  usageDate: '',
  usageType: '',
  operator: '',
  remark: ''
}

const form = reactive({ ...initialFormState })

const queryParams = reactive({
  pageNum: 1,
  pageSize: 10,
  resourceId: '' as any,
  batchId: '' as any,
  taskId: '' as any,
  usageType: '' as any,
  dateRange: [] as any
})

const rules = reactive({
  resourceId: [{ required: true, message: '农资不能为空', trigger: 'change' }],
  usageQuantity: [{ required: true, message: '使用数量不能为空', trigger: 'blur' }],
  usageDate: [{ required: true, message: '使用日期不能为空', trigger: 'change' }]
})

/** 查询农资列表 */
const getResourceList = async () => {
  const res = await AgricultureResourceService.listResource({ pageNum: 1, pageSize: 9999 })
  if (res.code === 200) {
    resourceList.value = res.rows || []
  }
}

/** 查询批次列表 */
const getBatchList = async () => {
  const res = await AgricultureCropBatchService.listBatch({ pageNum: 1, pageSize: 9999 })
  if (res.code === 200) {
    batchList.value = res.rows || []
  }
}

/** 查询任务列表 */
const getTaskList = async () => {
  const res = await AgricultureCropBatchTaskService.listBatchTask({ pageNum: 1, pageSize: 9999 })
  if (res.code === 200) {
    taskList.value = res.rows || []
  }
}

const handleBatchChange = async (val: any) => {
  // 如有后台按批次查询任务的接口可替换为精准拉取；现用前端过滤
  if (!taskList.value.length) {
    await getTaskList()
  }
}

/** 根据农资ID获取农资名称 */
const getResourceName = (resourceId: string) => {
  const resource = resourceList.value.find(item => String(item.resourceId) === String(resourceId))
  return resource ? resource.resourceName : (resourceId || '-')
}

/** 根据批次ID获取批次名称 */
const getBatchName = (batchId: string | null) => {
  if (!batchId) return '-'
  const batch = batchList.value.find(item => String(item.batchId) === String(batchId))
  return batch ? batch.batchName : (batchId || '-')
}

/** 根据任务ID获取任务名称 */
const getTaskName = (taskId: string | null) => {
  if (!taskId) return '-'
  const task = taskList.value.find(item => String(item.taskId) === String(taskId))
  return task ? task.taskName : (taskId || '-')
}

/** 获取使用类型标签 */
const getUsageTypeLabel = (usageType: string) => {
  const typeMap: Record<string, string> = {
    '0': '领用',
    '1': '消耗',
    '2': '入库'
  }
  return typeMap[usageType] || usageType
}

/** 查询农资使用记录列表 */
const getList = async () => {
  loading.value = true
  const payload: any = { ...queryParams }
  if (Array.isArray(queryParams.dateRange) && queryParams.dateRange.length === 2) {
    payload.beginTime = queryParams.dateRange[0]
    payload.endTime = queryParams.dateRange[1]
  }
  const res = await AgricultureResourceUsageService.listUsage(payload)
  if (res.code === 200) {
    usageList.value = res.rows || []
    total.value = res.total || 0
  }
  loading.value = false
}

/** 搜索按钮操作 */
const search = () => {
  queryParams.pageNum = 1
  getList()
}

const handleQuery = () => {
  queryParams.pageNum = 1
  getList()
}

/** 每页条数改变 */
const handleSizeChange = (size: number) => {
  queryParams.pageSize = size
  getList()
}

/** 当前页改变 */
const handleCurrentChange = (page: number) => {
  queryParams.pageNum = page
  getList()
}

/** 新增按钮操作 */
const handleAdd = () => {
  reset()
  open.value = true
  title.value = '添加农资使用记录'
  isViewMode.value = false
}

/** 详情按钮 */
const handleUpdate = async (row: any) => {
  reset()
  open.value = true
  isViewMode.value = true
  title.value = '农资使用记录详情'
  const res = await AgricultureResourceUsageService.getUsage(row.usageId)
  if (res.code === 200) {
    Object.assign(form, res.data)
  }
}

/** 提交按钮 */
const submitForm = async () => {
  if (!usageRef.value) return
  await usageRef.value.validate(async (valid) => {
    if (valid) {
      if (form.usageId) {
        const res = await AgricultureResourceUsageService.updateUsage(form)
        if (res.code === 200) {
          ElMessage.success(res.msg)
          open.value = false
          getList()
        }
      } else {
        const res = await AgricultureResourceUsageService.addUsage(form)
        if (res.code === 200) {
          ElMessage.success(res.msg)
          open.value = false
          getList()
        }
      }
    }
  })
}

/** 删除按钮操作 */
const handleDelete = async (row: any) => {
  await ElMessageBox.confirm('是否确认删除农资使用记录编号为"' + row.usageId + '"的数据项？', '系统提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
    .then(async () => {
      const res = await AgricultureResourceUsageService.deleteUsage(row.usageId)
      if (res.code === 200) {
        getList()
        ElMessage.success(res.msg)
      }
    })
    .catch(() => {})
}

/** 导出按钮操作 */
const handleExport = () => {
  downloadExcel(AgricultureResourceUsageService.exportExcel(queryParams))
}

// 取消按钮
const cancel = () => {
  open.value = false
  reset()
}

// 表单重置
const reset = () => {
  Object.assign(form, initialFormState)
}

// 初始化
onMounted(async () => {
  // 并行加载所有列表数据
  await Promise.all([
    getResourceList(),
    getBatchList(),
    getTaskList(),
    getList()
  ])
})
</script>

<style lang="scss" scoped>
.page-content {
  padding: 20px;
}
</style>

