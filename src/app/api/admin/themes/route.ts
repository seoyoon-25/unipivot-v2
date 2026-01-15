import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { z } from 'zod'

// 테마 생성/수정 스키마
const themeSchema = z.object({
  name: z.string().min(1, '테마 이름을 입력해주세요').max(50),
  displayName: z.string().min(1, '표시명을 입력해주세요').max(100),
  description: z.string().optional(),

  // 색상 설정 (hex 코드 검증)
  primary: z.string().regex(/^#[0-9A-F]{6}$/i, '올바른 hex 색상코드를 입력해주세요'),
  secondary: z.string().regex(/^#[0-9A-F]{6}$/i),
  background: z.string().regex(/^#[0-9A-F]{6}$/i),
  surface: z.string().regex(/^#[0-9A-F]{6}$/i),

  textPrimary: z.string().regex(/^#[0-9A-F]{6}$/i),
  textSecondary: z.string().regex(/^#[0-9A-F]{6}$/i),
  textMuted: z.string().regex(/^#[0-9A-F]{6}$/i),

  border: z.string().regex(/^#[0-9A-F]{6}$/i),
  divider: z.string().regex(/^#[0-9A-F]{6}$/i),

  success: z.string().regex(/^#[0-9A-F]{6}$/i),
  warning: z.string().regex(/^#[0-9A-F]{6}$/i),
  error: z.string().regex(/^#[0-9A-F]{6}$/i),
  info: z.string().regex(/^#[0-9A-F]{6}$/i),

  accent: z.string().regex(/^#[0-9A-F]{6}$/i),
  accentForeground: z.string().regex(/^#[0-9A-F]{6}$/i),

  input: z.string().regex(/^#[0-9A-F]{6}$/i),
  inputBorder: z.string().regex(/^#[0-9A-F]{6}$/i),

  card: z.string().regex(/^#[0-9A-F]{6}$/i),
  cardBorder: z.string().regex(/^#[0-9A-F]{6}$/i),

  navBackground: z.string().regex(/^#[0-9A-F]{6}$/i),
  navText: z.string().regex(/^#[0-9A-F]{6}$/i),
  navHover: z.string().regex(/^#[0-9A-F]{6}$/i),

  sidebarBackground: z.string().regex(/^#[0-9A-F]{6}$/i),
  sidebarText: z.string().regex(/^#[0-9A-F]{6}$/i),
  sidebarHover: z.string().regex(/^#[0-9A-F]{6}$/i),

  footerBackground: z.string().regex(/^#[0-9A-F]{6}$/i),
  footerText: z.string().regex(/^#[0-9A-F]{6}$/i),

  // 설정
  customCss: z.string().optional(),
  isDefault: z.boolean().default(false),
  isActive: z.boolean().default(true),
  autoApply: z.boolean().default(false),
  autoApplyStart: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).optional(), // HH:MM 형식
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

// GET: 테마 목록 조회
export async function GET(request: NextRequest) {
  try {
    const { error } = await checkAdminPermission()
    if (error) {
      return NextResponse.json({ error }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const includeInactive = searchParams.get('includeInactive') === 'true'

    const where: any = {}
    if (!includeInactive) {
      where.isActive = true
    }

    const themes = await prisma.themeSettings.findMany({
      where,
      orderBy: [
        { isDefault: 'desc' },
        { isSystemTheme: 'desc' },
        { name: 'asc' }
      ],
      include: {
        _count: {
          select: {
            userPreferences: true
          }
        }
      }
    })

    return NextResponse.json({ themes })

  } catch (error) {
    console.error('Error fetching themes:', error)
    return NextResponse.json(
      { error: '테마 목록을 불러오는데 실패했습니다.' },
      { status: 500 }
    )
  }
}

// POST: 새 테마 생성
export async function POST(request: NextRequest) {
  try {
    const { error, userId } = await checkAdminPermission()
    if (error) {
      return NextResponse.json({ error }, { status: 403 })
    }

    const body = await request.json()
    const validatedData = themeSchema.parse(body)

    // 테마 이름 중복 확인
    const existingTheme = await prisma.themeSettings.findUnique({
      where: { name: validatedData.name }
    })

    if (existingTheme) {
      return NextResponse.json(
        { error: '이미 존재하는 테마 이름입니다.' },
        { status: 400 }
      )
    }

    // 기본 테마 설정 처리
    if (validatedData.isDefault) {
      await prisma.themeSettings.updateMany({
        where: { isDefault: true },
        data: { isDefault: false }
      })
    }

    const theme = await prisma.themeSettings.create({
      data: {
        ...validatedData,
        createdBy: userId!
      }
    })

    return NextResponse.json({ theme }, { status: 201 })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: '입력 데이터가 올바르지 않습니다.', details: error.issues },
        { status: 400 }
      )
    }

    console.error('Error creating theme:', error)
    return NextResponse.json(
      { error: '테마 생성에 실패했습니다.' },
      { status: 500 }
    )
  }
}