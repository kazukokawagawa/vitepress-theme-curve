import dayjs from "dayjs";

/**
 * 从站点建站日期计算十年之约的起止日期与进度。
 * `current` 为 null 时仅返回日期，进度数据留空以避免 SSR 固化当前时间。
 * @param {string} since YYYY-MM-DD 建站日期
 * @param {import("dayjs").Dayjs | null} current 当前时间
 * @returns {object | null}
 */
export const getTenYearInfo = (since, current = null) => {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(since || ""));
  if (!match) return null;

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const start = dayjs(new Date(year, month - 1, day)).startOf("day");
  if (start.year() !== year || start.month() !== month - 1 || start.date() !== day) return null;

  const deadline = start.add(10, "year");
  const info = {
    startText: start.format("YYYY.MM.DD"),
    deadlineText: deadline.format("YYYY.MM.DD"),
    elapsedDays: null,
    remainingDays: null,
    progress: null,
    complete: false,
  };
  if (!current) return info;

  const today = current.startOf("day");
  const totalDays = deadline.diff(start, "day");
  const elapsedDays = Math.min(Math.max(today.diff(start, "day"), 0), totalDays);
  const remainingDays = Math.max(deadline.diff(today, "day"), 0);

  return {
    ...info,
    elapsedDays,
    remainingDays,
    progress: totalDays > 0 ? Math.round((elapsedDays / totalDays) * 1000) / 10 : 100,
    complete: !today.isBefore(deadline),
  };
};

export default getTenYearInfo;
