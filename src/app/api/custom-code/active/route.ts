import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

// GET: 활성 커스텀 코드 조회 (클라이언트용)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const position = searchParams.get('position')
    const page = searchParams.get('page') || '/'
    const isDevelopment = searchParams.get('development') === 'true'

    const session = await getServerSession(authOptions)
    const userRole = session?.user?.role || 'USER'

    // 현재 시간
    const now = new Date()

    // 기본 조건: 활성화된 코드
    const where: any = {
      isActive: true,
      OR: [
        { isScheduled: false },
        {
          AND: [
            { isScheduled: true },
            {
              OR: [
                { startDate: null },
                { startDate: { lte: now } }
              ]
            },
            {
              OR: [
                { endDate: null },
                { endDate: { gte: now } }
              ]
            }
          ]
        }
      ]
    }

    // 개발 모드 필터
    if (!isDevelopment) {
      where.isDevelopment = false
    }

    // 위치별 필터
    if (position) {
      where.position = position
    }

    const customCodes = await prisma.customCode.findMany({
      where,
      orderBy: [
        { priority: 'desc' },
        { createdAt: 'asc' }
      ],
      select: {
        id: true,
        name: true,
        type: true,
        code: true,
        position: true,
        priority: true,
        async: true,
        defer: true,
        preload: true,
        targetPages: true,
        excludePages: true,
        targetDevices: true,
        targetRoles: true,
        isTrusted: true,
        codeHash: true
      }
    })

    // 클라이언트 필터링 (페이지, 디바이스, 역할)
    const filteredCodes = customCodes.filter(code => {
      // 페이지 타겟팅 확인
      if (code.targetPages) {
        try {
          const targetPages = JSON.parse(code.targetPages)
          if (targetPages.length > 0 && !targetPages.includes(page)) {
            return false
          }
        } catch {
          // JSON 파싱 오류 시 무시
        }
      }

      // 제외 페이지 확인
      if (code.excludePages) {
        try {
          const excludePages = JSON.parse(code.excludePages)
          if (excludePages.includes(page)) {
            return false
          }
        } catch {
          // JSON 파싱 오류 시 무시
        }
      }

      // 사용자 역할 확인
      if (code.targetRoles) {
        try {
          const targetRoles = JSON.parse(code.targetRoles)
          if (targetRoles.length > 0 && !targetRoles.includes(userRole)) {
            return false
          }
        } catch {
          // JSON 파싱 오류 시 무시
        }
      }

      return true
    })

    // 코드 실행 로그 기록 (백그라운드에서)
    if (filteredCodes.length > 0) {
      // 비동기로 실행하여 응답 속도에 영향을 주지 않음
      recordCodeExecutions(filteredCodes, request, session?.user?.id)
        .catch(error => console.error('Error recording code executions:', error))
    }

    return NextResponse.json({
      codes: filteredCodes,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Error fetching active custom codes:', error)
    return NextResponse.json(
      { error: '활성 커스텀 코드를 불러오는데 실패했습니다.' },
      { status: 500 }
    )
  }
}

// 코드 실행 로그 기록 (비동기)
async function recordCodeExecutions(
  codes: any[],
  request: NextRequest,
  userId?: string
) {
  try {
    const forwarded = request.headers.get('x-forwarded-for')
    const ipAddress = forwarded ? forwarded.split(',')[0] : request.ip || 'unknown'
    const userAgent = request.headers.get('user-agent') || ''
    const pageUrl = request.headers.get('referer') || request.nextUrl.toString()

    // 디바이스 타입 추정 (간단한 버전)
    const deviceType = userAgent.includes('Mobile') ? 'mobile' :
                      userAgent.includes('Tablet') ? 'tablet' : 'desktop'

    const executionPromises = codes.map(code =>
      prisma.customCodeExecution.create({
        data: {
          codeId: code.id,
          userId,
          sessionId: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          success: true, // 초기값, 실제 실행 결과는 클라이언트에서 업데이트
          userAgent,
          ipAddress,
          pageUrl,
          deviceType
        }
      }).catch(error => {
        console.error(`Error recording execution for code ${code.id}:`, error)
      })
    )

    await Promise.allSettled(executionPromises)

    // 로드 카운트 업데이트
    const updatePromises = codes.map(code =>
      prisma.customCode.update({
        where: { id: code.id },
        data: {
          loadCount: { increment: 1 },
          lastLoaded: new Date()
        }
      }).catch(error => {
        console.error(`Error updating load count for code ${code.id}:`, error)
      })
    )

    await Promise.allSettled(updatePromises)

  } catch (error) {
    console.error('Error in recordCodeExecutions:', error)
  }
}