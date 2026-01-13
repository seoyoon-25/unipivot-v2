import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params

    const participation = await prisma.researchParticipation.findUnique({
      where: { id },
      include: {
        survey: true,
        expert: true,
      },
    })

    if (!participation) {
      return NextResponse.json(
        { error: 'Participation not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(participation)
  } catch (error) {
    console.error('Error fetching participation:', error)
    return NextResponse.json(
      { error: 'Failed to fetch participation' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params
    const body = await request.json()

    const updateData: any = {}

    if (body.status !== undefined) {
      updateData.status = body.status
      // If marked as completed, update completedAt
      if (body.status === 'COMPLETED') {
        updateData.completedAt = new Date()
      }
    }
    if (body.rewardStatus !== undefined) {
      updateData.rewardStatus = body.rewardStatus
    }
    if (body.rewardAmount !== undefined) {
      updateData.rewardAmount = body.rewardAmount
    }
    if (body.paidAt !== undefined) {
      updateData.paidAt = new Date(body.paidAt)
    }
    if (body.note !== undefined) {
      updateData.note = body.note
    }

    const participation = await prisma.researchParticipation.update({
      where: { id },
      data: updateData,
    })

    // Update survey's currentCount if status changed to COMPLETED
    if (body.status === 'COMPLETED') {
      await prisma.labSurvey.update({
        where: { id: participation.surveyId },
        data: {
          currentCount: {
            increment: 1,
          },
        },
      })
    }

    return NextResponse.json(participation)
  } catch (error) {
    console.error('Error updating participation:', error)
    return NextResponse.json(
      { error: 'Failed to update participation' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params

    await prisma.researchParticipation.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting participation:', error)
    return NextResponse.json(
      { error: 'Failed to delete participation' },
      { status: 500 }
    )
  }
}
