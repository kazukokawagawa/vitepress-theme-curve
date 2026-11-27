<script setup>
import dayjs from "dayjs";
import { useData } from "vitepress";
import { useClientNow } from "@/utils/useClientNow.mjs";

const props = defineProps({
  showTenYear: {
    type: Boolean,
    default: false,
  },
});

const { theme } = useData();
const { now } = useClientNow({ interval: 60 * 1000 });

const normalizeItem = (item) => ({
  icon: item?.icon || "💌",
  name: item?.name || "",
  event: item?.event || "",
  date: item?.date || "",
  yearly: Boolean(item?.yearly),
  includeStart: Boolean(item?.includeStart),
});

const timingItems = computed(() => {
  const timing = theme.value.aside.timing;
  if (!timing?.enable) return [];

  if (Array.isArray(timing.items) && timing.items.length > 0) {
    return timing.items
      .map(normalizeItem)
      .filter((item) => item.date && (item.name || item.event));
  }

  if (timing.date && (timing.name || timing.event)) {
    return [normalizeItem(timing)];
  }

  return [];
});

const tenYearStart = computed(() => {
  if (!props.showTenYear) return null;

  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(theme.value.since || ""));
  if (!match) return null;

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = dayjs(new Date(year, month - 1, day));
  if (date.year() !== year || date.month() !== month - 1 || date.date() !== day) return null;
  return date.startOf("day");
});

const tenYearDeadline = computed(() => tenYearStart.value?.add(10, "year") || null);
const tenYearStats = computed(() => {
  const start = tenYearStart.value;
  const deadline = tenYearDeadline.value;
  const current = now.value;
  if (!start || !deadline || !current) return null;

  const totalDays = deadline.diff(start, "day");
  const today = current.startOf("day");
  const elapsedDays = Math.min(Math.max(today.diff(start, "day"), 0), totalDays);
  const remainingDays = Math.max(deadline.diff(today, "day"), 0);
  const progress = totalDays > 0 ? Math.round((elapsedDays / totalDays) * 1000) / 10 : 100;

  return {
    elapsedDays,
    remainingDays,
    progress,
    complete: !today.isBefore(deadline),
  };
});

const getDisplayDate = (item) => {
  const target = dayjs(item.date);
  if (!target.isValid() || !now.value) return null;
  if (!item.yearly) return target;

  const today = now.value.startOf("day");
  let nextDate = target.startOf("day");
  while (nextDate.isBefore(today)) {
    nextDate = nextDate.add(1, "year");
  }
  return nextDate;
};

const isFuture = (item) => {
  const target = getDisplayDate(item);
  return target && now.value ? target.isAfter(now.value) : false;
};

const getMode = (item) => (item.yearly ? "days-until" : "days-gap");
</script>

<template>
  <div v-if="showTenYear && tenYearStart" class="timing-card ten-year-card s-card">
    <div class="ten-year-heading">
      <h2>十年之约</h2>
      <strong>{{ tenYearStats ? `${tenYearStats.progress}%` : "—" }}</strong>
    </div>
    <div
      class="ten-year-progress"
      role="progressbar"
      aria-label="十年之约进度"
      aria-valuemin="0"
      aria-valuemax="100"
      :aria-valuenow="tenYearStats?.progress ?? 0"
    >
      <span :style="{ width: `${tenYearStats?.progress ?? 0}%` }" />
    </div>
    <div class="ten-year-stats">
      <div class="ten-year-stat">
        <strong>{{ tenYearStats?.elapsedDays ?? "—" }}</strong>
        <span>已同行天数</span>
      </div>
      <div class="ten-year-stat remaining">
        <strong>{{ tenYearStats ? (tenYearStats.complete ? "完成" : tenYearStats.remainingDays) : "—" }}</strong>
        <span>{{ tenYearStats?.complete ? "十年之约" : "剩余天数" }}</span>
      </div>
    </div>
  </div>
  <div v-else-if="timingItems.length" class="timing-card s-card">
    <div v-for="(item, index) in timingItems" :key="`${item.name}-${item.event}-${index}`" class="timing-item">
      <p class="custom-text">
        <span class="item-icon">{{ item.icon }}</span>
        <span v-if="item.name" class="title-name">{{ item.name }}</span>
        <span v-if="item.event" class="event-name">{{ item.event }}</span>
        <span class="state-text">{{ isFuture(item) ? "还有" : "已经" }}</span>
        <span class="day-number">
          <LiveDate :mode="getMode(item)" :date="item.date" :yearly="item.yearly" :include-start="item.includeStart" />
        </span>
        <span class="state-text">天</span>
      </p>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.timing-card {
  display: flex;
  flex-direction: column;
  gap: 0.7rem;
}

.ten-year-card {
  background:
    radial-gradient(
      ellipse at 100% 0%,
      color-mix(in srgb, var(--main-color) 8%, transparent),
      transparent 42%
    ),
    var(--main-card-background);
  cursor: default;
}

.ten-year-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;

  h2 {
    margin: 0;
    border: 0;
    color: var(--main-font-color);
    font-size: 1.05rem;
    font-weight: 650;
    letter-spacing: -0.025em;
    line-height: 1.3;
  }

  strong {
    color: var(--main-color);
    font-size: 0.8rem;
    font-variant-numeric: tabular-nums;
  }
}

.ten-year-progress {
  height: 6px;
  overflow: hidden;
  border-radius: 999px;
  background: var(--main-color-bg);

  span {
    display: block;
    height: 100%;
    border-radius: inherit;
    background: linear-gradient(
      90deg,
      var(--main-color),
      color-mix(in srgb, var(--main-color) 55%, #52c7bd)
    );
    transition: width 0.6s ease;
  }
}

.ten-year-stats {
  display: grid;
  grid-template-columns: 1fr 1fr;
  margin-top: 0.15rem;
}

.ten-year-stat {
  display: flex;
  flex-direction: column;
  gap: 0.12rem;

  strong {
    color: var(--main-font-color);
    font-size: 1.25rem;
    font-weight: 650;
    font-variant-numeric: tabular-nums;
    letter-spacing: -0.04em;
    line-height: 1.2;
  }

  span {
    color: var(--main-font-second-color);
    font-size: 0.7rem;
  }

  &.remaining {
    padding-left: 0.8rem;
    border-left: 1px solid var(--main-card-border);

    strong {
      color: var(--main-color);
    }
  }
}

.timing-item {
  width: 100%;
}

.timing-item + .timing-item {
  padding-top: 0.7rem;
  border-top: 1px solid var(--main-card-border);
}

.item-icon {
  font-size: 1rem;
  line-height: 1;
  margin-right: 0.45rem;
}

.title-name {
  font-weight: bold;
  font-size: 1rem;
  margin-right: 0.35rem;
}

.event-name {
  font-size: 1.2rem;
  font-weight: 800;
  color: var(--main-color);
  margin-right: 0.35rem;
}

.custom-text {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
  font-size: 1rem;
  color: var(--main-font-color);
  text-align: center;
  line-height: 1.5;
  margin: 0;
}

.state-text {
  opacity: 0.85;
}

.day-number {
  font-size: 1.2em;
  font-weight: 800;
  color: var(--main-color);
  margin: 0 0.25rem;
}
</style>
