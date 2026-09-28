import { computed, ref } from "vue";
import { useData } from "vitepress";
import { normalizeList } from "./normalizeList.mjs";

// 归一化实现已抽到零依赖的 normalizeList.mjs：构建期（getPostData.mjs）与
// 客户端必须共用同一套规则，否则字符串型 tags/categories 会在两条路径上
// 得到不同结果（逐字符渲染 / 路由键带空格）。这里保留再导出，兼容既有引用。
export { normalizeList };

const postData = ref([]);
let loadPromise = null;

const groupByField = (posts, field) => {
  const grouped = {};

  posts.forEach((post) => {
    normalizeList(post[field]).forEach((name) => {
      if (!grouped[name]) {
        grouped[name] = {
          count: 0,
          articles: [],
        };
      }
      grouped[name].count++;
      grouped[name].articles.push(post);
    });
  });

  return grouped;
};

const groupByYear = (posts) => {
  const archiveData = {};

  posts.forEach((post) => {
    if (!post.date) return;

    const year = new Date(post.date).getFullYear().toString();
    if (!archiveData[year]) {
      archiveData[year] = {
        count: 0,
        articles: [],
      };
    }
    archiveData[year].count++;
    archiveData[year].articles.push(post);
  });

  const sortedYears = Object.keys(archiveData).sort((a, b) => parseInt(b) - parseInt(a));
  return { data: archiveData, year: sortedYears };
};

export const usePostData = () => {
  const { site } = useData();

  // 兜住"旧索引"：service worker / HTTP 缓存里可能还留着归一化之前的
  // postData.json（其中 tags/categories 是字符串）。字符串一旦落到模板的
  // v-for 上会被逐字符渲染成 404 链接，所以这里按需再归一化一次；
  // 数组与 undefined 一律原样保留，避免改变 `v-if="item?.tags"` 的语义。
  const normalizePost = (post) => {
    if (!post || typeof post !== "object") return post;
    if (typeof post.tags !== "string" && typeof post.categories !== "string") return post;
    return {
      ...post,
      tags: typeof post.tags === "string" ? normalizeList(post.tags) : post.tags,
      categories:
        typeof post.categories === "string" ? normalizeList(post.categories) : post.categories,
    };
  };

  const loadPostData = async () => {
    if (postData.value.length) return postData.value;
    if (loadPromise) return loadPromise;

    const base = site.value?.base || "/";
    const url = `${base.replace(/\/$/, "")}/data/postData.json`;

    loadPromise = fetch(url)
      .then((res) => {
        if (!res.ok) throw new Error(`加载文章索引失败：${res.status} ${res.statusText}`);
        return res.json();
      })
      .then((data) => {
        postData.value = Array.isArray(data) ? data.map(normalizePost) : [];
        return postData.value;
      })
      .catch((error) => {
        console.error(error);
        postData.value = [];
        return postData.value;
      })
      .finally(() => {
        loadPromise = null;
      });

    return loadPromise;
  };

  return {
    postData,
    postCount: computed(() => postData.value.length),
    tagsData: computed(() => groupByField(postData.value, "tags")),
    categoriesData: computed(() => groupByField(postData.value, "categories")),
    archivesData: computed(() => groupByYear(postData.value)),
    loadPostData,
  };
};
