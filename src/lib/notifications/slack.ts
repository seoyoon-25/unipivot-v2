export async function sendSlackAlert(message: {
  title: string
  text: string
  level: 'info' | 'warning' | 'error'
}) {
  const webhookUrl = process.env.SLACK_WEBHOOK_URL
  if (!webhookUrl) return

  const colors: Record<string, string> = {
    info: '#3B82F6',
    warning: '#F59E0B',
    error: '#EF4444',
  }

  try {
    await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        attachments: [
          {
            color: colors[message.level],
            title: message.title,
            text: message.text,
            ts: Math.floor(Date.now() / 1000),
          },
        ],
      }),
    })
  } catch {
    // Slack 알림 실패는 조용히 무시 (주요 기능에 영향 없음)
  }
}
