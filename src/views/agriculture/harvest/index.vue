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
              <div class="batch-card-body">
                <!-- 左侧图片区域 -->
                <div class="batch-image">
                  <el-carousel
                    :interval="2000"
                    :arrow="getClassImages(item).length > 1 ? 'always' : 'never'"
                    height="280px"
                    indicator-position="none"
                    style="width: 100%"
                  >
                    <el-carousel-item
                      v-for="(img, idx) in getClassImages(item)"
                      :key="idx"
                    >
                      <img :src="img" alt="种质图片" />
                    </el-carousel-item>
                  </el-carousel>
                </div>
                
                <!-- 右侧内容区域 -->
                <div class="batch-content">
                  <!-- 批次名称和状态 -->
                  <div class="batch-card-header">
                    <div class="header-content">
                      <div class="batch-name">{{ item.batchName }}</div>
                    </div>
                    <el-tag :type="item.hasHarvestRecord ? 'success' : 'warning'" size="small">
                      {{ item.hasHarvestRecord ? '已采摘' : '已成熟' }}
                    </el-tag>
                  </div>
                  
                  <!-- 信息区域 -->
                  <div class="batch-card-info">
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
                      <span class="label">所属温室：</span>
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
                  
                  <!-- 操作按钮 -->
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
                </div>
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
        <Task :batchId="batchTask.batchId" :tableBorder="true" :readonly="true" />
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
                    <img v-if="item.barcode" :src="item.barcode" alt="二维码" />
                    <div v-else style="width: 150px; height: 150px; display: flex; align-items: center; justify-content: center; background: #f5f7fa; color: #909399;">
                      暂无二维码
                    </div>
                  </div>
                  <div class="id-code">ID: {{ item.id }}</div>
                </div>
                <!-- 中间信息区域 -->
                <div class="info-section">
                  <div class="header-title">
                    <span class="food-name">{{ getClassName(item.classId) }}</span>
                  </div>
                  <div class="harvest-info">
                    <div class="info-row">
                      <div class="info-item">
                        <i class="el-icon-date"></i>
                        <span class="label">采摘日期:</span>
                        <span>{{ item.date }}</span>
                      </div>
                      <div class="info-item">
                        <i class="el-icon-shopping-cart-full"></i>
                        <span class="label">采摘重量:</span>
                        <span>{{ item.weight }}kg</span>
                      </div>
                    </div>
                    <div class="info-row">
                      <div class="info-item">
                        <i class="el-icon-location"></i>
                        <span class="label">批次 ID:</span>
                        <span>{{ item.iaPartitionId }}</span>
                      </div>
                      <div class="info-item">
                        <i class="el-icon-menu"></i>
                        <span class="label">种质 ID:</span>
                        <span>{{ item.classId }}</span>
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
        <el-form-item label="种质" prop="classId">
          <el-select 
            size="small"
            v-model="addForm.classId"
            placeholder="请选择种质"
            :disabled="classIdOptions.length === 1"
          >
            <el-option 
              v-for="opt in classIdOptions" 
              :key="opt.classId" 
              :label="opt.className" 
              :value="opt.classId" 
            />
          </el-select>
        </el-form-item>
        <el-form-item label="采摘重量" prop="weight">
          <el-input v-model="addForm.weight" type="number" style="width: 80%" />
          <span style="margin-left: 8px">kg</span>
        </el-form-item>
        <el-form-item label="采摘日期" prop="date">
          <el-date-picker
            v-model="addForm.date"
            type="datetime"
            placeholder="选择日期时间"
            style="width: 100%"
          />
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
    classId: undefined as number | undefined,
    weight: undefined as number | undefined,
    date: '',
    iaPartitionId: ''
  })
  // 种质可选项
  const classIdOptions = ref<Array<{classId: number, className: string}>>([])
  const addFormRules: any = {
    classId: [{ required: true, message: '请选择种质', trigger: ['blur', 'change'] }],
    weight: [{ required: true, message: '请输入采摘重量', trigger: ['blur', 'change'] }],
    date: [{ required: true, message: '请选择采摘日期', trigger: ['blur', 'change'] }]
  }
  const addFormRef = ref()
  const currentBatchId = ref<string | number | null>(null)
  const currentVegetableId = ref<number | null>(null)


  const canAddHarvest = computed(() => {
    // 当前分区下已采摘的种质ID
    const pickedClassIds = processData.value.map((item: any) => item.classId)
    const options: Array<{classId: number, className: string}> = []
    if (batchTask.vegDone && currentVegetableId.value) {
      
      const classItem = germplasmList.value.find((c: any) => c.classId == currentVegetableId.value)
      if (classItem && !pickedClassIds.includes(Number(classItem.classId))) {
        options.push({
          classId: Number(classItem.classId),
          className: classItem.className
        })
      }
    }
    return options.length > 0
  })

  function addProcess(
    title: string,
    iaPartitionId?: string | number | null,
    classId?: number
  ) {
    // 当前分区下已采摘的种质ID
    const pickedClassIds = processData.value.map((item: any) => item.classId)
    const options: Array<{classId: number, className: string}> = []
    
    if (classId && batchTask.vegDone) {
      const classItem = germplasmList.value.find((c: any) => c.classId == classId)
      if (classItem && !pickedClassIds.includes(Number(classItem.classId))) {
        options.push({
          classId: Number(classItem.classId),
          className: classItem.className
        })
      }
    }
    classIdOptions.value = options
    Object.assign(addForm, {
      classId: options.length === 1 ? options[0].classId : undefined,
      weight: undefined,
      date: '',
      iaPartitionId: iaPartitionId ? String(iaPartitionId) : ''
    })
    addDialogVisible.value = true
  }

  const handleAddSave = () => {
    const fields = ['classId', 'weight', 'date']
    addFormRef.value.validateField(fields, async (valid: boolean) => {
      if (!valid) return
      try {
        const formData = {
          iaPartitionId: addForm.iaPartitionId,
          classId: addForm.classId,
          weight: Number(addForm.weight),
          date: formatDateTime(addForm.date)
        }

        // 保存采摘记录
        await partitionFoodService.addFood(formData)
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
      const allTasksDone = tasks.length > 0 && tasks.every((task: any) => String(task.status) === '3');

      // 所有任务完成就显示
      if (allTasksDone) {
        // 标记任务完成
        batch.vegDone = allTasksDone;
        filteredBatches.push(batch);
      }
    }

    // 4. 查询采摘记录
    for (const batch of filteredBatches) {
      // 拼接种质名（使用 classId 字段）
      let displayClassName = ''
      if ((batch as any).classId) {
        const classItem = germplasmList.value.find((c: any) => c.classId == (batch as any).classId)
        if (classItem) {
          displayClassName = classItem.className
        }
      }
      batch.displayClassName = displayClassName
      
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
    germplasmList.value = res.rows || []
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

  // 获取当前批次的所有种质图片
  function getClassImages(item: any) {
    const images = []
    // 使用 classId 获取种质图片
    if (item.classId) {
      const classImg = getClassImage(item.classId)
      if (classImg) images.push(classImg)
    }
    // 没有图片时用默认图片
    if (images.length === 0) images.push('默认图片地址')
    // 返回图片数组
    return images
  }

  async function openHarvestDialog(batchId: string | number, vegDone: boolean, hasHarvestRecord: boolean) {
    currentBatchId.value = batchId
    // 请求分区详情，获取种质（使用 classId 字段）
    const res = await AgricultureCropBatchService.getBatch(batchId)
    if (res.data && (res.data as any).classId) {
      currentVegetableId.value = Number((res.data as any).classId)
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


  onMounted(async () => {
    // 先加载种质列表，确保绑定种质信息时列表已准备好
    await getGermplasmList()
    await getList()
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
    padding: 0;
    transition: all 0.3s ease;
    border: 1px solid rgba(0, 0, 0, 0.05);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
    overflow: hidden;

    .batch-card-body {
      display: flex;
      height: 100%;
    }

    .batch-image {
      width: 280px;
      flex-shrink: 0;
      background: #f5f7fa;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;

      :deep(.el-carousel) {
        height: 100%;
        width: 100%;
      }

      :deep(.el-carousel__container) {
        height: 100%;
        width: 100%;
      }

      :deep(.el-carousel__item) {
        display: flex;
        align-items: center;
        justify-content: center;
        background: #f5f7fa;
      }

      img {
        max-width: 100%;
        max-height: 100%;
        width: auto;
        height: auto;
        object-fit: contain;
      }
    }

    .batch-content {
      flex: 1;
      display: flex;
      flex-direction: column;
      padding: 16px;
      min-width: 0;
    }

    .batch-card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;
      flex-shrink: 0;

      .header-content {
        flex: 1;
        min-width: 0;

        .batch-name {
          font-size: 16px;
          font-weight: 600;
          color: #333;
          line-height: 1.4;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
      }

      .el-tag {
        border-radius: 4px;
        padding: 2px 8px;
        margin-left: 8px;
        flex-shrink: 0;
      }
    }

    .batch-card-info {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 10px;
      margin-bottom: 12px;

      .info-item {
        font-size: 13px;
        display: flex;
        align-items: center;
        line-height: 1.5;

        .el-icon {
          color: #409eff;
          margin-right: 6px;
          font-size: 14px;
          flex-shrink: 0;
        }

        .label {
          color: #666;
          margin-right: 4px;
          flex-shrink: 0;
        }

        span:last-child {
          color: #333;
          flex: 1;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
      }
    }

    .batch-card-actions {
      display: flex;
      gap: 8px;
      justify-content: flex-end;
      flex-shrink: 0;
      padding-top: 12px;

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
