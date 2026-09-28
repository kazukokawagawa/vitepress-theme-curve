import { generateId } from "./commonTools.mjs";
import { globby } from "globby";
import matter from "gray-matter";
import fs from "fs-extra";
import { toLocalDayTimestamp } from "./dateAnchor.mjs";
import { normalizeList } from "./normalizeList.mjs";

// 重新导出，保持既有引用（如 `.dsh_baseline` 探针、外部脚本）不失效。
// 实现位于零依赖的 dateAnchor.mjs —— 客户端组件必须从那里引入，
// 否则会把本文件的 globby/fs-extra 拖进浏览器构建。
export { toLocalDayTimestamp };

/**
 * 获取 posts 目录下所有 Markdown 文件的路径
 * @returns {Promise<string[]>} - 文件路径数组
 */
const getPostMDFilePaths = async () => {
  try {
    // 获取所有 md 文件路径
    let paths = await globby(["**.md"], {
      ignore: ["node_modules", "pages", ".vitepress", "README.md"],
    });
    // 过滤路径，只包括 'posts' 目录下的文件
    return paths.filter((item) => item.includes("posts/"));
  } catch (error) {
    console.error("获取文章路径时出错:", error);
    throw error;
  }
};

/**
 * 基于 frontMatter 日期降序排序文章
 * @param {Object} obj1 - 第一篇文章对象
 * @param {Object} obj2 - 第二篇文章对象
 * @returns {number} - 比较结果
 */
const compareDate = (obj1, obj2) => {
  return obj1.date < obj2.date ? 1 : -1;
};
const getTopValue = (top) => {
  if (typeof top === "number") {
    return top;
  }
  if (top === true) {
    return 1;
  }
  if (typeof top === "string") {
    const parsed = Number(top);
    if (!isNaN(parsed)) {
      return parsed;
    }
  }
  return 0;
};

const comparePostPriority = (a, b) => {
  const topA = getTopValue(a.top);
  const topB = getTopValue(b.top);
  if (topA !== topB) {
    return topB - topA;
  }
  return compareDate(a, b);
};

/**
 * 获取所有文章，读取其内容并解析 front matter
 * @returns {Promise<Object[]>} - 文章对象数组
 */
export const getAllPosts = async () => {
  try {
    // 获取所有 Markdown 文件的路径
    let paths = await getPostMDFilePaths();
    // 读取和处理每个 Markdown 文件的内容
    let posts = await Promise.all(
      paths.map(async (item) => {
        try {
          // 读取文件内容
          const content = await fs.readFile(item, "utf-8");
          // 文件的元数据
          const stat = await fs.stat(item);
          // 获取文件创建时间和最后修改时间
          const { birthtimeMs, mtimeMs } = stat;
          // 解析 front matter
          const { data } = matter(content);
          const { title, date, categories, description, tags, top, cover } = data;
          // tags / categories 在 frontmatter 里可能是数组，也可能是「裸写」字符串
          // （README「写文章」承诺两种写法都支持）。这里统一归一化成数组：
          //   - 字符串若原样透传，模板里的 v-for 会**逐字符**渲染出 404 链接；
          //   - 同时 trim，避免构建期标签路由键与页面链接不一致。
          // 未设置时保持 undefined（而不是空数组），以免模板里 `v-if="item?.tags"`
          // 由「隐藏」变成「渲染空容器」。
          const toListOrUndefined = (value) =>
            value === undefined || value === null || value === "" ? undefined : normalizeList(value);
          // 返回文章对象
          return {
            id: generateId(item),
            title: title || "未命名文章",
            date: date ? toLocalDayTimestamp(date) : birthtimeMs,
            lastModified: mtimeMs,
            tags: toListOrUndefined(tags),
            categories: toListOrUndefined(categories),
            description,
            regularPath: `/${item.replace(".md", ".html")}`,
            top,
            cover,
          };
        } catch (error) {
          console.error(`处理文章文件 '${item}' 时出错:`, error);
          throw error;
        }
      }),
    );
    // 根据日期排序文章
    posts.sort(comparePostPriority);
    return posts;
  } catch (error) {
    console.error("获取所有文章时出错:", error);
    throw error;
  }
};

/**
 * 获取所有标签及其相关文章的统计信息
 * @param {Object[]} postData - 包含文章信息的数组
 * @returns {Object} - 包含标签统计信息的对象
 */
export const getAllType = (postData) => {
  const tagData = {};
  // 遍历数据
  postData.map((item) => {
    // 用共用的归一化实现（并**不再就地改写** item.tags）：
    // 原先的 `item.tags.split(",")` 不 trim，会让标签路由键变成 " 教程"（URL 里出现 %20），
    // 与页面上的链接不一致；就地变异也会污染同一数组的其它使用者。
    normalizeList(item.tags).forEach((tag) => {
      // 初始化标签的统计信息，如果不存在
      if (!tagData[tag]) {
        tagData[tag] = {
          count: 1,
          articles: [item],
        };
      } else {
        // 如果标签已存在，则增加计数和记录所属文章
        tagData[tag].count++;
        tagData[tag].articles.push(item);
      }
    });
  });
  return tagData;
};

/**
 * 获取所有分类及其相关文章的统计信息
 * @param {Object[]} postData - 包含文章信息的数组
 * @returns {Object} - 包含标签统计信息的对象
 */
export const getAllCategories = (postData) => {
  const catData = {};
  // 遍历数据
  postData.map((item) => {
    // 与 getAllType 同一口径，见上方说明
    normalizeList(item.categories).forEach((tag) => {
      // 初始化标签的统计信息，如果不存在
      if (!catData[tag]) {
        catData[tag] = {
          count: 1,
          articles: [item],
        };
      } else {
        // 如果标签已存在，则增加计数和记录所属文章
        catData[tag].count++;
        catData[tag].articles.push(item);
      }
    });
  });
  return catData;
};
