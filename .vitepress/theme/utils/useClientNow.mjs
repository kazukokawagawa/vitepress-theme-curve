import dayjs from "dayjs";
import { onBeforeUnmount, onMounted, ref } from "vue";

/**
 * 提供一个“仅客户端生效”的当前时间源。
 *
 * 用于所有会随当前日期/时间变化的展示（如：已过多少天、还剩多少天、
 * 多少天前等）。SSR 阶段不会取真实当前时间，避免把构建时刻的时间
 * 固化进静态 HTML / 缓存中；客户端挂载后由浏览器本地时钟驱动刷新。
 *
 * @param {Object} options
 * @param {number} options.interval 刷新间隔（毫秒），默认 1000
 * @returns {{ now: import("vue").Ref<import("dayjs").Dayjs | null>, isMounted: import("vue").Ref<boolean> }}
 *   now 在 SSR 阶段为 null，挂载后为浏览器当前时间
 */
export const useClientNow = ({ interval = 1000 } = {}) => {
  const now = ref(null);
  const isMounted = ref(false);
  let timer = null;

  const updateNow = () => {
    now.value = dayjs();
  };

  onMounted(() => {
    isMounted.value = true;
    updateNow();
    timer = setInterval(updateNow, interval);
  });

  onBeforeUnmount(() => {
    clearInterval(timer);
    timer = null;
  });

  return { now, isMounted };
};

/**
 * 计算时间戳对应的相对日期文案（仅在浏览器端基于当前时间计算）。
 * 与 helper.mjs 中 formatTimestamp 的规则保持一致：
 * - 今天：今日内
 * - 昨天：1天前
 * - 7 天内：n天前
 * - 更早：月/日（当年）或 年/月/日（更早）
 *
 * @param {number|string|Date} timestamp 目标时间
 * @param {import("dayjs").Dayjs | null} now 当前时间（来自 useClientNow），为 null 时返回 ""
 * @returns {string}
 */
export const formatTimestampAt = (timestamp, now) => {
  if (!now) return "";
  const targetDate = dayjs(timestamp);
  if (!targetDate.isValid()) return "";
  const today = now.startOf("day");
  const targetDay = targetDate.startOf("day");
  const difference = today.diff(targetDay, "day");
  if (difference <= 0) return "今日内";
  if (difference < 7) return `${difference}天前`;
  if (targetDate.year() === now.year()) {
    return `${targetDate.month() + 1}/${targetDate.date()}`;
  }
  return `${targetDate.year()}/${targetDate.month() + 1}/${targetDate.date()}`;
};

/**
 * 计算给定日期距离当前日期已过多少天（日历天）。
 *
 * @param {number|string|Date} timestamp 目标时间
 * @param {import("dayjs").Dayjs | null} now 当前时间（来自 useClientNow），为 null 时返回 null
 * @returns {number|null}
 */
export const daysPassedAt = (timestamp, now) => {
  if (!now) return null;
  const target = dayjs(timestamp);
  if (!target.isValid()) return null;
  return now.startOf("day").diff(target.startOf("day"), "day");
};
