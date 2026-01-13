import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params

    const expert = await prisma.expertProfile.findUnique({
      where: { id },
    })

    if (!expert) {
      return NextResponse.json(
        { error: 'Expert not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(expert)
  } catch (error) {
    console.error('Error fetching expert:', error)
    return NextResponse.json(
      { error: 'Failed to fetch expert' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params
    const body = await request.json()

    const updateData: any = {}

    if (typeof body.isVerified === 'boolean') {
      updateData.isVerified = body.isVerified
    }
    if (typeof body.isPublic === 'boolean') {
      updateData.isPublic = body.isPublic
    }
    if (typeof body.isActive === 'boolean') {
      updateData.isActive = body.isActive
    }
    if (body.name) {
      updateData.name = body.name
    }
    if (body.title !== undefined) {
      updateData.title = body.title
    }
    if (body.organization !== undefined) {
      updateData.organization = body.organization
    }
    if (body.phone !== undefined) {
      updateData.phone = body.phone
    }
    if (body.categories !== undefined) {
      updateData.categories = body.categories
    }
    if (body.specialties !== undefined) {
      updateData.specialties = body.specialties
    }

    const expert = await prisma.expertProfile.update({
      where: { id },
      data: updateData,
    })

    return NextResponse.json(expert)
  } catch (error) {
    console.error('Error updating expert:', error)
    return NextResponse.json(
      { error: 'Failed to update expert' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params

    await prisma.expertProfile.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting expert:', error)
    return NextResponse.json(
      { error: 'Failed to delete expert' },
      { status: 500 }
    )
  }
}
