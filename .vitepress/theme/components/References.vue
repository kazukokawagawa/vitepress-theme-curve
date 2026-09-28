<!-- 参考资料 -->
<template>
  <div v-if="limitedReferences.length" class="references s-card">
    <div class="title">
      <i class="iconfont icon-quote"></i>
      <span class="title-text">参考资料</span>
    </div>
    <ul class="list">
      <a
        v-for="(item, index) in limitedReferences"
        :key="index"
        :href="item.url"
        class="list-item"
        target="_blank"
      >
        <span class="item-title">{{ item.title }}</span>
      </a>
    </ul>
  </div>
</template>

<script setup>
import { useData } from 'vitepress';

const { frontmatter } = useData(); // frontmatter 已经在这里声明了
const screenWidth = ref(0);
// 直接使用 frontmatter 来初始化 references
const references = ref(frontmatter.value?.references || []); // 不需要重新声明 frontmatter

// 计算属性，用于动态限制标题字数
const limitedReferences = computed(() => {
  //2025.06.12更新：在 Next.js 的服务端渲染过程中，应用会在服务器端先进行渲染
  //而在服务器端的 JavaScript 环境中，并没有浏览器提供的 window 对象。
  //最简单的解决方法是确保在客户端代码中访问 window
  //可以通过判断代码是否在浏览器环境中运行来避免在服务器端渲染时执行涉及 window 的代码
  // ⚠️ 这里原本嵌了一个 onMounted（"避免 SSR 访问 window" 的旧写法）。
  // computed 求值时没有活跃组件实例，Vue 会告警
  // "onMounted is called when no active component instance"，且它创建的
  // 局部变量会被立即丢弃 —— 已移除。
  // 注意：screenWidth 目前没有任何地方赋值（恒为 0），下面的截断实际不生效
  // （maxChars 为 NaN，比较恒为 false），标题保持完整。是否真正启用
  // "按屏宽截断"属产品决定，未擅自改动。
  // 假设你想让标题占据屏幕宽度的某个百分比，例如 70%
  // 这里的 '16' 是一个估算值，代表一个汉字或英文字符的平均像素宽度。
  // 你需要根据你的字体大小和字体类型进行精确调整。
  const maxChars = Math.floor((screenWidth * 0.7) / 16); // 估算最大字符数

  return references.value.map(item => {
    let title = item.title;
    if (title.length > maxChars) {
      title = title.substring(0, maxChars) + '...'; // 截断并添加省略号
    }
    return { ...item, title: title };
  });
});

// 在组件挂载时监听窗口大小变化，以便动态调整字数限制
onMounted(() => {
  window.addEventListener('resize', updateReferences);
  updateReferences(); // 首次加载时也更新
});

// 在组件卸载前移除事件监听器
onBeforeUnmount(() => {
  window.removeEventListener('resize', updateReferences);
});

// 更新 references 的函数，触发 computed 重新计算
const updateReferences = () => {
  // 这里的 references.value 应该从 useData() 提供的最新 frontmatter 中获取
  // 因为 frontmatter 已经是响应式的，当数据变化时，computed 会自动更新。
  // 如果 frontmatter.value?.references 不会自动更新，你可能需要确保 useData() 返回的是响应式数据
  // 或者在 VitePress 的生命周期中，当 frontmatter 更新时，手动触发 references.value 的更新
  // 在 VitePress 中，useData() 返回的数据通常是响应式的，所以这里可能不需要手动更新 references.value
  // 如果需要，可以这样：
  references.value = frontmatter.value?.references || [];
};
</script>

<style lang="scss" scoped>
.references {
  margin: 1rem 0;
  padding: 18px;
  margin-top: 2rem;
  background-color: var(--main-card-second-background);
  .title {
    display: flex;
    flex-direction: row;
    align-items: center;
    color: var(--main-font-second-color);
    font-size: 15px;
    margin-bottom: 0.8rem;
    .iconfont {
      margin-right: 4px;
      font-size: 18px;
      color: var(--main-font-second-color);
      opacity: 0.6;
    }
  }
  .list {
    display: flex;
    flex-direction: column;
    margin: 0;
    list-style-type: none;
    padding-left: 0.4rem;
    .list-item {
      display: inline-flex;
      flex-direction: row;
      align-items: center;
      position: relative;
      // width: max-content; // 如果你希望文本换行，这个可能需要调整或移除
      // 通常我们会让它占据可用宽度
      width: 100%; // 让列表项占据其父容器的全部宽度，以便文本换行
      padding-left: 1rem;
      margin-bottom: 0.4rem;
      overflow: auto;
      transition: color 0.3s;
      .item-title {
        padding-bottom: 2px;
        white-space: normal; /* 允许文本正常换行 */
        word-break: break-word; /* 允许在单词内换行以防止溢出 */
        overflow-wrap: break-word; /* 标准化属性，与 word-wrap: break-word 相同 */
      }
      &:last-child {
        margin-bottom: 0;
      }
      &::before {
        content: "";
        position: absolute;
        left: 0;
        width: 8px;
        height: 8px;
        opacity: 0.6;
        background-color: var(--main-font-color);
        border-radius: 50%;
        transition: background-color 0.3s;
      }
      &::after {
        content: "";
        position: absolute;
        left: 0;
        bottom: 0;
        height: 2px;
        width: 0;
        margin-left: 1rem;
        background-color: var(--main-color);
        transition: width 0.3s;
      }
      &:hover {
        color: var(--main-color);
        &::before {
          background-color: var(--main-color);
        }
        &::after {
          width: calc(100% - 1rem);
        }
      }
    }
  }
}
</style>