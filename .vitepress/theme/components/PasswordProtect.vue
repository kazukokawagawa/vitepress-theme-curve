<!-- 文章密码保护组件 -->
<template>
  <div class="password-protect s-card">
    <div class="protect-icon">
      <span class="lock-emoji">🔒</span>
    </div>
    <h3 class="protect-title">此文章已加密</h3>
    <p class="protect-desc">请输入密码以查看完整内容</p>
    <div class="protect-input-wrapper">
      <input
        v-model="inputPassword"
        type="password"
        class="protect-input"
        placeholder="请输入密码"
        @keyup.enter="verifyPassword"
      />
      <button class="protect-btn" @click="verifyPassword">
        <span class="unlock-emoji">🔓</span>
        解锁
      </button>
    </div>
    <p v-if="errorMessage" class="protect-error">{{ errorMessage }}</p>
  </div>
</template>

<script setup>
const props = defineProps({
  password: {
    type: String,
    required: true,
  },
  postId: {
    type: String,
    required: true,
  },
});

const emit = defineEmits(["unlocked"]);

const inputPassword = ref("");
const errorMessage = ref("");

// 检查是否已解锁
const checkUnlocked = () => {
  if (typeof window === "undefined") return false;
  const unlockedPosts = JSON.parse(localStorage.getItem("unlockedPosts") || "{}");
  return unlockedPosts[props.postId] === true;
};

// 验证密码
const verifyPassword = () => {
  errorMessage.value = "";
  // 将密码转为字符串比较，因为 frontmatter 中的数字密码会被解析为 Number 类型
  if (inputPassword.value === String(props.password)) {
    // 保存解锁状态到 localStorage
    const unlockedPosts = JSON.parse(localStorage.getItem("unlockedPosts") || "{}");
    unlockedPosts[props.postId] = true;
    localStorage.setItem("unlockedPosts", JSON.stringify(unlockedPosts));
    emit("unlocked");
  } else {
    errorMessage.value = "密码错误，请重试";
    inputPassword.value = "";
  }
};

// 组件挂载时检查是否已解锁
onMounted(() => {
  if (checkUnlocked()) {
    emit("unlocked");
  }
});
</script>

<style lang="scss" scoped>
.password-protect {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 1.5rem 3rem;
  margin: 0 auto;
  max-width: 600px;
  width: 100%;
  text-align: center;

  .protect-icon {
    width: 60px;
    height: 60px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    background: var(--main-color-bg);
    margin-bottom: 1rem;

    .lock-emoji {
      font-size: 28px;
    }
  }

  .protect-title {
    font-size: 1.2rem;
    font-weight: bold;
    color: var(--main-font-color);
    margin-bottom: 0.4rem;
  }

  .protect-desc {
    font-size: 0.85rem;
    color: var(--main-font-second-color);
    margin-bottom: 1rem;
  }

  .protect-input-wrapper {
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 12px;
    width: 100%;
    max-width: 360px;

    .protect-input {
      flex: 1;
      padding: 12px 16px;
      border: 2px solid var(--main-card-border);
      border-radius: 12px;
      background: var(--main-card-background);
      color: var(--main-font-color);
      font-size: 1rem;
      outline: none;
      transition: border-color 0.3s;

      &::placeholder {
        color: var(--main-font-second-color);
      }

      &:focus {
        border-color: var(--main-color);
      }
    }

    .protect-btn {
      display: flex;
      flex-direction: row;
      align-items: center;
      gap: 6px;
      padding: 12px 20px;
      border: none;
      border-radius: 12px;
      background: var(--main-color);
      color: #fff;
      font-size: 1rem;
      font-weight: bold;
      cursor: pointer;
      transition: opacity 0.3s, transform 0.2s;

      .unlock-emoji {
        font-size: 16px;
      }

      &:hover {
        opacity: 0.9;
      }

      &:active {
        transform: scale(0.98);
      }
    }
  }

  .protect-error {
    margin-top: 1rem;
    color: var(--main-error-color);
    font-size: 0.9rem;
  }

  @media (max-width: 768px) {
    padding: 2rem 1.5rem;

    .protect-input-wrapper {
      flex-direction: column;
      gap: 12px;

      .protect-input,
      .protect-btn {
        width: 100%;
        justify-content: center;
      }
    }
  }
}
</style>
