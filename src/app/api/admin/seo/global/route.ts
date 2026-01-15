import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { z } from 'zod'

// 전역 SEO 설정 스키마
const globalSeoSettingSchema = z.object({
  settingKey: z.string().min(1, '설정 키를 입력해주세요'),
  siteName: z.string().optional(),
  siteDescription: z.string().optional(),
  siteUrl: z.string().url().optional(),
  defaultImage: z.string().url().optional(),
  twitterHandle: z.string().optional(),
  facebookPage: z.string().url().optional(),
  linkedinPage: z.string().url().optional(),
  youtubeChannel: z.string().url().optional(),
  googleSiteVerification: z.string().optional(),
  googleAnalyticsId: z.string().optional(),
  googleTagManagerId: z.string().optional(),
  naverSiteVerification: z.string().optional(),
  bingSiteVerification: z.string().optional(),
  robotsTxt: z.string().optional(),
  sitemapEnabled: z.boolean().default(true),
  sitemapPriority: z.number().min(0).max(1).default(0.5),
  sitemapChangefreq: z.enum(['always', 'hourly', 'daily', 'weekly', 'monthly', 'yearly', 'never']).default('weekly')
})

// 권한 확인 함수
async function checkAdminPermission() {
  const session = await getServerSession(authOptions)

  if (!session?.user || !['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) {
    return { error: '권한이 없습니다.' }
  }

  return { userId: session.user.id, role: session.user.role }
}

// GET: 전역 SEO 설정 조회
export async function GET(request: NextRequest) {
  try {
    const { error } = await checkAdminPermission()
    if (error) {
      return NextResponse.json({ error }, { status: 403 })
    }

    const settings = await prisma.globalSeoSetting.findMany({
      orderBy: { settingKey: 'asc' }
    })

    // 설정을 키-값 형태로 변환
    const settingsMap = settings.reduce((acc, setting) => {
      acc[setting.settingKey] = {
        id: setting.id,
        siteName: setting.siteName,
        siteDescription: setting.siteDescription,
        siteUrl: setting.siteUrl,
        defaultImage: setting.defaultImage,
        twitterHandle: setting.twitterHandle,
        facebookPage: setting.facebookPage,
        linkedinPage: setting.linkedinPage,
        youtubeChannel: setting.youtubeChannel,
        googleSiteVerification: setting.googleSiteVerification,
        googleAnalyticsId: setting.googleAnalyticsId,
        googleTagManagerId: setting.googleTagManagerId,
        naverSiteVerification: setting.naverSiteVerification,
        bingSiteVerification: setting.bingSiteVerification,
        robotsTxt: setting.robotsTxt,
        sitemapEnabled: setting.sitemapEnabled,
        sitemapPriority: setting.sitemapPriority,
        sitemapChangefreq: setting.sitemapChangefreq,
        updatedAt: setting.updatedAt
      }
      return acc
    }, {} as Record<string, any>)

    return NextResponse.json({ settings: settingsMap })

  } catch (error) {
    console.error('Error fetching global SEO settings:', error)
    return NextResponse.json(
      { error: '전역 SEO 설정을 불러오는데 실패했습니다.' },
      { status: 500 }
    )
  }
}

// PUT: 전역 SEO 설정 업데이트
export async function PUT(request: NextRequest) {
  try {
    const { error, userId } = await checkAdminPermission()
    if (error) {
      return NextResponse.json({ error }, { status: 403 })
    }

    const body = await request.json()
    const validatedData = globalSeoSettingSchema.parse(body)

    const setting = await prisma.globalSeoSetting.upsert({
      where: { settingKey: validatedData.settingKey },
      update: {
        ...validatedData,
        updatedBy: userId,
      },
      create: {
        ...validatedData,
        updatedBy: userId,
      }
    })

    return NextResponse.json({ setting })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: '입력 데이터가 올바르지 않습니다.', details: error.issues },
        { status: 400 }
      )
    }

    console.error('Error updating global SEO setting:', error)
    return NextResponse.json(
      { error: '전역 SEO 설정 업데이트에 실패했습니다.' },
      { status: 500 }
    )
  }
}