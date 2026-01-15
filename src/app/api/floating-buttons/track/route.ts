import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { z } from 'zod'

// 트래킹 데이터 검증 스키마
const trackingSchema = z.object({
  buttonId: z.string().min(1, '버튼 ID가 필요합니다'),
  action: z.enum(['impression', 'click']),
  sessionId: z.string().optional(), // 비로그인 사용자용
  page: z.string().optional(),
  userAgent: z.string().optional()
})

// IP 주소 해시 함수
function hashIP(ip: string): string {
  // 간단한 해시 함수 (실제로는 crypto를 사용하는 것이 좋음)
  let hash = 0
  for (let i = 0; i < ip.length; i++) {
    const char = ip.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // 32-bit integer로 변환
  }
  return hash.toString()
}

// 오늘 날짜를 YYYY-MM-DD 형식으로 반환
function getTodayDateString(): string {
  return new Date().toISOString().split('T')[0]
}

// 클라이언트 IP 주소 가져오기
function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for')
  const realIP = request.headers.get('x-real-ip')
  const remoteAddr = request.headers.get('x-vercel-forwarded-for') || request.ip

  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }
  if (realIP) {
    return realIP.trim()
  }
  return remoteAddr || '127.0.0.1'
}

// POST: 플로팅 버튼 상호작용 추적
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const body = await request.json()
    const validatedData = trackingSchema.parse(body)

    const { buttonId, action, sessionId, page } = validatedData
    const clientIP = getClientIP(request)
    const ipHash = hashIP(clientIP)
    const today = getTodayDateString()

    // 버튼 존재 확인
    const button = await prisma.floatingButton.findUnique({
      where: { id: buttonId },
      select: {
        id: true,
        isActive: true,
        maxDisplayCount: true
      }
    })

    if (!button || !button.isActive) {
      return NextResponse.json(
        { error: '유효하지 않은 플로팅 버튼입니다.' },
        { status: 404 }
      )
    }

    // 일별 분석 데이터 업데이트/생성
    const analyticsData = await prisma.floatingButtonAnalytics.upsert({
      where: {
        buttonId_date: {
          buttonId,
          date: new Date(today)
        }
      },
      update: {
        [action === 'impression' ? 'impressions' : 'clicks']: {
          increment: 1
        },
        // 고유 사용자 수는 별도 로직으로 계산
      },
      create: {
        buttonId,
        date: new Date(today),
        impressions: action === 'impression' ? 1 : 0,
        clicks: action === 'click' ? 1 : 0,
        uniqueUsers: 1
      }
    })

    // 버튼 테이블의 전체 통계 업데이트
    await prisma.floatingButton.update({
      where: { id: buttonId },
      data: {
        [action === 'impression' ? 'impressionCount' : 'clickCount']: {
          increment: 1
        }
      }
    })

    // 고유 사용자 수 계산 (오늘 처음 상호작용하는 사용자인지 확인)
    const userId = session?.user?.id
    const userIdentifier = userId || sessionId || ipHash

    if (userIdentifier) {
      // 오늘 이 사용자의 이전 상호작용 확인
      const existingInteraction = await prisma.floatingButtonAnalytics.findFirst({
        where: {
          buttonId,
          date: new Date(today)
        }
      })

      // 실제 구현에서는 별도 테이블에 사용자별 일일 상호작용 기록을 저장하는 것이 좋음
      // 여기서는 간단히 처리
    }

    return NextResponse.json({
      success: true,
      action,
      buttonId,
      message: `${action} 추적이 완료되었습니다.`
    })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: '입력 데이터가 올바르지 않습니다.', details: error.issues },
        { status: 400 }
      )
    }

    console.error('Error tracking floating button interaction:', error)
    return NextResponse.json(
      { error: '추적 데이터 저장에 실패했습니다.' },
      { status: 500 }
    )
  }
}