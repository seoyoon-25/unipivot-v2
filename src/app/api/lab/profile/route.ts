import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { isProfileComplete } from '@/lib/lab/constants'
import { calculateBadges, stringifyBadges } from '@/lib/lab/badges'

// GET - 현재 사용자의 랩 프로필 조회 (없으면 자동 생성)
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 })
    }

    // 기존 프로필 조회
    let labProfile = await prisma.labProfile.findUnique({
      where: { userId: session.user.id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            origin: true,
            originCategory: true,
            birthYear: true,
          },
        },
        expertProfile: {
          select: {
            id: true,
            name: true,
            isVerified: true,
            isPublic: true,
          },
        },
      },
    })

    // 프로필이 없으면 자동 생성
    if (!labProfile) {
      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: {
          birthYear: true,
        },
      })

      labProfile = await prisma.labProfile.create({
        data: {
          userId: session.user.id,
          birthYear: user?.birthYear,
          profileComplete: false,
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              origin: true,
              originCategory: true,
              birthYear: true,
            },
          },
          expertProfile: {
            select: {
              id: true,
              name: true,
              isVerified: true,
              isPublic: true,
            },
          },
        },
      })
    }

    // 프로필 완성도 확인 및 업데이트
    const complete = isProfileComplete(labProfile)
    if (complete !== labProfile.profileComplete) {
      await prisma.labProfile.update({
        where: { id: labProfile.id },
        data: { profileComplete: complete },
      })
      labProfile.profileComplete = complete
    }

    // 뱃지 계산
    const badges = calculateBadges(labProfile)

    return NextResponse.json({
      ...labProfile,
      badges,
      occupations: labProfile.occupations ? JSON.parse(labProfile.occupations) : [],
    })
  } catch (error) {
    console.error('Lab profile GET error:', error)
    return NextResponse.json({ error: '프로필 조회 중 오류가 발생했습니다.' }, { status: 500 })
  }
}

// PATCH - 랩 프로필 업데이트
export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 })
    }

    const body = await request.json()
    const {
      birthYear,
      birthRegion,
      hometown,
      leftHometownYear,
      enteredKoreaYear,
      maritalStatus,
      educationHometown,
      educationKorea,
      occupations,
    } = body

    // 기존 프로필 조회 또는 생성
    let labProfile = await prisma.labProfile.findUnique({
      where: { userId: session.user.id },
    })

    if (!labProfile) {
      labProfile = await prisma.labProfile.create({
        data: {
          userId: session.user.id,
        },
      })
    }

    // 프로필 업데이트
    const updateData: any = {
      lastActiveAt: new Date(),
    }

    if (birthYear !== undefined) updateData.birthYear = birthYear
    if (birthRegion !== undefined) updateData.birthRegion = birthRegion
    if (hometown !== undefined) updateData.hometown = hometown
    if (leftHometownYear !== undefined) updateData.leftHometownYear = leftHometownYear
    if (enteredKoreaYear !== undefined) updateData.enteredKoreaYear = enteredKoreaYear
    if (maritalStatus !== undefined) updateData.maritalStatus = maritalStatus
    if (educationHometown !== undefined) updateData.educationHometown = educationHometown
    if (educationKorea !== undefined) updateData.educationKorea = educationKorea
    if (occupations !== undefined) {
      updateData.occupations = JSON.stringify(occupations)
    }

    // 프로필 완성도 확인
    const profileData = { ...labProfile, ...updateData }
    if (updateData.occupations) {
      profileData.occupations = updateData.occupations
    }
    updateData.profileComplete = isProfileComplete(profileData)

    const updatedProfile = await prisma.labProfile.update({
      where: { id: labProfile.id },
      data: updateData,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            origin: true,
            originCategory: true,
            birthYear: true,
          },
        },
        expertProfile: {
          select: {
            id: true,
            name: true,
            isVerified: true,
            isPublic: true,
          },
        },
      },
    })

    // 뱃지 계산 및 업데이트
    const badges = calculateBadges(updatedProfile)
    await prisma.labProfile.update({
      where: { id: updatedProfile.id },
      data: { badges: stringifyBadges(badges) },
    })

    return NextResponse.json({
      ...updatedProfile,
      badges,
      occupations: updatedProfile.occupations ? JSON.parse(updatedProfile.occupations) : [],
    })
  } catch (error) {
    console.error('Lab profile PATCH error:', error)
    return NextResponse.json({ error: '프로필 업데이트 중 오류가 발생했습니다.' }, { status: 500 })
  }
}
