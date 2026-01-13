import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import {
  GRADES,
  GRADE_TO_ROLE,
  canChangeGrade,
  getGradeInfo,
} from '@/lib/constants/member-grades'

interface RouteParams {
  params: Promise<{ id: string }>
}

// 회원 등급 조회
export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions)
    const { id } = await params

    if (!session || (session.user?.role !== 'ADMIN' && session.user?.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ error: '권한이 없습니다.' }, { status: 403 })
    }

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        grade: true,
        gradeUpdatedAt: true,
        gradeHistory: {
          orderBy: { createdAt: 'desc' },
          take: 10,
          select: {
            id: true,
            previousGrade: true,
            newGrade: true,
            previousRole: true,
            newRole: true,
            reason: true,
            changedBy: true,
            createdAt: true,
          },
        },
      },
    })

    if (!user) {
      return NextResponse.json({ error: '회원을 찾을 수 없습니다.' }, { status: 404 })
    }

    return NextResponse.json({
      ...user,
      gradeInfo: getGradeInfo(user.grade),
    })
  } catch (error) {
    console.error('Error fetching user grade:', error)
    return NextResponse.json({ error: '등급 조회 중 오류가 발생했습니다.' }, { status: 500 })
  }
}

// 회원 등급 변경
export async function PATCH(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions)
    const { id } = await params

    if (!session || (session.user?.role !== 'ADMIN' && session.user?.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ error: '권한이 없습니다.' }, { status: 403 })
    }

    const body = await req.json()
    const { newGrade, reason } = body

    // 등급 유효성 검사
    if (newGrade === undefined || newGrade < GRADES.USER || newGrade > GRADES.SUPER_ADMIN) {
      return NextResponse.json({ error: '유효하지 않은 등급입니다.' }, { status: 400 })
    }

    // 대상 사용자 조회
    const targetUser = await prisma.user.findUnique({
      where: { id },
      select: { id: true, name: true, role: true, grade: true },
    })

    if (!targetUser) {
      return NextResponse.json({ error: '회원을 찾을 수 없습니다.' }, { status: 404 })
    }

    // 현재 관리자의 등급 조회
    const currentAdmin = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { grade: true },
    })

    if (!currentAdmin) {
      return NextResponse.json({ error: '관리자 정보를 찾을 수 없습니다.' }, { status: 500 })
    }

    // 등급 변경 권한 확인
    if (!canChangeGrade(currentAdmin.grade, targetUser.grade, newGrade)) {
      return NextResponse.json({ error: '이 사용자의 등급을 변경할 권한이 없습니다.' }, { status: 403 })
    }

    // 같은 등급으로 변경 시도 시
    if (targetUser.grade === newGrade) {
      return NextResponse.json({ error: '이미 해당 등급입니다.' }, { status: 400 })
    }

    // 새 역할 결정
    const newRole = GRADE_TO_ROLE[newGrade as keyof typeof GRADE_TO_ROLE]

    // 트랜잭션으로 등급 변경 및 이력 기록
    const updatedUser = await prisma.$transaction(async (tx) => {
      // 사용자 등급 업데이트
      const user = await tx.user.update({
        where: { id },
        data: {
          grade: newGrade,
          role: newRole,
          gradeUpdatedAt: new Date(),
        },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          grade: true,
          gradeUpdatedAt: true,
        },
      })

      // 등급 변경 이력 기록
      await tx.memberGradeHistory.create({
        data: {
          userId: id,
          previousGrade: targetUser.grade,
          newGrade,
          previousRole: targetUser.role,
          newRole,
          reason: reason || null,
          changedBy: session.user.id,
        },
      })

      return user
    })

    return NextResponse.json({
      ...updatedUser,
      gradeInfo: getGradeInfo(updatedUser.grade),
      message: `${targetUser.name || '회원'}님의 등급이 변경되었습니다.`,
    })
  } catch (error) {
    console.error('Error updating user grade:', error)
    return NextResponse.json({ error: '등급 변경 중 오류가 발생했습니다.' }, { status: 500 })
  }
}
