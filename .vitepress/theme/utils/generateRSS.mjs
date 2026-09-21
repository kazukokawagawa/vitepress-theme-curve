import { createContentLoader } from "vitepress";
import { writeFileSync } from "fs";
import { Feed } from "feed";
import path from "path";

/**
 * 生成 RSS
 * @param {*} config VitePress buildEnd
 * @param {*} themeConfig 主题配置
 */
export const createRssFile = async (config, themeConfig) => {
  // 配置信息
  const siteMeta = themeConfig.siteMeta;
  const hostLink = siteMeta.site;
  // Feed 实例
  const feed = new Feed({
    title: siteMeta.title,
    description: siteMeta.description,
    id: hostLink,
    link: hostLink,
    language: "zh",
    generator: siteMeta.author.name,
    favicon: siteMeta.author.cover,
    copyright: `Copyright © 2020-present ${siteMeta.author.name}`,
    updated: new Date(),
  });
  // 加载文章
  let posts = await createContentLoader("posts/**/*.md", {
    render: true,
  }).load();
  // 日期降序排序
  // frontmatter 的 date 可能缺失或非法，`new Date(undefined)` 会得到 NaN，
  // 而 NaN 参与比较会让 Array#sort 的结果不可预测（可能把有日期的文章挤下去）。
  // 这里显式把无法解析的日期排到最后，并用 -Infinity 兜底，保证排序稳定。
  const dateValue = (frontmatter) => {
    const parsed = new Date(frontmatter?.date ?? NaN).getTime();
    return Number.isNaN(parsed) ? -Infinity : parsed;
  };
  posts = posts.sort((a, b) => dateValue(b.frontmatter) - dateValue(a.frontmatter));
  for (const { url, frontmatter } of posts) {
    // 仅保留最近 10 篇文章
    if (feed.items.length >= 10) break;
    // 文章信息
    let { title, description, date } = frontmatter;
    // 处理日期：字符串转 Date；缺失/非法时回退到当前时间，
    // 避免把 Invalid Date 写进 feed（feed 包会输出 "Invalid Date" 字面量）。
    if (typeof date === "string") date = new Date(date);
    if (!(date instanceof Date) || Number.isNaN(date.getTime())) {
      date = new Date();
    }
    // 添加文章
    feed.addItem({
      title,
      id: `${hostLink}${url}`,
      link: `${hostLink}${url}`,
      description,
      date,
      // updated,
      author: [
        {
          name: siteMeta.author.name,
          email: siteMeta.author.email,
          link: siteMeta.author.link,
        },
      ],
    });
  }
  // 写入文件
  writeFileSync(path.join(config.outDir, "rss.xml"), feed.rss2(), "utf-8");
};
