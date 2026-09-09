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
  const parsed = dayjs(resolvedDate.value);
  return parsed.isValid() ? parsed : null;
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
    const diff = current.diff(target, "day", true);
    return diff >= 0 ? String(Math.floor(diff) + 1) : "0";
  }

  if (props.mode === "days-until") {
    const dateToUse = displayDate.value || target.startOf("day");
    return String(dateToUse.startOf("day").diff(current.startOf("day"), "day"));
  }

  if (props.mode === "days-gap") {
    const diff = current.diff(target, "day", true);
    return diff >= 0 ? String(Math.floor(diff) + (props.includeStart ? 1 : 0)) : String(Math.ceil(-diff));
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
