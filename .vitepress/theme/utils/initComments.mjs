import { loadScript, loadCSS } from "./commonTools.mjs";

const initComments = async (themeConfig) => {
  try {
    // 必要数据
    const option = themeConfig.comment;
    const commentType = option.type;
    if (!option.enable) return false;
    const server = option[commentType].server;
    console.log("开始加载", commentType, server);
    switch (commentType) {
      case "artalk":
        // 引入资源
        await loadCSS(`${server}/dist/Artalk.css`);
        return await new Promise((resolve, reject) => {
          loadScript(`${server}/dist/Artalk.js`, {
            callback: () => {
              if (typeof Artalk === "object") {
                resolve(Artalk);
              } else {
                reject(new Error("Artalk 初始化失败"));
              }
            },
          });
        });
      case "twikoo":
        // 引入资源
        return await new Promise((resolve, reject) => {
          loadScript(option[commentType].js, {
            callback: () => {
              if (typeof twikoo === "object") {
                resolve(twikoo);
              } else {
                reject(new Error("Twikoo 初始化失败"));
              }
            },
          });
        });
      default:
        return false;
    }
  } catch (error) {
    // 注意：不能用 try 块里的 `commentType` —— 它声明在 try 内，
    // 一旦在 try 的早期（如读取 option 时）抛错，catch 里引用它会抛
    // ReferenceError，把真实的失败原因（例如 CDN 加载失败）整个吞掉。
    // 这里直接从参数里取，缺失时给一个中性名字。
    console.error(`${themeConfig?.comment?.type ?? "评论"} 初始化失败`, error);
    throw error;
  }
};

export default initComments;
