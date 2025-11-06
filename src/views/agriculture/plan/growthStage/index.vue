<template>
  <div class="page-content">
    <!-- 搜索栏开始 -->
    <el-form :model="queryParams" ref="queryRef" label-width="100px">
      <el-row :gutter="20" class="search-row">
        <el-col :xs="24" :sm="12" :md="8" :lg="6" :xl="5">
          <el-form-item label="阶段名称" prop="stageName">
            <el-input placeholder="请输入阶段名称" v-model="queryParams.stageName" @keyup.enter="handleQuery">
              <template #prefix>
                <el-icon><Document /></el-icon>
              </template>
            </el-input>
          </el-form-item>
        </el-col>
        <el-col :xs="24" :sm="12" :md="8" :lg="6" :xl="5">
          <el-form-item label="阶段状态" prop="stageStatus">
            <el-select v-model="queryParams.stageStatus" placeholder="请选择状态" clearable style="width: 100%">
              <el-option label="未开始" value="0" />
              <el-option label="进行中" value="1" />
              <el-option label="已完成" value="2" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :xs="24" :sm="24" :md="24" :lg="12" :xl="14" class="button-col">
          <el-form-item>
            <el-button type="primary" @click="handleQuery" v-ripple>
              <el-icon><Search /></el-icon>搜索
            </el-button>
            <el-button type="info" @click="resetForm(queryRef)" v-ripple>
              <el-icon><Refresh /></el-icon>重置
            </el-button>
            <el-button type="success" @click="handleAdd" v-auth="['agriculture:growthstage:add']" v-ripple>
              <el-icon><Plus /></el-icon>新增
            </el-button>
            <el-button type="warning" @click="handleExport" v-auth="['agriculture:growthstage:export']" v-ripple>
              <el-icon><Download /></el-icon>导出
            </el-button>
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
    <!-- 搜索栏结束 -->

    <!-- 表格 -->
    <el-table v-loading="loading" :data="stageList" border>
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="阶段ID" prop="stageId" width="100" />
      <el-table-column label="批次ID" prop="batchId" width="100" />
      <el-table-column label="阶段类型" prop="stageType" width="120" align="center" />
      <el-table-column label="阶段名称" prop="stageName" min-width="150" show-overflow-tooltip />
      <el-table-column label="阶段顺序" prop="stageOrder" width="100" align="center" />
      <el-table-column label="预期开始" prop="expectedStartDate" width="120" align="center" />
      <el-table-column label="预期结束" prop="expectedEndDate" width="120" align="center" />
      <el-table-column label="实际开始" prop="actualStartDate" width="120" align="center" />
      <el-table-column label="实际结束" prop="actualEndDate" width="120" align="center" />
      <el-table-column label="阶段状态" prop="stageStatus" width="100" align="center">
        <template #default="scope">
          <el-tag v-if="scope.row.stageStatus === '0'" type="info">未开始</el-tag>
          <el-tag v-else-if="scope.row.stageStatus === '1'" type="success">进行中</el-tag>
          <el-tag v-else-if="scope.row.stageStatus === '2'" type="warning">已完成</el-tag>
          <el-tag v-else>{{ scope.row.stageStatus }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="创建时间" prop="createTime" width="180" align="center" />
      <el-table-column label="操作" width="200" align="center" fixed="right">
        <template #default="scope">
          <el-button link type="primary" @click="handleUpdate(scope.row)" v-auth="['agriculture:growthstage:edit']">
            <el-icon><EditPen /></el-icon>修改
          </el-button>
          <el-button link type="danger" @click="handleDelete(scope.row)" v-auth="['agriculture:growthstage:remove']">
            <el-icon><Delete /></el-icon>删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-pagination
      v-if="total > queryParams.pageSize"
      background
      layout="total, sizes, prev, pager, next, jumper"
      :total="total"
      :page-size="queryParams.pageSize"
      :current-page="queryParams.pageNum"
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
      :page-sizes="[10, 20, 50, 100]"
      style="margin-top: 20px; text-align: center"
    />

    <!-- 添加或修改生长阶段对话框 -->
    <el-dialog :title="title" v-model="open" width="700px" append-to-body>
      <el-form ref="stageRef" :model="form" :rules="rules" label-width="120px">
        <el-form-item label="批次ID" prop="batchId">
          <el-input v-model="form.batchId" placeholder="请输入批次ID" />
        </el-form-item>
        <el-form-item label="阶段类型" prop="stageType">
          <el-input v-model="form.stageType" placeholder="请输入阶段类型（如：播种期、生长期等）" />
        </el-form-item>
        <el-form-item label="阶段名称" prop="stageName">
          <el-input v-model="form.stageName" placeholder="请输入阶段名称" />
        </el-form-item>
        <el-form-item label="阶段顺序" prop="stageOrder">
          <el-input-number v-model="form.stageOrder" :min="1" style="width: 100%" />
        </el-form-item>
        <el-form-item label="预期开始日期" prop="expectedStartDate">
          <el-date-picker
            v-model="form.expectedStartDate"
            type="date"
            placeholder="选择预期开始日期"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="预期结束日期" prop="expectedEndDate">
          <el-date-picker
            v-model="form.expectedEndDate"
            type="date"
            placeholder="选择预期结束日期"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="实际开始日期" prop="actualStartDate">
          <el-date-picker
            v-model="form.actualStartDate"
            type="date"
            placeholder="选择实际开始日期"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="实际结束日期" prop="actualEndDate">
          <el-date-picker
            v-model="form.actualEndDate"
            type="date"
            placeholder="选择实际结束日期"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="阶段状态" prop="stageStatus">
          <el-select v-model="form.stageStatus" placeholder="请选择状态" style="width: 100%">
            <el-option label="未开始" value="0" />
            <el-option label="进行中" value="1" />
            <el-option label="已完成" value="2" />
          </el-select>
        </el-form-item>
        <el-form-item label="阶段描述" prop="stageDescription">
          <el-input v-model="form.stageDescription" type="textarea" :rows="4" placeholder="请输入阶段描述" />
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="form.remark" type="textarea" :rows="2" placeholder="请输入备注" />
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
import { Search, Refresh, Plus, Download, Document, EditPen, Delete } from '@element-plus/icons-vue'
import { AgricultureGrowthStageService } from '@/api/agriculture/growthStageApi'
import { ref, reactive, onMounted } from 'vue'
import { resetForm } from '@/utils/utils'
import { ElMessage, ElMessageBox } from 'element-plus'
import { FormInstance } from 'element-plus'
import { AgricultureGrowthStageResult } from '@/types/agriculture/growthStage'
import { downloadExcel } from '@/utils/utils'

const stageList = ref<AgricultureGrowthStageResult[]>([])
const open = ref(false)
const loading = ref(true)
const total = ref(0)
const title = ref('')
const queryRef = ref()
const stageRef = ref<FormInstance>()

const initialFormState = {
  stageId: null,
  batchId: '',
  stageType: '',
  stageName: '',
  stageOrder: 1,
  expectedStartDate: '',
  expectedEndDate: '',
  actualStartDate: '',
  actualEndDate: '',
  stageStatus: '',
  stageDescription: '',
  createBy: '',
  createTime: '',
  updateBy: '',
  updateTime: '',
  remark: ''
}

const form = reactive({ ...initialFormState })

const queryParams = reactive({
  pageNum: 1,
  pageSize: 10,
  stageName: '',
  stageStatus: ''
})

const rules = reactive({
  batchId: [{ required: true, message: '批次ID不能为空', trigger: 'blur' }],
  stageName: [{ required: true, message: '阶段名称不能为空', trigger: 'blur' }],
  stageType: [{ required: true, message: '阶段类型不能为空', trigger: 'blur' }],
  stageOrder: [{ required: true, message: '阶段顺序不能为空', trigger: 'blur' }],
  stageStatus: [{ required: true, message: '阶段状态不能为空', trigger: 'change' }]
})

/** 查询生长阶段列表 */
const getList = async () => {
  loading.value = true
  const res = await AgricultureGrowthStageService.listStage(queryParams)
  if (res.code === 200) {
    stageList.value = res.rows
    total.value = res.total
    loading.value = false
  }
}

/** 搜索按钮操作 */
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
  title.value = '添加生长阶段'
}

/** 修改按钮操作 */
const handleUpdate = async (row: AgricultureGrowthStageResult) => {
  reset()
  open.value = true
  title.value = '修改生长阶段'
  const res = await AgricultureGrowthStageService.getStage(row.stageId)
  if (res.code === 200) {
    Object.assign(form, res.data)
  }
}

/** 提交按钮 */
const submitForm = async () => {
  if (!stageRef.value) return
  await stageRef.value.validate(async (valid) => {
    if (valid) {
      if (form.stageId) {
        const res = await AgricultureGrowthStageService.updateStage(form)
        if (res.code === 200) {
          ElMessage.success(res.msg)
          open.value = false
          getList()
        }
      } else {
        const res = await AgricultureGrowthStageService.addStage(form)
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
const handleDelete = async (row: AgricultureGrowthStageResult) => {
  await ElMessageBox.confirm('是否确认删除生长阶段编号为"' + row.stageId + '"的数据项？', '系统提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
    .then(async () => {
      const res = await AgricultureGrowthStageService.deleteStage(row.stageId)
      if (res.code === 200) {
        getList()
        ElMessage.success(res.msg)
      }
    })
    .catch(() => {})
}

/** 导出按钮操作 */
const handleExport = () => {
  downloadExcel(AgricultureGrowthStageService.exportExcel(queryParams))
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
onMounted(() => {
  getList()
})
</script>

<style lang="scss" scoped>
.page-content {
  padding: 20px;
}

.search-row {
  .button-col {
    :deep(.el-form-item) {
      margin-bottom: 0;
      
      .el-form-item__content {
        display: flex;
        gap: 10px;
        flex-wrap: nowrap;
        white-space: nowrap;
      }
    }
  }
}
</style>

