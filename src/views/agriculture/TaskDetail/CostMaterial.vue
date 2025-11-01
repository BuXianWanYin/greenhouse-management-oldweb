<template>
  <!--
   用于登记和管理饵料投喂的数据
    -->
  <div class="padding-bottom-10">
      <el-alert
          :title="props.isVegetable ? '登记农资使用' : '登记饵料投喂'"
          type="info"
          show-icon
          :description="props.isVegetable ? '此处可以登记农资使用' : '此处可以登记饵料投喂'"
      >
      </el-alert>
      <el-table
          v-loading="loading"
          :data="costBaitList"
          class="margin-top-10"
      >
          <el-table-column :label="props.isVegetable ? '农资名称' : '饵料名称'" align="center" prop="baitId">
              <template #default="{ row }">
                  {{ baitInfoList.find(item => item.materialId == row.baitId)?.materialName || '-' }}
              </template>
          </el-table-column>
          <el-table-column :label="props.isVegetable ? '使用数量' : '投喂数量'" align="center" prop="baitCount"/>
          <el-table-column label="计量单位" align="center" prop="measureUnit"/>
          <el-table-column
              label="开始日期"
              align="center"
              prop="workingStart"
              width="140"
          >
          <template #default="{ row }">
          <span>{{ parseTime(row.workingStart, "{y}-{m}-{d}") }}</span>
        </template>
          </el-table-column>
          <el-table-column
              label="结束日期"
              align="center"
              prop="workingFinish"
              width="140"
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
                      v-hasPermi="['fishingGround:costBait:add']"
                      class="cursor-pointer"
                  >新增
                  </el-tag>
              </template>
              <template #default="{ row }">
                  <el-button
                      size="small"
                      type="primary"
                      link
                      icon="Edit"
                      @click="handleUpdate(row)"
                      v-hasPermi="['fishingGround:costBait:edit']"
                  >修改
                  </el-button
                  >
                  <el-button
                      size="small"
                      type="primary"
                      link
                      icon="Delete"
                      @click="handleDelete(row)"
                      v-hasPermi="['fishingGround:costBait:remove']"
                  >删除
                  </el-button
                  >
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
      <!-- 添加或修改饵料用量对话框 -->
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
              <el-form-item :label="props.isVegetable ? '农资名称' : '饵料名称'" prop="baitId">
                  <el-select
                      v-model="form.baitId"
                      :placeholder="props.isVegetable ? '请选择农资名称' : '请选择饵料名称'"
                      class="display-block"
                  >
                      <el-option
                          v-for="item in baitInfoList"
                          :key="item.materialId"
                          :label="item.materialName"
                          :value="item.materialId"
                      >
                      </el-option>
                  </el-select>
              </el-form-item>
              <el-form-item :label="props.isVegetable ? '使用数量' : '投喂数量'" prop="baitCount">
                  <el-input v-model="form.baitCount" :placeholder="props.isVegetable ? '请输入使用数量' : '请输入投喂数量'"/>
              </el-form-item>
              <el-form-item label="计量单位" prop="measureUnit">
                  <el-input v-model="form.measureUnit" placeholder="请输入计量单位"/>
              </el-form-item>
              <el-form-item label="开始日期" prop="workingStart">
                  <el-date-picker
                      v-model="form.workingStart"
                      type="date"
                      value-format="YYYY-MM-DD"
                      placeholder="选择开始日期"
                      class="w100"
                      clearable
                      :disabledDate="disableWorkingStartDate"
                  >
                  </el-date-picker>
              </el-form-item>
              <el-form-item label="结束日期" prop="workingFinish">
                  <el-date-picker
                      v-model="form.workingFinish"
                      type="date"
                      value-format="YYYY-MM-DD"
                      placeholder="选择结束日期"
                      class="w100"
                      clearable
                      :disabledDate="disableWorkingFinishDate"
                  >
                  </el-date-picker>
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
import type { FormInstance, FormRules } from 'element-plus'
import { FishCostBaitService } from '@/api/agriculture/costMaterialApi'
import { AgricultureTaskLogService } from "@/api/agriculture/logApi"
import { AgricultureMaterialService } from "@/api/agriculture/materialApi"
import { FishCostBaitResult } from '@/types/agriculture/costMaterial'
import { parseTime } from '@/utils/utils'
import { watch } from 'vue';

// 定义接口
interface Props {
  taskId: number | string
}

interface BaitInfo {
  materialId: string
  materialName: string
  measureUnit?: string
}

interface CostBaitForm {
  costId: string | null
  taskId: string
  baitId: string
  baitCount: string | null
  measureUnit: string
  workingStart: string
  workingFinish: string
  remark: string
  status: string
  orderNum: string | null
  createBy: string
  createTime: string
  updateBy: string
  updateTime: string
  delFlag: string
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
  isVegetable: {
    type: Boolean,
    default: false
  }
})
const emit = defineEmits(['log'])

// 遮罩层
const loading = ref(true)
// 总条数
const total = ref(0)
// 饵料用量表格数据
const costBaitList = ref<FishCostBaitResult[]>([])
const baitInfoList = ref<BaitInfo[]>([])
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
const form = reactive<CostBaitForm>({
  costId: null,
  taskId: props.taskId.toString(),
  baitId: '',
  baitCount: null,
  measureUnit: '',
  workingStart: '',
  workingFinish: '',
  remark: '',
  status: '0',
  orderNum: null,
  createBy: '',
  createTime: '',
  updateBy: '',
  updateTime: '',
  delFlag: '',
})

// 表单校验
const rules = reactive<FormRules>({
  taskId: [
    { required: true, message: '任务ID不能为空', trigger: 'blur' },
  ],
  baitId: [
    { required: true, message: '饵料ID不能为空', trigger: 'blur' },
  ],
  baitCount: [
    { required: true, message: '使用数量不能为空', trigger: 'blur' },
  ],
  measureUnit: [
    { required: true, message: '计量单位不能为空', trigger: 'blur' },
  ],
  workingStart: [
    { required: true, message: '开始日期不能为空', trigger: 'blur' },
  ],
  workingFinish: [
    { required: true, message: '结束日期不能为空', trigger: 'blur' },
  ],
})

/** 查询饵料用量列表 */
const getList = async () => {
  loading.value = true
  try {
    const response = await FishCostBaitService.listBait(queryParams)
    costBaitList.value = response.rows
    total.value = response.total
  } finally {
    loading.value = false
  }
}

/** 查询饵料信息列表（根据 isVegetable 判断，筛选出菜或鱼的农资） */
const getBaitInfoList = async () => { // 定义异步函数 getBaitInfoList
  const response = await AgricultureMaterialService.listMaterial(queryParams) // 调用接口获取所有农资/饵料数据
  baitInfoList.value = response.rows // 将接口返回的 rows 赋值给 baitInfoList
    // status == "0" 表示菜的农资，status == "1" 表示鱼的饵料
    .filter(item => item.status == (props.isVegetable ? "0" : "1")) // 根据 isVegetable 过滤出对应类型的数据
    .map(item => ({ // 对每一项数据进行映射，提取需要的字段
      materialId: item.materialId, // 物资ID
      materialName: item.materialName || '', // 物资名称，若无则为空字符串
      measureUnit: item.measureUnit // 计量单位
    })) // 映射结束
} // getBaitInfoList 结束

/** 获取饵料用量详情 */
const getCostBait = async (costId: string) => {
  return await FishCostBaitService.getBait(costId)
}

/** 新增饵料用量 */
const addCostBait = async (data: CostBaitForm) => {
  return await FishCostBaitService.addBait(data)
}

/** 修改饵料用量 */
const updateCostBait = async (data: CostBaitForm) => {
  return await FishCostBaitService.updateBait(data)
}

/** 删除饵料用量 */
const delCostBait = async (costId: string) => {
  return await FishCostBaitService.deleteBait(costId)
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
  form.costId = null
  form.taskId = props.taskId.toString()
  form.baitId = ''
  form.baitCount = null
  form.measureUnit = ''
  form.workingStart = ''
  form.workingFinish = ''
  form.remark = ''
  form.status = '0'
  form.orderNum = null
  form.createBy = ''
  form.createTime = ''
  form.updateBy = ''
  form.updateTime = ''
  form.delFlag = ''
  formRef.value?.resetFields()
}

/** 搜索按钮操作 */
const handleQuery = () => {
  queryParams.pageNum = 1
  getList()
}

/** 重置按钮操作 */
const resetQuery = () => {
  formRef.value?.resetFields()
  handleQuery()
}

/** 新增按钮操作
 *  1. 重置表单
 *  2. 拉取当前类型（菜/鱼）对应的农资/饵料列表
 *  3. 打开弹窗
 */
const handleAdd = () => { // 定义 handleAdd 方法，处理新增按钮点击
  reset() // 重置表单内容
  getBaitInfoList() // 新增时拉取对应的农资/饵料
  open.value = true // 打开弹窗
  title.value = '添加投喂用量' // 设置弹窗标题
} // handleAdd 结束

/** 修改按钮操作 */
const handleUpdate = async (row: FishCostBaitResult) => {
  reset()
  const costId = row.costId
  const response = await getCostBait(costId)
  Object.assign(form, response.data)
  open.value = true
  title.value = '修改投喂用量'
}

/** 提交按钮 */
const submitForm = async () => {
  if (!formRef.value) return
  
  await formRef.value.validate(async (valid) => {
    if (valid) {
      try {
        if (form.costId != null) {
          await updateCostBait(form)
          ElMessage.success('修改成功')
          await addTaskLog('修改投喂用量')
        } else {
          await addCostBait(form)
          ElMessage.success('新增成功')
          await addTaskLog('新增投喂用量')
        }
        open.value = false
        getList()
      } catch (error) {
        console.error('提交失败:', error)
      }
    }
  })
}

/** 删除按钮操作 */
const handleDelete = async (row: FishCostBaitResult) => {
  const costIds = row.costId
  try {
    await ElMessageBox.confirm(
      `是否确认删除投喂用量编号为"${costIds}"的数据项？`,
      '警告'
    )
    await delCostBait(costIds)
    await getList()
    ElMessage.success('删除成功')
    await addTaskLog('删除投喂用量')
  } catch (error) {
    console.error('删除失败:', error)
  }
}

/** 导出按钮操作 */
const handleExport = () => {
  // 实现导出功能
  // this.download(
  //   'fishPasture/costBait/export',
  //   {
  //     ...queryParams,
  //   },
  //   `costBait_${new Date().getTime()}.xlsx`
  // )
}

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
  getBaitInfoList()
})

// 监听 isVegetable 变化，切换类型时自动刷新下拉框内容
watch( // 使用 watch 监听 props.isVegetable 的变化
  () => props.isVegetable, // 监听的目标是 props.isVegetable
  () => { // 当 props.isVegetable 变化时执行
    getBaitInfoList() // 重新拉取农资/饵料列表，保证下拉框内容正确
  } // 回调函数结束
) // watch 结束
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
</style>
