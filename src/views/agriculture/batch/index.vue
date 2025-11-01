<template>
  <div class="page-content">
    <el-form :model="queryParams" ref="queryRef" label-width="82px">
      <el-row :gutter="20">
        <!-- 分区名称搜索项 -->
        <el-col :xs="24" :sm="12" :lg="6">
          <el-form-item label="分区名称" prop="batchName">
            <el-input
              placeholder="请输入分区名称"
              v-model="queryParams.batchName"
              @keyup.enter="handleQuery"
            />
          </el-form-item>
        </el-col>
        <el-col :xs="24" :sm="12" :lg="6">
          <el-form-item label="种质" prop="classId">
            <el-select
              v-model="queryParams.classId"
              placeholder="请选择种质"
              clearable
              filterable
              style="width: 100%"
            >
              <el-option
                v-for="item in classList"
                :key="item.classId"
                :label="item.className"
                :value="item.classId"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <div style="width: 12px"></div>
        <!-- 搜索、重置、新增、导出按钮区域 -->
        <el-col :xs="24" :sm="12" :lg="6">
          <el-button @click="handleQuery" v-ripple>搜索</el-button>
          <el-button @click="resetForm(queryRef)" v-ripple>重置</el-button>
          <el-button @click="handleAdd" v-auth="['agriculture:batch:add']" v-ripple>新增</el-button>
          <el-button @click="handleExport" v-auth="['agriculture:batch:export']" v-ripple>导出</el-button>
        </el-col>
      </el-row>
    </el-form>

    <!-- 卡片布局 -->
    <div class="card-container" v-loading="loading">
      <el-card v-for="item in batchList" :key="item.batchId" class="batch-card" shadow="hover">
        <template #header>
          <div class="card-header">
            <span class="batch-name">{{ item.batchName }}</span>
            <div class="card-actions">
            </div>
          </div>
        </template>
        <div class="card-content">
          <div class="image-preview" v-if="item.classImages && item.classImages.length">
            <!-- 单张图片：只显示图片，不显示轮播和箭头 -->
            <el-image
              v-if="item.classImages.length === 1"
              :src="item.classImages[0]"
              fit="cover"
              style="width: 100%; height: 150px;"
            />
            <!-- 多张图片：轮播显示，带箭头 -->
            <el-carousel
              v-else
              :interval="3000"
              arrow="always"
              height="150px"
              indicator-position="none"
            >
              <el-carousel-item v-for="(img, idx) in item.classImages" :key="idx">
                <el-image :src="img" fit="cover" style="width: 100%; height: 150px;" />
              </el-carousel-item>
            </el-carousel>
          </div>
          <div class="info-item">
            <el-icon><Collection /></el-icon>
            <span>种质: {{ item.displayClassName }}</span>
          </div>
          <div class="info-item">
            <el-icon><User /></el-icon>
            <span>负责人: {{ item.nickName || '未分配' }}</span>
          </div>
          <div class="info-item">
            <el-icon><House /></el-icon>
            <span>所属大棚: {{ getPastureName(item.pastureId) }}</span>
          </div>
          <div class="info-item">
            <el-icon><DataLine /></el-icon>
            <span>养殖面积: {{ item.fishArea }}亩</span>
          </div>
          <div class="info-item">
            <el-icon><DataLine /></el-icon>
            <span>种植面积: {{ item.cropArea }}亩</span>
          </div>
          <div class="info-item">
            <el-icon><Link /></el-icon>
            <span>合约地址: {{ item.contractAddr }}</span>
          </div>
          <div class="info-item">
            <el-icon><Timer /></el-icon>
            <span>创建时间: {{ formatDateTime(item.createTime) }}</span>
          </div>
        </div>
        <!-- New div for buttons at the bottom -->
        <div class="card-footer-actions">
          <el-button type="primary" size="small" @click="handleUpdate(item)" class="action-button">
            <el-icon><Edit /></el-icon>
            修改
          </el-button>
          <el-button type="danger" size="small" @click="handleDelete(item)" class="action-button">
            <el-icon><Delete /></el-icon>
            删除
          </el-button>
          <el-button type="warning" size="small" @click="handleBatchTask(item)" class="action-button">
            <el-icon><List /></el-icon>
            批次任务
          </el-button>
        </div>
      </el-card>
    </div>

    <div v-if="total > 8" class="custom-pagination">
      <span style="margin-right: 16px; font-size: 14px;">
        当前页共 {{ batchList.length }} 条
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
    <!-- 添加或修改分区对话框 -->
    <el-dialog :title="title" v-model="open" width="500px" append-to-body>
      <el-form ref="batchRef" :model="form" :rules="rules" label-width="98px">
        <el-form-item label="大棚ID" prop="pastureId">
          <el-select v-model="form.pastureId" placeholder="请选择大棚" style="width: 100%" @change="handlePastureChange">
            <el-option
              v-for="item in pastureList"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="分区名称" prop="batchName">
          <el-input v-model="form.batchName" placeholder="请输入分区名称" />
        </el-form-item>
        <el-form-item label="鱼种质" prop="germplasmId">
          <el-select v-model="form.germplasmId" placeholder="请选择鱼种质" style="width: 100%">
            <el-option
              v-for="item in fishClassList"
              :key="item.classId"
              :label="item.className"
              :value="item.classId"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="蔬菜种质" prop="vegetableId">
          <el-select v-model="form.vegetableId" placeholder="请选择蔬菜种质" style="width: 100%">
            <el-option
              v-for="item in vegetableClassList"
              :key="item.classId"
              :label="item.className"
              :value="item.classId"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="大棚剩余面积" prop="remainingArea" v-if="!form.batchId">
          <el-input v-model="form.remainingArea" :readonly="true" />
        </el-form-item>
        <el-form-item label="养殖面积" prop="fishArea">
          <el-input
            v-model.number="form.fishArea"
            placeholder="请输入养殖面积"
            @input="onCropAreaInput"
            :disabled="!form.germplasmId"
          />
        </el-form-item>
        <el-form-item label="种植面积" prop="cropArea">
          <el-input
            v-model.number="form.cropArea"
            :placeholder="areaPlaceholder"
            @input="onCropAreaInput"
            :disabled="!form.vegetableId"
          />
        </el-form-item>

        <el-form-item label="负责人" prop="manager">
          <el-select v-model="form.manager" placeholder="请选择负责人" style="width: 100%">
            <el-option
              v-for="item in userList"
              :key="item.userId"
              :label="item.nickName"
              :value="item.userId"
            />
          </el-select>
        </el-form-item>
       
        <el-form-item label="开始时间" prop="createTime">
          <el-date-picker 
              clearable 
              size="default" 
              v-model="form.createTime" 
              type="date"
              value-format="YYYY-MM-DD "
              placeholder="选择开始时间">
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
       <!-- 批次任务对话框 -->
       <el-dialog v-if="batchTask.open" :title="batchTask.title" v-model="batchTask.open" width="1300px">
      <div style="height:500px;width:100%;overflow:auto;">
        <task :batchId="batchTask.batchId" :tableBorder="true" :hasHarvestRecord="batchTask.hasHarvestRecord"></task>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { AgricultureCropBatchService } from "@/api/agriculture/batchApi";
import { AgricultureClassService } from "@/api/agriculture/classApi";
import {AgriculturePastureResult} from '@/types/agriculture/pasture'
import {AgriculturePastureService} from "@/api/agriculture/pastureApi";
import { ref, reactive, watch, onMounted } from 'vue'
import { resetForm } from '@/utils/utils'
import { ElMessage, ElMessageBox } from 'element-plus'
import { FormInstance } from 'element-plus'
import { AgricultureCropBatchResult } from '@/types/agriculture/batch'
import { AgricultureCropBatchTaskResult } from '@/types/agriculture/batchTask'
import { House, DataLine, Link, Timer, Collection, User, Edit, Delete, List } from '@element-plus/icons-vue'
import Task from "./Task.vue"
import { UserService } from "@/api/system/userApi"

const pastureList = ref<AgriculturePastureResult[]>([])
const batchList = ref<AgricultureCropBatchResult[]>([])
const classList = ref<any[]>([])
const open = ref(false);
const loading = ref(true);
const ids = ref([]);
const multiple = ref(true);
const total = ref(0);
const title = ref("");
const queryRef = ref()
const batchRef = ref<FormInstance>()
const userList = ref<any[]>([])
const areaLabel = ref('种植面积')
const areaPlaceholder = ref('请输入种植面积')

// 批次任务相关数据
const batchTask = reactive({
  open: false,
  title: '',
  batchId: null,
  hasHarvestRecord: false // 新增
})

// 定义初始表单状态
const initialFormState = {
  batchId: null,
  batchName: null,
  pastureId: '', // 初始值设为 ''，避免 el-select v-model 报错
  cropArea: '',
  fishArea: '', // 新增
  remainingArea: null,
  contractAddr: null,
  createTime: '', // 初始值设为 ''，避免 el-date-picker v-model 报错
  classImage: null,
  className: '',
  manager: '',
  germplasmId: '', // 初始值设为 ''
  vegetableId: '', // 初始值设为 ''
  classId: null as string | null,
  // 记录当前分区原有的面积（用于修改时校验）
  oldCropArea: 0, // 上一次的种植面积
  oldFishArea: 0  // 上一次的养殖面积
}
const form = reactive({ ...initialFormState })
const queryParams = reactive({
  pageNum: 1,
  pageSize: 9,
  batchName: '',
  pastureId: '',
  cropArea: '',
  fishArea: '',
  remainingArea: null,
  contractAddr: '',
  createTime: '',
  classImage: '',
  className: '',
  classId: ''
})
const rules = reactive({
  batchName: [
    { required: true, message: "分区名称不能为空", trigger: "blur" }
  ],
  pastureId: [
    { required: true, message: "大棚ID不能为空", trigger: "blur" }
  ],
  cropArea: [
    {
      validator: (rule: any, value: any, callback: any) => {
        // 获取当前输入的面积
        const cropArea = Number(value) || 0;
        const fishArea = Number(form.fishArea) || 0;
        // 当前大棚的剩余面积
        const remaining = Number(form.remainingArea) || 0;
        // 记录本分区原有面积（仅修改时有用）
        const oldCropArea = Number(form.oldCropArea) || 0;
        const oldFishArea = Number(form.oldFishArea) || 0;
        // 判断是新增还是修改
        const isEdit = !!form.batchId;
        // 修改时，允许本分区原有面积加回校验
        // 新增时：不能超过剩余面积
        // 修改时：不能超过 剩余面积+本分区原有面积
        const limit = isEdit ? remaining + oldCropArea + oldFishArea : remaining;
        if (!isNaN(remaining) && (cropArea + fishArea) > limit) {
          callback(new Error(`当前大棚剩余面积${remaining}亩,您输入的养殖面积+种植面积过大`));
        } else {
          callback();
        }
      },
      trigger: ["blur", "change"]
    }
  ],
  fishArea: [
  {
      validator: (rule: any, value: any, callback: any) => {
        // 获取当前输入的面积
        const fishArea = Number(value) || 0;
        const cropArea = Number(form.cropArea) || 0;
        // 当前大棚的剩余面积
        const remaining = Number(form.remainingArea) || 0;
        // 记录本分区原有面积（仅修改时有用）
        const oldCropArea = Number(form.oldCropArea) || 0;
        const oldFishArea = Number(form.oldFishArea) || 0;
        // 判断是新增还是修改
        const isEdit = !!form.batchId;
        // 修改时，允许本分区原有面积加回校验
        // 新增时：不能超过剩余面积
        // 修改时：不能超过 剩余面积+本分区原有面积
        const limit = isEdit ? remaining + oldCropArea + oldFishArea : remaining;
        if (!isNaN(remaining) && (cropArea + fishArea) > limit) {
          callback(new Error(`当前大棚剩余面积${remaining}亩,您输入的养殖面积+种植面积过大`));
        } else {
          callback();
        }
      },
      trigger: ["blur", "change"]
    }
  ],
})

const fishClassList = ref<any[]>([])      // classType=0
const vegetableClassList = ref<any[]>([]) // classType=1

/** 查询大棚列表 */
const getPastureList = async () => {
    loading.value = true;
    const res = await AgriculturePastureService.listPasture(queryParams)
    console.log('API getPastureList 大棚:', res);
    if (res.code === 200) {
      pastureList.value = res.rows;
      loading.value = false;
    } else {
        pastureList.value = []; // 请求失败时清空数据
        loading.value = false;
    }
  }

/** 查询种质列表 */
const getClassList = async () => {
  const res = await AgricultureClassService.listClass(queryParams)
  if (res.code === 200) {
    classList.value = res.rows;
    fishClassList.value = res.rows.filter((item: any) => item.classType == 0)
    vegetableClassList.value = res.rows.filter((item: any) => item.classType == 1)
  }
}

const columns = reactive([
  { name: '分区名称', show: true },
  { name: '大棚ID', show: true },
  { name: '种植面积', show: true },
  { name: '区块链合约地址', show: true },
  { name:'时间',show: true},
  { name: '种质图片', show: true },
  { name: '种质', show: true }
])

const changeColumn = (list: any) => {
  columns.splice(0, columns.length, ...list)
}

// 查询分区列表方法
const getList = async () => {
  loading.value = true; // 开始加载，显示loading
  const res = await AgricultureCropBatchService.listBatch(queryParams) // 请求分区列表
  if (Array.isArray(res)) {
    batchList.value = res; // 直接赋值
    total.value = res.length; // 记录总数
  } else if (res.code === 200) {
    batchList.value = res.rows; // 赋值rows
    total.value = res.total;    // 记录总数
  }
  console.log('total',res.total)
  // 给每个分区item加classType，便于卡片展示时区分"养殖面积/种植面积/种/殖面积"
  batchList.value.forEach(item => {
    // 查找鱼种质类型（classType=0）
    const fishClass = classList.value.find((cls: any) => cls.classId == item.germplasmId); // 通过germplasmId找到鱼类种质
    // 查找蔬菜种质类型（classType=1）
    const vegetableClass = classList.value.find((cls: any) => cls.classId == item.vegetableId); // 通过vegetableId找到蔬菜类种质
    // 拼接展示名称
    if (fishClass && vegetableClass) {
      item.displayClassName = `${fishClass.className} / ${vegetableClass.className}`; // 同时有鱼和蔬菜，拼接显示
    } else if (fishClass) {
      item.displayClassName = fishClass.className; // 只有鱼类，显示鱼类名称
    } else if (vegetableClass) {
      item.displayClassName = vegetableClass.className; // 只有蔬菜类，显示蔬菜名称
    } else {
      item.displayClassName = ''; // 都没有，显示空
    }
    // classType 逻辑保持不变
    item.classType = (fishClass && !vegetableClass) ? fishClass.classType : (vegetableClass ? vegetableClass.classType : 1); // 优先鱼类，否则蔬菜类，否则默认1
    // 设置卡片图片数组
    const images = [];
    if (fishClass && fishClass.classImage) images.push(fishClass.classImage);
    if (vegetableClass && vegetableClass.classImage) images.push(vegetableClass.classImage);
    item.classImages = images; // 新增图片数组
  })
  loading.value = false; // 加载结束，隐藏loading
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

// 多选框选中数据
const handleSelectionChange = (selection: any) => {
  ids.value = selection.map((item: any) => item.batchId);
  multiple.value = !selection.length;
}

/** 新增按钮操作 */
const handleAdd = () => {
  reset();
  open.value = true;
  title.value = "添加分区";
}

/** 修改按钮操作 */
const handleUpdate = async (row: any) => {
  if (row.harvest == '0') {
    ElMessage.warning('当前分区已采摘,不可修改任务')
    return
  }
  reset();
  const _batchId = row.batchId || ids.value
  const res = await AgricultureCropBatchService.getBatch(_batchId)
  if (res.code === 200) {
    Object.assign(form, res.data);
    if (res.data.responsiblePersonId !== undefined) {
        form.manager = res.data.responsiblePersonId;
    }
    if (res.data.germplasmId !== undefined) {
        form.classId = res.data.germplasmId;
    }
    // 保证日期选择器 v-model 绑定的值不是 null
    form.createTime = res.data.createTime !== undefined && res.data.createTime !== null ? res.data.createTime : '';
    // 赋值本分区原有面积，供修改时校验用
    // 注意：接口返回的 cropArea/fishArea 可能为字符串，需转为数字
    form.oldCropArea = Number(res.data.cropArea) || 0;
    form.oldFishArea = Number(res.data.fishArea) || 0;
    // 保证下拉框 v-model 绑定的值不是 null
    form.pastureId = res.data.pastureId !== undefined && res.data.pastureId !== null ? res.data.pastureId : '';
    form.germplasmId = res.data.germplasmId !== undefined && res.data.germplasmId !== null ? res.data.germplasmId : '';
    form.vegetableId = res.data.vegetableId !== undefined && res.data.vegetableId !== null ? res.data.vegetableId : '';
    // 这里查找classType并设置label
    const fishClass = classList.value.find((item: any) => item.classId == form.germplasmId)
    const vegetableClass = classList.value.find((item: any) => item.classId == form.vegetableId)
    if (fishClass && vegetableClass) {
      areaLabel.value = '种/殖面积'
      areaPlaceholder.value = '请输入种/殖面积'
    } else if (fishClass) {
      areaLabel.value = '养殖面积'
      areaPlaceholder.value = '请输入养殖面积'
    } else {
      areaLabel.value = '种植面积'
      areaPlaceholder.value = '请输入种植面积'
    }

    open.value = true;
    title.value = "修改分区";
    if (form.pastureId) {
      await handlePastureChange(form.pastureId);
      batchRef.value?.validateField('cropArea');
    }
  }
}

/** 提交按钮 */
const submitForm = async () => {
  if (!batchRef.value) return
  await batchRef.value.validate(async (valid) => {
    if (valid) {
      // 确保 fishArea 和 cropArea 有有效值
      const fishArea = form.fishArea !== null && form.fishArea !== '' ? form.fishArea : 0;
      const cropArea = form.cropArea !== null && form.cropArea !== '' ? form.cropArea : 0;
      
      // 构建要发送给后端的数据对象
      const dataToSend = {
        ...form,
        pastureId: form.pastureId,
        germplasmId: form.germplasmId,
        vegetableId: form.vegetableId,
        responsiblePersonId: form.manager,
        fishArea: fishArea,
        cropArea: cropArea
      };

      if (dataToSend.batchId != null) {
        // 调用更新接口，发送构建好的数据对象
        const res = await AgricultureCropBatchService.updateBatch(dataToSend);
        if (res.code === 200) {
          ElMessage.success(res.msg);
          open.value = false;
          getList();
        } else {
           // 如果后端返回非200状态码，显示错误信息
           ElMessage.error("更新失败：" + res.msg);
           console.error("更新失败:", res);
        }
      } else {
        // 添加操作，发送构建好的数据对象
        const res = await AgricultureCropBatchService.addBatch(dataToSend);
        if (res.code === 200) {
          ElMessage.success(res.msg);
          open.value = false;
          getList();
        } else {
           // 如果后端返回非200状态码，显示错误信息
           ElMessage.error("添加失败：" + res.msg);
           console.error("添加失败:", res);
        }
      }
    }
  });
}

/** 删除按钮操作 */
const handleDelete = async (row: any) => {
  const _batchIds = row.batchId || ids.value;
  const Tr = await ElMessageBox.confirm('是否确认删除分区编号为"' + _batchIds + '"的数据项？')
  if (Tr) {
    const res = await AgricultureCropBatchService.deleteBatch(_batchIds)
    console.log('删除返回', res)
    if (res.code === 200) {
      getList()
      ElMessage.success(res.msg)
    }
  }
}


import { downloadExcel } from '@/utils/utils'

/** 导出按钮操作 */
const handleExport = () => {
  downloadExcel(AgricultureCropBatchService.exportExcel(queryParams))
}

/** 批次任务按钮操作 */
const handleBatchTask = (row: any) => {
  // 判断是否同时有鱼和蔬菜种质
  if (row.germplasmId && row.vegetableId) {
    batchTask.title = '种植/养殖计划';
  } else if (row.germplasmId) {
    batchTask.title = '养殖计划';
  } else {
    batchTask.title = '种植计划';
  }
  batchTask.open = true;
  batchTask.batchId = row.batchId;
  batchTask.hasHarvestRecord = row.harvest === '0'; // 新增
}

// 获取用户列表
const getUserList = async () => {
  try {
    const res = await UserService.listUser({})
    if (res.code === 200) {
      userList.value = res.rows
    }
  } catch (error) {
    console.error('获取用户列表失败:', error)
  }
}

// 初始化
onMounted(async () => {
  // 先加载种质列表，确保classList有数据（卡片展示面积类型依赖classType）
  await getClassList() // 等待种质列表加载完成
  // 再加载分区列表，保证可以根据classList为每个分区赋classType
  await getList() // 等待分区列表加载完成
  // 其他数据（大棚、用户）可并行加载，不影响面积类型判断
  getPastureList() // 加载大棚列表
  getUserList()    // 加载用户列表
})

// 添加时间格式化函数
const formatDateTime = (dateTimeStr: string) => {
  if (!dateTimeStr) return '';
  const date = new Date(dateTimeStr);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

watch(batchList, (newVal) => {
}, { deep: true });

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

// 在script部分添加getPastureName方法
const getPastureName = (pastureId: string | number) => {
  const pasture = pastureList.value.find((item: AgriculturePastureResult) => item.id === Number(pastureId))
  return pasture ? pasture.name : pastureId
}

const handlePastureChange = async (pastureId: number | string) => {
  if (!pastureId) {
    form.remainingArea = null;
    return;
  }
  try {
    // 获取所有大棚面积信息
    const res = await AgriculturePastureService.listArea({});
    if (res.code === 200 && Array.isArray(res.rows)) {
      // 找到选中的大棚
      const found = res.rows.find((item: any) => String(item.pasture_id) === String(pastureId) || String(item.id) === String(pastureId));
      if (found) {
        // 判断是否分区数量已满
        const isFull = found.bigBreedingQuantity !== undefined &&
                       found.breedingQuantity !== undefined &&
                       Number(found.breedingQuantity) === Number(found.bigBreedingQuantity);

        // 新增时，分区数量已满禁止选择
        if (isFull && !form.batchId) {
          ElMessage.warning('当前大棚分区数量已满 请选择其他大棚');
          form.pastureId = '';
          form.remainingArea = null;
        } else {
          // 修改时，允许本分区继续选择原大棚
          form.remainingArea = found.remaining_area  ?? null;
        }
      } else {
        form.remainingArea = null;
      }
    } else {
      form.remainingArea = null;
    }
  } catch (e) {
    form.remainingArea = null;
  }
};

// 种植面积输入时触发校验，保证错误提示能及时消失
const onCropAreaInput = () => {
  batchRef.value?.validateField('cropArea'); // 只校验种植面积字段
};

// 监听种质变化
const onClassChange = async (classId: string | number) => {
  // 这里假设 classId 变化时，form.germplasmId 和 form.vegetableId 都会被设置
  const fishClass = classList.value.find((item: any) => item.classId == form.germplasmId)
  const vegetableClass = classList.value.find((item: any) => item.classId == form.vegetableId)
  if (fishClass && vegetableClass) {
    areaLabel.value = '种/殖面积'
    areaPlaceholder.value = '请输入种/殖面积'
  } else if (fishClass) {
    areaLabel.value = '养殖面积'
    areaPlaceholder.value = '请输入养殖面积'
  } else {
    areaLabel.value = '种植面积'
    areaPlaceholder.value = '请输入种植面积'
  }
}

// 监听鱼种质和蔬菜种质变化，若变为空则清空对应面积
watch(() => form.germplasmId, (newVal) => {
  if ((typeof newVal === 'string' && newVal === '') || newVal === null) {
    form.fishArea = '';
  }
});
watch(() => form.vegetableId, (newVal) => {
  if ((typeof newVal === 'string' && newVal === '') || newVal === null) {
    form.cropArea = '';
  }
});
</script>

<style scoped>
  .custom-pagination {
      display: flex;                
      justify-content: center;     
      align-items: center;         
      margin: 24px 0 0 0;          
      padding: 0 24px 12px 0;      
    }

.card-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(400px, 2fr));
  gap: 20px;
  padding: 20px;
}

.batch-card {
  transition: all 0.3s ease;
  padding: 15px 20px;
}

.batch-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 0;
}

.batch-name {
  font-size: 18px;
  font-weight: bold;
}

.card-actions {
  display: flex;
  gap: 8px;
}

.card-content {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #606266;
}

.info-item .el-icon {
  color: #409EFF;
}

.image-preview {
  margin-top: 12px;
  border-radius: 4px;
  overflow: hidden;
}

.image-preview .el-image {
  width: 100%;
  height: 150px;
  object-fit: cover;
}

@media (max-width: 768px) {
  .card-container {
    grid-template-columns: 1fr;
  }
}

/* Updated styles for the button container at the bottom of the card */
.card-footer-actions {
  margin-top: auto;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 12px 20px;
  border-top: 1px solid #ebeef5;
  margin-top: 10px;
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
  transition: all 0.2s;
  box-shadow: none !important;
  font-weight: 500;
  min-width: 36px;
  min-height: 28px;
  padding: 0 10px;
}

.action-button .el-icon {
  font-size: 16px;
}

.action-button.el-button--primary {
  border-color: #409eff !important;
  color: #409eff !important;
  background: #fff !important;
}

.action-button.el-button--primary:hover {
  background: #409eff !important;
  color: #fff !important;
  border-color: #409eff !important;
}

.action-button.el-button--danger {
  border-color: #f56c6c !important;
  color: #f56c6c !important;
  background: #fff !important;
}

.action-button.el-button--danger:hover {
  background: #f56c6c !important;
  color: #fff !important;
  border-color: #f56c6c !important;
}
</style>