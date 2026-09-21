<div align="center">

# VitePress Theme Curve

## 一个为个人博客而生的 VitePress 主题

<p align="center">
  <img src="https://github.com/imsyy/vitepress-theme-curve/assets/42232682/bed62689-cfd8-4d98-b946-24555d4ce1fb" alt="curve-logo" />
</p>

文章、归档、分类、标签、分页、评论、RSS、PWA、搜索、友链、音乐播放器、侧边栏挂件、Markdown 扩展语法，一应俱全。

[![VitePress](https://img.shields.io/badge/VitePress-1.6.4-646cff?logo=vite&logoColor=white)](https://vitepress.dev/zh/)
[![Vue](https://img.shields.io/badge/Vue-3.5-42b883?logo=vue.js&logoColor=white)](https://vuejs.org/)
[![Node](https://img.shields.io/badge/Node-%E2%89%A520-5fa04e?logo=node.js&logoColor=white)](https://nodejs.org/)
[![License](https://img.shields.io/badge/License-MIT-blue)](LICENSE)

[在线预览](https://chiyu.it) · [上游项目](https://github.com/imsyy/vitepress-theme-curve) · [问题反馈](https://github.com/imsyy/vitepress-theme-curve/issues)

</div>

---

> [!IMPORTANT]
> **本仓库是一个已投入使用的成品站点，而不是可一键套用的模板。**
> 它基于上游主题 [vitepress-theme-curve](https://github.com/imsyy/vitepress-theme-curve)（作者 [imsyy](https://imsyy.top)）深度改造，用于运行 [池鱼小栈](https://chiyu.it)：站点信息、域名、友链、备案号、评论后端、统计 ID、内容与大部分界面文案都属于该站，**不保证开箱即可用于你自己的博客**。若你只是想找一个通用主题，请优先使用上游项目。

## 目录

- [特性](#特性)
- [快速开始](#快速开始)
- [目录结构](#目录结构)
- [写文章](#写文章)
- [写页面](#写页面)
- [主题配置](#主题配置)
- [环境变量](#环境变量)
- [部署](#部署)
- [可用命令](#可用命令)
- [已知问题](#已知问题)
- [安全提示](#安全提示)
- [来源声明](#来源声明)
- [致谢与许可](#致谢与许可)

## 特性

| 能力 | 说明 |
| --- | --- |
| 文章体系 | 首页文章列表、分页、归档（按年）、分类、标签、相关文章、上下篇 |
| 内容增强 | 目录、文章摘要（`articleGPT`）、参考资料、打赏、版权声明、文章密码保护 |
| 评论 | Artalk / Twikoo 双后端，通过 `themeConfig.comment` 切换 |
| 搜索 | Algolia（`vue-instantsearch` + `instantsearch.js`），默认关闭 |
| 订阅与离线 | RSS（构建时生成，取最近 10 篇）、PWA（`@vite-pwa/vitepress`，可离线访问） |
| 站点状态 | 底部实时服务状态，配套 `/api/status` 由 Better Stack 提供数据 |
| 个性化 | 明暗主题、自定义背景、字体切换与懒加载、鼠标指针、全局置灰特殊日 |
| 侧边栏挂件 | 站点简介、目录、标签、生日倒计时、纪念日计时、站点数据、天气、GitHub 热榜 |
| 音乐播放器 | 基于 [Meting-API](https://github.com/imsyy/Meting-API)，含歌词与封面 |
| 扩展语法 | `timeline` / `radio` / `button` / `card` 容器、`ad-*` admonition、表格包裹、图片灯箱 |
| 工程化 | TypeScript 类型检查、ESLint、Prettier、sitemap、canonical、`cleanUrls` |

## 快速开始

环境要求：**Node.js ≥ 20**、**npm ≥ 10**（见 `package.json` 的 `engines`），建议使用 **pnpm**（CI 即使用 pnpm 9）。

```bash
# 安装依赖
pnpm install

# 本地开发（默认监听 http://localhost:9877，端口在 .vitepress/config.mjs 中配置）
pnpm dev

# 构建静态产物 → .vitepress/dist
pnpm build

# 本地预览构建产物
pnpm preview
```

> [!NOTE]
> 首次启动前请先准备 `.env`（见 [环境变量](#环境变量)）。缺少值的项会在运行时优雅降级，但相关挂件/状态会显示为不可用。
>
> 包管理器统一用 **pnpm**；仓库里同时躺着上游残留的 `package-lock.json`（只描述了一个旧版 vitepress），**不要**用它或 `npm install` 安装依赖。

## 目录结构

```text
vitepress-theme-curve/
├── .vitepress/
│   ├── config.mjs              # VitePress 站点配置（导航、sitemap、PWA、Markdown、构建钩子）
│   ├── init.mjs                # 读取根目录 themeConfig.mjs 并与默认配置深合并
│   ├── theme/                  # 主题本体（布局、组件、视图、样式、工具）
│   │   ├── App.vue             # 自定义 Layout
│   │   ├── index.mjs           # 主题入口（Pinia、路由守卫、全局样式）
│   │   ├── assets/
│   │   │   ├── themeConfig.mjs # 默认主题配置（站点信息、导航、页脚、开关……）
│   │   │   └── linkData.mjs    # 友链默认数据
│   │   ├── components/         # 导航、页脚、播放器、搜索、评论、挂件等组件
│   │   ├── views/              # Home / Post / Page / Archives / Link / CatOrTag……
│   │   ├── utils/              # 文章数据、RSS、Markdown 规则、时间与字体工具
│   │   └── api/index.js        # 一言、天气、Meting、站点统计等前端请求
│   └── dist/                   # 构建产物（已 gitignore）
├── posts/                      # 文章，目录层级即 URL 层级
├── pages/                      # 固定页面（关于、归档、分类、标签、友链、隐私……）
├── page/                       # 首页分页路由（/page/2 … /page/N）
├── public/                     # 静态资源，原样拷贝到产物根目录
├── api/status.ts               # Vercel Serverless：GET /api/status
├── functions/api/status.ts     # Cloudflare Pages Functions：GET /api/status
├── index.md                    # 首页（layout: home）
├── page.md                     # /page → 首页的跳转壳（另有 page/index.md、page/1.md、pages/index.md 同源）
└── vercel.json                 # Vercel 部署配置
```

## 写文章

在 `posts/` 下新建 `.md` 文件即可，**文件路径就是 URL 路径**：

```text
posts/2026/0307.md  →  /posts/2026/0307
```

Frontmatter 字段：

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | :---: | --- |
| `title` | string | ➖ | 文章标题，缺失时显示为「未命名文章」 |
| `date` | string | ➖ | 发布日期，建议 `YYYY-MM-DD`；构建时按**本地零点**锚定，避免访客时区造成日期偏移。缺失时回退到文件创建时间 |
| `description` | string | ➖ | 摘要，用于列表卡片与 RSS |
| `tags` | string \| string[] | ➖ | 标签，支持 `[A, B]` 或裸写 |
| `categories` | string \| string[] | ➖ | 分类，同一篇文章只展示首个分类 |
| `top` | number \| boolean | ➖ | 置顶权重，越大越靠前（`true` 等价于 `1`） |
| `cover` | string | ➖ | 封面图；需同时打开 `cover.showCover.enable`，否则不生效（建议所有文章都给出封面，避免列表排版异常） |
| `articleGPT` | string | ➖ | 文章摘要卡片内容 |
| `references` | `{title, url}[]` | ➖ | 参考资料列表 |
| `password` | string \| number | ➖ | 设置后文章需输入密码才能查看 |
| `comment` / `copyright` | boolean | ➖ | 单独关闭评论 / 版权声明 |

```markdown
---
title: 示例文章
date: 2026-03-07
description: 一句话概括这篇文章
tags: [开发]
categories: [开发教程]
---

正文……
```

文章数据在**构建时**扫描 `posts/**/*.md` 生成（仅取 `posts/` 目录，排序规则：先按 `top` 降序，再按 `date` 降序）。新增或修改文章后需要重新构建；开发模式下重启 `pnpm dev` 才能刷新文章索引。

## 写页面

在 `pages/` 下新建 `.md` 即生成对应路由（`pages/about.md` → `/pages/about`）。普通页面可以只写 Markdown，也可以挂载自定义视图：

```markdown
---
title: 关于本站
aside: false
---

<script setup>
import About from "@/views/About.vue"
</script>

<About />
```

常用 frontmatter：

| 字段 | 说明 |
| --- | --- |
| `layout` | 页面布局，`home` 会启用首页视图 |
| `aside` | 是否显示右侧边栏 |
| `padding` / `card` | 版面留白与卡片容器 |
| `comment` | 是否显示评论区 |

> [!TIP]
> `pages/index.md`、`page.md`、`page/index.md`、`page/1.md` 是**跳转壳**：它们通过 `meta refresh` 跳到首页，并已在构建时从 `sitemap.xml` 中剔除，避免被搜索引擎当作重复入口。

### 动态路由

分类与标签页由 `pages/categories/[name].paths.mjs`、`pages/tags/[name].paths.mjs` 在构建时按文章数据生成，**不需要手动建文件**。新增分类或标签后重新构建即可拿到新路由。

### 首页分页

`page/[num].paths.mjs` 依据 `themeConfig.postSize` 生成 `/page/2` … `/page/N`，`Home.vue` 负责渲染并对越界页码做钳制。

## 主题配置

默认配置位于 [`.vitepress/theme/assets/themeConfig.mjs`](.vitepress/theme/assets/themeConfig.mjs)，**不要修改它**。需要定制时，把该文件复制到**仓库根目录**并命名为 `themeConfig.mjs`：

```js
export default {
  themeConfig: {
    // 只需写需要覆盖的字段，其余自动继承默认值
    siteMeta: { title: "我的博客" },
  },
};
```

根目录的 `themeConfig.mjs` 会由 `.vitepress/init.mjs` 动态导入，并通过 `defu` **深合并**到默认配置之上；未覆盖的字段保留默认值，也不会污染默认对象。该文件已加入 `.gitignore`（默认配置用 `!` 反向排除），适合放置个人化配置。**但请注意**：一旦丢失，构建会静默回退到默认配置（只打印一条 `console.warn`），因此建议单独备份。

另外，当前根目录**并没有** `themeConfig.mjs`，也就是说这个仓库运行的正是默认配置。

主要配置分组：

| 分组 | 作用 |
| --- | --- |
| `siteMeta` | 标题、描述、Logo、站点地址、语言、作者信息 |
| `nav` / `navMore` | 顶部导航菜单、左上角「更多」面板 |
| `cover` | 列表双栏布局与封面图 |
| `footer` | 社交链接、页脚站点地图、底部徽标 |
| `comment` | 评论开关与 Artalk / Twikoo 参数 |
| `aside` | 侧边栏各挂件开关：简介、目录、标签、倒计时、计时、站点数据、天气、GitHub 热榜 |
| `friends` | 友链朋友圈与动态友链接口 |
| `music` | 音乐播放器（Meting-API 地址、歌单 ID、平台） |
| `search` | Algolia 搜索开关与 Key |
| `rewardData` / `fancybox` | 打赏二维码、图片灯箱 |
| `jumpRedirect` | 站外链接经 `/redirect.html` 中转（默认关闭） |
| `tongji` | 51.LA 等站点统计 |
| `inject.header` | 追加到 `<head>` 的标签（favicon、RSS、iconfont、Onion-Location 等） |

站点本身的 `since`、`icp`、`postSize`（每页文章数）等也在同一份配置中。

## 环境变量

在仓库根目录创建 `.env`（**该文件当前未被 gitignore 覆盖，见[安全提示](#安全提示)**），填入以下三个前端变量：

```dotenv
# 高德开放平台 Web 服务 Key，用于侧边栏天气挂件（缺失时天气挂件不可用）
VITE_WEATHER_KEY=

# GitHub 热榜侧边栏（HelloGithub）接口地址
VITE_HELLOGITHUB_API_URL=

# Better Stack 状态页地址；配置后底部状态徽标点击跳转该页，否则点击刷新
VITE_BETTER_STACK_STATUS_PAGE_URL=
```

此外，`BETTER_STACK_API_TOKEN`（Better Stack API Token）**只在服务端被读取**，用于 `/api/status`，请配置在部署平台的环境变量里而**不要**写进 `.env`。

> [!IMPORTANT]
> 这是一个**公开仓库**，请不要把任何真实密钥写进仓库内的 `.env`——它并未被 `.gitignore` 覆盖，见[安全提示](#安全提示)。

## 部署

构建产物默认输出到 `.vitepress/dist`。

**Vercel** —— 配置见 [`vercel.json`](vercel.json)，包含 `cleanUrls`、`outputDirectory` 以及 `/redirect` 内部重写；API 路由由 `api/status.ts` 提供。请在项目设置中配置 `BETTER_STACK_API_TOKEN`。

```bash
pnpm build
pnpm deploy:vercel
```

**Cloudflare Pages** —— 构建命令 `pnpm build`，输出目录 `.vitepress/dist`。仓库内的 `functions/api/status.ts` 按 Cloudflare Pages Functions 的目录约定组织（导出 `onRequestGet`、从 `context.env` 读 Token），上传至 Cloudflare 后会被识别为 `GET /api/status`；请在该平台的环境变量中配置 `BETTER_STACK_API_TOKEN`。（该路径未在本仓库的配置文件中声明，部署后需自行验证。）

**GitHub Pages** —— 工作流见 [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml)：推送 `master` 分支或手动触发，使用 pnpm 9 + Node 22 构建并发布 `.vitepress/dist`。注意 Pages 属于纯静态托管，**不提供 `/api/status`**，状态徽标会落到错误态。

**任意静态服务器** —— 把 `.vitepress/dist` 目录上传即可。因为开启了 `cleanUrls`，请确保服务器对无扩展名路径做回退到对应 `.html` 的重写。

## 可用命令

| 命令 | 说明 |
| --- | --- |
| `pnpm dev` | 启动开发服务器（`vitepress dev --host`） |
| `pnpm build` | 构建静态站点（产出 `sitemap.xml`、`rss.xml` 与 PWA 资源） |
| `pnpm preview` | 预览构建产物 |
| `pnpm lint` | ESLint 检查并自动修复（`.js/.jsx/.cjs/.mjs/.vue`，**不含点目录**） |
| `pnpm format` | Prettier 格式化当前目录（`.prettierignore` 已排除 `dist`、锁文件与生成的 `*.d.ts`） |
| `pnpm deploy:vercel` | 通过 Vercel CLI 部署 |
| `npx tsc --noEmit` | TypeScript 类型检查（**不覆盖 `.vue`**，见下） |

## 已知问题

这些问题在仓库中**真实存在**，在此如实记录，避免使用者踩坑：

- **质量链覆盖不全**：裸 `tsc` 不解析 `.vue` 单文件组件，实际参与类型检查的只有 2 个 `.ts` 与 2 个生成的 `.d.ts`，57 个 `.vue` 全部未被覆盖（完整覆盖需要 `vue-tsc`，本项目未安装也没有 `typecheck` 脚本）；同时 ESLint 8 **默认忽略点目录**，`.vitepress/` 下的 83 个文件一个都没被 lint（实测 `pnpm lint` 的检查集合只有 4 个根目录外的普通文件），`.ts` 也不在 `--ext` 列表中。因此 `lint`/`tsc` 绿灯不等于全量通过。
- **仓库没有测试套件**：`package.json` 中没有 test 脚本，也没有任何单测框架；`timeTools`、`getPostData`、分页数学等纯函数建议后续补齐单元测试。
- **密钥仍在版本控制中**：`.env` 至今仍被 Git 跟踪，其内容与 `HEAD` 完全一致，且 `.gitignore` **没有**忽略它（见下方[安全提示](#安全提示)）。
- **`.eslintignore` 残留**：其中仍列有已删除的临时目录（`_fix2`、`_fix3`、`.dsh_baseline`、`_fix_t1`、`_t4_*`）等历史条目。
- **跳转壳的重复内容**：`page.md`、`page/index.md`、`page/1.md`、`pages/index.md` 内容逐字节相同。`gray-matter` 以文件内容为键缓存解析结果，相同内容的文件会共享同一个 `frontmatter` 对象，历史上曾导致 canonical 标签跨页累积。构建配置现已在 `transformPageData` 中改为白名单重建（每条 canonical 都挂到本页自己的新数组上），但**共享 frontmatter 的根因仍在**，日后若在 `transformPageData` 里就地 `push` 新的 head 字段，同类问题会复现。
- **构建期会写入工作区**：加载 `.vitepress/config.mjs` 时会重新生成 `public/data/postData.json`（该文件已 gitignore），因此运行 `dev`/`build` 后 `git status` 可能出现该文件的变动。
- **`jumpRedirect` 未启用**：相关实现与 `/redirect.html` 已就位但默认关闭，站外链接中转能力需要自行验证后再开启。
- **`public/` 会被原样拷进产物**：`public/` 是**源目录**，其中的文件在构建时被逐份拷贝到 `.vitepress/dist` 根下（`postData.json` 就是这么进去的），因此不要在里面放需要手工维护的产物——下一次构建会用同名的源文件覆盖它。
- **`robots.txt` 是静态文件**：`public/robots.txt` 会被原样拷贝到产物根目录，**不是**构建期生成；修改收录规则请直接改该文件。
- **`themeConfig.mjs` 与「当前其实跑的是默认配置」**：根目录的覆盖文件已加入 `.gitignore`，不会被提交；如果丢失，构建会静默回退到 `.vitepress/theme/assets/themeConfig.mjs` 的默认值（仅打印一条 `console.warn`）。
- **`package-lock.json` 是上游残留**：它只描述了一个 `vitepress ^1.0.0-rc.40`，与当前 `package.json` 不同步，请以 `pnpm-lock.yaml` 为准。
- **第三方 CDN 依赖**：iconfont、Fancybox、Twikoo 等资源默认走公共 CDN，网络受限环境下相关样式或功能可能不可用。

## 安全提示

- **`.env` 仍在版本控制中**：该文件已被提交，内容与 `HEAD` 一致，且 `.gitignore` 未忽略它（`git ls-files .env` 可复现）。处理顺序应当是：**先吊销/轮换其中所有凭据**，再把它移出跟踪（`git rm --cached .env` 并补进 `.gitignore`），最后按需用 `git filter-repo` 重写历史——顺序颠倒会让旧密钥在历史中继续有效。
- 站点内含个人化配置与统计、评论等服务凭据，公开部署前请逐项检查 `themeConfig.mjs`、`.env` 与 `api/`、`functions/` 下的环境变量读取。
- 所有 `VITE_` 前缀的变量都会被**打包进前端产物**，对其调用方可见，只应放可公开的值；`BETTER_STACK_API_TOKEN` 只在服务端使用，切勿加 `VITE_` 前缀或写入前端代码。

## 来源声明

本项目的站点内容与主题改造基于**另一条独立的创作谱系**，其中包括对多位作者文章的**转载**（见 `posts/archives/`、`posts/2025/1229.md` 等，正文中标注了原作者），以及涉及个人经历、医疗与调查性质的原创写作。

- 站点文章版权归**各自作者**所有，不因收录在本仓库而改变。
- 若你是某篇文章的权利人并希望其被移除，请通过 [GitHub Issues](https://github.com/imsyy/vitepress-theme-curve/issues) 联系维护者。
- 代码部分以仓库根的 [MIT License](LICENSE) 授权，**该授权不适用于站点文章内容**。

## 致谢与许可

- 主题源自 [imsyy/vitepress-theme-curve](https://github.com/imsyy/vitepress-theme-curve)，感谢上游作者 [imsyy](https://imsyy.top) 的开源工作。
- 基于 [VitePress](https://vitepress.dev/zh/) 与 [Vue 3](https://vuejs.org/) 构建。
- 代码以 [MIT License](LICENSE) 授权。

<div align="center">

**Powered by VitePress**

</div>
