<template>
  <div class="about">
    <h1 class="title">关于本站</h1>
    <div class="about-content" style="grid-template-columns: 3fr 2fr">
      <div class="about-item hello">
        <span class="text1">你好，很高兴认识你👋</span>
        <span class="text2 title2">我是 池鱼</span>
        <span class="text3">是一名 正在HRT的MtF🏳‍⚧🏳‍⚧</span>
        <span class="text4">
          HRT 始于 <LiveDate mode="format" :date="hrtDate" format="YYYY.MM.DD" />，已进行
          <LiveDate mode="days-since" :date="hrtDate" /> 天
        </span>
      </div>
      <div class="about-item skills">
        <span class="tip">技能</span>
        <span class="title2">我不会的玩意</span>
        <div class="skills-list">
          <a
            v-for="(item, index) in skillsData"
            :key="index"
            :style="{ '--color': item.color }"
            :href="item.link"
            class="skills-item"
            target="_blank"
          >
            <div class="skills-logo">
              <i :class="`iconfont icon-${item.icon}`"></i>
            </div>
            <span class="skills-name">{{ item.name }}</span>
          </a>
        </div>
      </div>
    </div>
    <div
      v-if="theme.tenYear?.enable"
      class="about-content ten-year-section"
      style="display: flex"
    >
      <div class="about-item ten-year">
        <div class="ten-year-heading">
          <div class="ten-year-intro">
            <span class="tip">十年之约 · Make Blog Forerver</span>
            <span class="title2">不为流量写的博客，值得被人好好读</span>
            <p class="ten-year-copy">
              总则：我们的博客十年不关闭或者更久，并保持更新和活力。
            </p>
          </div>
          <div class="ten-year-mark" aria-hidden="true">
            <span class="ten">10</span>
            <span class="years">YEARS</span>
          </div>
        </div>
        <div class="ten-year-progress-info">
          <span>
            {{
              !tenYearInfo || tenYearInfo.progress === null
                ? "进度加载中"
                : tenYearInfo.complete
                  ? "十年之约已完成"
                  : "十年之约进行中"
            }}
          </span>
          <strong>{{ !tenYearInfo || tenYearInfo.progress === null ? "—" : `${tenYearInfo.progress}%` }}</strong>
        </div>
        <div
          class="ten-year-progress"
          role="progressbar"
          aria-label="十年之约进度"
          aria-valuemin="0"
          aria-valuemax="100"
          :aria-valuenow="tenYearInfo?.progress ?? 0"
        >
          <span :style="{ width: `${tenYearInfo?.progress ?? 0}%` }" />
        </div>
        <div class="ten-year-details">
          <div class="ten-year-date">
            <span class="detail-label">起点 · 建站日</span>
            <strong>{{ tenYearInfo?.startText || String(theme.since || "—") }}</strong>
          </div>
          <div class="ten-year-stat">
            <strong>{{ tenYearInfo?.elapsedDays ?? "—" }}</strong>
            <span>已同行（天）</span>
          </div>
          <div
            :class="[
              'ten-year-stat',
              'remaining',
              { compact: tenYearInfo?.remainingLabel === '剩余时间' },
            ]"
          >
            <strong>{{ tenYearInfo?.remainingText ?? "—" }}</strong>
            <span>{{ tenYearInfo?.remainingLabel ?? "剩余时间" }}</span>
          </div>
          <div class="ten-year-date end-date">
            <span class="detail-label">约定终点</span>
            <strong>{{ tenYearInfo?.deadlineText || "—" }}</strong>
          </div>
        </div>
      </div>
    </div>
    <div class="about-content" style="grid-template-columns: 2fr 3fr">
      <div
        class="about-item static image"
        style="
          --color: #0f1114;
          background-image: url(#);
        "
      >
        <div class="image-content">
          <span class="tip">数据</span>
          <span class="title2">站点数据</span>
          <div class="static-data">
            <div class="static-item">
              <span class="static-name">总访问量</span>
              <span id="busuanzi_value_site_pv" class="static-num">0</span>
            </div>
            <div class="static-item">
              <span class="static-name">总访客数</span>
              <span id="busuanzi_value_site_uv" class="static-num">0</span>
            </div>
          </div>
          <div class="image-desc opacity">
            <span class="left">
              统计信息来自 <a href="https://busuanzi.ibruce.info/" target="_blank">不蒜子</a>
            </span>
          </div>
        </div>
      </div>

      <div class="about-item child">
        <div
          class="about-item map image"
          style="background-image: url(https://raw.20100907.xyz/other/tc.png)"
        >
          <span class="position">我现在住在 <strong>中国，江苏省，苏州市</strong></span>
        </div>
        <div class="about-item info">
          <div class="info-item">
            <span class="info-name">诞生于</span>
            <span class="info-num" style="--color: #43a6c6">2010</span>
          </div>
          <div class="info-item">
            <span class="info-name">生日</span>
            <span class="info-num" style="--color: #dfac46">0907</span>
          </div>
          <div class="info-item">
            <span class="info-name">距生日</span>
            <span class="info-num" style="--color: #8c78e8">
              <LiveDate mode="days-until" :date="birthDate" yearly /> 天
            </span>
          </div>
        </div>
      </div>
    </div>
    <!-- 心路历程 -->
    <div class="about-content" style="display: flex">
      <div class="about-item">
        <span class="tip">关于这个破站</span>
        <span class="title2">一个记录自己生活的站点</span>
        <p class="text">
          首先感谢一下小恒提供的域名贡献
        </p>
        <p class="text">
          写几句slogan好了
        </p>
        <p class="text">
          <strong>跨过晨昏线，便是永夜。</strong>
        </p>
        <p class="text">
          所以，回去吧，回到我们，所有<strong>「奇迹」</strong>开始的地方
        </p>
        <p class="text">
          我爱你们。
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted } from "vue";
import { useData } from "vitepress";
import { loadScript } from "@/utils/commonTools";
import { useClientNow } from "@/utils/useClientNow.mjs";
import { getTenYearInfo } from "@/utils/tenYear.mjs";

const { theme } = useData();
const { now } = useClientNow({ interval: 60 * 1000 });
const tenYearInfo = computed(() => getTenYearInfo(theme.value.since, now.value));

const birthDate = "2010-09-07";
const hrtDate = "2025-03-24";

// 技能数据

const skillsData = [
  {
    name: "JavaScript",
    color: "#f1e05abd",
    icon: "javascript",
    link: "https://developer.mozilla.org/zh-CN/docs/Web/JavaScript",
  },
  {
    name: "HTML5",
    color: "#e34f26",
    icon: "html5",
    link: "https://developer.mozilla.org/zh-CN/docs/Web/HTML",
  },
  {
    name: "CSS3",
    color: "#563d7c",
    icon: "css3",
    link: "https://developer.mozilla.org/zh-CN/docs/Web/CSS",
  },
  {
    name: "Vue",
    color: "#41b883",
    icon: "vue",
    link: "https://cn.vuejs.org/",
  },
  {
    name: "React",
    color: "#149ECA",
    icon: "react",
    link: "https://zh-hans.reactjs.org/",
  },
  {
    name: "Node.js",
    color: "#026E00",
    icon: "nodejs",
    link: "https://nodejs.org/",
  },
  {
    name: "Python",
    color: "#3776AB",
    icon: "python",
    link: "https://www.python.org/",
  },
  {
    name: "Docker",
    color: "#2496f2",
    icon: "docker",
    link: "https://www.docker.com/",
  },
  {
    name: "Git",
    color: "#F05032",
    icon: "git",
    link: "https://git-scm.com/",
  },
  {
    name: "Photoshop",
    color: "#31A8FF",
    icon: "photoshop",
    link: "https://www.adobe.com/cn/lead/creativecloud/business.html",
  },
  {
    name: "ChatGPT",
    color: "#4AA181",
    icon: "chatgpt",
    link: "https://chat.openai.com/",
  },
];

onMounted(() => {
  loadScript("https://busuanzi.ibruce.info/busuanzi/2.3/busuanzi.pure.mini.js", {
    async: true,
    reload: true,
  });
});
</script>

<style lang="scss" scoped>
.about {
  .title {
    font-size: 2.4rem;
    text-align: center;
    border: none;
    padding-bottom: 0;
  }
  .about-content {
    display: grid;
    grid-template-columns: auto auto;
    gap: 20px;
    margin-bottom: 20px;
    .about-item {
      position: relative;
      display: flex;
      flex-direction: column;
      min-width: 0;
      width: 100%;
      padding: 1.2rem 2rem;
      border-radius: 12px;
      background-color: var(--main-card-background);
      border: 1px solid var(--main-card-border);
      box-shadow: 0 8px 12px -4px var(--main-border-shadow);
      overflow: hidden;
      .tip {
        font-size: 14px;
        opacity: 0.8;
        margin-bottom: 12px;
      }
      .title1 {
        font-size: 36px;
        font-weight: bold;
        opacity: 0.6;
      }
      .title2 {
        font-size: 36px;
        font-weight: bold;
        margin-right: 4rem;
      }
      .text {
        font-size: 18px;
        margin: 0.6rem 0;
      }
      &.ten-year {
        padding: 2rem 2.4rem;
        background-color: var(--main-card-background);

        .ten-year-heading {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1.5rem;
        }

        .ten-year-intro {
          display: flex;
          flex-direction: column;
          min-width: 0;

          .tip {
            margin-bottom: 0.55rem;
            color: var(--main-color);
            font-size: 0.75rem;
            font-weight: 600;
            letter-spacing: 0.08em;
            opacity: 0.95;
          }

          .title2 {
            margin-right: 0;
            color: var(--main-font-color);
            font-size: clamp(1.7rem, 3.2vw, 2.25rem);
            font-weight: 650;
            letter-spacing: -0.045em;
            line-height: 1.25;
            text-wrap: balance;
          }
        }

        .ten-year-copy {
          max-width: 44rem;
          margin: 0.75rem 0 0;
          color: var(--main-font-second-color);
          font-size: 0.98rem;
          font-weight: 400;
          letter-spacing: 0.01em;
          line-height: 1.8;
        }

        .ten-year-mark {
          display: flex;
          flex-shrink: 0;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          width: 104px;
          height: 104px;
          border: 1px solid color-mix(in srgb, var(--main-color) 35%, var(--main-card-border));
          border-radius: 50%;
          color: var(--main-color);
          transform: rotate(8deg);

          .ten {
            font-size: 3rem;
            font-weight: 800;
            line-height: 1;
          }

          .years {
            margin-top: 4px;
            font-size: 0.7rem;
            font-weight: bold;
            letter-spacing: 0.18em;
          }
        }

        .ten-year-progress-info {
          display: flex;
          justify-content: space-between;
          margin: 1.8rem 0 0.55rem;
          color: var(--main-font-second-color);
          font-size: 0.9rem;

          strong {
            color: var(--main-color);
          }
        }

        .ten-year-progress {
          height: 10px;
          overflow: hidden;
          border-radius: 999px;
          background: var(--main-color-bg);

          span {
            display: block;
            height: 100%;
            border-radius: inherit;
            background: var(--main-color);
            transition: width 0.6s ease;
          }
        }

        .ten-year-details {
          display: grid;
          grid-template-columns: 1.2fr 1fr 1fr 1.2fr;
          align-items: center;
          gap: 1rem;
          margin-top: 1.3rem;
        }

        .ten-year-date,
        .ten-year-stat {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;

          strong {
            font-size: 1.25rem;
          }

          span {
            color: var(--main-font-second-color);
            font-size: 0.8rem;
          }
        }

        .ten-year-stat {
          padding-left: 1rem;
          border-left: 1px solid var(--main-card-border);

          &.compact strong {
            font-size: 1rem;
            letter-spacing: -0.02em;
          }
        }

        .ten-year-date.end-date {
          text-align: right;
        }
      }
      &.child {
        background-color: transparent;
        border: none;
        box-shadow: none;
        padding: 0;
        gap: 20px;
        .about-item {
          height: 100%;
        }
      }
      &.hello {
        justify-content: center;
        padding: 2rem;
        color: #fff;
        background-image: linear-gradient(
          120deg,
          var(--main-color) 0%,
          color-mix(in srgb, var(--main-color) 68%, #000 32%) 100%
        );
        background-size: 200% 200%;
        animation: gradientFlow 6s ease infinite;
        .title2 {
          line-height: 2;
        }
        .text4 {
          margin-top: 0.5rem;
          font-size: 0.9rem;
          opacity: 0.8;
        }
      }
      &.pursuit {
        .title2 {
          line-height: 1.2;
          &:last-child {
            display: inline-block;
            background-size: 100% 100%;
            background-clip: text;
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-repeat: no-repeat;
            background-image: linear-gradient(45deg, #fa7671 50%, #f45f7f);
          }
        }
      }
      &.character {
        min-height: 220px;
        cursor: pointer;
        .more {
          margin-top: auto;
          font-size: 14px;
          color: var(--main-color-gray);
          a {
            color: var(--main-color-gray);
            &:hover {
              color: var(--color);
            }
          }
        }
        .male {
          position: absolute;
          top: 20px;
          right: -10px;
          height: 140%;
          width: auto;
          transition: transform 0.5s;
          transform-origin: top center;
          @media (max-width: 768px) {
            height: 80%;
          }
        }
        &:hover {
          .male {
            transform: scale(1.2);
          }
        }
      }
      &.skills {
        .skills-list {
          margin-top: 12px;
          display: flex;
          flex-direction: row;
          flex-wrap: wrap;
          .skills-item {
            display: flex;
            align-items: center;
            margin-right: 10px;
            margin-top: 10px;
            padding: 8px 12px 8px 8px;
            border-radius: 40px;
            background-color: var(--main-site-background);
            border: 1px solid var(--main-card-border);
            box-shadow: 0 8px 12px -4px var(--main-border-shadow);
            transition: background-color 0.3s;
            cursor: pointer;
            .skills-logo {
              display: flex;
              align-items: center;
              justify-content: center;
              width: 32px;
              height: 32px;
              margin-right: 8px;
              border-radius: 50%;
              background-color: var(--color);
              .iconfont {
                color: #fff;
              }
            }
            .skills-name {
              font-weight: bold;
              transition: color 0.3s;
            }
            &:hover {
              background-color: var(--main-card-background);
            }
          }
        }
      }
      &.career {
        .title2 {
          letter-spacing: 0.2rem;
          font-size: 40px;
        }
        .list {
          margin-top: 12px;
          display: flex;
          flex-direction: column;
          .list-item {
            display: flex;
            flex-direction: row;
            align-items: center;
            margin-bottom: 12px;
            color: var(--main-font-second-color);
            &::before {
              content: "";
              display: block;
              width: 16px;
              height: 16px;
              background-color: var(--color);
              border-radius: 50%;
              margin-right: 8px;
            }
          }
        }
        .career-img {
          position: absolute;
          bottom: -10px;
          left: 0;
          width: 100%;
          @media (max-width: 768px) {
            position: static;
          }
        }
      }
      &.game {
        min-height: 300px;
        @media (max-width: 768px) {
          min-height: 240px;
        }
      }
      &.like {
        min-height: 400px;
        @media (max-width: 768px) {
          min-height: 300px;
        }
      }
      &.image {
        background-position: center;
        background-size: cover;
        background-repeat: no-repeat;
        .image-content {
          flex-grow: 1;
          display: flex;
          flex-direction: column;
          z-index: 2;
          color: #fff;
          .image-desc {
            width: 100%;
            display: flex;
            flex-direction: row;
            align-items: center;
            justify-content: space-between;
            margin-top: auto;
            &.opacity {
              font-size: 14px;
              color: #eee;
              opacity: 0.8;
              a {
                color: #eee;
                &:hover {
                  color: var(--main-color);
                }
              }
            }
          }
        }
        &::after {
          content: "";
          position: absolute;
          width: 100%;
          height: 100%;
          top: 0;
          left: 0;
          box-shadow: inset 0 -70px 204px 10px var(--color);
          z-index: 0;
        }
      }
      &.static {
        .static-data {
          display: grid;
          gap: 12px;
          grid-template-columns: 1fr 1fr;
          margin: 20px 0;
          .static-item {
            display: flex;
            flex-direction: column;
            .static-name {
              font-size: 15px;
              opacity: 0.8;
            }
            .static-num {
              font-size: 34px;
              font-weight: bold;
            }
          }
        }
      }
      &.map {
        min-height: 170px;
        background-size: 100%;
        transition: background 1.5s ease-in-out;
        cursor: pointer;
        @media (max-width: 768px) {
          background-size: cover;
          pointer-events: none;
        }
        .position {
          display: block;
          position: absolute;
          left: 0;
          bottom: 0;
          width: 100%;
          padding: 20px 30px;
          color: #fff;
          background-color: #636352;
          font-size: 20px;
          transition: bottom 1s;
        }
        &:hover {
          background-size: 120%;
          background-position-x: 0;
          background-position-y: 36%;
          .position {
            bottom: -80px;
          }
        }
      }
      &.info {
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        align-items: center;
        gap: 1.25rem 2rem;
        .info-item {
          display: flex;
          flex-direction: column;
          min-width: 0;
          .info-name {
            font-size: 14px;
            margin-bottom: 8px;
            color: var(--main-font-second-color);
          }
          .info-num {
            font-size: 34px;
            font-weight: bold;
            color: var(--color);
          }
        }
      }
    }
    @supports (corner-shape: squircle) {
      .about-item {
        border-radius: 24px;
        corner-shape: squircle;
      }
    }
    &:last-child {
      margin-bottom: 0;
    }
    @media (max-width: 768px) {
      display: flex;
      flex-direction: column;

      .about-item {
        padding: 1.2rem 1.25rem;

        &.ten-year {
          .ten-year-heading {
            align-items: flex-start;
          }

          .ten-year-mark {
            width: 70px;
            height: 70px;

            .ten {
              font-size: 2rem;
            }
          }

          .ten-year-details {
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 1rem 0.75rem;
          }

          .ten-year-stat {
            padding-left: 0.75rem;
          }

          .ten-year-date strong {
            font-size: 1rem;
          }

          .ten-year-stat strong {
            font-size: 1.4rem;
          }

          .ten-year-stat.compact strong {
            font-size: 0.95rem;
          }

          .ten-year-date.end-date {
            text-align: left;
          }
        }

        .title1 {
          font-size: 2rem;
        }

        .title2 {
          font-size: clamp(1.5rem, 8vw, 2rem);
          margin-right: 0;
          overflow-wrap: anywhere;
        }

        .text {
          font-size: 1rem;
        }

        &.static .static-data .static-item .static-num,
        &.info .info-item .info-num {
          font-size: 1.75rem;
        }

        &.map .position {
          padding: 1rem 1.25rem;
          font-size: 1rem;
        }

        &.info {
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 1.25rem 1rem;

          .info-item {
            margin-right: 0;
          }
        }
      }
    }
  }
}
</style>
