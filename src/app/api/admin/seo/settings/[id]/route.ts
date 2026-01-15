import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { z } from 'zod'

// SEO 설정 수정 스키마 (일부 필드는 선택사항)
const updateSeoSettingSchema = z.object({
  pageKey: z.string().min(1, '페이지 키를 입력해주세요').optional(),
  pageName: z.string().min(1, '페이지 이름을 입력해주세요').optional(),
  title: z.string().optional(),
  description: z.string().optional(),
  keywords: z.string().optional(),
  canonical: z.string().url().optional(),
  ogTitle: z.string().optional(),
  ogDescription: z.string().optional(),
  ogImage: z.string().url().optional(),
  ogImageAlt: z.string().optional(),
  ogType: z.string().optional(),
  ogUrl: z.string().url().optional(),
  twitterCard: z.string().optional(),
  twitterTitle: z.string().optional(),
  twitterDescription: z.string().optional(),
  twitterImage: z.string().url().optional(),
  twitterImageAlt: z.string().optional(),
  twitterSite: z.string().optional(),
  twitterCreator: z.string().optional(),
  schemaType: z.string().optional(),
  schemaData: z.string().optional(),
  customHead: z.string().optional(),
  robots: z.string().optional(),
  isActive: z.boolean().optional(),
  priority: z.number().optional()
})

interface RouteParams {
  params: Promise<{ id: string }>
}

// 권한 확인 함수
async function checkAdminPermission() {
  const session = await getServerSession(authOptions)

  if (!session?.user || !['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) {
    return { error: '권한이 없습니다.' }
  }

  return { userId: session.user.id, role: session.user.role }
}

// GET: 특정 SEO 설정 조회
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { error } = await checkAdminPermission()
    if (error) {
      return NextResponse.json({ error }, { status: 403 })
    }

    const { id } = await params

    const setting = await prisma.seoSetting.findUnique({
      where: { id }
    })

    if (!setting) {
      return NextResponse.json(
        { error: 'SEO 설정을 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    return NextResponse.json({ setting })

  } catch (error) {
    console.error('Error fetching SEO setting:', error)
    return NextResponse.json(
      { error: 'SEO 설정을 불러오는데 실패했습니다.' },
      { status: 500 }
    )
  }
}

// PUT: SEO 설정 수정
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { error, userId } = await checkAdminPermission()
    if (error) {
      return NextResponse.json({ error }, { status: 403 })
    }

    const { id } = await params
    const body = await request.json()
    const validatedData = updateSeoSettingSchema.parse(body)

    // 설정 존재 확인
    const existingSetting = await prisma.seoSetting.findUnique({
      where: { id }
    })

    if (!existingSetting) {
      return NextResponse.json(
        { error: 'SEO 설정을 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    // pageKey 중복 확인 (다른 설정과)
    if (validatedData.pageKey && validatedData.pageKey !== existingSetting.pageKey) {
      const duplicateSetting = await prisma.seoSetting.findUnique({
        where: { pageKey: validatedData.pageKey }
      })

      if (duplicateSetting) {
        return NextResponse.json(
          { error: '이미 존재하는 페이지 키입니다.' },
          { status: 400 }
        )
      }
    }

    const updatedSetting = await prisma.seoSetting.update({
      where: { id },
      data: {
        ...validatedData,
        updatedBy: userId,
      }
    })

    return NextResponse.json({ setting: updatedSetting })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: '입력 데이터가 올바르지 않습니다.', details: error.issues },
        { status: 400 }
      )
    }

    console.error('Error updating SEO setting:', error)
    return NextResponse.json(
      { error: 'SEO 설정 수정에 실패했습니다.' },
      { status: 500 }
    )
  }
}

// DELETE: SEO 설정 삭제
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { error } = await checkAdminPermission()
    if (error) {
      return NextResponse.json({ error }, { status: 403 })
    }

    const { id } = await params

    // 설정 존재 확인
    const existingSetting = await prisma.seoSetting.findUnique({
      where: { id }
    })

    if (!existingSetting) {
      return NextResponse.json(
        { error: 'SEO 설정을 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    await prisma.seoSetting.delete({
      where: { id }
    })

    return NextResponse.json({
      message: 'SEO 설정이 성공적으로 삭제되었습니다.'
    })

  } catch (error) {
    console.error('Error deleting SEO setting:', error)
    return NextResponse.json(
      { error: 'SEO 설정 삭제에 실패했습니다.' },
      { status: 500 }
    )
  }
}

// PATCH: SEO 설정 상태 변경 (활성화/비활성화)
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { error, userId } = await checkAdminPermission()
    if (error) {
      return NextResponse.json({ error }, { status: 403 })
    }

    const { id } = await params
    const body = await request.json()
    const { action } = body

    if (!['toggle', 'activate', 'deactivate'].includes(action)) {
      return NextResponse.json(
        { error: '올바르지 않은 액션입니다.' },
        { status: 400 }
      )
    }

    // 설정 존재 확인
    const existingSetting = await prisma.seoSetting.findUnique({
      where: { id }
    })

    if (!existingSetting) {
      return NextResponse.json(
        { error: 'SEO 설정을 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    let isActive: boolean
    switch (action) {
      case 'toggle':
        isActive = !existingSetting.isActive
        break
      case 'activate':
        isActive = true
        break
      case 'deactivate':
        isActive = false
        break
      default:
        throw new Error('Invalid action')
    }

    const updatedSetting = await prisma.seoSetting.update({
      where: { id },
      data: {
        isActive,
        updatedBy: userId,
      }
    })

    return NextResponse.json({
      setting: updatedSetting,
      message: `SEO 설정이 ${isActive ? '활성화' : '비활성화'}되었습니다.`
    })

  } catch (error) {
    console.error('Error patching SEO setting:', error)
    return NextResponse.json(
      { error: 'SEO 설정 상태 변경에 실패했습니다.' },
      { status: 500 }
    )
  }
}