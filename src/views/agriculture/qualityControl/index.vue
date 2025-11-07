<template>
  <div class="page-content">
    <!-- 质量管控 -->
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
              label="批次名称"
              prop="batchName"
              @keyup.enter="search"
              v-model="queryParams.batchName"
            />
            <form-input
              label="产品名称"
              prop="productName"
              @keyup.enter="search"
              v-model="queryParams.productName"
            />
            <form-select
              label="质量等级"
              prop="qualityLevel"
              v-model="queryParams.qualityLevel"
              :options="qualityLevelOptions"
            />
          </el-row>
        </el-form>
      </template>
      <template #bottom>
        <el-button @click="handleAdd" v-auth="['agriculture:qualitycontrol:add']" v-ripple>新增</el-button>
        <el-button @click="handleExport" v-auth="['agriculture:qualitycontrol:export']" v-ripple>导出</el-button>
      </template>
    </table-bar>

    <!-- 质量管控记录列表 -->
    <art-table
      :data="qualityList"
      :total="total"
      :current-page="queryParams.pageNum"
      :page-size="queryParams.pageSize"
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
      v-loading="loading"
    >
      <template #default>
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column label="记录ID" prop="recordId" width="100" v-if="columns[0].show" />
        <el-table-column label="批次名称" prop="batchName" min-width="150" show-overflow-tooltip v-if="columns[1].show" />
        <el-table-column label="产品名称" prop="productName" min-width="150" show-overflow-tooltip v-if="columns[2].show" />
        <el-table-column label="质量等级" prop="qualityLevel" width="120" align="center" v-if="columns[3].show">
          <template #default="scope">
            <el-tag v-if="scope.row.qualityLevel === '1'" type="success">优秀</el-tag>
            <el-tag v-else-if="scope.row.qualityLevel === '2'" type="warning">良好</el-tag>
            <el-tag v-else-if="scope.row.qualityLevel === '3'" type="info">合格</el-tag>
            <el-tag v-else-if="scope.row.qualityLevel === '4'" type="danger">不合格</el-tag>
            <el-tag v-else>{{ scope.row.qualityLevel }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="检测日期" prop="testDate" width="120" align="center" v-if="columns[4].show" />
        <el-table-column label="检测人员" prop="testPerson" width="100" align="center" v-if="columns[5].show" />
        <el-table-column label="检测结果" prop="testResult" min-width="200" show-overflow-tooltip v-if="columns[6].show" />
        <el-table-column label="备注" prop="remark" min-width="200" show-overflow-tooltip v-if="columns[7].show" />
        <el-table-column label="创建时间" prop="createTime" width="180" align="center" v-if="columns[8].show" />
        <el-table-column label="操作" width="200" align="center" fixed="right">
          <template #default="scope">
            <el-button link type="primary" @click="handleUpdate(scope.row)" v-auth="['agriculture:qualitycontrol:edit']">
              <el-icon><EditPen /></el-icon>修改
            </el-button>
            <el-button link type="danger" @click="handleDelete(scope.row)" v-auth="['agriculture:qualitycontrol:remove']">
              <el-icon><Delete /></el-icon>删除
            </el-button>
          </template>
        </el-table-column>
      </template>
    </art-table>

    <!-- 添加或修改质量管控记录对话框 -->
    <el-dialog :title="title" v-model="open" width="600px" append-to-body>
      <el-form ref="qualityRef" :model="form" :rules="rules" label-width="120px">
        <el-form-item label="批次ID" prop="batchId">
          <el-input-number v-model="form.batchId" :min="1" placeholder="请输入批次ID" style="width: 100%" />
        </el-form-item>
        <el-form-item label="产品名称" prop="productName">
          <el-input v-model="form.productName" placeholder="请输入产品名称" />
        </el-form-item>
        <el-form-item label="质量等级" prop="qualityLevel">
          <el-select v-model="form.qualityLevel" placeholder="请选择质量等级" style="width: 100%">
            <el-option label="优秀" value="1" />
            <el-option label="良好" value="2" />
            <el-option label="合格" value="3" />
            <el-option label="不合格" value="4" />
          </el-select>
        </el-form-item>
        <el-form-item label="检测日期" prop="testDate">
          <el-date-picker
            v-model="form.testDate"
            type="date"
            placeholder="选择检测日期"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="检测人员" prop="testPerson">
          <el-input v-model="form.testPerson" placeholder="请输入检测人员" />
        </el-form-item>
        <el-form-item label="检测结果" prop="testResult">
          <el-input v-model="form.testResult" type="textarea" :rows="3" placeholder="请输入检测结果" />
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
import { EditPen, Delete } from '@element-plus/icons-vue'
import { ref, reactive, onMounted } from 'vue'
import { resetForm } from '@/utils/utils'
import { ElMessage, ElMessageBox } from 'element-plus'
import { FormInstance } from 'element-plus'
import { downloadExcel } from '@/utils/utils'

const qualityList = ref<any[]>([])
const open = ref(false)
const loading = ref(true)
const total = ref(0)
const title = ref('')
const searchFormRef = ref<FormInstance>()
const qualityRef = ref<FormInstance>()

const columns = reactive([
  { name: '记录ID', show: true },
  { name: '批次名称', show: true },
  { name: '产品名称', show: true },
  { name: '质量等级', show: true },
  { name: '检测日期', show: true },
  { name: '检测人员', show: true },
  { name: '检测结果', show: true },
  { name: '备注', show: true },
  { name: '创建时间', show: true }
])

const qualityLevelOptions = ref([
  { label: '优秀', value: '1' },
  { label: '良好', value: '2' },
  { label: '合格', value: '3' },
  { label: '不合格', value: '4' }
])

const changeColumn = (list: any) => {
  columns.forEach((col, index) => {
    if (list[index]) {
      col.show = list[index].show
    }
  })
}

const initialFormState = {
  recordId: null,
  batchId: null,
  productName: '',
  qualityLevel: '',
  testDate: '',
  testPerson: '',
  testResult: '',
  remark: ''
}

const form = reactive({ ...initialFormState })

const queryParams = reactive({
  pageNum: 1,
  pageSize: 10,
  batchName: '',
  productName: '',
  qualityLevel: ''
})

const rules = reactive({
  batchId: [{ required: true, message: '批次ID不能为空', trigger: 'blur' }],
  productName: [{ required: true, message: '产品名称不能为空', trigger: 'blur' }],
  qualityLevel: [{ required: true, message: '质量等级不能为空', trigger: 'change' }],
  testDate: [{ required: true, message: '检测日期不能为空', trigger: 'change' }]
})

/** 查询质量管控记录列表 */
const getList = async () => {
  loading.value = true
  // TODO: 调用API获取数据
  // const res = await AgricultureQualityControlService.listQuality(queryParams)
  // if (res.code === 200) {
  //   qualityList.value = res.rows || []
  //   total.value = res.total || 0
  // }
  loading.value = false
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
  title.value = '添加质量管控记录'
}

/** 修改按钮操作 */
const handleUpdate = async (row: any) => {
  reset()
  open.value = true
  title.value = '修改质量管控记录'
  // TODO: 调用API获取详情
  // const res = await AgricultureQualityControlService.getQuality(row.recordId)
  // if (res.code === 200) {
  //   Object.assign(form, res.data)
  // }
}

/** 提交按钮 */
const submitForm = async () => {
  if (!qualityRef.value) return
  await qualityRef.value.validate(async (valid) => {
    if (valid) {
      // TODO: 调用API提交数据
      // if (form.recordId) {
      //   const res = await AgricultureQualityControlService.updateQuality(form)
      //   if (res.code === 200) {
      //     ElMessage.success(res.msg)
      //     open.value = false
      //     getList()
      //   }
      // } else {
      //   const res = await AgricultureQualityControlService.addQuality(form)
      //   if (res.code === 200) {
      //     ElMessage.success(res.msg)
      //     open.value = false
      //     getList()
      //   }
      // }
      ElMessage.success('操作成功')
      open.value = false
      getList()
    }
  })
}

/** 删除按钮操作 */
const handleDelete = async (row: any) => {
  await ElMessageBox.confirm('是否确认删除质量管控记录编号为"' + row.recordId + '"的数据项？', '系统提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
    .then(async () => {
      // TODO: 调用API删除数据
      // const res = await AgricultureQualityControlService.deleteQuality(row.recordId)
      // if (res.code === 200) {
      //   getList()
      //   ElMessage.success(res.msg)
      // }
      ElMessage.success('删除成功')
      getList()
    })
    .catch(() => {})
}

/** 导出按钮操作 */
const handleExport = () => {
  // TODO: 调用导出API
  // downloadExcel(AgricultureQualityControlService.exportExcel(queryParams))
  ElMessage.info('导出功能待实现')
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

