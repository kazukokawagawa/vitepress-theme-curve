<script setup>
import { useData } from "vitepress";

const { theme } = useData();

// 复用侧边栏 Timing 组件的出生日期
const dayCount = computed(() => {
  const ds = theme.value.aside.timing?.date;
  if (!ds) return 0;
  const d = new Date(ds);
  const msPerDay = 1000 * 60 * 60 * 24;
  const diff = Date.now() - d.getTime();
  return diff >= 0 ? Math.floor(diff / msPerDay) : 0;
});
</script>

<template>
  <span class="alive-days">{{ dayCount }}</span>
</template>

<style scoped>
.alive-days {
  font-weight: bold;
}
</style>
