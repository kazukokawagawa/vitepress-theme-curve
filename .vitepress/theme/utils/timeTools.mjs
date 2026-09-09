import dayjs from "dayjs";

/**
 * 获取时间剩余的函数
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

  /**
   * 计算时间差的函数
   * @param {String} unit 时间单位，可以是 'day', 'week', 'month', 'year'
   */
  const getDifference = (unit) => {
    // 获取当前时间单位的开始时间
    const start = now.startOf(unit);
    // 获取当前时间单位的结束时间
    const end = now.endOf(unit);
    
    // isDay 變數用來判斷單位是否為 'day'
    const isDay = unit === "day";
    
    // 計算總的天數或小時數
    const total = end.diff(start, isDay ? "hour" : "day") + 1;
    
    // 計算已經過去的天數或小時數
    // [修正] 移除了原先針對星期日的錯誤判斷，讓 dayjs.diff() 自行處理，邏輯更簡潔且正確。
    const passed = now.diff(start, isDay ? "hour" : "day");
    
    const remaining = total - passed;
    const percentage = (passed / total) * 100;
    
    // 返回数据
    return {
      name: dayText[unit],
      total: total,
      passed: passed,
      remaining: remaining,
      percentage: percentage.toFixed(2),
    };
  };

  return {
    day: getDifference("day"),
    week: getDifference("week"),
    month: getDifference("month"),
    year: getDifference("year"),
  };
};

/**
 * 计算当前日期距离指定日期的日历天数
 * @param {string} dateStr - 指定的日期，格式为 'YYYY-MM-DD'
 * @return {number} 返回剩余的天数
 */
export const getDaysUntil = (dateStr) => {
  const now = dayjs();
  const targetDate = dayjs(dateStr);
  
  // [修正] 將兩個日期的時間都設為一天的開始 (00:00:00) 再進行比較。
  // 這樣可以確保計算的是日曆天數的差異，而不是 24 小時制的差異，結果更符合使用者預期。
  // 例如，無論今天幾點，計算到明天的天數都會是 1。
  const daysUntil = targetDate.startOf('day').diff(now.startOf('day'), "day");
  
  return daysUntil;
};