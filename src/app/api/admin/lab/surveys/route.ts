import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // targetCategories 처리 (배열 → JSON 문자열)
    const targetCategories = body.targetCategories
      ? JSON.stringify(body.targetCategories)
      : null
    const targetCountries = body.targetCountries
      ? JSON.stringify(body.targetCountries)
      : null

    const survey = await prisma.labSurvey.create({
      data: {
        title: body.title,
        description: body.description || null,
        type: body.type || 'SURVEY',
        targetCount: body.targetCount || 10,
        targetOrigin: body.targetOrigin || null,
        targetCategories,
        targetCountries,
        targetAgeMin: body.targetAgeMin || null,
        targetAgeMax: body.targetAgeMax || null,
        targetGender: body.targetGender || null,
        targetConditions: body.targetConditions || null,
        questionCount: body.questionCount || null,
        estimatedTime: body.estimatedTime || null,
        externalUrl: body.externalUrl || null,
        rewardType: body.rewardType || 'CASH',
        rewardAmount: body.rewardAmount || null,
        rewardNote: body.rewardNote || null,
        startDate: new Date(body.startDate),
        endDate: new Date(body.endDate),
        isExternal: body.isExternal || false,
        requesterOrg: body.requesterOrg || null,
        status: body.status || 'DRAFT',
        isPublic: body.isPublic || false,
      },
    })

    return NextResponse.json(survey)
  } catch (error) {
    console.error('Error creating survey:', error)
    return NextResponse.json(
      { error: 'Failed to create survey' },
      { status: 500 }
    )
  }
}
