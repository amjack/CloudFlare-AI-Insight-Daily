# GitHub Pages 配置指南

## 📍 GitHub Pages 访问地址

### 默认地址格式

你的 GitHub Pages 地址格式为：

```
https://<你的GitHub用户名>.github.io/<仓库名>/
```

### 示例

如果你的 GitHub 用户名是 `justlovemaki`，仓库名是 `CloudFlare-AI-Insight-Daily`，那么：

**访问地址：**
```
https://justlovemaki.github.io/CloudFlare-AI-Insight-Daily/
```

---

## 🔍 如何查看你的 GitHub Pages 地址

### 方法 1：通过 GitHub 仓库设置查看

1. 打开你的 GitHub 仓库
2. 点击 `Settings`（设置）
3. 在左侧菜单找到 `Pages`
4. 在 "Your site is live at" 位置可以看到完整的访问地址

### 方法 2：根据规则构建

```
https://[你的用户名].github.io/[仓库名]/
```

例如：
- 用户名：`zhangjunjie`
- 仓库名：`CloudFlare-AI-Insight-Daily`
- 地址：`https://zhangjunjie.github.io/CloudFlare-AI-Insight-Daily/`

---

## 🎨 如何修改页面配置

### 1. 修改页面标题

页面标题由 `book.toml` 文件控制，有两个配置文件：

#### 主配置文件（项目根目录）

**文件位置：** `book.toml`

```toml
[book]
title = "By 何夕2077"  # ← 修改这里的标题
```

#### Docker 配置文件

**文件位置：** `cron-docker/scripts/work/book.toml`

```toml
[book]
title = "By 何夕2077"  # ← 修改这里的标题
```

**修改示例：**

```toml
[book]
title = "AI 日刊 - 每日AI资讯"  # 改为你想要的标题
```

---

### 2. 修改仓库链接

**文件位置：** 两个 `book.toml` 文件

```toml
[output.html]
git-repository-url = "https://github.com/justlovemaki/CloudFlare-AI-Insight-Daily"
```

**修改为你的仓库地址：**

```toml
[output.html]
git-repository-url = "https://github.com/你的用户名/你的仓库名"
```

---

### 3. 修改页面语言

```toml
[book]
language = "zh"  # zh=中文, en=英文
```

---

## 📝 页面内容来源

### 内容生成流程

```
Cloudflare Workers
    ↓
生成每日 Markdown 文件
    ↓
推送到 diy 分支的 daily/ 目录
    ↓
GitHub Actions 自动构建
    ↓
生成 mdbook 静态站点
    ↓
发布到 GitHub Pages
```

### 关键目录

| 目录 | 说明 |
|------|------|
| `daily/` | 存放每日日刊的 Markdown 文件 |
| `podcast/` | 存放播客脚本文件 |
| `SUMMARY.md` | 自动生成的目录文件 |

---

## 🛠️ 如何修改页面样式和内容

### 1. 修改页面布局

mdbook 使用主题系统，可以通过配置文件自定义。

**在 `book.toml` 中添加：**

```toml
[output.html]
git-repository-url = "https://github.com/你的用户名/仓库名"
default-theme = "light"  # 默认主题：light, rust, coal, navy, ayu
preferred-dark-theme = "navy"  # 暗色主题
```

### 2. 添加自定义 CSS

创建主题目录：

```bash
mkdir -p theme
```

创建 `theme/custom.css`：

```css
/* 自定义样式 */
.sidebar {
    background-color: #f5f5f5;
}

h1 {
    color: #2c3e50;
}
```

在 `book.toml` 中引用：

```toml
[output.html]
additional-css = ["theme/custom.css"]
```

### 3. 添加自定义 JavaScript

创建 `theme/custom.js`：

```javascript
// 自定义脚本
console.log('AI 日刊加载完成');
```

在 `book.toml` 中引用：

```toml
[output.html]
additional-js = ["theme/custom.js"]
```

---

## 🎯 完整的 book.toml 配置示例

```toml
[book]
# 作者信息
authors = ["你的名字"]
# 页面语言
language = "zh"
# 多语言支持（可选）
multilingual = false
# 源文件目录
src = "CloudFlare-AI-Insight-Daily"
# 网站标题
title = "AI 日刊 - 每日精选"
# 自动创建缺失的文件
create-missing = true

[output.html]
# GitHub 仓库链接
git-repository-url = "https://github.com/你的用户名/仓库名"
# 默认主题
default-theme = "light"
# 暗色主题
preferred-dark-theme = "navy"
# 是否启用搜索
no-section-label = false
# 自定义 CSS
additional-css = ["theme/custom.css"]
# 自定义 JS
additional-js = ["theme/custom.js"]
# 网站图标
site-url = "/CloudFlare-AI-Insight-Daily/"
```

---

## 🌐 配置自定义域名（可选）

如果你有自己的域名，可以配置自定义域名：

### 步骤 1：在域名提供商添加 DNS 记录

添加 CNAME 记录：

```
类型: CNAME
名称: ai (或其他子域名)
值: 你的用户名.github.io
```

### 步骤 2：在 GitHub 仓库配置

1. 进入仓库 `Settings` → `Pages`
2. 在 "Custom domain" 输入你的域名
3. 例如：`ai.yourdomain.com`
4. 勾选 "Enforce HTTPS"

### 步骤 3：更新 webhook 配置

修改 `GITHUB_PAGES_URL` 变量为你的自定义域名：

```
GITHUB_PAGES_URL=https://ai.yourdomain.com
```

---

## 📂 本地预览页面

如果你想在本地预览 GitHub Pages 的效果：

### 安装 mdbook

```bash
# macOS
brew install mdbook

# Linux
cargo install mdbook

# 或下载预编译版本
# https://github.com/rust-lang/mdBook/releases
```

### 本地构建和预览

```bash
# 进入项目目录
cd CloudFlare-AI-Insight-Daily

# 构建（如果 daily/ 目录已有内容）
mdbook build

# 或者启动本地服务器预览
mdbook serve --open
```

默认会在 `http://localhost:3000` 打开预览。

---

## 🔄 更新页面内容的流程

### 自动更新（推荐）

1. **每天早上 9 点自动执行** GitHub Actions
2. 从 Cloudflare Workers 获取数据
3. 生成新的 Markdown 文件到 `daily/` 目录
4. 自动构建 mdbook 站点
5. 推送到 `diy` 分支
6. GitHub Pages 自动更新

### 手动更新

```bash
# 1. 在 daily/ 目录添加或修改 Markdown 文件
echo "# 今日内容" > daily/2025-11-28.md

# 2. 提交到 diy 分支
git add daily/
git commit -m "更新日刊内容"
git push origin diy

# 3. GitHub Actions 会自动构建并发布
```

---

## 🎨 页面样式主题

mdbook 内置了多种主题：

| 主题名 | 说明 | 推荐场景 |
|--------|------|---------|
| `light` | 浅色主题 | 白天阅读 |
| `rust` | Rust 风格 | 技术文档 |
| `coal` | 深色主题 | 夜间阅读 |
| `navy` | 海军蓝 | 夜间阅读 |
| `ayu` | Ayu 风格 | 现代风格 |

**配置方法：**

```toml
[output.html]
default-theme = "light"
preferred-dark-theme = "navy"
```

---

## 📱 响应式设计

mdbook 生成的页面默认支持响应式设计，自动适配：

- 💻 桌面端
- 📱 移动端
- 📲 平板

无需额外配置。

---

## 🔧 高级配置

### 1. 添加 Google Analytics

```toml
[output.html.playground]
editable = false

[output.html]
google-analytics = "UA-XXXXXXXXX-X"
```

### 2. 配置搜索功能

```toml
[output.html.search]
enable = true
limit-results = 30
use-boolean-and = true
boost-title = 2
boost-hierarchy = 1
boost-paragraph = 1
expand = true
heading-split-level = 3
```

### 3. 添加多语言支持

创建不同语言的目录：

```
src/
  ├── zh/  (中文)
  ├── en/  (英文)
  └── SUMMARY.md
```

---

## 📊 页面结构

当前页面结构：

```
GitHub Pages 根目录
├── index.html        (主页)
├── daily/            (日刊列表)
│   ├── 2025-11-28.html
│   ├── 2025-11-27.html
│   └── ...
├── podcast/          (播客脚本)
└── search.html       (搜索页)
```

---

## ❓ 常见问题

### Q1: 为什么访问 GitHub Pages 显示 404？

**可能原因：**
1. diy 分支不存在
2. GitHub Pages 未启用
3. 内容还未构建完成

**解决方法：**
1. 检查 `Settings` → `Pages` 是否已启用
2. 确认 diy 分支已创建并有内容
3. 手动触发一次 GitHub Actions

### Q2: 修改了 book.toml 但页面没变化？

**解决方法：**
1. 确保修改了正确的文件（两个 book.toml 都要改）
2. 重新运行 GitHub Actions
3. 清除浏览器缓存

### Q3: 如何更改 GitHub Pages 的分支？

1. 进入 `Settings` → `Pages`
2. 在 "Source" 下拉框选择分支
3. 当前项目使用 `diy` 分支

### Q4: 页面样式乱了怎么办？

**检查：**
1. `book.toml` 配置是否正确
2. 自定义 CSS 是否有语法错误
3. 浏览器开发者工具查看错误信息

---

## 📚 相关文档

- **mdbook 官方文档：** https://rust-lang.github.io/mdBook/
- **GitHub Pages 文档：** https://docs.github.com/pages
- **部署文档：** [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md)
- **Webhook 配置：** [WEBHOOK_QUICKSTART.md](WEBHOOK_QUICKSTART.md)

---

## 🎯 快速配置清单

配置你自己的 GitHub Pages：

- [ ] 修改 `book.toml` 的标题
- [ ] 修改 `book.toml` 的仓库地址
- [ ] 修改 `cron-docker/scripts/work/book.toml` 的配置
- [ ] 在 GitHub 启用 Pages（选择 diy 分支）
- [ ] 更新 webhook 的 `GITHUB_PAGES_URL` 变量
- [ ] 运行一次 GitHub Actions 测试
- [ ] 访问你的 GitHub Pages 地址验证

---

**配置完成后，你的 AI 日刊网站就上线了！** 🎉

访问地址：`https://你的用户名.github.io/仓库名/`

