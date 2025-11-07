<template>
  <div class="page-content">
    <!-- 年度种植规划 -->
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
              label="计划名称"
              prop="planName"
              @keyup.enter="search"
              v-model="queryParams.planName"
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
              label="计划状态"
              prop="planStatus"
              v-model="queryParams.planStatus"
              :options="statusOptions"
            />
          </el-row>
        </el-form>
      </template>
      <template #bottom>
        <el-button @click="handleAdd" v-auth="['agriculture:annualplan:add']" v-ripple>新增</el-button>
        <el-button @click="handleExport" v-auth="['agriculture:annualplan:export']" v-ripple>导出</el-button>
      </template>
    </table-bar>

    <!-- 计划列表 -->
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
        <el-table-column label="计划ID" prop="planId" width="100" v-if="columns[0].show" />
        <el-table-column label="计划名称" prop="planName" min-width="150" show-overflow-tooltip v-if="columns[1].show" />
        <el-table-column label="计划年份" prop="planYear" width="100" align="center" v-if="columns[2].show" />
        <el-table-column label="计划类型" prop="planType" width="120" align="center" v-if="columns[3].show">
          <template #default="scope">
            <el-tag v-if="scope.row.planType === 'annual'">年度计划</el-tag>
            <el-tag v-else-if="scope.row.planType === 'seasonal'" type="success">季度计划</el-tag>
            <el-tag v-else type="info">{{ scope.row.planType }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="计划状态" prop="planStatus" width="100" align="center" v-if="columns[4].show">
          <template #default="scope">
            <el-tag v-if="scope.row.planStatus === '0'" type="success">进行中</el-tag>
            <el-tag v-else-if="scope.row.planStatus === '1'" type="info">已完成</el-tag>
            <el-tag v-else-if="scope.row.planStatus === '2'" type="danger">已取消</el-tag>
            <el-tag v-else>{{ scope.row.planStatus }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="开始日期" prop="startDate" width="120" align="center" v-if="columns[5].show" />
        <el-table-column label="结束日期" prop="endDate" width="120" align="center" v-if="columns[6].show" />
        <el-table-column label="总面积(亩)" prop="totalArea" width="120" align="center" v-if="columns[7].show" />
        <el-table-column label="创建时间" prop="createTime" width="180" align="center" v-if="columns[8].show" />
        <el-table-column label="操作" width="250" align="center" fixed="right">
          <template #default="scope">
            <el-button link type="primary" @click="handleDetail(scope.row)" v-auth="['agriculture:annualplan:query']">
              <el-icon><View /></el-icon>详情
            </el-button>
            <el-button link type="primary" @click="handleUpdate(scope.row)" v-auth="['agriculture:annualplan:edit']">
              <el-icon><EditPen /></el-icon>修改
            </el-button>
            <el-button link type="danger" @click="handleDelete(scope.row)" v-auth="['agriculture:annualplan:remove']">
              <el-icon><Delete /></el-icon>删除
            </el-button>
          </template>
        </el-table-column>
      </template>
    </art-table>

    <!-- 添加或修改年度种植规划对话框 -->
    <el-dialog :title="title" v-model="open" width="600px" append-to-body>
      <el-form ref="planRef" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="计划名称" prop="planName">
          <el-input v-model="form.planName" placeholder="请输入计划名称" />
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
        <el-form-item label="计划类型" prop="planType">
          <el-select v-model="form.planType" placeholder="请选择计划类型" style="width: 100%">
            <el-option label="年度计划" value="0" />
            <el-option label="季度计划" value="1" />
          </el-select>
        </el-form-item>
        <el-form-item label="计划状态" prop="planStatus">
          <el-select v-model="form.planStatus" placeholder="请选择状态" style="width: 100%">
            <el-option label="进行中" value="0" />
            <el-option label="已完成" value="1" />
            <el-option label="已取消" value="2" />
          </el-select>
        </el-form-item>
        <el-form-item label="开始日期" prop="startDate">
          <el-date-picker
            v-model="form.startDate"
            type="date"
            placeholder="选择开始日期"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="结束日期" prop="endDate">
          <el-date-picker
            v-model="form.endDate"
            type="date"
            placeholder="选择结束日期"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="总面积(亩)" prop="totalArea">
          <el-input-number v-model="form.totalArea" :min="0" :precision="2" style="width: 100%" />
        </el-form-item>
        <el-form-item label="计划描述" prop="planDescription">
          <el-input v-model="form.planDescription" type="textarea" :rows="4" placeholder="请输入计划描述" />
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
import { AgricultureAnnualPlanService } from '@/api/agriculture/annualPlanApi'
import { ref, reactive, onMounted } from 'vue'
import { resetForm } from '@/utils/utils'
import { ElMessage, ElMessageBox } from 'element-plus'
import { FormInstance } from 'element-plus'
import { AgricultureAnnualPlanResult } from '@/types/agriculture/annualplan'
import { downloadExcel } from '@/utils/utils'
import { useRouter } from 'vue-router'

const router = useRouter()
const planList = ref<AgricultureAnnualPlanResult[]>([])
const open = ref(false)
const loading = ref(true)
const total = ref(0)
const title = ref('')
const queryRef = ref()
const searchFormRef = ref<FormInstance>()
const planRef = ref<FormInstance>()

const columns = reactive([
  { name: '计划ID', show: true },
  { name: '计划名称', show: true },
  { name: '计划年份', show: true },
  { name: '计划类型', show: true },
  { name: '计划状态', show: true },
  { name: '开始日期', show: true },
  { name: '结束日期', show: true },
  { name: '总面积(亩)', show: true },
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
  planId: null,
  planYear: '',
  planName: '',
  pastureId: '',
  planType: '',
  planStatus: '',
  startDate: '',
  endDate: '',
  totalArea: '',
  planDescription: '',
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
  planName: '',
  planYear: '',
  planStatus: ''
})

const rules = reactive({
  planName: [{ required: true, message: '计划名称不能为空', trigger: 'blur' }],
  planYear: [{ required: true, message: '计划年份不能为空', trigger: 'change' }],
  planType: [{ required: true, message: '计划类型不能为空', trigger: 'change' }],
  planStatus: [{ required: true, message: '计划状态不能为空', trigger: 'change' }],
  startDate: [{ required: true, message: '开始日期不能为空', trigger: 'change' }],
  endDate: [{ required: true, message: '结束日期不能为空', trigger: 'change' }]
})

/** 查询年度种植规划列表 */
const getList = async () => {
  loading.value = true
  const res = await AgricultureAnnualPlanService.listPlan(queryParams)
  if (res.code === 200) {
    planList.value = res.rows
    total.value = res.total
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
  title.value = '添加年度种植规划'
}

/** 详情按钮操作 */
const handleDetail = (row: AgricultureAnnualPlanResult) => {
  router.push({
    path: '/agriculture/plan/annualPlan/detail',
    query: { planId: row.planId }
  })
}

/** 修改按钮操作 */
const handleUpdate = async (row: AgricultureAnnualPlanResult) => {
  reset()
  open.value = true
  title.value = '修改年度种植规划'
  const res = await AgricultureAnnualPlanService.getPlan(row.planId)
  if (res.code === 200) {
    Object.assign(form, res.data)
  }
}

/** 提交按钮 */
const submitForm = async () => {
  if (!planRef.value) return
  await planRef.value.validate(async (valid) => {
    if (valid) {
      if (form.planId) {
        const res = await AgricultureAnnualPlanService.updatePlan(form)
        if (res.code === 200) {
          ElMessage.success(res.msg)
          open.value = false
          getList()
        }
      } else {
        const res = await AgricultureAnnualPlanService.addPlan(form)
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
const handleDelete = async (row: AgricultureAnnualPlanResult) => {
  await ElMessageBox.confirm('是否确认删除年度种植规划编号为"' + row.planId + '"的数据项？', '系统提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
    .then(async () => {
      const res = await AgricultureAnnualPlanService.deletePlan(row.planId)
      if (res.code === 200) {
        getList()
        ElMessage.success(res.msg)
      }
    })
    .catch(() => {})
}

/** 导出按钮操作 */
const handleExport = () => {
  downloadExcel(AgricultureAnnualPlanService.exportExcel(queryParams))
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

