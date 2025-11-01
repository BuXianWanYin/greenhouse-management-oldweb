<template>
  <div class="ai-detection-container" :class="{ 'dark-mode': isDarkMode }">
    <div class="left-panel">
      <!-- 顶部统计卡片 -->
      <div class="stats-cards">
        <el-row :gutter="20">
          <el-col :span="8">
            <div class="stat-card">
              <div class="stat-icon">
                <el-icon>
                  <Picture />
                </el-icon>
              </div>
              <div class="stat-info">
                <div class="stat-value">{{ totalDetections }}</div>
                <div class="stat-label">总检测次数</div>
              </div>
            </div>
          </el-col>
          <el-col :span="8">
            <div class="stat-card">
              <div class="stat-icon success">
                <el-icon><Select /></el-icon>
              </div>
              <div class="stat-info">
                <div class="stat-value">{{ accuracy }}%</div>
                <div class="stat-label">识别准确率</div>
              </div>
            </div>
          </el-col>
          <el-col :span="8">
            <div class="stat-card">
              <div class="stat-icon warning">
                <el-icon>
                  <Timer />
                </el-icon>
              </div>
              <div class="stat-info">
                <div class="stat-value">{{ avgTime }}s</div>
                <div class="stat-label">平均处理时间</div>
              </div>
            </div>
          </el-col>
        </el-row>
      </div>

      <!-- 症状描述区域 -->
      <div class="description-area">
        <div class="section-header">
          <div class="section-title">
            <el-icon>
              <Edit />
            </el-icon>
            症状描述
          </div>
          <div class="button-group">
            <el-button size="small" @click="clearSymptomDesc">
              <el-icon>
                <Delete />
              </el-icon>
              清空
            </el-button>
          </div>
        </div>
        <el-input v-model="symptomDesc" type="textarea" :rows="4" placeholder="请描述您观察到的病虫害症状(如:叶片发黄、鱼类异常等)"></el-input>

        <!-- 快速选择常见症状 -->
        <div class="quick-symptoms">
          <el-tag v-for="(symptom, index) in ['叶片发黄', '叶片卷曲', '茎秆腐烂', '根部变黑', '鱼类浮头', '鱼体发白', '生长缓慢', '食欲不振']"
            :key="`symptom_${index}`" size="small" class="clickable-tag" @click="appendSymptom(symptom)">
            {{ symptom }}
          </el-tag>
        </div>
      </div>

      <!-- 图片上传区域 -->
      <div class="upload-section">
        <div class="section-header">
          <div class="section-title">
            <el-icon>
              <Upload />
            </el-icon>
            图片上传
          </div>
          <div class="button-group">
            <el-button size="small">
              <el-icon>
                <Folder />
              </el-icon>
              本地上传
            </el-button>
          </div>
        </div>
        <div class="image-upload">
          <input type="file" accept="image/*" style="display:none" ref="fileInput" @change="handleImageChange" />
          <div class="upload-content" @click="fileInput?.click()">
            <el-icon class="upload-icon">
              <Upload />
            </el-icon>
            <div class="upload-text">点击上传图片</div>
            <div class="upload-tips">
              <p>支持多图片上传</p>
              <p>建议图片尺寸不小于 800x600</p>
              <p>支持 JPG、PNG 格式</p>
            </div>
          </div>
        </div>
      </div>

      <!-- 检测设置 -->
      <div class="detection-settings">
        <div class="section-header">
          <div class="section-title">
            <el-icon>
              <Setting />
            </el-icon>
            检测设置
          </div>
        </div>
        <el-form label-width="100px" size="default" class="settings-form">
          <el-form-item label="检测模式">
            <el-select v-model="detectMode" style="width: 95%" clearable placeholder="请选择检测模式">
              <el-option label="综合检测" value="all"></el-option>
              <el-option label="植物病害" value="plant"></el-option>
              <el-option label="鱼类疾病" value="fish"></el-option>
            </el-select>
          </el-form-item>

          <el-form-item label="图像质量">
            <el-slider v-model="imageQuality" :min="1" :max="10" show-stops style="width: 95%"></el-slider>
          </el-form-item>

          <el-form-item label="检测精度">
            <el-radio-group v-model="detectPrecision" size="default" style="width: 95%">
              <el-radio-button value="fast">
                <el-icon>
                  <Lightning />
                </el-icon> 快速
              </el-radio-button>
              <el-radio-button value="standard">
                <el-icon><Select /></el-icon> 标准
              </el-radio-button>
              <el-radio-button value="high">
                <el-icon>
                  <Star />
                </el-icon> 高精度
              </el-radio-button>
            </el-radio-group>
          </el-form-item>

          <el-form-item label="高级设置">
            <div class="advanced-settings">
              <el-checkbox v-model="enableAnnotation">启用病害标注</el-checkbox>
              <el-checkbox v-model="saveHistory">保存检测历史</el-checkbox>
            </div>
          </el-form-item>
        </el-form>
      </div>

      <!-- 操作按钮 -->
      <div class="action-buttons">
        <div class="button-group main-actions">
          <el-button type="primary" class="start-button" @click="handleIdentify" :loading="btnLoading">
            <el-icon>
              <VideoPlay />
            </el-icon>
            开始识别
          </el-button>
        </div>
      </div>
    </div>

    <div class="right-panel">
      <!-- 图片展示区域 -->
      <div class="image-display-section">
        <div class="preview-tools">
          <div class="button-group">
            <el-button size="small">
              <el-icon>
                <Picture />
              </el-icon>
            </el-button>
            <el-button size="small">
              <el-icon>
                <Menu />
              </el-icon>
            </el-button>
          </div>
        </div>

        <!-- 主图片展示区 -->
        <div class="main-preview-area">
          <template v-if="imageUrl">
            <div style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center;">
              <img :src="imageUrl"
                style="max-width: 100%; max-height: 300px; object-fit: contain; border-radius: 6px; box-shadow: 0 2px 8px #0001; cursor: pointer;"
                @click="openPreview(imageUrl)" />
            </div>
          </template>
          <template v-else>
            <div class="empty-preview">
              <el-icon>
                <Picture />
              </el-icon>
              <p>暂无图片</p>
            </div>
          </template>
        </div>
      </div>

      <!-- 识别结果区域 -->
      <div class="recognition-section">
        <div class="section-header">
          <div class="section-title">
            <el-icon>
              <DataAnalysis />
            </el-icon>
            识别结果
          </div>
          <el-radio-group v-model="resultView" size="small">
            <el-radio-button value="summary">概要</el-radio-button>
            <el-radio-button value="detail">详细</el-radio-button>
          </el-radio-group>
        </div>

        <!-- 无结果时 -->
        <div class="result-content" v-if="!identifyData">
          <el-empty description="暂无识别结果">
            <template #description>
              <p>暂无识别结果</p>
            </template>
          </el-empty>
        </div>

        <!-- 有结果时 -->
        <div v-else class="result-wrapper">
          <!-- 概要视图 -->
          <template v-if="resultView === 'summary'">
            <div class="result-summary">
              <div class="summary-header">
                <div class="diagnosis-result">
                  <el-icon>
                    <Warning />
                  </el-icon>
                  <span class="diagnosis-text">{{ identifyData.diagnosis?.symptoms || '无症状描述' }}</span>
                </div>
                <div class="diagnosis-status">
                  <el-tag type="warning" effect="dark">{{ identifyData.diagnosis?.confidence || 0 }}% 可信度</el-tag>
                </div>
              </div>
              <el-row :gutter="20" class="summary-cards">
                <el-col :span="8">
                  <div class="summary-card">
                    <div class="card-title">
                      <el-icon>
                        <Document />
                      </el-icon>
                      症状概述
                    </div>
                    <div class="card-content">{{ identifyData.diagnosis?.symptoms || '无' }}</div>
                  </div>
                </el-col>
                <el-col :span="8">
                  <div class="summary-card">
                    <div class="card-title">
                      <el-icon>
                        <WarningFilled />
                      </el-icon>
                      主要原因
                    </div>
                    <div class="card-content">
                      <el-tag size="small" class="cause-tag">
                        {{ identifyData.diagnosis.primary_causes }}
                      </el-tag>
                    </div>
                  </div>
                </el-col>
                <el-col :span="8">
                  <div class="summary-card">
                    <div class="card-title">
                      <el-icon>
                        <Star />
                      </el-icon>
                      建议措施
                    </div>
                    <div class="card-content">
                      {{ identifyData.diagnosis.recommended_measures }}
                    </div>
                  </div>
                </el-col>
              </el-row>
            </div>
          </template>

          <!-- 详细视图 -->
          <template v-else>
            <!-- 诊断概要 -->
            <div class="diagnosis-summary">
              <div class="confidence-score">
                <el-progress type="dashboard" :percentage="identifyData.diagnosis.confidence"
                  :color="confidenceColors"></el-progress>
                <div class="score-label">诊断可信度</div>
              </div>
              <div class="quick-diagnosis">
                <h3>快速诊断</h3>
                <div class="diagnosis-tags">
                  <el-tag type="info" class="diagnosis-tag">{{ identifyData.quick_check.name }}</el-tag>
                  <el-tag type="warning" class="diagnosis-tag">
                    感染等级: {{ infectionLevelText(identifyData.quick_check.infection_level) }}
                  </el-tag>
                  <el-tag v-if="identifyData.quick_check.requires_treatment" type="danger" effect="dark"
                    class="diagnosis-tag urgency-tag">需要处理</el-tag>
                  <el-tag v-if="identifyData.quick_check.urgency" type="danger" effect="dark"
                    class="diagnosis-tag urgency-tag">紧急</el-tag>
                </div>
              </div>
            </div>
            <!-- 详细分析结果 -->
            <el-collapse v-model="staticCollapseActive">
              <el-collapse-item :title="identifyData.diagnosis.symptoms" name="0">
                <div class="result-detail">
                  <div class="detail-item">
                    <h4>症状描述</h4>
                    <p>{{ identifyData.diagnosis.symptoms }}</p>
                  </div>
                  <div class="detail-item">
                    <h4>可能原因</h4>
                    <el-steps :active="1" simple>
                      <el-step :title="identifyData.diagnosis.primary_causes" />
                    </el-steps>
                  </div>
                  <div class="detail-item">
                    <h4>建议措施</h4>
                    <el-timeline>
                      <el-timeline-item type="primary">{{
                        identifyData.diagnosis.recommended_measures }}</el-timeline-item>
                    </el-timeline>
                  </div>
                </div>
              </el-collapse-item>
            </el-collapse>
            <!-- 相似案例 -->
            <div class="similar-cases">
              <div class="section-title">相似案例</div>
              <el-carousel :interval="4000" type="card" height="200px">
                <el-carousel-item v-for="(item, index) in similarCases" :key="`case_${index}`">
                  <el-card shadow="hover">
                    <img :src="item.image" class="case-image">
                    <div class="case-info">
                      <h4>{{ item.title }}</h4>
                      <p>{{ item.description }}</p>
                    </div>
                  </el-card>
                </el-carousel-item>
              </el-carousel>
            </div>
            <!-- 专家建议 -->
            <div class="expert-advice">
              <div class="section-title">专家建议</div>
              <el-alert :title="identifyData.suggestions.prevention_measures" type="info"
                :description="identifyData.suggestions.attention_items" show-icon></el-alert>
            </div>
          </template>
        </div>
      </div>
    </div>

    <!-- 图片预览模态框 -->
    <div v-if="previewVisible" class="image-preview-modal" @click="closePreview"
      style="position: fixed; z-index: 9999; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(0,0,0,0.7); display: flex; align-items: center; justify-content: center;">
      <img :src="previewImageUrl" class="preview-image"
        style="max-width: 90vw; max-height: 90vh; border-radius: 8px; box-shadow: 0 2px 16px #0008; background: #fff;" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import AiService from '@/api/ai/aiApi'
import { getBase64 } from '@/utils/utils'
import type { IdentifyResult } from '@/types/ai'

const isDarkMode = ref(false)
const btnLoading = ref(false)
const identifyData = ref<IdentifyResult | null>(null)
const resultView = ref<'summary' | 'detail'>('summary')

// 统计卡片动态数据
const totalDetections = ref(758) // 总检测次数
const accuracy = ref(90)        // 识别准确率（百分比）
const avgTime = ref(4.5)         // 平均处理时间（秒）

// 症状描述输入框
const symptomDesc = ref('')
const clearSymptomDesc = () => {
  symptomDesc.value = ''
}

// 追加常见症状到输入框
const appendSymptom = (symptom: string) => {
  if (symptomDesc.value && !symptomDesc.value.endsWith(' ')) {
    symptomDesc.value += ' '
  }
  symptomDesc.value += symptom
}

// 图片上传
const imageFile = ref<File | null>(null)
const imageUrl = ref('')
const fileInput = ref<HTMLInputElement | null>(null)
const handleImageChange = (event: Event) => {
  const files = (event.target as HTMLInputElement).files
  if (!files || files.length === 0) return
  const file = files[0]
  const url = URL.createObjectURL(file)
  imageFile.value = file
  imageUrl.value = url
}

// 图片预览
const previewVisible = ref(false)
const previewImageUrl = ref('')
const openPreview = (url: string) => {
  previewImageUrl.value = url
  previewVisible.value = true
}
const closePreview = () => {
  previewVisible.value = false
  previewImageUrl.value = ''
}

// 智能识别
const handleIdentify = async () => {
  if (!imageFile.value) {
    ElMessage.error('请先上传图片')
    return
  }
  btnLoading.value = true
  const imageBase64 = await getBase64(imageFile.value)
  const res = await AiService.identify({
    prompt: symptomDesc.value,
    file: imageBase64
  })
  btnLoading.value = false
  identifyData.value = res.data
}

const staticCollapseActive = ref(['0'])
const confidenceColors = [
  { color: '#67C23A', percentage: 60 },
  { color: '#E6A23C', percentage: 80 },
  { color: '#F56C6C', percentage: 100 }
]

const infectionLevelText = (level?: number) => {
  if (level === 0) return '低';
  if (level === 1) return '中';
  if (level === 2) return '高';
  return '未知';
}

const similarCases = ref([
  {
    image: 'src/assets/img/ai/ytfbal.png',
    title: '鱼体发白案例',
    description: '典型的水质问题导致的鱼体发白，处理后通过更换水体和增氧恢复正常。'
  },
  {
    image: 'src/assets/img/ai/smb.png',
    title: '水霉病案例',
    description: '水霉病导致鱼体表面出现白色棉絮状物，需及时用药并改善水质。'
  },
  {
    image: 'src/assets/img/ai/yltl.jpg',
    title: '鱼鳞脱落',
    description: '鱼鳞脱落，属于真菌性病害，建议及时喷洒杀菌剂。'
  },
  {
    image: 'src/assets/img/ai/lfzb.jpg',
    title: '鲤浮肿病',
    description: '病原为鲤浮肿病毒,主要危害鲤和锦鲤,水温20℃~27℃时易发病。'
  },
  {
    image: 'src/assets/img/ai/yscxb.png',
    title: '鱼鳃出血症',
    description: '鱼鳃部位出血，常因细菌感染或水质恶化引起，建议加强水体消毒。'
  },
  {
    image: 'src/assets/img/ai/cpb.jpg',
    title: '赤皮病',
    description: '病原为荧光假单胞菌，主要危害草鱼、青鱼、鲤等多种淡水鱼类。'
  }
])

// 检测设置相关
const detectMode = ref('all')  // 默认综合检测
const imageQuality = ref(7)    // 默认图像质量 7
const detectPrecision = ref('standard')  // 默认标准精度
const enableAnnotation = ref(false)  // 默认启用病害标注
const saveHistory = ref(false)  // 默认保存历史
</script>

<style lang="scss" scoped>
.ai-detection-container {
  display: flex;
  gap: 20px;
  padding: 20px;
  /* height: 100%;  // 建议注释或删除 */
  min-height: 800px; // 可根据实际需要调整
  box-sizing: border-box;
  align-items: flex-start; // 内容顶部对齐

  .left-panel,
  .right-panel {
    flex: 1;
    background: var(--el-bg-color);
    border-radius: 8px;
    padding: 20px;
    box-shadow: var(--el-box-shadow-light);
    height: auto; // 让内容自适应
  }

  .section-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-bottom: 1px solid var(--el-border-color-light);
    padding-bottom: 6px;
    margin-bottom: 20px;

    .section-title {
      margin-bottom: 0;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .button-group {
      margin-left: auto;
      display: flex;
      align-items: center;
    }
  }

  .section-title {
    font-size: 16px;
    font-weight: bold;
    margin-bottom: 15px;
    display: flex;
    align-items: center;
    gap: 8px;

    .el-icon {
      font-size: 18px;
      color: var(--el-color-primary);
    }
  }

  .stats-cards {
    margin-bottom: 20px;

    .stat-card {
      background: var(--el-bg-color);
      border-radius: 8px;
      padding: 15px;
      display: flex;
      align-items: center;
      gap: 15px;
      box-shadow: var(--el-box-shadow-light);
      transition: transform 0.3s;

      &:hover {
        transform: translateY(-2px);
      }

      .stat-icon {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        background: var(--el-color-primary);
        color: white;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 20px;

        &.success {
          background: var(--el-color-success);
        }

        &.warning {
          background: var(--el-color-warning);
        }
      }

      .stat-info {
        flex: 1;

        .stat-value {
          font-size: 20px;
          font-weight: bold;
          color: var(--el-text-color-primary);
        }

        .stat-label {
          font-size: 12px;
          color: var(--el-text-color-secondary);
        }
      }
    }
  }

  .description-area {
    .quick-symptoms {
      margin-top: 10px;
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin-bottom: 15px;

      .clickable-tag {
        cursor: pointer;

        &:hover {
          background-color: var(--el-color-primary-light-9);
        }
      }
    }
  }

  .upload-section {
    .image-upload {
      border: 2px dashed var(--el-border-color);
      border-radius: 6px;
      cursor: pointer;
      margin-bottom: 15px;

      .upload-content {
        text-align: center;
        padding: 20px;

        .upload-icon {
          font-size: 48px;
          color: var(--el-text-color-secondary);
        }

        .upload-text {
          margin: 10px 0;
          font-size: 16px;
        }

        .upload-tips {
          color: var(--el-text-color-secondary);
          font-size: 12px;
        }
      }
    }
  }

  .action-buttons {
    margin-top: 30px;
    padding-top: 20px;
    border-top: 1px solid var(--el-border-color-light);

    .main-actions {
      width: 100%;

      .start-button {
        flex: 2;
        position: relative;

        .shortcut-tip {
          position: absolute;
          right: 8px;
          bottom: 2px;
          font-size: 10px;
          opacity: 0.7;
        }
      }
    }
  }

  .button-group {
    display: flex;
    gap: 8px;
  }

  .image-display-section {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 10px;
    min-height: 400px;
    max-height: 800px;
    margin-bottom: 10px;

    .preview-tools {
      padding: 8px;
      background: var(--el-fill-color-light);
      border-radius: 4px;
    }

    .main-preview-area {
      flex: 1;
      border: 1px solid var(--el-border-color);
      border-radius: 4px;
      overflow: hidden;
      display: flex;
      align-items: center;
      justify-content: center;
      background: var(--el-fill-color-blank);
      position: relative;
      padding: 20px;
      min-height: 415px;
      margin-bottom: 10px;

      .empty-preview {
        text-align: center;
        color: var(--el-text-color-secondary);

        .el-icon {
          font-size: 48px;
          margin-bottom: 10px;
        }
      }
    }
  }

  .recognition-section {
    .result-content {
      font-size: 13px;
    }
  }

  @media (max-width: 768px) {
    flex-direction: column;

    .left-panel,
    .right-panel {
      width: 100%;
    }
  }

  .dark-mode {
    background: var(--el-bg-color-overlay);
    color: var(--el-text-color-primary);
  }
}

.detection-settings {
  margin-top: 20px;

  .settings-form {
    margin: 0 auto;

    :deep(.el-form-item__content) {
      justify-content: flex-start;
    }

    .el-radio-group {
      width: 100%;
      display: flex;
      gap: 10px;

      .el-radio-button {
        flex: 1;

        :deep(.el-radio-button__inner) {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 5px;
        }
      }
    }

    .advanced-settings {
      display: flex;
      gap: 20px;
    }
  }
}

/* 新增样式 */
.result-wrapper {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.diagnosis-summary {
  display: flex;
  gap: 20px;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 8px;
  margin-bottom: 20px;
}

.confidence-score {
  text-align: center;
}

.score-label {
  margin-top: 10px;
  color: #606266;
}

.quick-diagnosis {
  flex: 1;
}

.diagnosis-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 12px;
}

.diagnosis-tag {
  margin: 0 !important;
  /* 覆盖 element-ui 默认边距 */
}

.diagnosis-tag.urgency-tag {
  margin-left: 0 !important;
}

/* 标签颜色自定义 */
.el-tag--danger.urgency-tag {
  background-color: #ff4d4f;
  border-color: #ff4d4f;
  color: white;
}

.result-detail {
  padding: 15px;
}

.detail-item {
  margin-bottom: 20px;
}

.detail-item h4 {
  margin-bottom: 10px;
  color: #303133;
}

.similar-cases {
  margin: 20px 0;
}

.case-image {
  width: 100%;
  height: 120px;
  object-fit: cover;
  border-radius: 4px;
}

.case-info {
  padding: 10px 0;
}

.case-info h4 {
  margin: 0 0 5px 0;
}

.case-info p {
  margin: 0;
  font-size: 12px;
  color: #909399;
}

.expert-advice {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.expert-advice .el-alert {
  margin-bottom: 10px;
}

/* 新增概要视图样式 */
.result-summary {
  padding: 20px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.summary-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid #EBEEF5;
}

.diagnosis-result {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 18px;
  font-weight: bold;
}

.diagnosis-result i {
  color: #E6A23C;
  font-size: 24px;
}

.summary-cards {
  margin-bottom: 30px;
}

.summary-card {
  height: 100%;
  padding: 15px;
  background: #F8F9FA;
  border-radius: 6px;
  transition: transform 0.3s;
}

.summary-card:hover {
  transform: translateY(-2px);
}

.card-title {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
  font-weight: bold;
  color: #303133;
}

.card-title i {
  color: #409EFF;
}

.card-content {
  color: #606266;
  font-size: 14px;
  line-height: 1.5;
}

.cause-tag {
  margin: 0 4px 4px 0;
  white-space: normal !important;
  word-break: break-all;
  display: block !important;
  max-width: 100%;
}
</style>
