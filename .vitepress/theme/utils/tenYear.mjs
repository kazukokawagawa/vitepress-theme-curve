import dayjs from "dayjs";

const MILLISECONDS_PER_DAY = 24 * 60 * 60 * 1000;
const MILLISECONDS_PER_MINUTE = 60 * 1000;

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
    remainingText: "—",
    remainingLabel: "剩余时间",
    progress: null,
    complete: false,
  };
  if (!current) return info;

  const today = current.startOf("day");
  const totalDays = deadline.diff(start, "day");
  const totalMilliseconds = deadline.diff(start);
  const elapsedDays = Math.min(Math.max(today.diff(start, "day"), 0), totalDays);
  const remainingMilliseconds = Math.max(deadline.diff(current), 0);
  const remainingDays = Math.max(deadline.diff(today, "day"), 0);
  const complete = !current.isBefore(deadline);
  const remainingMinutes = Math.floor(remainingMilliseconds / MILLISECONDS_PER_MINUTE);
  const remainingHours = Math.floor(remainingMinutes / 60);
  const remainingMinutesWithinHour = remainingMinutes % 60;
  const lessThanDay = !complete && remainingMilliseconds < MILLISECONDS_PER_DAY;
  const elapsedMilliseconds = Math.min(Math.max(current.diff(start), 0), totalMilliseconds);

  return {
    ...info,
    elapsedDays,
    remainingDays,
    remainingText: complete
      ? "完成"
      : lessThanDay
        ? `${remainingHours}小时${remainingMinutesWithinHour}分钟`
        : `${remainingDays}天`,
    remainingLabel: complete ? "十年之约" : lessThanDay ? "剩余时间" : "距离约定",
    progress: complete
      ? 100
      : totalMilliseconds > 0
        ? Math.min(Math.round((elapsedMilliseconds / totalMilliseconds) * 1000) / 10, 99.9)
        : 100,
    complete,
  };
};

export default getTenYearInfo;
