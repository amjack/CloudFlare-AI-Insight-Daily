# GitHub Pages - 分支部署配置指南

## ✅ 当前配置方案

使用 **main 分支 + /book 目录** 部署方式：

- ✅ 构建 mdbook 后提交到 main 分支
- ✅ book/ 目录包含所有网站文件
- ✅ GitHub Pages 从 main:/book 读取并部署

---

## 📁 项目结构

```
main 分支
├── .github/workflows/   # GitHub Actions 工作流
├── src/                 # Cloudflare Workers 源码
├── daily/               # 日刊 Markdown 文件
├── today/               # 今日内容
├── podcast/             # 播客脚本
├── book/                # ⭐ mdbook 构建输出（网站文件）
├── book.toml            # mdbook 配置
├── SUMMARY.md           # 网站目录
└── README.md            # 项目说明
```

**book/ 目录** 包含所有网站文件，会被提交到仓库。

---

## ⚙️ GitHub Pages 设置

### 重要配置步骤

1. **打开 GitHub Pages 设置**
   
   访问：https://github.com/amjack/CloudFlare-AI-Insight-Daily/settings/pages

2. **配置部署源**
   
   在 "Build and deployment" 下：
   - **Source:** 选择 `Deploy from a branch` ⭐
   - **Branch:** 选择 `main` ⭐
   - **Folder:** 选择 `/book` ⭐ **（这个最重要！）**
   
3. **点击 Save**

### 配置界面

```
┌─────────────────────────────────────┐
│ Build and deployment                │
├─────────────────────────────────────┤
│ Source: Deploy from a branch    ▼   │
│                                     │
│ Branch:  main              ▼  /book ▼│
│          └─ 选择 main          └─ 选择 /book ⭐
│                                     │
│          [Save]                     │
└─────────────────────────────────────┘
```

---

## 🚀 工作流程

### 完整流程

```
1. 推送代码到 main
   ↓
2. GitHub Actions 触发
   ↓
3. 签出 main 分支
   ↓
4. 归档旧日刊
   ↓
5. 提交日刊变更
   ↓
6. 安装 mdbook
   ↓
7. 构建 mdbook → 生成 book/ 目录
   ↓
8. 提交 book/ 目录到 main 分支 ⭐
   ↓
9. 推送到 GitHub
   ↓
10. GitHub Pages 从 main:/book 自动部署
   ↓
11. 发送 webhook 通知
   ↓
12. 网站上线！
```

### 关键步骤

```yaml
# 构建 mdBook
- name: Build mdBook
  run: mdbook build

# 提交 book/ 目录
- name: Commit and push mdBook output
  run: |
    git add -f book/  # 强制添加
    git commit -m "自动构建 mdBook 网站 [skip ci]"
    git push origin main
```

**[skip ci]**：避免循环触发工作流

---

## 🎯 访问地址

配置完成后，网站地址：

```
https://amjack.github.io/CloudFlare-AI-Insight-Daily/
```

---

## 📝 关键点说明

### 1. book/ 目录会被提交

- ✅ book/ 目录包含所有网站文件（HTML、CSS、JS）
- ✅ 会被提交到 main 分支
- ✅ 成为代码库的一部分

### 2. 使用 git add -f

```bash
git add -f book/
```

**-f 参数**：强制添加，即使 .gitignore 中有规则也会添加

### 3. [skip ci] 标记

```bash
git commit -m "自动构建 mdBook 网站 [skip ci]"
```

**作用**：避免这次提交再次触发工作流，防止无限循环

### 4. /book 文件夹选项

**首次需要运行工作流**：
- book/ 目录提交到 main 后
- GitHub Pages 设置中才会出现 `/book` 选项
- 如果看不到，先运行一次工作流

---

## 🔄 部署流程

### 首次部署

1. **提交代码**
   ```bash
   git add .
   git commit -m "配置 mdbook 构建"
   git push origin main
   ```

2. **等待工作流完成**
   - 访问 Actions 查看执行状态
   - 确认 book/ 目录已提交

3. **配置 GitHub Pages**
   - Settings → Pages
   - Source: Deploy from a branch
   - Branch: main
   - Folder: /book ⭐
   - Save

4. **访问网站**
   - 等待 1-2 分钟
   - 访问 https://amjack.github.io/CloudFlare-AI-Insight-Daily/

### 日常更新

每次推送代码后：
1. GitHub Actions 自动触发
2. 自动构建并提交 book/
3. GitHub Pages 自动更新

---

## ✅ 验证部署

### 1. 检查 book/ 目录

在 GitHub 仓库查看：
https://github.com/amjack/CloudFlare-AI-Insight-Daily/tree/main/book

应该看到：
```
book/
├── index.html
├── css/
│   └── ...
├── js/
│   └── ...
├── daily/
│   └── ...
└── ...
```

### 2. 检查 Actions 日志

工作流应该显示：
```
✅ Setup mdBook
✅ Build mdBook
   - mdBook 构建完成
✅ Commit and push mdBook output
   - book/ 目录存在
   - 已暂存的文件
   - ✅ mdBook 构建结果已推送到 main 分支
```

### 3. 检查 GitHub Pages 设置

Settings → Pages 应该显示：
```
Your site is live at https://amjack.github.io/CloudFlare-AI-Insight-Daily/
```

### 4. 访问网站

https://amjack.github.io/CloudFlare-AI-Insight-Daily/

应该显示精美的 mdbook 网站！

---

## 🐛 常见问题

### Q1: 看不到 /book 文件夹选项？

**原因：** book/ 目录还没有提交到 main 分支

**解决：**
1. 运行一次 GitHub Actions 工作流
2. 等待完成（约 2-3 分钟）
3. 检查 main 分支是否有 book/ 目录
4. 刷新 GitHub Pages 设置页面
5. /book 选项就会出现

### Q2: 网站还是显示 README？

**检查清单：**
- [ ] Source 选择了 `Deploy from a branch`
- [ ] Branch 选择了 `main`
- [ ] **Folder 选择了 `/book`** ⭐ 最重要！
- [ ] 等待 1-2 分钟（部署有延迟）
- [ ] 清除浏览器缓存

### Q3: book/ 目录太大，影响仓库？

**说明：**
- book/ 主要是 HTML、CSS、JS 文件
- 通常几 MB，不会太大
- 如果担心可以考虑使用 Actions 部署方式

**优化建议：**
- 图片使用外部 CDN
- 不在 book/ 中放大文件
- 定期清理不需要的旧文件

### Q4: 工作流失败：无法推送 book/

**可能原因：**
1. 权限不足
2. .gitignore 忽略了 book/
3. book/ 目录为空

**解决：**
1. 检查工作流权限：`contents: write`
2. 确认 .gitignore 不包含 `book/`
3. 查看 Actions 详细日志

### Q5: 提交历史混乱？

**说明：** 每次构建都会提交 book/，会产生很多提交

**优化：**
- 已使用 `[skip ci]` 避免循环
- 可以定期合并提交（squash）
- 或考虑使用 Actions 部署方式

---

## 📊 优缺点

### 优点

✅ **简单直观**：代码和网站在一起  
✅ **易于理解**：可以直接看到网站文件  
✅ **无需额外配置**：标准的 Git 操作  
✅ **可以手动修改**：可以直接编辑 book/ 中的文件  

### 缺点

⚠️ **仓库变大**：包含所有构建文件  
⚠️ **提交历史多**：每次构建都提交  
⚠️ **需要 /book 选项**：首次需要运行工作流  

---

## 🔄 与其他方案对比

| 特性 | main:/book | gh-pages分支 | Actions部署 |
|------|-----------|-------------|------------|
| 分支数量 | 1 个 ✅ | 2 个 | 1 个 ✅ |
| 仓库大小 | 较大 ⚠️ | 中等 | 小 ✅ |
| 配置复杂度 | 简单 ✅ | 中等 | 简单 ✅ |
| 提交历史 | 较多 ⚠️ | 分离 ✅ | 干净 ✅ |
| 手动修改 | 可以 ✅ | 可以 | 不可以 |

---

## 🚀 快速开始

### 1. 提交代码

```bash
cd /Applications/zhangjunjie/github/CloudFlare-AI-Insight-Daily

git add .
git commit -m "配置 mdbook 分支部署"
git push origin main
```

### 2. 运行工作流

- Actions → Build Daily Journal → Run workflow

### 3. 配置 GitHub Pages

```
Settings → Pages
→ Source: Deploy from a branch
→ Branch: main
→ Folder: /book  ⭐
→ Save
```

### 4. 访问网站

```
https://amjack.github.io/CloudFlare-AI-Insight-Daily/
```

---

## 📝 .gitignore 配置

确保 .gitignore **不包含** `book/`：

```gitignore
# IDE
.idea/
.vscode/

# macOS
.DS_Store

# Node modules
node_modules/

# Logs
*.log

# 注意：book/ 目录需要提交，不要忽略！
# 不要添加: book/
```

---

## 🎯 工作流配置要点

### 权限设置

```yaml
permissions:
  contents: write  # 提交代码需要
```

### 构建和提交

```yaml
- name: Build mdBook
  run: mdbook build

- name: Commit and push mdBook output
  run: |
    git add -f book/  # 强制添加
    git commit -m "自动构建 mdBook 网站 [skip ci]"
    git push origin main
```

---

## 💡 提示

### 首次使用

1. 先运行一次工作流
2. 等待 book/ 目录提交成功
3. 再去配置 GitHub Pages
4. 这样才能看到 /book 选项

### 日常使用

- 每次推送代码自动构建
- 自动更新网站
- 无需手动操作

### 清理建议

如果想清理旧的构建提交：

```bash
# 使用 interactive rebase 合并提交
git rebase -i HEAD~10
```

---

**配置完成！按照步骤操作，你的网站将从 main:/book 部署！** 🎉

