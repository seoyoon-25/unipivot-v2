import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

const FONT_SETTINGS_KEYS = {
  PRIMARY_FONT: 'font_primary',
  HEADING_FONT: 'font_heading',
  ACCENT_FONT: 'font_accent',
  BASE_FONT_SIZE: 'font_base_size',
  HEADING_SCALE: 'font_heading_scale',
}

// GET: 폰트 설정 공개 조회 (인증 불필요)
export async function GET() {
  try {
    const settings = await prisma.siteSetting.findMany({
      where: {
        key: { in: Object.values(FONT_SETTINGS_KEYS) },
      },
    })

    const fontSettings = {
      primaryFont: settings.find((s) => s.key === FONT_SETTINGS_KEYS.PRIMARY_FONT)?.value || 'pretendard',
      headingFont: settings.find((s) => s.key === FONT_SETTINGS_KEYS.HEADING_FONT)?.value || 'pretendard',
      accentFont: settings.find((s) => s.key === FONT_SETTINGS_KEYS.ACCENT_FONT)?.value || null,
      baseFontSize: parseInt(settings.find((s) => s.key === FONT_SETTINGS_KEYS.BASE_FONT_SIZE)?.value || '16'),
      headingScale: parseFloat(settings.find((s) => s.key === FONT_SETTINGS_KEYS.HEADING_SCALE)?.value || '1.25'),
    }

    return NextResponse.json(fontSettings, {
      headers: { 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600' },
    })
  } catch (error) {
    console.error('Get public font settings error:', error)
    return NextResponse.json({
      primaryFont: 'pretendard',
      headingFont: 'pretendard',
      accentFont: null,
      baseFontSize: 16,
      headingScale: 1.25,
    })
  }
}
