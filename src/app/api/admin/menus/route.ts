import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const location = searchParams.get('location') || undefined

    const where: any = {}
    if (location) {
      where.location = location
    }

    const menus = await prisma.menu.findMany({
      where,
      orderBy: [{ location: 'asc' }, { position: 'asc' }],
    })

    return NextResponse.json(menus)
  } catch (error) {
    console.error('Error fetching menus:', error)
    return NextResponse.json(
      { error: 'Failed to fetch menus' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const menu = await prisma.menu.create({
      data: {
        title: body.title,
        url: body.url,
        target: body.target || '_self',
        position: body.position ?? 0,
        isActive: body.isActive ?? true,
        parentId: body.parentId,
        location: body.location,
      },
    })

    return NextResponse.json(menu)
  } catch (error) {
    console.error('Error creating menu:', error)
    return NextResponse.json(
      { error: 'Failed to create menu' },
      { status: 500 }
    )
  }
}
