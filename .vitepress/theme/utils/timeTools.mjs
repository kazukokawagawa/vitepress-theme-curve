import dayjs from "dayjs";

/**
 * 获取今日、本周、本月、本年的剩余时间。
 * 剩余时间不足一天时按小时显示，否则按自然日显示。
 *
 * 百分比粒度按单位区分：
 * - 今日按分钟推进；
 * - 本周 / 本月 / 本年按已过日历天计算。
 *
 * @param {import("dayjs").Dayjs} [current] 当前时间，默认取本地浏览器当前时间
 * @return {Object} 包含 day、week、month 和 year 的剩余时间信息
 */
export const getTimeRemaining = (current) => {
  const now = current || dayjs();
  const dayText = {
    day: "今日",
    week: "本周",
    month: "本月",
    year: "本年",
  };
  const MINUTES_PER_DAY = 24 * 60;
  const MILLISECONDS_PER_DAY = 24 * 60 * 60 * 1000;
  const MILLISECONDS_PER_HOUR = 60 * 60 * 1000;

  const getRemaining = (boundary, remainingDays) => {
    const remainingMs = Math.max(0, boundary.diff(now));
    if (remainingMs < MILLISECONDS_PER_DAY) {
      return {
        remaining: remainingMs === 0 ? 0 : Math.max(1, Math.floor(remainingMs / MILLISECONDS_PER_HOUR)),
        remainingUnit: "小时",
      };
    }
    return { remaining: remainingDays, remainingUnit: "天" };
  };

  /** 按自然日计算周 / 月 / 年的进度与剩余天数。 */
  const getDifferenceByDay = (unit) => {
    const start = now.startOf(unit);
    const nextStart = start.add(1, unit);
    const total = nextStart.startOf("day").diff(start.startOf("day"), "day");
    const passed = now.startOf("day").diff(start.startOf("day"), "day");

    return {
      name: dayText[unit],
      total,
      passed,
      ...getRemaining(nextStart, total - passed),
      percentage: ((passed / total) * 100).toFixed(2),
    };
  };

  const getDayDifference = () => {
    const dayStart = now.startOf("day");
    const minutesPassed = now.diff(dayStart, "minute");
    const nextStart = dayStart.add(1, "day");

    return {
      name: dayText.day,
      total: MINUTES_PER_DAY,
      passed: minutesPassed,
      ...getRemaining(nextStart, 1),
      percentage: ((minutesPassed / MINUTES_PER_DAY) * 100).toFixed(2),
    };
  };

  return {
    day: getDayDifference(),
    week: getDifferenceByDay("week"),
    month: getDifferenceByDay("month"),
    year: getDifferenceByDay("year"),
  };
};

export default getTimeRemaining;
