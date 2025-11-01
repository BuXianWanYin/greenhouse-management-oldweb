<template>
  <div class="page-content">
    <table-bar
        :showTop="false"
        @search="handleQuery"
        @reset="resetForm(queryRef)"
        @changeColumn="changeColumn"
        :columns="columns"
    >
      <template #top>
        <el-form :model="queryParams" ref="queryRef" label-width="82px">
          <el-row :gutter="20">
            <form-input label="名称" prop="name"
                        v-model="queryParams.name"
                        @keyup.enter="handleQuery"/>
            <form-input label="合约地址" prop="contractAddr"
                        v-model="queryParams.contractAddr"
                        @keyup.enter="handleQuery"/>
            <form-input label="大棚位置" prop="address"
                        v-model="queryParams.address"
                        @keyup.enter="handleQuery"/>
            <form-input label="备注" prop="description"
                        v-model="queryParams.description"
                        @keyup.enter="handleQuery"/>
            <form-input label="大棚面积" prop="area"
                        v-model="queryParams.area"
                        @keyup.enter="handleQuery"/>
            <form-input label="最大分区数量" prop="bigBreedingQuantity"
                        v-model="queryParams.bigBreedingQuantity"
                        @keyup.enter="handleQuery"/>
          </el-row>
        </el-form>
      </template>
      <template #bottom>
        <el-button @click="handleAdd" v-auth="['agriculture:pasture:add']"
                   v-ripple>新增
        </el-button>
        <el-button @click="handleDelete" :disabled="multiple" v-auth="['agriculture:pasture:remove']"
                   v-ripple>删除
        </el-button>
        <el-button @click="handleExport" v-auth="['agriculture:pasture:export']"
                   v-ripple>导出
        </el-button>
      </template>
    </table-bar>


    <div v-loading="loading" class="pasture-card-container">
      <div class="pasture-card" v-for="pasture in pastureList" :key="pasture.id">
        <!-- 使用本地图片路径 -->
        <img :src="pastureImage" alt="牧场图片" class="pasture-image"/>
        <div class="card-header">
          <h3 class="card-title">{{ pasture.name }}</h3>
        </div>
        <div class="card-body">
          <div class="info-row">
            <span class="label"><el-icon><Link /></el-icon> 合约地址:</span>
            <span class="value">{{ pasture.contractAddr }}</span>
          </div>
          <div class="info-row">
            <span class="label"><el-icon><Location /></el-icon> 位置:</span>
            <span class="value">{{ pasture.address }}</span>
          </div>
          <div class="info-row">
            <span class="label"><el-icon><DataLine /></el-icon> 面积:</span>
            <span class="value">{{ pasture.area }}亩</span>
          </div>
          <div class="info-row">
            <span class="label"><el-icon><Odometer /></el-icon> 剩余面积:</span>
            <span class="value">{{ pasture.remainingArea }}亩</span>
          </div>
          <div class="info-row">
            <span class="label"><el-icon><Grid /></el-icon> 分区数量:</span>
            <span class="value">{{ pasture.breedingQuantity }} / {{ pasture.bigBreedingQuantity }}</span>
          </div>
          <div class="info-row">
            <span class="label"><el-icon><EditPen /></el-icon> 备注:</span>
            <span class="value">{{ pasture.remark || '/' }}</span>
          </div>
         
        </div>
        <div class="card-footer">
          <el-button-group>
            <el-button class="card-action-btn edit" size="small" @click="handleUpdate(pasture)">
              <el-icon><Edit /></el-icon>编辑
            </el-button>
            <el-button class="card-action-btn delete" size="small" @click="handleDelete(pasture)">
              <el-icon><Delete /></el-icon>删除
            </el-button>
          </el-button-group>
        </div>
      </div>
      <!-- 如果 pastureList 为空时的提示 -->
      <div v-if="!loading && pastureList.length === 0" class="no-data-message">
          暂无数据
      </div>
    </div>

    <!-- 分页组件 -->
    <el-pagination 
      v-if="total > queryParams.pageSize"
      background 
      layout="total, sizes, prev, pager, next, jumper" 
      :total="total"
      :page-size="queryParams.pageSize" 
      :current-page="queryParams.pageNum" 
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange" 
      :page-sizes="[5, 10, 20, 50]"
      style="margin-top: 20px; text-align: center; display: flex; justify-content: center;" 
    />


    <!-- 添加或修改大棚对话框 -->
    <el-dialog :title="title" v-model="open" width="500px" append-to-body>
      <el-form ref="pastureRef" :model="form" :rules="rules" label-width="110px">
        <el-form-item label="大棚名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入大棚名称"/>
        </el-form-item>
        <el-form-item label="大棚位置" prop="address">
          <el-input v-model="form.address" placeholder="请输入大棚位置"/>
        </el-form-item>
        <el-form-item label="大棚面积" prop="area">
          <el-input v-model="form.area" placeholder="请输入大棚面积(亩)"/>
        </el-form-item>
        <el-form-item label="最大分区数量" prop="bigBreedingQuantity" >
          <el-input v-model="form.bigBreedingQuantity" placeholder="请输入最大分区数量"/>
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="form.remark" placeholder="请输入备注"/>
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
  import {AgriculturePastureService} from "@/api/agriculture/pastureApi";
  import {ref, reactive, onMounted} from 'vue' // 导入 onMounted
  import {resetForm} from '@/utils/utils'
  import {ElMessage, ElMessageBox} from 'element-plus'
  import {FormInstance} from 'element-plus'
  import {AgriculturePastureResult} from '@/types/agriculture/pasture'
  import { Link, Location, DataLine, Grid, EditPen, Odometer } from '@element-plus/icons-vue' // 导入图标组件
  // 导入图片
  import pastureImage from '@/assets/img/pasture/ycgs.jpeg'
  import { AgricultureCropBatchService } from '@/api/agriculture/batchApi'

  const pastureList = ref<AgriculturePastureResult[]>([])
  const open = ref(false);
  const loading = ref(true);
  const ids = ref<number[]>([]); // 明确 ids 的类型为 number[]
  const multiple = ref(true);
  const total = ref(0);
  const title = ref("");
  const queryRef = ref<FormInstance>() // 明确 queryRef 的类型
  const pastureRef = ref<FormInstance>()
  // 定义初始表单状态
  const initialFormState = {
    id: null,
    name: '',
    contractAddr: '',
    address: '',
    description: '',
    area: '',
    remainingArea: '',
    bigBreedingQuantity: '',
    breedingQuantity: '',
    createBy: null,
    createTime: null,
    updateBy: null,
    updateTime: null,
    remark: '',
    delFlag: null
  }
  const form = reactive({...initialFormState})
  const queryParams = reactive({
    pageNum: 1,
    pageSize: 10,
    name: '',
    contractAddr: '',
    address: '',
    description: '',
    area: '',
    remainingArea: '',
    bigBreedingQuantity: '',
    breedingQuantity: '',
  })
  const rules = reactive({
    name: [
      {
        required: true, message: "名称不能为空"
      }
    ],
    address: [
      {
        required: true, message: "大棚位置不能为空"
      }
    ],
    area: [
      {
        required: true, message: "大棚面积不能为空"
      },
      {
        type: 'number', message: "大棚面积必须是数字",
        transform: (value: string) => Number(value)
      },
       {
         pattern: /^\d*\.?\d+$/,
         message: "请输入有效的大棚面积",
       }
    ],
    bigBreedingQuantity: [
      {
        required: true, message: "最大分区数量不能为空"
      },
      {
        type: 'integer', message: "最大分区数量必须是整数",
         transform: (value: string) => Number(value)
      },
      {
         pattern: /^\d+$/,
         message: "请输入有效的最大分区数量",
      }
    ],
  })


  /** 查询大棚列表 */
  const getList = async () => {
    loading.value = true;
    // 并发请求主列表和剩余面积
    const [res, areaRes] = await Promise.all([
      AgriculturePastureService.listPasture(queryParams),
      AgriculturePastureService.listArea(queryParams)
    ]);
    if (res.code === 200) {
      // 默认主列表
      pastureList.value = res.rows;
      total.value = res.total;
      // 合并剩余面积
      if (areaRes.code === 200 && Array.isArray(areaRes.rows)) {
        // 构建 id -> remaining_area 映射表
        const areaMap = Object.create(null);
        areaRes.rows.forEach((item: any) => {
          areaMap[item.id] = item.remaining_area || item.remainingArea || '';
        });
        pastureList.value.forEach((item: any) => {
          // 优先用接口返回的 remaining_area
          item.remainingArea = areaMap[item.id] ?? item.remainingArea ?? '';
        });
      }
      loading.value = false;
    } else {
      pastureList.value = []; // 请求失败时清空数据
      total.value = 0;
      loading.value = false;
    }
  }

 
  const columns = reactive([
    {name: 'id', show: true},
    {name: '名称', show: true},
    {name: '合约地址', show: true},
    {name: '大棚位置', show: true},
    {name: '备注', show: true},
    {name: '大棚面积', show: true},
    {name: '最大分区数量', show: true},
    {name: '当前分区数量', show: true},
    {name: '备注', show: true},
  ])


  const changeColumn = (list: any) => {
    columns.forEach((col, index) => {
      if (list[index]) {
          col.show = list[index].show;
      }
    });
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

  // 多选框选中数据 (保留逻辑，但需要在卡片视图中实现选中UI)
  const handleSelectionChange = (selection: any) => {
    ids.value = selection.map((item: any) => item.id);
    multiple.value = !selection.length;
  }


  /** 新增按钮操作 */
  const handleAdd = () => {
    reset()
    open.value = true
    title.value = '添加大棚'
  }

  /** 修改按钮操作 */
  const handleUpdate = async (row: any) => {
    reset()
    const _id = row.id || ids.value
    const res = await AgriculturePastureService.getPasture(_id)
    if (res.code === 200) {
      Object.assign(form, res.data)
      open.value = true
      title.value = '修改大棚'
    }
  }

  /** 提交按钮 */
  const submitForm = async () => {
    if (!pastureRef.value) return
    await pastureRef.value.validate(async (valid) => {
      if (valid) {
        if (form.id != null) {
          const res = await AgriculturePastureService.updatePasture(form)
          if (res.code === 200) {
            ElMessage.success(res.msg)
            open.value = false;
            getList();
          } else {
              ElMessage.error(res.msg || "修改失败");
          }
        } else {
          const res = await AgriculturePastureService.addPasture(form)
          if (res.code === 200) {
            ElMessage.success(res.msg)
            open.value = false;
            getList();
          } else {
              ElMessage.error(res.msg || "新增失败");
          }
        }
      }
    });
  }

  /** 删除按钮操作 */
  const handleDelete = async (row?: any) => {
    // 获取要删除的大棚ID数组，如果是单个删除则取row.id，否则取选中的ids
    const _ids = row ? [row.id] : ids.value;
    // 获取要显示在弹窗中的大棚名称或数量
    const messageName = row ? row.name : `${_ids.length} 项`;

    // 如果没有选中任何大棚，给出提示并返回
    if (_ids.length === 0) {
      ElMessage.warning("请选择要删除的数据项");
      return;
    }

    // 只允许单个大棚删除时校验分区（如需批量删除可循环判断）
    const pastureId = _ids[0]; // 取第一个大棚ID
    // 调用分区服务，查询该大棚下是否有分区
    const batchRes = await AgricultureCropBatchService.listBatchByPasture(pastureId);
    // 如果接口返回成功，并且分区数组长度大于0，说明有分区，不能删除
    if (batchRes.code === 200 && Array.isArray(batchRes.data) && batchRes.data.length > 0) {
      ElMessage.warning("该大棚之下有分区，不能删除"); // 给出提示
      return; // 终止删除流程
    }

    // 弹出确认框，询问用户是否确定删除
    const Tr = await ElMessageBox.confirm('是否确认删除大棚 "' + messageName + '"？', '警告', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }).catch(() => false); // 如果用户取消，则catch返回false

    // 如果用户点击了确定按钮
    if (Tr) {
      // 调用删除大棚接口
      const delRes = await AgriculturePastureService.deletePasture(_ids.join(','));
      // 如果删除成功，刷新列表并提示成功
      if (delRes.code === 200) {
        getList();
        ElMessage.success(delRes.msg);
        ids.value = [];
        multiple.value = true;
      } else {
        // 删除失败，给出错误提示
        ElMessage.error(delRes.msg || "删除失败");
      }
    }
  }


  import {downloadExcel} from '@/utils/utils'

  /** 导出按钮操作 */
  const handleExport = () => {
    downloadExcel(AgriculturePastureService.exportExcel(queryParams))
  }

  // 初始化
  onMounted(() => {
    getList()
  })
</script>

<style scoped>
.pasture-card-container {
  display: grid;
  /* 增加卡片最小宽度到 400px */
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 24px;
  padding: 32px 24px;
  background: transparent;
  min-height: 300px;
  justify-content: center;
}

.pasture-card {
  /* 移除或减小最小高度，让卡片高度自适应内容 */
  /* min-height: 500px; */ /* 移除这行 */
  height: auto; /* 确保高度自适应 */
  background: #fff;
  border-radius: 14px;
  /* 调整默认阴影 */
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.08);
  transition: transform 0.2s, box-shadow 0.2s;
  overflow: hidden;
  border: 1px solid #e3f0fc;
  display: flex;
  flex-direction: column;
  position: relative;
}

/* 添加悬停效果 */
.pasture-card:hover {
  transform: translateY(-5px); /* 向上浮动 */
  box-shadow: 0 12px 20px rgba(0, 0, 0, 0.12); /* 增加阴影 */
}

.pasture-image {
  display: none; /* 或者完全移除这个元素 */
}

.pasture-placeholder-icon {
  font-size: 60px;
  color: #409eff;
  opacity: 0.8;
  position: absolute; /* 占位符图标也需要定位 */
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 1; /* 确保在图片之上 */
}

.card-header {
  height: auto;
  padding: 16px 20px;
  display: flex;
  justify-content: flex-start;
  align-items: center;
  background: transparent; /* 头部背景保持透明 */
  overflow: hidden;
  position: relative;
  z-index: 1;
  /* 可选：给头部加个细底边框 */
  border-bottom: 1px solid #f0f0f0;
}

.card-body {
  background: #fff;
  padding: 20px 24px;
  flex-grow: 1;
  color: #333;
  font-size: 14px;
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  gap: 18px;
}

/* 调整标题大小 */
.card-title {
  font-size: 18px; 
  margin: 0;
  font-weight: 600;
  color: #303133;
  text-align: left;
}

.info-row {
  display: flex;
  align-items: center; /* 垂直居中 */
  font-size: 14px;
  line-height: 1.6;
}

.info-row:last-child {
  border-bottom: none;
}

.label {
  color: #909399; /* 标签颜色 */
  min-width: 90px; /* 标签最小宽度 */
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 6px; /* 图标与文字间距 */
  flex-shrink: 0; /* 防止标签被压缩 */
}

.label .el-icon {
  font-size: 16px; /* 图标大小 */
  color: #409eff; /* 图标颜色 */
}

.value {
  color: #303133; /* 值颜色 */
  flex: 1;
  word-break: break-word;
  font-size: 14px; /* 调整字体大小 */
}


.card-footer {
  padding: 12px 16px;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.el-button-group {
  display: flex;
  gap: 12px;
}

.card-action-btn {
  position: relative;
  border: none !important;
  background: #fff !important;
  color: #409eff !important;
  border-radius: 1.5rem !important;
  border: 1px solid !important;
  transition: all 0.3s;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05) !important;
  font-weight: 500;
  min-width: 36px;
  min-height: 28px;
  padding: 0 10px;
  font-size: 11px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.card-action-btn::before {
  content: '';
  position: absolute;
  inset: 0;
  background-color: #409eff;
  transform: translateX(-100%);
  transition: transform 0.3s;
  z-index: 0;
}

.card-action-btn.edit::before {
  background-color: #409eff;
}

.card-action-btn.delete::before {
  background-color: #f56c6c;
}

.card-action-btn .el-icon {
  font-size: 16px;
  position: relative;
  z-index: 1;
  transition: color 0.2s;
}

.card-action-btn.edit {
  color: #409eff !important;
}

.card-action-btn.delete {
  color: #f56c6c !important;
}

.card-action-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.1) !important;
}

.card-action-btn:hover::before {
  transform: translateX(0);
}

.card-action-btn:hover .el-icon,
.card-action-btn:hover {
  color: #fff !important;
}

.card-action-btn.edit:hover {
  background: transparent !important;
}

.card-action-btn.delete:hover {
  background: transparent !important;
}

.pagination-container {
    padding: 20px 24px; /* 调整内边距，参考 alert 页面 */
    text-align: right;
    background: #fff; /* 分页区域背景色，参考 alert 页面 */
    border-top: 1px solid #ebeef5; /* 顶部边框，参考 alert 页面 */
}

.no-data-message {
    text-align: center;
    font-size: 18px;
    color: #909399;
    width: 100%;
    margin-top: 50px; /* 调整顶部间距 */
}

/* 您之前可能保留的一些全局或父级样式 */
.page-content {
    padding: 20px; /* 根据您的实际布局调整 */
}

/* 确保 table-bar 和卡片容器之间有间距 */
.table-bar {
    margin-bottom: 20px;
}

/* 添加新的样式来增强文字可读性 */
.card-title {
  color: #303133;
  margin-bottom: 12px;
  font-size: 18px;
  font-weight: 600;
}

.card-text {
  margin: 8px 0;
  color: #303133;
  line-height: 1.6;
}

</style>
