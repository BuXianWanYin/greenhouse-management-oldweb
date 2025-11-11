<template>
  <div class="page-content">
    <!-- 农资库存管理 -->
    <table-bar
      :showTop="false"
      @search="search"
      @reset="resetForm(searchFormRef)"
      @changeColumn="changeColumn"
      :columns="columns"
    >
      <template #top>
        <el-form :model="queryParams" ref="searchFormRef" label-width="82px">
          <el-row :gutter="20">
            <form-input
              label="库存ID"
              prop="inventoryId"
              @keyup.enter="search"
              v-model="queryParams.inventoryId"
            />
            <form-input
              label="农资ID"
              prop="resourceId"
              @keyup.enter="search"
              v-model="queryParams.resourceId"
            />
          </el-row>
        </el-form>
      </template>
      <template #bottom>
        <el-button @click="handleAdd" v-auth="['agriculture:resourceinventory:add']" v-ripple>新增</el-button>
        <el-button @click="handleExport" v-auth="['agriculture:resourceinventory:export']" v-ripple>导出</el-button>
      </template>
    </table-bar>

    <!-- 农资库存列表 -->
    <art-table
      :data="inventoryList"
      :total="total"
      :current-page="queryParams.pageNum"
      :page-size="queryParams.pageSize"
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
      v-loading="loading"
    >
      <template #default>
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column label="库存ID" prop="inventoryId" width="100" v-if="columns[0].show" />
        <el-table-column label="农资ID" prop="resourceId" width="100" v-if="columns[1].show" />
        <el-table-column label="农资编码" width="120" v-if="columns[2].show">
          <template #default="{ row }">
            {{ getResourceCode(row.resourceId) }}
          </template>
        </el-table-column>
        <el-table-column label="农资名称" width="150" v-if="columns[3].show">
          <template #default="{ row }">
            {{ getResourceName(row.resourceId) }}
          </template>
        </el-table-column>
        <el-table-column label="农资类型" width="100" align="center" v-if="columns[4].show">
          <template #default="{ row }">
            {{ getResourceTypeLabel(row.resourceId) }}
          </template>
        </el-table-column>
        <el-table-column label="计量单位" width="100" align="center" v-if="columns[5].show">
          <template #default="{ row }">
            {{ getResourceMeasureUnit(row.resourceId) }}
          </template>
        </el-table-column>
        <el-table-column label="当前库存" prop="currentStock" width="120" align="center" v-if="columns[6].show" />
        <el-table-column label="最小库存" prop="minStock" width="120" align="center" v-if="columns[7].show" />
        <el-table-column label="最大库存" prop="maxStock" width="120" align="center" v-if="columns[8].show" />
        <el-table-column label="备注" prop="remark" min-width="150" show-overflow-tooltip v-if="columns[9].show" />
        <el-table-column label="创建时间" prop="createTime" width="180" align="center" v-if="columns[10].show" />
        <el-table-column label="操作" width="200" align="center" fixed="right">
          <template #default="scope">
            <el-button link type="primary" @click="handleUpdate(scope.row)" v-auth="['agriculture:resourceinventory:edit']">
              <el-icon><EditPen /></el-icon>修改
            </el-button>
            <el-button link type="danger" @click="handleDelete(scope.row)" v-auth="['agriculture:resourceinventory:remove']">
              <el-icon><Delete /></el-icon>删除
            </el-button>
          </template>
        </el-table-column>
      </template>
    </art-table>

    <!-- 添加或修改农资库存对话框 -->
    <el-dialog :title="title" v-model="open" width="600px" append-to-body>
      <el-form ref="inventoryRef" :model="form" :rules="rules" label-width="120px">
        <el-form-item label="操作类型" prop="operationType" v-if="!form.inventoryId">
          <el-radio-group v-model="form.operationType">
            <el-radio label="inventory">新增库存</el-radio>
            <el-radio label="stockIn">入库</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item :label="form.operationType === 'stockIn' && !form.inventoryId ? '库存' : '农资'" prop="resourceId">
          <!-- 入库时选择库存记录 -->
          <el-select 
            v-if="form.operationType === 'stockIn' && !form.inventoryId"
            :model-value="form.inventoryIdForStockIn || undefined" 
            @update:model-value="handleInventoryChangeForStockIn($event)" 
            placeholder="请选择库存" 
            style="width: 100%" 
            clearable
          >
            <el-option
              v-for="item in allInventoryList"
              :key="item.inventoryId"
              :label="`${getResourceName(item.resourceId)} - 当前库存: ${item.currentStock}`"
              :value="item.inventoryId"
            />
          </el-select>
          <!-- 新增库存时选择农资 -->
          <el-select 
            v-else
            :model-value="form.resourceId || undefined" 
            @update:model-value="form.resourceId = $event" 
            placeholder="请选择农资" 
            style="width: 100%" 
            @change="handleResourceChange" 
            clearable
          >
            <el-option
              v-for="item in filteredResourceList"
              :key="item.resourceId"
              :label="item.resourceName"
              :value="item.resourceId"
            />
          </el-select>
        </el-form-item>
        <!-- 入库相关字段 -->
        <template v-if="form.operationType === 'stockIn' && !form.inventoryId">
          <el-form-item label="当前库存" prop="currentStock">
            <el-input-number v-model="form.currentStock" :min="0" :precision="0" style="width: 100%" disabled />
          </el-form-item>
          <el-form-item label="最大库存" prop="maxStock">
            <el-input-number v-model="form.maxStock" :min="0" :precision="0" style="width: 100%" disabled />
          </el-form-item>
          <el-form-item label="入库数量" prop="usageQuantity">
            <el-input-number v-model="form.usageQuantity" :min="0" :precision="0" style="width: 100%" />
          </el-form-item>
          <el-form-item label="计量单位" prop="measureUnit">
            <el-input v-model="form.measureUnit" placeholder="计量单位" disabled />
          </el-form-item>
          <el-form-item label="入库日期" prop="usageDate">
            <el-date-picker
              v-model="form.usageDate"
              type="date"
              placeholder="选择入库日期"
              format="YYYY-MM-DD"
              value-format="YYYY-MM-DD"
              style="width: 100%"
            />
          </el-form-item>
          <el-form-item label="操作人员" prop="operator">
            <el-input v-model="form.operator" placeholder="请输入操作人员" />
          </el-form-item>
        </template>
        <!-- 新增库存相关字段 -->
        <template v-else>
          <el-form-item label="当前库存" prop="currentStock">
            <el-input-number v-model="form.currentStock" :min="0" :precision="0" style="width: 100%" />
          </el-form-item>
          <el-form-item label="最小库存" prop="minStock">
            <el-input-number v-model="form.minStock" :min="0" :precision="0" style="width: 100%" />
          </el-form-item>
          <el-form-item label="最大库存" prop="maxStock">
            <el-input-number v-model="form.maxStock" :min="0" :precision="0" style="width: 100%" />
          </el-form-item>
        </template>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="form.remark" type="textarea" :rows="3" placeholder="请输入备注" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitForm">确 定</el-button>
          <el-button @click="cancel">取 消</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 入库对话框 -->
    <el-dialog title="农资入库" v-model="stockInOpen" width="600px" append-to-body>
      <el-form ref="stockInRef" :model="stockInForm" :rules="stockInRules" label-width="120px">
        <el-form-item label="农资" prop="resourceId">
          <el-select v-model="stockInForm.resourceId" placeholder="请选择农资" style="width: 100%" @change="handleResourceChangeForStockIn">
            <el-option
              v-for="item in resourceList"
              :key="item.resourceId"
              :label="item.resourceName"
              :value="item.resourceId"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="入库数量" prop="usageQuantity">
          <el-input-number v-model="stockInForm.usageQuantity" :min="0" :precision="2" style="width: 100%" />
        </el-form-item>
        <el-form-item label="计量单位" prop="measureUnit">
          <el-input v-model="stockInForm.measureUnit" placeholder="计量单位" disabled />
        </el-form-item>
        <el-form-item label="入库日期" prop="usageDate">
          <el-date-picker
            v-model="stockInForm.usageDate"
            type="date"
            placeholder="选择入库日期"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="操作人员" prop="operator">
          <el-input v-model="stockInForm.operator" placeholder="请输入操作人员" />
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="stockInForm.remark" type="textarea" :rows="3" placeholder="请输入备注" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitStockIn">确 定</el-button>
          <el-button @click="cancelStockIn">取 消</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { EditPen, Delete, Plus } from '@element-plus/icons-vue'
import { ref, reactive, onMounted, computed } from 'vue'
import { resetForm } from '@/utils/utils'
import { ElMessage, ElMessageBox } from 'element-plus'
import { FormInstance } from 'element-plus'
import { downloadExcel } from '@/utils/utils'
import { AgricultureResourceInventoryService } from '@/api/agriculture/resourceInventoryApi'
import { AgricultureResourceInventoryResult } from '@/types/agriculture/resourceInventory'
import { AgricultureResourceUsageService } from '@/api/agriculture/resourceUsageApi'
import { AgricultureResourceService } from '@/api/agriculture/resourceApi'
import { AgricultureResourceResult } from '@/types/agriculture/resource'
import { useUserStore } from '@/store/modules/user'

const inventoryList = ref<AgricultureResourceInventoryResult[]>([])
const resourceList = ref<AgricultureResourceResult[]>([])

// 用于存储所有库存数据（用于过滤）
const allInventoryList = ref<AgricultureResourceInventoryResult[]>([])

// 计算属性：根据操作类型过滤农资列表
// 新增库存时，只显示没有库存的农资；入库和修改时，显示所有农资
const filteredResourceList = computed(() => {
  // 如果是新增库存操作，过滤掉已有库存的农资
  if (form.operationType === 'inventory' && !form.inventoryId) {
    // 获取已有库存的农资ID集合（使用所有库存数据）
    const existingResourceIds = new Set(
      allInventoryList.value.map(item => String(item.resourceId))
    )
    // 过滤出没有库存的农资
    return resourceList.value.filter(
      resource => !existingResourceIds.has(String(resource.resourceId))
    )
  }
  // 入库和修改操作，显示所有农资
  return resourceList.value
})
const open = ref(false)
const stockInOpen = ref(false)
const loading = ref(true)
const total = ref(0)
const title = ref('')
const searchFormRef = ref<FormInstance>()
const inventoryRef = ref<FormInstance>()
const stockInRef = ref<FormInstance>()
const userStore = useUserStore()

const columns = reactive([
  { name: '库存ID', show: true },
  { name: '农资ID', show: true },
  { name: '农资编码', show: true },
  { name: '农资名称', show: true },
  { name: '农资类型', show: true },
  { name: '计量单位', show: true },
  { name: '当前库存', show: true },
  { name: '最小库存', show: true },
  { name: '最大库存', show: true },
  { name: '备注', show: true },
  { name: '创建时间', show: true }
])

const changeColumn = (list: any) => {
  columns.forEach((col, index) => {
    if (list[index]) {
      col.show = list[index].show
    }
  })
}

const initialFormState = {
  inventoryId: null,
  resourceId: '' as string | number | null,
  currentStock: 0,
  minStock: 0,
  maxStock: 0,
  remark: '',
  operationType: 'inventory' as 'inventory' | 'stockIn', // 'inventory' 新增库存, 'stockIn' 入库
  // 入库相关字段
  inventoryIdForStockIn: null as string | number | null, // 入库时选择的库存ID
  usageQuantity: 0,
  measureUnit: '',
  usageDate: '',
  operator: ''
}

const form = reactive({ ...initialFormState })

const initialStockInFormState = {
  resourceId: '',
  usageQuantity: 0,
  measureUnit: '',
  usageDate: '',
  usageType: '2', // 2表示入库
  operator: '',
  remark: ''
}

const stockInForm = reactive({ ...initialStockInFormState })

const queryParams = reactive({
  pageNum: 1,
  pageSize: 10,
  inventoryId: '',
  resourceId: ''
})

const rules = reactive({
  resourceId: [{ required: true, message: '农资不能为空', trigger: 'change' }],
  currentStock: [{ required: true, message: '当前库存不能为空', trigger: 'blur' }],
  minStock: [{ required: true, message: '最小库存不能为空', trigger: 'blur' }],
  maxStock: [{ required: true, message: '最大库存不能为空', trigger: 'blur' }],
  usageQuantity: [{ required: true, message: '入库数量不能为空', trigger: 'blur' }],
  usageDate: [{ required: true, message: '入库日期不能为空', trigger: 'change' }]
})

const stockInRules = reactive({
  resourceId: [{ required: true, message: '农资不能为空', trigger: 'change' }],
  usageQuantity: [{ required: true, message: '入库数量不能为空', trigger: 'blur' }],
  usageDate: [{ required: true, message: '入库日期不能为空', trigger: 'change' }]
})

/** 查询农资库存列表 */
const getList = async () => {
  loading.value = true
  const res = await AgricultureResourceInventoryService.listInventory(queryParams)
  if (res.code === 200) {
    inventoryList.value = res.rows || []
    total.value = res.total || 0
  }
  loading.value = false
}

/** 获取所有库存列表（用于过滤，不分页） */
const getAllInventoryList = async () => {
  const res = await AgricultureResourceInventoryService.listInventory({ 
    pageNum: 1, 
    pageSize: 9999 
  })
  if (res.code === 200) {
    return res.rows || []
  }
  return []
}

/** 查询农资列表 */
const getResourceList = async () => {
  const res = await AgricultureResourceService.listResource({ pageNum: 1, pageSize: 9999 })
  if (res.code === 200) {
    resourceList.value = res.rows || []
  }
}

/** 根据农资ID获取农资名称 */
const getResourceName = (resourceId: string) => {
  const resource = resourceList.value.find(item => item.resourceId === resourceId)
  return resource ? resource.resourceName : resourceId
}

/** 根据农资ID获取农资编码 */
const getResourceCode = (resourceId: string) => {
  const resource = resourceList.value.find(item => item.resourceId === resourceId)
  return resource ? resource.resourceCode : '-'
}

/** 根据农资ID获取农资类型 */
const getResourceTypeLabel = (resourceId: string) => {
  const resource = resourceList.value.find(item => item.resourceId === resourceId)
  if (!resource) return '-'
  const typeMap: Record<string, string> = {
    '0': '物料',
    '1': '机械'
  }
  return typeMap[resource.resourceType] || resource.resourceType
}

/** 根据农资ID获取计量单位 */
const getResourceMeasureUnit = (resourceId: string) => {
  const resource = resourceList.value.find(item => item.resourceId === resourceId)
  return resource ? (resource.measureUnit || '-') : '-'
}

/** 搜索按钮操作 */
const search = () => {
  queryParams.pageNum = 1
  getList()
}

const handleQuery = search

/** 每页条数改变 */
const handleSizeChange = (size: number) => {
  queryParams.pageSize = size
  getList()
}

/** 当前页改变 */
const handleCurrentChange = (page: number) => {
  queryParams.pageNum = page
  getList()
}

/** 新增按钮操作 */
const handleAdd = async () => {
  reset()
  // 确保库存列表和农资列表都已加载，以便正确过滤
  // 获取所有库存数据用于过滤（不分页）
  allInventoryList.value = await getAllInventoryList()
  await getResourceList()
  open.value = true
  title.value = '添加农资库存'
  form.operationType = 'inventory' // 默认选择新增库存
  form.operator = userStore.info.name || ''
  form.usageDate = new Date().toISOString().split('T')[0]
}

/** 修改按钮操作 */
const handleUpdate = async (row: any) => {
  reset()
  await getResourceList() // 加载农资列表，以便在需要时使用
  open.value = true
  title.value = '修改农资库存'
  const res = await AgricultureResourceInventoryService.getInventory(row.inventoryId)
  if (res.code === 200) {
    Object.assign(form, res.data)
  }
}

/** 农资选择变化时，自动填充计量单位（用于新增库存） */
const handleResourceChange = (resourceId: string) => {
  const resource = resourceList.value.find(item => item.resourceId === resourceId)
  if (resource && resource.measureUnit) {
    // 新增库存时不需要填充计量单位，因为新增库存不涉及计量单位
  }
}

/** 入库时选择库存记录变化处理 */
const handleInventoryChangeForStockIn = (inventoryId: string | number | null) => {
  form.inventoryIdForStockIn = inventoryId
  if (inventoryId) {
    // 根据库存ID查找对应的库存记录
    const inventory = allInventoryList.value.find(item => String(item.inventoryId) === String(inventoryId))
    if (inventory) {
      // 填充当前库存和最大库存
      form.currentStock = inventory.currentStock || 0
      form.maxStock = inventory.maxStock || 0
      // 填充农资ID和计量单位
      form.resourceId = inventory.resourceId
      const resource = resourceList.value.find(item => item.resourceId === inventory.resourceId)
      if (resource && resource.measureUnit) {
        form.measureUnit = resource.measureUnit
      }
    }
  } else {
    // 清空时重置
    form.currentStock = 0
    form.maxStock = 0
    form.resourceId = ''
    form.measureUnit = ''
  }
}

/** 提交按钮 */
const submitForm = async () => {
  if (!inventoryRef.value) return
  
  // 手动验证必填字段
  if (form.operationType === 'stockIn' && !form.inventoryId) {
    // 入库操作验证
    if (!form.inventoryIdForStockIn) {
      ElMessage.warning('请选择库存')
      return
    }
    if (!form.usageQuantity || form.usageQuantity <= 0) {
      ElMessage.warning('请输入入库数量')
      return
    }
    if (!form.usageDate) {
      ElMessage.warning('请选择入库日期')
      return
    }
    
    // 入库操作
    try {
      const stockInData = {
        resourceId: form.resourceId,
        usageQuantity: form.usageQuantity,
        measureUnit: form.measureUnit,
        usageDate: form.usageDate,
        usageType: '2', // 2表示入库
        operator: form.operator,
        remark: form.remark
      }
      const res = await AgricultureResourceUsageService.addUsage(stockInData)
      if (res.code === 200) {
        ElMessage.success(res.msg || '入库成功')
        open.value = false
        getList() // 刷新库存列表
        // 更新所有库存列表用于过滤
        allInventoryList.value = await getAllInventoryList()
      }
    } catch (error) {
      console.error('入库失败:', error)
      ElMessage.error('入库失败')
    }
    return
  }
  
  // 新增或修改库存操作
  await inventoryRef.value.validate(async (valid) => {
    if (valid) {
      if (form.inventoryId) {
        // 修改库存
        const res = await AgricultureResourceInventoryService.updateInventory(form)
        if (res.code === 200) {
          ElMessage.success(res.msg)
          open.value = false
          getList()
        }
      } else {
        // 新增库存
        const res = await AgricultureResourceInventoryService.addInventory(form)
        if (res.code === 200) {
          ElMessage.success(res.msg)
          open.value = false
          getList()
        }
      }
    }
  })
}

/** 删除按钮操作 */
const handleDelete = async (row: any) => {
  await ElMessageBox.confirm('是否确认删除农资库存编号为"' + row.inventoryId + '"的数据项？', '系统提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
    .then(async () => {
      const res = await AgricultureResourceInventoryService.deleteInventory(row.inventoryId)
      if (res.code === 200) {
        getList()
        ElMessage.success(res.msg)
      }
    })
    .catch(() => {})
}

/** 导出按钮操作 */
const handleExport = () => {
  downloadExcel(AgricultureResourceInventoryService.exportExcel(queryParams))
}

/** 入库按钮操作 */
const handleStockIn = () => {
  resetStockIn()
  getResourceList()
  stockInOpen.value = true
  stockInForm.operator = userStore.info.name || ''
  stockInForm.usageDate = new Date().toISOString().split('T')[0]
}

/** 根据行数据入库 */
const handleStockInByRow = async (row: any) => {
  resetStockIn()
  await getResourceList()
  stockInForm.resourceId = row.resourceId
  // 根据resourceId查找对应的农资信息
  const resource = resourceList.value.find(item => item.resourceId === row.resourceId)
  if (resource) {
    stockInForm.measureUnit = resource.measureUnit
  }
  stockInOpen.value = true
  stockInForm.operator = userStore.info.name || ''
  stockInForm.usageDate = new Date().toISOString().split('T')[0]
}

/** 农资选择变化时，自动填充计量单位 */
const handleResourceChangeForStockIn = (resourceId: string) => {
  const resource = resourceList.value.find(item => item.resourceId === resourceId)
  if (resource && resource.measureUnit) {
    stockInForm.measureUnit = resource.measureUnit
  }
}

/** 提交入库 */
const submitStockIn = async () => {
  if (!stockInRef.value) return
  await stockInRef.value.validate(async (valid) => {
    if (valid) {
      try {
        const res = await AgricultureResourceUsageService.addUsage(stockInForm)
        if (res.code === 200) {
          ElMessage.success(res.msg || '入库成功')
          stockInOpen.value = false
          getList() // 刷新库存列表
        }
      } catch (error) {
        console.error('入库失败:', error)
        ElMessage.error('入库失败')
      }
    }
  })
}

/** 取消入库 */
const cancelStockIn = () => {
  stockInOpen.value = false
  resetStockIn()
}

/** 重置入库表单 */
const resetStockIn = () => {
  Object.assign(stockInForm, initialStockInFormState)
  stockInForm.operator = userStore.info.name || ''
  stockInForm.usageDate = new Date().toISOString().split('T')[0]
  stockInRef.value?.resetFields()
}

// 取消按钮
const cancel = () => {
  open.value = false
  reset()
}

// 表单重置
const reset = () => {
  Object.assign(form, {
    ...initialFormState,
    operationType: 'inventory',
    operator: userStore.info.name || '',
    usageDate: new Date().toISOString().split('T')[0],
    inventoryIdForStockIn: null
  })
  inventoryRef.value?.resetFields()
}

// 初始化
onMounted(() => {
  getList()
  getResourceList()
})
</script>

<style lang="scss" scoped>
.page-content {
  padding: 20px;
}
</style>

