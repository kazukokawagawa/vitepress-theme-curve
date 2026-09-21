module.exports = {
  root: true,

  env: {
    browser: true,
    es2021: true,
    node: true,
  },

  extends: ["airbnb-base", "plugin:vue/vue3-essential"],

  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "module",
  },

  plugins: ["vue"],

  overrides: [
    {
      // 配置文件本身为 CommonJS
      files: [".eslintrc.{js,cjs}", "*.cjs"],
      env: {
        node: true,
      },
      parserOptions: {
        sourceType: "script",
      },
    },
    {
      // 服务端 / 构建期脚本运行在 Node 环境
      files: ["api/**/*.ts", "functions/**/*.ts", ".vitepress/**/*.mjs", "page/**/*.mjs", "pages/**/*.mjs"],
      env: {
        node: true,
      },
    },
  ],

  rules: {
    // 使用双引号
    quotes: ["warn", "double"],
    // 导入后缀名
    "import/extensions": "off",
    // 禁用 console
    "no-console": "off",

    // 仓库在 Windows 上以 core.autocrlf=true 检出，工作区为 CRLF。
    // airbnb-base 默认强制 LF，会导致全仓库每个文件都报错，与本项目
    // 的检出配置冲突。此处改为跟随工作区实际换行符，不检查行尾风格。
    "linebreak-style": "off",
  },
};
