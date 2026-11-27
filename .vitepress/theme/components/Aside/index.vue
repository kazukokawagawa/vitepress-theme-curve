<template>
  <aside class="main-aside">
    <Hello v-if="theme.aside.hello.enable" class="weidgets" />
    <div class="sticky">
      <Timing
        v-if="theme.tenYear?.enable && theme.tenYear?.independent"
        class="weidgets"
        show-ten-year
      />
      <Toc v-if="theme.aside.toc.enable && showToc" class="weidgets" />
  <Weather
    v-if="theme.aside.weather.enable && showWeather"
    class="weidgets"
    @fetch-error="onWeatherError"
  />
      <Countdown v-if="theme.aside.countDown.enable" class="weidgets" />
      <Timing v-if="theme.aside.timing.enable" class="weidgets" />
      <!-- HelloGithub 热榜 -->
    <HelloGithubHot
      v-if="theme.aside.HelloGithub.enable && showHot"
      @fetch-error="onHotError"
    />
      <Tags v-if="theme.aside.tags.enable" class="weidgets" />
      <SiteData v-if="theme.aside.siteData.enable" class="weidgets" />
    </div>
  </aside>
</template>

<script setup>
const { theme } = useData();
const props = defineProps({
  // 显示目录
  showToc: {
    type: Boolean,
    default: false,
  },
});

// 已有：天气组件的显示开关
const showWeather = ref(true)
// 新增：热榜组件的显示开关
const showHot = ref(true)
// 一旦收到子组件的 fetch-error 事件，就把 showWeather 置为 false
function onWeatherError(err) {
  console.error('天气组件获取失败：', err)
  showWeather.value = false
}

function onHotError(err) {
  console.error('HelloGithub 热榜获取失败：', err)
  showHot.value = false
}
</script>

<style lang="scss" scoped>
.main-aside {
  padding-left: 1rem;
  display: flex;
  flex-direction: column;
  animation: fade-up 0.6s 0.3s backwards;
  .weidgets {
    padding: 18px;
    margin-bottom: 1rem;
    :deep(.title) {
      margin-bottom: 12px;
      font-weight: bold;
      display: flex;
      align-items: center;
      opacity: 0.75;
      .iconfont {
        opacity: 0.6;
        margin-right: 6px;
      }
      .title-name {
        opacity: 0.8;
      }
    }
  }
  .sticky {
    position: sticky;
    top: calc(60px + 1rem);
    .weidgets {
      animation: fade-up 0.6s 0.4s backwards;
      &:last-child {
        margin-bottom: 0;
      }
    }
  }
}
</style>
