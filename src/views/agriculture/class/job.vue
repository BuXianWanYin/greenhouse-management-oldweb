<template>
  <div>
    <el-card> 
      <el-form :model="queryParams" ref="queryRef" :inline="true">
        <el-form-item label="名称" prop="jobName">
          <el-input
            v-model="queryParams.jobName"
            placeholder="请输入作业名称"
            clearable
            style="width: 160px"
            @keyup.enter.native="handleQuery"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleQuery">搜索</el-button>
          <el-button @click="resetForm(queryRef)" v-ripple>重置</el-button>
        </el-form-item>
        <el-form-item style="float: right">
          <el-button type="primary" @click="handleAdd" plain>新增</el-button>
          <el-button type="success" @click="handleAiAdd" plain>AI</el-button>
          <el-button type="warning" @click="handleExport" plain>导出</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card style="margin-top: 20px">
      <el-table v-loading="loading" :data="jobList">
        <el-table-column label="作业名称" align="center" prop="jobName" />
        <el-table-column label="起始" align="center" prop="jobStart">
          <template #default="{ row }">
            <span class="font-size-20 font-style-italic font-color-primary font-weight-bold">
              第{{ row.jobStart }}<dict-tag style="display:inline;margin-left:2px;" :options="agricultureCycleType" type="notag" :value="row.cycleUnit" />
            </span>
          </template>
        </el-table-column>
        <el-table-column label="结束周" align="center" prop="jobFinish">
          <template #default="{ row }">
            <span class="font-size-20 font-style-italic font-color-primary font-weight-bold">
              第{{ row.jobFinish }}<dict-tag style="display:inline;margin-left:2px;" :options="agricultureCycleType" type="notag" :value="row.cycleUnit" />
            </span>
          </template>
        </el-table-column>
        <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
          <template #default="{ row }">
            <el-button link @click="handleUpdate(row)">修改</el-button>
            <el-button link @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-pagination
        :hide-on-single-page="true"
        class="pagination-container"
        :total="total"
        :current-page="queryParams.pageNum"
        :page-size="queryParams.pageSize"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        layout="prev, pager, next"
        style="float: right"
      />
    </el-card>

    <!-- 添加或修改标准作业任务对话框 -->
    <el-dialog :title="title" v-model="open" width="500px" append-to-body>
      <el-form ref="jobRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="名称" prop="jobName">
          <el-input v-model="form.jobName" placeholder="请输入作业名称" />
        </el-form-item>
        <el-form-item label="周期单位" prop="cycleUnit">
          <el-select v-model="form.cycleUnit" clearable placeholder="请选择作业周期单位">
            <el-option
              v-for="dict in agricultureCycleType"
              :key="dict.value"
              :label="dict.label"
              :value="dict.value"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="起始周期" prop="jobStart">
          <el-input-number
            v-model="form.jobStart"
            controls-position="right"
            :min="0"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="结束周期" prop="jobFinish">
          <el-input-number
            v-model="form.jobFinish"
            controls-position="right"
            :min="0"
            style="width: 100%"
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
  import { AgricultureJobService } from '@/api/agriculture/jobApi'
  import { ref, reactive } from 'vue'
  import { resetForm } from '@/utils/utils'
  import { ElMessage, ElMessageBox } from 'element-plus'
  import { FormInstance } from 'element-plus'
  import { AgricultureJobResult } from '@/types/agriculture/job'
  const jobList = ref<AgricultureJobResult[]>([])
  const open = ref(false)
  const loading = ref(true)
  const total = ref(0)
  const title = ref('')
  const queryRef = ref()
  const jobRef = ref<FormInstance>()
  const prop = defineProps({
    classId: {
      type: [String, Number]
    },
    classTypeName: {
      type: String
    },
    className: {
      type: String
    },
    classType: {
      type: String
    }
  })
  // 定义初始表单状态
  const initialFormState = {
    jobId: null,
    classId: prop.classId,
    jobName: null,
    cycleUnit: '0',
    jobStart: 0,
    jobFinish: 0,
    status: null,
    createBy: null,
    createTime: null,
    updateBy: null,
    updateTime: null,
    remark: null
  }
  const form = reactive({ ...initialFormState })
  const queryParams = reactive({
    pageNum: 1,
    pageSize: 5,
    jobName: '',
    classId: prop.classId
  })
  const rules = reactive({
    jobName: [
      {
        required: true,
        message: '作业任务名称不能为空',
        trigger: 'blur'
      }
    ],
    jobStart: [
      {
        required: true,
        message: '起始周/天不能为空',
        trigger: 'blur'
      }
    ],
    jobFinish: [
      {
        required: true,
        message: '结束周/天不能为空',
        trigger: 'blur'
      }
    ]
  })

  /** 查询作业任务列表 */
  const getList = async () => {
    loading.value = true
    const res = await AgricultureJobService.listJob(queryParams)
    if (res.code === 200) {
      jobList.value = res.rows
      total.value = res.total
      loading.value = false
    }
  }

  /** 新增按钮操作 */
  const handleAdd = () => {
    reset()
    open.value = true
    title.value = '添加作业任务'
  }

  // 表单重置
  const reset = () => {
    // 重置表单数据到初始状态
    Object.assign(form, initialFormState)
  }

  /** 搜索按钮操作 */
  const handleQuery = () => {
    queryParams.pageNum = 1
    getList()
  }

  // 取消按钮
  const cancel = () => {
    open.value = false
    reset()
  }

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

  /** 修改按钮操作 */
  const handleUpdate = async (row: any) => {
    reset()
    Object.assign(form, row)
    open.value = true
    title.value = '修改作业任务'
  }

  /** 提交按钮 */
  const submitForm = async () => {
    if (!jobRef.value) return
    await jobRef.value.validate(async (valid) => {
      if (valid) {
        if (form.jobId != null) {
          const res = await AgricultureJobService.updateJob(form)
          if (res.code === 200) {
            ElMessage.success(res.msg)
            open.value = false
            getList()
          }
        } else {
          const res = await AgricultureJobService.addJob(form)
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
    const _jobIds = row.jobId
    const Tr = await ElMessageBox.confirm('是否确认删除作业任务编号为"' + _jobIds + '"的数据项？')
    if (Tr) {
      const res = await AgricultureJobService.deleteJob(_jobIds)
      if (res.code === 200) {
        getList()
        ElMessage.success(res.msg)
      }
    }
  }

  /** ai按钮操作 */
  const handleAiAdd = async () => {
    const res = await AgricultureJobService.aiAddJob({
      classId: prop.classId,
      classTypeName: prop.classTypeName,
      className: prop.className,
      classType: prop.classType
    })
    if (res.code === 200) {
      ElMessage.success(res.msg)
    }
  }

  import { useDict, DictType } from '@/utils/dict'
  const agricultureCycleType = ref<DictType[]>([]) // 周期类型字典数据
  const getuseDict = async () => {
    const { agriculture_cycle_type } = await useDict('agriculture_cycle_type')
    agricultureCycleType.value = agriculture_cycle_type
  }

  import { downloadExcel } from '@/utils/utils'

  /** 导出按钮操作 */
  const handleExport = () => {
    downloadExcel(AgricultureJobService.exportExcel(queryParams))
  }

  import { WebSocketType, WebSocketContant, WebSocketKey } from '@/enums/agricultureEnum'
  import { useWebSocketStore } from '@/store/modules/websocket'
  import { playAudio } from '@/utils/utils'
  const wsStore = useWebSocketStore()
  const getWebSocket = () => {
    // 注册AI作业消息处理器
    wsStore.registerMessageHandler(WebSocketKey.MQ, WebSocketType.AI_JOB_KEY, (data) => {
      // 处理AI作业消息
      ElNotification({
        title: WebSocketContant.AI_TITLE,
        type: 'success',
        showClose: false,
        duration: 5000,
        zIndex: 10000,
        customClass: 'ai-notification',
        message: `
          <div style="padding: 8px 8px 8px 4px; min-width: 350px;">
            <div style="font-weight: bold; margin-bottom: 8px; color: #409EFF; margin-left: -8px;">${data.id}</div>
            <div style="color: #606266; line-height: 1.5; margin-left: -8px;">${data.content}</div>
          </div>
        `,
        dangerouslyUseHTMLString: true
      })
      playAudio()
      // 刷新列表
      getList()
    })
  }

  // 初始化
  onMounted(() => {
    getList()
    getuseDict()
    getWebSocket()
  })
</script>

<style scoped>
:deep(.ai-notification) {
  min-width: 350px !important;
  max-width: 500px !important;
}

:deep(.ai-notification .el-notification__content) {
  min-width: 300px !important;
}
</style>
