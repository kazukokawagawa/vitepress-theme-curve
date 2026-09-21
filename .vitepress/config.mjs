import { defineConfig } from "vitepress";
import { createRssFile } from "./theme/utils/generateRSS.mjs";
import { withPwa } from "@vite-pwa/vitepress";
import { getAllPosts } from "./theme/utils/getPostData.mjs";
import { jumpRedirect } from "./theme/utils/commonTools.mjs";
import { getThemeConfig } from "./init.mjs";
import markdownConfig from "./theme/utils/markdownConfig.mjs";
import AutoImport from "unplugin-auto-import/vite";
import Components from "unplugin-vue-components/vite";
import path from "path";
import fs from "fs-extra";

// 获取全局数据
const postData = await getAllPosts();
await fs.outputJson("public/data/postData.json", postData);

// 获取主题配置
const themeConfig = await getThemeConfig();

// 固定跳转页（meta refresh → 首页）的 URL 集合，用于从 sitemap 中剔除。
// 这些都是 page.md / page/index.md / page/1.md / pages/index.md 生成的跳转壳；
// /page/2..N 是 page/[num].paths.mjs 生成的真实分页内容页，**不在此列**。
//
// 注意：VitePress 的 `transformItems` 传进来的 `item.url` 是**完整 URL**
// （如 "https://chiyu.it/page"），而 sitemap.xml 里的 <loc> 也是完整 URL。
// 因此归一化必须**先剥掉 origin**，只比较路径，否则路径与完整 URL 永不相等。
const normalizeSitemapUrl = (url) => {
  let pathname = String(url || "");
  // 优先用 URL API 取 pathname；非绝对 URL（纯路径）时回退为字符串处理
  try {
    pathname = new URL(pathname).pathname;
  } catch {
    pathname = pathname.replace(/^https?:\/\/[^/]+/i, "");
  }
  const trimmed = pathname.replace(/\/+$/, "");
  return trimmed === "" ? "/" : trimmed;
};
const REDIRECT_PAGE_URLS = new Set(
  ["/page", "/page/1", "/pages"].map(normalizeSitemapUrl),
);

// 确定性兜底：从产物 sitemap.xml 中按 <loc> 路径剔除跳转壳。
// 幂等——若 URL 已不存在则原样返回。防 VitePress 版本行为变化。
const removeRedirectPagesFromSitemap = (outDir) => {
  const sitemapPath = path.join(outDir, "sitemap.xml");
  if (!fs.existsSync(sitemapPath)) return;
  const source = fs.readFileSync(sitemapPath, "utf-8");
  const removed = [];
  const filtered = source.replace(/<url>[\s\S]*?<\/url>/g, (block) => {
    const loc = block.match(/<loc>(.*?)<\/loc>/);
    if (!loc) return block;
    if (!REDIRECT_PAGE_URLS.has(normalizeSitemapUrl(loc[1]))) return block;
    removed.push(loc[1]);
    return "";
  });
  if (removed.length === 0) return;
  fs.writeFileSync(sitemapPath, filtered, "utf-8");
  console.log(`[sitemap] 已从 sitemap 剔除 ${removed.length} 个跳转页: ${removed.join(", ")}`);
};

// https://vitepress.dev/reference/site-config
export default withPwa(
  defineConfig({
    title: themeConfig.siteMeta.title,
    description: themeConfig.siteMeta.description,
    lang: themeConfig.siteMeta.lang,
    // 简洁的 URL
    cleanUrls: true,
    base: '/',
    // 最后更新时间戳
    lastUpdated: true,
    // 主题
    appearance: "dark",
    // Head
    head: [
      ...themeConfig.inject.header,
      [
        "noscript",
        {},
        `<style>
          .loading {
            display: none !important;
          }
          .mian-layout {
            display: block !important;
          }
        </style>`,
      ],
    ],
    // sitemap
    sitemap: {
      hostname: themeConfig.siteMeta.site,
      // 跳转壳不进 sitemap：收录它们只会让搜索引擎看到重复/无效入口。
      transformItems: (items) =>
        items.filter((item) => !REDIRECT_PAGE_URLS.has(normalizeSitemapUrl(item.url))),
    },
    // 主题配置
    themeConfig: {
      ...themeConfig,
      postCount: postData.length,
    },
    // markdown
    markdown: {
      math: true,
      lineNumbers: true,
      toc: { level: [1, 2, 3] },
      image: {
        lazyLoading: true,
      },
      config: (md) => markdownConfig(md, themeConfig),
    },
    // 构建排除
    // 下划线前缀的 md 一律视为仓库内部文件（审计 / 分析等临时产物），
    // 绝不发布到站点：它们既会生成页面，也会被 sitemap 收录。
    srcExclude: ["**/README.md", "**/TODO.md", "_*.md", "**/_*.md"],
    // transformPageData
    transformPageData: async (pageData) => {
      // canonical URL
      const canonicalUrl = `${themeConfig.siteMeta.site}/${pageData.relativePath}`
        .replace(/index\.md$/, "")
        .replace(/\.md$/, "");
      // ⚠️ 这里不能简单 `head.push(...)`：
      // gray-matter 以「文件内容字符串」为键缓存解析结果，内容完全相同的多个 .md
      // 会**共享同一个 frontmatter 对象与 head 数组**（实测 `matter(same).data === matter(same).data`
      // 为 true；内容不同的则返回不同对象），push 会跨页累积，使单个页面带上
      // 多条指向**别的页面**的 canonical（实测 1→2→3→4 条）。
      // 触发过：page.md / page/index.md / page/1.md / pages/index.md（当时 4 个文件逐字节全同）。
      //
      // 修法：本页**只保留与"本页是否跳转壳"相关的原创 head 项**，其余一律丢弃后重建。
      // - 为什么是「只保留白名单」而不是「过滤掉 canonical」：
      //   共享数组里被前面页面 push 进去的，正是**别的页面**的 canonical，
      //   过滤法能挡住这一种，但挡不住未来新增的其它就地 push 字段。
      // - 为什么白名单只放 meta refresh：
      //   本仓库的 head 来源只有两处 —— 跳转壳 .md 的 `head:`（只有 meta refresh）
      //   与 config 顶部的 `head` 数组（全局注入，不经过 frontmatter）。
      //   因此白名单是**真实全量**的，不会误删任何原本要输出的项。
      //   （实证：修复后 4 个跳转页的 meta refresh 全部保留、每页 canonical 恰好 1 条。）
      //
      // 注意：这里不修改共享数组本身（改它会污染其它页面），只替换本页的引用。
      const existingHead = Array.isArray(pageData.frontmatter.head)
        ? pageData.frontmatter.head.filter(
            ([tag, attrs]) => tag === "meta" && attrs?.["http-equiv"] === "refresh",
          )
        : [];
      pageData.frontmatter.head = [
        ...existingHead,
        ["link", { rel: "canonical", href: canonicalUrl }],
      ];
    },
    // transformHtml
    transformHtml: (html) => {
      // VitePress 1.6.4 emits an empty vp-icons.css preload for custom themes.
      const withoutEmptyIconPreload = html.replace(
        /\s*<link rel="preload stylesheet" href="\/vp-icons\.css" as="style">/,
        "",
      );
      return jumpRedirect(withoutEmptyIconPreload, themeConfig);
    },
    // buildEnd
    buildEnd: async (config) => {
      await createRssFile(config, themeConfig);
      // 兜底：产物层再确定性地过滤一次跳转壳。
      // 主路径是上面的 sitemap.transformItems；此处用于防止 VitePress 版本行为变化
      // 导致剔除失效。幂等——已剔除时不做任何事。
      removeRedirectPagesFromSitemap(config.outDir);
    },
    // vite
    vite: {
      plugins: [
        AutoImport({
          imports: ["vue", "vitepress"],
          dts: ".vitepress/auto-imports.d.ts",
        }),
        Components({
          dirs: [".vitepress/theme/components", ".vitepress/theme/views"],
          extensions: ["vue", "md"],
          include: [/\.vue$/, /\.vue\?vue/, /\.md$/],
          dts: ".vitepress/components.d.ts",
        }),
      ],
      resolve: {
        // 配置路径别名
        alias: {
          // eslint-disable-next-line no-undef
          "@": path.resolve(__dirname, "./theme"),
        },
      },
      css: {
        preprocessorOptions: {
          scss: {
            silenceDeprecations: ["legacy-js-api"],
          },
        },
      },
      // 服务器
      server: {
        port: 9877,
      },
      // 构建
      build: {
        minify: "terser",
        terserOptions: {
          compress: {
            pure_funcs: ["console.log"],
          },
        },
      },
    },
    // PWA
    pwa: {
      registerType: "autoUpdate",
      
      workbox: {
        clientsClaim: true,
        skipWaiting: true,
        cleanupOutdatedCaches: true,
        // 资源缓存
        runtimeCaching: [
          {
            urlPattern: /(.*?)\.(woff2|woff|ttf|css)/,
            handler: "CacheFirst",
            options: {
              cacheName: "file-cache",
            },
          },
          {
            urlPattern: /(.*?)\.(ico|webp|png|jpe?g|svg|gif|bmp|psd|tiff|tga|eps)/,
            handler: "CacheFirst",
            options: {
              cacheName: "image-cache",
            },
          },
          {
            urlPattern: /^https:\/\/cdn2\.codesign\.qq\.com\/.*/i,
            handler: "CacheFirst",
            options: {
              cacheName: "iconfont-cache",
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 2,
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
        ],
        // 缓存文件
        globPatterns: ["**/*.{js,css,html,ico,png,jpg,jpeg,gif,svg,woff2,ttf}"],
        globIgnores: ["**/vp-icons.css"],
        // 排除路径
        navigateFallbackDenylist: [/^\/sitemap.xml$/, /^\/rss.xml$/, /^\/robots.txt$/, /^\/redirect(?:\.html)?(?:\/|$)/],
      },
      manifest: {
        name: themeConfig.siteMeta.title,
        short_name: themeConfig.siteMeta.title,
        description: themeConfig.siteMeta.description,
        display: "standalone",
        start_url: "/",
        theme_color: "#fff",
        background_color: "#efefef",
        icons: [
          {
            src: "/images/logo/favicon-32x32.webp",
            sizes: "32x32",
            type: "image/webp",
          },
          {
            src: "/images/logo/favicon-96x96.webp",
            sizes: "96x96",
            type: "image/webp",
          },
          {
            src: "/images/logo/favicon-256x256.webp",
            sizes: "256x256",
            type: "image/webp",
          },
          {
            src: "/images/logo/favicon-512x512.webp",
            sizes: "512x512",
            type: "image/webp",
          },
        ],
      },
    },
  }),
);
