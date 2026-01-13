import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params

    const survey = await prisma.labSurvey.findUnique({
      where: { id },
      include: {
        _count: {
          select: { participations: true },
        },
      },
    })

    if (!survey) {
      return NextResponse.json(
        { error: 'Survey not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(survey)
  } catch (error) {
    console.error('Error fetching survey:', error)
    return NextResponse.json(
      { error: 'Failed to fetch survey' },
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
    if (body.type !== undefined) updateData.type = body.type
    if (body.targetCount !== undefined) updateData.targetCount = body.targetCount
    if (body.targetOrigin !== undefined) updateData.targetOrigin = body.targetOrigin
    if (body.targetCategories !== undefined) {
      updateData.targetCategories = body.targetCategories
        ? JSON.stringify(body.targetCategories)
        : null
    }
    if (body.targetCountries !== undefined) {
      updateData.targetCountries = body.targetCountries
        ? JSON.stringify(body.targetCountries)
        : null
    }
    if (body.targetAgeMin !== undefined) updateData.targetAgeMin = body.targetAgeMin
    if (body.targetAgeMax !== undefined) updateData.targetAgeMax = body.targetAgeMax
    if (body.targetGender !== undefined) updateData.targetGender = body.targetGender
    if (body.targetConditions !== undefined) updateData.targetConditions = body.targetConditions
    if (body.questionCount !== undefined) updateData.questionCount = body.questionCount
    if (body.estimatedTime !== undefined) updateData.estimatedTime = body.estimatedTime
    if (body.externalUrl !== undefined) updateData.externalUrl = body.externalUrl
    if (body.rewardType !== undefined) updateData.rewardType = body.rewardType
    if (body.rewardAmount !== undefined) updateData.rewardAmount = body.rewardAmount
    if (body.rewardNote !== undefined) updateData.rewardNote = body.rewardNote
    if (body.startDate !== undefined) updateData.startDate = new Date(body.startDate)
    if (body.endDate !== undefined) updateData.endDate = new Date(body.endDate)
    if (body.isExternal !== undefined) updateData.isExternal = body.isExternal
    if (body.requesterOrg !== undefined) updateData.requesterOrg = body.requesterOrg
    if (body.status !== undefined) updateData.status = body.status
    if (body.isPublic !== undefined) updateData.isPublic = body.isPublic
    if (body.currentCount !== undefined) updateData.currentCount = body.currentCount

    const survey = await prisma.labSurvey.update({
      where: { id },
      data: updateData,
    })

    return NextResponse.json(survey)
  } catch (error) {
    console.error('Error updating survey:', error)
    return NextResponse.json(
      { error: 'Failed to update survey' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params

    // Delete related participations first
    await prisma.researchParticipation.deleteMany({
      where: { surveyId: id },
    })

    await prisma.labSurvey.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting survey:', error)
    return NextResponse.json(
      { error: 'Failed to delete survey' },
      { status: 500 }
    )
  }
}
