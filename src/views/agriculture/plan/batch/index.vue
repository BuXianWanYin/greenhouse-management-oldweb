<template>
  <div class="page-content">
    <!-- 搜索栏开始 -->
    <el-form :model="queryParams" ref="queryRef" label-width="100px">
      <el-row :gutter="20" class="search-row">
        <el-col :xs="24" :sm="12" :md="8" :lg="6" :xl="5">
          <el-form-item label="批次名称" prop="batchName">
            <el-input placeholder="请输入批次名称" v-model="queryParams.batchName" @keyup.enter="handleQuery">
              <template #prefix>
                <el-icon><Document /></el-icon>
              </template>
            </el-input>
          </el-form-item>
        </el-col>
        <el-col :xs="24" :sm="12" :md="8" :lg="6" :xl="5">
          <el-form-item label="批次状态" prop="status">
            <el-select v-model="queryParams.status" placeholder="请选择状态" clearable style="width: 100%">
              <el-option label="进行中" value="0" />
              <el-option label="已完成" value="1" />
              <el-option label="已取消" value="2" />
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
            <el-button type="success" @click="handleAdd" v-auth="['agriculture:batch:add']" v-ripple>
              <el-icon><Plus /></el-icon>新增
            </el-button>
            <el-button type="warning" @click="handleExport" v-auth="['agriculture:batch:export']" v-ripple>
              <el-icon><Download /></el-icon>导出
            </el-button>
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
    <!-- 搜索栏结束 -->

    <!-- 表格 -->
    <el-table v-loading="loading" :data="batchList" border>
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="批次ID" prop="batchId" width="100" />
      <el-table-column label="批次名称" prop="batchName" min-width="150" show-overflow-tooltip />
      <el-table-column label="种质" prop="className" width="120" align="center" />
      <el-table-column label="所属温室" prop="pastureId" width="120" align="center" />
      <el-table-column label="种植面积(亩)" prop="cropArea" width="120" align="center" />
      <el-table-column label="负责人" prop="nickName" width="100" align="center" />
      <el-table-column label="开始时间" prop="startTime" width="120" align="center" />
      <el-table-column label="状态" prop="status" width="100" align="center">
        <template #default="scope">
          <el-tag v-if="scope.row.status === '0'" type="success">进行中</el-tag>
          <el-tag v-else-if="scope.row.status === '1'" type="info">已完成</el-tag>
          <el-tag v-else-if="scope.row.status === '2'" type="danger">已取消</el-tag>
          <el-tag v-else>{{ scope.row.status }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="创建时间" prop="createTime" width="180" align="center" />
      <el-table-column label="操作" width="200" align="center" fixed="right">
        <template #default="scope">
          <el-button link type="primary" @click="handleDetail(scope.row)" v-auth="['agriculture:batch:query']">
            <el-icon><View /></el-icon>详情
          </el-button>
          <el-button link type="primary" @click="handleUpdate(scope.row)" v-auth="['agriculture:batch:edit']">
            <el-icon><EditPen /></el-icon>修改
          </el-button>
          <el-button link type="danger" @click="handleDelete(scope.row)" v-auth="['agriculture:batch:remove']">
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

    <!-- 添加或修改批次对话框 -->
    <el-dialog :title="title" v-model="open" width="700px" append-to-body>
      <el-form ref="batchRef" :model="form" :rules="rules" label-width="120px">
        <el-form-item label="批次名称" prop="batchName">
          <el-input v-model="form.batchName" placeholder="请输入批次名称" />
        </el-form-item>
        <el-form-item label="种质ID" prop="classId">
          <el-input-number v-model="form.classId" :min="1" placeholder="请输入种质ID" style="width: 100%" />
        </el-form-item>
        <el-form-item label="所属温室ID" prop="pastureId">
          <el-input-number v-model="form.pastureId" :min="1" placeholder="请输入温室ID" style="width: 100%" />
        </el-form-item>
        <el-form-item label="种植面积(亩)" prop="cropArea">
          <el-input-number v-model="form.cropArea" :min="0" :precision="2" style="width: 100%" />
        </el-form-item>
        <el-form-item label="负责人ID" prop="responsiblePersonId">
          <el-input-number v-model="form.responsiblePersonId" :min="1" placeholder="请输入负责人ID" style="width: 100%" />
        </el-form-item>
        <el-form-item label="开始时间" prop="startTime">
          <el-date-picker
            v-model="form.startTime"
            type="date"
            placeholder="选择开始时间"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-select v-model="form.status" placeholder="请选择状态" style="width: 100%">
            <el-option label="进行中" value="0" />
            <el-option label="已完成" value="1" />
            <el-option label="已取消" value="2" />
          </el-select>
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="form.remark" type="textarea" :rows="3" placeholder="请输入备注" />
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
import { Search, Refresh, Plus, Download, Document, EditPen, Delete, View } from '@element-plus/icons-vue'
import { AgricultureCropBatchService } from '@/api/agriculture/cropBatchApi'
import { ref, reactive, onMounted } from 'vue'
import { resetForm } from '@/utils/utils'
import { ElMessage, ElMessageBox } from 'element-plus'
import { FormInstance } from 'element-plus'
import { AgricultureCropBatchResult } from '@/types/agriculture/batch'
import { downloadExcel } from '@/utils/utils'
import { useRouter } from 'vue-router'

const router = useRouter()
const batchList = ref<AgricultureCropBatchResult[]>([])
const open = ref(false)
const loading = ref(true)
const total = ref(0)
const title = ref('')
const queryRef = ref()
const batchRef = ref<FormInstance>()

const initialFormState = {
  batchId: null,
  batchName: '',
  classId: null,
  pastureId: null,
  cropArea: 0,
  responsiblePersonId: null,
  startTime: '',
  status: '0',
  remark: ''
}

const form = reactive({ ...initialFormState })

const queryParams = reactive({
  pageNum: 1,
  pageSize: 10,
  batchName: '',
  status: ''
})

const rules = reactive({
  batchName: [{ required: true, message: '批次名称不能为空', trigger: 'blur' }],
  pastureId: [{ required: true, message: '所属温室ID不能为空', trigger: 'blur' }],
  cropArea: [{ required: true, message: '种植面积不能为空', trigger: 'blur' }]
})

/** 查询批次列表 */
const getList = async () => {
  loading.value = true
  const res = await AgricultureCropBatchService.listBatch(queryParams)
  if (res.code === 200) {
    batchList.value = res.rows
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
  title.value = '添加批次'
}

/** 修改按钮操作 */
const handleUpdate = async (row: AgricultureCropBatchResult) => {
  reset()
  open.value = true
  title.value = '修改批次'
  const res = await AgricultureCropBatchService.getBatch(row.batchId)
  if (res.code === 200) {
    Object.assign(form, res.data)
  }
}

/** 详情按钮操作 */
const handleDetail = (row: AgricultureCropBatchResult) => {
  router.push({
    path: '/agriculture/plan/batch/detail',
    query: { batchId: row.batchId }
  })
}

/** 提交按钮 */
const submitForm = async () => {
  if (!batchRef.value) return
  await batchRef.value.validate(async (valid) => {
    if (valid) {
      if (form.batchId) {
        const res = await AgricultureCropBatchService.updateBatch(form)
        if (res.code === 200) {
          ElMessage.success(res.msg)
          open.value = false
          getList()
        }
      } else {
        const res = await AgricultureCropBatchService.addBatch(form)
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
const handleDelete = async (row: AgricultureCropBatchResult) => {
  await ElMessageBox.confirm('是否确认删除批次编号为"' + row.batchId + '"的数据项？', '系统提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
    .then(async () => {
      const res = await AgricultureCropBatchService.deleteBatch(row.batchId)
      if (res.code === 200) {
        getList()
        ElMessage.success(res.msg)
      }
    })
    .catch(() => {})
}

/** 导出按钮操作 */
const handleExport = () => {
  downloadExcel(AgricultureCropBatchService.exportExcel(queryParams))
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

