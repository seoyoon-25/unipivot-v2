import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/db'

// GET /api/notifications - 내 알림 목록
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const unreadOnly = searchParams.get('unreadOnly') === 'true'

    const where: any = { userId: session.user.id }
    if (unreadOnly) {
      where.isRead = false
    }

    const [notifications, total, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit
      }),
      prisma.notification.count({ where }),
      prisma.notification.count({
        where: { userId: session.user.id, isRead: false }
      })
    ])

    return NextResponse.json({
      notifications,
      total,
      unreadCount,
      pages: Math.ceil(total / limit)
    })
  } catch (error) {
    console.error('Error fetching notifications:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/notifications - 알림 생성 (관리자용)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 })
    }

    // 관리자 권한 체크
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true }
    })

    if (user?.role !== 'ADMIN') {
      return NextResponse.json({ error: '권한이 없습니다.' }, { status: 403 })
    }

    const body = await request.json()
    const { type, title, content, link, userIds, sendToAll } = body

    if (!title) {
      return NextResponse.json({ error: '제목을 입력해주세요.' }, { status: 400 })
    }

    let targetUserIds: string[] = []

    if (sendToAll) {
      const allUsers = await prisma.user.findMany({
        where: { status: 'ACTIVE' },
        select: { id: true }
      })
      targetUserIds = allUsers.map(u => u.id)
    } else if (userIds && Array.isArray(userIds)) {
      targetUserIds = userIds
    } else {
      return NextResponse.json({ error: '수신자를 지정해주세요.' }, { status: 400 })
    }

    // 일괄 알림 생성
    const notifications = await prisma.notification.createMany({
      data: targetUserIds.map(userId => ({
        userId,
        type: type || 'SYSTEM',
        title,
        content,
        link
      }))
    })

    return NextResponse.json({
      success: true,
      count: notifications.count
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating notification:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
