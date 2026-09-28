import { getAllPosts } from "../.vitepress/theme/utils/getPostData.mjs";
import { getThemeConfig } from "../.vitepress/init.mjs";

const postData = await getAllPosts();
const themeConfig = await getThemeConfig();

// 每页文章数
// 钳制到 >= 1：postSize 为 0 时 Math.ceil(len/0) = Infinity，下面的 for 会
// 变成死循环（构建无声挂死）；为 undefined/NaN 时 totalPages = NaN，
// 循环一次都不跑 → 分页路由全部消失而客户端分页仍会渲染。两种都属误配，
// 这里统一兜底为 1（等价于"每页一篇"，至少不会挂死或静默丢路由）。
const postsPerPage = Math.max(1, Number(themeConfig.postSize) || 1);

// 计算总页数
const totalPages = Math.ceil(postData.length / postsPerPage);

// 文章分页动态路由
export default {
  paths() {
    const pages = [];
    // 生成每一页的路由参数
    for (let pageNum = 2; pageNum <= totalPages; pageNum += 1) {
      pages.push({ params: { num: pageNum.toString() } });
    }
    console.info("文章分页动态路由：", pages);
    return pages;
  },
};
