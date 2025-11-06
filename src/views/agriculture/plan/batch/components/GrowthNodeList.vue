<template>
  <div class="growth-node-list">
    <div class="toolbar">
      <el-button type="primary" @click="handleAdd" v-auth="['agriculture:growthnode:add']">
        <el-icon><Plus /></el-icon>新增
      </el-button>
    </div>
    <el-table :data="nodeList" border v-loading="loading">
      <el-table-column label="节点ID" prop="nodeId" width="100" />
      <el-table-column label="节点类型" prop="nodeType" width="120" />
      <el-table-column label="节点名称" prop="nodeName" min-width="150" />
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
      <el-table-column label="操作" width="150" align="center" fixed="right">
        <template #default="scope">
          <el-button link type="primary" @click="handleUpdate(scope.row)" v-auth="['agriculture:growthnode:edit']">
            修改
          </el-button>
          <el-button link type="danger" @click="handleDelete(scope.row)" v-auth="['agriculture:growthnode:remove']">
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
import { AgricultureGrowthNodeService } from '@/api/agriculture/growthNodeApi'
import { AgricultureGrowthNodeResult } from '@/types/agriculture/growthNode'

const props = defineProps({
  batchId: {
    type: [String, Number],
    required: true
  }
})

const nodeList = ref<AgricultureGrowthNodeResult[]>([])
const loading = ref(false)

const queryParams = reactive({
  pageNum: 1,
  pageSize: 100,
  batchId: props.batchId
})

/** 获取生长关键节点列表 */
const getList = async () => {
  loading.value = true
  try {
    const res = await AgricultureGrowthNodeService.listNode(queryParams)
    if (res.code === 200) {
      nodeList.value = res.rows
    }
  } catch (error) {
    ElMessage.error('获取生长关键节点列表失败')
  } finally {
    loading.value = false
  }
}

const handleAdd = () => {
  ElMessage.info('新增功能待实现')
}

const handleUpdate = (row: AgricultureGrowthNodeResult) => {
  ElMessage.info('修改功能待实现')
}

const handleDelete = async (row: AgricultureGrowthNodeResult) => {
  await ElMessageBox.confirm('是否确认删除？', '系统提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
    .then(async () => {
      const res = await AgricultureGrowthNodeService.deleteNode(row.nodeId)
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
.growth-node-list {
  padding: 20px;
}

.toolbar {
  margin-bottom: 20px;
}
</style>

