<template>
  <!--
   用于登记和管理农资使用的数据
    -->
  <div class="padding-bottom-10">
      <el-alert
          title="登记农资使用"
          type="info"
          show-icon
          description="此处可以登记农资使用"
      >
      </el-alert>
      <el-table
          v-loading="loading"
          :data="usageList"
          class="margin-top-10"
      >
          <el-table-column label="农资名称" align="center" prop="resourceId">
              <template #default="{ row }">
                  {{ resourceInfoList.find(item => item.resourceId == row.resourceId)?.resourceName || '-' }}
              </template>
          </el-table-column>
          <el-table-column label="使用数量" align="center" prop="usageQuantity"/>
          <el-table-column label="计量单位" align="center" prop="measureUnit"/>
          <el-table-column
              label="使用日期"
              align="center"
              prop="usageDate"
              width="140"
          >
          <template #default="{ row }">
          <span>{{ parseTime(row.usageDate, "{y}-{m}-{d}") }}</span>
        </template>
          </el-table-column>
          <el-table-column label="使用类型" align="center" prop="usageType" width="120">
            <template #default="{ row }">
              <el-tag :type="row.usageType === '0' ? 'success' : 'warning'">
                {{ getUsageTypeLabel(row.usageType) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="状态" align="center" width="100">
            <template #default="{ row }">
              <el-tag :type="getStatusTagType(row.status)">
                {{ getStatusLabel(row.status, row.usageType) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作人员" align="center" prop="operator" width="120"/>
          <el-table-column
              label="操作"
              align="center"
              class-name="small-padding fixed-width"
          >
              <template #header>
                  <el-tag
                      v-if="!props.readonly"
                      @click="handleAdd"
                      v-hasPermi="['agriculture:resourceusage:add']"
                      class="cursor-pointer"
                  >新增
                  </el-tag>
              </template>
              <template #default="{ row }">
                  <el-button
                      v-if="!props.readonly && canReturn(row)"
                      size="small"
                      type="success"
                      link
                      icon="Check"
                      @click="handleReturn(row)"
                      v-hasPermi="['agriculture:resourceusage:edit']"
                  >归还
                  </el-button>
              </template>
          </el-table-column>
      </el-table>

      <pagination
          v-show="total > 0"
          :total="total"
          v-model:page="queryParams.pageNum"
          v-model:limit="queryParams.pageSize"
          @pagination="getList"
      />
      <!-- 添加或修改农资使用对话框 -->
      <el-dialog
          v-model="open"
          :title="title"
          width="500px"
          append-to-body
      >
          <el-form
              ref="formRef"
              :model="form"
              :rules="rules"
              label-width="100px"
          >
              <el-form-item label="农资名称" prop="resourceId">
                  <el-select
                      v-model="form.resourceId"
                      placeholder="请选择农资名称"
                      class="display-block"
                      @change="handleResourceChange"
                  >
                      <el-option
                          v-for="item in resourceInfoList"
                          :key="item.resourceId"
                          :label="item.resourceName"
                          :value="item.resourceId"
                      >
                      </el-option>
                  </el-select>
              </el-form-item>
              <el-form-item label="使用数量" prop="usageQuantity">
                  <el-input-number
                      v-model="form.usageQuantity"
                      :precision="0"
                      :step="1"
                      placeholder="请输入使用数量"
                      style="width: 100%"
                  />
              </el-form-item>
              <el-form-item label="计量单位" prop="measureUnit">
                  <el-input v-model="form.measureUnit" placeholder="请输入计量单位" disabled/>
              </el-form-item>
              <el-form-item label="使用日期" prop="usageDate">
                  <el-date-picker
                      v-model="form.usageDate"
                      type="date"
                      value-format="YYYY-MM-DD"
                      placeholder="选择使用日期"
                      class="w100"
                      clearable
                      :disabledDate="disableUsageDate"
                  >
                  </el-date-picker>
              </el-form-item>
              <el-form-item label="使用类型" prop="usageType">
                  <el-select v-model="form.usageType" placeholder="请选择使用类型" class="w100" :disabled="isUsageTypeDisabled">
                      <el-option
                        v-for="type in getTaskUsageTypes()"
                        :key="type.value"
                        :label="type.label"
                        :value="type.value"
                      />
                  </el-select>
                  <div v-if="isUsageTypeDisabled" class="usage-type-tip">
                      <el-text type="info" size="small">
                          {{ getSelectedResourceType() === '1' ? '机械类型农资只能选择"领用"，使用完毕后需要归还' : '' }}
                      </el-text>
                  </div>
              </el-form-item>
              <el-form-item label="操作人员" prop="operator">
                  <el-select v-model="form.operator" placeholder="请选择操作人员" class="w100" filterable>
                      <el-option
                        v-for="employee in props.taskEmployeeList"
                        :key="employee.userId"
                        :label="employee.nickName"
                        :value="employee.nickName"
                      />
                  </el-select>
              </el-form-item>
              <el-form-item label="备注" prop="remark">
                  <el-input v-model="form.remark" type="textarea" :rows="3" placeholder="请输入备注"/>
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
import { ref, reactive, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox, ElText } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { AgricultureResourceUsageService } from '@/api/agriculture/resourceUsageApi'
import { AgricultureTaskLogService } from "@/api/agriculture/logApi"
import { AgricultureResourceService } from "@/api/agriculture/resourceApi"
import { AgricultureCropBatchService } from "@/api/agriculture/cropBatchApi"
import { AgricultureCropBatchTaskService } from "@/api/agriculture/cropBatchTaskApi"
import { AgricultureResourceUsageResult } from '@/types/agriculture/resourceUsage'
import { parseTime } from '@/utils/utils'
import { UserResult } from '@/types/system/user'

interface ResourceInfo {
  resourceId: string
  resourceName: string
  measureUnit?: string
  resourceType?: string // 农资类型(0是物料,1是机械)
}

interface UsageForm {
  usageId: string | null
  resourceId: string
  batchId: string
  taskId: string
  usageQuantity: number | string
  measureUnit: string
  usageDate: string
  usageType: string
  operator: string
  remark: string
}

const props = defineProps({
  taskId: {
    type: [Number, String],
    required: true
  },
  currentUser: {
    type: Object,
    required: true
  },
  batchId: {
    type: [Number, String],
    default: null
  },
  taskEmployeeList: {
    type: Array as () => UserResult[],
    default: () => []
  },
  readonly: {
    type: Boolean,
    default: false
  }
})
const emit = defineEmits(['log'])

// 遮罩层
const loading = ref(true)
// 总条数
const total = ref(0)
// 农资使用记录表格数据
const usageList = ref<AgricultureResourceUsageResult[]>([])
const resourceInfoList = ref<ResourceInfo[]>([])
// 弹出层标题
const title = ref('')
// 是否显示弹出层
const open = ref(false)
// 表单ref
const formRef = ref<FormInstance>()

// 查询参数
const queryParams = reactive({
  pageNum: 1,
  pageSize: 10,
  taskId: props.taskId,
})

// 表单参数
const form = reactive<UsageForm>({
  usageId: null,
  resourceId: '',
  batchId: props.batchId ? props.batchId.toString() : '',
  taskId: props.taskId.toString(),
  usageQuantity: 0,
  measureUnit: '',
  usageDate: '',
  usageType: '',
  operator: '',
  remark: ''
})

// 表单校验
const rules = reactive<FormRules>({
  resourceId: [
    { required: true, message: '农资不能为空', trigger: 'change' },
  ],
  usageQuantity: [
    { required: true, message: '使用数量不能为空', trigger: 'blur' },
  ],
  usageDate: [
    { required: true, message: '使用日期不能为空', trigger: 'change' },
  ],
  usageType: [
    { required: true, message: '使用类型不能为空', trigger: 'change' },
  ],
})

/** 查询农资使用记录列表 */
const getList = async () => {
  loading.value = true
  try {
    const response = await AgricultureResourceUsageService.getUsageByTaskId(props.taskId)
    console.log('[CostMaterial] getList taskId=', props.taskId, 'response=', response)
    if (response.code === 200) {
      // 后端固定返回 data 数组
      const list = (response as any).data ?? []
      usageList.value = Array.isArray(list) ? list : []
      total.value = list.length ?? 0
      // 某些后端写入有延时，首次为空时延迟再拉一次
      if ((!usageList.value || usageList.value.length === 0) && !loading.value) {
        setTimeout(async () => {
          const r2 = await AgricultureResourceUsageService.getUsageByTaskId(props.taskId)
          console.log('[CostMaterial] retry getList response=', r2)
          if (r2.code === 200) {
            const list2 = (r2 as any).data ?? []
            usageList.value = Array.isArray(list2) ? list2 : []
            total.value = list2.length ?? 0
          }
        }, 400)
      }
    }
  } finally {
    loading.value = false
  }
}

/** 查询农资信息列表 */
const getResourceInfoList = async () => {
  const response = await AgricultureResourceService.listResource({ pageNum: 1, pageSize: 9999 })
  if (response.code === 200) {
    resourceInfoList.value = response.rows.map(item => ({
      resourceId: item.resourceId,
      resourceName: item.resourceName || '',
      measureUnit: item.measureUnit,
      resourceType: item.resourceType // 保存农资类型
    }))
  }
}

/** 农资选择变化时，自动填充计量单位和设置使用类型 */
const handleResourceChange = (resourceId: string) => {
  const resource = resourceInfoList.value.find(item => item.resourceId === resourceId)
  if (resource) {
    if (resource.measureUnit) {
      form.measureUnit = resource.measureUnit
    }
    // 根据农资类型自动设置使用类型
    // 机械类型(1) -> 领用(0)，物料类型(0) -> 消耗(1)
    if (resource.resourceType === '1') {
      form.usageType = '0' // 机械类型自动选择"领用"
    } else {
      form.usageType = '1' // 物料类型自动选择"消耗"
    }
  }
}

/** 计算使用类型是否禁用（机械类型禁用，因为只能领用） */
const isUsageTypeDisabled = computed(() => {
  const resource = resourceInfoList.value.find(item => item.resourceId === form.resourceId)
  return resource?.resourceType === '1' // 机械类型禁用选择
})

/** 获取选中农资的类型 */
const getSelectedResourceType = () => {
  const resource = resourceInfoList.value.find(item => item.resourceId === form.resourceId)
  return resource?.resourceType || ''
}

/** 判断是否可以归还（机械类型且状态为使用中） */
const canReturn = (row: AgricultureResourceUsageResult) => {
  // 必须是领用类型(0)
  if (row.usageType !== '0') return false

  // 检查是否是机械类型
  const resource = resourceInfoList.value.find(item => item.resourceId === row.resourceId)
  if (resource?.resourceType !== '1') return false

  // 状态为使用中(2)或未设置状态（兼容旧数据）
  // 如果status不存在或为空，且是机械类型领用，也允许归还
  if (!row.status || row.status === '' || row.status === '2') {
    return true
  }

  return false
}

/** 获取状态标签 */
const getStatusLabel = (status: string, usageType: string) => {
  // 如果是领用类型，状态2表示使用中（未归还）
  if (usageType === '0' && status === '2') {
    return '使用中'
  }
  // 如果是领用类型，状态0表示已归还
  if (usageType === '0' && status === '0') {
    return '已归还'
  }
  // 消耗类型，状态0表示正常
  if (usageType === '1' && status === '0') {
    return '已消耗'
  }
  // 已撤销
  if (status === '1') {
    return '已撤销'
  }
  return '正常'
}

/** 获取状态标签类型 */
const getStatusTagType = (status: string) => {
  if (status === '2') return 'warning' // 使用中
  if (status === '1') return 'danger' // 已撤销
  return 'success' // 正常/已归还
}

/** 根据农资ID获取农资名称 */
const getResourceName = (resourceId: string) => {
  const resource = resourceInfoList.value.find(item => item.resourceId === resourceId)
  return resource ? resource.resourceName : resourceId
}

/** 归还农资 */
const handleReturn = async (row: AgricultureResourceUsageResult) => {
  try {
    await ElMessageBox.confirm(
      `是否确认归还农资"${getResourceName(row.resourceId)}"？`,
      '确认归还',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    // 调用归还接口
    const response = await AgricultureResourceUsageService.returnUsage(row.usageId)
    if (response.code === 200) {
      ElMessage.success('归还成功')
      await addTaskLog(`归还农资 - ${getResourceName(row.resourceId)}`)
      await getList()
    } else {
      ElMessage.error(response.msg || '归还失败')
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('归还失败:', error)
      ElMessage.error('归还失败')
    }
  }
}

/** 添加任务日志 */
const addTaskLog = async (des: string) => {
  await AgricultureTaskLogService.addLog({
    taskId: props.taskId,
    operDes: des,
    operName: props.currentUser.userName,
    operId: props.currentUser.userId,
    createBy: props.currentUser.userId,
    updateBy: props.currentUser.userId
  })
  emit('log')
}

// 取消按钮
const cancel = () => {
  open.value = false
  reset()
}

// 表单重置
const reset = () => {
  form.usageId = null
  form.resourceId = ''
  // 重置时确保批次ID和任务ID正确设置
  form.batchId = props.batchId ? props.batchId.toString() : ''
  form.taskId = props.taskId.toString()
  form.usageQuantity = 0
  form.measureUnit = ''
  form.usageDate = ''
  form.usageType = ''
  form.operator = props.currentUser.userName || ''
  form.remark = ''
  formRef.value?.resetFields()
}

/** 获取使用类型标签 */
const getUsageTypeLabel = (usageType: string) => {
  const typeMap: Record<string, string> = {
    '0': '领用',
    '1': '消耗',
    '2': '入库'
  }
  return typeMap[usageType] || usageType
}

/** 获取任务中的使用类型选项（只包含领用和消耗，不包含入库） */
const getTaskUsageTypes = () => {
  return [
    { label: '领用 - 从库存中领取农资', value: '0' },
    { label: '消耗 - 在任务中消耗农资', value: '1' }
  ]
}

/** 新增按钮操作 */
const handleAdd = () => {
  reset()
  getResourceInfoList()
  open.value = true
  title.value = '添加农资使用'
  // 确保批次ID和任务ID正确设置
  form.batchId = props.batchId ? props.batchId.toString() : ''
  form.taskId = props.taskId.toString()
  // 默认操作人员为当前用户（如果当前用户在任务员工列表中）
  const currentUserInList = props.taskEmployeeList.find((emp: UserResult) => String(emp.userId) === String(props.currentUser.userId))
  form.operator = currentUserInList?.nickName || props.currentUser.userName || ''
  // 默认使用日期为今天
  form.usageDate = new Date().toISOString().split('T')[0]
  // 默认使用类型为消耗（任务中通常使用消耗），但会根据农资类型自动调整
  form.usageType = '1'
}

/** 修改按钮操作 */
const handleUpdate = async (row: AgricultureResourceUsageResult) => {
  reset()
  const usageId = row.usageId
  const response = await AgricultureResourceUsageService.getUsage(usageId)
  if (response.code === 200 && response.data) {
    // 处理日期格式（如果是datetime，只取日期部分）
    let usageDate = response.data.usageDate || ''
    if (usageDate && usageDate.includes(' ')) {
      usageDate = usageDate.split(' ')[0]
    }

    // 处理使用数量，确保是数字类型
    let usageQuantity: number = 0
    if (typeof response.data.usageQuantity === 'number') {
      usageQuantity = response.data.usageQuantity
    } else if (typeof response.data.usageQuantity === 'string') {
      usageQuantity = parseFloat(response.data.usageQuantity) || 0
    }

    Object.assign(form, {
      usageId: response.data.usageId,
      resourceId: response.data.resourceId,
      batchId: response.data.batchId || (props.batchId ? props.batchId.toString() : ''),
      taskId: response.data.taskId || props.taskId.toString(),
      usageQuantity: usageQuantity,
      measureUnit: response.data.measureUnit || '',
      usageDate: usageDate,
      usageType: response.data.usageType || '1',
      operator: response.data.operator || props.currentUser.userName || '',
      remark: response.data.remark || ''
    })
    getResourceInfoList()
    open.value = true
    title.value = '修改农资使用'
  }
}

/** 提交按钮 */
const submitForm = async () => {
  if (!formRef.value) return

  await formRef.value.validate(async (valid) => {
    if (valid) {
      try {
        // 获取农资类型，用于设置状态
        const resource = resourceInfoList.value.find(item => item.resourceId === form.resourceId)

        // 规范化使用日期为包含时分秒的格式
        const normalizedUsageDate = (() => {
          const dateStr = form.usageDate || ''
          if (!dateStr) return ''
          // 已包含时间则直接返回，否则补齐 00:00:00
          return dateStr.includes(' ') ? dateStr : `${dateStr} 00:00:00`
        })()

        // 若备注为空，自动生成：批次名-任务名 农资名称 使用
        const autoRemark = async () => {
          try {
            // 批次名称
            let batchName = ''
            const batchIdToUse = props.batchId ? String(props.batchId) : form.batchId
            if (batchIdToUse) {
              const res = await AgricultureCropBatchService.getBatch(batchIdToUse)
              batchName = res?.data?.batchName || ''
            }
            // 任务名称
            let taskName = ''
            if (props.taskId) {
              const res = await AgricultureCropBatchTaskService.getBatchTask(props.taskId as any)
              taskName = res?.data?.taskName || ''
            }
            // 农资名称
            const resourceName = resource?.resourceName || resourceInfoList.value.find(r => r.resourceId === form.resourceId)?.resourceName || ''
            const parts = [batchName, taskName].filter(Boolean).join('-')
            if (!parts && !resourceName) return ''
            return `${parts} ${resourceName} 使用`
          } catch {
            return ''
          }
        }

        // 确保batchId和taskId正确传递，优先使用props中的值
        const submitData = {
          ...form,
          usageDate: normalizedUsageDate,
          // 批次ID：优先使用props中的batchId，如果没有则使用form中的值
          batchId: props.batchId ? String(props.batchId) : (form.batchId || ''),
          // 任务ID：必须使用props中的taskId
          taskId: String(props.taskId),
          // 根据农资类型和使用类型设置状态
          // 机械类型+领用：status = '2'（使用中）
          // 其他：status = '0'（正常）
          status: (() => {
            if (resource?.resourceType === '1' && form.usageType === '0') {
              return '2' // 机械类型领用，状态为使用中
            }
            return '0' // 其他情况，状态为正常
          })(),
          remark: form.remark && String(form.remark).trim().length > 0 ? form.remark : await autoRemark(),
          // 统一为后端期望的类型
          resourceId: Number(form.resourceId),
          usageQuantity: Number(form.usageQuantity)
        }

        console.log('提交农资使用数据:', submitData)

        if (form.usageId) {
          await AgricultureResourceUsageService.updateUsage(submitData)
          const typeLabel = getUsageTypeLabel(form.usageType)
          ElMessage.success('修改成功')
          await addTaskLog(`修改农资使用 - ${typeLabel}`)
        } else {
          await AgricultureResourceUsageService.addUsage(submitData)
          const typeLabel = getUsageTypeLabel(form.usageType)
          ElMessage.success('新增成功')
          await addTaskLog(`新增农资使用 - ${typeLabel}`)
        }
        open.value = false
        await getList()
      } catch (error) {
        console.error('提交失败:', error)
        ElMessage.error('操作失败')
      }
    }
  })
}

/** 删除按钮操作 */
const handleDelete = async (row: AgricultureResourceUsageResult) => {
  const usageId = row.usageId
  try {
    await ElMessageBox.confirm(
      `是否确认删除农资使用记录编号为"${usageId}"的数据项？`,
      '警告'
    )
    await AgricultureResourceUsageService.deleteUsage(usageId)
    await getList()
    ElMessage.success('删除成功')
    await addTaskLog('删除农资使用')
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除失败:', error)
      ElMessage.error('删除失败')
    }
  }
}

// 日期限制函数 - 允许选择任意日期（包括今天和过去的日期）
const disableUsageDate = (time: Date) => {
  // 不限制日期选择，允许选择任意日期
  return false;
};

onMounted(() => {
  getList()
  getResourceInfoList()
})
</script>

<style scoped>
.padding-bottom-10 {
  padding-bottom: 10px;
}

.margin-top-10 {
  margin-top: 10px;
}

.display-block {
  display: block;
}

.w100 {
  width: 100%;
}

.cursor-pointer {
  cursor: pointer;
}

.usage-type-tip {
  margin-top: 4px;
  font-size: 12px;
}
</style>
