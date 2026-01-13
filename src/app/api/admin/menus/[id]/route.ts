import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params

    const menu = await prisma.menu.findUnique({
      where: { id },
    })

    if (!menu) {
      return NextResponse.json(
        { error: 'Menu not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(menu)
  } catch (error) {
    console.error('Error fetching menu:', error)
    return NextResponse.json(
      { error: 'Failed to fetch menu' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params
    const body = await request.json()

    const updateData: any = {}

    if (body.title !== undefined) updateData.title = body.title
    if (body.url !== undefined) updateData.url = body.url
    if (body.target !== undefined) updateData.target = body.target
    if (body.position !== undefined) updateData.position = body.position
    if (body.isActive !== undefined) updateData.isActive = body.isActive
    if (body.parentId !== undefined) updateData.parentId = body.parentId
    if (body.location !== undefined) updateData.location = body.location

    const menu = await prisma.menu.update({
      where: { id },
      data: updateData,
    })

    return NextResponse.json(menu)
  } catch (error) {
    console.error('Error updating menu:', error)
    return NextResponse.json(
      { error: 'Failed to update menu' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params

    // Delete all descendants recursively
    const deleteWithDescendants = async (menuId: string) => {
      const children = await prisma.menu.findMany({
        where: { parentId: menuId },
        select: { id: true },
      })

      for (const child of children) {
        await deleteWithDescendants(child.id)
      }

      await prisma.menu.delete({
        where: { id: menuId },
      })
    }

    await deleteWithDescendants(id)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting menu:', error)
    return NextResponse.json(
      { error: 'Failed to delete menu' },
      { status: 500 }
    )
  }
}
