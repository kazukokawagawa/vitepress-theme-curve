import { tabsMarkdownPlugin } from "vitepress-plugin-tabs";
import markdownItAttrs from "markdown-it-attrs";
import container from "markdown-it-container";

// markdown-it
const markdownConfig = (md, themeConfig) => {
  // 插件
  md.use(markdownItAttrs);
  md.use(tabsMarkdownPlugin);
  // timeline
  md.use(container, "timeline", {
    validate: (params) => params.trim().match(/^timeline\s+(.*)$/),
    render: (tokens, idx) => {
      const m = tokens[idx].info.trim().match(/^timeline\s+(.*)$/);
      if (tokens[idx].nesting === 1) {
        return `<div class="timeline">
                    <span class="timeline-title">${md.utils.escapeHtml(m[1])}</span>
                    <div class="timeline-content">`;
      } else {
        return "</div></div>\n";
      }
    },
  });
  // radio
  md.use(container, "radio", {
    render: (tokens, idx, _options, env) => {
      const token = tokens[idx];
      const check = token.info.trim().slice("radio".length).trim();
      if (token.nesting === 1) {
        const isChecked = md.renderInline(check, {
          references: env.references,
        });
        // isChecked 是 markdown 渲染结果（可能含标签/属性），不能直接插进 class 属性。
        // 取纯文本再做 HTML 转义，并折叠空白，避免产出畸形 class。
        const modifier = md.utils
          .escapeHtml(
            isChecked
              .replace(/<[^>]*>/g, " ")
              .replace(/\s+/g, " ")
              .trim(),
          );
        return `<div class="radio">
          <div class="radio-point${modifier ? ` ${modifier}` : ""}" />`;
      } else {
        return "</div>";
      }
    },
  });
  // button
  md.use(container, "button", {
    render: (tokens, idx, _options) => {
      const token = tokens[idx];
      const check = token.info.trim().slice("button".length).trim();
      if (token.nesting === 1) {
        return `<button class="button ${check}">`;
      } else {
        return "</button>";
      }
    },
  });
  // card
  md.use(container, "card", {
    render: (tokens, idx, _options) => {
      const token = tokens[idx];
      if (token.nesting === 1) {
        return `<div class="card">`;
      } else {
        return "</div>";
      }
    },
  });
  // 表格
  md.renderer.rules.table_open = () => {
    return '<div class="table-container"><table>';
  };
  md.renderer.rules.table_close = () => {
    return "</table></div>";
  };
  // 图片
  /**
   * 判断 tokens[idx] 处的图片是否已处于作者书写的链接（link_open…link_close）内部。
   * 用 token 栈做嵌套深度判定，不依赖渲染后的字符串。
   *
   * 注意两点（均经实测确认）：
   *   1. image 规则的 tokens 是 inline 的 children 数组，link_open/link_close 就在其中；
   *   2. markdown-it **没有** renderer.rules.link_close 这个规则（默认走 renderToken），
   *      所以不能用「调用默认 link_close 比较返回值」的写法，只能用 nesting 计数配对。
   */
  const insideLink = (tokens, idx) => {
    let depth = 0;
    for (let i = 0; i < idx; i += 1) {
      const { type, nesting } = tokens[i];
      if (type === "link_open") depth += nesting;
      else if (type === "link_close") depth += nesting;
    }
    return depth > 0;
  };
  md.renderer.rules.image = (tokens, idx) => {
    const token = tokens[idx];
    const src = token.attrs[token.attrIndex("src")][1];
    const alt = token.content;
    if (!themeConfig.fancybox.enable) {
      return `<img src="${src}" alt="${alt}" loading="lazy">`;
    }
    // 作者已用 [![img](src)](href) 指明图片的点击目标时，不能再包一层 <a>：
    // 嵌套 <a> 会让外层作者链接变成空壳，点击图片会进灯箱而不是作者写的 href。
    // 改为把灯箱属性挂到 <img>（Fancybox.bind("[data-fancybox]") 直接命中 img），
    // 并用 <span class="img-fancybox"> 保留 .img-fancybox / .post-img / .post-img-tip 的样式挂钩。
    if (insideLink(tokens, idx)) {
      return `<span class="img-fancybox"><img class="post-img" src="${src}" alt="${alt}" loading="lazy" data-fancybox="gallery" data-caption="${alt}" /><span class="post-img-tip">${alt}</span></span>`;
    }
    return `<a class="img-fancybox" href="${src}" data-fancybox="gallery" data-caption="${alt}">
                <img class="post-img" src="${src}" alt="${alt}" loading="lazy" />
                <span class="post-img-tip">${alt}</span>
              </a>`;
  };
  
  // obsidian admonition
  const fence = md.renderer.rules.fence;
  md.renderer.rules.fence = (...args) => {
    const [tokens, idx] = args;
    const token = tokens[idx];
    const lang = token.info.trim();

    // 处理 Obsidian admonition
    if (lang.startsWith('ad-')) {
      const type = lang.substring(3); // 取ad-之后的内容，获取类型
      const content = token.content;

      const admonitionTypes = {
        'note': 'info',
        'question': 'info',
        'warning': 'warning',
        'tip': 'tip',
        'summary': 'info',
        'hint': 'tip',
        'important': 'warning',
        'caution': 'warning',
        'error': 'danger',
        'danger': 'danger'
      };

      const className = admonitionTypes[type] || 'info';
      // 兜底：```ad- 后为空时 type 为空串，type.toUpperCase() 会渲染出一个空标题。
      // 此时回退到类型名 "NOTE"，与 note 的映射保持一致。
      const safeType = type || 'note';
      const title = md.utils.escapeHtml(safeType.toUpperCase());

      return `<div class="${className} custom-block">
            <p class="custom-block-title">${title}</p>
            <div class="custom-block-content">
              ${md.render(content)}
            </div>
    </div>`;
    }
    return fence(...args);
  };  
};

export default markdownConfig;
