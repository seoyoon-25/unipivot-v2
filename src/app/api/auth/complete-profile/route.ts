import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: '로그인이 필요합니다.' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { skipProfile, name, phone, origin, birthYear, occupation } = body

    // 프로필 건너뛰기 요청
    if (skipProfile) {
      await prisma.user.update({
        where: { id: session.user.id },
        data: { profileCompleted: true },
      })

      return NextResponse.json({ success: true })
    }

    // 프로필 업데이트
    const updateData: any = {
      profileCompleted: true,
    }

    if (name) updateData.name = name
    if (phone) updateData.phone = phone
    if (origin && ['SOUTH', 'NORTH', 'OVERSEAS'].includes(origin)) {
      updateData.origin = origin
    }
    if (birthYear && birthYear >= 1900 && birthYear <= new Date().getFullYear()) {
      updateData.birthYear = birthYear
    }
    if (occupation) updateData.occupation = occupation

    await prisma.user.update({
      where: { id: session.user.id },
      data: updateData,
    })

    // 활동 로그 기록
    await prisma.activityLog.create({
      data: {
        userId: session.user.id,
        action: 'PROFILE_COMPLETE',
        target: 'User',
        targetId: session.user.id,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Complete profile error:', error)
    return NextResponse.json(
      { error: '프로필 저장 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
