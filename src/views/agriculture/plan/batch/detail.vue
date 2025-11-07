<template>
  <div class="page-content">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>批次详情</span>
          <el-button type="primary" @click="handleEdit" v-if="batchInfo.batchId">
            <el-icon><EditPen /></el-icon>编辑
          </el-button>
        </div>
      </template>

      <el-tabs v-model="activeTab" v-loading="loading">
        <!-- 基本信息Tab -->
        <el-tab-pane name="basicInfo" label="基本信息">
          <template #label>
            <span class="custom-tabs-label">
              <el-icon><Document /></el-icon>
              <span>基本信息</span>
            </span>
          </template>
          <div class="info-container" v-if="batchInfo.batchId">
            <el-descriptions :column="2" border>
              <el-descriptions-item label="批次ID">{{ batchInfo.batchId }}</el-descriptions-item>
              <el-descriptions-item label="批次名称">{{ batchInfo.batchName }}</el-descriptions-item>
              <el-descriptions-item label="种质">{{ batchInfo.className || '--' }}</el-descriptions-item>
              <el-descriptions-item label="所属温室">{{ getPastureName(batchInfo.pastureId) }}</el-descriptions-item>
              <el-descriptions-item label="种植面积(亩)">{{ batchInfo.cropArea }}</el-descriptions-item>
              <el-descriptions-item label="负责人">{{ batchInfo.nickName || '--' }}</el-descriptions-item>
              <el-descriptions-item label="开始时间">{{ batchInfo.startTime || '--' }}</el-descriptions-item>
              <el-descriptions-item label="状态">
                <el-tag v-if="batchInfo.status === '0'" type="success">进行中</el-tag>
                <el-tag v-else-if="batchInfo.status === '1'" type="info">已完成</el-tag>
                <el-tag v-else-if="batchInfo.status === '2'" type="danger">已取消</el-tag>
                <el-tag v-else>{{ batchInfo.status }}</el-tag>
              </el-descriptions-item>
              <el-descriptions-item label="备注" :span="2">{{ batchInfo.remark || '--' }}</el-descriptions-item>
            </el-descriptions>
          </div>
          <el-empty v-else description="暂无数据" />
        </el-tab-pane>

        <!-- 批次任务Tab -->
        <el-tab-pane name="batchTask" label="批次任务">
          <template #label>
            <span class="custom-tabs-label">
              <el-icon><List /></el-icon>
              <span>批次任务</span>
            </span>
          </template>
          <batch-task-list :batch-id="Number(batchId)" :table-border="true" />
        </el-tab-pane>

        <!-- 生长阶段Tab -->
        <el-tab-pane name="growthStage" label="生长阶段">
          <template #label>
            <span class="custom-tabs-label">
              <el-icon><Calendar /></el-icon>
              <span>生长阶段</span>
            </span>
          </template>
          <growth-stage-list :batch-id="batchId" />
        </el-tab-pane>

        <!-- 生长关键节点Tab -->
        <el-tab-pane name="growthNode" label="生长关键节点">
          <template #label>
            <span class="custom-tabs-label">
              <el-icon><Flag /></el-icon>
              <span>生长关键节点</span>
            </span>
          </template>
          <growth-node-list :batch-id="batchId" />
        </el-tab-pane>
      </el-tabs>
    </el-card>

    <!-- 编辑批次对话框 -->
    <el-dialog title="编辑批次" v-model="editOpen" width="700px" append-to-body>
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
          <el-button @click="editOpen = false">取 消</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { FormInstance } from 'element-plus'
import { Document, EditPen, List, Calendar, Flag, Collection } from '@element-plus/icons-vue'
import { AgricultureCropBatchService } from '@/api/agriculture/cropBatchApi'
import { AgricultureClassService } from '@/api/agriculture/classApi'
import { AgriculturePastureService } from '@/api/agriculture/pastureApi'
import { UserService } from '@/api/system/userApi'
import { AgricultureCropBatchResult } from '@/types/agriculture/batch'
import BatchTaskList from '../batchTask/TaskList.vue'
import GrowthStageList from './components/GrowthStageList.vue'
import GrowthNodeList from './components/GrowthNodeList.vue'

const route = useRoute()
const router = useRouter()
const batchId = ref<string | number>(route.query.batchId as string || '')
const activeTab = ref('basicInfo')
const loading = ref(true)
const editOpen = ref(false)
const batchInfo = ref<AgricultureCropBatchResult>({} as AgricultureCropBatchResult)
const batchRef = ref<FormInstance>()
const classOptions = ref<any[]>([])
const pastureOptions = ref<any[]>([])
const userOptions = ref<any[]>([])

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

const rules = reactive({
  batchName: [{ required: true, message: '批次名称不能为空', trigger: 'blur' }],
  classId: [{ required: true, message: '种植种质不能为空', trigger: 'change' }],
  pastureId: [{ required: true, message: '所属温室不能为空', trigger: 'change' }],
  cropArea: [{ required: true, message: '种植面积不能为空', trigger: 'blur' }]
})

/** 获取批次详情 */
const getBatchInfo = async () => {
  if (!batchId.value) return
  loading.value = true
  try {
    const res = await AgricultureCropBatchService.getBatch(batchId.value)
    if (res.code === 200) {
      batchInfo.value = res.data
      Object.assign(form, res.data)
    }
  } catch (error) {
    ElMessage.error('获取批次详情失败')
  } finally {
    loading.value = false
  }
}

/** 编辑按钮操作 */
const handleEdit = () => {
  editOpen.value = true
}

/** 提交表单 */
const submitForm = async () => {
  if (!batchRef.value) return
  await batchRef.value.validate(async (valid) => {
    if (valid) {
      const res = await AgricultureCropBatchService.updateBatch(form)
      if (res.code === 200) {
        ElMessage.success(res.msg)
        editOpen.value = false
        getBatchInfo()
      }
    }
  })
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

/** 根据温室ID获取温室名称 */
const getPastureName = (pastureId: string | number | undefined) => {
  if (!pastureId) return '--'
  const found = pastureOptions.value.find((item: any) => String(item.id) === String(pastureId))
  return found ? found.name : pastureId
}

onMounted(() => {
  getBatchInfo()
  getClassList()
  getPastureList()
  getUserList()
})
</script>

<style lang="scss" scoped>
.page-content {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.info-container {
  padding: 20px;
}

.custom-tabs-label {
  display: flex;
  align-items: center;
  gap: 5px;
}
</style>

