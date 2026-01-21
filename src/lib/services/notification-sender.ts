'use server'

import { prisma } from '@/lib/db'
import { sendEmail } from '@/lib/email'

/**
 * 통합 알림 발송 서비스
 * - 인앱 알림 생성
 * - 이메일 발송 (설정된 경우)
 * - 발송 로그 기록
 */

interface NotificationOptions {
  userId: string
  type: string
  title: string
  content: string
  link?: string
  email?: {
    to: string
    subject?: string
    html?: string
  }
  skipInApp?: boolean
  skipEmail?: boolean
}

interface NotificationResult {
  inApp: boolean
  email: boolean
  error?: string
}

/**
 * 통합 알림 발송
 */
export async function sendNotification(options: NotificationOptions): Promise<NotificationResult> {
  const result: NotificationResult = { inApp: false, email: false }

  try {
    // 1. 인앱 알림 생성
    if (!options.skipInApp) {
      await prisma.notification.create({
        data: {
          userId: options.userId,
          type: options.type,
          title: options.title,
          content: options.content,
          link: options.link,
        },
      })
      result.inApp = true
    }

    // 2. 이메일 발송 (설정된 경우)
    if (!options.skipEmail && options.email?.to && process.env.SMTP_HOST) {
      // 이메일은 항상 발송 (이메일 하단 unsubscribe 링크로 수신 거부 가능)
      const emailSent = await sendEmail({
        to: options.email.to,
        subject: options.email.subject || `[유니피벗] ${options.title}`,
        html: options.email.html || generateEmailHtml(options.title, options.content, options.link),
      })
      result.email = emailSent
    }

    // 3. 알림 로그 기록
    await prisma.notificationLog.create({
      data: {
        recipientId: options.userId,
        type: options.type,
        subject: options.title,
        content: options.content,
        channel: result.email ? 'EMAIL' : 'IN_APP',
        status: 'SENT',
        sentAt: new Date(),
      },
    })

    return result
  } catch (error) {
    console.error('Notification send error:', error)
    result.error = error instanceof Error ? error.message : 'Unknown error'

    // 실패 로그 기록
    try {
      await prisma.notificationLog.create({
        data: {
          recipientId: options.userId,
          type: options.type,
          subject: options.title,
          content: options.content,
          channel: 'FAILED',
          status: 'FAILED',
          errorMessage: result.error,
        },
      })
    } catch (logError) {
      console.error('Failed to log notification error:', logError)
    }

    return result
  }
}

/**
 * 여러 사용자에게 알림 발송
 */
export async function sendBulkNotifications(
  userIds: string[],
  options: Omit<NotificationOptions, 'userId' | 'email'>
): Promise<{ sent: number; failed: number }> {
  const results = { sent: 0, failed: 0 }

  for (const userId of userIds) {
    // 사용자 이메일 조회
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true },
    })

    const result = await sendNotification({
      ...options,
      userId,
      email: user?.email ? { to: user.email } : undefined,
    })

    if (result.inApp || result.email) {
      results.sent++
    } else {
      results.failed++
    }
  }

  return results
}

/**
 * 관리자 알림 발송
 */
export async function sendAdminNotification(options: {
  type: string
  title: string
  message: string
  data?: Record<string, any>
}) {
  // 관리자 알림 생성
  await prisma.adminNotification.create({
    data: {
      type: options.type,
      title: options.title,
      message: options.message,
      data: options.data ? JSON.stringify(options.data) : undefined,
    },
  })

  // 관리자들에게 이메일 발송 (선택적)
  if (process.env.ADMIN_EMAIL && process.env.SMTP_HOST) {
    await sendEmail({
      to: process.env.ADMIN_EMAIL,
      subject: `[유니피벗 관리자] ${options.title}`,
      html: generateEmailHtml(options.title, options.message),
    })
  }
}

/**
 * 이메일 HTML 생성
 */
function generateEmailHtml(title: string, content: string, link?: string): string {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://unipivot.org'

  return `
    <div style="font-family: 'Noto Sans KR', -apple-system, BlinkMacSystemFont, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff;">
      <div style="background: linear-gradient(135deg, #FF6B35, #E55A2B); padding: 32px; text-align: center;">
        <h1 style="color: white; margin: 0; font-size: 24px;">유니피벗</h1>
      </div>
      <div style="padding: 40px 32px; background: #f9fafb;">
        <h2 style="color: #111827; margin: 0 0 16px 0; font-size: 20px;">${title}</h2>
        <p style="color: #4b5563; line-height: 1.8; margin: 0 0 24px 0; white-space: pre-wrap;">${content}</p>
        ${link ? `
          <a href="${siteUrl}${link}"
             style="display: inline-block; padding: 14px 28px; background: #FF6B35; color: white; text-decoration: none; border-radius: 8px; font-weight: 500;">
            자세히 보기
          </a>
        ` : ''}
      </div>
      <div style="padding: 24px 32px; text-align: center; color: #9ca3af; font-size: 12px; border-top: 1px solid #e5e7eb;">
        <p style="margin: 0 0 8px 0;">&copy; ${new Date().getFullYear()} UniPivot. All rights reserved.</p>
        <p style="margin: 0;">
          <a href="${siteUrl}/mypage/settings/notifications" style="color: #9ca3af;">알림 설정 변경</a>
        </p>
      </div>
    </div>
  `
}

/**
 * 설문 리마인더 이메일 HTML
 */
export async function generateSurveyReminderEmail(
  userName: string | null,
  surveyTitle: string,
  daysUntilDeadline: number,
  surveyLink: string
): Promise<string> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://unipivot.org'
  const name = userName || '회원'

  return `
    <div style="font-family: 'Noto Sans KR', -apple-system, BlinkMacSystemFont, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff;">
      <div style="background: linear-gradient(135deg, #FF6B35, #E55A2B); padding: 32px; text-align: center;">
        <h1 style="color: white; margin: 0; font-size: 24px;">유니피벗</h1>
      </div>
      <div style="padding: 40px 32px; background: #f9fafb;">
        <h2 style="color: #111827; margin: 0 0 16px 0; font-size: 20px;">${name}님, 만족도 조사 참여를 부탁드립니다</h2>
        <div style="background: white; padding: 20px; border-radius: 12px; margin: 24px 0; border: 1px solid #e5e7eb;">
          <h3 style="color: #FF6B35; margin: 0 0 12px 0; font-size: 18px;">${surveyTitle}</h3>
          <p style="color: #6b7280; margin: 0; display: flex; align-items: center; gap: 8px;">
            <span style="color: #ef4444; font-weight: 600;">⏰ 마감까지 ${daysUntilDeadline}일 남았습니다</span>
          </p>
        </div>
        <p style="color: #4b5563; line-height: 1.8; margin: 0 0 24px 0;">
          프로그램 개선을 위해 소중한 의견을 남겨주세요.<br>
          설문은 약 3분 정도 소요됩니다.
        </p>
        <a href="${siteUrl}${surveyLink}"
           style="display: inline-block; padding: 14px 28px; background: #FF6B35; color: white; text-decoration: none; border-radius: 8px; font-weight: 500;">
          설문 참여하기
        </a>
      </div>
      <div style="padding: 24px 32px; text-align: center; color: #9ca3af; font-size: 12px; border-top: 1px solid #e5e7eb;">
        <p style="margin: 0;">&copy; ${new Date().getFullYear()} UniPivot. All rights reserved.</p>
      </div>
    </div>
  `
}

/**
 * RSVP 알림 이메일 HTML
 */
export async function generateRsvpEmail(
  userName: string | null,
  sessionTitle: string,
  sessionDate: string,
  rsvpLink: string
): Promise<string> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://unipivot.org'
  const name = userName || '회원'

  return `
    <div style="font-family: 'Noto Sans KR', -apple-system, BlinkMacSystemFont, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff;">
      <div style="background: linear-gradient(135deg, #FF6B35, #E55A2B); padding: 32px; text-align: center;">
        <h1 style="color: white; margin: 0; font-size: 24px;">유니피벗</h1>
      </div>
      <div style="padding: 40px 32px; background: #f9fafb;">
        <h2 style="color: #111827; margin: 0 0 16px 0; font-size: 20px;">${name}님, 참석 여부를 알려주세요</h2>
        <div style="background: white; padding: 20px; border-radius: 12px; margin: 24px 0; border: 1px solid #e5e7eb;">
          <h3 style="color: #FF6B35; margin: 0 0 12px 0; font-size: 18px;">${sessionTitle}</h3>
          <p style="color: #6b7280; margin: 0;">
            📅 ${sessionDate}
          </p>
        </div>
        <p style="color: #4b5563; line-height: 1.8; margin: 0 0 24px 0;">
          원활한 모임 운영을 위해 참석 여부를 미리 알려주세요.
        </p>
        <a href="${siteUrl}${rsvpLink}"
           style="display: inline-block; padding: 14px 28px; background: #FF6B35; color: white; text-decoration: none; border-radius: 8px; font-weight: 500;">
          참석 응답하기
        </a>
      </div>
      <div style="padding: 24px 32px; text-align: center; color: #9ca3af; font-size: 12px; border-top: 1px solid #e5e7eb;">
        <p style="margin: 0;">&copy; ${new Date().getFullYear()} UniPivot. All rights reserved.</p>
      </div>
    </div>
  `
}

/**
 * 진행자 알림 이메일 HTML
 */
export async function generateFacilitatorEmail(
  facilitatorName: string | null,
  title: string,
  content: string,
  link?: string
): Promise<string> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://unipivot.org'
  const name = facilitatorName || '진행자'

  return `
    <div style="font-family: 'Noto Sans KR', -apple-system, BlinkMacSystemFont, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff;">
      <div style="background: linear-gradient(135deg, #6366f1, #4f46e5); padding: 32px; text-align: center;">
        <h1 style="color: white; margin: 0; font-size: 24px;">유니피벗 진행자</h1>
      </div>
      <div style="padding: 40px 32px; background: #f9fafb;">
        <h2 style="color: #111827; margin: 0 0 16px 0; font-size: 20px;">${name}님, ${title}</h2>
        <p style="color: #4b5563; line-height: 1.8; margin: 0 0 24px 0; white-space: pre-wrap;">${content}</p>
        ${link ? `
          <a href="${siteUrl}${link}"
             style="display: inline-block; padding: 14px 28px; background: #6366f1; color: white; text-decoration: none; border-radius: 8px; font-weight: 500;">
            확인하기
          </a>
        ` : ''}
      </div>
      <div style="padding: 24px 32px; text-align: center; color: #9ca3af; font-size: 12px; border-top: 1px solid #e5e7eb;">
        <p style="margin: 0;">&copy; ${new Date().getFullYear()} UniPivot. All rights reserved.</p>
      </div>
    </div>
  `
}
