import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

// 폰트 설정 키
const FONT_SETTINGS_KEYS = {
  PRIMARY_FONT: 'font_primary',
  HEADING_FONT: 'font_heading',
  ACCENT_FONT: 'font_accent',
  BASE_FONT_SIZE: 'font_base_size',
  HEADING_SCALE: 'font_heading_scale',
}

// GET: 폰트 설정 조회
export async function GET() {
  try {
    const settings = await prisma.siteSetting.findMany({
      where: {
        key: {
          in: Object.values(FONT_SETTINGS_KEYS),
        },
      },
    })

    const fontSettings = {
      primaryFont: settings.find((s) => s.key === FONT_SETTINGS_KEYS.PRIMARY_FONT)?.value || 'pretendard',
      headingFont: settings.find((s) => s.key === FONT_SETTINGS_KEYS.HEADING_FONT)?.value || 'pretendard',
      accentFont: settings.find((s) => s.key === FONT_SETTINGS_KEYS.ACCENT_FONT)?.value || null,
      baseFontSize: parseInt(settings.find((s) => s.key === FONT_SETTINGS_KEYS.BASE_FONT_SIZE)?.value || '16'),
      headingScale: parseFloat(settings.find((s) => s.key === FONT_SETTINGS_KEYS.HEADING_SCALE)?.value || '1.25'),
    }

    return NextResponse.json(fontSettings)
  } catch (error) {
    console.error('Get font settings error:', error)
    return NextResponse.json({ error: '폰트 설정을 불러오는데 실패했습니다.' }, { status: 500 })
  }
}

// PUT: 폰트 설정 저장
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user || !['ADMIN', 'SUPER_ADMIN'].includes((session.user as any).role)) {
      return NextResponse.json({ error: '권한이 없습니다.' }, { status: 403 })
    }

    const body = await request.json()
    const { primaryFont, headingFont, accentFont, baseFontSize, headingScale } = body

    // 설정 저장
    const updates = [
      { key: FONT_SETTINGS_KEYS.PRIMARY_FONT, value: primaryFont || 'pretendard', type: 'TEXT' },
      { key: FONT_SETTINGS_KEYS.HEADING_FONT, value: headingFont || 'pretendard', type: 'TEXT' },
      { key: FONT_SETTINGS_KEYS.ACCENT_FONT, value: accentFont || '', type: 'TEXT' },
      { key: FONT_SETTINGS_KEYS.BASE_FONT_SIZE, value: String(baseFontSize || 16), type: 'NUMBER' },
      { key: FONT_SETTINGS_KEYS.HEADING_SCALE, value: String(headingScale || 1.25), type: 'NUMBER' },
    ]

    for (const update of updates) {
      await prisma.siteSetting.upsert({
        where: { key: update.key },
        update: { value: update.value, type: update.type },
        create: { key: update.key, value: update.value, type: update.type },
      })
    }

    return NextResponse.json({ success: true, message: '폰트 설정이 저장되었습니다.' })
  } catch (error) {
    console.error('Save font settings error:', error)
    return NextResponse.json({ error: '폰트 설정 저장에 실패했습니다.' }, { status: 500 })
  }
}
