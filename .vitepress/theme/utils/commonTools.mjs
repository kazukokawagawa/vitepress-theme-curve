import { load } from "cheerio";

/**
 * 从文件名生成数字 ID
 * @param {string} fileName - 文件名
 * @returns {number} - 生成的数字ID
 */
export const generateId = (fileName) => {
  // 将文件名转换为哈希值
  let hash = 0;
  for (let i = 0; i < fileName.length; i++) {
    hash = (hash << 5) - hash + fileName.charCodeAt(i);
  }
  // 将哈希值转换为正整数
  const numericId = Math.abs(hash % 10000000000);
  return numericId;
};

/**
 * 动态加载脚本
 * @param {string} src - 脚本 URL
 * * @param {object} option - 配置
 */
export const loadScript = (src, option = {}) => {
  if (typeof document === "undefined" || !src) return false;
  // 获取配置
  const { async = false, reload = false, callback } = option;
  // 检查是否已经加载过此脚本
  const existingScript = document.querySelector(`script[src="${src}"]`);
  if (existingScript) {
    console.log("已有重复脚本");
    if (!reload) {
      callback && callback(null, existingScript);
      return false;
    }
    existingScript.remove();
  }
  // 创建一个新的script标签并加载
  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = src;
    if (async) script.async = true;
    script.onload = () => {
      resolve(script);
      callback && callback(null, script);
    };
    script.onerror = (error) => {
      reject(error);
      callback && callback(error);
    };
    document.head.appendChild(script);
  });
};

/**
 * 动态加载样式表
 * @param {string} href - 样式表 URL
 * @param {object} option - 配置
 */
export const loadCSS = (href, option = {}) => {
  if (typeof document === "undefined" || !href) return false;
  // 获取配置
  const { reload = false, callback } = option;
  // 检查是否已经加载过此样式表
  const existingLink = document.querySelector(`link[href="${href}"]`);
  if (existingLink) {
    console.log("已有重复样式");
    if (!reload) {
      callback && callback(null, existingLink);
      return false;
    }
    existingLink.remove();
  }
  // 创建新的link标签并设置属性
  return new Promise((resolve, reject) => {
    const link = document.createElement("link");
    link.href = href;
    link.rel = "stylesheet";
    link.type = "text/css";
    link.onload = () => {
      resolve(link);
      callback && callback(null, link);
    };
    link.onerror = (error) => {
      reject(error);
      callback && callback(error);
    };
    document.head.appendChild(link);
  });
};

/**
 * Encode a URL for use in a redirect query parameter.
 * URL-safe Base64 keeps `+` and `/` from being reinterpreted by URL parsers.
 * @param {string} value - URL to encode
 * @returns {string} - URL-safe Base64 value
 */
const encodeRedirectUrl = (value) => {
  if (typeof Buffer !== "undefined") {
    return Buffer.from(value, "utf-8").toString("base64url");
  }

  const bytes = new TextEncoder().encode(value);
  let binary = "";
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
};

/**
 * Check whether a link points to another origin.
 * @param {string} href - Link URL
 * @param {string} baseUrl - Current site URL
 * @returns {boolean} - Whether the link is external
 */
const isExternalLink = (href, baseUrl) => {
  try {
    const url = new URL(href, baseUrl);
    const base = new URL(baseUrl);
    return /^https?:$/.test(url.protocol) && url.origin !== base.origin;
  } catch {
    return false;
  }
};

/**
 * 跳转中转页
 * @param {string} html - 页面内容
 * @param {boolean} isDom - 是否为 DOM 对象
 */
export const jumpRedirect = (html, themeConfig, isDom = false) => {
  try {
    // 是否为开发环境
    const isDev = process.env.NODE_ENV === "development";
    if (isDev) return html;
    // 是否启用
    if (!themeConfig.jumpRedirect.enable) return html;
    const redirectPage = "/redirect.html";
    const baseUrl = typeof window !== "undefined"
      ? window.location.origin
      : themeConfig.siteMeta?.site || "https://localhost";
    const createRedirectHref = (href) =>
      `${redirectPage}?url=${encodeURIComponent(encodeRedirectUrl(href))}`;
    // 排除的 className
    const excludeClass = themeConfig.jumpRedirect.exclude || [];
    if (isDom) {
      if (typeof window === "undefined" || typeof document === "undefined") return false;
      // 所有链接
      const allLinks = [...document.getElementsByTagName("a")];
      if (allLinks?.length === 0) return false;
      allLinks.forEach((link) => {
        // 检查链接是否包含 target="_blank" 属性
        if (link.getAttribute("target") === "_blank") {
          // 检查链接是否包含排除的类
          if (excludeClass.some((className) => link.classList.contains(className))) {
            return false;
          }
          const linkHref = link.getAttribute("href");
          // 只处理中转到外部站点的链接，避免误伤站内新窗口链接
          if (linkHref && isExternalLink(linkHref, baseUrl) && !linkHref.includes(redirectPage)) {
            const redirectLink = createRedirectHref(linkHref);
            // 保存原始链接
            link.setAttribute("original-href", linkHref);
            // 覆盖 href
            link.setAttribute("href", redirectLink);
          }
        }
      });
    } else {
      const $ = load(html);
      // 替换符合条件的标签
      $("a[target='_blank']").each((_, el) => {
        const $a = $(el);
        const href = $a.attr("href");
        const classes = ($a.attr("class") || "").split(/\s+/);
        if (excludeClass.some((className) => classes.includes(className))) return;
        // 只处理中转到外部站点的链接，避免误伤站内新窗口链接
        if (!href || !isExternalLink(href, baseUrl) || href.includes(redirectPage)) {
          return;
        }
        $a.attr("original-href", href);
        $a.attr("href", createRedirectHref(href));
      });
      return $.html();
    }
  } catch (error) {
    console.error("处理链接时出错：", error);
    return html;
  }
};
