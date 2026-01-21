import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { z } from 'zod'
import crypto from 'crypto'
import puppeteer from 'puppeteer'
import fs from 'fs/promises'
import path from 'path'

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

    // 스크린샷 생성
    let screenshotUrl = null
    if (validatedData.includeScreenshot) {
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

// 디바이스별 뷰포트 설정
const DEVICE_VIEWPORTS = {
  mobile: { width: 375, height: 812, deviceScaleFactor: 2, isMobile: true },
  tablet: { width: 768, height: 1024, deviceScaleFactor: 2, isMobile: true },
  desktop: { width: 1920, height: 1080, deviceScaleFactor: 1, isMobile: false },
}

// 스크린샷 생성 함수
async function generateScreenshot(sessionId: string, device: string): Promise<string | null> {
  let browser = null

  try {
    // 미리보기 세션 정보 조회
    const previewSession = await prisma.previewSession.findUnique({
      where: { id: sessionId },
      select: { sessionKey: true }
    })

    if (!previewSession) {
      console.error('Preview session not found:', sessionId)
      return null
    }

    // 미리보기 URL 생성
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
    const previewUrl = `${baseUrl}/preview/${previewSession.sessionKey}`

    // Puppeteer 브라우저 시작
    browser = await puppeteer.launch({
      headless: true,
      executablePath: process.env.CHROME_PATH || '/usr/bin/google-chrome',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--disable-web-security',
        '--disable-features=VizDisplayCompositor',
      ],
    })

    const page = await browser.newPage()

    // 뷰포트 설정
    const viewport = DEVICE_VIEWPORTS[device as keyof typeof DEVICE_VIEWPORTS] || DEVICE_VIEWPORTS.desktop
    await page.setViewport({
      width: viewport.width,
      height: viewport.height,
      deviceScaleFactor: viewport.deviceScaleFactor,
      isMobile: viewport.isMobile,
    })

    // 페이지 로드
    await page.goto(previewUrl, {
      waitUntil: 'networkidle0',
      timeout: 30000,
    })

    // 페이지 완전 로드 대기 (추가 렌더링 시간)
    await new Promise(resolve => setTimeout(resolve, 1000))

    // 스크린샷 촬영
    const screenshotBuffer = await page.screenshot({
      fullPage: true,
      type: 'png',
    })

    // 스크린샷 저장
    const screenshotsDir = path.join(process.cwd(), 'public', 'screenshots')
    await fs.mkdir(screenshotsDir, { recursive: true })

    const timestamp = Date.now()
    const fileName = `snapshot_${sessionId}_${device}_${timestamp}.png`
    const filePath = path.join(screenshotsDir, fileName)

    await fs.writeFile(filePath, screenshotBuffer)

    // 공개 URL 반환
    return `/screenshots/${fileName}`
  } catch (error) {
    console.error('Error generating screenshot:', error)
    return null
  } finally {
    if (browser) {
      await browser.close()
    }
  }
}