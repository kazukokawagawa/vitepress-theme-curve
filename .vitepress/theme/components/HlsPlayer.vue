<template>
  <div ref="container">
    <video 
      ref="video" 
      :poster="poster" 
      controls 
      style="width: 100%; max-width: 800px; border-radius: 8px;"
      :autoplay="autoplay"
      :muted="muted"
      :loop="loop"
    ></video>
  </div>
</template>

<script setup>

// 定义组件属性
const props = defineProps({
  src: { type: String, required: true },       // HLS 播放地址
  poster: { type: String, default: '' },       // 视频封面
  autoplay: { type: Boolean, default: false }, // 是否自动播放
  muted: { type: Boolean, default: false },    // 是否静音
  loop: { type: Boolean, default: false }      // 是否循环播放
})

const container = ref(null)
const video = ref(null)
let observer = null
// hls.js 实例必须由组件持有：它内部有 loader / 定时器 / 事件监听，
// 局部常量会让它在组件卸载后无法 destroy（SPA 路由切换即泄漏）。
let hls = null

// 全局缓存 HLS.js 加载 Promise，避免重复加载
let hlsJsLoader = null

function loadHlsJsOnce() {
  if (window.Hls) return Promise.resolve(window.Hls)
  if (hlsJsLoader) return hlsJsLoader

  hlsJsLoader = new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.src = 'https://cdn.jsdmirror.com/npm/hls.js@latest'
    script.onload = () => resolve(window.Hls)
    script.onerror = reject
    document.head.appendChild(script)
  })

  return hlsJsLoader
}

async function initPlayer() {
  if (!video.value) return

  // 设置视频元素属性
  video.value.muted = props.muted
  video.value.loop = props.loop

  // Safari 原生支持 HLS
  if (video.value.canPlayType('application/vnd.apple.mpegurl')) {
    video.value.src = props.src
  } else {
    // 动态加载 HLS.js，仅加载一次
    const Hls = await loadHlsJsOnce()
    if (Hls.isSupported()) {
      hls = new Hls()
      hls.loadSource(props.src)
      hls.attachMedia(video.value)
    } else {
      console.warn('当前浏览器不支持 HLS.js 播放')
    }
  }

  // 尝试自动播放
  if (props.autoplay) {
    video.value.play().catch(() => {
      console.log('⚠️ 自动播放被浏览器阻止，需要用户交互')
    })
  }
}

onMounted(() => {
  if (!('IntersectionObserver' in window)) {
    // initPlayer 是 async：不接错误处理会在 HLS.js 加载失败时产生未处理的 rejection
    initPlayer().catch((error) => console.error('HLS 播放器初始化失败：', error))
    return
  }
  observer = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (entry.isIntersecting) {
        initPlayer().catch((error) => console.error('HLS 播放器初始化失败：', error))
        observer.disconnect()
        break
      }
    }
  }, { rootMargin: '100px' })
  if (container.value) observer.observe(container.value)
})

onBeforeUnmount(() => {
  if (observer) observer.disconnect()
  // 释放 hls.js 实例（loader / 定时器 / 媒体源），并清掉 video 的 src
  if (hls) {
    hls.destroy()
    hls = null
  }
  if (video.value) {
    video.value.pause()
    video.value.removeAttribute('src')
  }
})
</script>