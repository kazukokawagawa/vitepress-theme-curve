<!-- 首页 -->
<template>
  <div class="home">
    <Banner v-if="showHeader" :height="store.bannerType" />
    <div class="home-content">
      <div class="posts-content">
        <!-- 分类总览 -->
        <TypeBar :type="showTags ? 'tags' : 'categories'" />
        <!-- 文章列表 -->
        <PostList :listData="postData" />
        <!-- 分页 -->
        <Pagination
          :total="allListTotal"
          :page="Number(page)"
          :limit="postSize"
          :useParams="showCategories || showTags ? true : false"
          :routePath="
            showCategories
              ? `/pages/categories/${showCategories}`
              : showTags
                ? `/pages/tags/${showTags}`
                : ''
          "
        />
            </div>
      <!-- 侧边栏 -->
      <Aside v-if="isDesktopAsideVisible" />
    </div>

  </div>
</template>

<script setup>
import { mainStore } from "@/store";
import { useDesktopAside } from "@/utils/useDesktopAside.mjs";
import { usePostData } from "@/utils/usePostData.mjs";

const route = useRoute();
const { theme } = useData();
const { isDesktopAsideVisible } = useDesktopAside();
const { postData: allPosts, tagsData, categoriesData, loadPostData } = usePostData();

const store = mainStore();

const props = defineProps({
  // 显示首页头部
  showHeader: {
    type: Boolean,
    default: false,
  },
  // 当前页数
  page: {
    type: Number,
    default: 1,
  },
  // 显示分类
  showCategories: {
    type: [null, String],
    default: null,
  },
  // 显示标签
  showTags: {
    type: [null, String],
    default: null,
  },
});

// 每页文章数
const postSize = theme.value.postSize;

// 当前页数（分类 / 标签页使用 query 参数控制，需要手动保持响应式）
const currentPage = ref(props.page || 1);

// 列表总数量
const allListTotal = computed(() => {
  const data = props.showCategories
    ? categoriesData.value[props.showCategories]?.articles
    : props.showTags
      ? tagsData.value[props.showTags]?.articles
      : allPosts.value;
  // 返回数量
  return data ? data.length : 0;
});

// 列表总页数（与 Pagination.vue 的 totalPages 口径一致）
const totalPages = computed(() => Math.max(Math.ceil(allListTotal.value / postSize), 1));

// 把页数钳制到合法范围：下界回落 1，上界钳到最后一页。
// 必须与 Pagination.vue 的 checkCurrentPage 保持同一口径，否则会出现
// "页码高亮在末页、列表却是空" 这类两处行为分叉。
const clampPage = (page) => {
  if (!Number.isInteger(page) || page < 1) return 1;
  return Math.min(page, totalPages.value);
};

// 获得当前页数
const getCurrentPage = () => {
  if (props.showCategories || props.showTags) {
    if (typeof window === "undefined") return 1;
    const routePath = route.path;
    const search = routePath.includes("?") ? routePath.split("?")[1] : window.location.search;
    const params = new URLSearchParams(search);
    return clampPage(Number(params.get("page")));
  }
  return clampPage(props.page || 1);
};

// 更新当前页数
const updateCurrentPage = () => {
  currentPage.value = getCurrentPage();
};

// 根据页数计算列表数据
const postData = computed(() => {
  const page = currentPage.value - 1;
  console.log("当前页数：", page);
  let data = null;
  // 分类数据
  if (props.showCategories) {
    data = categoriesData.value[props.showCategories]?.articles;
  }
  // 标签数据
  else if (props.showTags) {
    data = tagsData.value[props.showTags]?.articles;
  }
  // 文章数据
  else {
    data = allPosts.value;
  }
  // 返回列表
  return data ? data.slice(page * postSize, page * postSize + postSize) : [];
});

onMounted(() => {
  updateCurrentPage();
  loadPostData();
  window.addEventListener("popstate", updateCurrentPage);
  window.addEventListener("pagination-change", updateCurrentPage);
});

onBeforeUnmount(() => {
  window.removeEventListener("popstate", updateCurrentPage);
  window.removeEventListener("pagination-change", updateCurrentPage);
});

// 恢复滚动位置
const restoreScrollY = (val) => {
  if (typeof window === "undefined" || val) return false;
  const scrollY = store.lastScrollY;
  nextTick().then(() => {
    console.log("滚动位置：", scrollY);
    // 平滑滚动
    window.scrollTo({
      top: scrollY,
      behavior: "smooth",
    });
    // 清除滚动位置
    store.lastScrollY = 0;
  });
};

// 监听加载结束
watch(
  () => route.path,
  () => updateCurrentPage(),
);

watch(
  () => props.page,
  () => updateCurrentPage(),
);

watch(
  () => store.loadingStatus,
  (val) => restoreScrollY(val),
);
</script>

<style lang="scss" scoped>
.home {
  .home-content {
    width: 100%;
    display: flex;
    flex-direction: row;
    .posts-content {
      width: calc(100% - 300px);
      transition: width 0.3s;
    }
    .main-aside {
      width: 300px;
      padding-left: 1rem;
    }
    @media (max-width: 1200px) {
      .posts-content {
        width: 100%;
      }
      .main-aside {
        display: none;
      }
    }
  }
}
</style>
