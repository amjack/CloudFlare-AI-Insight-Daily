#!/bin/sh

# Webhook 通知脚本
# 用于在 GitHub Pages 更新后发送通知
# 支持: 钉钉、企业微信、飞书、Slack、Discord 等

set -e

# --- 配置 ---
WEBHOOK_URL=${WEBHOOK_URL}          # Webhook URL
WEBHOOK_TYPE=${WEBHOOK_TYPE:-"generic"}  # Webhook 类型: dingtalk, wecom, feishu, slack, discord, generic
GITHUB_PAGES_URL=${GITHUB_PAGES_URL}     # GitHub Pages 访问地址

# --- 帮助信息 ---
usage() {
  echo "用法: $0 [date]"
  echo ""
  echo "参数:"
  echo "  date    可选，日期格式 YYYY-MM-DD，默认为今天"
  echo ""
  echo "环境变量:"
  echo "  WEBHOOK_URL        必需，Webhook 推送地址"
  echo "  WEBHOOK_TYPE       可选，Webhook 类型 (dingtalk/wecom/feishu/slack/discord/generic)"
  echo "  GITHUB_PAGES_URL   必需，GitHub Pages 访问地址"
  echo ""
  echo "示例:"
  echo "  $0"
  echo "  $0 2025-11-28"
  exit 1
}

# --- 必要检查 ---
if [ -z "$WEBHOOK_URL" ]; then
  echo "错误: WEBHOOK_URL 环境变量未设置"
  usage
fi

if [ -z "$GITHUB_PAGES_URL" ]; then
  echo "错误: GITHUB_PAGES_URL 环境变量未设置"
  usage
fi

if ! command -v curl &> /dev/null; then
    echo "错误: curl 未安装"
    exit 1
fi

# --- 获取日期 ---
if [ -n "$1" ]; then
  TODAY_DATE="$1"
else
  # 设置时区为 Asia/Shanghai (东八区)
  TODAY_DATE=$(TZ="Asia/Shanghai" date +%Y-%m-%d)
fi

# --- 构造通知消息 ---
MESSAGE="${TODAY_DATE} AI日刊，地址：${GITHUB_PAGES_URL}"

echo "准备发送 webhook 通知: ${MESSAGE}"
echo "Webhook 类型: ${WEBHOOK_TYPE}"

# --- 根据不同类型发送通知 ---
send_webhook() {
  case "${WEBHOOK_TYPE}" in
    "dingtalk")
      # 钉钉 webhook
      echo "发送钉钉通知..."
      curl -X POST "${WEBHOOK_URL}" \
        -H 'Content-Type: application/json' \
        -d "{
          \"msgtype\": \"text\",
          \"text\": {
            \"content\": \"${MESSAGE}\"
          }
        }"
      ;;
    
    "wecom"|"wechat")
      # 企业微信 webhook
      echo "发送企业微信通知..."
      curl -X POST "${WEBHOOK_URL}" \
        -H 'Content-Type: application/json' \
        -d "{
          \"msgtype\": \"text\",
          \"text\": {
            \"content\": \"${MESSAGE}\"
          }
        }"
      ;;
    
    "feishu"|"lark")
      # 飞书 webhook
      echo "发送飞书通知..."
      curl -X POST "${WEBHOOK_URL}" \
        -H 'Content-Type: application/json' \
        -d "{
          \"msg_type\": \"text\",
          \"content\": {
            \"text\": \"${MESSAGE}\"
          }
        }"
      ;;
    
    "slack")
      # Slack webhook
      echo "发送 Slack 通知..."
      curl -X POST "${WEBHOOK_URL}" \
        -H 'Content-Type: application/json' \
        -d "{
          \"text\": \"${MESSAGE}\"
        }"
      ;;
    
    "discord")
      # Discord webhook
      echo "发送 Discord 通知..."
      curl -X POST "${WEBHOOK_URL}" \
        -H 'Content-Type: application/json' \
        -d "{
          \"content\": \"${MESSAGE}\"
        }"
      ;;
    
    "telegram")
      # Telegram Bot API
      # WEBHOOK_URL 格式: https://api.telegram.org/bot<TOKEN>/sendMessage?chat_id=<CHAT_ID>
      echo "发送 Telegram 通知..."
      curl -X POST "${WEBHOOK_URL}" \
        -H 'Content-Type: application/json' \
        -d "{
          \"text\": \"${MESSAGE}\"
        }"
      ;;
    
    *)
      # 通用 JSON webhook (默认)
      echo "发送通用 JSON webhook 通知..."
      curl -X POST "${WEBHOOK_URL}" \
        -H 'Content-Type: application/json' \
        -d "{
          \"date\": \"${TODAY_DATE}\",
          \"title\": \"AI日刊\",
          \"url\": \"${GITHUB_PAGES_URL}\",
          \"message\": \"${MESSAGE}\"
        }"
      ;;
  esac
}

# 执行发送
if send_webhook; then
  echo "✅ Webhook 通知发送成功"
  exit 0
else
  echo "❌ Webhook 通知发送失败"
  exit 1
fi

