import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/db'

// GET /api/pages - List all pages (hierarchical)
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || (session.user?.role !== 'ADMIN' && session.user?.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const flat = searchParams.get('flat') === 'true'

    if (flat) {
      // Return flat list (for dropdowns, etc.)
      const pages = await prisma.pageContent.findMany({
        orderBy: [{ order: 'asc' }, { updatedAt: 'desc' }],
      })
      return NextResponse.json(pages)
    }

    // Return hierarchical structure
    const pages = await prisma.pageContent.findMany({
      where: { parentId: null },
      orderBy: { order: 'asc' },
      include: {
        children: {
          orderBy: { order: 'asc' },
          include: {
            children: {
              orderBy: { order: 'asc' },
              include: {
                children: {
                  orderBy: { order: 'asc' },
                },
              },
            },
          },
        },
      },
    })

    return NextResponse.json(pages)
  } catch (error) {
    console.error('Error fetching pages:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/pages - Create new page
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || (session.user?.role !== 'ADMIN' && session.user?.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { title, slug, parentId, isFolder } = body

    if (!title || !slug) {
      return NextResponse.json({ error: 'Title and slug are required' }, { status: 400 })
    }

    // Check if slug already exists
    const existing = await prisma.pageContent.findUnique({ where: { slug } })
    if (existing) {
      return NextResponse.json({ error: 'Slug already exists' }, { status: 400 })
    }

    // Get max order for the parent level
    const maxOrder = await prisma.pageContent.aggregate({
      where: { parentId: parentId || null },
      _max: { order: true },
    })
    const newOrder = (maxOrder._max.order ?? -1) + 1

    const page = await prisma.pageContent.create({
      data: {
        title,
        slug,
        parentId: parentId || null,
        isFolder: isFolder || false,
        order: newOrder,
        content: '',
        styles: '',
        components: '[]',
        isPublished: false,
        isActive: true,
      },
    })

    return NextResponse.json(page)
  } catch (error) {
    console.error('Error creating page:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
