import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
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

// GET - 현재 카드 설정 조회
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || !['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) {
      return NextResponse.json({ error: '권한이 없습니다.' }, { status: 403 })
    }

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
    return NextResponse.json(
      { error: '카드 설정 조회 중 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}

// PUT - 카드 설정 업데이트
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ error: '권한이 없습니다' }, { status: 403 })
    }

    const body = await request.json()
    const { statusBadge, modeBadge } = body

    // 설정값 저장
    const settingsToUpdate = [
      { key: 'cards.statusBadge.size', value: statusBadge?.size || 'sm' },
      { key: 'cards.statusBadge.rounded', value: statusBadge?.rounded || 'full' },
      { key: 'cards.modeBadge.size', value: modeBadge?.size || 'sm' },
      { key: 'cards.modeBadge.rounded', value: modeBadge?.rounded || 'md' },
    ]

    for (const setting of settingsToUpdate) {
      await prisma.siteSetting.upsert({
        where: { key: setting.key },
        update: { value: setting.value },
        create: {
          key: setting.key,
          value: setting.value,
          type: 'TEXT',
        },
      })
    }

    return NextResponse.json({
      success: true,
      message: '카드 설정이 저장되었습니다',
    })
  } catch (error) {
    console.error('Update card settings error:', error)
    return NextResponse.json(
      { error: '카드 설정 저장 중 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}
