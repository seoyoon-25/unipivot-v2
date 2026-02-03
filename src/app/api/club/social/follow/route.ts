import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { followUser, unfollowUser } from '@/lib/club/social-queries'
import { createNotification } from '@/lib/club/notification-service'

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: { userId?: string; action?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { userId, action } = body

  if (!userId || !action || !['follow', 'unfollow'].includes(action)) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }

  if (userId === session.user.id) {
    return NextResponse.json(
      { error: '자기 자신을 팔로우할 수 없습니다.' },
      { status: 400 }
    )
  }

  try {
    if (action === 'follow') {
      await followUser(session.user.id, userId)

      // 팔로우 알림
      await createNotification({
        userId,
        type: 'NEW_FOLLOWER',
        title: '새 팔로워',
        content: `${session.user.name || '누군가'}님이 회원님을 팔로우했습니다.`,
        link: `/club/profile/${session.user.id}`,
      })
    } else {
      await unfollowUser(session.user.id, userId)
    }

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json(
      { error: '처리에 실패했습니다.' },
      { status: 500 }
    )
  }
}
