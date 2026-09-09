<!-- 侧边栏 - 站点数据 -->
<template>
  <div class="site-data s-card">
    <div class="title">
      <i class="iconfont icon-chart"></i>
      <span class="title-name">站点数据</span>
    </div>
    <div class="all-data">
      <div class="data-item">
        <span class="name">
          <i class="iconfont icon-article"></i>
          文章总数
        </span>
        <span class="num">{{ theme.postCount || 0 }} 篇</span>
      </div>
      <div class="data-item">
        <span class="name">
          <i class="iconfont icon-date"></i>
          建站天数
        </span>
        <span class="num">{{ sinceDays === null ? "--" : `${sinceDays} 天` }}</span>
      </div>
      <div class="data-item">
        <span class="name">
          <i class="iconfont icon-visibility"></i>
          总访问量
        </span>
        <span class="num" id="busuanzi_value_site_pv">0</span>
      </div>
      <div class="data-item">
        <span class="name">
          <i class="iconfont icon-account"></i>
          总访客数
        </span>
        <span class="num" id="busuanzi_value_site_uv">0</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { loadScript } from "@/utils/commonTools";
import { daysPassedAt, useClientNow } from "@/utils/useClientNow.mjs";

const { theme } = useData();

// 建站天数基于浏览器本地时钟实时计算
const { now } = useClientNow();
const sinceDays = computed(() => daysPassedAt(theme.value.since, now.value));

onMounted(() => {
  loadScript("https://busuanzi.ibruce.info/busuanzi/2.3/busuanzi.pure.mini.js", {
    async: true,
    reload: true,
  });
});
</script>

<style lang="scss" scoped>
.site-data {
  .all-data {
    .data-item {
      display: flex;
      flex-direction: row;
      align-items: center;
      justify-content: space-between;
      padding: 0.5rem 0.2rem;
      .name {
        display: flex;
        flex-direction: row;
        align-items: center;
        .iconfont {
          margin-right: 8px;
          opacity: 0.6;
          font-size: 18px;
        }
      }
      .num {
        opacity: 0.8;
        font-size: 15px;
      }
      #busuanzi_value_site_pv {
        &::after {
          content: " 次";
        }
      }
      #busuanzi_value_site_uv {
        &::after {
          content: " 人";
        }
      }
      &:last-child {
        padding-bottom: 0;
      }
    }
  }
}
</style>
