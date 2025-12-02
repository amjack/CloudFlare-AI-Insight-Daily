# GitHub Pages - Actions 部署方案

## ✅ 新方案说明

我已经将部署方式改为 **GitHub Actions 直接部署**，这种方式：

- ✅ **更简洁**：不需要将 book/ 目录提交到仓库
- ✅ **更安全**：避免 submodule 问题
- ✅ **更快速**：直接部署构建产物
- ✅ **更标准**：使用 GitHub 官方推荐的方式

---

## 🔄 与之前的区别

### 之前的方案（已废弃）
```
构建 mdbook → 提交 book/ 到 main 分支 → GitHub Pages 从 main:/book 部署
```

**问题：**
- ❌ 需要提交大量构建文件
- ❌ 可能遇到 submodule 问题
- ❌ 仓库变大
- ❌ 提交历史混乱

### 新方案（推荐）✨
```
构建 mdbook → 上传为 artifact → GitHub Pages 直接部署
```

**优势：**
- ✅ 仓库保持干净
- ✅ 不需要 /book 文件夹选项
- ✅ 自动化程度更高
- ✅ 符合官方最佳实践

---

## ⚙️ GitHub Pages 配置

### 重要：修改部署源

1. **打开 GitHub Pages 设置**
   
   访问：https://github.com/amjack/CloudFlare-AI-Insight-Daily/settings/pages

2. **配置部署源**
   
   在 "Build and deployment" 下：
   - **Source:** 选择 `GitHub Actions` ⭐ **（重要！不是 Deploy from a branch）**

3. **保存**

### 配置截图说明

```
┌─────────────────────────────────────┐
│ Build and deployment                │
├─────────────────────────────────────┤
│ Source: GitHub Actions       ▼  ⭐  │
│         └─ 必须选这个！              │
│                                     │
│ (不需要选择分支和文件夹)             │
└─────────────────────────────────────┘
```

**注意：** 选择 `GitHub Actions` 后，分支和文件夹选项会消失，这是正常的！

---

## 🚀 工作流程

### 完整流程

```
1. GitHub Actions 触发
   ↓
2. 签出 main 分支代码
   ↓
3. 归档旧日刊
   ↓
4. 提交变更到 main
   ↓
5. 安装 mdbook
   ↓
6. 构建 mdbook
   ↓
7. Setup Pages (配置)
   ↓
8. Upload artifact (上传构建产物)
   ↓
9. Deploy to GitHub Pages (部署)
   ↓
10. 发送 webhook 通知
   ↓
11. 网站上线！
```

### 工作流关键步骤

```yaml
# 构建 mdBook
- name: Build mdBook
  run: mdbook build

# 配置 Pages
- name: Setup Pages
  uses: actions/configure-pages@v4

# 上传构建产物
- name: Upload artifact
  uses: actions/upload-pages-artifact@v3
  with:
    path: ./book

# 部署到 GitHub Pages
- name: Deploy to GitHub Pages
  id: deployment
  uses: actions/deploy-pages@v4
```

---

## 📝 验证部署

### 1. 检查工作流权限

确保工作流有正确的权限：

```yaml
permissions:
  contents: write
  pages: write        # ← 部署 Pages 需要
  id-token: write     # ← 身份验证需要
```

### 2. 运行工作流

1. 提交代码
   ```bash
   git add .github/workflows/build-daily-book.yml
   git commit -m "改用 GitHub Actions 部署 GitHub Pages"
   git push origin main
   ```

2. 或手动触发：
   - Actions → Build Daily Journal → Run workflow

### 3. 查看执行日志

工作流应该显示：

```
✅ Setup mdBook
✅ Build mdBook
   - mdBook 构建完成
✅ Setup Pages
✅ Upload artifact
✅ Deploy to GitHub Pages
   - Deployment ID: xxx
   - URL: https://amjack.github.io/CloudFlare-AI-Insight-Daily/
✅ Send Webhook Notification
```

### 4. 访问网站

等待 1-2 分钟后访问：
```
https://amjack.github.io/CloudFlare-AI-Insight-Daily/
```

应该能看到精美的 mdbook 网站！

---

## 🎯 优势对比

| 特性 | Actions 部署 ⭐ | main:/book 部署 | gh-pages 分支 |
|------|----------------|----------------|--------------|
| **仓库清洁度** | ✅ 干净 | ❌ book/ 在主分支 | ✅ 分离 |
| **配置复杂度** | ✅ 简单 | ⚠️ 需要选 /book | ⚠️ 管理两个分支 |
| **部署速度** | ✅ 快 | ⚠️ 慢（需要提交） | ⚠️ 慢 |
| **submodule问题** | ✅ 无 | ❌ 可能有 | ✅ 无 |
| **官方推荐** | ✅ 是 | ❌ 否 | ⚠️ 旧方式 |
| **配置难度** | ✅ 最简单 | ⚠️ 中等 | ⚠️ 中等 |

**推荐：** 使用 Actions 部署方式 ⭐

---

## ⚠️ 常见问题

### Q1: 为什么看不到 /book 文件夹选项？

**答：** 因为使用了 GitHub Actions 部署，不需要选择文件夹！

- **旧方式：** Deploy from a branch → 需要选择分支和文件夹
- **新方式：** GitHub Actions → 自动部署，无需选择

### Q2: 需要删除 main 分支的 book/ 目录吗？

**答：** 可以删除，也可以保留。

- 保留也不影响，GitHub Actions 会覆盖部署
- 删除可以让仓库更干净

```bash
# 如果想删除（可选）
git rm -rf book/
git commit -m "移除 book/ 目录，改用 Actions 部署"
git push origin main
```

### Q3: 之前配置的 main:/book 会影响吗？

**答：** 不会。一旦选择 `GitHub Actions`，之前的分支配置就失效了。

### Q4: 部署失败怎么办？

**检查清单：**

1. ✅ Settings → Pages → Source 是否选择了 `GitHub Actions`
2. ✅ 工作流权限是否正确（pages: write, id-token: write）
3. ✅ 查看 Actions 日志，找到具体错误
4. ✅ 确认 mdbook build 成功

### Q5: 可以同时使用多种部署方式吗？

**答：** 不可以。只能选择一种：

- `Deploy from a branch` （分支部署）
- `GitHub Actions` （Actions 部署）⭐ 推荐

---

## 📋 迁移步骤

### 从旧方式迁移到 Actions 部署

#### 步骤 1：修改 GitHub Pages 设置

1. Settings → Pages
2. Source 改为 `GitHub Actions`
3. 保存

#### 步骤 2：提交新的工作流

```bash
git add .github/workflows/build-daily-book.yml
git commit -m "改用 GitHub Actions 部署"
git push origin main
```

#### 步骤 3：（可选）清理 book/ 目录

```bash
# 可选：从仓库中删除
git rm -rf book/
git commit -m "清理 book/ 目录"
git push origin main
```

#### 步骤 4：运行工作流

手动触发一次工作流，验证部署成功。

#### 步骤 5：验证

访问 https://amjack.github.io/CloudFlare-AI-Insight-Daily/

---

## 🔧 工作流权限配置

### 必需的权限

```yaml
permissions:
  contents: write      # 提交代码需要
  pages: write         # 部署 Pages 需要 ⭐
  id-token: write      # OIDC 认证需要 ⭐
```

### 检查仓库设置

1. Settings → Actions → General
2. Workflow permissions
3. 选择 `Read and write permissions`
4. 勾选 `Allow GitHub Actions to create and approve pull requests`
5. 保存

---

## 🎉 完成

使用 GitHub Actions 部署的优势：

✅ **简单**：只需选择 "GitHub Actions"，无需其他配置  
✅ **快速**：直接部署构建产物，无需提交  
✅ **干净**：仓库不包含构建文件  
✅ **标准**：GitHub 官方推荐的最佳实践  
✅ **可靠**：避免 submodule、文件冲突等问题  

---

## 📚 相关资源

- [GitHub Pages 官方文档](https://docs.github.com/pages)
- [actions/deploy-pages 文档](https://github.com/actions/deploy-pages)
- [mdBook 官方文档](https://rust-lang.github.io/mdBook/)

---

**现在提交代码，配置 GitHub Pages 为 "GitHub Actions"，你的网站就能正常访问了！** 🎊

