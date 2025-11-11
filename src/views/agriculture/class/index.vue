<template>
  <div class="page-content">
    <el-form :model="queryParams" ref="queryRef" label-width="82px">
      <el-row :gutter="20">
        <el-col :xs="24" :sm="12" :lg="6">
          <el-form-item :label="`作物名称`" :prop="`className`">
            <el-input placeholder="请输入作物名称" v-model="queryParams.className" @keyup.enter="handleQuery" />
          </el-form-item>
        </el-col>
        <el-col :xs="24" :sm="12" :lg="6">
          <el-form-item :label="`类别`" :prop="`category`">
            <el-select v-model="queryParams.category" clearable placeholder="请选择类别" style="width: 100%">
              <el-option label="瓜果" value="fruit" />
              <el-option label="蔬菜" value="vegetable" />
              <el-option label="其他" value="other" />
            </el-select>
          </el-form-item>
        </el-col>
        <div style="width: 12px"></div>
        <el-col :xs="24" :sm="12" :lg="6">
          <el-button @click="handleQuery" v-ripple>搜索 </el-button>
          <el-button @click="resetForm(queryRef)" v-ripple>重置 </el-button>
          <el-button @click="handleAdd" v-ripple>新增 </el-button>
          <el-button @click="handleExport" v-ripple>导出 </el-button>
        </el-col>
      </el-row>
    </el-form>

    <el-row :gutter="20">
      <el-col :xs="24" :sm="12" :md="6" v-for="item in classList" :key="item.classId" style="margin-bottom: 20px">
        <class-card :class-name="item.className" :class-type-name="item.category" :class-image="item.classImage"
          :class-type="item.category">
          <template #button>
            <el-button type="primary" size="small" @click="handleUpdate(item)" class="action-button" v-ripple>
              <el-icon>
                <EditPen />
              </el-icon>
              修改
            </el-button>
            <el-button type="danger" size="small" @click="handleDelete(item)" class="action-button" v-ripple>
              <el-icon>
                <Delete />
              </el-icon>
              删除
            </el-button>
            <el-button size="small" @click="handleJob(item)" class="action-button el-button--job" v-ripple>
              <el-icon>
                <Connection />
              </el-icon>
              流程
            </el-button>
            <el-button size="small" @click="handleReport(item)" class="action-button el-button--ai" v-ripple>
              <el-icon>
                <Cpu />
              </el-icon>
              智能
            </el-button>
          </template>
        </class-card>
      </el-col>
    </el-row>

    <el-pagination :hide-on-single-page="true" class="pagination-container" :total="total"
      :current-page="queryParams.pageNum" :page-size="queryParams.pageSize" @size-change="handleSizeChange"
      @current-change="handleCurrentChange" layout="prev, pager, next" style="float: right" />

    <!-- 添加或修改作物信息对话框 -->
    <el-dialog :title="title" v-model="open" width="500px" append-to-body>
      <el-form ref="classRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="作物名称" prop="className">
          <el-input v-model="form.className" placeholder="请输入作物名称" />
        </el-form-item>
        <el-form-item label="类别" prop="category">
          <el-select v-model="form.category" clearable placeholder="请选择类别" style="width: 100%">
            <el-option label="瓜果" value="fruit" />
            <el-option label="蔬菜" value="vegetable" />
            <el-option label="其他" value="other" />
          </el-select>
        </el-form-item>
        <el-form-item label="图片" prop="classImage">
          <div class="el-top upload-container">
            <el-upload class="cover-uploader" :action="uploadImageUrl" :headers="uploadHeaders" :show-file-list="false"
              :on-success="onSuccess" :on-error="onError" :before-upload="beforeUpload">
              <div v-if="!form.classImage" class="upload-placeholder">
                <el-icon class="upload-icon">
                  <Plus />
                </el-icon>
                <div class="upload-text">点击上传图片</div>
              </div>
              <img v-else :src="form.classImage" class="cover-image" />
            </el-upload>
          </div>
        </el-form-item>
        <el-form-item label="宣传语" prop="classDes">
          <el-input v-model="form.classDes" type="textarea" placeholder="请输入内容" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitForm">确 定</el-button>
          <el-button @click="cancel">取 消</el-button>
        </div>
      </template>
    </el-dialog>

    <el-dialog title="作业流程" v-model="jobOpen" width="40%" append-to-body>
      <class-job :class-id="form.classId" :class-name="form.className" :class-type-name="form.category"
        :class-type="form.category" v-if="jobOpen" />
    </el-dialog>

    <el-dialog title="智能分析" v-model="reportOpen" width="80%" append-to-body>
      <class-report :class-id="form.classId" :class-name="form.className" :class-image="form.classImage"
        :class-type-name="form.category" :class-type="form.category" v-if="reportOpen" />
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { AgricultureClassService } from '@/api/agriculture/classApi'
import { ref, reactive, computed, onMounted } from 'vue'
import { resetForm } from '@/utils/utils'
import { ElMessage, ElMessageBox } from 'element-plus'
import { FormInstance } from 'element-plus'
import { AgricultureClassResult } from '@/types/agriculture/class'
import EmojiText from '@/utils/emojo'
import ClassCard from './card.vue'
import ClassJob from './job.vue'
import ClassReport from './report.vue'
const classList = ref<AgricultureClassResult[]>([])
const open = ref(false)
const loading = ref(true)
const ids = ref([])
const total = ref(0)
const title = ref('')
const queryRef = ref()
const classRef = ref<FormInstance>()
const jobOpen = ref(false)
const reportOpen = ref(false)
import { useUserStore } from '@/store/modules/user'
const userStore = useUserStore()
let { accessToken } = userStore
// 传递 token
const uploadHeaders = { Authorization: accessToken }
// 上传路径
const uploadImageUrl = `${import.meta.env.VITE_API_BASE_URL}/common/upload`
import { EditPen, Delete, Connection, Cpu } from '@element-plus/icons-vue'
// 定义初始表单状态
const initialFormState = {
  classId: '',
  className: '',
  category: '', // 类别（fruit=瓜果,vegetable=蔬菜,grain=粮食,other=其他）
  classImage: '',
  classDes: null,
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
  pageSize: 8,
  className: '',
  category: '' // 类别筛选
})
const rules = reactive({
  className: [
    {
      required: true,
      message: '作物名称不能为空',
      trigger: 'blur'
    }
  ],
  category: [
    {
      required: true,
      message: '类别不能为空',
      trigger: 'change'
    }
  ],
  classImage: [
    {
      required: true,
      message: '作物图片不能为空',
      trigger: 'blur'
    }
  ]
})

// 上传成功后的处理函数
const onSuccess = (response: any) => {
  form.classImage = response.url
  ElMessage.success(`图片上传成功 ${EmojiText[200]}`)
}

// 上传失败后的处理函数
const onError = () => {
  ElMessage.error(`图片上传失败 ${EmojiText[500]}`)
}

// 上传前的校验函数
const beforeUpload = (file: File) => {
  const isImage = file.type.startsWith('image/')
  const isLt2M = file.size / 1024 / 1024 < 2

  if (!isImage) {
    ElMessage.error('只能上传图片文件!')
    return false
  }
  if (!isLt2M) {
    ElMessage.error('图片大小不能超过 2MB!')
    return false
  }
  return true
}

/** 查询作物信息列表 */
const getList = async () => {
  loading.value = true
  const res = await AgricultureClassService.listClass(queryParams)
  if (res.code === 200) {
    classList.value = res.rows
    total.value = res.total
    loading.value = false
  }
}

// 作业按钮
const handleJob = (row: any) => {
  reset()
  // 重置表单数据到初始状态
  Object.assign(form, row)
  jobOpen.value = true
}

// 分析按钮
const handleReport = (row: any) => {
  reset()
  // 重置表单数据到初始状态
  Object.assign(form, row)
  reportOpen.value = true
}

// 取消按钮
const cancel = () => {
  open.value = false
  reset()
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
const handleAdd = () => {
  reset()
  open.value = true
  title.value = '添加作物信息'
}

/** 修改按钮操作 */
const handleUpdate = async (row: any) => {
  reset()
  open.value = true
  title.value = '修改作物信息'
  Object.assign(form, row)
}

/** 提交按钮 */
const submitForm = async () => {
  if (!classRef.value) return
  await classRef.value.validate(async (valid) => {
    if (valid) {
      if (form.classId != null && form.classId != '') {
        const res = await AgricultureClassService.updateClass(form)
        if (res.code === 200) {
          ElMessage.success(res.msg)
          open.value = false
          getList()
        }
      } else {
        const res = await AgricultureClassService.addClass(form)
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
  const _classIds = row.classId || ids.value
  const Tr = await ElMessageBox.confirm('是否确认删除作物信息编号为"' + _classIds + '"的数据项？')
  if (Tr) {
    console.log(_classIds)
    const res = await AgricultureClassService.deleteClass(_classIds)
    if (res.code === 200) {
      getList()
      ElMessage.success(res.msg)
    }
  }
}

import { downloadExcel } from '@/utils/utils'

/** 导出按钮操作 */
const handleExport = () => {
  downloadExcel(AgricultureClassService.exportExcel(queryParams))
}
// 初始化
onMounted(() => {
  getList()
})
</script>
<style lang="scss" scoped>
.upload-container {
  .cover-uploader {
    position: relative;
    overflow: hidden;
    cursor: pointer;
    border-radius: 6px;
    transition: var(--el-transition-duration);

    &:hover {
      border-color: var(--el-color-primary);
    }

    .upload-placeholder {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      width: 260px;
      height: 160px;
      border: 1px dashed #d9d9d9;
      border-radius: 6px;

      .upload-icon {
        font-size: 28px;
        color: #8c939d;
      }

      .upload-text {
        margin-top: 8px;
        font-size: 14px;
        color: #8c939d;
      }
    }

    .cover-image {
      display: block;
      width: 260px;
      height: 160px;
      object-fit: cover;
    }
  }

  .el-upload__tip {
    margin-top: 8px;
    font-size: 12px;
    color: #666;
  }
}

.action-button {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  font-size: 11px;
  border: 1.5px solid #409eff !important;
  background: #fff !important;
  color: #409eff !important;
  border-radius: 10px !important;
  transition: all 0.3s ease;
  box-shadow: none !important;
  font-weight: 500;
  min-width: 36px;
  min-height: 28px;
  padding: 0 10px;
  position: relative;
  overflow: hidden;
  z-index: 1;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: #409eff;
    transform: translateX(-100%);
    transition: transform 0.3s ease;
    z-index: -1;
  }

  .el-icon {
    font-size: 16px;
    transition: color 0.3s ease;
  }

  &.el-button--primary:hover {
    color: #fff !important;
    border-color: #409eff !important;

    &::before {
      transform: translateX(0);
    }

    .el-icon {
      color: #fff;
    }
  }

  &.el-button--danger {
    border-color: #f56c6c !important;
    color: #f56c6c !important;
    background: #fff !important;

    &::before {
      background-color: #f56c6c;
    }
  }

  &.el-button--danger:hover {
    color: #fff !important;
    border-color: #f56c6c !important;

    &::before {
      transform: translateX(0);
    }

    .el-icon {
      color: #fff;
    }
  }

  //流程按钮
  &.el-button--job {
    border-color: #f7d00d !important;
    color: #f59608 !important;
    background: #fffbe6 !important;

    &::before {
      background-color: #db9806;
    }
  }

  &.el-button--job:hover {
    color: #fff !important;
    border-color: #af8e23 !important;

    &::before {
      transform: translateX(0);
    }

    .el-icon {
      color: #fff;
    }
  }

  //智能按钮
  &.el-button--ai {
    border-color: #b7eb8f !important;
    color: #389e0d !important;
    background: #f6ffed !important;

    &::before {
      background-color: #b7eb8f;
    }
  }

  &.el-button--ai:hover {
    color: #fff !important;
    border-color: #389e0d !important;

    &::before {
      transform: translateX(0);
    }

    .el-icon {
      color: #fff;
    }
  }
}
</style>
