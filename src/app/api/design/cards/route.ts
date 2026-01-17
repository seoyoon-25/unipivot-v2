import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

// 기본 카드 설정
const defaultCardSettings = {
  statusBadge: {
    size: 'sm',
    rounded: 'full',
  },
  modeBadge: {
    size: 'sm',
    rounded: 'md',
  },
}

// GET - 현재 카드 설정 조회 (공개 API)
export async function GET() {
  try {
    const settings = await prisma.siteSetting.findMany({
      where: {
        key: {
          startsWith: 'cards.',
        },
      },
    })

    // 설정값을 객체로 변환
    const cardSettings = { ...defaultCardSettings }

    for (const setting of settings) {
      const keys = setting.key.replace('cards.', '').split('.')
      if (keys.length === 2) {
        const [badge, prop] = keys
        if (badge === 'statusBadge' || badge === 'modeBadge') {
          (cardSettings as any)[badge][prop] = setting.value
        }
      }
    }

    return NextResponse.json({ settings: cardSettings })
  } catch (error) {
    console.error('Get card settings error:', error)
    // 에러 시 기본값 반환
    return NextResponse.json({ settings: defaultCardSettings })
  }
}
