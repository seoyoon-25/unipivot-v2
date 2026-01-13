import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params

    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        partners: {
          include: {
            partner: true,
          },
        },
        milestones: true,
        documents: true,
        events: true,
      },
    })

    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(project)
  } catch (error) {
    console.error('Error fetching project:', error)
    return NextResponse.json(
      { error: 'Failed to fetch project' },
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
    if (body.description !== undefined) updateData.description = body.description
    if (body.status !== undefined) updateData.status = body.status
    if (body.budget !== undefined) updateData.budget = body.budget
    if (body.startDate !== undefined) {
      updateData.startDate = body.startDate ? new Date(body.startDate) : null
    }
    if (body.endDate !== undefined) {
      updateData.endDate = body.endDate ? new Date(body.endDate) : null
    }

    const project = await prisma.project.update({
      where: { id },
      data: updateData,
    })

    // Update partner associations if provided
    if (body.partnerIds !== undefined) {
      // Remove existing associations
      await prisma.partnerOnProject.deleteMany({
        where: { projectId: id },
      })

      // Create new associations
      if (body.partnerIds.length > 0) {
        await prisma.partnerOnProject.createMany({
          data: body.partnerIds.map((partnerId: string) => ({
            projectId: id,
            partnerId,
          })),
        })
      }
    }

    return NextResponse.json(project)
  } catch (error) {
    console.error('Error updating project:', error)
    return NextResponse.json(
      { error: 'Failed to update project' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params

    // Delete related records first
    await prisma.partnerOnProject.deleteMany({
      where: { projectId: id },
    })
    await prisma.milestone.deleteMany({
      where: { projectId: id },
    })
    // Documents and events have onDelete: SetNull, so they'll have projectId set to null

    await prisma.project.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting project:', error)
    return NextResponse.json(
      { error: 'Failed to delete project' },
      { status: 500 }
    )
  }
}
