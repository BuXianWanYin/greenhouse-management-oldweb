<template>
  <div class="page-content">
    <!-- 批次管理 -->
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
            <form-select
              label="批次状态"
              prop="status"
              v-model="queryParams.status"
              :options="statusOptions"
            />
          </el-row>
        </el-form>
      </template>
      <template #bottom>
        <el-button @click="handleAdd" v-auth="['agriculture:batch:add']" v-ripple>新增</el-button>
        <el-button @click="handleExport" v-auth="['agriculture:batch:export']" v-ripple>导出</el-button>
      </template>
    </table-bar>

    <!-- 批次列表 -->
    <art-table
      :data="batchList"
      :total="total"
      :current-page="queryParams.pageNum"
      :page-size="queryParams.pageSize"
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
      v-loading="loading"
    >
      <template #default>
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column label="批次ID" prop="batchId" width="100" v-if="columns[0].show" />
        <el-table-column label="批次名称" prop="batchName" min-width="150" show-overflow-tooltip v-if="columns[1].show" />
        <el-table-column label="种质" prop="className" width="120" align="center" v-if="columns[2].show" />
        <el-table-column label="所属温室" prop="pastureId" width="120" align="center" v-if="columns[3].show" />
        <el-table-column label="种植面积(亩)" prop="cropArea" width="120" align="center" v-if="columns[4].show" />
        <el-table-column label="负责人" prop="nickName" width="100" align="center" v-if="columns[5].show" />
        <el-table-column label="开始时间" prop="startTime" width="120" align="center" v-if="columns[6].show" />
        <el-table-column label="状态" prop="status" width="100" align="center" v-if="columns[7].show">
          <template #default="scope">
            <el-tag v-if="scope.row.status === '0'" type="success">进行中</el-tag>
            <el-tag v-else-if="scope.row.status === '1'" type="info">已完成</el-tag>
            <el-tag v-else-if="scope.row.status === '2'" type="danger">已取消</el-tag>
            <el-tag v-else>{{ scope.row.status }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="创建时间" prop="createTime" width="180" align="center" v-if="columns[8].show" />
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
      </template>
    </art-table>

    <!-- 添加或修改批次对话框 -->
    <el-dialog :title="title" v-model="open" width="700px" append-to-body>
      <el-form ref="batchRef" :model="form" :rules="rules" label-width="120px">
        <el-form-item label="批次名称" prop="batchName">
          <el-input v-model="form.batchName" placeholder="请输入批次名称" />
        </el-form-item>
        <el-form-item label="种植种质" prop="classId">
          <el-select v-model="form.classId" placeholder="请选择种植种质" clearable style="width: 100%">
            <el-option
              v-for="item in classOptions"
              :key="item.classId"
              :label="item.className"
              :value="item.classId"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="所属温室" prop="pastureId">
          <el-select v-model="form.pastureId" placeholder="请选择所属温室" clearable style="width: 100%">
            <el-option
              v-for="item in pastureOptions"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="种植面积(亩)" prop="cropArea">
          <el-input-number v-model="form.cropArea" :min="0" :precision="2" style="width: 100%" />
        </el-form-item>
        <el-form-item label="负责人" prop="responsiblePersonId">
          <el-select v-model="form.responsiblePersonId" placeholder="请选择负责人" clearable style="width: 100%">
            <el-option
              v-for="item in userOptions"
              :key="item.userId"
              :label="item.nickName"
              :value="item.userId"
            />
          </el-select>
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
import { AgricultureClassService } from '@/api/agriculture/classApi'
import { AgriculturePastureService } from '@/api/agriculture/pastureApi'
import { UserService } from '@/api/system/userApi'
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
const searchFormRef = ref<FormInstance>()
const batchRef = ref<FormInstance>()
const classOptions = ref<any[]>([])
const pastureOptions = ref<any[]>([])
const userOptions = ref<any[]>([])

const columns = reactive([
  { name: '批次ID', show: true },
  { name: '批次名称', show: true },
  { name: '种质', show: true },
  { name: '所属温室', show: true },
  { name: '种植面积(亩)', show: true },
  { name: '负责人', show: true },
  { name: '开始时间', show: true },
  { name: '状态', show: true },
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
  batchId: null,
  batchName: '',
  classId: undefined as number | undefined,
  pastureId: undefined as number | undefined,
  cropArea: 0,
  responsiblePersonId: undefined as number | undefined,
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
  classId: [{ required: true, message: '种植种质不能为空', trigger: 'change' }],
  pastureId: [{ required: true, message: '所属温室不能为空', trigger: 'change' }],
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

/** 获取种植列表 */
const getClassList = async () => {
  const res = await AgricultureClassService.listClass({})
  if (res.code === 200) {
    classOptions.value = res.rows || []
  }
}

/** 获取温室列表 */
const getPastureList = async () => {
  const res = await AgriculturePastureService.listPasture({ pageNum: 1, pageSize: 1000 })
  if (res.code === 200) {
    pastureOptions.value = res.rows || []
  }
}

/** 获取用户列表 */
const getUserList = async () => {
  try {
    // 先查询第一页，获取总数
    const firstRes = await UserService.listUser({ pageNum: 1, pageSize: 100 })
    if (firstRes.code === 200) {
      const total = firstRes.total || 0
      const firstPageRows = firstRes.rows || []
      
      // 如果总数小于等于100，直接使用第一页数据
      if (total <= 100) {
        userOptions.value = firstPageRows
        return
      }
      
      // 如果总数大于100，需要分页查询所有数据
      const allUsers = [...firstPageRows]
      const totalPages = Math.ceil(total / 100)
      
      // 并发查询剩余页
      const promises = []
      for (let page = 2; page <= totalPages; page++) {
        promises.push(UserService.listUser({ pageNum: page, pageSize: 100 }))
      }
      
      const results = await Promise.all(promises)
      results.forEach((res: any) => {
        if (res.code === 200 && res.rows) {
          allUsers.push(...res.rows)
        }
      })
      
      userOptions.value = allUsers
    }
  } catch (error) {
    console.error('获取用户列表失败:', error)
    ElMessage.error('获取用户列表失败')
  }
}

// 初始化
onMounted(() => {
  getList()
  getClassList()
  getPastureList()
  getUserList()
})
</script>

<style lang="scss" scoped>
.page-content {
  padding: 20px;
}
</style>

