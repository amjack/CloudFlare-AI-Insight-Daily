# Webhook 通知配置指南

## 概述

本项目支持在每日生成 AI 日刊并发布到 GitHub Pages 后，自动发送 webhook 通知。通知格式为：

```
2025-11-28 AI日刊，地址：https://your-username.github.io/your-repo
```

支持的通知平台：
- 钉钉 (DingTalk)
- 企业微信 (WeCom)
- 飞书 (Feishu/Lark)
- Slack
- Discord
- Telegram
- 通用 JSON Webhook

---

## 方案一：GitHub Actions 配置（推荐）

适用于使用 GitHub Actions 自动部署的用户。

### 1. 获取 Webhook URL

根据您使用的平台获取 webhook URL：

#### 钉钉 (DingTalk)
1. 打开钉钉群聊 → 群设置 → 智能群助手 → 添加机器人
2. 选择"自定义"机器人
3. 设置机器人名称和安全设置（建议选择"加签"）
4. 复制 Webhook 地址

#### 企业微信 (WeCom)
1. 打开企业微信群聊 → 群设置 → 群机器人 → 添加机器人
2. 设置机器人名称
3. 复制 Webhook 地址

#### 飞书 (Feishu)
1. 打开飞书群聊 → 设置 → 群机器人 → 添加机器人
2. 选择"自定义机器人"
3. 设置机器人名称和描述
4. 安全设置可选择"无"
5. 复制 Webhook 地址

#### Slack
1. 访问 https://api.slack.com/messaging/webhooks
2. 创建新的 Incoming Webhook
3. 选择目标频道
4. 复制 Webhook URL

#### Discord
1. 打开 Discord 服务器设置 → 整合 → Webhooks
2. 创建新的 Webhook
3. 设置名称和频道
4. 复制 Webhook URL

#### Telegram
1. 与 @BotFather 对话创建新 bot
2. 获取 bot token
3. 将 bot 添加到目标群组
4. 获取 chat_id（可以通过访问 `https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getUpdates`）
5. Webhook URL 格式：`https://api.telegram.org/bot<TOKEN>/sendMessage?chat_id=<CHAT_ID>`

### 2. 配置 GitHub Secrets

在您的 GitHub 仓库中：

1. 进入 `Settings` → `Secrets and variables` → `Actions`
2. 点击 `New repository secret`
3. 添加以下 Secret：

| 名称 | 值 | 说明 |
|------|-----|------|
| `WEBHOOK_URL` | 您的 webhook URL | 必需，上一步获取的 webhook 地址 |

### 3. 配置 GitHub Variables

1. 在 `Settings` → `Secrets and variables` → `Actions` 的 `Variables` 标签页
2. 点击 `New repository variable`
3. 添加以下 Variables：

| 名称 | 值 | 说明 |
|------|-----|------|
| `WEBHOOK_TYPE` | `dingtalk`/`wecom`/`feishu`/`slack`/`discord`/`telegram`/`generic` | 可选，默认 `generic` |
| `GITHUB_PAGES_URL` | `https://your-username.github.io/your-repo` | 可选，默认使用仓库的 GitHub Pages 地址 |

### 4. 触发测试

手动触发一次 GitHub Actions 工作流：

1. 进入 `Actions` 标签页
2. 选择 `Build Daily Journal` 工作流
3. 点击 `Run workflow`
4. 等待执行完成，检查是否收到 webhook 通知

---

## 方案二：Docker 部署配置

适用于使用 Docker 在本地或服务器部署的用户。

### 1. 修改 Dockerfile

编辑 `cron-docker/Dockerfile`，取消注释并修改以下环境变量：

```dockerfile
# Webhook 通知配置
ENV WEBHOOK_URL="https://your-webhook-url"
ENV WEBHOOK_TYPE="dingtalk"
ENV GITHUB_PAGES_URL="https://your-username.github.io/your-repo"
```

**或者**在运行容器时通过 `-e` 参数传入：

```bash
docker run -d \
  --name ai-daily-cron \
  -p 4399:4399 \
  -e WEBHOOK_URL="https://your-webhook-url" \
  -e WEBHOOK_TYPE="dingtalk" \
  -e GITHUB_PAGES_URL="https://your-username.github.io/your-repo" \
  --restart always \
  ai-daily-cron-job
```

### 2. 重新构建并运行

```bash
cd cron-docker
docker build -t ai-daily-cron-job .
docker run -d \
  --name ai-daily-cron \
  -p 4399:4399 \
  -e WEBHOOK_URL="你的webhook地址" \
  -e WEBHOOK_TYPE="dingtalk" \
  -e GITHUB_PAGES_URL="https://your-username.github.io/your-repo" \
  --restart always \
  ai-daily-cron-job
```

### 3. 测试

进入容器手动执行构建脚本测试：

```bash
docker exec -it ai-daily-cron /bin/sh
/app/scripts/build.sh /app/scripts/work
```

查看是否收到 webhook 通知。

---

## Webhook 类型说明

### `dingtalk` - 钉钉

发送格式：
```json
{
  "msgtype": "text",
  "text": {
    "content": "2025-11-28 AI日刊，地址：https://..."
  }
}
```

### `wecom` / `wechat` - 企业微信

发送格式：
```json
{
  "msgtype": "text",
  "text": {
    "content": "2025-11-28 AI日刊，地址：https://..."
  }
}
```

### `feishu` / `lark` - 飞书

发送格式：
```json
{
  "msg_type": "text",
  "content": {
    "text": "2025-11-28 AI日刊，地址：https://..."
  }
}
```

### `slack` - Slack

发送格式：
```json
{
  "text": "2025-11-28 AI日刊，地址：https://..."
}
```

### `discord` - Discord

发送格式：
```json
{
  "content": "2025-11-28 AI日刊，地址：https://..."
}
```

### `telegram` - Telegram

发送格式：
```json
{
  "text": "2025-11-28 AI日刊，地址：https://..."
}
```

### `generic` - 通用 JSON（默认）

发送格式：
```json
{
  "date": "2025-11-28",
  "title": "AI日刊",
  "url": "https://...",
  "message": "2025-11-28 AI日刊，地址：https://..."
}
```

适用于自定义接收端处理。

---

## 常见问题

### 1. Webhook 通知没有发送？

**检查项：**
- 确认已配置 `WEBHOOK_URL`
- 检查 GitHub Actions 日志中的 "Send Webhook Notification" 步骤
- 确认 webhook URL 是否正确
- 检查网络连接

### 2. 收到通知但格式不对？

**解决方案：**
- 检查 `WEBHOOK_TYPE` 是否设置正确
- 不同平台的 webhook 格式不同，确保类型匹配
- 可以查看平台的 webhook 文档确认格式

### 3. 想要自定义通知内容？

**修改方式：**

对于 GitHub Actions，编辑 `.github/workflows/build-daily-book.yml` 中的 `MESSAGE` 变量：

```yaml
MESSAGE="${TODAY_DATE} AI日刊，地址：${PAGES_URL}"
```

对于 Docker，编辑 `cron-docker/scripts/work/webhook.sh` 中的 `MESSAGE` 变量：

```bash
MESSAGE="${TODAY_DATE} AI日刊，地址：${GITHUB_PAGES_URL}"
```

### 4. 如何测试 webhook 是否配置正确？

**GitHub Actions：**
```bash
# 手动触发工作流测试
```

**Docker：**
```bash
# 进入容器
docker exec -it ai-daily-cron /bin/sh

# 手动执行 webhook 脚本
WEBHOOK_URL="你的webhook地址" \
WEBHOOK_TYPE="dingtalk" \
GITHUB_PAGES_URL="https://test.com" \
/app/scripts/work/webhook.sh
```

### 5. 支持同时发送到多个 webhook 吗？

目前不支持。如果需要发送到多个 webhook，有两种方案：

**方案 A：** 复制 webhook 通知步骤，使用不同的 Secret 名称

**方案 B：** 使用中转服务（如 Zapier、IFTTT）将一个 webhook 转发到多个目标

---

## 高级配置

### 自定义 webhook 脚本

webhook 脚本位于 `cron-docker/scripts/work/webhook.sh`，您可以：

1. 添加新的通知平台支持
2. 自定义消息格式
3. 添加失败重试逻辑
4. 添加日志记录

示例：添加企业微信 markdown 格式支持

```bash
"wecom-markdown")
  curl -X POST "${WEBHOOK_URL}" \
    -H 'Content-Type: application/json' \
    -d "{
      \"msgtype\": \"markdown\",
      \"markdown\": {
        \"content\": \"### ${TODAY_DATE} AI日刊\\n\\n[点击访问](${GITHUB_PAGES_URL})\"
      }
    }"
  ;;
```

### 添加重试机制

在 webhook 脚本中添加重试逻辑：

```bash
# 最多重试 3 次
MAX_RETRIES=3
RETRY_COUNT=0

while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
  if send_webhook; then
    echo "✅ Webhook 通知发送成功"
    exit 0
  else
    RETRY_COUNT=$((RETRY_COUNT + 1))
    echo "❌ Webhook 通知发送失败，重试 $RETRY_COUNT/$MAX_RETRIES"
    sleep 5
  fi
done

echo "❌ Webhook 通知发送失败，已达最大重试次数"
exit 1
```

---

## 安全建议

1. **不要将 webhook URL 提交到代码仓库**
   - 使用 GitHub Secrets 或环境变量
   - 在 Dockerfile 中使用注释或构建参数

2. **启用 webhook 安全设置**
   - 钉钉：使用"加签"方式
   - 企业微信：设置 IP 白名单
   - 飞书：使用签名验证

3. **定期轮换 webhook URL**
   - 建议每 3-6 个月更新一次
   - 如果泄露立即更换

4. **监控异常通知**
   - 关注是否有非预期的通知
   - 检查 webhook 调用日志

---

## 技术支持

如有问题，请在 GitHub 仓库提 [Issue](https://github.com/justlovemaki/CloudFlare-AI-Insight-Daily/issues)。

欢迎贡献代码，添加更多通知平台支持！

