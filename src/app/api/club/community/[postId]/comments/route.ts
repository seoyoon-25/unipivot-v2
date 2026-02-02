import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth/check-role'
import prisma from '@/lib/db'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ postId: string }> }
) {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { postId } = await params

  const comments = await prisma.communityComment.findMany({
    where: { postId, parentId: null },
    include: {
      author: { select: { id: true, name: true, image: true } },
      replies: {
        include: {
          author: { select: { id: true, name: true, image: true } },
        },
        orderBy: { createdAt: 'asc' },
      },
    },
    orderBy: { createdAt: 'asc' },
  })

  return NextResponse.json(comments)
}
