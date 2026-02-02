import nodemailer from 'nodemailer'
import { prisma } from './db'

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_PORT === '465',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
})

interface EmailOptions {
  to: string
  subject: string
  html: string
  text?: string
}

export async function sendEmail({ to, subject, html, text }: EmailOptions): Promise<boolean> {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM || 'noreply@unipivot.org',
      to,
      subject,
      html,
      text: text || html.replace(/<[^>]*>/g, ''),
    })

    await prisma.emailLog.create({
      data: {
        to,
        subject,
        content: html,
        status: 'SENT',
      },
    })

    return true
  } catch (error) {
    console.error('Email send error:', error)

    await prisma.emailLog.create({
      data: {
        to,
        subject,
        content: html,
        status: 'FAILED',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
    })

    return false
  }
}

export async function sendWelcomeEmail(email: string, name: string): Promise<boolean> {
  const html = `
    <div style="font-family: 'Noto Sans KR', sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #FF6B35, #E55A2B); padding: 40px; text-align: center;">
        <h1 style="color: white; margin: 0;">유니피벗</h1>
      </div>
      <div style="padding: 40px; background: #f9fafb;">
        <h2 style="color: #111827; margin-bottom: 20px;">${name}님, 환영합니다!</h2>
        <p style="color: #4b5563; line-height: 1.8;">
          유니피벗에 가입해주셔서 감사합니다.<br>
          이제 남북청년과 함께 새로운 한반도를 만들어갈 수 있습니다.
        </p>
        <a href="${process.env.NEXT_PUBLIC_SITE_URL}/my"
           style="display: inline-block; margin-top: 20px; padding: 12px 24px; background: #FF6B35; color: white; text-decoration: none; border-radius: 8px;">
          마이페이지 바로가기
        </a>
      </div>
      <div style="padding: 20px; text-align: center; color: #9ca3af; font-size: 12px;">
        &copy; ${new Date().getFullYear()} UniPivot. All rights reserved.
      </div>
    </div>
  `

  return sendEmail({
    to: email,
    subject: '[유니피벗] 회원가입을 환영합니다!',
    html,
  })
}

export async function sendPasswordResetEmail(email: string, resetLink: string): Promise<boolean> {
  const html = `
    <div style="font-family: 'Noto Sans KR', sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #FF6B35, #E55A2B); padding: 40px; text-align: center;">
        <h1 style="color: white; margin: 0;">유니피벗</h1>
      </div>
      <div style="padding: 40px; background: #f9fafb;">
        <h2 style="color: #111827; margin-bottom: 20px;">비밀번호 재설정</h2>
        <p style="color: #4b5563; line-height: 1.8;">
          비밀번호 재설정을 요청하셨습니다.<br>
          아래 버튼을 클릭하여 새 비밀번호를 설정해주세요.
        </p>
        <a href="${resetLink}"
           style="display: inline-block; margin-top: 20px; padding: 12px 24px; background: #FF6B35; color: white; text-decoration: none; border-radius: 8px;">
          비밀번호 재설정
        </a>
        <p style="color: #9ca3af; font-size: 12px; margin-top: 20px;">
          이 링크는 24시간 후 만료됩니다.<br>
          본인이 요청하지 않은 경우 이 이메일을 무시하세요.
        </p>
      </div>
    </div>
  `

  return sendEmail({
    to: email,
    subject: '[유니피벗] 비밀번호 재설정',
    html,
  })
}

export function sessionReminderTemplate(data: {
  userName: string
  programTitle: string
  sessionNo: number
  date: Date
  location?: string
}): string {
  return `
    <div style="font-family: 'Noto Sans KR', sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: #3B82F6; color: white; padding: 30px; text-align: center; border-radius: 12px 12px 0 0;">
        <h1 style="margin: 0; font-size: 20px;">모임 리마인더</h1>
      </div>
      <div style="padding: 30px; background: #f9fafb; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px;">
        <p style="color: #374151; line-height: 1.8;">안녕하세요, ${data.userName}님!</p>
        <p style="color: #374151; line-height: 1.8;">내일 모임이 예정되어 있습니다.</p>
        <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #e5e7eb;">
          <p style="margin: 8px 0; color: #374151;"><strong>프로그램:</strong> ${data.programTitle}</p>
          <p style="margin: 8px 0; color: #374151;"><strong>회차:</strong> ${data.sessionNo}회차</p>
          <p style="margin: 8px 0; color: #374151;"><strong>일시:</strong> ${data.date.toLocaleDateString('ko-KR')} ${data.date.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}</p>
          ${data.location ? `<p style="margin: 8px 0; color: #374151;"><strong>장소:</strong> ${data.location}</p>` : ''}
        </div>
        <p style="color: #6b7280; text-align: center; margin-top: 20px; font-size: 14px;">유니클럽</p>
      </div>
    </div>
  `
}

export async function sendProgramNotification(
  email: string,
  name: string,
  programTitle: string,
  date: string
): Promise<boolean> {
  const html = `
    <div style="font-family: 'Noto Sans KR', sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #FF6B35, #E55A2B); padding: 40px; text-align: center;">
        <h1 style="color: white; margin: 0;">유니피벗</h1>
      </div>
      <div style="padding: 40px; background: #f9fafb;">
        <h2 style="color: #111827; margin-bottom: 20px;">${name}님, 프로그램이 곧 시작됩니다!</h2>
        <div style="background: white; padding: 20px; border-radius: 12px; margin: 20px 0;">
          <h3 style="color: #FF6B35; margin: 0 0 10px 0;">${programTitle}</h3>
          <p style="color: #4b5563; margin: 0;">일시: ${date}</p>
        </div>
        <a href="${process.env.NEXT_PUBLIC_SITE_URL}/my/programs"
           style="display: inline-block; margin-top: 20px; padding: 12px 24px; background: #FF6B35; color: white; text-decoration: none; border-radius: 8px;">
          프로그램 확인하기
        </a>
      </div>
    </div>
  `

  return sendEmail({
    to: email,
    subject: `[유니피벗] ${programTitle} 안내`,
    html,
  })
}
