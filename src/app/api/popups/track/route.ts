import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { z } from 'zod'
import crypto from 'crypto'

// 팝업 상호작용 추적 스키마
const trackInteractionSchema = z.object({
  popupId: z.string().cuid(),
  interactionType: z.enum(['show', 'click', 'close', 'conversion']),
  buttonType: z.enum(['primary', 'secondary', 'close']).optional(),
  value: z.string().optional(),
  reason: z.enum(['close_button', 'overlay', 'escape', 'auto']).optional()
})

// POST: 팝업 상호작용 추적
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = trackInteractionSchema.parse(body)

    // 세션 정보 수집
    const session = await getServerSession(authOptions)
    const userId = session?.user?.id || null

    // 세션 ID 생성 (쿠키나 localStorage에서 가져오거나 생성)
    const sessionId = request.headers.get('x-session-id') || crypto.randomUUID()

    // IP 주소 수집
    const forwarded = request.headers.get('x-forwarded-for')
    const ip = forwarded ? forwarded.split(',')[0] : request.ip || 'unknown'
    const ipHash = crypto.createHash('sha256').update(ip).digest('hex').substring(0, 16)

    // 상호작용 기록
    const interaction = await prisma.popupInteraction.create({
      data: {
        popupId: validatedData.popupId,
        userId,
        sessionId,
        interactionType: validatedData.interactionType,
        buttonType: validatedData.buttonType,
        value: validatedData.value,
        timestamp: new Date()
      }
    })

    // 팝업 통계 업데이트
    const updateData: any = {}

    switch (validatedData.interactionType) {
      case 'show':
        updateData.impressionCount = { increment: 1 }
        break
      case 'click':
        updateData.clickCount = { increment: 1 }
        break
      case 'close':
        updateData.dismissCount = { increment: 1 }

        // 해제 기록 추가
        await prisma.popupDismissal.upsert({
          where: {
            popupId_userId: userId ? {
              popupId: validatedData.popupId,
              userId: userId
            } : undefined,
            popupId_sessionId: !userId ? {
              popupId: validatedData.popupId,
              sessionId: sessionId
            } : undefined
          },
          update: {
            reason: validatedData.reason,
            dismissedAt: new Date()
          },
          create: {
            popupId: validatedData.popupId,
            userId,
            sessionId: userId ? null : sessionId,
            ipHash,
            reason: validatedData.reason,
            dismissedAt: new Date()
          }
        })
        break
      case 'conversion':
        updateData.conversionCount = { increment: 1 }
        break
    }

    if (Object.keys(updateData).length > 0) {
      await prisma.popup.update({
        where: { id: validatedData.popupId },
        data: updateData
      })
    }

    // 일별 분석 데이터 업데이트
    await updateDailyAnalytics(validatedData.popupId, validatedData.interactionType, userId, sessionId)

    return NextResponse.json({
      success: true,
      sessionId, // 클라이언트에서 세션 ID를 저장할 수 있도록 반환
      interactionId: interaction.id
    })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: '잘못된 요청 데이터입니다.', details: error.issues },
        { status: 400 }
      )
    }

    console.error('Error tracking popup interaction:', error)
    return NextResponse.json(
      { error: '상호작용 추적에 실패했습니다.' },
      { status: 500 }
    )
  }
}

// 일별 분석 데이터 업데이트 함수
async function updateDailyAnalytics(
  popupId: string,
  interactionType: string,
  userId: string | null,
  sessionId: string
) {
  try {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const updateData: any = {}

    switch (interactionType) {
      case 'show':
        updateData.impressions = { increment: 1 }
        break
      case 'click':
        updateData.clicks = { increment: 1 }
        break
      case 'close':
        updateData.dismissals = { increment: 1 }
        break
      case 'conversion':
        updateData.conversions = { increment: 1 }
        break
    }

    await prisma.popupAnalytics.upsert({
      where: {
        popupId_date: {
          popupId,
          date: today
        }
      },
      update: updateData,
      create: {
        popupId,
        date: today,
        impressions: interactionType === 'show' ? 1 : 0,
        clicks: interactionType === 'click' ? 1 : 0,
        dismissals: interactionType === 'close' ? 1 : 0,
        conversions: interactionType === 'conversion' ? 1 : 0,
        uniqueUsers: 1
      }
    })

    // 전환률과 이탈률 계산 및 업데이트
    const analytics = await prisma.popupAnalytics.findUnique({
      where: {
        popupId_date: {
          popupId,
          date: today
        }
      }
    })

    if (analytics) {
      const conversionRate = analytics.impressions > 0
        ? (analytics.conversions / analytics.impressions) * 100
        : 0

      const bounceRate = analytics.impressions > 0
        ? (analytics.dismissals / analytics.impressions) * 100
        : 0

      await prisma.popupAnalytics.update({
        where: {
          popupId_date: {
            popupId,
            date: today
          }
        },
        data: {
          conversionRate,
          bounceRate
        }
      })
    }

  } catch (error) {
    console.error('Error updating daily analytics:', error)
  }
}