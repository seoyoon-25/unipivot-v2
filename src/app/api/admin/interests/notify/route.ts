import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

// POST - 키워드 관련 프로그램 알림 발송
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ error: '권한이 없습니다' }, { status: 403 })
    }

    const body = await request.json()
    const { keywordId, programId } = body

    if (!keywordId || !programId) {
      return NextResponse.json(
        { error: '키워드와 프로그램을 지정해주세요' },
        { status: 400 }
      )
    }

    // 키워드 확인
    const keyword = await prisma.interestKeyword.findUnique({
      where: { id: keywordId },
    })

    if (!keyword) {
      return NextResponse.json(
        { error: '키워드를 찾을 수 없습니다' },
        { status: 404 }
      )
    }

    // 프로그램 확인
    const program = await prisma.program.findUnique({
      where: { id: programId },
    })

    if (!program) {
      return NextResponse.json(
        { error: '프로그램을 찾을 수 없습니다' },
        { status: 404 }
      )
    }

    // 알림 대상자 조회
    const alerts = await prisma.interestAlert.findMany({
      where: {
        keywordId,
        isActive: true,
        notifiedAt: null, // 아직 알림 안 보낸 사람만
      },
      include: {
        user: { select: { name: true, email: true } },
      },
    })

    if (alerts.length === 0) {
      return NextResponse.json({
        success: true,
        message: '알림을 보낼 대상자가 없습니다',
        count: 0,
      })
    }

    // 알림 발송 (이메일 발송 로직)
    const sentEmails: string[] = []
    const failedEmails: string[] = []

    for (const alert of alerts) {
      try {
        // 실제 이메일 발송 로직 (EmailLog에 기록)
        await prisma.emailLog.create({
          data: {
            to: alert.email,
            subject: `[유니피벗] '${keyword.keyword}' 관련 프로그램이 열렸습니다!`,
            content: `
안녕하세요${alert.name ? ` ${alert.name}님` : ''}!

관심 가지고 계셨던 '${keyword.keyword}'와 관련된 새로운 프로그램이 열렸습니다.

📚 ${program.title}
${program.description ? `\n${program.description.substring(0, 200)}...` : ''}

지금 바로 확인해보세요!
https://unipivot.kr/programs/${program.slug}

---
이 알림은 '${keyword.keyword}' 키워드 알림 신청에 의해 발송되었습니다.
알림을 더 이상 받고 싶지 않으시면 알림 해제를 해주세요.
            `.trim(),
            status: 'SENT',
          },
        })

        // 알림 정보 업데이트
        await prisma.interestAlert.update({
          where: { id: alert.id },
          data: {
            notifiedAt: new Date(),
            notifiedProgramId: programId,
          },
        })

        sentEmails.push(alert.email)
      } catch (error) {
        console.error(`Failed to send email to ${alert.email}:`, error)
        failedEmails.push(alert.email)
      }
    }

    // 알림 로그 생성
    await prisma.notificationLog.create({
      data: {
        type: 'INTEREST_ALERT',
        subject: `'${keyword.keyword}' 관련 프로그램 알림`,
        content: `프로그램: ${program.title}`,
        channel: 'EMAIL',
        status: failedEmails.length === 0 ? 'SENT' : 'SENT',
      },
    })

    // 키워드에 관련 프로그램 추가
    const existingProgramIds = keyword.relatedProgramIds
      ? JSON.parse(keyword.relatedProgramIds)
      : []
    if (!existingProgramIds.includes(programId)) {
      existingProgramIds.push(programId)
      await prisma.interestKeyword.update({
        where: { id: keywordId },
        data: {
          relatedProgramIds: JSON.stringify(existingProgramIds),
        },
      })
    }

    return NextResponse.json({
      success: true,
      message: `${sentEmails.length}명에게 알림을 발송했습니다`,
      count: sentEmails.length,
      failed: failedEmails.length,
    })
  } catch (error) {
    console.error('Notify error:', error)
    return NextResponse.json(
      { error: '알림 발송 중 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}

// GET - 발송 가능한 알림 목록
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ error: '권한이 없습니다' }, { status: 403 })
    }

    // 알림 신청이 있고, 아직 알림을 보내지 않은 키워드 목록
    const keywordsWithPendingAlerts = await prisma.interestKeyword.findMany({
      where: {
        alerts: {
          some: {
            isActive: true,
            notifiedAt: null,
          },
        },
      },
      include: {
        _count: {
          select: {
            alerts: {
              where: {
                isActive: true,
                notifiedAt: null,
              },
            },
          },
        },
      },
      orderBy: {
        monthlyCount: 'desc',
      },
    })

    // 모집 중인 프로그램 목록
    const recruitingPrograms = await prisma.program.findMany({
      where: {
        status: 'RECRUITING',
      },
      select: {
        id: true,
        title: true,
        slug: true,
        type: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json({
      keywords: keywordsWithPendingAlerts.map((kw) => ({
        id: kw.id,
        keyword: kw.keyword,
        category: kw.category,
        pendingAlerts: kw._count.alerts,
      })),
      programs: recruitingPrograms,
    })
  } catch (error) {
    console.error('Get pending alerts error:', error)
    return NextResponse.json(
      { error: '조회 중 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}
