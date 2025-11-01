<template>
  <ul class="card-list" :style="{ marginTop: showWorkTab ? '0' : '10px' }">
    <li class="art-custom-card" v-for="(item, index) in dataList" :key="index">
      <span class="des subtitle">{{ item.label }}</span>
      <span class="number box-title">
        <MoCountTo :num="item.value" :duration="800" :separator="2" />
        <span v-if="item.label === '农场面积'" class="unit">亩</span>
        <span v-if="item.label === '农场大棚'" class="unit">个</span>
        <span v-if="item.label === '农场分区'" class="unit">块</span>
        <span v-if="item.label === '农场种类'" class="unit">种</span>
      </span>
      <div class="change-box">
        <span class="change-text">较上周</span>
        <span
          class="change"
          :class="[item.change.indexOf('+') === -1 ? 'text-danger' : 'text-success']"
        >
          {{ item.change }}
        </span>
      </div>
      <i class="iconfont-sys" v-html="item.icon"></i>
    </li>
  </ul>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useSettingStore } from '@/store/modules/setting'
import type { ConsoleTotalInfo } from '@/types/agriculture/console'

const props = defineProps({
  dataList: { type: Array<ConsoleTotalInfo>, default: () => [] }
})

const settingStore = useSettingStore()
const showWorkTab = computed(() => settingStore.showWorkTab)
</script>

<style lang="scss" scoped>
  .card-list {
    box-sizing: border-box;
    display: flex;
    flex-wrap: wrap;
    width: calc(100% + var(--console-margin));
    margin-top: 0 !important;
    margin-left: calc(0px - var(--console-margin));
    background-color: transparent !important;

    li {
      position: relative;
      box-sizing: border-box;
      display: flex;
      flex-direction: column;
      justify-content: center;
      width: calc(25% - var(--console-margin));
      height: 140px;
      padding: 0 18px;
      margin: 0 0 0 var(--console-margin);
      background: var(--art-main-bg-color);

      $icon-size: 52px;

      .iconfont-sys {
        position: absolute;
        top: 0;
        right: 20px;
        bottom: 0;
        width: $icon-size;
        height: $icon-size;
        margin: auto;
        overflow: hidden;
        font-size: 22px;
        line-height: $icon-size;
        color: var(--el-color-primary) !important;
        text-align: center;
        background-color: var(--el-color-primary-light-9);
        border-radius: 12px;
      }

      .des {
        display: block;
        height: 14px;
        font-size: 14px;
        line-height: 14px;
      }

      .number {
        display: inline-flex;
        align-items: baseline;
        margin-top: 10px;
        font-size: 28px;
        font-weight: 400;
      }

      .unit {
        font-size: 18px;
        margin-left: 8px;
        align-self: flex-start;
        margin-top: 4px;
      }

      .change-box {
        display: flex;
        align-items: center;
        margin-top: 10px;

        .change-text {
          display: block;
          font-size: 13px;
          color: var(--art-text-gray-600);
        }

        .change {
          display: block;
          margin-left: 5px;
          font-size: 13px;
          font-weight: bold;
        }
      }
    }
  }

  .dark {
    .card-list {
      li {
        .iconfont-sys {
          background-color: #232323 !important;
        }
      }
    }
  }
</style>
