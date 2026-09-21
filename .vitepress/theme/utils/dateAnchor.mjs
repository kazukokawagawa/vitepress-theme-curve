/**
 * 日期口径工具（**零 Node 依赖**，可安全被客户端组件引用）
 *
 * ⚠️ 为什么单独一个文件：
 * `toLocalDayTimestamp` 同时被**构建端**（`getPostData.mjs`）和**客户端**
 * （`views/Post.vue` 的 frontmatter 兜底路径）使用。
 * 如果客户端直接从 `getPostData.mjs` 引入，会把该文件顶部的
 * `globby` / `gray-matter` / `fs-extra` 一并拖进浏览器构建产物 ——
 * 其中 `globby@14` 依赖 `@sindresorhus/merge-streams`，而后者 `import "node:stream"`，
 * 在客户端构建里会被外部化成 `__vite-browser-external`，直接**打断构建**：
 *   `"PassThrough" is not exported by "__vite-browser-external"`
 * 所以把这个纯函数放在独立文件里，两端都从这里引。
 */

/**
 * 把 frontmatter 的日期解析为**本地零点**的时间戳。
 *
 * 背景：未加引号的 YAML 日期（`date: 2025-07-01`）会被 js-yaml 解析成
 * `2025-07-01T00:00:00.000Z`（**UTC 零点**）的 Date 对象。而显示端
 * （`Post.vue` / `PostList.vue` / `helper.mjs` / `getAllArchives`）一律用
 * `getFullYear()/getMonth()/getDate()` 这类**本地**取值。两端锚点不一致，
 * 结果是 UTC 负时区（如 America/New_York）的访客看到的每篇日期都早一天，
 * 归档也会落到错误的年份。
 *
 * 修法：统一按**本地零点**存储/比较。返回的仍是 number（epoch 毫秒）。
 *
 * @param {Date|string|number} value frontmatter 的 date 值
 * @returns {number} 本地零点时间戳，无法解析时返回 NaN
 */
export const toLocalDayTimestamp = (value) => {
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) return NaN;
  // 用 UTC 字段取值：未加引号的 YAML 日期被解析成 UTC 零点，其 UTC 日历日
  // 恰好等于作者书写的那一天；带引号的字符串（如 "2025-07-01"）同样按 UTC 解析，
  // 也成立。这样无论构建机处于哪个时区，取到的"那一个月日"都不变，
  // 再由 new Date(y, m, d) 锚定到**构建机本地零点**。
  return new Date(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()).getTime();
};

export default toLocalDayTimestamp;
