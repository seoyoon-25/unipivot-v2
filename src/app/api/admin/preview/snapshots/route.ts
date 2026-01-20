import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { z } from 'zod'
import crypto from 'crypto'

// 스냅샷 생성 스키마
const createSnapshotSchema = z.object({
  sessionId: z.string().cuid(),
  name: z.string().min(1, '스냅샷 이름을 입력해주세요'),
  description: z.string().optional(),
  dataType: z.enum(['sections', 'banners', 'floating_buttons', 'seo', 'full']),
  device: z.enum(['mobile', 'tablet', 'desktop']).default('desktop'),
  theme: z.enum(['light', 'dark']).default('light'),
  includeScreenshot: z.boolean().default(false)
})

// 권한 확인 함수
async function checkAdminPermission() {
  const session = await getServerSession(authOptions)

  if (!session?.user || !['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) {
    return { error: '권한이 없습니다.' }
  }

  return { userId: session.user.id, role: session.user.role }
}

// GET: 스냅샷 목록 조회
export async function GET(request: NextRequest) {
  try {
    const { error, userId } = await checkAdminPermission()
    if (error) {
      return NextResponse.json({ error }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const sessionId = searchParams.get('sessionId')
    const dataType = searchParams.get('dataType')
    const device = searchParams.get('device')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')

    if (!sessionId) {
      return NextResponse.json(
        { error: 'sessionId가 필요합니다.' },
        { status: 400 }
      )
    }

    // 세션 소유권 확인
    const session = await prisma.previewSession.findFirst({
      where: { id: sessionId, userId }
    })

    if (!session) {
      return NextResponse.json(
        { error: '미리보기 세션을 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    const skip = (page - 1) * limit

    // 필터 조건 구성
    const where: any = { sessionId }

    if (dataType) {
      where.dataType = dataType
    }

    if (device) {
      where.device = device
    }

    const [snapshots, total] = await Promise.all([
      prisma.previewSnapshot.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          name: true,
          description: true,
          dataType: true,
          device: true,
          theme: true,
          screenshotUrl: true,
          checksum: true,
          createdBy: true,
          createdAt: true
        }
      }),
      prisma.previewSnapshot.count({ where })
    ])

    return NextResponse.json({
      snapshots,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })

  } catch (error) {
    console.error('Error fetching snapshots:', error)
    return NextResponse.json(
      { error: '스냅샷 목록을 불러오는데 실패했습니다.' },
      { status: 500 }
    )
  }
}

// POST: 새 스냅샷 생성
export async function POST(request: NextRequest) {
  try {
    const { error, userId } = await checkAdminPermission()
    if (error) {
      return NextResponse.json({ error }, { status: 403 })
    }

    const body = await request.json()
    const validatedData = createSnapshotSchema.parse(body)

    // 세션 소유권 확인
    const session = await prisma.previewSession.findFirst({
      where: { id: validatedData.sessionId, userId }
    })

    if (!session) {
      return NextResponse.json(
        { error: '미리보기 세션을 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    // 현재 데이터 수집
    const currentData = await collectCurrentData(validatedData.dataType)

    // 체크섬 생성
    const checksum = crypto
      .createHash('md5')
      .update(JSON.stringify(currentData))
      .digest('hex')

    // 스크린샷 URL 생성 (구현 예정)
    let screenshotUrl = null
    if (validatedData.includeScreenshot) {
      // TODO: 스크린샷 생성 로직 구현
      screenshotUrl = await generateScreenshot(validatedData.sessionId, validatedData.device)
    }

    const snapshot = await prisma.previewSnapshot.create({
      data: {
        sessionId: validatedData.sessionId,
        name: validatedData.name,
        description: validatedData.description,
        dataType: validatedData.dataType,
        data: JSON.stringify(currentData),
        checksum,
        device: validatedData.device,
        theme: validatedData.theme,
        screenshotUrl,
        createdBy: userId!
      }
    })

    return NextResponse.json({ snapshot }, { status: 201 })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: '입력 데이터가 올바르지 않습니다.', details: error.issues },
        { status: 400 }
      )
    }

    console.error('Error creating snapshot:', error)
    return NextResponse.json(
      { error: '스냅샷 생성에 실패했습니다.' },
      { status: 500 }
    )
  }
}

// 현재 데이터 수집 함수
async function collectCurrentData(dataType: string) {
  try {
    switch (dataType) {
      case 'sections':
        return await prisma.siteSection.findMany({
          where: { isVisible: true },
          orderBy: { order: 'asc' }
        })

      case 'banners':
        return await prisma.announcementBanner.findMany({
          where: { isActive: true }
        })

      case 'floating_buttons':
        return await prisma.floatingButton.findMany({
          where: { isActive: true }
        })

      case 'seo':
        const [seoSettingsData, globalSeoSettingsData] = await Promise.all([
          prisma.seoSetting.findMany({
            where: { isActive: true }
          }),
          prisma.globalSeoSetting.findMany()
        ])
        return { seoSettings: seoSettingsData, globalSeoSettings: globalSeoSettingsData }

      case 'full':
      default:
        const [sections, banners, floatingButtons, seoSettings, globalSeoSettings] = await Promise.all([
          prisma.siteSection.findMany({
            where: { isVisible: true },
            orderBy: { order: 'asc' }
          }),
          prisma.announcementBanner.findMany({
            where: { isActive: true }
          }),
          prisma.floatingButton.findMany({
            where: { isActive: true }
          }),
          prisma.seoSetting.findMany({
            where: { isActive: true }
          }),
          prisma.globalSeoSetting.findMany()
        ])

        return {
          sections,
          banners,
          floatingButtons,
          seoSettings,
          globalSeoSettings,
          timestamp: new Date().toISOString()
        }
    }
  } catch (error) {
    console.error('Error collecting current data:', error)
    throw new Error('데이터 수집에 실패했습니다.')
  }
}

// 스크린샷 생성 함수 (향후 구현)
async function generateScreenshot(sessionId: string, device: string): Promise<string | null> {
  try {
    // TODO: Puppeteer나 Playwright를 사용한 스크린샷 생성
    // 1. 미리보기 URL 생성
    // 2. 디바이스별 뷰포트 설정
    // 3. 스크린샷 촬영
    // 4. 이미지 저장 및 URL 반환
    return null
  } catch (error) {
    console.error('Error generating screenshot:', error)
    return null
  }
}