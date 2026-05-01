import { defineStore } from "pinia";
import cursorInit from '@/utils/cursor.js';

let appCursorInstance;
const isMobile = typeof navigator !== 'undefined' && /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

export const mainStore = defineStore("main", {
  state: () => {
    return {
      // 主题类别
      themeType: "auto",
      themeValue: "light",
      // banner
      bannerType: "half",
      // 加载状态
      // 默认不阻塞 SSR 首屏，路由切换时再由客户端显式开启 Loading。
      loadingStatus: false,
      // 滚动高度
      scrollData: {
        height: 0,
        percentage: 0,
        direction: "down",
      },
      // 页脚可见性
      footerIsShow: false,
      // 中控台显示
      controlShow: false,
      // 搜索框显示
      searchShow: false,
      // 个性化配置显示
      showSeetings: false,
      // 播放器数据
      playState: true,
      playerShow: true,
      playerVolume: 0.7,
      playerData: {
        name: "未知曲目",
        artist: "未知艺术家",
      },
      // 移动端菜单显示
      mobileMenuShow: false,
      // 使用自定义右键菜单
      useRightMenu: true,
      // 背景模糊
      backgroundBlur: false,
      // 全站字体
      fontFamily: "vsans",
      // 全站字体大小
      fontSize: isMobile ? 16 : 17,
      // 信息显示位置
      infoPosition: "fixed",
      // 上次滚动位置
      lastScrollY: 0,
      // 站点背景
      backgroundType: "patterns",
      backgroundUrl: "https://api.miaomc.cn/image/get",
    };
  },
  getters: {},
  actions: {
    // 切换应用状态
    changeShowStatus(value, blur = true) {
      if (typeof document === 'undefined') return; // 确保在客户端

      this[value] = !this[value];
      // 阻止滚动
      document.body.style.overflowY = this[value] ? "hidden" : "";
      // 全局模糊
      const globalApp = document.getElementById("app");
      this[value] && this.backgroundBlur && blur
        ? globalApp.classList.add("blur")
        : globalApp.classList.remove("blur");
    },
    // 更改字体大小
    changeFontSize(isAdd = false) {
      if (typeof document === 'undefined') return; // 确保在客户端

      if (isAdd) {
        if (this.fontSize < 20) {
          this.fontSize++;
        }
      } else {
        if (this.fontSize > 14) {
          this.fontSize--;
        }
      }
      const htmlElement = document.documentElement;
      htmlElement.style.fontSize = this.fontSize + "px";
    },
    // 切换明暗模式
    changeThemeType() {
      if (typeof window === 'undefined') return; // 确保在客户端

      // 禁止壁纸模式切换
      if (this.backgroundType === "image") {
        if (typeof $message !== "undefined") { 
          $message.warning("无法在壁纸模式下切换明暗模式", {
            duration: 1500,
          });
        }
        return false;
      }
      this.themeType === "auto"
        ? (this.themeType = "dark")
        : this.themeType === "dark"
          ? (this.themeType = "light")
          : (this.themeType = "auto");

      // 计算实际生效的 themeValue 并设置 CSS 变量
      this.updateActualThemeValue();

      // 弹窗提示
      if (typeof $message !== "undefined") { 
        const text =
          this.themeType === "light"
            ? "浅色模式"
            : this.themeType === "dark"
              ? "深色模式"
              : "跟随系统";
        $message.info("当前主题为" + text, {
          duration: 1500,
        });
      }

      // 通知光标更新主题
      if (appCursorInstance) {
        appCursorInstance.setThemeType(this.themeType);
      }
    },

    // 新增方法：更新实际生效的主题值并设置CSS变量
    updateActualThemeValue() {
      if (typeof window === 'undefined' || typeof document === 'undefined') return; // 确保在客户端

      let actualTheme;
      if (this.themeType === 'auto') {
        const prefersDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
        actualTheme = prefersDarkMode ? 'dark' : 'light';
      } else {
        actualTheme = this.themeType;
      }
      this.themeValue = actualTheme;

      const root = document.documentElement;
      if (actualTheme === 'light') {
        root.style.setProperty('--cursor-bg-color', '#000');
      } else {
        root.style.setProperty('--cursor-bg-color', '#fff');
      }
      
      if (actualTheme === 'dark') {
          root.classList.add('dark');
          root.classList.remove('light');
      } else {
          root.classList.add('light');
          root.classList.remove('dark');
      }
    },

    // 新增action: 外部触发更新主题（用于系统主题变化）
    triggerThemeUpdate() {
        if (typeof window === 'undefined') return; // 确保在客户端
        this.updateActualThemeValue();
        if (appCursorInstance) {
            appCursorInstance.setThemeType(this.themeType);
        }
    }
  },
  // 数据持久化
  persist: [
    {
      key: "siteData",
      paths: [
        "themeType",
        "bannerType",
        "useRightMenu",
        "playerShow",
        "playerVolume",
        "backgroundBlur",
        "backgroundType",
        "fontFamily",
        "fontSize",
        "infoPosition",
        "backgroundUrl",
      ], 
    },
  ],
});

// 在 Pinia store 被创建后，初始化光标并处理主题设置
export const initializeCursor = () => {
  // 确保只在客户端执行初始化
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    console.warn('initializeCursor skipped in SSR environment.');
    return;
  }

  const store = mainStore();

  if (!appCursorInstance) {
    appCursorInstance = cursorInit(); // cursorInit 内部也有环境判断
  }

  // 如果 appCursorInstance 在非浏览器环境下返回 null，则跳过后续操作
  if (!appCursorInstance) {
    return;
  }

  store.updateActualThemeValue();
  appCursorInstance.setThemeType(store.themeType);

  // 新增：设置 html 元素的字体大小
  document.documentElement.style.fontSize = store.fontSize + 'px';

  if (window.matchMedia) {
    const mediaQueryList = window.matchMedia('(prefers-color-scheme: dark)');

    const handleSystemThemeChange = (e) => {
      if (store.themeType === 'auto') {
        store.triggerThemeUpdate();
      }
    };

    if (mediaQueryList.addEventListener) {
      mediaQueryList.addEventListener('change', handleSystemThemeChange);
    } else {
      mediaQueryList.addListener(handleSystemThemeChange);
    }
  }
};
