<template>
  <div class="page-content">
    <!-- 搜索栏开始 -->
    <el-form :model="queryParams" ref="queryRef" label-width="100px">
      <el-row :gutter="20" class="search-row">
        <el-col :xs="24" :sm="12" :md="8" :lg="6" :xl="5">
          <el-form-item label="轮作ID" prop="rotationId">
            <el-input placeholder="请输入轮作ID" v-model="queryParams.rotationId" @keyup.enter="handleQuery" />
          </el-form-item>
        </el-col>
        <el-col :xs="24" :sm="12" :md="8" :lg="6" :xl="5">
          <el-form-item label="季节类型" prop="seasonType">
            <el-input placeholder="请输入季节类型" v-model="queryParams.seasonType" @keyup.enter="handleQuery" />
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
            <el-button type="success" @click="handleAdd" v-auth="['agriculture:rotationdetail:add']" v-ripple>
              <el-icon><Plus /></el-icon>新增
            </el-button>
            <el-button type="warning" @click="handleExport" v-auth="['agriculture:rotationdetail:export']" v-ripple>
              <el-icon><Download /></el-icon>导出
            </el-button>
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
    <!-- 搜索栏结束 -->

    <!-- 表格 -->
    <el-table v-loading="loading" :data="detailList" border style="width: 100%">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="明细ID" prop="detailId" width="100" />
      <el-table-column label="轮作ID" prop="rotationId" width="100" />
      <el-table-column label="种质ID" prop="classId" width="100" />
      <el-table-column label="轮作顺序" prop="rotationOrder" width="100" align="center" />
      <el-table-column label="季节类型" prop="seasonType" min-width="120" align="center" />
      <el-table-column label="种植面积(亩)" prop="plantingArea" min-width="120" align="center" />
      <el-table-column label="种植密度" prop="plantingDensity" min-width="120" align="center" />
      <el-table-column label="预期开始" prop="expectedStartDate" width="120" align="center" />
      <el-table-column label="预期结束" prop="expectedEndDate" width="120" align="center" />
      <el-table-column label="创建时间" prop="createTime" width="180" align="center" />
      <el-table-column label="操作" width="200" align="center" fixed="right">
        <template #default="scope">
          <el-button link type="primary" @click="handleUpdate(scope.row)" v-auth="['agriculture:rotationdetail:edit']">
            <el-icon><EditPen /></el-icon>修改
          </el-button>
          <el-button link type="danger" @click="handleDelete(scope.row)" v-auth="['agriculture:rotationdetail:remove']">
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

    <!-- 添加或修改轮作明细对话框 -->
    <el-dialog :title="title" v-model="open" width="600px" append-to-body>
      <el-form ref="detailRef" :model="form" :rules="rules" label-width="120px">
        <el-form-item label="轮作ID" prop="rotationId">
          <el-input v-model="form.rotationId" placeholder="请输入轮作ID" />
        </el-form-item>
        <el-form-item label="种质ID" prop="classId">
          <el-input-number v-model="form.classId" :min="1" placeholder="请输入种质ID" style="width: 100%" />
        </el-form-item>
        <el-form-item label="轮作顺序" prop="rotationOrder">
          <el-input-number v-model="form.rotationOrder" :min="1" style="width: 100%" />
        </el-form-item>
        <el-form-item label="季节类型" prop="seasonType">
          <el-input v-model="form.seasonType" placeholder="请输入季节类型（如：春季、夏季等）" />
        </el-form-item>
        <el-form-item label="种植面积(亩)" prop="plantingArea">
          <el-input-number v-model="form.plantingArea" :min="0" :precision="2" style="width: 100%" />
        </el-form-item>
        <el-form-item label="种植密度" prop="plantingDensity">
          <el-input v-model="form.plantingDensity" placeholder="请输入种植密度" />
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
import { Search, Refresh, Plus, Download, EditPen, Delete } from '@element-plus/icons-vue'
import { AgricultureRotationDetailService } from '@/api/agriculture/rotationDetailApi'
import { ref, reactive, onMounted } from 'vue'
import { resetForm } from '@/utils/utils'
import { ElMessage, ElMessageBox } from 'element-plus'
import { FormInstance } from 'element-plus'
import { AgricultureRotationDetailResult } from '@/types/agriculture/rotationDetail'
import { downloadExcel } from '@/utils/utils'

const detailList = ref<AgricultureRotationDetailResult[]>([])
const open = ref(false)
const loading = ref(true)
const total = ref(0)
const title = ref('')
const queryRef = ref()
const detailRef = ref<FormInstance>()

const initialFormState = {
  detailId: null,
  rotationId: '',
  classId: null,
  rotationOrder: 1,
  seasonType: '',
  plantingArea: null,
  plantingDensity: '',
  expectedStartDate: '',
  expectedEndDate: '',
  remark: ''
}

const form = reactive({ ...initialFormState })

const queryParams = reactive({
  pageNum: 1,
  pageSize: 10,
  rotationId: '',
  seasonType: ''
})

const rules = reactive({
  rotationId: [{ required: true, message: '轮作ID不能为空', trigger: 'blur' }],
  classId: [{ required: true, message: '种质ID不能为空', trigger: 'blur' }],
  rotationOrder: [{ required: true, message: '轮作顺序不能为空', trigger: 'blur' }],
  seasonType: [{ required: true, message: '季节类型不能为空', trigger: 'blur' }]
})

/** 查询轮作明细列表 */
const getList = async () => {
  loading.value = true
  const res = await AgricultureRotationDetailService.listDetail(queryParams)
  if (res.code === 200) {
    detailList.value = res.rows
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
  title.value = '添加轮作明细'
}

/** 修改按钮操作 */
const handleUpdate = async (row: AgricultureRotationDetailResult) => {
  reset()
  open.value = true
  title.value = '修改轮作明细'
  const res = await AgricultureRotationDetailService.getDetail(row.detailId)
  if (res.code === 200) {
    Object.assign(form, res.data)
  }
}

/** 提交按钮 */
const submitForm = async () => {
  if (!detailRef.value) return
  await detailRef.value.validate(async (valid) => {
    if (valid) {
      if (form.detailId) {
        const res = await AgricultureRotationDetailService.updateDetail(form)
        if (res.code === 200) {
          ElMessage.success(res.msg)
          open.value = false
          getList()
        }
      } else {
        const res = await AgricultureRotationDetailService.addDetail(form)
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
const handleDelete = async (row: AgricultureRotationDetailResult) => {
  await ElMessageBox.confirm('是否确认删除轮作明细编号为"' + row.detailId + '"的数据项？', '系统提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
    .then(async () => {
      const res = await AgricultureRotationDetailService.deleteDetail(row.detailId)
      if (res.code === 200) {
        getList()
        ElMessage.success(res.msg)
      }
    })
    .catch(() => {})
}

/** 导出按钮操作 */
const handleExport = () => {
  downloadExcel(AgricultureRotationDetailService.exportExcel(queryParams))
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

:deep(.el-table) {
  width: 100% !important;
}
</style>

