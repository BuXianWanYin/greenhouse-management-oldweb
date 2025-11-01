<template>
  <div class="app-container-gray">
    <el-row class="box">
      <el-col :span="4" class="left">
        <search-menu 
          title="分区任务" 
          :fun="fetchBatchList"    
          search-parma="batchName" 
          search-placeholder="请输入批次名称" 
          key-name="batchId" 
          label-name="batchName"
          :active-menu="{
            isActive: true,
            name: 'batchId',
            value: ''
          }"
          @select="handleBatchSelect" 
        />
      </el-col>
      <el-col :span="20" class="right">
        <template v-if="currentBatchId">
          <task :batch-id="currentBatchId"></task>
        </template>
        <el-empty v-else description="暂无批次任务"></el-empty>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import Task from '../batch/Task.vue'
import SearchMenu from '../SearchMenu/index.vue'
import { AgricultureCropBatchService } from '@/api/agriculture/batchApi'

// 响应式状态
const currentBatchId = ref(null)

// 获取批次列表
const fetchBatchList = async () => {
  try {
    const res = await AgricultureCropBatchService.listBatch({ 
      pageNum: 1, 
      pageSize: 16 
    })
    return res
  } catch (error) {
    ElMessage.error('获取批次列表失败')
    console.error('获取批次列表失败:', error)
    return { rows: [] }
  }
}

// 初始化默认选择第一个批次
const initDefaultSelection = async () => {
  try {
    const res = await fetchBatchList()
    if (res.rows?.length > 0) {
      currentBatchId.value = Number(res.rows[0].batchId)
    }
  } catch (error) {
    console.error('初始化默认批次失败:', error)
  }
}

// 处理批次选择
const handleBatchSelect = (selectedBatch) => {
  // 格式化输出选中的批次数据
  console.log('选中的批次数据:', {
    批次ID: selectedBatch.batchId,
    批次名称: selectedBatch.batchName,
    批次负责人: selectedBatch.batchHead,
    合约地址: selectedBatch.contractAddress,
    种植面积: selectedBatch.cropArea,
    开始时间: selectedBatch.startTime,
    创建时间: selectedBatch.createTime,
    状态: selectedBatch.status,
    备注: selectedBatch.remark || '无'
  })

  currentBatchId.value = Number(selectedBatch.batchId)
}

// 组件挂载时初始化
onMounted(() => {
  initDefaultSelection()
})
</script>

<style lang="scss" scoped>
.box {
  padding: 15px;
  height: calc(100vh - 84px);
}

.left {
  background: #fff;
  border-radius: 10px 0 0 10px;
  height: 100%;
  overflow: hidden;
}

.right {
  background: #fff;
  height: 100%;
  border-radius: 0 10px 10px 0;
  border-left: 1px solid #eee;
  padding: 0 15px;
  overflow: auto;

  .el-empty {
    margin-top: 200px;
  }
}
</style>
