import { NextRequest, NextResponse } from 'next/server'
import { verifyCronRequest } from '@/lib/cron/auth'
import prisma from '@/lib/db'
import { sendEmail } from '@/lib/email'

/**
 * GET /api/cron/weekly-digest
 * 매주 월요일 오전 9시 실행 - 지난주 활동이 있는 사용자에게 주간 요약 이메일 발송
 */
export async function GET(request: NextRequest) {
  if (!verifyCronRequest(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const now = new Date()
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

    // 활성 프로그램 참가자 중 이메일이 있는 사용자 조회
    const participants = await prisma.programParticipant.findMany({
      where: { status: 'ACTIVE' },
      select: { userId: true },
      distinct: ['userId'],
    })

    const userIds = participants.map((p) => p.userId)

    const users = await prisma.user.findMany({
      where: {
        id: { in: userIds },
        email: { not: '' },
      },
      select: {
        id: true,
        email: true,
        name: true,
        member: { select: { id: true } },
      },
    })

    let emailsSent = 0

    for (const user of users) {
      // BookReport.authorId = Member.id
      const memberId = user.member?.id

      const [reportsCount, quotesCount, attendanceCount] = await Promise.all([
        memberId
          ? prisma.bookReport.count({
              where: { authorId: memberId, createdAt: { gte: weekAgo } },
            })
          : Promise.resolve(0),
        prisma.quote.count({
          where: { userId: user.id, createdAt: { gte: weekAgo } },
        }),
        prisma.programAttendance.count({
          where: {
            participant: { userId: user.id },
            checkedAt: { gte: weekAgo },
            status: { in: ['PRESENT', 'LATE'] },
          },
        }),
      ])

      // 활동이 있는 경우만 발송
      if (reportsCount > 0 || quotesCount > 0 || attendanceCount > 0) {
        const sent = await sendEmail({
          to: user.email,
          subject: '[유니클럽] 이번 주 독서 활동 요약',
          html: weeklyDigestTemplate({
            userName: user.name || '회원',
            reportsCount,
            quotesCount,
            attendanceCount,
          }),
        })
        if (sent) emailsSent++
      }
    }

    return NextResponse.json({
      success: true,
      usersChecked: users.length,
      emailsSent,
    })
  } catch (error) {
    console.error('Weekly digest cron error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

function weeklyDigestTemplate(data: {
  userName: string
  reportsCount: number
  quotesCount: number
  attendanceCount: number
}): string {
  return `
    <div style="font-family: 'Noto Sans KR', sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: #3B82F6; color: white; padding: 30px; text-align: center; border-radius: 12px 12px 0 0;">
        <h1 style="margin: 0; font-size: 20px;">주간 독서 활동 요약</h1>
      </div>
      <div style="padding: 30px; background: #f9fafb; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px;">
        <p style="color: #374151; line-height: 1.8;">안녕하세요, ${data.userName}님!</p>
        <p style="color: #374151; line-height: 1.8;">이번 주 독서 활동을 요약해드립니다.</p>
        <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #e5e7eb;">
          <p style="margin: 8px 0; color: #374151;">작성한 독후감: <strong>${data.reportsCount}개</strong></p>
          <p style="margin: 8px 0; color: #374151;">등록한 명문장: <strong>${data.quotesCount}개</strong></p>
          <p style="margin: 8px 0; color: #374151;">출석한 모임: <strong>${data.attendanceCount}회</strong></p>
        </div>
        <p style="color: #374151; line-height: 1.8;">다음 주도 즐거운 독서 되세요!</p>
        <p style="color: #6b7280; text-align: center; margin-top: 20px; font-size: 14px;">유니클럽</p>
      </div>
    </div>
  `
}
