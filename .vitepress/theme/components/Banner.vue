<template>
  <div v-if="type === 'text'" ref="bannerRoot" :class="['banner', bannerType]" id="main-banner">
    <h1 class="title-lockup" :aria-label="`${titleEn} ${cnText}`">
      <span class="title-stage">
        <span class="title-py" ref="titlePy" aria-hidden="true">
          <span
            v-for="(char, index) in preChars"
            :key="`pre-${index}`"
            class="py-char"
            :style="{ '--i': String(index) }"
            >{{ char }}</span
          >
          <span class="py-morph" ref="morphWrap">
            <span class="morph-log" ref="morphLog">
              <span class="py-char log-fade" :style="{ '--i': String(logIndex) }">L</span>
              <span class="py-char o-morph" :style="{ '--i': String(logIndex + 1) }">
                <span class="o-glyph">o</span>
              </span>
              <span class="py-char g-fade" :style="{ '--i': String(logIndex + 2) }">g</span>
            </span>
            <span class="morph-note" ref="morphNote">Note</span>
          </span>
          <span
            v-for="(char, index) in postChars"
            :key="`post-${index}`"
            class="py-char"
            :style="{ '--i': String(logIndex + 3 + index) }"
            >{{ char }}</span
          >
          <!-- 遮盖胶囊：放在整行文字的最后一个（DOM 末尾 + 高 z-index），
               保证任何时候都画在 L/o/g、Note、book 之上 -->
          <span class="o-capsule" aria-hidden="true">
            <svg
              v-for="(icon, iconIndex) in capsuleIcons"
              :key="iconIndex"
              class="o-icon"
              :style="{ '--i': String(iconIndex) }"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.8"
              stroke-linecap="round"
              stroke-linejoin="round"
              aria-hidden="true"
            >
              <path v-for="(path, pathIndex) in icon" :key="pathIndex" :d="path" />
            </svg>
          </span>
        </span>
        <span class="title-cn" aria-hidden="true">
          <span class="cn-slide">
            <span class="cn-prefix">
              <span
                v-for="(char, index) in prefixChars"
                :key="`prefix-${index}`"
                class="cn-char prefix-char"
                :style="{ '--i': String(prefixChars.length - 1 - index) }"
                >{{ char }}</span
              >
            </span>
            <span class="cn-brand">
              <span
                v-for="(char, index) in brandChars"
                :key="`brand-${index}`"
                class="cn-char brand-char"
                :style="{ '--i': String(index) }"
                >{{ char }}</span
              >
            </span>
          </span>
        </span>
      </span>
    </h1>
    <div class="subtitle">
      <Transition name="fade" mode="out-in">
        <span :key="displayText" class="text" @click="toggleHitokoto">
          {{ displayText }}
        </span>
      </Transition>
    </div>
    <Transition name="fade" mode="out-in">
      <i v-if="height === 'full'" class="iconfont icon-up" @click="scrollToHome" />
    </Transition>
  </div>
  <div
    v-else-if="type === 'page'"
    :class="['banner-page', 's-card', { image }]"
    :style="{
      backgroundImage: image ? `url(${image})` : null,
    }"
  >
    <div class="top">
      <div class="title">
        <span class="title-small">{{ title }}</span>
        <span class="title-big">{{ desc }}</span>
      </div>
      <div class="top-right">
        <slot name="header-slot" />
      </div>
    </div>
    <slot />
    <div class="footer">
      <div class="footer-left">
        {{ footer }}
      </div>
      <div class="footer-right">
        <slot name="footer-slot" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { mainStore } from '@/store';
import { getHitokoto } from '@/api';

const store = mainStore();
const { theme } = useData();

// 首屏英文标题「Chiyu's Logbook」：整行从第一帧就按「Note」的实测宽度占位，
// 所以 book 与整行的位置全程不变。逐字浮入后，胶囊直接以 Note 的脚印显形，
// 一次把整个「Log」收进去（尺寸此后不再改变），在里面轮播图标；
// 结束时胶囊原地淡出、Note 同拍浮现 —— 没有静止遮盖期。
// 随后「池鱼小栈」以 Logo 形态（放大）落到画面中心，
// 最后「你好，欢迎来到」逐字落下，同时整组像 PPT 平移一样同步平移+缩放到最终位置。
// 英文与欢迎语都使用小赖字体（title-anim.woff2 为按需子集）。
// 整条时间线由 CSS 驱动（见下方样式注释）。
const titleEn = "Chiyu's Logbook";
const enPre = "Chiyu's ";
const enLog = "Log";
const enPost = "book";
const preChars = enPre.split("");
const postChars = enPost.split("");
// “Log” 三个字母在整行中的起始下标，用于保持逐字入场的节奏连续
const logIndex = enPre.length;
const cnPrefix = "你好，欢迎来到";
const prefixChars = cnPrefix.split("");
const cnBrand = computed(() => theme.value.siteMeta.title || "池鱼小栈");
const brandChars = computed(() => cnBrand.value.split(""));
const cnText = computed(() => `${cnPrefix}${cnBrand.value}`);

// 胶囊的尺寸与位置要用两段词的真实宽度（小赖为手写比例字体，em 估值不可靠），
// 挂载后实测并写入 CSS 变量，动画直接引用；字体未就绪时用 CSS 里的 em 兜底。
const bannerRoot = ref(null);
const titlePy = ref(null);
const morphWrap = ref(null);
const morphLog = ref(null);
const morphNote = ref(null);
let layoutObserver = null;
let isMobileViewport = false;
let timelineStarted = false;

// 只在数值真的变了才写，避免 ResizeObserver 因自身写入再次触发（写同样的值不会变，但留着更稳）
function setMorphVar(name, value) {
  if (!titlePy.value) return;
  const next = `${Math.round(value * 100) / 100}px`;
  if (titlePy.value.style.getPropertyValue(name) !== next) {
    titlePy.value.style.setProperty(name, next);
  }
}

// 返回 true 表示这次测量有效。SPA 返回首页时，主题会先把 <main> 设为 display:none
// 再挂载新页面，隐藏状态下所有尺寸都是 0 —— 一旦把 0 写进 CSS 变量，
// 标题整行就会塌成一片（这就是“返回首页后动画乱套”的根因），所以这里必须能识别并跳过。
function measureMorph() {
  if (!titlePy.value || !morphWrap.value || !morphLog.value || !morphNote.value) return false;
  const pyRect = titlePy.value.getBoundingClientRect();
  if (pyRect.width <= 0) return false;
  const morphRect = morphWrap.value.getBoundingClientRect();
  const em = parseFloat(getComputedStyle(titlePy.value).fontSize) || 0;
  const logW = morphLog.value.offsetWidth;
  const noteW = morphNote.value.offsetWidth;
  if (!em || !logW || !noteW) return false;
  // py-morph 的左缘（= “L” 的起笔）到整行左缘的距离，只取决于 “Chiyu's ” 的宽度，全程稳定
  const capLeft = morphRect.left - pyRect.left;
  // 整行按 Note 的宽度占位：book 从第一帧起就停在最终位置，全程零位移
  setMorphVar("--note-w", noteW);
  // 胶囊脚印 = Log 与 Note 的最大宽度；左侧多留 0.12em 盖住 L 的起笔，
  // 右缘正好落在词尾，不越过后面 book 的字形
  const padL = 0.12 * em;
  setMorphVar("--cover-left", capLeft - padL);
  setMorphVar("--cover-w", Math.max(logW, noteW) + padL);
  return true;
}

// 标题动画在 10.08s 结束（平移 8.95s 开始、0.6s 完成；前缀 9.52s 起逐字落，最后一字 10.08s 落定），
// 取 10.2s 定稿；随机文案在动画结束后再等 3s 才开始。
const TITLE_ANIMATION_MS = 10200;
// 手机端走简化版（见样式里的 768px 断点）：没有英文行与胶囊，只有一段 0.7s 的整体入场，
// 定稿时间同步缩短，否则一言要等到 13s 才出现，首屏会一直钉在静态标语上。
const MOBILE_QUERY = "(max-width: 768px)";
const MOBILE_TITLE_ANIMATION_MS = 800;
const titleAnimationDone = ref(false);
let titleAnimMs = TITLE_ANIMATION_MS;
let titleStartedAt = 0;
let titleDoneTimer = null;

// 标题真正参与布局后才启动时间线：display:none 期间 CSS 动画不会推进，
// 但 JS 的计时器会 —— 以挂载时间起算的话，一言会比画面早 0.3~0.8s 出现。
function startTimeline() {
  if (timelineStarted) return;
  timelineStarted = true;
  titleStartedAt = Date.now();
  // 动画期间只缓存一句，不切换下方文案
  fetchHitokoto();
  titleDoneTimer = setTimeout(() => {
    titleAnimationDone.value = true;
  }, titleAnimMs);
  startHitokotoCycle();
}

// 布局一旦就绪（首次可见 / 窗口尺寸变化 / 字号设置变化）就补测一次尺寸。
// 用 ResizeObserver 而不是一次性 rAF：SPA 返回时组件是在隐藏状态下挂载的，
// 那一次测量必然拿不到宽度，只能等 <main> 从 display:none 恢复时再测。
function handleLayout() {
  if (!bannerRoot.value) return;
  if (bannerRoot.value.getBoundingClientRect().width <= 0) return;
  if (!isMobileViewport) measureMorph();
  startTimeline();
}

function observeLayout() {
  handleLayout();
  if (typeof ResizeObserver !== "undefined") {
    layoutObserver = new ResizeObserver(handleLayout);
    layoutObserver.observe(bannerRoot.value);
  } else {
    // 老浏览器没有 ResizeObserver：用有上限的 rAF 轮询兜底，别让时间线一直不启动
    let tries = 0;
    const retry = () => {
      handleLayout();
      if (!timelineStarted && ++tries < 600) requestAnimationFrame(retry);
    };
    requestAnimationFrame(retry);
  }
  // 字体就绪后字形宽度会变，再测一次（measureMorph 自己会判断能不能测）
  if (!isMobileViewport && document.fonts?.ready) {
    document.fonts.ready.then(() => requestAnimationFrame(() => measureMorph()));
  }
}

// “o” 胶囊内轮播的图标，顺序对齐 WorkBuddy 首页标题：
// ∞ → 下载/波浪 → 公文包 → 公文包（勾） → </> → >_
const capsuleIcons = [
  [
    "M6.8 8.2c-2.1 0-3.8 1.7-3.8 3.8s1.7 3.8 3.8 3.8c4.4 0 7.2-7.6 11.6-7.6 2.1 0 3.8 1.7 3.8 3.8s-1.7 3.8-3.8 3.8c-4.4 0-7.2-7.6-11.6-7.6Z",
  ],
  [
    "M12 4.5v9.5",
    "m8.2 10.2 3.8 3.8 3.8-3.8",
    "M4.5 18.5c2 0 2.6-1.6 4.5-1.6s2.5 1.6 4.5 1.6 2.5-1.6 4.5-1.6 2 .6 2 .6",
  ],
  [
    "M3.5 8.5h17v9a2 2 0 0 1-2 2h-13a2 2 0 0 1-2-2v-9Z",
    "M9 8.5V7a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v1.5",
    "M3.5 13.5h17",
  ],
  [
    "M3.5 8.5h17v9a2 2 0 0 1-2 2h-13a2 2 0 0 1-2-2v-9Z",
    "M9 8.5V7a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v1.5",
    "m9.5 14 1.8 1.8 3.4-3.4",
  ],
  ["m8 7.5-4.5 4.5L8 16.5", "m16 7.5 4.5 4.5L16 16.5", "M13.6 4.8 10.4 19.2"],
  ["m4.5 7.5 4.5 4.5-4.5 4.5", "M12 16.5h7.5"],
];

const props = defineProps({
  type: { type: String, default: 'text' },
  height: { type: String, default: 'half' },
  title: { type: String, default: '这里是标题' },
  desc: { type: String, default: '这里是简介' },
  footer: { type: String, default: '' },
  image: { type: String, default: '' },
});

// 存储一言数据和状态
const hitokotoData = ref({ hitokoto: '', from: '', from_who: '' });
const isHitokotoDisplayed = ref(false);
const isManualSloganDisplayed = ref(false);

// 自动轮询相关
const hitokotoInitialTimeout = ref(null);
const manualSloganTimeout = ref(null);
const autoSwitchInterval = ref(null);
const autoSwitchActive = ref(false);
// 并发请求令牌：慢请求回来后不能覆盖后发出的请求
let hitokotoRequestId = 0;

// 是否已经手动点击过一次，停止自动并锁定手动模式
const disableAuto = ref(false);

// 默认标语
const defaultSlogan = theme.value.siteMeta.description;
const manualSlogan = '所以，回去吧，回到我们，所有「奇迹」开始的地方';

// 计算展示的文字：若当前为“一言”状态则显示一言，否则显示默认标语
const displayText = computed(() =>
  isHitokotoDisplayed.value && hitokotoData.value.hitokoto
    ? hitokotoData.value.hitokoto
    : isManualSloganDisplayed.value
      ? manualSlogan
      : defaultSlogan
);

// 点击处理：
// 每次人工点击都会暂停自动轮播；最后一次点击 3 秒后恢复。
// 标题动画播放期间不响应点击，保证下方文案完全不动。
async function toggleHitokoto() {
  if (!titleAnimationDone.value) return;

  const isFirstManualInteraction = !disableAuto.value;

  pauseHitokotoCycle();
  disableAuto.value = true;

  if (isFirstManualInteraction) {
    // 首次人工介入时显示手动标语。
    isHitokotoDisplayed.value = false;
    isManualSloganDisplayed.value = true;
  } else {
    // 后续点击仍可手动获取新一言。
    await fetchAndShowHitokoto();
  }

  manualSloganTimeout.value = setTimeout(resumeHitokotoCycle, 3000);
}

// 只请求并缓存，不改变当前展示内容（动画期间先缓存一句）
async function fetchHitokoto() {
  const requestId = ++hitokotoRequestId;
  try {
    const result = await getHitokoto();
    // 期间若有更新的请求发出，丢弃这次结果
    if (requestId !== hitokotoRequestId) return false;
    hitokotoData.value = {
      hitokoto: result.hitokoto,
      from: result.from,
      from_who: result.from_who
    };
    return true;
  } catch (err) {
    console.error('一言获取失败：', err);
    return false;
  }
}

// 请求并立即展示
async function fetchAndShowHitokoto() {
  const success = await fetchHitokoto();
  if (!success) return;
  isHitokotoDisplayed.value = true;
  isManualSloganDisplayed.value = false;
}

// 自动轮询执行
async function autoToggleHitokoto() {
  await fetchAndShowHitokoto();
}

// 启动首次延迟 + 后续自动轮询。
// 首次延迟 = 标题动画时长 + 3s；动画结束后仍有 3s 让定稿画面停留。
function startHitokotoCycle() {
  if (disableAuto.value) return;
  // 时间线还没启动（标题仍被隐藏）时不要抢先计时，否则会挂上第二个定时器
  if (!timelineStarted) return;
  if (hitokotoInitialTimeout.value) {
    clearTimeout(hitokotoInitialTimeout.value);
    hitokotoInitialTimeout.value = null;
  }
  const elapsed = titleStartedAt ? Date.now() - titleStartedAt : 0;
  const delay = Math.max(titleAnimMs + 3000 - elapsed, 0);
  hitokotoInitialTimeout.value = setTimeout(async () => {
    if (hitokotoData.value.hitokoto) {
      // 使用动画期间缓存好的那一句，避免首屏再等一次请求。
      isHitokotoDisplayed.value = true;
      isManualSloganDisplayed.value = false;
    } else {
      await fetchAndShowHitokoto();
    }
    autoSwitchInterval.value = setInterval(autoToggleHitokoto, 7000);
    autoSwitchActive.value = true;
  }, delay);
}

// 手动标语停留 3 秒后，恢复正常的一言轮播。
async function resumeHitokotoCycle() {
  manualSloganTimeout.value = null;
  disableAuto.value = false;
  await fetchAndShowHitokoto();
  if (!disableAuto.value && !autoSwitchInterval.value) {
    autoSwitchInterval.value = setInterval(autoToggleHitokoto, 7000);
    autoSwitchActive.value = true;
  }
}

function clearManualSloganTimeout() {
  if (manualSloganTimeout.value) {
    clearTimeout(manualSloganTimeout.value);
    manualSloganTimeout.value = null;
  }
}

// 暂停所有定时/请求
function pauseHitokotoCycle() {
  clearManualSloganTimeout();
  if (hitokotoInitialTimeout.value) {
    clearTimeout(hitokotoInitialTimeout.value);
    hitokotoInitialTimeout.value = null;
  }
  if (autoSwitchInterval.value) {
    clearInterval(autoSwitchInterval.value);
    autoSwitchInterval.value = null;
  }
  autoSwitchActive.value = false;
}

// Page Visibility API：切换标签页时暂停，切回时（若未手动禁用）恢复
function handleVisibilityChange() {
  if (document.hidden) {
    pauseHitokotoCycle();
  } else if (!disableAuto.value && !autoSwitchActive.value && !hitokotoInitialTimeout.value) {
    startHitokotoCycle();
  }
}

// 滚动至首页
function scrollToHome() {
  const bannerDom = document.getElementById('main-banner');
  if (!bannerDom) return;
  scrollTo({ top: bannerDom.offsetHeight, behavior: 'smooth' });
}

// 同步外部 store 的 bannerType
const bannerType = ref(store.bannerType);
watch(() => store.bannerType, val => (bannerType.value = val));

onMounted(() => {
  if (props.type !== 'text') return;
  // 手机端没有英文/胶囊这一段，胶囊的实测宽度也就不需要了
  isMobileViewport = window.matchMedia(MOBILE_QUERY).matches;
  titleAnimMs = isMobileViewport ? MOBILE_TITLE_ANIMATION_MS : TITLE_ANIMATION_MS;
  document.addEventListener('visibilitychange', handleVisibilityChange);
  // 实测 Log / Note 词宽并启动时间线，但都要等标题真正可见（见 observeLayout）
  observeLayout();
});

onBeforeUnmount(() => {
  layoutObserver?.disconnect();
  layoutObserver = null;
  pauseHitokotoCycle();
  if (titleDoneTimer) {
    clearTimeout(titleDoneTimer);
    titleDoneTimer = null;
  }
  document.removeEventListener('visibilitychange', handleVisibilityChange);
});
</script>

<style lang="scss" scoped>
/* 样式保持不变 */
.banner {
  height: 300px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  animation: fade-up 0.6s 0.1s backwards;
  transition: height 0.3s;
  &.full {
    opacity: 0;
    height: calc(100vh - 70px);
    padding-bottom: 100px;
    animation: fade-up 0.6s 0.5s forwards;
    .subtitle {
      opacity: 0;
      animation: fade-up-opacity 0.8s 0.5s forwards;
    }
  }
  .title-lockup {
    --title-timeline: 9.4s;
    --py-size: min(3.7rem, 7.8vw);
    --cn-size: min(2.9rem, 6.6vw);
    // Logo 阶段品牌的放大倍数，过大会被舞台裁掉
    --logo-scale: 1.3;
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100%;
    margin: 0;
    color: var(--main-font-color);
    font-weight: 400;
    line-height: 1;
    text-align: center;
    user-select: none;
  }
  .title-stage {
    position: relative;
    display: grid;
    place-items: center;
    width: 15em;
    max-width: 100%;
    // 只用 clip-path 做左右裁切（拼音滑出用），上下留足余量容纳放大的 Logo；
    // 不要再加 overflow: hidden —— 它会按盒子边缘硬裁，负 inset 的余量会失效。
    clip-path: inset(-0.9em 0);
    font-size: var(--cn-size);
  }
  .title-py {
    grid-area: 1 / 1;
    display: flex;
    align-items: baseline;
    justify-content: center;
    font-family: "Title Xiaolai", "Site Title", var(--main-font-family);
    font-size: var(--py-size);
    font-weight: 700;
    letter-spacing: -0.02em;
    line-height: 1;
    white-space: nowrap;
    // 变形/遮盖相关的实测值统一挂在整行上（JS 写入），供子元素与胶囊继承；
    // 这里给的是首帧兜底，字体未就绪时也不会塌掉。
    // 兜底值按小赖字体实测换算（JS 挂载后会覆盖），保证首帧与无 JS 时大致对位
    --note-w: 2.31em;
    --cover-left: 3.24em;
    --cover-w: 2.43em;
    transform: translateX(-180%);
    animation: py-exit var(--title-timeline) cubic-bezier(0.55, 0, 0.85, 0.36) both;

    .py-char {
      position: relative;
      display: inline-block;
      line-height: 1;
      white-space: pre;
      animation: py-char-in 0.7s cubic-bezier(0.16, 1, 0.3, 1) both;
      animation-delay: calc(var(--i) * 0.04s);

      // o 的占位永远保持 0.58em：胶囊在图标期就直接盖住 o+g，
      // 整行从第一帧起就是 Note 的版式，book 一步都不挪
      &.o-morph {
        width: 0.58em;
        text-align: center;
      }
    }

    // Log → Note 变形区：宽度从第一帧就按 Note 实测宽度占死，
    // 之后不管是胶囊膨胀还是换字，容器宽度都不变 —— 整行与 book 零位移。
    // “Log” 内容比 Note 窄一点，多出来的空隙由胶囊右缘盖住。
    .py-morph {
      position: relative;
      z-index: 3; // 胶囊已独立成层，这里只保证变形区压住 book
      display: inline-block;
      width: var(--note-w);
    }

    .morph-log {
      position: relative;
      z-index: 2;
      display: inline-block;
      white-space: nowrap;
    }

    // L 在胶囊完全遮盖后悄悄隐去（o 字形由 glyph-hide 负责，胶囊必须存活）
    .log-fade {
      animation:
        py-char-in 0.7s cubic-bezier(0.16, 1, 0.3, 1) calc(var(--i) * 0.04s) both,
        log-fade 0.15s linear 5.0s both;
    }

    // g 从图标期就被胶囊罩住（下伸部会露到胶囊外），所以让它随胶囊显形一起淡掉
    .g-fade {
      animation:
        py-char-in 0.7s cubic-bezier(0.16, 1, 0.3, 1) calc(var(--i) * 0.04s) both,
        log-fade 0.16s linear 1.14s both;
    }

    // Note 在遮盖下全程隐形，等胶囊开始淡出时才一起浮现（交叉溶解，替换过程完全不露馅）
    .morph-note {
      position: absolute;
      z-index: 1;
      top: 0;
      left: 0;
      white-space: pre;
      opacity: 0;
      animation: note-in 0.3s linear 5.22s both;
    }

    .o-glyph {
      display: inline-block;
      line-height: 1;
      animation: glyph-hide var(--title-timeline) linear both;
    }

    // 胶囊：作为整行最后一个子元素（独立图层），永远压在 L/o/g、Note、book 之上。
    // 尺寸从出现那一刻就是「Note 的脚印」（左缘盖住 L、右缘停在词尾），全程不再改变。
    .o-capsule {
      position: absolute;
      z-index: 9;
      top: 53%;
      left: var(--cover-left);
      width: var(--cover-w);
      height: 1.12em;
      border-radius: 999px;
      background:
        linear-gradient(180deg, rgba(255, 255, 255, 0.32), rgba(255, 255, 255, 0) 45%),
        linear-gradient(120deg, #a7f3e4 0%, #5eead4 45%, #2dd4bf 100%);
      box-shadow:
        0 0.08em 0.22em rgba(45, 212, 191, 0.26),
        inset 0 1px 0 rgba(255, 255, 255, 0.5);
      opacity: 0;
      pointer-events: none;
      transform: translateY(-50%) scaleY(0.55);
      animation:
        capsule-in var(--title-timeline) cubic-bezier(0.16, 1, 0.3, 1) both,
        capsule-hue 4.4s ease-in-out 1.3s both;
      will-change: opacity, transform, filter;

      .o-icon {
        position: absolute;
        inset: 0;
        // 图标占胶囊高度的 0.9/1.12 ≈ 80%，上下各留 0.11em 内边距；
        // 线宽同步从 2.2 收到 1.8，放大后笔画粗细才和标题的加粗字重对得上
        width: 0.9em;
        height: 0.9em;
        margin: auto;
        color: #fff;
        opacity: 0;
        transform: scale(0.4) rotate(-12deg);
        animation: icon-pop 0.6s cubic-bezier(0.16, 1, 0.3, 1) both;
        animation-delay: calc(1.32s + var(--i) * 0.64s);
      }
    }
  }
  .title-cn {
    grid-area: 1 / 1;
    display: flex;
    justify-content: center;
    font-family: "Title Xiaolai", "Site Title", var(--main-font-family);
    font-size: var(--cn-size);
    font-weight: 700;
    line-height: 1.24;
    white-space: nowrap;

    // 平移组：前缀 7em + 品牌。Logo 阶段整组左移 3.5em 让品牌独占中心；
    // 欢迎语出现时整组平滑平移回 0，品牌同步从 Logo 尺寸缩到正文尺寸，
    // 两个变换同一时间、同一缓动（PPT 式平滑平移）。
    .cn-slide {
      display: flex;
      flex: none;
      align-items: baseline;
      animation: slide-in 0.6s cubic-bezier(0.65, 0, 0.35, 1) 8.95s both;
      will-change: transform;
    }

    // 7em = 前缀 7 个字；宽度固定，不再用宽度撑开（避免布局抖动）
    .cn-prefix {
      display: flex;
      flex: none;
      justify-content: flex-end;
      width: 7em;
    }

    .cn-brand {
      display: flex;
      flex: none;
      transform-origin: center;
      animation: brand-scale 0.6s cubic-bezier(0.65, 0, 0.35, 1) 8.95s both;
      will-change: transform;
    }

    .cn-char {
      display: inline-block;
      white-space: pre;
    }

    .prefix-char {
      flex: none;
      animation: prefix-char-in 0.26s cubic-bezier(0.16, 1, 0.3, 1) both;
      // 从右往左逐字落下：等品牌滑开、缩回正文尺寸后才开始，字追着它的轨迹落，中段不会挤压
      animation-delay: calc(9.52s + var(--i) * 0.05s);
    }

    .brand-char {
      flex: none;
      animation: brand-in 0.42s cubic-bezier(0.16, 1, 0.3, 1) both;
      animation-delay: calc(7.85s + var(--i) * 0.04s);
    }
  }
  .subtitle {
    width: 80%;
    margin-top: 0.9rem;
    font-size: 1.25rem;
    opacity: 0.8;
    animation: fade-up-opacity 0.6s 0.1s backwards;
  .text {
    text-align: center;
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 2; // WebKit 引擎兼容性
    -webkit-box-orient: vertical; // WebKit 引擎兼容性

    line-clamp: 2; // 标准的 line-clamp 属性，提高兼容性
  }
}
  .icon-up {
    font-size: 20px;
    position: absolute;
    bottom: 60px;
    left: calc(50% - 10px);
    transform: rotate(180deg);
    animation: moveDown 2s ease-in-out infinite;
    cursor: pointer;
  }
  // 手机端单独一套：
  // 十秒的编排（英文 → 胶囊 → Logo → 逐字落下）在 390px 宽度里英文只有 30px、
  // 中文 26px，字号层级被压平，Logo 的 1.3 倍放大和 3.5em 平移也几乎没有余量，
  // 看上去就是一团在动。这里直接去掉英文行与胶囊，只留中文欢迎语 + 一次 0.7s 的整体入场；
  // 字号改用 min() 跟视口联动，320~768 之间连续缩放，不再靠 2.4/1.6/1.45rem 跳档。
  @media (max-width: 768px) {
    align-items: center;
    height: 240px;
    .title-lockup {
      --cn-size: min(2.4rem, 6.8vw);
    }
    .title-py {
      display: none;
    }
    .title-cn {
      .cn-slide {
        transform: none;
        animation: title-cn-in 0.7s cubic-bezier(0.16, 1, 0.3, 1) both;
        will-change: auto;
      }
      .cn-brand {
        transform: none;
        animation: none;
        will-change: auto;
      }
      .prefix-char,
      .brand-char {
        animation: none;
      }
    }
    .subtitle {
      width: 100%;
      height: 50px;
      margin: 0.75rem 0 0;
      padding: 0 1.25rem;
      font-size: 1.125rem;
      .text {
        text-align: center;
      }
    }
  }
}
.banner-page {
  position: relative;
  display: flex;
  flex-direction: column;
  padding: 2rem;
  min-height: 380px;
  background-size: cover;
  .top {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 2rem;
    .title {
      display: flex;
      flex-direction: column;
      .title-small {
        color: var(--main-font-second-color);
        font-size: 0.875rem;
      }
      .title-big {
        font-size: 2.25rem;
        font-weight: bold;
        line-height: 1.2;
        margin-top: 12px;
      }
    }
  }
  .footer {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    margin-top: auto;
    .footer-left {
      margin-top: auto;
      color: var(--main-font-second-color);
      opacity: 0.8;
    }
  }
  &.image {
    color: #fff !important;
    .top {
      .title-small {
        color: #fff;
        opacity: 0.6;
      }
    }
    .footer {
      .footer-left {
        color: #fff;
      }
      :deep(.iconfont) {
        color: #fff !important;
      }
    }
  }
  @media (max-width: 1200px) {
    min-height: 300px;
  }
  @media (max-width: 768px) {
    min-height: 260px;
    .top-right,
    .footer-right {
      display: none;
    }
  }
}

/*
 * 首页标题动画时间线（--title-timeline: 9.4s）：
 * 0.00-1.26s 「Chiyu's Logbook」逐字浮入（整行从第一帧就按 Note 宽度占位）
 * 1.15-1.30s  胶囊按 Note 的脚印显形，一次性把整个 Log 收进去（尺寸此后不再改变）
 * 1.30-5.12s  胶囊内轮播 6 个图标；胶囊、book、整行位置全程不动
 * 5.20-5.50s  胶囊原地淡出，Note 同拍浮现（交叉溶解），没有静止遮盖期
 * 7.30-7.75s  整行英文向左滑出画面
 * 7.85-8.39s  「池鱼小栈」以 Logo 形态（1.3 倍）落到画面中心
 * 8.95-9.55s  整组 PPT 式平滑平移：品牌同步从 Logo 尺寸缩到正文尺寸
 * 9.52-10.08s 「你好，欢迎来到」等品牌落定后，从右往左逐字落下
 * 最终状态即基础样式：无 JS / prefers-reduced-motion 时直接呈现欢迎语。
 */
@keyframes py-char-in {
  0% {
    opacity: 0;
    filter: blur(7px);
    transform: translateY(0.5em) rotate(3deg);
  }
  100% {
    opacity: 1;
    filter: none;
    transform: translateY(0) rotate(0deg);
  }
}

@keyframes py-exit {
  0%,
  77.7% {
    transform: translateX(0);
  }
  82.4%,
  100% {
    transform: translateX(-180%);
  }
}

/* 胶囊显现/消退：图标期出现，遮盖与替换期间保持不动，最后在原地淡出 */
@keyframes capsule-in {
  0%,
  11.7% {
    opacity: 0;
    transform: translateY(-50%) scaleY(0.55);
  }
  13.8%,
  55.3% {
    opacity: 1;
    transform: translateY(-50%) scaleY(1);
  }
  58.5%,
  100% {
    opacity: 0;
    transform: translateY(-50%) scaleY(1);
  }
}

/* o 字形：胶囊出现后隐藏，不再还原；最后由 Note 自己的 o 接替 */
@keyframes glyph-hide {
  0%,
  12% {
    opacity: 1;
  }
  14%,
  100% {
    opacity: 0;
  }
}

/* 遮盖下 L / g 悄悄隐去 */
@keyframes log-fade {
  0% {
    opacity: 1;
  }
  100% {
    opacity: 0;
  }
}

/* 遮盖下 Note 现身 */
@keyframes note-in {
  0% {
    opacity: 0;
  }
  100% {
    opacity: 1;
  }
}

@keyframes capsule-hue {
  0% {
    filter: hue-rotate(0deg);
  }
  40% {
    filter: hue-rotate(20deg);
  }
  72% {
    filter: hue-rotate(52deg);
  }
  100% {
    filter: hue-rotate(0deg);
  }
}

@keyframes icon-pop {
  0% {
    opacity: 0;
    transform: scale(0.4) rotate(-12deg);
  }
  16%,
  84% {
    opacity: 1;
    transform: scale(1) rotate(0deg);
  }
  100% {
    opacity: 0;
    transform: scale(0.85) rotate(6deg);
  }
}

@keyframes brand-in {
  0% {
    opacity: 0;
    filter: blur(6px);
    transform: translateY(0.42em);
  }
  100% {
    opacity: 1;
    filter: none;
    transform: translateY(0);
  }
}

/* Logo 阶段保持放大，平移开始时同步缩回正文尺寸（与 slide-in 同时间同缓动） */
@keyframes brand-scale {
  0% {
    transform: scale(var(--logo-scale));
  }
  100% {
    transform: scale(1);
  }
}

/* PPT 式平移：Logo 独占中心 → 欢迎语末尾的最终位置 */
@keyframes slide-in {
  0% {
    transform: translateX(-3.5em);
  }
  100% {
    transform: translateX(0);
  }
}

/* 手机端：整组欢迎语一次淡入上浮，替代桌面端的三段编排 */
@keyframes title-cn-in {
  0% {
    opacity: 0;
    filter: blur(6px);
    transform: translateY(0.3em);
  }
  100% {
    opacity: 1;
    filter: none;
    transform: translateY(0);
  }
}

@keyframes prefix-char-in {
  0% {
    opacity: 0;
    filter: blur(5px);
    transform: translateY(-0.38em);
  }
  100% {
    opacity: 1;
    filter: none;
    transform: translateY(0);
  }
}

@media (prefers-reduced-motion: reduce) {
  .title-py,
  .title-py .py-char,
  .title-py .o-morph,
  .title-py .o-glyph,
  .title-py .o-capsule,
  .title-py .o-icon,
  .py-morph,
  .morph-log,
  .morph-note,
  .cn-slide,
  .cn-brand,
  .prefix-char,
  .brand-char,
  // 手机端的整体入场同样要能关掉（选择器比断点里的规则更具体）
  .banner .title-lockup .title-cn .cn-slide,
  .banner .title-lockup .title-cn .cn-brand {
    animation: none;
  }
}
</style>
