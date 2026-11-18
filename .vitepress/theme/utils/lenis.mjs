import Lenis from "lenis";

let lenis = null;

/**
 * 初始化全站唯一的 Lenis 实例。
 * 仅处理桌面滚轮，触屏继续使用系统原生滚动。
 */
export const initLenis = () => {
  if (lenis || typeof window === "undefined") return lenis;

  lenis = new Lenis({
    autoRaf: true,
    lerp: 0.15,
    smoothWheel: true,
    syncTouch: false,
    anchors: { offset: -80 },
    stopInertiaOnNavigate: true,
    respectReducedMotion: true,
  });

  return lenis;
};

export const destroyLenis = () => {
  lenis?.destroy();
  lenis = null;
};

/**
 * 使用 Lenis 滚动；实例尚未挂载时回退到浏览器原生平滑滚动。
 * @param {number|string|HTMLElement} target 目标位置、选择器或元素
 * @param {object} options Lenis 滚动参数
 */
export const scrollTo = (target = 0, options = {}) => {
  if (typeof window === "undefined") return false;

  if (lenis) {
    lenis.scrollTo(target, options);
    return true;
  }

  const behavior = options.immediate ? "auto" : "smooth";
  if (typeof target === "number") {
    window.scrollTo({ top: target, behavior });
    return true;
  }

  const element = typeof target === "string" ? document.querySelector(target) : target;
  if (!(element instanceof HTMLElement)) return false;

  const top = element.getBoundingClientRect().top + window.scrollY + (options.offset || 0);
  window.scrollTo({ top, behavior });
  return true;
};
