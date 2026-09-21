<script setup>
import dayjs from "dayjs";
import { useData } from "vitepress";
import { useClientNow } from "@/utils/useClientNow.mjs";

const props = defineProps({
  mode: {
    type: String,
    default: "today",
  },
  date: {
    type: String,
    default: "",
  },
  source: {
    type: String,
    default: "",
  },
  format: {
    type: String,
    default: "YYYY.MM.DD",
  },
  yearly: {
    type: Boolean,
    default: false,
  },
  includeStart: {
    type: Boolean,
    default: false,
  },
});

const { theme } = useData();

// 相对时间统一走本地浏览器时钟计算，SSR 阶段不输出结果，避免缓存固化构建时时间
const { now } = useClientNow();

/**
 * 解析日期字符串。
 * 支持两种写法：
 *  - 完整日期：`2025-03-24`
 *  - 无年份的每年循环项：`09-07`（生日这类每年重复的事件）
 * 无年份写法用 date 面板构造，保证落在**本地**那一天；
 * 也能避免 `dayjs("09-07")` 被解析成 2001 年这种意外。
 */
const parseLiveDate = (value) => {
  const str = String(value ?? "").trim();
  const monthDay = /^(\d{1,2})-(\d{1,2})$/.exec(str);
  if (monthDay) {
    const month = Number(monthDay[1]);
    const day = Number(monthDay[2]);
    if (month < 1 || month > 12 || day < 1 || day > 31) return null;
    // 基准年只影响"今年之前"的部分，yearly 循环会把它加回到不早于今天，
    // 所以取当前年份可读性最好，也不影响最终结果。
    const base = now.value || dayjs();
    const parsed = base.startOf("day").month(month - 1).date(day).startOf("day");
    return parsed.isValid() ? parsed : null;
  }
  const parsed = dayjs(str);
  return parsed.isValid() ? parsed : null;
};

const resolvedDate = computed(() => {
  if (props.date) return props.date;
  if (props.source === "theme-timing") {
    const timing = theme.value.aside.timing;
    if (Array.isArray(timing?.items) && timing.items.length > 0) {
      return timing.items[0]?.date || "";
    }
    return timing?.date || "";
  }
  return "";
});

const targetDate = computed(() => {
  if (!resolvedDate.value) return null;
  return parseLiveDate(resolvedDate.value);
});

const displayDate = computed(() => {
  const target = targetDate.value;
  if (!target || !now.value) return null;
  if (!props.yearly) return target;

  const today = now.value.startOf("day");
  let nextDate = target.startOf("day");
  while (nextDate.isBefore(today)) {
    nextDate = nextDate.add(1, "year");
  }
  return nextDate;
});

const text = computed(() => {
  const current = now.value;
  // SSR / 尚未挂载时不输出，等客户端接管
  if (!current) return "";

  if (props.mode === "today") {
    return current.format(props.format);
  }

  const target = targetDate.value;
  if (!target) return "";

  if (props.mode === "format") {
    return displayDate.value?.format(props.format) || "";
  }

  if (props.mode === "days-since") {
    const diff = current.startOf("day").diff(target.startOf("day"), "day");
    return diff >= 0 ? String(diff + 1) : "0";
  }

  if (props.mode === "days-until") {
    const dateToUse = displayDate.value || target;
    return String(dateToUse.startOf("day").diff(current.startOf("day"), "day"));
  }

  if (props.mode === "days-gap") {
    // 按日历天计算，不用带小数的 diff：带小数的 diff 比较的是"完整的 24 小时数"，
    // 当目标时刻带钟点时会随当前钟点跳变（同一天内取到不同值）。
    // 先各自 startOf('day') 再 diff，两个纯日期之间结果恒定。
    const diff = current.startOf("day").diff(target.startOf("day"), "day");
    return String(diff >= 0 ? diff + (props.includeStart ? 1 : 0) : -diff);
  }

  if (props.mode === "age") {
    return String(current.diff(target, "year"));
  }

  return "";
});
</script>

<template>
  <span class="live-date">{{ text }}</span>
</template>
