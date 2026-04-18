<!-- 文章内嵌音乐播放器 -->
<template>
  <div
    ref="containerRef"
    :class="['music-player', { playing: isPlaying, expanded: showPlaylist && playlist.length > 1, 'with-lyrics': hasLyrics }]"
  >
    <!-- 主播放器 -->
    <div class="player-main">
      <!-- 封面 -->
      <div class="cover-wrapper" @click="togglePlay">
        <div class="cover-spin">
          <img
            v-if="currentTrack.cover || embeddedCover"
            :src="currentTrack.cover || embeddedCover"
            :alt="currentTrack.title"
            class="cover-img"
          />
          <div v-else class="cover-placeholder">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M9 18V5l12-2v13" stroke-linecap="round" stroke-linejoin="round"/>
              <circle cx="6" cy="18" r="3"/>
              <circle cx="18" cy="16" r="3"/>
            </svg>
          </div>
        </div>
        <!-- 播放/暂停覆盖层 -->
        <div class="cover-overlay">
          <svg v-if="!isPlaying" viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
            <path d="M8 5v14l11-7z"/>
          </svg>
          <svg v-else viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
            <path d="M6 4h4v16H6zM14 4h4v16h-4z"/>
          </svg>
        </div>
      </div>

      <!-- 信息区域 -->
      <div class="info-section" :class="{ 'has-lyrics': hasLyrics }">
        <!-- 头部信息 -->
        <div class="info-header">
          <div class="track-info">
            <span class="track-title">{{ currentTrack.title || '未知曲目' }}</span>
            <span class="track-artist">{{ currentTrack.artist || '未知艺术家' }}</span>
          </div>
        </div>

        <!-- 歌词区间 -->
        <div class="lyrics-display" v-if="hasLyrics">
          <transition name="lyric-fade" mode="out-in">
            <div :key="currentLyricKey" class="lyric-lines">
              <div v-for="(line, idx) in currentLyricLines" :key="idx" class="lyric-line">{{ line }}</div>
            </div>
          </transition>
        </div>

        <div class="bottom-controls">
          <!-- 独立进度条（无歌词时显示） -->
          <div class="progress-wrapper" v-if="!hasLyrics">
            <div
              class="progress-bar"
              ref="progressRef"
              @mousedown="onProgressMouseDown"
              @touchstart.prevent="onProgressTouchStart"
            >
              <div class="progress-buffered" :style="{ width: bufferedPercent + '%' }"></div>
              <div class="progress-played" :style="{ width: progressPercent + '%' }">
                <div class="progress-thumb"></div>
              </div>
            </div>
            <div class="time-display">
              <span>{{ formatTime(currentTime) }}</span>
              <span>{{ formatTime(duration) }}</span>
            </div>
          </div>

          <!-- 控制栏 -->
          <div class="controls">
            <div class="controls-left">
              <!-- 上一首 -->
              <button
                v-if="playlist.length > 1"
                class="ctrl-btn"
                @click="prevTrack"
                title="上一首"
              >
                <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
                  <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/>
                </svg>
              </button>

              <!-- 播放/暂停 -->
              <button class="ctrl-btn play-btn" @click="togglePlay" title="播放/暂停">
                <svg v-if="!isPlaying" viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                  <path d="M8 5v14l11-7z"/>
                </svg>
                <svg v-else viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                  <path d="M6 4h4v16H6zM14 4h4v16h-4z"/>
                </svg>
              </button>

              <!-- 下一首 -->
              <button
                v-if="playlist.length > 1"
                class="ctrl-btn"
                @click="nextTrack"
                title="下一首"
              >
                <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
                  <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/>
                </svg>
              </button>
            </div>

            <!-- 内联进度条（有歌词时显示） -->
            <div class="inline-progress" v-if="hasLyrics">
              <span class="inline-time">{{ formatTime(currentTime) }}</span>
              <div
                class="progress-bar"
                ref="progressRef"
                @mousedown="onProgressMouseDown"
                @touchstart.prevent="onProgressTouchStart"
              >
                <div class="progress-buffered" :style="{ width: bufferedPercent + '%' }"></div>
                <div class="progress-played" :style="{ width: progressPercent + '%' }">
                  <div class="progress-thumb"></div>
                </div>
              </div>
              <span class="inline-time">{{ formatTime(duration) }}</span>
            </div>

            <div class="controls-right">
              <!-- 音量 -->
              <div class="volume-wrapper">
                <button class="ctrl-btn" @click="toggleMute" title="音量">
                  <svg v-if="volume === 0" viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
                    <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/>
                  </svg>
                  <svg v-else-if="volume < 0.5" viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
                    <path d="M18.5 12c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM5 9v6h4l5 5V4L9 9H5z"/>
                  </svg>
                  <svg v-else viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
                    <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
                  </svg>
                </button>
                <div class="volume-slider-wrap">
                  <input
                    type="range"
                    class="volume-slider"
                    min="0"
                    max="1"
                    step="0.01"
                    :value="volume"
                    @input="onVolumeChange"
                  />
                </div>
              </div>

              <!-- 播放列表切换 -->
              <button
                v-if="playlist.length > 1"
                class="ctrl-btn"
                :class="{ active: showPlaylist }"
                @click="showPlaylist = !showPlaylist"
                title="播放列表"
              >
                <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
                  <path d="M15 6H3v2h12V6zm0 4H3v2h12v-2zM3 16h8v-2H3v2zM17 6v8.18c-.31-.11-.65-.18-1-.18-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3V8h3V6h-5z"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 播放列表 -->
    <transition name="playlist-slide">
      <div v-if="showPlaylist && playlist.length > 1" class="playlist">
        <div class="playlist-header">
          <span>播放列表</span>
          <span class="playlist-count">{{ playlist.length }} 首</span>
        </div>
        <div class="playlist-items">
          <div
            v-for="(track, index) in playlist"
            :key="index"
            :class="['playlist-item', { active: currentIndex === index }]"
            @click="playTrack(index)"
          >
            <div class="playlist-item-index">
              <span v-if="currentIndex !== index">{{ index + 1 }}</span>
              <svg v-else viewBox="0 0 24 24" fill="currentColor" width="14" height="14" class="playing-icon">
                <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
              </svg>
            </div>
            <div class="playlist-item-info">
              <span class="playlist-item-title">{{ track.title || '未知曲目' }}</span>
              <span class="playlist-item-artist">{{ track.artist || '未知艺术家' }}</span>
            </div>
          </div>
        </div>
      </div>
    </transition>

    <!-- 隐藏的 audio 元素 -->
    <audio
      ref="audioRef"
      :src="currentTrack.src"
      preload="metadata"
      @timeupdate="onTimeUpdate"
      @loadedmetadata="onLoadedMetadata"
      @durationchange="onDurationChange"
      @ended="onEnded"
      @progress="onProgress"
      @play="isPlaying = true"
      @pause="isPlaying = false"
    ></audio>
  </div>
</template>

<script setup>
// Props
const props = defineProps({
  // 单曲模式
  src: { type: String, default: '' },
  title: { type: String, default: '' },
  artist: { type: String, default: '' },
  cover: { type: String, default: '' },
  lrc: { type: String, default: '' },
  // 列表模式
  list: {
    type: Array,
    default: () => [],
    // 列表项格式: { src, title, artist, cover, lrc }
  },
  // 是否自动播放
  autoplay: { type: Boolean, default: false },
});

// 状态
const audioRef = ref(null);
const progressRef = ref(null);
const containerRef = ref(null);
const isPlaying = ref(false);
const currentTime = ref(0);
const duration = ref(0);
const volume = ref(0.8);
const previousVolume = ref(0.8);
const bufferedPercent = ref(0);
const currentIndex = ref(0);
const showPlaylist = ref(false);
const isDragging = ref(false);
const embeddedCover = ref('');
const parsedLyrics = ref([]);
const currentLyricLines = ref([]);
const currentLyricKey = ref('');

// 解析 LRC 文本
const parseLrc = (text) => {
  if (!text) return [];
  const lines = text.split('\n');
  const result = [];
  const timeMap = new Map();
  const timeExp = /\[(\d{2,}):(\d{2})(?:\.(\d{2,3}))?\]/g;
  
  for (const line of lines) {
    const matches = [...line.matchAll(timeExp)];
    if (matches.length > 0) {
      const content = line.replace(timeExp, '').trim();
      if (content) {
        for (const match of matches) {
          let time = 0;
          time += parseInt(match[1], 10) * 60;
          time += parseInt(match[2], 10);
          time += match[3] ? parseInt(match[3], 10) / (match[3].length === 3 ? 1000 : 100) : 0;
          
          if (!timeMap.has(time)) {
            timeMap.set(time, []);
          }
          timeMap.get(time).push(content);
        }
      }
    }
  }
  for (const [time, textLines] of timeMap.entries()) {
    result.push({ time, lines: textLines });
  }
  result.sort((a, b) => a.time - b.time);
  return result;
};

// 加载歌词
const loadLyrics = async (lrc) => {
  parsedLyrics.value = [];
  currentLyricLines.value = [];
  currentLyricKey.value = '';
  if (!lrc) return;
  
  if (lrc.startsWith('http') || lrc.startsWith('/')) {
    try {
      const res = await fetch(lrc);
      if (res.ok) {
        const text = await res.text();
        parsedLyrics.value = parseLrc(text);
      }
    } catch (e) {
      console.warn('Failed to load lyrics', e);
    }
  } else {
    parsedLyrics.value = parseLrc(lrc);
  }
};

// 加载音频内嵌封面
const loadEmbeddedCover = async (src) => {
  embeddedCover.value = '';
  if (!src || typeof window === 'undefined') return;
  
  try {
    let jsmediatagsMod = await import('jsmediatags/dist/jsmediatags.min.js');
    const jsmediatags = jsmediatagsMod.default || jsmediatagsMod || window.jsmediatags;
    if (!jsmediatags || !jsmediatags.read) return;
    
    jsmediatags.read(src, {
      onSuccess: (tag) => {
        const picture = tag.tags.picture;
        if (picture) {
          let base64String = "";
          for (let i = 0; i < picture.data.length; i++) {
            base64String += String.fromCharCode(picture.data[i]);
          }
          embeddedCover.value = "data:" + picture.format + ";base64," + window.btoa(base64String);
        }
      },
      onError: (error) => {
        // ignore errors
      }
    });
  } catch (err) {
    // ignore errors
  }
};

// 播放列表
const playlist = computed(() => {
  if (props.list && props.list.length > 0) {
    return props.list;
  }
  if (props.src) {
    return [{ src: props.src, title: props.title, artist: props.artist, cover: props.cover }];
  }
  return [];
});

// 当前曲目
const currentTrack = computed(() => {
  return playlist.value[currentIndex.value] || { src: '', title: '', artist: '', cover: '' };
});

// 是否有歌词
const hasLyrics = computed(() => parsedLyrics.value.length > 0);

watch(() => currentTrack.value.src, (newSrc) => {
  if (newSrc && !currentTrack.value.cover) {
    loadEmbeddedCover(newSrc);
  } else {
    embeddedCover.value = '';
  }
}, { immediate: true });

// 单独监听歌词变化
watch(() => currentTrack.value?.lrc, (newLrc) => {
  loadLyrics(newLrc);
}, { immediate: true });

watch(currentTime, (newTime) => {
  if (parsedLyrics.value.length === 0) return;
  let activeLines = [];
  let activeKey = '';
  for (let i = 0; i < parsedLyrics.value.length; i++) {
    if (newTime >= parsedLyrics.value[i].time) {
      activeLines = parsedLyrics.value[i].lines;
      activeKey = String(parsedLyrics.value[i].time);
    } else {
      break;
    }
  }
  if (currentLyricKey.value !== activeKey) {
    currentLyricLines.value = activeLines;
    currentLyricKey.value = activeKey;
  }
});

// 进度百分比
const progressPercent = computed(() => {
  if (!duration.value) return 0;
  return (currentTime.value / duration.value) * 100;
});

// 格式化时间
const formatTime = (seconds) => {
  if (!seconds || isNaN(seconds)) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

// 播放控制
const togglePlay = () => {
  if (!audioRef.value) return;
  if (isPlaying.value) {
    audioRef.value.pause();
  } else {
    audioRef.value.play().catch(() => {
    });
  }
};

const playTrack = (index) => {
  currentIndex.value = index;
  nextTick(() => {
    if (audioRef.value) {
      audioRef.value.load();
      audioRef.value.play().catch(() => {});
    }
  });
};

const prevTrack = () => {
  if (playlist.value.length <= 1) return;
  currentIndex.value = (currentIndex.value - 1 + playlist.value.length) % playlist.value.length;
  nextTick(() => {
    if (audioRef.value) {
      audioRef.value.load();
      audioRef.value.play().catch(() => {});
    }
  });
};

const nextTrack = () => {
  if (playlist.value.length <= 1) return;
  currentIndex.value = (currentIndex.value + 1) % playlist.value.length;
  nextTick(() => {
    if (audioRef.value) {
      audioRef.value.load();
      audioRef.value.play().catch(() => {});
    }
  });
};

// 音量
const toggleMute = () => {
  if (volume.value > 0) {
    previousVolume.value = volume.value;
    volume.value = 0;
  } else {
    volume.value = previousVolume.value || 0.8;
  }
  if (audioRef.value) audioRef.value.volume = volume.value;
};

const onVolumeChange = (e) => {
  volume.value = parseFloat(e.target.value);
  if (audioRef.value) audioRef.value.volume = volume.value;
};

// 进度条拖拽
const seekTo = (clientX) => {
  if (!progressRef.value || !audioRef.value || !duration.value) return;
  const rect = progressRef.value.getBoundingClientRect();
  const percent = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
  audioRef.value.currentTime = percent * duration.value;
  currentTime.value = audioRef.value.currentTime;
};

const onProgressMouseDown = (e) => {
  isDragging.value = true;
  seekTo(e.clientX);
  const onMouseMove = (e) => seekTo(e.clientX);
  const onMouseUp = () => {
    isDragging.value = false;
    document.removeEventListener('mousemove', onMouseMove);
    document.removeEventListener('mouseup', onMouseUp);
  };
  document.addEventListener('mousemove', onMouseMove);
  document.addEventListener('mouseup', onMouseUp);
};

const onProgressTouchStart = (e) => {
  isDragging.value = true;
  seekTo(e.touches[0].clientX);
  const onTouchMove = (e) => seekTo(e.touches[0].clientX);
  const onTouchEnd = () => {
    isDragging.value = false;
    document.removeEventListener('touchmove', onTouchMove);
    document.removeEventListener('touchend', onTouchEnd);
  };
  document.addEventListener('touchmove', onTouchMove);
  document.addEventListener('touchend', onTouchEnd);
};

// Audio 事件
const onTimeUpdate = () => {
  if (!isDragging.value && audioRef.value) {
    currentTime.value = audioRef.value.currentTime;
    if (audioRef.value.duration && !isNaN(audioRef.value.duration) && audioRef.value.duration !== Infinity && audioRef.value.duration !== duration.value) {
      duration.value = audioRef.value.duration;
    }
  }
};

const onLoadedMetadata = () => {
  if (audioRef.value) {
    if (audioRef.value.duration && !isNaN(audioRef.value.duration) && audioRef.value.duration !== Infinity) {
      duration.value = audioRef.value.duration;
    }
    audioRef.value.volume = volume.value;
  }
};

const onDurationChange = () => {
  if (audioRef.value && !isNaN(audioRef.value.duration) && audioRef.value.duration !== Infinity) {
    duration.value = audioRef.value.duration;
  }
};

const onEnded = () => {
  if (playlist.value.length > 1) {
    nextTrack();
  } else {
    isPlaying.value = false;
    currentTime.value = 0;
  }
};

const onProgress = () => {
  if (audioRef.value && audioRef.value.buffered.length > 0) {
    const buffered = audioRef.value.buffered.end(audioRef.value.buffered.length - 1);
    bufferedPercent.value = (buffered / duration.value) * 100;
  }
};

// 懒加载：进入可视区域时才预加载
let observer = null;
onMounted(() => {
  if (!('IntersectionObserver' in window)) return;
  observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting && audioRef.value) {
          audioRef.value.preload = 'metadata';
          if (props.autoplay) {
            audioRef.value.play().catch(() => {});
          }
          observer.disconnect();
          break;
        }
      }
    },
    { rootMargin: '100px' }
  );
  if (containerRef.value) observer.observe(containerRef.value);
});

onBeforeUnmount(() => {
  if (observer) observer.disconnect();
  if (audioRef.value) {
    audioRef.value.pause();
    audioRef.value.src = '';
  }
});
</script>

<style lang="scss" scoped>
.music-player {
  position: relative;
  width: 100%;
  max-width: 520px;
  margin: 1.5rem 0;
  border-radius: 16px;
  background-color: var(--main-card-background);
  border: 1px solid var(--main-card-border);
  box-shadow: 0 8px 24px -4px var(--main-border-shadow);
  overflow: hidden;
  font-family: var(--main-font-family);
  transition: all 0.3s ease;
  user-select: none;

  &:hover {
    border-color: var(--main-color);
    box-shadow: 0 12px 32px -4px var(--main-color-bg);
  }

  // 主播放区
  .player-main {
    display: flex;
    flex-direction: row;
    align-items: center;
    padding: 24px;
    gap: 20px;
  }

  // 有歌词时撑开高度
  &.with-lyrics .player-main {
    align-items: stretch;
    min-height: 160px;
  }

  // 封面
  .cover-wrapper {
    position: relative;
    flex-shrink: 0;
    width: 96px;
    height: 96px;
    border-radius: 14px;
    overflow: hidden;
    cursor: pointer;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);

    .cover-spin {
      width: 100%;
      height: 100%;
      border-radius: 12px;
      overflow: hidden;
    }

    .cover-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
    }

    .cover-placeholder {
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, var(--main-color) 0%, var(--main-card-border) 100%);
      color: var(--main-card-background);
      padding: 20px;

      svg {
        width: 100%;
        height: 100%;
        opacity: 0.7;
      }
    }

    .cover-overlay {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(0, 0, 0, 0.35);
      backdrop-filter: blur(2px);
      color: #fff;
      opacity: 0;
      transition: opacity 0.25s ease;
    }

    &:hover .cover-overlay {
      opacity: 1;
    }
  }

  // 信息区域
  .info-section {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: 12px;

    &.has-lyrics {
      justify-content: space-between;

      .lyrics-display {
        flex: 1;
      }

      .bottom-controls {
        gap: 0;
      }
    }
  }

  .info-header {
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .track-info {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    gap: 4px;
    min-width: 0;

    .track-title {
      font-size: 16px;
      font-weight: 700;
      color: var(--main-font-color);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      line-height: 1.3;
    }

    .track-artist {
      font-size: 13px;
      font-weight: 500;
      color: var(--main-font-color);
      opacity: 0.7;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      line-height: 1.2;
    }
  }

  .bottom-controls {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  // 进度条
  .progress-wrapper {
    display: flex;
    flex-direction: column;
    width: 100%;
  }

  .progress-bar {
    position: relative;
    width: 100%;
    height: 4px;
    border-radius: 4px;
    background-color: var(--main-card-border);
    cursor: pointer;
    transition: height 0.15s ease;

    &:hover {
      height: 6px;

      .progress-thumb {
        opacity: 1;
        transform: scale(1);
      }
    }

    .progress-buffered {
      position: absolute;
      top: 0;
      left: 0;
      height: 100%;
      border-radius: 4px;
      background-color: var(--main-card-border);
      opacity: 0.6;
      transition: width 0.3s;
    }

    .progress-played {
      position: absolute;
      top: 0;
      left: 0;
      height: 100%;
      border-radius: 4px;
      background: linear-gradient(90deg, var(--main-color), var(--main-color));
      transition: width 0.1s linear;

      .progress-thumb {
        position: absolute;
        right: -5px;
        top: 50%;
        transform: translateY(-50%) scale(0);
        width: 12px;
        height: 12px;
        border-radius: 50%;
        background-color: var(--main-color);
        box-shadow: 0 0 4px rgba(0, 0, 0, 0.2);
        opacity: 0;
        transition: opacity 0.15s, transform 0.15s;
      }
    }
  }

  .time-display {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 11px;
    color: var(--main-font-second-color);
    font-variant-numeric: tabular-nums;
    font-weight: 500;
    white-space: nowrap;
    opacity: 0.8;
    margin-top: 4px;
  }

  // 控制栏
  .controls {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-top: 2px;
  }

  // 内联进度条（有歌词时）
  .inline-progress {
    flex: 1;
    display: flex;
    align-items: center;
    gap: 8px;
    margin: 0 12px;
    min-width: 0;

    .inline-time {
      font-size: 11px;
      color: var(--main-font-second-color);
      font-variant-numeric: tabular-nums;
      font-weight: 500;
      white-space: nowrap;
      opacity: 0.8;
    }

    .progress-bar {
      flex: 1;
      min-width: 0;
    }
  }



  .lyrics-display {
    position: relative;
    text-align: center;
    font-size: 14px;
    color: var(--main-font-color);
    overflow: hidden;
    min-height: 38px;
    display: flex;
    align-items: center;
    justify-content: center;

    .lyric-lines {
      width: 100%;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 4px;
    }

    .lyric-line {
      width: 100%;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      opacity: 0.95;
      line-height: 1.3;
      font-weight: 600;
      
      &:nth-child(2) {
        font-size: 12px;
        opacity: 0.7;
        font-weight: 400;
      }
    }
  }

  // 动画
  .lyric-fade-enter-active,
  .lyric-fade-leave-active {
    transition: all 0.3s cubic-bezier(0.2, 0, 0, 1);
  }
  
  .lyric-fade-enter-from {
    opacity: 0;
    transform: translateY(6px);
  }
  
  .lyric-fade-leave-to {
    opacity: 0;
    transform: translateY(-6px);
  }

  .controls-left,
  .controls-right {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-shrink: 0;
  }

  .ctrl-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 30px;
    height: 30px;
    padding: 0;
    border: none;
    border-radius: 8px;
    background: transparent;
    color: var(--main-font-color);
    cursor: pointer;
    transition: all 0.2s ease;
    outline: none;
    font-family: var(--main-font-family);

    &:hover {
      background-color: var(--main-mask-Inverse-background);
      color: var(--main-color);
    }

    &:active {
      transform: scale(0.92);
    }

    &.active {
      color: var(--main-color);
      background-color: var(--main-color-bg);
    }

    &.play-btn {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      background-color: var(--main-color);
      color: var(--main-card-background);

      &:hover {
        background-color: var(--main-color);
        opacity: 0.9;
        color: var(--main-card-background);
        transform: scale(1.08);
      }

      &:active {
        transform: scale(0.95);
      }
    }
  }

  // 音量
  .volume-wrapper {
    display: flex;
    align-items: center;
    gap: 2px;

    .volume-slider-wrap {
      width: 0;
      overflow: hidden;
      transition: width 0.25s ease;
    }

    &:hover .volume-slider-wrap {
      width: 70px;
    }

    .volume-slider {
      -webkit-appearance: none;
      appearance: none;
      width: 64px;
      height: 4px;
      border-radius: 4px;
      background: var(--main-card-border);
      outline: none;
      cursor: pointer;
      margin: 0 3px;

      &::-webkit-slider-thumb {
        -webkit-appearance: none;
        appearance: none;
        width: 12px;
        height: 12px;
        border-radius: 50%;
        background: var(--main-color);
        cursor: pointer;
        transition: transform 0.15s;

        &:hover {
          transform: scale(1.2);
        }
      }

      &::-moz-range-thumb {
        width: 12px;
        height: 12px;
        border: none;
        border-radius: 50%;
        background: var(--main-color);
        cursor: pointer;
      }
    }
  }

  // 播放列表
  .playlist {
    border-top: 1px solid var(--main-card-border);

    .playlist-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 10px 16px 6px;
      font-size: 13px;
      font-weight: 600;
      color: var(--main-font-color);

      .playlist-count {
        font-size: 12px;
        font-weight: 400;
        color: var(--main-font-second-color);
      }
    }

    .playlist-items {
      max-height: 200px;
      overflow-y: auto;
      padding-bottom: 8px;
    }

    .playlist-item {
      display: flex;
      flex-direction: row;
      align-items: center;
      padding: 8px 16px;
      gap: 12px;
      cursor: pointer;
      transition: background-color 0.2s;

      &:hover {
        background-color: var(--main-mask-Inverse-background);
      }

      &.active {
        .playlist-item-index {
          color: var(--main-color);
        }
        .playlist-item-title {
          color: var(--main-color);
          font-weight: 600;
        }
      }

      .playlist-item-index {
        flex-shrink: 0;
        width: 20px;
        font-size: 12px;
        color: var(--main-font-second-color);
        text-align: center;

        .playing-icon {
          animation: pulse-icon 1.5s ease-in-out infinite;
        }
      }

      .playlist-item-info {
        flex: 1;
        min-width: 0;
        display: flex;
        flex-direction: column;
        gap: 1px;

        .playlist-item-title {
          font-size: 13px;
          color: var(--main-font-color);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          line-height: 1.4;
          transition: color 0.2s;
        }

        .playlist-item-artist {
          font-size: 11px;
          color: var(--main-font-second-color);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          line-height: 1.3;
        }
      }
    }
  }

  // playing 状态的微调
  &.playing {
    .cover-wrapper {
      box-shadow: 0 4px 16px var(--main-color-bg);
    }
  }
}

// 播放列表展开动画
.playlist-slide-enter-active,
.playlist-slide-leave-active {
  transition: all 0.3s ease;
  max-height: 300px;
  overflow: hidden;
}

.playlist-slide-enter-from,
.playlist-slide-leave-to {
  max-height: 0;
  opacity: 0;
}

// 封面旋转
@keyframes cover-rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

// 播放图标脉冲
@keyframes pulse-icon {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.4;
  }
}

// 移动端适配
@media (max-width: 480px) {
  .music-player {
    max-width: 100%;

    .player-main {
      padding: 12px;
      gap: 12px;
    }

    .cover-wrapper {
      width: 64px;
      height: 64px;
    }

    .track-info .track-title {
      font-size: 14px;
    }

    .controls-right .volume-wrapper {
      display: none;
    }
  }
}
</style>
