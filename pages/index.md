---
title: 正在重定向
head:
  - - meta
    - { http-equiv: refresh, content: "0;url=/" }
---

<script setup>
import { onMounted } from "vue"
import { useRouter } from "vitepress"

const router = useRouter();

// meta refresh 负责真实 HTTP 访问与搜索引擎爬虫的跳转；
// 这里的 JS 负责站内 SPA 路由跳转（客户端导航不会重新解析 <head> 里的 meta refresh）。
onMounted(() => router.go("/"));
</script>
