// 主题配置
export const themeConfig = {
  // 站点信息
  siteMeta: {
    // 站点标题
    title: "池鱼小栈",
    // 站点描述
    description: "跨过晨昏线，便是永夜。",
    // 站点logo
    logo: "/images/logo/logo.webp",
    // 站点地址
    site: "https://chiyu.it",
    // 语言
    lang: "zh-CN",
    // 作者
    author: {
      name: "池鱼",
      cover: "/images/logo/logo.webp",
      email: "kazukokawagawa@qq.com",
      link: "https://chiyu.it",
    },
  },
  // 备案信息
  icp: "萌ICP备20259222号",
  // 建站日期
  since: "2025-04-29",
  // 每页文章数据
  postSize: 5,
  // inject
  inject: {
    // 头部
    // https://vitepress.dev/zh/reference/site-config#head
    header: [
      // Onion-Location
      [
        "meta",
        {
          "http-equiv": "Onion-Location",
          content: "chiyubknkdlzx4mjmiuu64sqaez2rxj3ae2weypybpkxpodpx3etsiqd.onion",
        },
      ],
      // favicon
      ["link", { rel: "icon", href: "/favicon.ico" }],
      // RSS
      [
        "link",
        {
          rel: "alternate",
          type: "application/rss+xml",
          title: "RSS",
          href: "#",
        },
      ],
      // 预载 CDN
      [
        "link",
        {
          crossorigin: "",
          rel: "preconnect",
          href: "https://s1.hdslb.com",
        },
      ],
      [
        "link",
        {
          crossorigin: "",
          rel: "preconnect",
          href: "https://cdn.jsdmirror.com",
        },
      ],
      // vivo sans
      [
        "link",
        {
          crossorigin: "anonymous",
          rel: "stylesheet",
          href: "https://cdn.jsdmirror.com/gh/CYYYY5/chiyupic@main/fonts/vivosans.css",
        },
      ],
      // HarmonyOS font
      [
        "link",
        {
          crossorigin: "anonymous",
          rel: "stylesheet",
          href: "https://s1.hdslb.com/bfs/static/jinkela/long/font/regular.css",
        },
      ],
      // 小赖字体
      [
        "link",
        {
          crossorigin: "anonymous",
          rel: "stylesheet",
          href: "https://cdn.jsdmirror.com/gh/CYYYY5/chiyupic@main/fonts/xiaolai.css",
        },
      ],
      // Lexend font
      [
        "link",
        {
          crossorigin: "anonymous",
          rel: "stylesheet",
          href: "https://cdn.jsdmirror.com/gh/CYYYY5/chiyupic@main/fonts/Lexend.css",
        },
      ],
      // iconfont
      [
        "link",
        {
          crossorigin: "anonymous",
          rel: "stylesheet",
          href: "https://cdn2.codesign.qq.com/icons/g5ZpEgx3z4VO6j2/latest/iconfont.css",
        },
      ],
      // Embed code
      ["link", { rel: "preconnect", href: "https://use.sevencdn.com" }],
      ["link", { rel: "preconnect", href: "https://fonts.gstatic.com", crossorigin: "" }],
      [
        "link",
        {
          crossorigin: "anonymous",
          href: "https://use.sevencdn.com/css2?family=Fira+Code:wght@300..700&display=swap",
          rel: "stylesheet",
        },
      ],
      // 预载 DocSearch
      [
        "link",
        {
          href: "https://0F1DUC8MAX-dsn.algolia.net",
          rel: "preconnect",
          crossorigin: "",
        },
      ],
    ],
  },
  // 导航栏菜单
  nav: [
    {
      text: "文库",
      items: [
        { text: "文章列表", link: "/pages/archives", icon: "article" },
        { text: "全部分类", link: "/pages/categories", icon: "folder" },
        { text: "全部标签", link: "/pages/tags", icon: "hashtag" },
      ],
    },
    // {
    // text: "专栏",
    // items: [
    //  { text: "技术分享", link: "/pages/categories/技术分享", icon: "technical" },
    //  { text: "我的项目", link: "/pages/project", icon: "code" },
    //  { text: "效率工具", link: "/pages/tools", icon: "tools" },
    //  ],
    //   },
    {
      text: "友链",
      items: [
        //  { text: "友链鱼塘", link: "/pages/friends", icon: "fish" },
        { text: "友情链接", link: "/pages/link", icon: "people" },
      ],
    },
    {
      text: "我的",
      items: [
        //{ text: "畅所欲言", link: "/pages/message", icon: "chat" },
        //{ text: "致谢名单", link: "/pages/thanks", icon: "reward" },
        { text: "关于本站", link: "/pages/about", icon: "contacts" },
      ],
    },
  ],
  // 导航栏菜单 - 左侧
  navMore: [
    {
      name: "项目",
      list: [
        {
          icon: "/images/logo/logo.webp",
          name: "主站",
          url: "/",
        },
        // {
        //   icon: "/images/logo/other/hot.png",
        //   name: "热榜",
        //   url: "https://hot.chiyu.it",
        // },
        // {
        //   icon: "/images/logo/other/nav.png",
        //   name: "Nav",
        //   url: "https://nav.chiyu.it",
        // },
      ],
    },
    {
      name: "服务",
      list: [
        {
          icon: "/images/uptime-favicon.ico",
          name: "检测",
          url: "https://status.chiyu.it",
        },
        // {
        //   icon: "/images/logo/logo.webp",
        //   name: "镜像站",
        //   url: "https://backup.chiyu.it",
        // },
      ],
    },
    //  {
    //   name: "项目",
    //   list: [
    //     {
    //       icon: "/images/logo/logo.webp",
    //       name: "占位符",
    //       url: "#",
    //     },
    //   ],
    // },
  ],
  // 封面配置
  cover: {
    // 是否开启双栏布局
    twoColumns: false,
    // 是否开启封面显示
    showCover: {
      // 是否开启封面显示 文章不设置cover封面会显示异常，可以设置下方默认封面
      enable: false,
      // 封面布局方式: left | right | both
      coverLayout: 'both',
      // 默认封面(随机展示)
      defaultCover: [
        'https://example.com/1.avif',
        'https://example.com/2.avif',
        'https://example.com/3.avif'
      ]
    }
  },
  // 页脚信息
  footer: {
    // 社交链接（请确保为偶数个）
    social: [
      {
        icon: "email",
        link: "mailto:kazukokawagawa@qq.com",
      },
      {
        icon: "github",
        link: "https://www.github.com/kazukokawagawa/",
      },
      {
        icon: "telegram",
        link: "https://t.me/Chiyuyu1314",
      },
      {
        icon: "bilibili",
        link: "https://space.bilibili.com/546803670",
      },
      {
        icon: "qq",
        link: "https://res.abeim.cn/api/qq/?qq=3985726818",
      },
      {
        icon: "twitter-x",
        link: "https://twitter.com/Chiyuyu520",
      },
    ],
    // sitemap
    sitemap: [
      {
        text: "博客",
        items: [
          { text: "近期文章", link: "/" },
          { text: "全部分类", link: "/pages/categories" },
          { text: "全部标签", link: "/pages/tags" },
          { text: "文章归档", link: "/pages/archives", newTab: true },
        ],
      },
      {
        text: "项目",
        items: [
          { text: "本站源码", link: "https://github.com/kazukokawagawa/vitepress-theme-curve", newTab: true },
        ],
      },
      //{
      //text: "专栏",
      //items: [
      //{ text: "技术分享", link: "/pages/categories/技术分享" },
      //{ text: "我的项目", link: "/pages/project" },
      // { text: "效率工具", link: "/pages/tools" },
      // ],
      // },
      {
        text: "页面",
        items: [
          //{ text: "畅所欲言", link: "/pages/message" },
          { text: "关于本站", link: "/pages/about" },
          { text: "隐私政策", link: "/pages/privacy" },
          { text: "版权协议", link: "/pages/cc" },
          { text: "TODO", link: "/pages/todo" },
        ],
      },
      {
        text: "服务",
        items: [
          { text: "站点状态", link: "https://status.chiyu.it", newTab: true },
        ],
      },
    ],
  },
  // 评论
  comment: {
    enable: true,
    // 评论系统选择
    // artalk / twikoo
    type: "twikoo",
    // artalk
    // https://artalk.js.org/
    artalk: {
      site: "",
      server: "",
    },
    // twikoo
    // https://twikoo.js.org/
    twikoo: {
      // 必填，若不想使用 CDN，可以使用 pnpm add twikoo 安装并引入
      js: "https://cdn.jsdelivr.net/npm/twikoo@1.6.42/dist/twikoo.all.min.js",
      envId: "https://twikoo.20100907.xyz",
      // 环境地域，默认为 ap-shanghai，腾讯云环境填 ap-shanghai 或 ap-guangzhou；Vercel 环境不填
      region: "",
      lang: "zh-CN",
    },
  },
  // 侧边栏
  aside: {
    // 站点简介
    hello: {
      enable: true,
      text: "这里有关于<strong>开发</strong>相关的问题和看法，也会有一些<strong>奇技淫巧</strong>的分享，其中大部分内容会侧重于<strong>前端开发</strong>。希望你可以在这里找到对你有用的知识和教程。",
    },
    // 目录
    toc: {
      enable: true,
    },
    // 标签
    tags: {
      enable: true,
    },
    // 倒计时
    countDown: {
      enable: true,
      // 倒计时日期
      data: {
        name: "生日",
        date: "2026-09-07",
      },
    },
    timing: {
      enable: true,
      name: "池鱼", //要显示的名字
      event: "活着", //事件名称
      date: "2010-09-07", //出生日期
    },
    // 站点数据
    siteData: {
      enable: true,
    },
    // 天气数据
    weather: {
      enable: true,
    },
    HelloGithub: {
      enable: false,
    },
  },
  // 友链
  friends: {
    // 友链朋友圈
    circleOfFriends: "",
    // 动态友链
    dynamicLink: {
      server: "",
      app_token: "",
      table_id: "",
    },
  },
  // 音乐播放器
  // https://github.com/imsyy/Meting-API
  music: {
    enable: true,
    // url
    url: "https://meting.20100907.xyz/api",
    // id
    id: 13470307260,
    // netease / tencent / kugou
    server: "netease",
    // playlist / album / song
    type: "playlist",
  },
  // 搜索
  // https://www.algolia.com/
  search: {
    enable: false,
    appId: "0F1DUC8MAX",
    apiKey: "1f97c9169943484cfb9a05c825851ca4",
  },
  // 天气 Key
  // 请前往 高德开放平台注册 Web服务 Key
  // 请注意不是 Web端 (JS API)，免费申请，每日上限 5000 次
  // 此处提供的服务可能会超量从而无法访问，请自行申请！请自行申请！请自行申请！
  // 若此处设为空则调用 教书先生 API https://api.oioweb.cn/doc/weather/GetWeather
  //weatherkey: {
  //"key": "1d65cc630df1f212e1d2e928643e3974",
  // },
  // 打赏
  rewardData: {
    enable: true,
    // 微信二维码
    wechat: "https://raw.20100907.xyz/pic/pay/wx.webp",
    // 支付宝二维码
    alipay: "https://raw.20100907.xyz/pic/pay/zfb.webp",
  },
  // 图片灯箱
  fancybox: {
    enable: true,
    js: "https://mirrors.sustech.edu.cn/cdnjs/ajax/libs/fancyapps-ui/5.0.36/fancybox/fancybox.umd.min.js",
    css: "https://mirrors.sustech.edu.cn/cdnjs/ajax/libs/fancyapps-ui/5.0.36/fancybox/fancybox.min.css",
  },
  // 外链中转
  jumpRedirect: {
    enable: true,
    // 排除类名
    exclude: [
      "cf-friends-link",
      "upyun",
      "icp",
      "author",
      "rss",
      "cc",
      "power",
      "social-link",
      "link-text",
      "travellings",
      "post-link",
      "report",
      "more-link",
      "skills-item",
      "right-menu-link",
      "link-card",
    ],
  },
  // 站点统计
  tongji: {
    "51la": "3M1I52LMkdPIgpya",
  },
};
