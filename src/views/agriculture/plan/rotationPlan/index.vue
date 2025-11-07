<template>
  <div class="page-content">
    <!-- 轮作计划 -->
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
            <form-input
              label="轮作名称"
              prop="rotationName"
              @keyup.enter="search"
              v-model="queryParams.rotationName"
            />
            <el-col :xs="24" :sm="12" :lg="6">
              <el-form-item label="计划年份" prop="planYear">
                <el-date-picker
                  v-model="queryParams.planYear"
                  type="year"
                  placeholder="选择年份"
                  format="YYYY"
                  value-format="YYYY"
                  style="width: 100%"
                />
              </el-form-item>
            </el-col>
            <form-select
              label="轮作状态"
              prop="rotationStatus"
              v-model="queryParams.rotationStatus"
              :options="statusOptions"
            />
          </el-row>
        </el-form>
      </template>
      <template #bottom>
        <el-button @click="handleAdd" v-auth="['agriculture:rotationplan:add']" v-ripple>新增</el-button>
        <el-button @click="handleExport" v-auth="['agriculture:rotationplan:export']" v-ripple>导出</el-button>
      </template>
    </table-bar>

    <!-- 轮作计划列表 -->
    <art-table
      :data="planList"
      :total="total"
      :current-page="queryParams.pageNum"
      :page-size="queryParams.pageSize"
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
      v-loading="loading"
    >
      <template #default>
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column label="轮作ID" prop="rotationId" width="100" v-if="columns[0].show" />
        <el-table-column label="轮作名称" prop="rotationName" min-width="150" show-overflow-tooltip v-if="columns[1].show" />
        <el-table-column label="计划年份" prop="planYear" width="100" align="center" v-if="columns[2].show" />
        <el-table-column label="轮作周期" prop="rotationCycle" width="120" align="center" v-if="columns[3].show" />
        <el-table-column label="轮作状态" prop="rotationStatus" width="100" align="center" v-if="columns[4].show">
          <template #default="scope">
            <el-tag v-if="scope.row.rotationStatus === '0'" type="success">进行中</el-tag>
            <el-tag v-else-if="scope.row.rotationStatus === '1'" type="info">已完成</el-tag>
            <el-tag v-else-if="scope.row.rotationStatus === '2'" type="danger">已取消</el-tag>
            <el-tag v-else>{{ scope.row.rotationStatus }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="轮作描述" prop="rotationDescription" min-width="200" show-overflow-tooltip v-if="columns[5].show" />
        <el-table-column label="创建时间" prop="createTime" width="180" align="center" v-if="columns[6].show" />
        <el-table-column label="操作" width="250" align="center" fixed="right">
          <template #default="scope">
            <el-button link type="primary" @click="handleDetail(scope.row)" v-auth="['agriculture:rotationplan:query']">
              <el-icon><View /></el-icon>详情
            </el-button>
            <el-button link type="primary" @click="handleUpdate(scope.row)" v-auth="['agriculture:rotationplan:edit']">
              <el-icon><EditPen /></el-icon>修改
            </el-button>
            <el-button link type="danger" @click="handleDelete(scope.row)" v-auth="['agriculture:rotationplan:remove']">
              <el-icon><Delete /></el-icon>删除
            </el-button>
          </template>
        </el-table-column>
      </template>
    </art-table>

    <!-- 添加或修改轮作计划对话框 -->
    <el-dialog :title="title" v-model="open" width="600px" append-to-body>
      <el-form ref="planRef" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="轮作名称" prop="rotationName">
          <el-input v-model="form.rotationName" placeholder="请输入轮作名称" />
        </el-form-item>
        <el-form-item label="计划年份" prop="planYear">
          <el-date-picker
            v-model="form.planYear"
            type="year"
            placeholder="选择年份"
            format="YYYY"
            value-format="YYYY"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="轮作周期" prop="rotationCycle">
          <el-input v-model="form.rotationCycle" placeholder="请输入轮作周期（如：3年一轮）" />
        </el-form-item>
        <el-form-item label="轮作状态" prop="rotationStatus">
          <el-select v-model="form.rotationStatus" placeholder="请选择状态" style="width: 100%">
            <el-option label="进行中" value="0" />
            <el-option label="已完成" value="1" />
            <el-option label="已取消" value="2" />
          </el-select>
        </el-form-item>
        <el-form-item label="轮作描述" prop="rotationDescription">
          <el-input v-model="form.rotationDescription" type="textarea" :rows="4" placeholder="请输入轮作描述" />
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
import { Search, Refresh, Plus, Download, Document, EditPen, Delete, View } from '@element-plus/icons-vue'
import { AgricultureRotationPlanService } from '@/api/agriculture/rotationPlanApi'
import { ref, reactive, onMounted } from 'vue'
import { resetForm } from '@/utils/utils'
import { ElMessage, ElMessageBox } from 'element-plus'
import { FormInstance } from 'element-plus'
import { AgricultureRotationPlanResult } from '@/types/agriculture/rotationPlan'
import { downloadExcel } from '@/utils/utils'
import { useRouter } from 'vue-router'

const router = useRouter()
const planList = ref<AgricultureRotationPlanResult[]>([])
const open = ref(false)
const loading = ref(true)
const total = ref(0)
const title = ref('')
const queryRef = ref()
const searchFormRef = ref<FormInstance>()
const planRef = ref<FormInstance>()

const columns = reactive([
  { name: '轮作ID', show: true },
  { name: '轮作名称', show: true },
  { name: '计划年份', show: true },
  { name: '轮作周期', show: true },
  { name: '轮作状态', show: true },
  { name: '轮作描述', show: true },
  { name: '创建时间', show: true }
])

const statusOptions = ref([
  { label: '进行中', value: '0' },
  { label: '已完成', value: '1' },
  { label: '已取消', value: '2' }
])

const changeColumn = (list: any) => {
  columns.forEach((col, index) => {
    if (list[index]) {
      col.show = list[index].show
    }
  })
}

const initialFormState = {
  rotationId: null,
  rotationName: '',
  planYear: '',
  pastureId: '',
  rotationCycle: '',
  rotationDescription: '',
  rotationStatus: '',
  createBy: '',
  createTime: '',
  updateBy: '',
  updateTime: '',
  remark: '',
  delFlag: ''
}

const form = reactive({ ...initialFormState })

const queryParams = reactive({
  pageNum: 1,
  pageSize: 10,
  rotationName: '',
  planYear: '',
  rotationStatus: ''
})

const rules = reactive({
  rotationName: [{ required: true, message: '轮作名称不能为空', trigger: 'blur' }],
  planYear: [{ required: true, message: '计划年份不能为空', trigger: 'change' }],
  rotationStatus: [{ required: true, message: '轮作状态不能为空', trigger: 'change' }]
})

/** 查询轮作计划列表 */
const getList = async () => {
  loading.value = true
  try {
    const res = await AgricultureRotationPlanService.listPlan(queryParams)
    if (res.code === 200) {
      planList.value = res.rows || []
      total.value = res.total || 0
      // 调试信息：检查返回的数据
      console.log('查询结果:', {
        total: res.total,
        rows: res.rows?.length,
        pageNum: queryParams.pageNum,
        pageSize: queryParams.pageSize
      })
    } else {
      ElMessage.error(res.msg || '查询失败')
    }
  } catch (error) {
    console.error('查询轮作计划列表失败:', error)
    ElMessage.error('查询失败')
  } finally {
    loading.value = false
  }
}

/** 搜索按钮操作 */
const search = () => {
  queryParams.pageNum = 1
  getList()
}

const handleQuery = search

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
  title.value = '添加轮作计划'
}

/** 详情按钮操作 */
const handleDetail = (row: AgricultureRotationPlanResult) => {
  router.push({
    path: '/agriculture/plan/rotationPlan/detail',
    query: { rotationId: row.rotationId }
  })
}

/** 修改按钮操作 */
const handleUpdate = async (row: AgricultureRotationPlanResult) => {
  reset()
  open.value = true
  title.value = '修改轮作计划'
  const res = await AgricultureRotationPlanService.getPlan(row.rotationId)
  if (res.code === 200) {
    Object.assign(form, res.data)
  }
}

/** 提交按钮 */
const submitForm = async () => {
  if (!planRef.value) return
  await planRef.value.validate(async (valid) => {
    if (valid) {
      if (form.rotationId) {
        const res = await AgricultureRotationPlanService.updatePlan(form)
        if (res.code === 200) {
          ElMessage.success(res.msg)
          open.value = false
          getList()
        }
      } else {
        // 新增时设置 delFlag = 0
        const addData = {
          ...form,
          delFlag: '0'
        }
        const res = await AgricultureRotationPlanService.addPlan(addData)
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
const handleDelete = async (row: AgricultureRotationPlanResult) => {
  await ElMessageBox.confirm('是否确认删除轮作计划编号为"' + row.rotationId + '"的数据项？', '系统提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
    .then(async () => {
      const res = await AgricultureRotationPlanService.deletePlan(row.rotationId)
      if (res.code === 200) {
        getList()
        ElMessage.success(res.msg)
      }
    })
    .catch(() => {})
}

/** 导出按钮操作 */
const handleExport = () => {
  downloadExcel(AgricultureRotationPlanService.exportExcel(queryParams))
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
</style>

