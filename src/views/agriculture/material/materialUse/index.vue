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
            <form-input
              label="使用记录ID"
              prop="useId"
              @keyup.enter="search"
              v-model="queryParams.useId"
            />
            <form-input
              label="农资名称"
              prop="materialName"
              @keyup.enter="search"
              v-model="queryParams.materialName"
            />
            <el-col :xs="24" :sm="12" :lg="6">
              <el-form-item label="使用日期" prop="useDate">
                <el-date-picker
                  v-model="queryParams.useDate"
                  type="date"
                  placeholder="选择使用日期"
                  format="YYYY-MM-DD"
                  value-format="YYYY-MM-DD"
                  style="width: 100%"
                />
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
      </template>
      <template #bottom>
        <el-button @click="handleAdd" v-auth="['agriculture:materialuse:add']" v-ripple>新增</el-button>
        <el-button @click="handleExport" v-auth="['agriculture:materialuse:export']" v-ripple>导出</el-button>
      </template>
    </table-bar>

    <!-- 农资使用记录列表 -->
    <art-table
      :data="useList"
      :total="total"
      :current-page="queryParams.pageNum"
      :page-size="queryParams.pageSize"
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
      v-loading="loading"
    >
      <template #default>
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column label="使用记录ID" prop="useId" width="120" v-if="columns[0].show" />
        <el-table-column label="农资名称" prop="materialName" min-width="150" show-overflow-tooltip v-if="columns[1].show" />
        <el-table-column label="使用数量" prop="useQuantity" width="120" align="center" v-if="columns[2].show" />
        <el-table-column label="计量单位" prop="measureUnit" width="100" align="center" v-if="columns[3].show" />
        <el-table-column label="使用日期" prop="useDate" width="120" align="center" v-if="columns[4].show" />
        <el-table-column label="使用人员" prop="usePerson" width="100" align="center" v-if="columns[5].show" />
        <el-table-column label="使用地点" prop="useLocation" min-width="150" show-overflow-tooltip v-if="columns[6].show" />
        <el-table-column label="备注" prop="remark" min-width="200" show-overflow-tooltip v-if="columns[7].show" />
        <el-table-column label="创建时间" prop="createTime" width="180" align="center" v-if="columns[8].show" />
        <el-table-column label="操作" width="200" align="center" fixed="right">
          <template #default="scope">
            <el-button link type="primary" @click="handleUpdate(scope.row)" v-auth="['agriculture:materialuse:edit']">
              <el-icon><EditPen /></el-icon>修改
            </el-button>
            <el-button link type="danger" @click="handleDelete(scope.row)" v-auth="['agriculture:materialuse:remove']">
              <el-icon><Delete /></el-icon>删除
            </el-button>
          </template>
        </el-table-column>
      </template>
    </art-table>

    <!-- 添加或修改农资使用记录对话框 -->
    <el-dialog :title="title" v-model="open" width="600px" append-to-body>
      <el-form ref="useRef" :model="form" :rules="rules" label-width="120px">
        <el-form-item label="农资ID" prop="materialId">
          <el-input-number v-model="form.materialId" :min="1" placeholder="请输入农资ID" style="width: 100%" />
        </el-form-item>
        <el-form-item label="使用数量" prop="useQuantity">
          <el-input-number v-model="form.useQuantity" :min="0" :precision="2" style="width: 100%" />
        </el-form-item>
        <el-form-item label="使用日期" prop="useDate">
          <el-date-picker
            v-model="form.useDate"
            type="date"
            placeholder="选择使用日期"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="使用人员" prop="usePerson">
          <el-input v-model="form.usePerson" placeholder="请输入使用人员" />
        </el-form-item>
        <el-form-item label="使用地点" prop="useLocation">
          <el-input v-model="form.useLocation" placeholder="请输入使用地点" />
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
import { EditPen, Delete } from '@element-plus/icons-vue'
import { ref, reactive, onMounted } from 'vue'
import { resetForm } from '@/utils/utils'
import { ElMessage, ElMessageBox } from 'element-plus'
import { FormInstance } from 'element-plus'
import { downloadExcel } from '@/utils/utils'

const useList = ref<any[]>([])
const open = ref(false)
const loading = ref(true)
const total = ref(0)
const title = ref('')
const searchFormRef = ref<FormInstance>()
const useRef = ref<FormInstance>()

const columns = reactive([
  { name: '使用记录ID', show: true },
  { name: '农资名称', show: true },
  { name: '使用数量', show: true },
  { name: '计量单位', show: true },
  { name: '使用日期', show: true },
  { name: '使用人员', show: true },
  { name: '使用地点', show: true },
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
  useId: null,
  materialId: null,
  useQuantity: 0,
  useDate: '',
  usePerson: '',
  useLocation: '',
  remark: ''
}

const form = reactive({ ...initialFormState })

const queryParams = reactive({
  pageNum: 1,
  pageSize: 10,
  useId: '',
  materialName: '',
  useDate: ''
})

const rules = reactive({
  materialId: [{ required: true, message: '农资ID不能为空', trigger: 'blur' }],
  useQuantity: [{ required: true, message: '使用数量不能为空', trigger: 'blur' }],
  useDate: [{ required: true, message: '使用日期不能为空', trigger: 'change' }]
})

/** 查询农资使用记录列表 */
const getList = async () => {
  loading.value = true
  // TODO: 调用API获取数据
  // const res = await AgricultureMaterialUseService.listUse(queryParams)
  // if (res.code === 200) {
  //   useList.value = res.rows || []
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
  title.value = '添加农资使用记录'
}

/** 修改按钮操作 */
const handleUpdate = async (row: any) => {
  reset()
  open.value = true
  title.value = '修改农资使用记录'
  // TODO: 调用API获取详情
  // const res = await AgricultureMaterialUseService.getUse(row.useId)
  // if (res.code === 200) {
  //   Object.assign(form, res.data)
  // }
}

/** 提交按钮 */
const submitForm = async () => {
  if (!useRef.value) return
  await useRef.value.validate(async (valid) => {
    if (valid) {
      // TODO: 调用API提交数据
      // if (form.useId) {
      //   const res = await AgricultureMaterialUseService.updateUse(form)
      //   if (res.code === 200) {
      //     ElMessage.success(res.msg)
      //     open.value = false
      //     getList()
      //   }
      // } else {
      //   const res = await AgricultureMaterialUseService.addUse(form)
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
  await ElMessageBox.confirm('是否确认删除农资使用记录编号为"' + row.useId + '"的数据项？', '系统提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
    .then(async () => {
      // TODO: 调用API删除数据
      // const res = await AgricultureMaterialUseService.deleteUse(row.useId)
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
  // downloadExcel(AgricultureMaterialUseService.exportExcel(queryParams))
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

