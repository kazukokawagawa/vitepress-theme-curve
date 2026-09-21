import dayjs from "dayjs";

/**
 * 获取时间剩余的函数
 *
 * 四行的「还剩」统一按**天**显示，单位不再混用（原先当日行用 hour、其余用 day）。
 *
 * 百分比粒度按单位区分：
 * - `day` 行用**分钟**（当天已过分钟 / 全天 1440），所以百分比在一天内连续变化，
 *   `Countdown.vue` 的 60s 刷新对它真正生效；
 * - `week` / `month` / `year` 行用**天**，本来就是各自单位的自然粒度。
 *
 * @param {import("dayjs").Dayjs} [current] 当前时间，默认取本地浏览器当前时间
 * @return {Object} 包含day、week、month和year的剩余时间信息
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

  /**
   * 按「天」计算剩余的份额（用于 week / month / year）
   * @param {String} unit 时间单位，可以是 'week', 'month', 'year'
   */
  const getDifferenceByDay = (unit) => {
    // 获取当前时间单位的开始时间
    const start = now.startOf(unit);
    // 获取当前时间单位的结束时间
    const end = now.endOf(unit);

    // 先 startOf('day') 再 diff，保证得到的是日历天差而不是 24 小时制差，
    // 也不会被 dayjs 对 week/month/year 的 day 粒度取整影响。
    // `+1` 表示把当天本身也算作一天，因此「总天数 - 已过天数」是
    // 「含当天在内还剩几天」，与「今日 还剩 1 天」的语义一致。
    const total = end.startOf("day").diff(start.startOf("day"), "day") + 1;
    // 已过去的完整天数：当天从 0 起算，跨天时才 +1
    const passed = now.startOf("day").diff(start.startOf("day"), "day");

    return {
      name: dayText[unit],
      total: total,
      passed: passed,
      remaining: total - passed,
      percentage: ((passed / total) * 100).toFixed(2),
    };
  };

  /**
   * 当日行：百分比按分钟推进，`remaining` 仍按「天」返回，
   * 保证不足一天时显示「还剩 1 天」而不是 0 或小数。
   */
  const getDayDifference = () => {
    const dayStart = now.startOf("day");
    const minutesPassed = now.diff(dayStart, "minute");
    // 当天从第 1 分钟起算，剩余量不足一天时也至少是 1 天
    const remainingInMinutes = dayStart.add(1, "day").diff(now, "minute");
    return {
      name: dayText.day,
      total: MINUTES_PER_DAY,
      passed: minutesPassed,
      remaining: Math.max(1, Math.ceil(remainingInMinutes / MINUTES_PER_DAY)),
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
