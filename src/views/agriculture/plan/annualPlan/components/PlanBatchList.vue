<template>
  <div class="plan-batch-list">
    <div class="toolbar">
      <el-button type="primary" @click="handleAddBatch" v-auth="['agriculture:planbatch:add']">
        <el-icon><Plus /></el-icon>添加批次到计划
      </el-button>
      <el-button type="success" @click="handleCreateBatch" v-auth="['agriculture:batch:add']">
        <el-icon><Plus /></el-icon>创建新批次
      </el-button>
    </div>
    <el-table :data="batchList" border v-loading="loading">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="关联ID" prop="id" width="100" />
      <el-table-column label="批次ID" prop="batchId" width="100" />
      <el-table-column label="批次名称" prop="batchName" min-width="150" />
      <el-table-column label="操作" width="200" align="center" fixed="right">
        <template #default="scope">
          <el-button link type="primary" @click="handleViewBatch(scope.row)" v-auth="['agriculture:batch:query']">
            <el-icon><View /></el-icon>查看批次
          </el-button>
          <el-button link type="danger" @click="handleDelete(scope.row)" v-auth="['agriculture:planbatch:remove']">
            <el-icon><Delete /></el-icon>移除
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

    <!-- 添加批次到计划对话框 -->
    <el-dialog title="添加批次到计划" v-model="addBatchOpen" width="500px" append-to-body>
      <el-form ref="addBatchRef" :model="addBatchForm" :rules="addBatchRules" label-width="100px">
        <el-form-item label="批次ID" prop="batchId">
          <el-input-number v-model="addBatchForm.batchId" :min="1" placeholder="请输入批次ID" style="width: 100%" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitAddBatch">确 定</el-button>
          <el-button @click="addBatchOpen = false">取 消</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { FormInstance } from 'element-plus'
import { Plus, View, Delete } from '@element-plus/icons-vue'
import { AgriculturePlanBatchService } from '@/api/agriculture/planBatchApi'
import { AgriculturePlanBatchResult } from '@/types/agriculture/planBatch'
import { AgricultureCropBatchService } from '@/api/agriculture/cropBatchApi'

const emit = defineEmits(['refresh'])

const props = defineProps({
  planId: {
    type: String,
    required: true
  }
})

const router = useRouter()
const batchList = ref<any[]>([])
const loading = ref(false)
const total = ref(0)
const addBatchOpen = ref(false)
const addBatchRef = ref<FormInstance>()

const queryParams = reactive({
  pageNum: 1,
  pageSize: 10,
  planId: props.planId
})

const addBatchForm = reactive({
  planId: props.planId,
  batchId: null
})

const addBatchRules = reactive({
  batchId: [{ required: true, message: '批次ID不能为空', trigger: 'blur' }]
})

/** 获取关联批次列表 */
const getList = async () => {
  loading.value = true
  try {
    const res = await AgriculturePlanBatchService.listBatch(queryParams)
    if (res.code === 200) {
      // 需要根据batchId获取批次详细信息
      const batchIds = res.rows.map((item: AgriculturePlanBatchResult) => item.batchId)
      if (batchIds.length > 0) {
        const batchRes = await AgricultureCropBatchService.listBatch({ batchIds: batchIds.join(',') })
        if (batchRes.code === 200) {
          batchList.value = res.rows.map((item: AgriculturePlanBatchResult) => {
            const batch = batchRes.rows.find((b: any) => b.batchId == item.batchId)
            return {
              ...item,
              batchName: batch?.batchName || '--'
            }
          })
        } else {
          batchList.value = res.rows
        }
      } else {
        batchList.value = res.rows
      }
      total.value = res.total
    }
  } catch (error) {
    ElMessage.error('获取关联批次列表失败')
  } finally {
    loading.value = false
  }
}

const handleSizeChange = (size: number) => {
  queryParams.pageSize = size
  getList()
}

const handleCurrentChange = (page: number) => {
  queryParams.pageNum = page
  getList()
}

const handleAddBatch = () => {
  addBatchOpen.value = true
}

const handleCreateBatch = () => {
  router.push({
    path: '/agriculture/plan/batch',
    query: { create: 'true' }
  })
}

const handleViewBatch = (row: any) => {
  router.push({
    path: '/agriculture/plan/batch/detail',
    query: { batchId: row.batchId }
  })
}

const submitAddBatch = async () => {
  if (!addBatchRef.value) return
  await addBatchRef.value.validate(async (valid) => {
    if (valid) {
      const res = await AgriculturePlanBatchService.addBatch(addBatchForm)
      if (res.code === 200) {
        ElMessage.success(res.msg)
        addBatchOpen.value = false
        addBatchForm.batchId = null
        getList()
        emit('refresh')
      }
    }
  })
}

const handleDelete = async (row: AgriculturePlanBatchResult) => {
  await ElMessageBox.confirm('是否确认移除该批次？', '系统提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
    .then(async () => {
      const res = await AgriculturePlanBatchService.deleteBatch(row.id)
      if (res.code === 200) {
        ElMessage.success(res.msg)
        getList()
        emit('refresh')
      }
    })
    .catch(() => {})
}

watch(() => props.planId, () => {
  queryParams.planId = props.planId
  getList()
})

onMounted(() => {
  getList()
})
</script>

<style lang="scss" scoped>
.plan-batch-list {
  padding: 20px;
}

.toolbar {
  margin-bottom: 20px;
  display: flex;
  gap: 10px;
}
</style>

