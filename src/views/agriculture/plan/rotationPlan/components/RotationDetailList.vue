<template>
  <div class="rotation-detail-list">
    <div class="toolbar">
      <el-button type="primary" @click="handleAdd" v-auth="['agriculture:rotationdetail:add']">
        <el-icon><Plus /></el-icon>新增
      </el-button>
    </div>
    <el-table :data="detailList" border v-loading="loading">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="明细ID" prop="detailId" width="100" />
      <el-table-column label="轮作ID" prop="rotationId" width="100" />
      <el-table-column label="种质ID" prop="classId" width="100" />
      <el-table-column label="轮作顺序" prop="rotationOrder" width="100" align="center" />
      <el-table-column label="季节类型" prop="seasonType" width="120" align="center">
        <template #default="scope">
          {{ getSeasonTypeName(scope.row.seasonType) }}
        </template>
      </el-table-column>
      <el-table-column label="种植面积(亩)" prop="plantingArea" width="120" align="center" />
      <el-table-column label="种植密度" prop="plantingDensity" width="120" align="center" />
      <el-table-column label="预期开始" prop="expectedStartDate" width="120" align="center" />
      <el-table-column label="预期结束" prop="expectedEndDate" width="120" align="center" />
      <el-table-column label="操作" width="200" align="center" fixed="right">
        <template #default="scope">
          <el-button link type="primary" @click="handleUpdate(scope.row)" v-auth="['agriculture:rotationdetail:edit']">
            <el-icon><EditPen /></el-icon>修改
          </el-button>
          <el-button link type="danger" @click="handleDelete(scope.row)" v-auth="['agriculture:rotationdetail:remove']">
            <el-icon><Delete /></el-icon>删除
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

    <!-- 添加或修改轮作明细对话框 -->
    <el-dialog :title="title" v-model="open" width="600px" append-to-body>
      <el-form ref="detailRef" :model="form" :rules="rules" label-width="120px">
        <el-form-item label="种质ID" prop="classId">
          <el-input-number v-model="form.classId" :min="1" placeholder="请输入种质ID" style="width: 100%" />
        </el-form-item>
        <el-form-item label="轮作顺序" prop="rotationOrder">
          <el-input-number v-model="form.rotationOrder" :min="1" style="width: 100%" />
        </el-form-item>
        <el-form-item label="季节类型" prop="seasonType">
          <el-input v-model="form.seasonType" placeholder="请输入季节类型（如：春季、夏季等）" />
        </el-form-item>
        <el-form-item label="种植面积(亩)" prop="plantingArea">
          <el-input-number v-model="form.plantingArea" :min="0" :precision="2" style="width: 100%" />
        </el-form-item>
        <el-form-item label="种植密度" prop="plantingDensity">
          <el-input v-model="form.plantingDensity" placeholder="请输入种植密度" />
        </el-form-item>
        <el-form-item label="预期开始日期" prop="expectedStartDate">
          <el-date-picker
            v-model="form.expectedStartDate"
            type="date"
            placeholder="选择预期开始日期"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="预期结束日期" prop="expectedEndDate">
          <el-date-picker
            v-model="form.expectedEndDate"
            type="date"
            placeholder="选择预期结束日期"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="form.remark" type="textarea" :rows="2" placeholder="请输入备注" />
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
import { ref, reactive, onMounted, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { FormInstance } from 'element-plus'
import { Plus, EditPen, Delete } from '@element-plus/icons-vue'
import { AgricultureRotationDetailService } from '@/api/agriculture/rotationDetailApi'
import { AgricultureRotationDetailResult } from '@/types/agriculture/rotationDetail'

const props = defineProps({
  rotationId: {
    type: String,
    required: true
  }
})

const detailList = ref<AgricultureRotationDetailResult[]>([])
const loading = ref(false)
const total = ref(0)
const open = ref(false)
const title = ref('')
const detailRef = ref<FormInstance>()

const initialFormState = {
  detailId: null,
  rotationId: props.rotationId,
  classId: null,
  rotationOrder: 1,
  seasonType: '',
  plantingArea: null,
  plantingDensity: '',
  expectedStartDate: '',
  expectedEndDate: '',
  remark: ''
}

const form = reactive({ ...initialFormState })

const queryParams = reactive({
  pageNum: 1,
  pageSize: 10,
  rotationId: props.rotationId
})

const rules = reactive({
  classId: [{ required: true, message: '种质ID不能为空', trigger: 'blur' }],
  rotationOrder: [{ required: true, message: '轮作顺序不能为空', trigger: 'blur' }],
  seasonType: [{ required: true, message: '季节类型不能为空', trigger: 'blur' }]
})

/** 获取轮作明细列表 */
const getList = async () => {
  loading.value = true
  try {
    const res = await AgricultureRotationDetailService.listDetail(queryParams)
    if (res.code === 200) {
      detailList.value = res.rows
      total.value = res.total
    }
  } catch (error) {
    ElMessage.error('获取轮作明细列表失败')
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

const handleAdd = () => {
  reset()
  open.value = true
  title.value = '添加轮作明细'
  form.rotationId = props.rotationId
}

const handleUpdate = async (row: AgricultureRotationDetailResult) => {
  reset()
  open.value = true
  title.value = '修改轮作明细'
  const res = await AgricultureRotationDetailService.getDetail(row.detailId)
  if (res.code === 200) {
    Object.assign(form, res.data)
  }
}

const submitForm = async () => {
  if (!detailRef.value) return
  await detailRef.value.validate(async (valid) => {
    if (valid) {
      if (form.detailId) {
        const res = await AgricultureRotationDetailService.updateDetail(form)
        if (res.code === 200) {
          ElMessage.success(res.msg)
          open.value = false
          getList()
        }
      } else {
        const res = await AgricultureRotationDetailService.addDetail(form)
        if (res.code === 200) {
          ElMessage.success(res.msg)
          open.value = false
          getList()
        }
      }
    }
  })
}

const handleDelete = async (row: AgricultureRotationDetailResult) => {
  await ElMessageBox.confirm('是否确认删除？', '系统提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
    .then(async () => {
      const res = await AgricultureRotationDetailService.deleteDetail(row.detailId)
      if (res.code === 200) {
        ElMessage.success(res.msg)
        getList()
      }
    })
    .catch(() => {})
}

const cancel = () => {
  open.value = false
  reset()
}

const reset = () => {
  Object.assign(form, initialFormState)
  form.rotationId = props.rotationId
}

watch(() => props.rotationId, () => {
  queryParams.rotationId = props.rotationId
  form.rotationId = props.rotationId
  getList()
})

/** 获取季节类型中文名称 */
const getSeasonTypeName = (seasonType: string | undefined | null): string => {
  if (!seasonType) return '--'
  
  const seasonMap: { [key: string]: string } = {
    '1': '春季',
    '2': '夏季',
    '3': '秋季',
    '4': '冬季',
    'spring': '春季',
    'summer': '夏季',
    'autumn': '秋季',
    'fall': '秋季',
    'winter': '冬季',
    '春季': '春季',
    '夏季': '夏季',
    '秋季': '秋季',
    '冬季': '冬季'
  }
  
  const key = String(seasonType).toLowerCase()
  return seasonMap[key] || seasonType
}

onMounted(() => {
  getList()
})
</script>

<style lang="scss" scoped>
.rotation-detail-list {
  padding: 20px;
}

.toolbar {
  margin-bottom: 20px;
}
</style>

