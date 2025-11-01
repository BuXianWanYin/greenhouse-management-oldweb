<template>
  <div class="padding-bottom-10">
    <el-alert
      title="登记人工工时"
      type="info"
      show-icon
      description="此处可以按照每个用工登记工时"
    />
    <el-table
      v-loading="loading"
      :data="costEmployeeList"
      class="margin-top-10"
    >
      <el-table-column label="雇员" align="center" prop="employeeId">
        <template #default="{ row }">
          {{ taskEmployeeList.find(item => item.employeeId == row.employeeId)?.employeeName }}
        </template>
      </el-table-column>
      <el-table-column label="工时" align="center" prop="workingHours" />
      <el-table-column
        label="开始日期"
        align="center"
        prop="workingStart"
        width="180"
      >
        <template #default="{ row }">
          <span>{{ parseTime(row.workingStart, "{y}-{m}-{d}") }}</span>
        </template>
      </el-table-column>
      <el-table-column
        label="结束日期"
        align="center"
        prop="workingFinish"
        width="180"
      >
        <template #default="{ row }">
          <span>{{ parseTime(row.workingFinish, "{y}-{m}-{d}") }}</span>
        </template>
      </el-table-column>
      <el-table-column
        label="操作"
        align="center"
        class-name="small-padding fixed-width"
      >
        <template #header>
          <el-tag
            @click="handleAdd"
            v-hasPermi="['agriculture:costEmployee:add']"
            class="cursor-pointer"
          >新增</el-tag>
        </template>
        <template #default="{ row }">
          <el-button
            size="small"
            type="primary"
            link
            icon="Edit"
            @click="handleUpdate(row)"
            v-hasPermi="['agriculture:costEmployee:edit']"
          >修改</el-button>
          <el-button
            size="small"
            type="primary"
            link
            icon="Delete"
            @click="handleDelete(row)"
            v-hasPermi="['agriculture:costEmployee:remove']"
          >删除</el-button>
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

    <!-- 添加或修改人工工时对话框 -->
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
        label-width="80px"
      >
        <el-form-item label="雇员" prop="employeeId">
          <el-select
            v-model="form.employeeId"
            class="display-block"
            placeholder="请选择雇员"
            clearable
            filterable
          >
            <el-option
              v-for="item in taskEmployeeList"
              :key="item.employeeId"
              :label="item.employeeName"
              :value="item.employeeId"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="工时" prop="workingHours">
          <el-input v-model="form.workingHours" placeholder="请输入工时">
            <template #append>天</template>
          </el-input>
        </el-form-item>
        <el-form-item label="开始日期" prop="workingStart">
          <el-date-picker
            v-model="form.workingStart"
            class="w100"
            type="date"
            value-format="YYYY-MM-DD"
            placeholder="选择开始日期"
            clearable
            :disabledDate="disableWorkingStartDate"
          />
        </el-form-item>
        <el-form-item label="结束日期" prop="workingFinish">
          <el-date-picker
            v-model="form.workingFinish"
            class="w100"
            type="date"
            value-format="YYYY-MM-DD"
            placeholder="选择结束日期"
            clearable
            :disabledDate="disableWorkingFinishDate"
          />
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
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { AgricultureCostEmployeeService } from "@/api/agriculture/costEmployeeApi"
import { AgricultureTaskLogService } from "@/api/agriculture/logApi"
import { AgricultureEmployeeService } from "@/api/agriculture/employeeApi"
import { AgricultureCostEmployeeResult } from '@/types/agriculture/costEmployee'
import { AgricultureEmployeeResult } from '@/types/agriculture/employee'
import { parseTime } from '@/utils/utils'

const props = defineProps<{
  taskId: number | string,
  taskEmployeeList: AgricultureEmployeeResult[],
  currentUser: { userId: string | number, userName: string }
}>()

const emit = defineEmits(['log'])

// 遮罩层
const loading = ref(true)
// 总条数
const total = ref(0)
// 人工工时表格数据
const costEmployeeList = ref<AgricultureCostEmployeeResult[]>([])
// 弹出层标题
const title = ref("")
// 是否显示弹出层
const open = ref(false)
// 表单ref
const formRef = ref()

// 查询参数
const queryParams = reactive({
  pageNum: 1,
  pageSize: 10,
  taskId: props.taskId
})

// 表单参数
const form = reactive({
  costId: null,
  taskId: props.taskId,
  employeeId: '',
  workingHours: null,
  workingStart: '',
  workingFinish: '',
  remark: null,
  status: "0",
  orderNum: null,
  createBy: null,
  createTime: null,
  updateBy: null,
  updateTime: null,
  delFlag: null
})

// 表单校验规则
const rules = {
  taskId: [
    { required: true, message: "任务ID不能为空", trigger: "blur" }
  ],
  employeeId: [
    { required: true, message: "雇员ID不能为空", trigger: "blur" }
  ],
  workingHours: [
    { required: true, message: "工时不能为空", trigger: "blur" }
  ],
  workingStart: [
    { required: true, message: "开始日期不能为空", trigger: "blur" }
  ],
  workingFinish: [
    { required: true, message: "结束日期不能为空", trigger: "blur" }
  ],
  delFlag: [
    { required: true, message: "删除标志不能为空", trigger: "blur" }
  ]
}

// 查询人工工时列表
const getList = async () => {
  loading.value = true
  try {
    const response = await AgricultureCostEmployeeService.listEmployee(queryParams)
    console.log('API返回的原始数据:', response)
    costEmployeeList.value = response.rows
    console.log('costEmployeeList的数据是：', costEmployeeList.value)
    total.value = response.total
    console.log('总数据量:', total.value)
  } finally {
    loading.value = false
  }
}

// 取消按钮
const cancel = () => {
  open.value = false
  reset()
}

// 表单重置
const reset = () => {
  Object.assign(form, {
    costId: null,
    taskId: props.taskId,
    employeeId: null,
    workingHours: null,
    workingStart: null,
    workingFinish: null,
    remark: null,
    status: "0",
    orderNum: null,
    createBy: null,
    createTime: null,
    updateBy: null,
    updateTime: null,
    delFlag: null
  })
  formRef.value?.resetFields()
}

// 新增按钮操作
const handleAdd = () => {
  reset()
  open.value = true
  title.value = "添加人工工时"
}

// 修改按钮操作
const handleUpdate = async (row: AgricultureCostEmployeeResult) => {
  reset()
  const costId = row.costId
  const response = await AgricultureCostEmployeeService.getEmployee(costId)
  Object.assign(form, response.data)
  open.value = true
  title.value = "修改人工工时"
}

// 插入任务日志
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

// 提交按钮
const submitForm = async () => {
  await formRef.value.validate()
  try {
    // 确保create_by为整数类型
    const submitData = {
      ...form,
      createBy: form.createBy ? parseInt(form.createBy) : null
    }

    if (form.costId != null) {
      await AgricultureCostEmployeeService.updateEmployee(submitData)
      ElMessage.success("修改成功")
      await addTaskLog("修改人工工时")
    } else {
      await AgricultureCostEmployeeService.addEmployee(submitData)
      ElMessage.success("新增成功")
      await addTaskLog("新增人工工时")
    }
    open.value = false
    console.log('弹窗已关闭', open.value)
    getList()
  } catch (error) {
    console.error(error)
  }
}

// 删除按钮操作
const handleDelete = async (row: AgricultureCostEmployeeResult) => {
  const costIds = row.costId
  try {
    await ElMessageBox.confirm('是否确认删除人工工时编号为"' + costIds + '"的数据项？')
    await AgricultureCostEmployeeService.deleteEmployee(costIds)
    getList()
    ElMessage.success("删除成功")
    await addTaskLog("删除人工工时")
  } catch (error) {
    console.error(error)
  }
}

console.log('收到的 taskEmployeeList:', props.taskEmployeeList)

// 日期限制函数
const disableWorkingStartDate = (time: Date) => {
  // 获取当前日期的00:00:00时间戳
  const currentDate = new Date();
  currentDate.setHours(0, 0, 0, 0);
  
  // 获取待检查日期的00:00:00时间戳
  const checkDate = new Date(time);
  checkDate.setHours(0, 0, 0, 0);
  
  // 只禁用比当前日期更早的日期
  return checkDate.getTime() < currentDate.getTime();
};

// 日期限制函数
const disableWorkingFinishDate = (time: Date) => {
  if (form.workingStart) {
    // 获取开始日期的00:00:00时间戳，用于比较
    const startDate = new Date(form.workingStart);
    startDate.setHours(0, 0, 0, 0);
    
    // 获取待检查日期的00:00:00时间戳
    const checkDate = new Date(time);
    checkDate.setHours(0, 0, 0, 0);
    
    // 只禁用比开始日期更早的日期（不包括同一天）
    return checkDate.getTime() < startDate.getTime();
  }
  return false;
};

onMounted(() => {
  getList()
})
</script>

<style scoped>
.padding-bottom-10 {
  padding-bottom: 10px;
}

.margin-top-10 {
  margin-top: 10px;
}

.w100 {
  width: 100%;
}

.display-block {
  display: block;
}

.cursor-pointer {
  cursor: pointer;
}
</style>
