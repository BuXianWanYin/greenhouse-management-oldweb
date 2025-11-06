<template>
  <div class="page-content">
    <!-- 搜索栏开始 -->
    <el-form :model="queryParams" ref="queryRef" label-width="100px">
      <el-row :gutter="20" class="search-row">
        <el-col :xs="24" :sm="12" :md="8" :lg="5" :xl="4">
          <el-form-item label="节点名称" prop="nodeName">
            <el-input placeholder="请输入节点名称" v-model="queryParams.nodeName" @keyup.enter="handleQuery">
              <template #prefix>
                <el-icon><Document /></el-icon>
              </template>
            </el-input>
          </el-form-item>
        </el-col>
        <el-col :xs="24" :sm="12" :md="8" :lg="5" :xl="4">
          <el-form-item label="节点状态" prop="nodeStatus">
            <el-select v-model="queryParams.nodeStatus" placeholder="请选择状态" clearable style="width: 100%">
              <el-option label="未开始" value="0" />
              <el-option label="进行中" value="1" />
              <el-option label="已完成" value="2" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :xs="24" :sm="12" :md="8" :lg="5" :xl="4">
          <el-form-item label="提醒状态" prop="remindStatus">
            <el-select v-model="queryParams.remindStatus" placeholder="请选择提醒状态" clearable style="width: 100%">
              <el-option label="未提醒" value="0" />
              <el-option label="已提醒" value="1" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :xs="24" :sm="24" :md="24" :lg="9" :xl="12" class="button-col">
          <el-form-item>
            <el-button type="primary" @click="handleQuery" v-ripple>
              <el-icon><Search /></el-icon>搜索
            </el-button>
            <el-button type="info" @click="resetForm(queryRef)" v-ripple>
              <el-icon><Refresh /></el-icon>重置
            </el-button>
            <el-button type="success" @click="handleAdd" v-auth="['agriculture:growthnode:add']" v-ripple>
              <el-icon><Plus /></el-icon>新增
            </el-button>
            <el-button type="warning" @click="handleExport" v-auth="['agriculture:growthnode:export']" v-ripple>
              <el-icon><Download /></el-icon>导出
            </el-button>
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
    <!-- 搜索栏结束 -->

    <!-- 表格 -->
    <el-table v-loading="loading" :data="nodeList" border>
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="节点ID" prop="nodeId" width="100" />
      <el-table-column label="批次ID" prop="batchId" width="100" />
      <el-table-column label="节点类型" prop="nodeType" width="120" align="center" />
      <el-table-column label="节点名称" prop="nodeName" min-width="150" show-overflow-tooltip />
      <el-table-column label="预期日期" prop="expectedDate" width="120" align="center" />
      <el-table-column label="实际日期" prop="actualDate" width="120" align="center" />
      <el-table-column label="提醒天数" prop="remindDays" width="100" align="center" />
      <el-table-column label="提醒状态" prop="remindStatus" width="100" align="center">
        <template #default="scope">
          <el-tag v-if="scope.row.remindStatus === '0'" type="info">未提醒</el-tag>
          <el-tag v-else-if="scope.row.remindStatus === '1'" type="success">已提醒</el-tag>
          <el-tag v-else>{{ scope.row.remindStatus }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="节点状态" prop="nodeStatus" width="100" align="center">
        <template #default="scope">
          <el-tag v-if="scope.row.nodeStatus === '0'" type="info">未开始</el-tag>
          <el-tag v-else-if="scope.row.nodeStatus === '1'" type="success">进行中</el-tag>
          <el-tag v-else-if="scope.row.nodeStatus === '2'" type="warning">已完成</el-tag>
          <el-tag v-else>{{ scope.row.nodeStatus }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="创建时间" prop="createTime" width="180" align="center" />
      <el-table-column label="操作" width="200" align="center" fixed="right">
        <template #default="scope">
          <el-button link type="primary" @click="handleUpdate(scope.row)" v-auth="['agriculture:growthnode:edit']">
            <el-icon><EditPen /></el-icon>修改
          </el-button>
          <el-button link type="danger" @click="handleDelete(scope.row)" v-auth="['agriculture:growthnode:remove']">
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

    <!-- 添加或修改生长关键节点对话框 -->
    <el-dialog :title="title" v-model="open" width="700px" append-to-body>
      <el-form ref="nodeRef" :model="form" :rules="rules" label-width="120px">
        <el-form-item label="批次ID" prop="batchId">
          <el-input v-model="form.batchId" placeholder="请输入批次ID" />
        </el-form-item>
        <el-form-item label="节点类型" prop="nodeType">
          <el-input v-model="form.nodeType" placeholder="请输入节点类型（如：播种、移栽、开花、结果、收获）" />
        </el-form-item>
        <el-form-item label="节点名称" prop="nodeName">
          <el-input v-model="form.nodeName" placeholder="请输入节点名称" />
        </el-form-item>
        <el-form-item label="预期日期" prop="expectedDate">
          <el-date-picker
            v-model="form.expectedDate"
            type="date"
            placeholder="选择预期日期"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="实际日期" prop="actualDate">
          <el-date-picker
            v-model="form.actualDate"
            type="date"
            placeholder="选择实际日期"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="提醒天数" prop="remindDays">
          <el-input-number v-model="form.remindDays" :min="0" placeholder="提前提醒天数" style="width: 100%" />
        </el-form-item>
        <el-form-item label="提醒状态" prop="remindStatus">
          <el-select v-model="form.remindStatus" placeholder="请选择提醒状态" style="width: 100%">
            <el-option label="未提醒" value="0" />
            <el-option label="已提醒" value="1" />
          </el-select>
        </el-form-item>
        <el-form-item label="节点状态" prop="nodeStatus">
          <el-select v-model="form.nodeStatus" placeholder="请选择状态" style="width: 100%">
            <el-option label="未开始" value="0" />
            <el-option label="进行中" value="1" />
            <el-option label="已完成" value="2" />
          </el-select>
        </el-form-item>
        <el-form-item label="节点描述" prop="nodeDescription">
          <el-input v-model="form.nodeDescription" type="textarea" :rows="4" placeholder="请输入节点描述" />
        </el-form-item>
        <el-form-item label="节点图片" prop="nodeImages">
          <el-input v-model="form.nodeImages" placeholder="请输入图片URL（多个用逗号分隔）" />
        </el-form-item>
        <el-form-item label="节点视频" prop="nodeVideos">
          <el-input v-model="form.nodeVideos" placeholder="请输入视频URL（多个用逗号分隔）" />
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
import { AgricultureGrowthNodeService } from '@/api/agriculture/growthNodeApi'
import { ref, reactive, onMounted } from 'vue'
import { resetForm } from '@/utils/utils'
import { ElMessage, ElMessageBox } from 'element-plus'
import { FormInstance } from 'element-plus'
import { AgricultureGrowthNodeResult } from '@/types/agriculture/growthNode'
import { downloadExcel } from '@/utils/utils'

const nodeList = ref<AgricultureGrowthNodeResult[]>([])
const open = ref(false)
const loading = ref(true)
const total = ref(0)
const title = ref('')
const queryRef = ref()
const nodeRef = ref<FormInstance>()

const initialFormState = {
  nodeId: null,
  batchId: '',
  nodeType: '',
  nodeName: '',
  expectedDate: '',
  actualDate: '',
  remindDays: 0,
  remindStatus: '',
  nodeStatus: '',
  nodeDescription: '',
  nodeImages: '',
  nodeVideos: '',
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
  nodeName: '',
  nodeStatus: '',
  remindStatus: ''
})

const rules = reactive({
  batchId: [{ required: true, message: '批次ID不能为空', trigger: 'blur' }],
  nodeName: [{ required: true, message: '节点名称不能为空', trigger: 'blur' }],
  nodeType: [{ required: true, message: '节点类型不能为空', trigger: 'blur' }],
  expectedDate: [{ required: true, message: '预期日期不能为空', trigger: 'change' }],
  nodeStatus: [{ required: true, message: '节点状态不能为空', trigger: 'change' }]
})

/** 查询生长关键节点列表 */
const getList = async () => {
  loading.value = true
  const res = await AgricultureGrowthNodeService.listNode(queryParams)
  if (res.code === 200) {
    nodeList.value = res.rows
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
  title.value = '添加生长关键节点'
}

/** 修改按钮操作 */
const handleUpdate = async (row: AgricultureGrowthNodeResult) => {
  reset()
  open.value = true
  title.value = '修改生长关键节点'
  const res = await AgricultureGrowthNodeService.getNode(row.nodeId)
  if (res.code === 200) {
    Object.assign(form, res.data)
  }
}

/** 提交按钮 */
const submitForm = async () => {
  if (!nodeRef.value) return
  await nodeRef.value.validate(async (valid) => {
    if (valid) {
      if (form.nodeId) {
        const res = await AgricultureGrowthNodeService.updateNode(form)
        if (res.code === 200) {
          ElMessage.success(res.msg)
          open.value = false
          getList()
        }
      } else {
        const res = await AgricultureGrowthNodeService.addNode(form)
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
const handleDelete = async (row: AgricultureGrowthNodeResult) => {
  await ElMessageBox.confirm('是否确认删除生长关键节点编号为"' + row.nodeId + '"的数据项？', '系统提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
    .then(async () => {
      const res = await AgricultureGrowthNodeService.deleteNode(row.nodeId)
      if (res.code === 200) {
        getList()
        ElMessage.success(res.msg)
      }
    })
    .catch(() => {})
}

/** 导出按钮操作 */
const handleExport = () => {
  downloadExcel(AgricultureGrowthNodeService.exportExcel(queryParams))
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

