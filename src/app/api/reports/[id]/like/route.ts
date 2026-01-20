import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

// POST /api/reports/[id]/like - 좋아요 토글 (BookReport용)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 })
    }

    const { id: reportId } = await params

    // 현재 사용자의 Member 찾기
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { member: true }
    })

    if (!user?.member) {
      return NextResponse.json({ error: '회원 정보를 찾을 수 없습니다.' }, { status: 400 })
    }

    const memberId = user.member.id

    // BookReport 존재 확인
    const report = await prisma.bookReport.findUnique({
      where: { id: reportId }
    })

    if (report) {
      // BookReport에 대한 좋아요 처리
      const existingLike = await prisma.bookReportLike.findUnique({
        where: {
          reportId_memberId: {
            reportId,
            memberId
          }
        }
      })

      if (existingLike) {
        // 좋아요 취소
        await prisma.bookReportLike.delete({
          where: { id: existingLike.id }
        })

        await prisma.bookReport.update({
          where: { id: reportId },
          data: { likeCount: { decrement: 1 } }
        })

        return NextResponse.json({ liked: false, success: true })
      } else {
        // 좋아요 추가
        await prisma.bookReportLike.create({
          data: {
            reportId,
            memberId
          }
        })

        await prisma.bookReport.update({
          where: { id: reportId },
          data: { likeCount: { increment: 1 } }
        })

        return NextResponse.json({ liked: true, success: true })
      }
    }

    // ProgramReport 확인 (기존 호환성)
    const programReport = await prisma.programReport.findUnique({
      where: { id: reportId }
    })

    if (programReport) {
      const existing = await prisma.reportLike.findUnique({
        where: {
          reportId_userId: {
            reportId,
            userId: session.user.id
          }
        }
      })

      if (existing) {
        await prisma.reportLike.delete({
          where: { id: existing.id }
        })

        await prisma.programReport.update({
          where: { id: reportId },
          data: { likeCount: { decrement: 1 } }
        })

        return NextResponse.json({ liked: false, success: true })
      } else {
        await prisma.reportLike.create({
          data: {
            reportId,
            userId: session.user.id
          }
        })

        await prisma.programReport.update({
          where: { id: reportId },
          data: { likeCount: { increment: 1 } }
        })

        return NextResponse.json({ liked: true, success: true })
      }
    }

    return NextResponse.json({ error: '독후감을 찾을 수 없습니다.' }, { status: 404 })
  } catch (error) {
    console.error('Error toggling like:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
