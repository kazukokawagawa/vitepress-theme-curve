<template>
  <!-- 配置了状态页 URL：点击跳转 -->
  <a
    v-if="statusPageUrl"
    class="system-status"
    :class="statusClass"
    :href="statusPageUrl"
    target="_blank"
    rel="noopener noreferrer"
    :title="`查看服务状态 - ${label}`"
  >
    <div class="status-dot-wrapper">
      <span
        v-if="!loading"
        class="status-dot-ping"
        :class="`ping--${status}`"
      />
      <span
        class="status-dot"
        :class="dotClass"
      />
    </div>

    <span class="status-label">
      {{ loading ? 'Checking...' : label }}
    </span>
  </a>

  <!-- 未配置状态页 URL：点击刷新 -->
  <div
    v-else
    class="system-status"
    :class="statusClass"
    title="点击刷新状态"
    @click="handleRefresh"
  >
    <div class="status-dot-wrapper">
      <span
        v-if="!loading"
        class="status-dot-ping"
        :class="`ping--${status}`"
      />
      <span
        class="status-dot"
        :class="dotClass"
      />
    </div>

    <span class="status-label">
      {{ loading ? 'Checking...' : label }}
    </span>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useData } from 'vitepress';

// 获取状态页 URL
// 通过 useData 获取 theme 配置，假设配置在该处，或者直接使用 env
// VitePress 注入
// 这里为了简单，如果有 public配置可以尝试获取，否则依靠构建时注入或硬编码
// 用户原始代码是 Nuxt，这里适配 VitePress
const { theme } = useData();
// 尝试从 themeConfig 获取，或者 import.meta.env
const statusPageUrl = import.meta.env.VITE_BETTER_STACK_STATUS_PAGE_URL || "";

// 定义 API 返回类型
interface StatusResponse {
  status: "operational" | "degraded" | "partial" | "major" | "maintenance" | "error" | "unknown";
  label: string;
  updatedAt: string | null;
}

// 用于强制刷新的时间戳
const refreshKey = ref(Date.now());
const data = ref<StatusResponse | null>(null);
const pending = ref(true);
const error = ref(false);

const fetchData = async () => {
    pending.value = true;
    error.value = false;
    try {
        const res = await fetch(`/api/status?t=${refreshKey.value}`);
        if (!res.ok) throw new Error('Network response was not ok');
        data.value = await res.json();
    } catch (e) {
        console.error(e);
        error.value = true;
    } finally {
        pending.value = false;
    }
}

// 初始加载
onMounted(() => {
    fetchData();
});

// 计算属性：处理加载状态和错误状态
const loading = computed(() => pending.value);

// 提取状态核心字段
const status = computed(() => {
  if (error.value) return "error";
  return data.value?.status || "unknown";
});

const label = computed(() => data.value?.label || "Unknown");

// 动态样式类
const statusClass = computed(() => {
  if (loading.value) return "status--loading";
  return `status--${status.value}`;
});

const dotClass = computed(() => {
  if (loading.value) return "dot--loading";
  return `dot--${status.value}`;
});

// 限流：5秒内最多3次
const clickTimestamps = ref<number[]>([]);
const RATE_LIMIT_WINDOW = 5000; // 5秒
const RATE_LIMIT_MAX = 3; // 最多3次

// 点击刷新（仅在未配置状态页时生效）
const handleRefresh = () => {
  if (loading.value) return;

  const now = Date.now();

  // 清理超过5秒的记录
  clickTimestamps.value = clickTimestamps.value.filter(
    ts => now - ts < RATE_LIMIT_WINDOW,
  );

  // 检查是否超过限制
  if (clickTimestamps.value.length >= RATE_LIMIT_MAX) {
    return; // 已达到限制，不执行刷新
  }

  // 记录本次点击
  clickTimestamps.value.push(now);

  // 更新 refreshKey 触发强制刷新
  refreshKey.value = now;
  fetchData();
};
</script>

<style lang="scss" scoped>
.system-status {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 20px;
  background: var(--main-card-second-background);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
  user-select: none;
  font-size: 13px;
  text-decoration: none;
  color: var(--main-font-color);
  line-height: 1.5;

  &:hover {
    background: var(--main-card-border);
    transform: translateY(-1px);
  }

  &:active {
    background: var(--main-border-shadow);
    transform: translateY(0);
  }

  // 服务正常 - 绿色
  &.status--operational {
    background: var(--main-success-color-gray);
    color: var(--main-success-color);

    &:hover {
      background: var(--main-success-color);
      color: #fff;
    }
  }

  // 性能下降 - 黄色
  &.status--degraded {
    background: var(--main-warning-color-gray);
    color: var(--main-warning-color);

    &:hover {
      background: var(--main-warning-color);
      color: #fff;
    }
  }

  // 部分问题 - 黄色
  &.status--partial {
    background: var(--main-warning-color-gray);
    color: var(--main-warning-color);

    &:hover {
      background: var(--main-warning-color);
      color: #fff;
    }
  }

  // 重大事故 - 红色
  &.status--major {
    background: var(--main-error-color-gray);
    color: var(--main-error-color);

    &:hover {
      background: var(--main-error-color);
      color: #fff;
    }
  }

  // 正在检修 - 蓝色
  &.status--maintenance {
    background: var(--main-info-color-gray);
    color: var(--main-info-color);

    &:hover {
      background: var(--main-info-color);
      color: #fff;
    }
  }

  // 错误/未知状态 - 灰色
  &.status--error,
  &.status--unknown {
    background: var(--main-card-second-background);
    color: var(--main-font-second-color);

    &:hover {
      background: var(--main-card-border);
    }
  }
}

.status-dot-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 8px;
  width: 8px;
  margin: 0 4px;
  overflow: visible;
}

.status-dot-ping {
  position: absolute;
  top: 0;
  left: 0;
  height: 8px;
  width: 8px;
  border-radius: 50%;
  transform-origin: center;
  animation: status-ping 1.5s ease-out infinite;

  &.ping--operational { background-color: var(--main-success-color); }
  &.ping--degraded { background-color: var(--main-warning-color); }
  &.ping--partial { background-color: var(--main-warning-color); }
  &.ping--major { background-color: var(--main-error-color); }
  &.ping--maintenance { background-color: var(--main-info-color); }
  &.ping--error, &.ping--unknown { background-color: var(--main-font-second-color); }
}

.status-dot {
  position: relative;
  display: inline-flex;
  border-radius: 50%;
  height: 8px;
  width: 8px;
  transition: background-color 0.3s ease;

  &.dot--loading {
    background-color: var(--main-font-second-color);
    animation: status-pulse 1.2s ease-in-out infinite;
  }

  &.dot--operational { background-color: var(--main-success-color); }
  &.dot--degraded { background-color: var(--main-warning-color); }
  &.dot--partial { background-color: var(--main-warning-color); }
  &.dot--major { background-color: var(--main-error-color); }
  &.dot--maintenance { background-color: var(--main-info-color); }
  &.dot--error, &.dot--unknown { background-color: var(--main-font-second-color); }
}

.status-label {
  font-weight: 500;
  letter-spacing: 0.02em;
  transition: color 0.3s ease;
  white-space: nowrap;
  // inherit color from parent which handles overrides
  color: inherit;
}

@keyframes status-ping {
  0% {
    transform: scale(1);
    opacity: 0.75;
  }
  100% {
    transform: scale(2);
    opacity: 0;
  }
}

@keyframes status-pulse {
  0%,
  100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.5;
    transform: scale(0.85);
  }
}
</style>
