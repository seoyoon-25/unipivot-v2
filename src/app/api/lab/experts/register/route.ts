import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { convertCategoryToOrigin } from '@/lib/constants/migrant'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const {
      name,
      email,
      phone,
      title,
      organization,
      // 기존 필드 (하위 호환)
      origin,
      // 새 필드
      originCategory,
      originCountry,
      arrivalYear,
      targetExpertise,
      // 북한이탈주민 특화 필드
      defectionYear,
      settlementYear,
      hometown,
      categories,
      specialties,
      lectureTopics,
      lectureAreas,
      lectureFeeMin,
      lectureFeeMax,
      lectureNote,
      bio,
      education,
      career,
      surveyAvailable,
      interviewAvailable,
    } = body

    // Validation
    if (!name || !email) {
      return NextResponse.json(
        { error: '이름과 이메일은 필수입니다.' },
        { status: 400 }
      )
    }

    // Check for duplicate email
    const existingExpert = await prisma.expertProfile.findFirst({
      where: { email },
    })

    if (existingExpert) {
      return NextResponse.json(
        { error: '이미 등록된 이메일입니다.' },
        { status: 400 }
      )
    }

    // origin 값 결정 (하위 호환성 유지)
    const resolvedOrigin = origin || (originCategory ? convertCategoryToOrigin(originCategory) : 'NORTH')

    // Create expert profile
    const expert = await prisma.expertProfile.create({
      data: {
        name,
        email,
        phone,
        title,
        organization,
        // 출신 정보
        origin: resolvedOrigin,
        originCategory: originCategory || (origin === 'NORTH' ? 'DEFECTOR' : origin === 'SOUTH' ? 'KOREAN' : null),
        originCountry,
        arrivalYear,
        // 북한이탈주민 특화 필드
        defectionYear,
        settlementYear,
        hometown,
        // 전문 대상 그룹
        targetExpertise: targetExpertise ? JSON.stringify(targetExpertise) : null,
        // 전문 분야
        categories,
        specialties,
        lectureTopics,
        lectureAreas,
        lectureFeeMin,
        lectureFeeMax,
        lectureNote,
        bio,
        education,
        career,
        surveyAvailable: surveyAvailable ?? true,
        interviewAvailable: interviewAvailable ?? true,
        isVerified: false,
        isPublic: false, // Admin needs to approve
        isActive: true,
      },
    })

    return NextResponse.json({
      success: true,
      id: expert.id,
      message: '전문가 등록 신청이 완료되었습니다.',
    })
  } catch (error) {
    console.error('Error registering expert:', error)
    return NextResponse.json(
      { error: '등록 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
