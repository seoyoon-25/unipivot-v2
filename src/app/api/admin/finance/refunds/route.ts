import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/db'

// GET: 보증금 반환 현황 목록
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: '권한이 없습니다.' }, { status: 403 })
    }

    // 보증금 설정이 있는 프로그램만 조회
    const programs = await prisma.program.findMany({
      where: {
        depositSetting: {
          isNot: null,
        },
      },
      include: {
        depositSetting: {
          select: {
            depositAmount: true,
            surveyRequired: true,
          },
        },
        _count: {
          select: {
            applications: {
              where: { status: 'ACCEPTED' },
            },
          },
        },
        applications: {
          where: { status: 'ACCEPTED' },
          select: {
            depositStatus: true,
            surveyResponse: {
              select: {
                refundChoice: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    // 각 프로그램의 반환 통계 계산
    const programsWithStats = programs.map((program) => {
      const stats = {
        total: program.applications.length,
        pending: 0,
        completed: 0,
        donated: 0,
      }

      program.applications.forEach((app) => {
        if (app.depositStatus === 'REFUND_PENDING') {
          stats.pending++
        } else if (app.depositStatus === 'REFUNDED') {
          stats.completed++
        } else if (app.depositStatus === 'DONATED' || app.surveyResponse?.refundChoice === 'DONATE') {
          stats.donated++
        }
      })

      return {
        id: program.id,
        title: program.title,
        type: program.type,
        endDate: program.endDate,
        depositSetting: program.depositSetting,
        _count: program._count,
        refundStats: stats,
      }
    })

    // 반환 대상이 있는 프로그램만 필터링 (옵션)
    const activePrograms = programsWithStats.filter(
      (p) => p.refundStats.total > 0
    )

    return NextResponse.json({ programs: activePrograms })
  } catch (error) {
    console.error('Get refund programs error:', error)
    return NextResponse.json(
      { error: '보증금 반환 현황을 불러오는데 실패했습니다.' },
      { status: 500 }
    )
  }
}
