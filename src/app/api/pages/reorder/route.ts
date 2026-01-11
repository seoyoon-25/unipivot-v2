import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/db'

interface ReorderItem {
  id: string
  parentId: string | null
  order: number
}

// PUT /api/pages/reorder - Batch update page order and hierarchy
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || (session.user?.role !== 'ADMIN' && session.user?.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { items } = body as { items: ReorderItem[] }

    if (!items || !Array.isArray(items)) {
      return NextResponse.json({ error: 'Items array is required' }, { status: 400 })
    }

    // Batch update all items
    await prisma.$transaction(
      items.map((item) =>
        prisma.pageContent.update({
          where: { id: item.id },
          data: {
            parentId: item.parentId,
            order: item.order,
          },
        })
      )
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error reordering pages:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
