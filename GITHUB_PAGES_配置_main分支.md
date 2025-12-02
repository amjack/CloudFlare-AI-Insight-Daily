# GitHub Pages 配置指南 - 使用 main 分支

## ✅ 当前配置

**部署方式：** 直接在 main 分支构建和部署，不创建额外分支

**优点：**
- ✅ 简单直接，只用一个分支
- ✅ 代码和网站内容在一起
- ✅ 便于管理和维护

---

## 📁 项目结构

```
main 分支
├── .github/workflows/   # GitHub Actions 工作流
├── src/                 # Cloudflare Workers 源码
├── daily/               # 日刊 Markdown 文件
├── today/               # 今日内容
├── podcast/             # 播客脚本
├── book/                # mdbook 构建输出 ⭐ 网站文件
├── book.toml            # mdbook 配置
├── SUMMARY.md           # 网站目录
└── README.md            # 项目说明
```

**book/ 目录** 是 mdbook 构建生成的静态网站文件，GitHub Pages 会从这里读取。

---

## 🚀 部署流程

### GitHub Actions 自动部署

```
触发 GitHub Actions
    ↓
签出 main 分支
    ↓
归档旧日刊 / 下载 RSS
    ↓
提交变更到 main
    ↓
安装 mdbook
    ↓
构建 mdbook → 生成 book/ 目录
    ↓
提交 book/ 目录到 main
    ↓
推送到 GitHub
    ↓
GitHub Pages 自动发布（从 book/ 目录）
```

---

## ⚙️ GitHub Pages 设置

### 重要配置步骤

1. **打开 GitHub Pages 设置**
   
   访问：https://github.com/amjack/CloudFlare-AI-Insight-Daily/settings/pages

2. **配置部署源**
   
   在 "Build and deployment" 下：
   - **Source:** `Deploy from a branch`
   - **Branch:** 选择 `main` ⭐
   - **Folder:** 选择 `/book` ⭐ （重要！）
   
3. **点击 Save**

### 配置截图说明

```
┌─────────────────────────────────────┐
│ Build and deployment                │
├─────────────────────────────────────┤
│ Source: Deploy from a branch    ▼   │
│                                     │
│ Branch:  main              ▼  /book ▼│
│          └─ 选择 main          └─ 选择 /book
│                                     │
│          [Save]                     │
└─────────────────────────────────────┘
```

---

## 🎯 访问地址

配置完成后，你的网站地址：

```
https://amjack.github.io/CloudFlare-AI-Insight-Daily/
```

---

## 📝 工作流说明

### 关键步骤

#### 1. 构建 mdBook

```yaml
- name: Setup mdBook
  uses: peaceiris/actions-mdbook@v2
  with:
    mdbook-version: 'latest'

- name: Build mdBook
  run: mdbook build
```

这会在项目根目录生成 `book/` 文件夹，包含所有网站文件。

#### 2. 提交到 main 分支

```yaml
- name: Commit mdBook output
  run: |
    git add book/ -f
    git commit -m "自动构建 mdBook 网站"
    git push origin main
```

将构建好的 `book/` 目录提交到 main 分支。

#### 3. GitHub Pages 自动部署

GitHub 检测到 main 分支的 book/ 目录有更新，自动部署。

---

## 🔄 手动触发部署

### 方法 1：通过 GitHub Actions

1. 访问 https://github.com/amjack/CloudFlare-AI-Insight-Daily/actions
2. 点击 `Build Daily Journal`
3. 点击 `Run workflow`
4. 选择 `main` 分支
5. 点击绿色 `Run workflow` 按钮

### 方法 2：推送代码触发

任何推送到 main 分支的操作都会触发工作流。

---

## 📊 验证部署

### 1. 检查 book/ 目录

在 GitHub 仓库查看：
https://github.com/amjack/CloudFlare-AI-Insight-Daily/tree/main/book

应该能看到：
```
book/
├── index.html
├── css/
├── js/
└── daily/
    └── ...
```

### 2. 查看 Actions 日志

在工作流日志中应该看到：
```
✅ Setup mdBook
✅ Build mdBook
✅ Commit mdBook output
   - mdBook 构建完成
   - mdBook 构建结果已推送
```

### 3. 访问网站

等待 1-2 分钟后访问：
https://amjack.github.io/CloudFlare-AI-Insight-Daily/

应该显示精美的 mdbook 网站！

---

## 🎨 自定义配置

### 修改网站标题

编辑 `book.toml`：

```toml
[book]
title = "你的标题"  # 改这里
```

### 修改主题

```toml
[output.html]
default-theme = "light"  # 可选: light, rust, coal, navy, ayu
preferred-dark-theme = "navy"
```

### 修改目录结构

编辑 `SUMMARY.md`：

```markdown
# Summary

[首页](README.md)

# 日刊

- [今日](today/README.md)
- [历史](daily/README.md)
```

---

## ⚠️ 注意事项

### 1. book/ 目录会被提交

与使用 gh-pages 分支不同，book/ 目录会直接提交到 main 分支，成为代码库的一部分。

### 2. 每次构建都会更新 book/

每次运行工作流都会重新构建整个 book/ 目录。

### 3. 必须配置 /book 文件夹

在 GitHub Pages 设置中，**必须选择 /book 文件夹**，否则会显示 README。

---

## 🐛 常见问题

### Q1: 网站还是显示 README？

**检查清单：**
- [ ] GitHub Pages 设置中选择了 `main` 分支
- [ ] **Folder 选择了 `/book`** ⭐ 最重要！
- [ ] book/ 目录存在且有内容
- [ ] 等待 1-2 分钟（GitHub Pages 有延迟）
- [ ] 清除浏览器缓存

### Q2: 找不到 /book 文件夹选项？

**原因：** main 分支根目录下没有 book/ 文件夹

**解决：**
1. 运行一次 GitHub Actions 工作流
2. 等待构建完成
3. 刷新 GitHub Pages 设置页面
4. /book 选项就会出现

### Q3: book/ 目录太大，影响仓库大小？

**说明：**
- book/ 主要是 HTML、CSS、JS 文件
- 通常不会很大（几 MB）
- 如果担心可以考虑使用 gh-pages 分支

**优化：**
- 不要在 book/ 中放大文件
- 图片使用外部 CDN
- 定期清理不需要的历史构建

### Q4: 工作流失败：book/ 目录不存在

**原因：** mdbook build 失败

**检查：**
1. book.toml 配置是否正确
2. SUMMARY.md 是否存在
3. 查看完整的 Actions 日志

---

## 🔄 更新流程

### 添加新日刊

1. 在 daily/ 目录添加新的 .md 文件
2. 提交并推送到 main
3. GitHub Actions 自动触发
4. 自动构建并部署

### 修改配置

1. 修改 book.toml 或 SUMMARY.md
2. 提交并推送
3. 自动重新构建

---

## 📚 文件说明

| 文件 | 用途 |
|------|------|
| `book.toml` | mdbook 配置文件 |
| `SUMMARY.md` | 网站目录结构 |
| `book/` | 生成的网站文件 ⭐ |
| `daily/` | 日刊源文件 |
| `README.md` | 项目首页内容 |

---

## 🎉 优势对比

### main 分支方案 vs gh-pages 分支方案

| 特性 | main 分支 | gh-pages 分支 |
|------|----------|--------------|
| 分支数量 | 1 个 ✅ | 2 个 |
| 配置复杂度 | 简单 ✅ | 中等 |
| 管理难度 | 容易 ✅ | 需要管理两个分支 |
| 仓库大小 | book/ 在主分支 | 分离存储 ✅ |
| 适用场景 | 小型项目 ✅ | 大型项目 |

---

## 🚀 快速开始

### 1. 配置 GitHub Pages

```
Settings → Pages
→ Source: Deploy from a branch
→ Branch: main
→ Folder: /book  ⭐
→ Save
```

### 2. 运行工作流

```
Actions → Build Daily Journal → Run workflow
```

### 3. 访问网站

```
https://amjack.github.io/CloudFlare-AI-Insight-Daily/
```

---

**配置完成！你的 AI 日刊网站使用 main 分支部署，简单高效！** 🎊

有问题随时查看这份文档或询问我！

