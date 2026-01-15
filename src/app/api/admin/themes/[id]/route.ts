import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { z } from 'zod'

// 테마 수정 스키마
const updateThemeSchema = z.object({
  displayName: z.string().min(1, '표시명을 입력해주세요').max(100).optional(),
  description: z.string().optional(),

  // 색상 설정 (선택적)
  primary: z.string().regex(/^#[0-9A-F]{6}$/i).optional(),
  secondary: z.string().regex(/^#[0-9A-F]{6}$/i).optional(),
  background: z.string().regex(/^#[0-9A-F]{6}$/i).optional(),
  surface: z.string().regex(/^#[0-9A-F]{6}$/i).optional(),

  textPrimary: z.string().regex(/^#[0-9A-F]{6}$/i).optional(),
  textSecondary: z.string().regex(/^#[0-9A-F]{6}$/i).optional(),
  textMuted: z.string().regex(/^#[0-9A-F]{6}$/i).optional(),

  border: z.string().regex(/^#[0-9A-F]{6}$/i).optional(),
  divider: z.string().regex(/^#[0-9A-F]{6}$/i).optional(),

  success: z.string().regex(/^#[0-9A-F]{6}$/i).optional(),
  warning: z.string().regex(/^#[0-9A-F]{6}$/i).optional(),
  error: z.string().regex(/^#[0-9A-F]{6}$/i).optional(),
  info: z.string().regex(/^#[0-9A-F]{6}$/i).optional(),

  accent: z.string().regex(/^#[0-9A-F]{6}$/i).optional(),
  accentForeground: z.string().regex(/^#[0-9A-F]{6}$/i).optional(),

  input: z.string().regex(/^#[0-9A-F]{6}$/i).optional(),
  inputBorder: z.string().regex(/^#[0-9A-F]{6}$/i).optional(),

  card: z.string().regex(/^#[0-9A-F]{6}$/i).optional(),
  cardBorder: z.string().regex(/^#[0-9A-F]{6}$/i).optional(),

  navBackground: z.string().regex(/^#[0-9A-F]{6}$/i).optional(),
  navText: z.string().regex(/^#[0-9A-F]{6}$/i).optional(),
  navHover: z.string().regex(/^#[0-9A-F]{6}$/i).optional(),

  sidebarBackground: z.string().regex(/^#[0-9A-F]{6}$/i).optional(),
  sidebarText: z.string().regex(/^#[0-9A-F]{6}$/i).optional(),
  sidebarHover: z.string().regex(/^#[0-9A-F]{6}$/i).optional(),

  footerBackground: z.string().regex(/^#[0-9A-F]{6}$/i).optional(),
  footerText: z.string().regex(/^#[0-9A-F]{6}$/i).optional(),

  // 설정
  customCss: z.string().optional(),
  isDefault: z.boolean().optional(),
  isActive: z.boolean().optional(),
  autoApply: z.boolean().optional(),
  autoApplyStart: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).optional(),
  autoApplyEnd: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).optional()
})

// 권한 확인 함수
async function checkAdminPermission() {
  const session = await getServerSession(authOptions)

  if (!session?.user || !['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) {
    return { error: '권한이 없습니다.' }
  }

  return { userId: session.user.id, role: session.user.role }
}

// GET: 특정 테마 조회
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { error } = await checkAdminPermission()
    if (error) {
      return NextResponse.json({ error }, { status: 403 })
    }

    const theme = await prisma.themeSettings.findUnique({
      where: { id: params.id },
      include: {
        _count: {
          select: {
            userPreferences: true
          }
        }
      }
    })

    if (!theme) {
      return NextResponse.json(
        { error: '테마를 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    return NextResponse.json({ theme })

  } catch (error) {
    console.error('Error fetching theme:', error)
    return NextResponse.json(
      { error: '테마를 불러오는데 실패했습니다.' },
      { status: 500 }
    )
  }
}

// PUT: 테마 수정
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { error, userId } = await checkAdminPermission()
    if (error) {
      return NextResponse.json({ error }, { status: 403 })
    }

    const theme = await prisma.themeSettings.findUnique({
      where: { id: params.id }
    })

    if (!theme) {
      return NextResponse.json(
        { error: '테마를 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    // 시스템 테마는 색상만 수정 가능
    if (theme.isSystemTheme) {
      const body = await request.json()
      const validatedData = updateThemeSchema.parse(body)

      // 시스템 테마는 기본 설정들은 변경할 수 없음
      delete validatedData.isDefault
      delete validatedData.isActive
      delete validatedData.autoApply
      delete validatedData.autoApplyStart
      delete validatedData.autoApplyEnd

      const updatedTheme = await prisma.themeSettings.update({
        where: { id: params.id },
        data: {
          ...validatedData,
          updatedBy: userId!
        }
      })

      return NextResponse.json({ theme: updatedTheme })
    }

    const body = await request.json()
    const validatedData = updateThemeSchema.parse(body)

    // 기본 테마 설정 처리
    if (validatedData.isDefault && !theme.isDefault) {
      await prisma.themeSettings.updateMany({
        where: {
          isDefault: true,
          id: { not: params.id }
        },
        data: { isDefault: false }
      })
    }

    const updatedTheme = await prisma.themeSettings.update({
      where: { id: params.id },
      data: {
        ...validatedData,
        updatedBy: userId!
      }
    })

    return NextResponse.json({ theme: updatedTheme })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: '입력 데이터가 올바르지 않습니다.', details: error.issues },
        { status: 400 }
      )
    }

    console.error('Error updating theme:', error)
    return NextResponse.json(
      { error: '테마 수정에 실패했습니다.' },
      { status: 500 }
    )
  }
}

// DELETE: 테마 삭제
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { error } = await checkAdminPermission()
    if (error) {
      return NextResponse.json({ error }, { status: 403 })
    }

    const theme = await prisma.themeSettings.findUnique({
      where: { id: params.id },
      include: {
        _count: {
          select: {
            userPreferences: true
          }
        }
      }
    })

    if (!theme) {
      return NextResponse.json(
        { error: '테마를 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    // 시스템 테마는 삭제할 수 없음
    if (theme.isSystemTheme) {
      return NextResponse.json(
        { error: '시스템 테마는 삭제할 수 없습니다.' },
        { status: 400 }
      )
    }

    // 기본 테마는 삭제할 수 없음
    if (theme.isDefault) {
      return NextResponse.json(
        { error: '기본 테마는 삭제할 수 없습니다. 다른 테마를 기본으로 설정한 후 삭제해주세요.' },
        { status: 400 }
      )
    }

    // 사용 중인 테마는 삭제할 수 없음
    if (theme._count.userPreferences > 0) {
      return NextResponse.json(
        { error: `${theme._count.userPreferences}명의 사용자가 사용 중인 테마는 삭제할 수 없습니다.` },
        { status: 400 }
      )
    }

    await prisma.themeSettings.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Error deleting theme:', error)
    return NextResponse.json(
      { error: '테마 삭제에 실패했습니다.' },
      { status: 500 }
    )
  }
}