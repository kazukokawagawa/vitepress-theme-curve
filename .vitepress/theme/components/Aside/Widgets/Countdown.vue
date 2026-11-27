<template>
  <!-- 倒计时 -->
  <div
    v-if="theme.aside.countDown.enable"
    :class="['count-down', 's-card', { 'has-ten-year-inline': showInlineTenYear }]"
  >
    <div class="count-left">
      <span class="text"> 距离 </span>
      <span class="name">{{ theme.aside.countDown.data.name }}</span>
      <span class="time">
        <LiveDate mode="days-until" :date="theme.aside.countDown.data.date" yearly />
      </span>
      <span class="date">
        <LiveDate mode="format" :date="theme.aside.countDown.data.date" format="YYYY-MM-DD" yearly />
      </span>
    </div>
    <div v-if="remainData" class="count-right">
      <template v-for="item in remainData" :key="item.name">
        <div class="count-item">
          <div class="item-name">{{ item.name }}</div>
          <div class="item-progress">
            <div
              class="progress-bar"
              :style="{ width: item.percentage + '%', opacity: item.percentage / 100 }"
            />
            <span :class="['percentage', { many: item.percentage >= 46 }]">
              {{ item.percentage }}%
            </span>
            <span :class="['remaining', { many: item.percentage >= 60 }]">
              <span class="tip">还剩</span>
              {{ item.remaining }}
              <span class="tip">{{ item.remainingUnit }}</span>
            </span>
          </div>
        </div>
        <div
          v-if="item.name === '本年' && showInlineTenYear && tenYearInfo"
          class="ten-year-inline"
        >
          <div class="ten-year-inline-heading">
            <span>十年之约</span>
            <strong>{{ tenYearInfo.progress === null ? "—" : `${tenYearInfo.progress}%` }}</strong>
          </div>
          <div
            class="ten-year-inline-progress"
            role="progressbar"
            aria-label="十年之约进度"
            aria-valuemin="0"
            aria-valuemax="100"
            :aria-valuenow="tenYearInfo.progress ?? 0"
          >
            <span :style="{ width: `${tenYearInfo.progress ?? 0}%` }" />
          </div>
          <div class="ten-year-inline-summary">
            <span>已同行 {{ tenYearInfo.elapsedDays ?? "—" }} 天</span>
            <span>{{ tenYearInfo.complete ? "十年之约完成" : `还剩 ${tenYearInfo.remainingText}` }}</span>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup>
import { getTimeRemaining } from "@/utils/timeTools";
import { useClientNow } from "@/utils/useClientNow.mjs";
import { getTenYearInfo } from "@/utils/tenYear.mjs";

const { theme } = useData();

// 倒计时数据：基于浏览器本地时钟实时计算，SSR 阶段不输出。
// 剩余不足一天时用小时显示；今日进度按分钟更新，因此无需每秒重算。
const { now } = useClientNow({ interval: 60 * 1000 });
const remainData = computed(() => (now.value ? getTimeRemaining(now.value) : null));
const showInlineTenYear = computed(
  () => Boolean(theme.value.tenYear?.enable && !theme.value.tenYear?.independent),
);
const tenYearInfo = computed(() =>
  showInlineTenYear.value ? getTenYearInfo(theme.value.since, now.value) : null,
);
</script>

<style lang="scss" scoped>
.count-down {
  display: flex;
  flex-direction: row;
  align-items: center;
  &.has-ten-year-inline {
    align-items: flex-start;
  }
  .count-left {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: space-evenly;
    margin-right: 0.8rem;
    .text {
      font-size: 14px;
      color: var(--main-font-second-color);
    }
    .name {
      font-weight: bold;
      font-size: 18px;
      margin-top: 2px;
    }
    .time {
      font-size: 30px;
      font-weight: bold;
      margin: 4px 0;
      color: var(--main-color);
    }
    .date {
      font-size: 12px;
      opacity: 0.6;
    }
    &::after {
      content: "";
      position: absolute;
      right: -0.8rem;
      top: 10%;
      width: 2px;
      height: 80%;
      background-color: var(--main-card-border);
    }
  }
  .count-right {
    flex: 1;
    width: 100%;
    margin-left: 0.8rem;
    .count-item {
      display: flex;
      flex-direction: row;
      align-items: center;
      height: 24px;
      margin: 6px 0;
      .item-name {
        font-size: 14px;
        margin-right: 0.8rem;
        white-space: nowrap;
        color: var(--main-font-second-color);
      }
      .item-progress {
        position: relative;
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: space-between;
        height: 100%;
        width: 100%;
        border-radius: 8px;
        background-color: var(--main-color-bg);
        overflow: hidden;
        .progress-bar {
          height: 100%;
          border-radius: 8px;
          background-color: var(--main-color);
        }
        .percentage,
        .remaining {
          position: absolute;
          font-size: 12px;
          margin: 0 6px;
          transition:
            opacity 0.3s,
            transform 0.3s;
          &.many {
            color: #fff;
            .tip {
              opacity: 0.8;
            }
          }
        }
        .remaining {
          opacity: 0;
          transform: translateX(10px);
          .tip {
            opacity: 0.6;
          }
        }
      }
    }
    .ten-year-inline {
      margin-top: 0.55rem;
      padding-top: 0.55rem;
      border-top: 1px solid var(--main-card-border);
    }
    .ten-year-inline-heading,
    .ten-year-inline-summary {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 0.5rem;
    }
    .ten-year-inline-heading {
      margin-bottom: 0.35rem;
      color: var(--main-font-color);
      font-size: 0.78rem;
      font-weight: 600;
      strong {
        color: var(--main-color);
        font-variant-numeric: tabular-nums;
      }
    }
    .ten-year-inline-progress {
      height: 5px;
      overflow: hidden;
      border-radius: 999px;
      background: var(--main-color-bg);
      span {
        display: block;
        height: 100%;
        border-radius: inherit;
        background: var(--main-color);
        transition: width 0.6s ease;
      }
    }
    .ten-year-inline-summary {
      flex-wrap: wrap;
      margin-top: 0.35rem;
      color: var(--main-font-second-color);
      font-size: 0.65rem;
      line-height: 1.4;
    }
  }
  &:hover {
    .count-right {
      .remaining {
        transform: translateX(0) !important;
        opacity: 1 !important;
      }
      .percentage {
        transform: translateX(-10px) !important;
        opacity: 0 !important;
      }
    }
  }
}
</style>
