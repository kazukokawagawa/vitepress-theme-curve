import { h } from "vue";
import { createPinia } from "pinia";
import { routeChange } from "@/utils/initTools.mjs";
import { enhanceAppWithTabs } from "vitepress-plugin-tabs/client";
import LazyLoader from "@/components/LazyLoader.vue";
import piniaPluginPersistedstate from "pinia-plugin-persistedstate";

// 根组件
import App from "@/App.vue";
// 全局样式
import "@/style/main.scss";

// pinia
const pinia = createPinia();
pinia.use(piniaPluginPersistedstate);

// Theme
const Theme = {
  // extends: Theme,
  Layout: () => {
    return h(App);
  },
  enhanceApp({ app, router, siteData }) {
    // 挂载
    app.use(pinia);
    app.component("LazyLoader", LazyLoader);
    // 插件
    enhanceAppWithTabs(app);
    // 初次加载已有服务端渲染的页面，跳过路由动画，避免 hydration 时重新遮住首屏。
    let isInitialRoute = true;
    router.onBeforeRouteChange = (to) => {
      if (isInitialRoute) return;
      return routeChange("before", to);
    };
    router.onAfterRouteChanged = (to) => {
      if (isInitialRoute) {
        isInitialRoute = false;
        return;
      }
      routeChange("after", to);
    };
  },
};

export default Theme;
