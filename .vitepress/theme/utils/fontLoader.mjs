const FONT_STYLESHEET_MAP = {
  lexend: "https://cdn.jsdmirror.com/gh/CYYYY5/chiyupic@main/fonts/Lexend.css",
  vsans: "https://cdn.jsdmirror.com/gh/CYYYY5/chiyupic@main/fonts/vivosans.css",
  hmos: "https://s1.hdslb.com/bfs/static/jinkela/long/font/regular.css",
  xlfont: "https://cdn.jsdmirror.com/gh/CYYYY5/chiyupic@main/fonts/xiaolai.css",
};

const FONT_FAMILY_MAP = {
  lexend: "Lexend",
  vsans: "vivosans",
  hmos: "HarmonyOS_Regular",
  xlfont: "xiaolai",
};

const STYLE_ID_PREFIX = "curve-font-";
const loadingTasks = new Map();
const FONT_LOAD_TEXT = "池鱼Chiyu123";

const runWhenIdle = (callback) => {
  if (typeof window === "undefined") return;

  if ("requestIdleCallback" in window) {
    window.requestIdleCallback(callback, { timeout: 1500 });
    return;
  }

  window.setTimeout(callback, 1);
};

const appendStylesheet = (key) => {
  if (typeof document === "undefined") return Promise.resolve(false);

  const href = FONT_STYLESHEET_MAP[key];
  if (!href) return Promise.resolve(false);

  const styleId = `${STYLE_ID_PREFIX}${key}`;
  const existingLink = document.getElementById(styleId);
  if (existingLink) return Promise.resolve(true);

  if (loadingTasks.has(styleId)) {
    return loadingTasks.get(styleId);
  }

  const task = new Promise((resolve) => {
    const link = document.createElement("link");
    link.id = styleId;
    link.rel = "stylesheet";
    link.href = href;
    link.crossOrigin = "anonymous";
    link.onload = () => {
      loadingTasks.delete(styleId);
      resolve(true);
    };
    link.onerror = () => {
      loadingTasks.delete(styleId);
      resolve(false);
    };
    document.head.appendChild(link);
  });

  loadingTasks.set(styleId, task);
  return task;
};

const waitForFontReady = async (key) => {
  if (typeof document === "undefined" || !document.fonts) return;

  const fontFamily = FONT_FAMILY_MAP[key];
  if (!fontFamily) return;

  try {
    await Promise.race([
      document.fonts.load(`400 1em "${fontFamily}"`, FONT_LOAD_TEXT),
      new Promise((resolve) => window.setTimeout(resolve, 3000)),
    ]);
  } catch {
    // Ignore font loading failures and keep fallback fonts visible.
  }
};

export const ensureGlobalFontsLoaded = (fontFamily) => {
  if (typeof window === "undefined") return Promise.resolve();

  return new Promise((resolve) => {
    runWhenIdle(async () => {
      const fontKeys = ["lexend"];

      if (fontFamily && FONT_STYLESHEET_MAP[fontFamily]) {
        fontKeys.push(fontFamily);
      }

      await Promise.all(fontKeys.map((key) => appendStylesheet(key)));
      await Promise.all(fontKeys.map((key) => waitForFontReady(key)));
      resolve();
    });
  });
};
