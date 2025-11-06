<template>
  <div class="page-content">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>轮作计划详情</span>
          <el-button type="primary" @click="handleEdit" v-if="planInfo.rotationId">
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
          <div class="info-container" v-if="planInfo.rotationId">
            <el-descriptions :column="2" border>
              <el-descriptions-item label="轮作ID">{{ planInfo.rotationId }}</el-descriptions-item>
              <el-descriptions-item label="轮作名称">{{ planInfo.rotationName }}</el-descriptions-item>
              <el-descriptions-item label="计划年份">{{ planInfo.planYear }}</el-descriptions-item>
              <el-descriptions-item label="轮作周期">{{ planInfo.rotationCycle || '--' }}</el-descriptions-item>
              <el-descriptions-item label="轮作状态">
                <el-tag v-if="planInfo.rotationStatus === '0'" type="success">进行中</el-tag>
                <el-tag v-else-if="planInfo.rotationStatus === '1'" type="info">已完成</el-tag>
                <el-tag v-else-if="planInfo.rotationStatus === '2'" type="danger">已取消</el-tag>
                <el-tag v-else>{{ planInfo.rotationStatus }}</el-tag>
              </el-descriptions-item>
              <el-descriptions-item label="轮作描述" :span="2">{{ planInfo.rotationDescription || '--' }}</el-descriptions-item>
              <el-descriptions-item label="备注" :span="2">{{ planInfo.remark || '--' }}</el-descriptions-item>
            </el-descriptions>
          </div>
          <el-empty v-else description="暂无数据" />
        </el-tab-pane>

        <!-- 轮作明细Tab -->
        <el-tab-pane name="rotationDetail" label="轮作明细">
          <template #label>
            <span class="custom-tabs-label">
              <el-icon><List /></el-icon>
              <span>轮作明细</span>
            </span>
          </template>
          <rotation-detail-list :rotation-id="rotationId" />
        </el-tab-pane>

        <!-- 关联批次列表Tab -->
        <el-tab-pane name="batchList" label="关联批次列表">
          <template #label>
            <span class="custom-tabs-label">
              <el-icon><Collection /></el-icon>
              <span>关联批次列表</span>
            </span>
          </template>
          <div class="batch-list-container">
            <el-alert type="info" :closable="false" style="margin-bottom: 20px;">
              轮作计划的关联批次列表功能待实现
            </el-alert>
          </div>
        </el-tab-pane>
      </el-tabs>
    </el-card>

    <!-- 编辑计划对话框 -->
    <el-dialog title="编辑轮作计划" v-model="editOpen" width="600px" append-to-body>
      <el-form ref="planRef" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="轮作名称" prop="rotationName">
          <el-input v-model="form.rotationName" placeholder="请输入轮作名称" />
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
        <el-form-item label="轮作周期" prop="rotationCycle">
          <el-input v-model="form.rotationCycle" placeholder="请输入轮作周期（如：3年一轮）" />
        </el-form-item>
        <el-form-item label="轮作状态" prop="rotationStatus">
          <el-select v-model="form.rotationStatus" placeholder="请选择状态" style="width: 100%">
            <el-option label="进行中" value="0" />
            <el-option label="已完成" value="1" />
            <el-option label="已取消" value="2" />
          </el-select>
        </el-form-item>
        <el-form-item label="轮作描述" prop="rotationDescription">
          <el-input v-model="form.rotationDescription" type="textarea" :rows="4" placeholder="请输入轮作描述" />
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="form.remark" type="textarea" :rows="2" placeholder="请输入备注" />
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
import { useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { FormInstance } from 'element-plus'
import { Document, EditPen, List, Collection } from '@element-plus/icons-vue'
import { AgricultureRotationPlanService } from '@/api/agriculture/rotationPlanApi'
import { AgricultureRotationPlanResult } from '@/types/agriculture/rotationPlan'
import RotationDetailList from './components/RotationDetailList.vue'

const route = useRoute()
const rotationId = ref<string>(route.query.rotationId as string || '')
const activeTab = ref('basicInfo')
const loading = ref(true)
const editOpen = ref(false)
const planInfo = ref<AgricultureRotationPlanResult>({} as AgricultureRotationPlanResult)
const planRef = ref<FormInstance>()

const initialFormState = {
  rotationId: null,
  rotationName: '',
  planYear: '',
  pastureId: '',
  rotationCycle: '',
  rotationDescription: '',
  rotationStatus: '',
  remark: ''
}

const form = reactive({ ...initialFormState })

const rules = reactive({
  rotationName: [{ required: true, message: '轮作名称不能为空', trigger: 'blur' }],
  planYear: [{ required: true, message: '计划年份不能为空', trigger: 'change' }],
  rotationStatus: [{ required: true, message: '轮作状态不能为空', trigger: 'change' }]
})

/** 获取计划详情 */
const getPlanInfo = async () => {
  if (!rotationId.value) return
  loading.value = true
  try {
    const res = await AgricultureRotationPlanService.getPlan(rotationId.value)
    if (res.code === 200) {
      planInfo.value = res.data
      Object.assign(form, res.data)
    }
  } catch (error) {
    ElMessage.error('获取计划详情失败')
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
  if (!planRef.value) return
  await planRef.value.validate(async (valid) => {
    if (valid) {
      const res = await AgricultureRotationPlanService.updatePlan(form)
      if (res.code === 200) {
        ElMessage.success(res.msg)
        editOpen.value = false
        getPlanInfo()
      }
    }
  })
}

onMounted(() => {
  getPlanInfo()
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

.batch-list-container {
  padding: 20px;
}
</style>

