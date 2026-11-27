<template>
  <section v-if="siteStartDate" class="ten-year-card s-card">
    <div class="card-heading">
      <h2>十年之约</h2>
    </div>

    <div class="progress-heading">
      <span>十年进度</span>
      <strong>{{ stats ? `${stats.progress}%` : "—" }}</strong>
    </div>
    <div
      class="progress-track"
      role="progressbar"
      aria-label="十年之约进度"
      aria-valuemin="0"
      aria-valuemax="100"
      :aria-valuenow="stats?.progress ?? 0"
    >
      <span :style="{ width: `${stats?.progress ?? 0}%` }" />
    </div>

    <div class="stats">
      <div class="stat">
        <strong>{{ stats?.elapsedDays ?? "—" }}</strong>
        <span>已同行天数</span>
      </div>
      <div class="stat remaining">
        <strong>{{ stats ? (stats.complete ? "完成" : stats.remainingDays) : "—" }}</strong>
        <span>{{ stats?.complete ? "十年之约" : "剩余天数" }}</span>
      </div>
    </div>
  </section>
</template>

<script setup>
import dayjs from "dayjs";
import { useData } from "vitepress";
import { useClientNow } from "@/utils/useClientNow.mjs";

const { theme } = useData();
const { now } = useClientNow({ interval: 60 * 1000 });

const siteStartDate = computed(() => {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(theme.value.since || ""));
  if (!match) return null;

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = dayjs(new Date(year, month - 1, day));
  if (date.year() !== year || date.month() !== month - 1 || date.date() !== day) return null;
  return date.startOf("day");
});

const deadline = computed(() => siteStartDate.value?.add(10, "year") || null);

const stats = computed(() => {
  const start = siteStartDate.value;
  const end = deadline.value;
  const current = now.value;
  if (!start || !end || !current) return null;

  const totalDays = end.diff(start, "day");
  const today = current.startOf("day");
  const elapsedDays = Math.min(Math.max(today.diff(start, "day"), 0), totalDays);
  const remainingDays = Math.max(end.diff(today, "day"), 0);
  const progress = totalDays > 0 ? Math.round((elapsedDays / totalDays) * 1000) / 10 : 100;

  return {
    elapsedDays,
    remainingDays,
    progress,
    complete: !today.isBefore(end),
  };
});
</script>

<style lang="scss" scoped>
.ten-year-card {
  padding: 1rem;
  background:
    radial-gradient(
      ellipse at 100% 0%,
      color-mix(in srgb, var(--main-color) 8%, transparent),
      transparent 42%
    ),
    var(--main-card-background);
  cursor: default;

  .card-heading,
  .progress-heading {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  h2 {
    margin: 0 0 0.8rem;
    border: 0;
    color: var(--main-font-color);
    font-size: 1.05rem;
    font-weight: 650;
    letter-spacing: -0.025em;
    line-height: 1.3;
  }

  .progress-heading {
    margin-bottom: 0.4rem;
    color: var(--main-font-second-color);
    font-size: 0.75rem;

    strong {
      color: var(--main-color);
      font-size: 0.8rem;
      font-variant-numeric: tabular-nums;
    }
  }

  .progress-track {
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

  .stats {
    display: grid;
    grid-template-columns: 1fr 1fr;
    margin-top: 0.85rem;
  }

  .stat {
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
}
</style>
