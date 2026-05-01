<script setup>
import dayjs from "dayjs";
import { useData } from "vitepress";

const { theme } = useData();

const isFuture = computed(() => {
  const ds = theme.value.aside.timing?.date;
  if (!ds) return false;
  const target = dayjs(ds);
  return target.isValid() ? target.isAfter(dayjs()) : false;
});
</script>

<template>
  <div v-if="theme.aside.timing?.enable" class="timing-card s-card">
    <!-- 未来倒计时 -->
    <p v-if="isFuture" class="custom-text">
      ⏳ 距离 
          <span class="event-name">
        {{ theme.aside.timing.event }}
    </span> 还有
      <span class="day-number"><LiveDate mode="days-gap" source="theme-timing" /></span> 天
    </p>
    <!-- 过去累计天数 -->
    <p v-else class="custom-text">
      💌 
      <span class="title-name">
        {{ theme.aside.timing.name }}
    </span> 
          <span class="event-name">
        {{ theme.aside.timing.event }}
    </span>
    已经
      <span class="day-number"><LiveDate mode="days-gap" source="theme-timing" /></span> 天
    </p>
  </div>
</template>

<style scoped>
/* 只保留组件特定的样式，通用样式由 s-card 处理 */
.timing-card {
  padding: 1rem;
  display: flex;
  justify-content: center;
  align-items: center;
}

.title-name {
  font-weight: bold;
  font-size: 1rem;
}

.event-name {
  font-size: 1.2rem;
  font-weight: 800;
  color: var(--vp-c-brand);
  margin: 0 0.25rem;
  color: var(--main-color);
}

.custom-text {
  font-size: 1rem;
  color: var(--vp-c-text-2);
  text-align: center;
  line-height: 1.5;
}

.day-number {
  font-size: 1.2em;
  font-weight: 800;
  color: var(--vp-c-brand);
  vertical-align: middle;
  color: var(--main-color);
}
</style>
