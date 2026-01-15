import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { z } from 'zod'

// 사용자 테마 설정 스키마
const userThemeSchema = z.object({
  themeId: z.string().cuid().nullable(),
  preferAuto: z.boolean().optional(),
  followSystem: z.boolean().optional(),
  lightThemeId: z.string().cuid().nullable().optional(),
  darkThemeId: z.string().cuid().nullable().optional(),
  autoSwitchTime: z.boolean().optional(),
  lightModeStart: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).optional(),
  lightModeEnd: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).optional()
})

// GET: 사용 가능한 테마 목록 및 사용자 설정 조회
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    // 활성 테마 목록 조회
    const themes = await prisma.themeSettings.findMany({
      where: {
        isActive: true
      },
      orderBy: [
        { isDefault: 'desc' },
        { isSystemTheme: 'desc' },
        { displayName: 'asc' }
      ],
      select: {
        id: true,
        name: true,
        displayName: true,
        description: true,
        primary: true,
        secondary: true,
        background: true,
        surface: true,
        textPrimary: true,
        textSecondary: true,
        textMuted: true,
        border: true,
        divider: true,
        success: true,
        warning: true,
        error: true,
        info: true,
        accent: true,
        accentForeground: true,
        input: true,
        inputBorder: true,
        card: true,
        cardBorder: true,
        navBackground: true,
        navText: true,
        navHover: true,
        sidebarBackground: true,
        sidebarText: true,
        sidebarHover: true,
        footerBackground: true,
        footerText: true,
        customCss: true,
        isDefault: true,
        isSystemTheme: true,
        autoApply: true,
        autoApplyStart: true,
        autoApplyEnd: true
      }
    })

    // 기본 테마 찾기
    const defaultTheme = themes.find(theme => theme.isDefault) || themes[0]

    let userPreference = null
    if (session?.user?.id) {
      userPreference = await prisma.userThemePreference.findUnique({
        where: { userId: session.user.id },
        include: {
          theme: {
            select: {
              id: true,
              name: true,
              displayName: true
            }
          }
        }
      })
    }

    return NextResponse.json({
      themes,
      defaultTheme,
      userPreference
    })

  } catch (error) {
    console.error('Error fetching themes:', error)
    return NextResponse.json(
      { error: '테마 정보를 불러오는데 실패했습니다.' },
      { status: 500 }
    )
  }
}

// POST: 사용자 테마 설정 저장
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: '로그인이 필요합니다.' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const validatedData = userThemeSchema.parse(body)

    // 선택된 테마가 존재하는지 확인
    if (validatedData.themeId) {
      const theme = await prisma.themeSettings.findUnique({
        where: {
          id: validatedData.themeId,
          isActive: true
        }
      })

      if (!theme) {
        return NextResponse.json(
          { error: '존재하지 않거나 비활성화된 테마입니다.' },
          { status: 400 }
        )
      }
    }

    // 라이트/다크 테마가 존재하는지 확인
    if (validatedData.lightThemeId) {
      const lightTheme = await prisma.themeSettings.findUnique({
        where: {
          id: validatedData.lightThemeId,
          isActive: true
        }
      })

      if (!lightTheme) {
        return NextResponse.json(
          { error: '존재하지 않거나 비활성화된 라이트 테마입니다.' },
          { status: 400 }
        )
      }
    }

    if (validatedData.darkThemeId) {
      const darkTheme = await prisma.themeSettings.findUnique({
        where: {
          id: validatedData.darkThemeId,
          isActive: true
        }
      })

      if (!darkTheme) {
        return NextResponse.json(
          { error: '존재하지 않거나 비활성화된 다크 테마입니다.' },
          { status: 400 }
        )
      }
    }

    // 사용자 테마 설정 저장
    const userPreference = await prisma.userThemePreference.upsert({
      where: { userId: session.user.id },
      update: {
        ...validatedData,
        lastUsedTheme: validatedData.themeId
      },
      create: {
        userId: session.user.id,
        ...validatedData,
        lastUsedTheme: validatedData.themeId
      },
      include: {
        theme: {
          select: {
            id: true,
            name: true,
            displayName: true
          }
        }
      }
    })

    // 테마 사용 통계 업데이트
    if (validatedData.themeId) {
      await updateThemeAnalytics(validatedData.themeId, session.user.id)
    }

    return NextResponse.json({ userPreference })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: '입력 데이터가 올바르지 않습니다.', details: error.issues },
        { status: 400 }
      )
    }

    console.error('Error saving user theme preference:', error)
    return NextResponse.json(
      { error: '테마 설정 저장에 실패했습니다.' },
      { status: 500 }
    )
  }
}

// 테마 사용 통계 업데이트
async function updateThemeAnalytics(themeId: string, userId: string) {
  try {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    await prisma.themeAnalytics.upsert({
      where: {
        themeId_date: {
          themeId,
          date: today
        }
      },
      update: {
        sessions: { increment: 1 }
      },
      create: {
        themeId,
        date: today,
        activeUsers: 1,
        sessions: 1,
        duration: 0,
        desktopUsers: 1,
        mobileUsers: 0,
        tabletUsers: 0
      }
    })
  } catch (error) {
    console.error('Error updating theme analytics:', error)
    // 분석 데이터 업데이트 실패는 주요 기능에 영향을 주지 않음
  }
}