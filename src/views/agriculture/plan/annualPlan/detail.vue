<template>
  <div class="page-content">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>年度种植规划详情</span>
          <el-button type="primary" @click="handleEdit" v-if="planInfo.planId">
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
          <div class="info-container" v-if="planInfo.planId">
            <el-descriptions :column="2" border>
              <el-descriptions-item label="计划ID">{{ planInfo.planId }}</el-descriptions-item>
              <el-descriptions-item label="计划名称">{{ planInfo.planName }}</el-descriptions-item>
              <el-descriptions-item label="计划年份">{{ planInfo.planYear }}</el-descriptions-item>
              <el-descriptions-item label="计划类型">
                <el-tag v-if="planInfo.planType === '0'">年度计划</el-tag>
                <el-tag v-else-if="planInfo.planType === '1'" type="success">季度计划</el-tag>
                <el-tag v-else type="info">{{ planInfo.planType }}</el-tag>
              </el-descriptions-item>
              <el-descriptions-item label="计划状态">
                <el-tag v-if="planInfo.planStatus === '0'" type="success">进行中</el-tag>
                <el-tag v-else-if="planInfo.planStatus === '1'" type="info">已完成</el-tag>
                <el-tag v-else-if="planInfo.planStatus === '2'" type="danger">已取消</el-tag>
                <el-tag v-else>{{ planInfo.planStatus }}</el-tag>
              </el-descriptions-item>
              <el-descriptions-item label="开始日期">{{ planInfo.startDate || '--' }}</el-descriptions-item>
              <el-descriptions-item label="结束日期">{{ planInfo.endDate || '--' }}</el-descriptions-item>
              <el-descriptions-item label="总面积(亩)">{{ planInfo.totalArea || '--' }}</el-descriptions-item>
              <el-descriptions-item label="计划描述" :span="2">{{ planInfo.planDescription || '--' }}</el-descriptions-item>
              <el-descriptions-item label="备注" :span="2">{{ planInfo.remark || '--' }}</el-descriptions-item>
            </el-descriptions>
          </div>
          <el-empty v-else description="暂无数据" />
        </el-tab-pane>

        <!-- 关联批次列表Tab -->
        <el-tab-pane name="batchList" label="关联批次列表">
          <template #label>
            <span class="custom-tabs-label">
              <el-icon><List /></el-icon>
              <span>关联批次列表</span>
            </span>
          </template>
          <plan-batch-list :plan-id="planId" @refresh="getPlanInfo" />
        </el-tab-pane>
      </el-tabs>
    </el-card>

    <!-- 编辑计划对话框 -->
    <el-dialog title="编辑年度种植规划" v-model="editOpen" width="600px" append-to-body>
      <el-form ref="planRef" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="计划名称" prop="planName">
          <el-input v-model="form.planName" placeholder="请输入计划名称" />
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
        <el-form-item label="计划类型" prop="planType">
          <el-select v-model="form.planType" placeholder="请选择计划类型" style="width: 100%">
            <el-option label="年度计划" value="0" />
            <el-option label="季度计划" value="1" />
          </el-select>
        </el-form-item>
        <el-form-item label="计划状态" prop="planStatus">
          <el-select v-model="form.planStatus" placeholder="请选择状态" style="width: 100%">
            <el-option label="进行中" value="0" />
            <el-option label="已完成" value="1" />
            <el-option label="已取消" value="2" />
          </el-select>
        </el-form-item>
        <el-form-item label="开始日期" prop="startDate">
          <el-date-picker
            v-model="form.startDate"
            type="date"
            placeholder="选择开始日期"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="结束日期" prop="endDate">
          <el-date-picker
            v-model="form.endDate"
            type="date"
            placeholder="选择结束日期"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="总面积(亩)" prop="totalArea">
          <el-input-number v-model="form.totalArea" :min="0" :precision="2" style="width: 100%" />
        </el-form-item>
        <el-form-item label="计划描述" prop="planDescription">
          <el-input v-model="form.planDescription" type="textarea" :rows="4" placeholder="请输入计划描述" />
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
import { Document, EditPen, List } from '@element-plus/icons-vue'
import { AgricultureAnnualPlanService } from '@/api/agriculture/annualPlanApi'
import { AgricultureAnnualPlanResult } from '@/types/agriculture/annualplan'
import PlanBatchList from './components/PlanBatchList.vue'

const route = useRoute()
const planId = ref<string>(route.query.planId as string || '')
const activeTab = ref('basicInfo')
const loading = ref(true)
const editOpen = ref(false)
const planInfo = ref<AgricultureAnnualPlanResult>({} as AgricultureAnnualPlanResult)
const planRef = ref<FormInstance>()

const initialFormState = {
  planId: null,
  planYear: '',
  planName: '',
  pastureId: '',
  planType: '',
  planStatus: '',
  startDate: '',
  endDate: '',
  totalArea: '',
  planDescription: '',
  remark: ''
}

const form = reactive({ ...initialFormState })

const rules = reactive({
  planName: [{ required: true, message: '计划名称不能为空', trigger: 'blur' }],
  planYear: [{ required: true, message: '计划年份不能为空', trigger: 'change' }],
  planType: [{ required: true, message: '计划类型不能为空', trigger: 'change' }],
  planStatus: [{ required: true, message: '计划状态不能为空', trigger: 'change' }]
})

/** 获取计划详情 */
const getPlanInfo = async () => {
  if (!planId.value) return
  loading.value = true
  try {
    const res = await AgricultureAnnualPlanService.getPlan(planId.value)
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
      const res = await AgricultureAnnualPlanService.updatePlan(form)
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
</style>

