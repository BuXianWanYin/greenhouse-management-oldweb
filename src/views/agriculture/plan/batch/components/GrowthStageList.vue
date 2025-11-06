<template>
  <div class="growth-stage-list">
    <div class="toolbar">
      <el-button type="primary" @click="handleAdd" v-auth="['agriculture:growthstage:add']">
        <el-icon><Plus /></el-icon>新增
      </el-button>
    </div>
    <el-table :data="stageList" border v-loading="loading">
      <el-table-column label="阶段ID" prop="stageId" width="100" />
      <el-table-column label="阶段类型" prop="stageType" width="120" />
      <el-table-column label="阶段名称" prop="stageName" min-width="150" />
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
      <el-table-column label="操作" width="150" align="center" fixed="right">
        <template #default="scope">
          <el-button link type="primary" @click="handleUpdate(scope.row)" v-auth="['agriculture:growthstage:edit']">
            修改
          </el-button>
          <el-button link type="danger" @click="handleDelete(scope.row)" v-auth="['agriculture:growthstage:remove']">
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import { AgricultureGrowthStageService } from '@/api/agriculture/growthStageApi'
import { AgricultureGrowthStageResult } from '@/types/agriculture/growthStage'

const props = defineProps({
  batchId: {
    type: [String, Number],
    required: true
  }
})

const stageList = ref<AgricultureGrowthStageResult[]>([])
const loading = ref(false)

const queryParams = reactive({
  pageNum: 1,
  pageSize: 100,
  batchId: props.batchId
})

/** 获取生长阶段列表 */
const getList = async () => {
  loading.value = true
  try {
    const res = await AgricultureGrowthStageService.listStage(queryParams)
    if (res.code === 200) {
      stageList.value = res.rows
    }
  } catch (error) {
    ElMessage.error('获取生长阶段列表失败')
  } finally {
    loading.value = false
  }
}

const handleAdd = () => {
  ElMessage.info('新增功能待实现')
}

const handleUpdate = (row: AgricultureGrowthStageResult) => {
  ElMessage.info('修改功能待实现')
}

const handleDelete = async (row: AgricultureGrowthStageResult) => {
  await ElMessageBox.confirm('是否确认删除？', '系统提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
    .then(async () => {
      const res = await AgricultureGrowthStageService.deleteStage(row.stageId)
      if (res.code === 200) {
        ElMessage.success(res.msg)
        getList()
      }
    })
    .catch(() => {})
}

watch(() => props.batchId, () => {
  queryParams.batchId = props.batchId
  getList()
})

onMounted(() => {
  getList()
})
</script>

<style lang="scss" scoped>
.growth-stage-list {
  padding: 20px;
}

.toolbar {
  margin-bottom: 20px;
}
</style>

