<template>
  <div class="app-container-sm">
    <!-- 查询表单 -->
    <el-card class="card-margin-bottom">
      <el-form
        :model="queryParams"
        ref="queryFormRef"
        :inline="true"
        v-show="showSearch"
        label-width="68px"
        class="form-minus-bottom"
      >
        <el-form-item prop="batchName">
          <template #label>
            <b class="form-label-strong">批次名称</b>
          </template>
          <el-input
            v-model="queryParams.batchName"
            placeholder="请输入批次名称"
            clearable
            size="small"
            @keyup.enter="handleQuery"
            style="width: 200px"
            class="form-input-large"
          />
        </el-form-item>
        <el-form-item prop="germplasmId">
          <template #label>
            <b class="form-label-strong">种质</b>
          </template>
          <el-select
            v-model="queryParams.germplasmId"
            size="small"
            placeholder="请选择种质"
            clearable
            style="width: 200px"
            class="form-input-large"
          >
            <el-option
              v-for="germplasm in germplasmList"
              :key="germplasm.classId"
              :label="germplasm.className"
              :value="germplasm.classId"
            />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button
            :icon="Search"
            size="small"
            @click="handleQuery"
            class="form-btn-large search-btn"
            >搜索</el-button
          >
          <el-button :icon="Refresh" size="small" @click="resetQuery" class="form-btn-large"
            >重置</el-button
          >
        </el-form-item>
        <el-form-item class="fr">
          <el-button
            :icon="Download"
            size="small"
            @click="handleExport"
            class="form-btn-large export-btn"
            >导出</el-button
          >
        </el-form-item>
      </el-form>
    <!-- 批次卡片列表 -->
      <div class="batch-card-grid">
        <el-row :gutter="24">
          <el-col :span="8" v-for="item in batchList" :key="item.batchId">
            <el-card class="batch-card" shadow="hover">
              <div class="batch-card-header">
                <div class="header-content">
                  <div class="section-name">批次名称</div>
                  <div class="batch-name">{{ item.batchName }}</div>
                </div>
                <el-tag :type="item.hasHarvestRecord ? 'success' : 'warning'">
                  {{ item.hasHarvestRecord ? '已采摘' : '已成熟' }}
                </el-tag>
              </div>
              <div class="batch-image">
                <!-- 轮播间隔为2秒 -->
                <!-- 多图显示箭头，单图不显示 -->
                <!-- 轮播高度180px -->
                <!-- 指示器在外部 -->
                <!-- 宽度100% -->
                <el-carousel
                  :interval="2000"
                  :arrow="getClassImages(item).length > 1 ? 'always' : 'never'"
                  height="180px"
                  indicator-position="outside"
                  style="width: 100%"
                >
                  <!-- 遍历所有图片 -->
                  <el-carousel-item
                    v-for="(img, idx) in getClassImages(item)"
                    :key="idx"
                    style="
                      display: flex;
                      align-items: center;
                      justify-content: center;
                      height: 180px;
                      cursor: pointer;
                    "
                  >
                    <!-- 图片自适应容器 -->
                    <img :src="img" alt="种质图片" style="max-width: 100%; max-height: 100%" />
                  </el-carousel-item>
                </el-carousel>
              </div>
              <div class="batch-card-content">
                <div class="batch-info">
                  <div class="info-item">
                    <el-icon><Menu /></el-icon>
                    <span class="label">种质：</span>
                    <span>{{ item.displayClassName }}</span>
                  </div>
                  <div class="info-item">
                    <el-icon><User /></el-icon>
                    <span class="label">负责人：</span>
                    <span>{{ item.nickName }}</span>
                  </div>
                  <div class="info-item">
                    <el-icon><House /></el-icon>
                    <span class="label">所属大棚：</span>
                    <span>{{ getPastureName(item.pastureId) }}</span>
                  </div>
                  <div class="info-item">
                    <el-icon><FullScreen /></el-icon>
                    <span class="label">种植面积：</span>
                    <span>{{ item.cropArea }}亩</span>
                  </div>
                  <div class="info-item">
                    <el-icon><Calendar /></el-icon>
                    <span class="label">开始时间：</span>
                    <span>{{ parseTime(item.createTime, '{y}-{m}-{d}') }}</span>
                  </div>
                </div>
              </div>
              <div class="batch-card-actions">
                <el-button
                  size="small"
                  type="primary"
                  @click="openHarvestDialog(item.batchId, item.vegDone, item.hasHarvestRecord)"
                >
                  {{ item.hasHarvestRecord ? '采摘详情' : '采摘' }}
                </el-button>
                <el-button
                  size="small"
                  plain
                  type="warning"
                  @click="handleBatchTask(item)"
                  >批次任务</el-button
                >
              </div>
            </el-card>
          </el-col>
        </el-row>
      </div>
      <div v-if="batchList.length > 9" class="custom-pagination">
        <span style="margin-right: 16px; font-size: 14px"> 共 {{ batchList.length }} 条 </span>
        <el-pagination
          background
          layout="sizes, prev, pager, next, jumper"
          :total="total"
          :page-size="pageSize"
          :current-page="pageNum"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          :page-sizes="[9, 18, 27, 36]"
        />
      </div>
    </el-card>

    <!-- 图片预览对话框 -->
    <el-dialog :title="image.title" v-model="image.open" width="240px">
      <img style="width: 200px; height: 200px" :src="image.imgUrl" />
    </el-dialog>

    <!-- 种植计划对话框 -->
    <el-dialog v-model="batchTask.open" :title="batchTask.title" width="1300px">
      <div style="height: 500px; width: 100%; overflow: auto">
        <!-- <Task :batchId="batchTask.batchId" :tableBorder="true" /> -->
        <Task :batchId="batchTask.batchId" :tableBorder="true" />
      </div>
    </el-dialog>

    <!-- 采摘详情对话框 -->
    <el-dialog
      :title="processData.length ? '采摘详情' : '收获'"
      v-model="processDialogVisible"
      width="70%"
    >
      <div style="display: flex; justify-content: flex-end; padding-bottom: 10px">
        <el-button
          v-if="canAddHarvest"
          type="success"
          size="small"
          plain
          @click="addProcess('Add', currentBatchId ?? undefined, currentVegetableId ?? undefined)"
        >新增</el-button>
      </div>
      <div class="harvest-card-grid">
        <el-row :gutter="20">
          <el-col :span="24" v-for="item in processData" :key="item.id">
            <el-card class="harvest-card" shadow="hover">
              <div class="harvest-card-content">
                <!-- 左侧二维码 -->
                <div class="qr-code-section">
                  <div class="qr-code">
                    <img :src="item.barcode" alt="二维码" />
                  </div>
                  <div class="id-code">ID溯源码: {{ item.id }}</div>
                </div>
                <!-- 中间信息区域 -->
                <div class="info-section">
                  <div class="header-title">
                    <span class="food-name">{{ item.name }}</span>
                    <el-tag
                      :type="
                        getQualityTagType(item.status) as
                          | 'success'
                          | 'info'
                          | 'warning'
                          | 'danger'
                          | 'primary'
                      "
                      size="small"
                    >
                      {{ statusDict[String(item.status)] }}
                    </el-tag>
                  </div>
                  <div class="harvest-info">
                    <div class="info-row">
                      <div class="info-item">
                        <i class="el-icon-date"></i>
                        <span class="label">采摘日期:</span>
                        <span>{{ item.date }}</span>
                      </div>
                      <!-- 只在有蔬菜重量时显示 -->
                      <div class="info-item" v-if="item.cuisineWeight">
                        <i class="el-icon-shopping-cart-full"></i>
                        <span class="label">蔬菜重量:</span>
                        <span>{{ item.cuisineWeight }}kg</span>
                      </div>
                    </div>
                    <div class="info-row">
                      <div class="info-item">
                        <i class="el-icon-location"></i>
                        <span class="label">分区 ID:</span>
                        <span>{{ item.iaPartitionId }}</span>
                      </div>
                      <div class="info-item">
                        <i class="el-icon-notebook-2"></i>
                        <span class="label">备注:</span>
                        <span>{{ item.description || '暂无备注' }}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </el-card>
          </el-col>
        </el-row>
      </div>
      <template #footer>
        <el-button size="small" @click="processDialogVisible = false">关闭</el-button>
      </template>
    </el-dialog>

    <!-- 新增采摘记录弹窗 -->
    <el-dialog title="新增" v-model="addDialogVisible" width="600px">
      <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="100px">
        <el-form-item label="食品名称" prop="name" >
          <el-select 
            multiple size="small"
            v-model="addForm.name"
            placeholder="请选择食品名称"
            :disabled="foodNameOptions.length === 1"
          >
            <el-option v-for="opt in foodNameOptions" :key="opt" :label="opt" :value="opt" />
          </el-select>
        </el-form-item>
        <!-- 蔬菜相关 -->
        <el-form-item v-if="isVegetable" label="蔬菜重量" prop="cuisineWeight">
          <el-input v-model="addForm.cuisineWeight" type="number" style="width: 80%" />
          <span style="margin-left: 8px">kg</span>
        </el-form-item>
        <el-form-item v-if="isVegetable" label="蔬菜质量" prop="cuisineStatus">
          <el-select v-model="addForm.cuisineStatus" placeholder="请选择">
            <el-option label="不合格" value="0" />
            <el-option label="合格" value="1" />
            <el-option label="优秀" value="2" />
          </el-select>
        </el-form-item>
        <el-form-item label="日期" prop="date">
          <el-date-picker
            v-model="addForm.date"
            type="datetime"
            placeholder="选择日期时间"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="备注信息" prop="description">
          <el-input v-model="addForm.description" type="textarea" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button size="small" @click="addDialogVisible = false">关闭</el-button>
        <el-button size="small" type="primary" @click="handleAddSave">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
  import { ref, reactive, onMounted, watch, computed } from 'vue'
  import { ElMessage } from 'element-plus'
  import { AgricultureClassService } from '@/api/agriculture/classApi'
  import { AgricultureCropBatchService } from '@/api/agriculture/cropBatchApi'
  import { UserService } from '@/api/system/userApi'
  import Task from '../plan/batchTask/TaskList.vue'
  import { partitionFoodService } from '@/api/agriculture/partitionFoodApi'
  import { AgricultureCropBatchTaskService } from '@/api/agriculture/cropBatchTaskApi'
  import {
    Search,
    Refresh,
    Download,
    Menu,
    User,
    FullScreen,
    Calendar,
    House
  } from '@element-plus/icons-vue'
  import { AgriculturePastureService } from '@/api/agriculture/pastureApi'

  // 工具函数，格式化时间
  function parseTime(time: string | number | Date, format = '{y}-{m}-{d}') {
    if (!time) return ''
    const date = new Date(time)
    const y = date.getFullYear()
    const m = date.getMonth() + 1
    const d = date.getDate()
    return format
      .replace('{y}', y.toString())
      .replace('{m}', m.toString().padStart(2, '0'))
      .replace('{d}', d.toString().padStart(2, '0'))
  }

  function formatDateTime(date: string | Date): string {
    if (!date) return ''
    const d = new Date(date)
    const y = d.getFullYear()
    const m = (d.getMonth() + 1).toString().padStart(2, '0')
    const day = d.getDate().toString().padStart(2, '0')
    const h = d.getHours().toString().padStart(2, '0')
    const min = d.getMinutes().toString().padStart(2, '0')
    const s = d.getSeconds().toString().padStart(2, '0')
    return `${y}-${m}-${day} ${h}:${min}:${s}`
  }

  const queryFormRef = ref()
  const showSearch = ref(true)
  const batchList = ref<any[]>([])
  const germplasmList = ref<any[]>([])
  const userList = ref<any[]>([])
  const pastureList = ref<any[]>([])

  const image = reactive({
    baseUrl: window.location.origin + import.meta.env.VITE_APP_BASE_API,
    open: false,
    imgUrl: '',
    title: ''
  })

  const batchTask = reactive({
    open: false,
    title: '',
    batchId: undefined as number | undefined,
    vegDone: false, // 标记蔬菜任务是否完成
    hasHarvestRecord:''
  })

  const queryParams = reactive({
    batchName: '',
    germplasmId: ''
  })

  const processData = ref<any[]>([])
  const processDialogVisible = ref(false)
  const addDialogVisible = ref(false)
  const addForm = reactive({
    name: [] as string[],
    weight: '',
    date: '',
    cuisineStatus: '',
    description: '',
    iaPartitionId: '',
    cuisineWeight: ''
  })
  // 食品名称可选项
  const foodNameOptions = ref<string[]>([])
  const addFormRules: any = {
    name: [{ required: true, type: 'array', min: 1, message: '请选择食品名称', trigger: ['blur', 'change'] }],
    cuisineWeight: [{ required: true, message: '请输入蔬菜重量', trigger: ['blur', 'change'] }],
    date: [{ required: true, message: '请选择日期', trigger: ['blur', 'change'] }],
    cuisineStatus: [{ required: true, message: '请选择蔬菜食品质量', trigger: ['blur', 'change'] }]
    // description: [{ required: true, message: '请输入备注信息', trigger: ['blur', 'change'] }]
  }
  const addFormRef = ref()
  const currentBatchId = ref<string | number | null>(null)
  const currentVegetableId = ref<number | null>(null)

  const statusDict: { [key: string]: string } = {
    '0': '不及格',
    '1': '及格',
    '2': '优秀'
  }

  function getQualityTagType(status: string | number) {
    const types: Record<string, string> = {
      '0': 'danger',
      '1': 'warning',
      '2': 'success'
    }
    return types[String(status)] || 'info'
  }

  const canAddHarvest = computed(() => {
    // 当前分区下已采摘的种质名
    const pickedNames = processData.value.map((item: any) => item.name)
    const options: string[] = []
    if (batchTask.vegDone && currentVegetableId.value) {
      const vegClass = germplasmList.value.find((c: any) => c.classId == currentVegetableId.value)
      if (vegClass && !pickedNames.includes(vegClass.className)) {
        options.push(vegClass.className)
      }
    }
    return options.length > 0
  })

  function addProcess(
    title: string,
    iaPartitionId?: string | number | null,
    vegetableId?: number
  ) {
    // 当前分区下已采摘的种质名
    const pickedNames = processData.value.map((item: any) => item.name)
    const options: string[] = []
    if (vegetableId && batchTask.vegDone) {
      const vegClass = germplasmList.value.find((c: any) => c.classId == vegetableId)
      if (vegClass && !pickedNames.includes(vegClass.className)) {
        options.push(vegClass.className)
      }
    }
    foodNameOptions.value = options
    Object.assign(addForm, {
      name: options,
      cuisineWeight: '',
      date: '',
      description: '',
      iaPartitionId: iaPartitionId ? String(iaPartitionId) : ''
    })
    addDialogVisible.value = true
  }

  const handleAddSave = () => {
    let fields = ['name', 'date', 'description']
    if (isVegetable.value) {
      fields.push('cuisineWeight', 'cuisineStatus')
    }
    addFormRef.value.validateField(fields, async (valid: boolean) => {
      if (!valid) return
      try {
        const formData = {
          ...addForm,
          date: formatDateTime(addForm.date)
        }
        const addList = []

        // 遍历用户选择的食品名称
        for (const name of formData.name) {
          const classObj = germplasmList.value.find((c: any) => c.className === name)
          if (!classObj) continue
          if (classObj.type === 'vegetable') {
            addList.push({
              iaPartitionId: formData.iaPartitionId,
              cuisineWeight: formData.cuisineWeight,
              fishWeight: '',
              weight: formData.cuisineWeight,
              name,
              date: formData.date,
              description: formData.description,
              status: formData.cuisineStatus,
              cuisineStatus: formData.cuisineStatus,
              fishStatus: '',
              foodType: 'cuisine'
            })
          }
        }

        // 并发保存
        await Promise.all(addList.map((item) => partitionFoodService.addFood(item)))
        ElMessage.success('新增成功')
        addDialogVisible.value = false
        if (currentBatchId.value) {
          // 获取当前分区详情
          const batchRes = await AgricultureCropBatchService.getBatch(currentBatchId.value);
          if (batchRes.data) {
            // 设置 harvest 字段为 "0"
            const updatedBatch = { ...batchRes.data, harvest: "0" };
            // 调用更新接口
            await AgricultureCropBatchService.updateBatch(updatedBatch);
          }
        }
        await getList()
        // 新增：自动弹出采摘详情弹窗，用户新增后无需手动点击即可查看详情
        processDialogVisible.value = true // 打开详情弹窗
        await fetchProcessData(currentBatchId.value as string | number) // 拉取当前批次的采摘详情数据
      } catch (e) {
        ElMessage.error('新增失败，请重试')
      }
    })
  }

  // 获取种质名
  function getClassName(classId: string | number) {
    const found = germplasmList.value.find((c: any) => c.classId == classId)
    return found ? found.className : ''
  }

  // 分页总条数
  const total = ref(0)
  // 当前页码
  const pageNum = ref(1)
  // 每页条数
  const pageSize = ref(9)

  async function getList() {
    // 1. 获取所有批次数据（分页参数传递给后端）
    const res = await AgricultureCropBatchService.listBatch({
      batchName: queryParams.batchName,
      germplasmId: queryParams.germplasmId,
      pageNum: pageNum.value, // 当前页码
      pageSize: pageSize.value // 每页条数
    })
    const allBatches = (res as any).rows || []
    total.value = (res as any).total || 0 // 赋值总条数

    // 2. 并发获取每个批次下的任务列表
    const batchTasks = await Promise.all(
      allBatches.map(async (batch: any) => {
        const taskRes = await AgricultureCropBatchService.getBatchTasks(batch.batchId)
        return { batch, tasks: (taskRes as any).data || [] }
      })
    )

    // 3. 只保留所有任务都为已完成（status === '3'）的批次
    const filteredBatches: any[] = []
    for (const { batch, tasks } of batchTasks) {
      // 只保留蔬菜任务（fishDish === 1）
      const vegTasks = tasks.filter((task: any) => task.fishDish === 1);

      // 判断蔬菜任务是否全部完成
      const vegDone = vegTasks.length > 0 && vegTasks.every((task: any) => String(task.status) === '3');

      // 蔬菜任务完成就显示
      if (vegDone) {
        // 标记蔬菜任务完成
        batch.vegDone = vegDone;
        filteredBatches.push(batch);
      }
    }

    // 4. 查询采摘记录
    for (const batch of filteredBatches) {
      // 拼接种质名（只显示蔬菜）
      const vegetableClass = germplasmList.value.find((c: any) => c.classId == (batch as any).vegetableId)
      if (vegetableClass) {
        batch.displayClassName = vegetableClass.className
      } else {
        batch.displayClassName = ''
      }
      const res = await partitionFoodService.page({
        partitionId: batch.batchId,
        pageNum: 1,
        pageSize: 1
      })
      batch.hasHarvestRecord = res.rows && res.rows.length > 0
    }

    // 5. 更新页面显示的批次列表
    batchList.value = filteredBatches
  }

  // 每页条数变化时触发
  function handleSizeChange(val: number) {
    pageSize.value = val
    pageNum.value = 1 // 切换每页条数时重置到第一页
    getList()
  }
  // 当前页码变化时触发
  function handleCurrentChange(val: number) {
    pageNum.value = val
    getList()
  }

  // 获取种质列表
  async function getGermplasmList() {
    const res = await AgricultureClassService.listClass({})
    germplasmList.value = (res.rows || []).map((item: any) => ({
      ...item,
      type: 'vegetable' // 只保留蔬菜类型
    }))
    console.log('germplasmList:', germplasmList.value)
  }

  // 获取用户列表
  async function getUserList() {
    const res = await UserService.listUser({})
    userList.value = res.rows || []
  }

  // 搜索
  function handleQuery() {
    getList()
  }

  // 重置
  function resetQuery() {
    if (queryFormRef.value) queryFormRef.value.resetFields()
    handleQuery()
  }

  // 导出
  function handleExport() {
    AgricultureCropBatchService.exportExcel(queryParams).then((res) => {
      const link = document.createElement('a')
      link.setAttribute('download', `batch_${Date.now()}.xlsx`)
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    })
  }

  // 批次任务
  function handleBatchTask(row: any) {
    batchTask.open = true
    batchTask.title = '种植计划'
    batchTask.batchId = row.batchId ? Number(row.batchId) : undefined
    batchTask.hasHarvestRecord = row.hasHarvestRecord;
  }

  function getClassImage(germplasmId: string | number) {
    const found = germplasmList.value.find((c: any) => String(c.classId) === String(germplasmId))
    return found ? found.classImage : ''
  }

  // 获取当前批次的所有种质图片（蔬菜）
  function getClassImages(item: any) {
    const images = []
    if (item.vegetableId) {
      // 获取蔬菜图片
      const vegImg = getClassImage(item.vegetableId)
      // 有图片则加入数组
      if (vegImg) images.push(vegImg)
    }
    // 没有图片时用默认图片
    if (images.length === 0) images.push('默认图片地址')
    // 返回图片数组
    return images
  }

  async function openHarvestDialog(batchId: string | number, vegDone: boolean, hasHarvestRecord: boolean) {
    currentBatchId.value = batchId
    // 请求分区详情，获取种质
    const res = await AgricultureCropBatchService.getBatch(batchId)
    if (res.data && (res.data as any).vegetableId) {
      currentVegetableId.value = Number((res.data as any).vegetableId)
    }
    batchTask.vegDone = vegDone

    if (!hasHarvestRecord) {
      // 直接弹出新增弹窗
      addProcess(
        'Add',
        currentBatchId.value ?? undefined,
        currentVegetableId.value ?? undefined
      )
    } else {
      // 还是弹出详情弹窗
      processDialogVisible.value = true
      await fetchProcessData(batchId)
    }
  }

  async function fetchProcessData(batchId: string | number) {
    if (!batchId) return
    const res = await partitionFoodService.page({
      partitionId: batchId,
      pageNum: 1,
      pageSize: 100
    })
    console.log('采摘分页返回', res)
    processData.value = res.rows || []
  }

  async function getPastureList() {
    const res = await AgriculturePastureService.listPasture({})
    pastureList.value = res.rows || []
  }

  function getPastureName(pastureId: string | number) {
    const found = pastureList.value.find((item: any) => String(item.id) === String(pastureId))
    return found ? found.name : pastureId
  }

  const isVegetable = ref(true) // 只保留蔬菜

  // 监听食品名称变化
  watch(
    () => addForm.name,
    (val: string[]) => {
      isVegetable.value = val.some((name) =>
        germplasmList.value.find((c) => c.className === name && c.type === 'vegetable')
      )
    }
  )

  onMounted(() => {
    getList()
    getGermplasmList()
    getUserList()
    getPastureList()
  })
</script>

<style lang="scss" scoped>
  .form-top {
    margin: 10px 10px 0;
    display: flex;
    justify-content: space-between;
    align-items: center;

    .demo-form-inline {
      height: 50px;
    }

    .inpname {
      width: 240px;
    }
  }

  .plant-do {
    // height: 100px;
    margin-left: 10px;
    display: flex;
    justify-content: space-between;
    align-items: center;

    .do-right {
      width: 40%;
      display: flex;
      justify-content: space-between;
      align-items: center;

      .desc-item {
        display: flex;
        align-items: center;
        font-size: 14px;

        p {
          margin-right: 10px;
        }

        ul {
          font-size: 12px;
          display: flex;

          .dot {
            width: 10px;
            height: 10px;
          }

          li {
            height: 20px;
            display: flex;
            align-items: center;
            margin-right: 8px;
            width: 50px;

            &:first-child {
              color: #fa7c01;
            }

            &:nth-child(2) {
              color: #0cbf5b;
            }

            &:nth-child(3) {
              color: #019fe8;
            }
          }
        }
      }
    }
  }

  .plant-table {
    margin: 10px;
  }

  .table-content {
    .dp-name {
      color: #0cbf5b;
    }

    .do-text {
      font-size: 12px;
    }

    .txt-btn {
      font-size: 12px;
      margin: 0 5px;
    }
  }

  .page-block {
    display: flex;
    justify-content: flex-end;
    margin-top: 10px;
  }

  :deep(.el-select) {
    width: 200px !important;
    .el-input__inner {
      height: 40px !important;
      line-height: 40px !important;
      font-size: 16px;
    }
  }

  :deep(.el-date-editor.el-input) {
    width: 100%;
  }

  .batch-card-grid {
    padding: 20px;

    .el-row {
      margin: -12px;
    }

    .el-col {
      padding: 22px 12px 22px 12px;
    }
  }

  .batch-card {
    height: 100%;
    background: white;
    border-radius: 16px;
    padding: 16px;
    transition: all 0.3s ease;
    border: 1px solid rgba(0, 0, 0, 0.05);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);

    .batch-card-header {
      margin-bottom: 16px;
      display: flex;
      justify-content: space-between;
      align-items: flex-start;

      .header-content {
        .section-name {
          font-size: 12px;
          color: #909399;
          margin-bottom: 4px;
        }

        .batch-name {
          font-size: 16px;
          font-weight: 600;
          color: #333;
        }
      }

      .el-tag {
        border-radius: 4px;
        padding: 0 8px;
      }
    }

    .batch-image {
      width: 100%;
      height: 180px;
      border-radius: 8px;
      overflow: hidden;
      cursor: pointer;
      margin-bottom: 16px;

      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        transition: transform 0.3s ease;
      }

      &:hover img {
        transform: scale(1.05);
      }
    }

    .batch-card-content {
      padding: 0;

      .batch-info {
        display: grid;
        grid-template-columns: 1fr;
        gap: 12px;

        .info-item {
          font-size: 13px;
          display: flex;
          align-items: center;

          i {
            color: #409eff;
            margin-right: 8px;
            font-size: 14px;
          }

          .label {
            color: #666;
            margin-right: 8px;
          }
        }
      }
    }

    .batch-card-actions {
      margin-top: 20px;
      padding-top: 20px;
      border-top: 1px solid #ebeef5;
      display: flex;
      gap: 8px;
      justify-content: flex-end;

      .el-button {
        padding: 6px 12px;
        height: 32px;
        border-radius: 4px;
        margin: 0;
        transition: all 0.3s ease;

        &.el-button--primary {
          background-color: #f2f6fc;
          border-color: transparent;
          color: #409eff;

          &:hover {
            background-color: #409eff;
            color: #ffffff;
            transform: translateY(-2px);
            box-shadow: 0 2px 8px rgba(64, 158, 255, 0.2);
          }
        }

        &.el-button--warning {
          background-color: #fdf6ec;
          border-color: transparent;
          color: #e6a23c;

          &:hover {
            background-color: #e6a23c;
            color: #ffffff;
            transform: translateY(-2px);
            box-shadow: 0 2px 8px rgba(230, 162, 60, 0.2);
          }
        }
      }
    }

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 12px 32px rgba(0, 0, 0, 0.12);
    }
  }

  // 响应式布局
  @media screen and (max-width: 1400px) {
    .el-col {
      width: 50% !important;
    }
  }

  @media screen and (max-width: 992px) {
    .el-col {
      width: 100% !important;
    }
  }

  .harvest-card-grid {
    .el-row {
      margin: -10px;
    }

    .el-col {
      padding: 10px;
    }
  }

  .harvest-card {
    transition: all 0.3s ease;

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
    }

    .harvest-card-content {
      display: flex;
      align-items: stretch;
      gap: 20px;

      .qr-code-section {
        flex: 0 0 180px;
        text-align: center;
        padding: 10px;
        border-right: 1px solid #ebeef5;

        .qr-code {
          margin-bottom: 10px;

          img {
            width: 150px;
            height: 150px;
            object-fit: contain;
          }
        }

        .id-code {
          font-size: 12px;
          color: #000000;
          font-weight: 500;
        }
      }

      .info-section {
        flex: 1;
        padding: 10px;

        .header-title {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;

          .food-name {
            font-size: 18px;
            font-weight: 600;
            color: #303133;
          }
        }

        .harvest-info {
          display: flex;
          flex-direction: column;
          gap: 15px;

          .info-row {
            display: flex;
            gap: 30px;

            .info-item {
              flex: 1;
              display: flex;
              align-items: center;
              font-size: 14px;

              i {
                color: #409eff;
                margin-right: 8px;
                font-size: 16px;
              }

              .label {
                color: #606266;
                margin-right: 8px;
                min-width: 70px;
              }

              span:last-child {
                color: #303133;
                flex: 1;
                word-break: break-all;
              }
            }
          }
        }
      }
    }
  }

  :deep(.el-form-item__label) {
    line-height: 40px !important;
    height: 40px !important;
  }
  .custom-pagination {
    display: flex; // 使用flex布局
    justify-content: center; // 水平居中
    align-items: center; // 垂直居中（可选）
    margin: 24px 0 0 0; // 上外边距
    padding: 0 24px 12px 0; // 内边距
  }

  .form-label-strong {
    color: #222;
    font-weight: bold;
    font-size: 14px;
  }
  .form-input-large :deep(.el-input__inner),
  .form-input-large :deep(.el-select__wrapper) {
    height: 35px !important;
    line-height: 35px !important;
    font-size: 14px !important;
  }

  :deep(.form-btn-large),
  :deep(.form-btn-large .el-button) {
    height: 30px !important;
    min-height: 30px !important;
    font-size: 12px !important;
    padding: 0 12px !important;
    border-radius: 4px !important;
    display: flex;
    align-items: center;
  }

  // 搜索和导出按钮样式：透明背景，灰色边框和文字
  :deep(.search-btn) {
    background-color: transparent !important;
    border-color: #dcdfe6 !important;
    color: #606266 !important;
    
    &:hover {
      background-color: transparent !important;
      border-color: #dcdfe6 !important;
      color: #606266 !important;
    }
  }

  :deep(.export-btn) {
    background-color: transparent !important;
    border-color: #dcdfe6 !important;
    color: #606266 !important;
    
    &:hover {
      background-color: transparent !important;
      border-color: #dcdfe6 !important;
      color: #606266 !important;
    }
  }

  .app-container-sm {
    min-height: 80vh;
    background: #f5f7fa;
    box-sizing: border-box;
    padding-bottom: 24px;
  }

  .batch-card-grid {
    min-height: calc(100vh - 150px); // 200px根据你头部/表单高度调整
    // background: #f5f7fa; // 你想要的背景色
  }

  .dialog-footer-btn {
    padding: 0 12px;
    height: 30px;
    font-size: 15px;
  }
</style>
