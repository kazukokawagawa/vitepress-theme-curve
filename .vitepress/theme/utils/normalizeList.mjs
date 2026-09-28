/**
 * 列表字段归一化工具（**零 Node/Vue 依赖**，可安全被客户端组件引用）
 *
 * 背景：frontmatter 的 `tags` / `categories` 在 README「写文章」里承诺支持
 * 两种写法 —— `[A, B]` 数组与「裸写」字符串（`tags: 杂记`）。构建期
 * `getPostData.mjs` 与客户端 `usePostData.mjs` 都必须按同一套规则处理，
 * 否则会出现两类缺陷：
 *   1. 字符串被直接交给 `v-for` 时，Vue 会**逐字符**迭代 → 渲染出
 *      `/pages/tags/杂`、`/pages/tags/记` 这种不存在的链接（404）；
 *   2. 构建期用 `split(",")` 不 trim、客户端 trim → 标签路由键变成
 *      `" 教程"`（URL 里出现 %20），与页面上的链接对不上。
 *
 * 所以这里做**唯一实现**：数组原样返回；字符串按逗号切分并 trim；
 * 其余一律返回空数组。构建期与客户端都从这里引入，避免再次分叉。
 *
 * @param {unknown} value frontmatter 或 postData 里的 tags/categories
 * @returns {string[]} 归一化后的标签/分类数组（永不为 null）
 */
export const normalizeList = (value) => {
  if (!value) return [];
  if (Array.isArray(value)) {
    return value.map((item) => String(item).trim()).filter(Boolean);
  }
  if (typeof value === "string") {
    return value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }
  return [];
};

export default normalizeList;
