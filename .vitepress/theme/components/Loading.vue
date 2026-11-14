<template>
  <Transition name="loading-curtain" mode="out-in" @after-enter="finishCurtainEntry">
    <div v-if="showCurtain" class="loading" @click="dismissLoading">
      <div class="loading-title" role="status">{{ loadingTitle }}</div>
      <span :class="['tip', { show: showTip }]"> 一直显示？点击任意区域即可关闭 </span>
    </div>
  </Transition>
</template>

<script setup>
import { storeToRefs } from 'pinia';
import { mainStore } from '@/store';
import { resolveLoadingCover } from '@/utils/initTools.mjs';

const store = mainStore();
const { theme } = useData();
const { isLoading } = storeToRefs(store);

const loadingTitle = computed(() => `你好，欢迎来到${theme.value.siteMeta.title || "池鱼小栈"}`);

const showCurtain = ref(false);
const isCurtainEntering = ref(false);
const pendingCurtainExit = ref(false);

const syncCurtain = (loading) => {
  if (loading) {
    pendingCurtainExit.value = false;
    if (!showCurtain.value) {
      isCurtainEntering.value = true;
      showCurtain.value = true;
    } else if (!isCurtainEntering.value) {
      resolveLoadingCover();
    }
    return;
  }

  if (isCurtainEntering.value) {
    pendingCurtainExit.value = true;
  } else {
    showCurtain.value = false;
  }
};

const finishCurtainEntry = () => {
  isCurtainEntering.value = false;
  resolveLoadingCover();
  if (!isLoading.value || pendingCurtainExit.value) {
    pendingCurtainExit.value = false;
    showCurtain.value = false;
  }
};

const dismissLoading = () => {
  if (!showTip.value) return;
  store.initialLoading = false;
  store.loadingStatus = false;
};

// 显示提示
const showTip = ref(false);
const showTimeOut = ref(null);

// 监听加载状态
watch(
  () => isLoading.value,
  (val) => {
    syncCurtain(val);
    clearTimeout(showTimeOut.value);
    if (val) {
      showTimeOut.value = setTimeout(() => {
        showTip.value = true;
      }, 3000);
    } else {
      showTip.value = false;
      clearTimeout(showTimeOut.value);
    }
  },
  { immediate: typeof window !== "undefined" },
);

onBeforeUnmount(() => {
  clearTimeout(showTimeOut.value);
});
</script>

<style lang="scss" scoped>
.loading {
  position: fixed;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  background-color: var(--main-card-background);
  z-index: 9999;
  overflow: hidden;
  will-change: transform;

  .loading-title {
    position: relative;
    padding: 0.45rem 1rem 0.75rem;
    color: var(--main-font-color);
    font-family: "Title Xiaolai", "Site Title", var(--main-font-family);
    font-size: clamp(1.55rem, 3.8vw, 2.3rem);
    font-weight: 700;
    letter-spacing: 0.08em;
    line-height: 1.4;
    white-space: nowrap;
    animation: loading-title-breathe 2.4s ease-in-out infinite;

    &::after {
      position: absolute;
      right: 0;
      bottom: 0;
      left: 0;
      width: 3.2rem;
      height: 2px;
      margin: auto;
      border-radius: 999px;
      background: var(--main-color);
      content: "";
      opacity: 0.75;
      animation: loading-title-line 2.4s ease-in-out infinite;
    }
  }

  .tip {
    position: absolute;
    bottom: 2rem;
    font-size: 14px;
    opacity: 0;
    transition: opacity 0.3s;

    &.show {
      opacity: 0.6;
    }
  }
}

@keyframes loading-title-breathe {
  0%,
  100% {
    opacity: 0.78;
    transform: translateY(0) scale(0.98);
  }

  50% {
    opacity: 1;
    transform: translateY(-3px) scale(1);
  }
}

@keyframes loading-title-line {
  0%,
  100% {
    width: 2.2rem;
    opacity: 0.45;
  }

  50% {
    width: 4.5rem;
    opacity: 0.9;
  }
}

.loading-curtain-enter-active,
.loading-curtain-leave-active {
  transition: transform 0.7s cubic-bezier(0.77, 0, 0.175, 1);
}

.loading-curtain-enter-from {
  transform: translateX(100%);
}

.loading-curtain-leave-to {
  transform: translateX(-100%);
}
</style>
