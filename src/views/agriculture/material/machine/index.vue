<template>
  <div class="page-content">
    <!-- 搜索栏开始 -->
    <el-form :model="queryParams" ref="queryRef" label-width="82px">
      <el-row :gutter="20">
        <!-- 农资名称搜索项 -->
        <el-col :xs="24" :sm="12" :lg="6">
          <el-form-item label="机械名称" prop="machineName">
            <el-input
              placeholder="请输入机械名称"
              v-model="queryParams.machineName"
              @keyup.enter="handleQuery"
            />
          </el-form-item>
        </el-col>
        <div style="width: 12px"></div>
        <!-- 搜索、重置、新增、导出按钮区域 -->
        <el-col :xs="24" :sm="12" :lg="6">
          <el-button @click="handleQuery" v-ripple>搜索</el-button>
          <el-button @click="resetForm(queryRef)" v-ripple>重置</el-button>
          <el-button @click="handleAdd" v-auth="['agriculture:machine:add']" v-ripple>新增</el-button>
          <el-button @click="handleExport" v-auth="['agriculture:machine:export']" v-ripple>导出</el-button>
        </el-col>
      </el-row>
    </el-form>

    <el-row :gutter="8">
      <el-col :xs="24" :sm="12" :md="8" :lg="6" v-for="item in machineList" :key="item.machineId" style="margin-bottom: 8px;">
        <el-card shadow="hover" class="machine-card">
          <div class="card-content">
            <h3 class="card-title">
              <span class="title-label">机械名称</span>
              <span class="title-name">{{ item.machineName }}</span>
            </h3>
            <div class="card-image-container" v-if="item.machineImage">
              <img :src="item.machineImage" :alt="item.machineName" class="card-image" />
            </div>
            <div class="card-image-placeholder" v-else>
              <el-icon class="placeholder-icon"><PictureFilled /></el-icon>
            </div>
            <div class="card-info">
              <div class="card-details">
                <div class="detail-item">
                  <el-icon><ScaleToOriginal /></el-icon>
                  <span>计量单位 : {{ item.measureUnit }}</span>
                </div>
                <div class="detail-item">
                  <el-icon><Document /></el-icon>
                  <span>编码 : {{ item.machineCode }}</span>
                </div>
                <div class="detail-item">
                  <el-icon><ChatDotRound /></el-icon>
                  <span>状态 : {{ item.status === '0' ? '菜' : '鱼' }}</span>
                </div>
                <div class="detail-item">
                  <el-icon><ChatDotRound /></el-icon>
                  <span>备注 : {{ item.remark || '无' }}</span>
                </div>
              </div>
              <div class="card-actions">
                <el-button type="primary" size="small" @click="handleUpdate(item)" class="action-button">
                  <el-icon><Edit /></el-icon>
                  修改
                </el-button>
                <el-button type="danger" size="small" @click="handleDelete(item)" class="action-button">
                  <el-icon><Delete /></el-icon>
                  删除
                </el-button>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <div v-if="machineList.length > 8" class="custom-pagination">
      <span style="margin-right: 16px; font-size: 14px;">
        共 {{ machineList.length }} 条
      </span>
      <el-pagination
        background
        layout="sizes, prev, pager, next, jumper"
        :total="total"
        :page-size="queryParams.pageSize"
        :current-page="queryParams.pageNum"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :page-sizes="[9, 18, 27, 36]"
      />
    </div>

    <!-- 添加或修改机械信息对话框 -->
    <el-dialog :title="title" v-model="open" width="500px" append-to-body>
      <el-form ref="machineRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="机械编码" prop="machineCode">
          <el-input v-model="form.machineCode" placeholder="请输入机械编码" />
        </el-form-item>
        <el-form-item label="机械名称" prop="machineName">
          <el-input v-model="form.machineName" placeholder="请输入机械名称" />
        </el-form-item>
        <el-form-item label="计量单位" prop="measureUnit">
          <el-input v-model="form.measureUnit" placeholder="请输入计量单位" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-select v-model="form.status" placeholder="请选择(0是菜,1是鱼)" style="width: 100%">
            <el-option label="菜" :value="0" />
            <el-option label="鱼" :value="1" />
          </el-select>
        </el-form-item>
        <el-form-item label="机械图片" prop="machineImage">
          <div class="el-top upload-container">
            <el-upload
              class="cover-uploader"
              :action="uploadImageUrl"
              :headers="uploadHeaders"
              :show-file-list="false"
              :on-success="onSuccess"
              :on-error="onError"
              :before-upload="beforeUpload"
            >
              <div v-if="!form.machineImage" class="upload-placeholder">
                <el-icon class="upload-icon"><Plus /></el-icon>
                <div class="upload-text">点击上传图片</div>
              </div>
              <img v-else :src="form.machineImage" class="cover-image" />
            </el-upload>
          </div>
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="form.remark" type="textarea" placeholder="请输入内容" />
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
import { AgricultureMachineService } from "@/api/agriculture/machineApi";
import { ref, reactive } from 'vue'
import { resetForm } from '@/utils/utils'
import { ElMessage, ElMessageBox } from 'element-plus'
import { FormInstance } from 'element-plus'
import { AgricultureMachineResult } from '@/types/agriculture/machine'
import { Plus, Goods, Menu, ScaleToOriginal, Document, ChatDotRound, Edit, Delete, PictureFilled } from '@element-plus/icons-vue'
import { useUserStore } from '@/store/modules/user'
const machineList = ref<AgricultureMachineResult[]>([])
const open = ref(false);
const loading = ref(true);
const ids = ref([]);
const multiple = ref(true);
const total = ref(0);
const title = ref("");
const queryRef = ref()
const machineRef = ref<FormInstance>()
const userStore = useUserStore()
let { accessToken } = userStore
const uploadHeaders = { Authorization: accessToken }
const uploadImageUrl = `${import.meta.env.VITE_API_BASE_URL}/common/upload`
// 定义初始表单状态
const initialFormState = {
  machineId: null,
  machineCode: null,
  machineName: null,
  machineTypeId: null,
  measureUnit: null,
  remark: null,
  status: 0,
  orderNum: null,
  createBy: null,
  createTime: null,
  updateBy: null,
  updateTime: null,
  delFlag: null,
  machineImage: null,
}
const form = reactive({ ...initialFormState })
const queryParams = reactive({
  pageNum: 1,
  pageSize: 8,
  machineCode: '',
  machineName: '',
  machineTypeId: '',
  measureUnit: '',
  status: '',
  orderNum: '',
})
const rules = reactive({
  machineCode: [
    {
      required: true, message: "机械编码不能为空", trigger: "blur"
    }
  ],
  machineName: [
    {
      required: true, message: "机械名称不能为空", trigger: "blur"
    }
  ],
  measureUnit: [
    {
      required: true, message: "计量单位不能为空", trigger: "blur"
    }
  ],
  status: [
    {
      required: true, message: "状态不能为空", trigger: "change"
    }
  ],
  remark: [
    {
      required: true, message: "备注不能为空", trigger: "blur"
    }
  ],
  machineImage: [
    { required: true, message: "机械图片不能为空", trigger: "change" }
  ]
})


/** 查询机械信息列表 */
const getList = async () => {
  loading.value = true;
  const res = await AgricultureMachineService.listMachine(queryParams)
  if (res.code === 200) {
    machineList.value = res.rows;
    total.value = res.total;
    loading.value = false;
  }
}

const columns = reactive([
  { name: '机械ID', show: true },
  { name: '机械编码', show: true },
  { name: '机械名称', show: true },
  { name: '计量单位', show: true },
  { name: '备注', show: true },
  { name: '状态', show: true },
  { name: '排序', show: true },
])

const changeColumn = (list: any) => {
  columns.values = list
}

// 取消按钮
const cancel = () => {
  open.value = false;
  reset();
}

// 表单重置
const reset = () => {
  // 重置表单数据到初始状态
  Object.assign(form, initialFormState)
}

/** 搜索按钮操作 */
const handleQuery = () => {
  queryParams.pageNum = 1;
  getList();
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

// 多选框选中数据
const handleSelectionChange = (selection: any) => {
  ids.value = selection.map((item: any) => item.machineId);
  multiple.value = !selection.length;
}

/** 新增按钮操作 */
const handleAdd = () => {
  reset();
  open.value = true;
  title.value = "添加机械信息";
}

const handleUpdate = async (row: any) => {
  reset()
  open.value = true
  title.value = '修改机械信息'
  // 将状态值转换为数字类型，确保下拉框能正确显示
  const rowData = { ...row }
  if (rowData.status !== undefined) {
    rowData.status = rowData.status === '0' ? 0 : 1
  }
  Object.assign(form, rowData)
}

/** 提交按钮 */
const submitForm = async () => {
  if (!machineRef.value) return
  await machineRef.value.validate(async (valid) => {
    if (valid) {
      if (form.machineId != null) {
        const res = await AgricultureMachineService.updateMachine(form)
        if (res.code === 200) {
          ElMessage.success(res.msg)
          open.value = false;
          getList();
        }
      } else {
        const res = await AgricultureMachineService.addMachine(form)
        if (res.code === 200) {
          ElMessage.success(res.msg)
          open.value = false;
          getList();
        }
      }
    }
  });
}

/** 删除按钮操作 */
const handleDelete = async (row: any) => {
  const _machineIds = row.machineId || ids.value;
  const Tr = await ElMessageBox.confirm('是否确认删除机械信息编号为"' + _machineIds + '"的数据项？')
  if (Tr) {
    const res = await AgricultureMachineService.deleteMachine(_machineIds)
    if (res.code === 200) {
      getList()
      ElMessage.success(res.msg)
    }
  }
}


import { downloadExcel } from '@/utils/utils'

/** 导出按钮操作 */
const handleExport = () => {
  downloadExcel(AgricultureMachineService.exportExcel(queryParams))
}

// 上传成功
const onSuccess = (response: any) => {
  form.machineImage = response.url
  ElMessage.success('图片上传成功')
}
// 上传失败
const onError = () => {
  ElMessage.error('图片上传失败')
}
// 上传前校验
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

// 初始化
onMounted(() => {
  getList()
})
</script>

<style scoped>
.machine-card {
  transition: all 0.3s ease;
  height: 100%;
  border-radius: 12px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  background-color: var(--el-bg-color-overlay);
  min-height: 380px;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 12px 24px rgba(0, 0, 0, 0.15);
  }

  .card-content {
    display: flex;
    flex-direction: column;
    height: 100%;
    padding: 12px;
  }

  .card-image-container {
    width: 100%;
    height: 220px;
    overflow: hidden;
    border-radius: 8px;
    margin-bottom: 8px;
    flex-shrink: 0;
    background-color: var(--el-fill-color-light);

    .card-image {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.4s ease;
      cursor: pointer;

      &:hover {
        transform: scale(1.1);
      }
    }
  }

  .card-image-placeholder {
    width: 100%;
    height: 220px;
    background: var(--el-fill-color-light);
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 8px;
    margin-bottom: 8px;
    cursor: pointer;
    flex-shrink: 0;

    .placeholder-icon {
      font-size: 60px;
      color: var(--el-color-info-light-3);
    }
  }

  .card-info {
    flex: 1;
    display: flex;
    flex-direction: column;
  }

  .card-title {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 2px;
    margin: 0 0 8px 0;
    .title-label {
      color: #999;
      font-size: 14px;
      font-weight: 400;
      letter-spacing: 1px;
    }
    .title-name {
      color: #222;
      font-size: 18px;
      font-weight: 700;
      margin-top: 2px;
    }
  }

  .card-details {
    flex: 1;
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 8px;
    margin-bottom: 12px;
    margin-top: 8px;

    .detail-item {
      display: flex;
      align-items: center;
      color: var(--el-text-color-regular);
      font-size: 14px;

      .el-icon {
        margin-right: 8px;
        font-size: 16px;
        color: var(--el-color-info);
      }
    }
  }

  .card-actions {
    margin-top: auto;
    display: flex;
    justify-content: flex-end;
    gap: 8px;
    padding: 8px 12px;

    .action-button {
      position: relative;
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
      overflow: hidden;

      &::before {
        content: '';
        position: absolute;
        inset: 0;
        background-color: #409eff;
        transform: translateX(-100%);
        transition: transform 0.3s ease;
        z-index: 0;
      }

      .el-icon {
        font-size: 16px;
        position: relative;
        z-index: 1;
        transition: color 0.3s ease;
      }

      span {
        position: relative;
        z-index: 1;
        transition: color 0.3s ease;
      }

      &:hover {
        border-color: #409eff !important;
        color: #fff !important;

        &::before {
          transform: translateX(0);
        }

        .el-icon, span {
          color: #fff !important;
        }
      }

      &.el-button--danger {
        border-color: #f56c6c !important;
        color: #f56c6c !important;

        &::before {
          background-color: #f56c6c;
        }

        &:hover {
          border-color: #f56c6c !important;
          color: #fff !important;
        }
      }
    }
  }
}

.upload-container {
  .cover-uploader {
    position: relative;
    overflow: hidden;
    cursor: pointer;
    border-radius: 8px;
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
      border: 1px dashed var(--el-border-color-darker);
      border-radius: 6px;
      background-color: var(--el-fill-color-light);

      .upload-icon {
        font-size: 32px;
        color: var(--el-color-info-light-3);
      }

      .upload-text {
        margin-top: 8px;
        font-size: 14px;
        color: var(--el-text-color-secondary);
      }
    }

    .cover-image {
      display: block;
      width: 260px;
      height: 160px;
      object-fit: cover;
      border-radius: 8px;
    }
  }
}

.custom-pagination {
  display: flex;                /* 使用flex布局 */
  justify-content: center;      /* 水平居中 */
  align-items: center;          /* 垂直居中（可选） */
  margin: 24px 0 0 0;           /* 上外边距 */
  padding: 0 24px 12px 0;       /* 内边距 */
}
</style>
