<script setup>
import dayjs from "dayjs";
import { useData } from "vitepress";

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
});

const { theme } = useData();

const resolvedDate = computed(() => {
  if (props.date) return props.date;
  if (props.source === "theme-timing") return theme.value.aside.timing?.date || "";
  return "";
});

const targetDate = computed(() => {
  if (!resolvedDate.value) return null;
  const parsed = dayjs(resolvedDate.value);
  return parsed.isValid() ? parsed : null;
});

const displayDate = computed(() => {
  const target = targetDate.value;
  if (!target) return null;
  if (!props.yearly) return target;

  const today = dayjs().startOf("day");
  let nextDate = target.startOf("day");
  while (nextDate.isBefore(today)) {
    nextDate = nextDate.add(1, "year");
  }
  return nextDate;
});

const text = computed(() => {
  const now = dayjs();

  if (props.mode === "today") {
    return now.format(props.format);
  }

  const target = targetDate.value;
  if (!target) return "";

  if (props.mode === "format") {
    return displayDate.value?.format(props.format) || "";
  }

  if (props.mode === "days-since") {
    const diff = now.diff(target, "day", true);
    return diff >= 0 ? String(Math.floor(diff)) : "0";
  }

  if (props.mode === "days-until") {
    const dateToUse = displayDate.value || target.startOf("day");
    return String(dateToUse.startOf("day").diff(now.startOf("day"), "day"));
  }

  if (props.mode === "days-gap") {
    const diff = now.diff(target, "day", true);
    return diff >= 0 ? String(Math.floor(diff)) : String(Math.ceil(-diff));
  }

  if (props.mode === "age") {
    return String(now.diff(target, "year"));
  }

  return "";
});
</script>

<template>
  <span class="live-date">{{ text }}</span>
</template>
