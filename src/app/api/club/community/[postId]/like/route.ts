import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth/check-role'
import prisma from '@/lib/db'

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ postId: string }> }
) {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { postId } = await params

  const existing = await prisma.communityLike.findUnique({
    where: { postId_userId: { postId, userId: user.id } },
  })

  if (existing) {
    await prisma.communityLike.delete({ where: { id: existing.id } })
    const count = await prisma.communityLike.count({ where: { postId } })
    return NextResponse.json({ liked: false, likeCount: count })
  } else {
    await prisma.communityLike.create({
      data: { postId, userId: user.id },
    })
    const count = await prisma.communityLike.count({ where: { postId } })
    return NextResponse.json({ liked: true, likeCount: count })
  }
}
