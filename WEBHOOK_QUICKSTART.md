# Webhook 通知快速配置指南

> 快速配置 webhook 通知，在 AI 日刊发布后自动接收推送

## 通知效果

每次日刊发布到 GitHub Pages 后，您将收到如下格式的通知：

```
2025-11-28 AI日刊，地址：https://your-username.github.io/your-repo
```

---

## 快速开始（GitHub Actions）

### 步骤 1：获取 Webhook URL

以钉钉为例：

1. 打开钉钉群聊
2. 点击右上角 `...` → `群设置` → `智能群助手`
3. 点击 `添加机器人` → 选择 `自定义`
4. 设置机器人名称（如：AI日刊通知）
5. 安全设置选择 `自定义关键词`，添加关键词：`AI日刊`
6. 点击完成，**复制 Webhook 地址**

### 步骤 2：配置 GitHub Secret

1. 打开你的 GitHub 仓库
2. 进入 `Settings` → `Secrets and variables` → `Actions`
3. 点击 `New repository secret`
4. 添加以下配置：
   - Name: `WEBHOOK_URL`
   - Secret: 粘贴刚才复制的 webhook 地址
5. 点击 `Add secret`

### 步骤 3：配置 Webhook 类型

1. 在同一页面切换到 `Variables` 标签
2. 点击 `New repository variable`
3. 添加以下配置：
   - Name: `WEBHOOK_TYPE`
   - Value: `dingtalk` （钉钉）
4. （可选）添加自定义 GitHub Pages URL：
   - Name: `GITHUB_PAGES_URL`
   - Value: `https://your-username.github.io/your-repo`

### 步骤 4：测试

1. 进入 `Actions` 标签页
2. 选择 `Build Daily Journal` 工作流
3. 点击 `Run workflow` → `Run workflow`
4. 等待执行完成（约 1-2 分钟）
5. 检查钉钉群是否收到通知

✅ 如果收到通知，配置成功！

---

## 各平台配置对照表

| 平台 | WEBHOOK_TYPE | 获取 Webhook URL 方式 | 安全设置建议 |
|------|--------------|---------------------|-------------|
| 钉钉 | `dingtalk` | 群设置 → 智能群助手 → 自定义机器人 | 关键词：`AI日刊` |
| 企业微信 | `wecom` | 群设置 → 群机器人 → 添加机器人 | - |
| 飞书 | `feishu` | 群设置 → 群机器人 → 自定义机器人 | 无需签名验证 |
| Slack | `slack` | https://api.slack.com/messaging/webhooks | - |
| Discord | `discord` | 服务器设置 → 整合 → Webhooks | - |
| Telegram | `telegram` | @BotFather 创建 bot，获取 token | - |

---

## 常见问题

### Q: 没有收到通知怎么办？

**检查清单：**

1. ✅ 确认已正确配置 `WEBHOOK_URL` Secret
2. ✅ 确认 `WEBHOOK_TYPE` Variable 设置正确
3. ✅ 查看 GitHub Actions 日志，搜索 "Send Webhook Notification"
4. ✅ 检查 webhook URL 是否过期
5. ✅ 确认机器人的安全设置（如钉钉关键词）

### Q: 如何查看 GitHub Actions 日志？

1. 进入 `Actions` 标签页
2. 点击最近一次的工作流运行
3. 点击 `build-book` 任务
4. 展开 `Send Webhook Notification` 步骤
5. 查看详细日志输出

### Q: 支持同时发送到多个平台吗？

目前不支持直接配置多个 webhook。如有需求，可以：

**方案 A：** 在工作流中复制 webhook 步骤，使用不同的 Secret 名称

**方案 B：** 使用 webhook 中转服务（如 Zapier）

### Q: 能自定义通知内容吗？

可以！编辑 `.github/workflows/build-daily-book.yml` 文件：

```yaml
# 找到这一行
MESSAGE="${TODAY_DATE} AI日刊，地址：${PAGES_URL}"

# 修改为你想要的格式，例如：
MESSAGE="📰 ${TODAY_DATE} AI日刊已发布\n🔗 ${PAGES_URL}\n👀 快来查看吧！"
```

### Q: 如何关闭 webhook 通知？

删除 `WEBHOOK_URL` Secret 即可。工作流会自动跳过通知步骤。

---

## Docker 部署快速配置

如果你使用 Docker 方式部署：

```bash
docker run -d \
  --name ai-daily-cron \
  -p 4399:4399 \
  -e WEBHOOK_URL="你的webhook地址" \
  -e WEBHOOK_TYPE="dingtalk" \
  -e GITHUB_PAGES_URL="https://your-username.github.io/your-repo" \
  --restart always \
  ai-daily-cron-job
```

---

## 需要帮助？

- 📖 详细文档：[docs/WEBHOOK.md](docs/WEBHOOK.md)
- 🐛 问题反馈：[GitHub Issues](https://github.com/justlovemaki/CloudFlare-AI-Insight-Daily/issues)
- 💬 交流讨论：见 README 中的微信群二维码

---

**祝您配置顺利！🎉**

