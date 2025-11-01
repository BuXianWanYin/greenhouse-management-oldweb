<!-- 图片卡片 -->
<template>
  <el-card class="card" shadow="hover">
    <div class="card-header">
      <div class="header-content">
        <div class="section-name">
          种质信息
        </div>
        <div class="name">{{ className }}</div>
      </div>
    </div>

    <div class="image">
      <img :src="classImage" alt="种质图片" />
    </div>

    <div class="card-content">
      <div class="info">
        <div class="info-group">
          <div class="info-row">
            <div class="info-item">
              <el-icon><Crop /></el-icon>
              <span class="label">{{ nameLabel }}</span>
              <span class="value">{{ className }}</span>
            </div>
            <div class="info-item">
              <el-icon><Collection /></el-icon>
              <span class="label">{{ typeLabel }}</span>
              <span class="value">{{ classTypeName }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="card-actions">
      <slot name="button"></slot>
    </div>
  </el-card>
</template>

<script setup lang="ts">
  import {Crop, Collection } from '@element-plus/icons-vue'
  import { computed } from 'vue'

  interface Props {
    className: string
    classTypeName: string
    classType: string
    classImage: string
  }

  const props = defineProps<Props>()

  const nameLabel = computed(() => props.classType === '0' ? '水产名称：' : '作物名称：')
  const typeLabel = computed(() => props.classType === '0' ? '水产类型：' : '作物类型：')
</script>

<style lang="scss" scoped>
  .card {
    height: 490px;
    background: white;
    border-radius: 12px;
    transition: all 0.3s ease;
    border: 1px solid rgba(0, 0, 0, 0.05);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
    display: flex;
    flex-direction: column;

    .card-header {
      margin-bottom: 16px;
      display: flex;
      justify-content: space-between;
      align-items: flex-start;

      .header-content {
        .section-name {
          font-size: 13px;
          color: #909399;
          margin-bottom: 6px;
          display: flex;
          align-items: center;
          gap: 6px;

          .el-icon {
            color: #2561b9;
            font-size: 16px;
          }
        }

        .name {
          font-size: 16px;
          font-weight: 600;
          color: #333;
        }
      }
    }

    .image {
      width: 100%;
      height: 281px;
      border-radius: 8px;
      overflow: hidden;
      cursor: pointer;
      margin-bottom: 16px;

      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
    }

    .card-content {
      padding: 0;
      flex: 1;

      .info {
        display: flex;
        flex-direction: column;
        gap: 20px;

        .info-group {
          padding-top: 15px;
          padding-bottom: 16px;

          &:first-child {
            border-bottom: 1px dashed #ebeef5;
          }

          .info-row {
            display: flex;
            gap: 20px;

            .info-item {
              flex: 1;
              font-size: 13px;
              display: flex;
              align-items: center;
              white-space: nowrap;

              .el-icon {
                color: #409eff;
                margin-right: 8px;
                font-size: 16px;
              }

              .label {
                color: #666;
                margin-right: 8px;
                min-width: 70px;
              }

              .value {
                color: #333;
                flex: 1;
                overflow: hidden;
                text-overflow: ellipsis;
              }
            }
          }
        }
      }
    }

    .card-actions {
      padding-top: 12px;
      display: flex;
      gap: 12px;
      justify-content: flex-end;
      border-top: 1px solid rgba(0, 0, 0, 0.05);

      .el-button, .card-action-btn {
        height: 33px;
        font-size: 10px;
        padding: 8px 13px;
        border-radius: 6px;
        margin: 0;
        transition: all 0.3s ease;
        font-weight: 500;
        letter-spacing: 0.5px;

        &.el-button--primary {
          background-color: #ecf5ff;
          border: 1px solid #409eff;
          color: #409eff;

          &:hover {
            background-color: #409eff;
            color: #ffffff;
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(64, 158, 255, 0.3);
          }
        }

        &.el-button--danger {
          background-color: #fef0f0;
          border: 1px solid #f56c6c;
          color: #f56c6c;

          &:hover {
            background-color: #f56c6c;
            color: #ffffff;
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(245, 108, 108, 0.3);
          }
        }

        &.el-button--warning {
          background-color: #fdf6ec;
          border: 1px solid #e6a23c;
          color: #e6a23c;

          &:hover {
            background-color: #e6a23c;
            color: #ffffff;
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(230, 162, 60, 0.3);
          }
        }

        &.el-button--success {
          background-color: #f0f9eb;
          border: 1px solid #67c23a;
          color: #67c23a;

          &:hover {
            background-color: #67c23a;
            color: #ffffff;
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(103, 194, 58, 0.3);
          }
        }
      }
    }

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 12px 32px rgba(0, 0, 0, 0.12);
    }

    .info-item:hover .el-icon,
    .section-name:hover .el-icon {
      color: #67c23a;
    }
  }
</style>
