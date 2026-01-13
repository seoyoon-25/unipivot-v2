import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

// GET - Get book survey results for a program
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ error: '권한이 없습니다' }, { status: 403 })
    }

    const { id: programId } = await params

    const applications = await prisma.programApplication.findMany({
      where: {
        programId,
        status: { in: ['ACCEPTED', 'ADDITIONAL'] },
      },
      select: {
        id: true,
        bookReceiveType: true,
        ebookProvider: true,
        ebookProviderOther: true,
        bookSurveyCompletedAt: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
      },
      orderBy: { appliedAt: 'desc' },
    })

    // Summary stats
    const total = applications.length
    const completed = applications.filter((a) => a.bookSurveyCompletedAt).length
    const pending = total - completed

    const byType = {
      PAPER: applications.filter((a) => a.bookReceiveType === 'PAPER').length,
      EBOOK: applications.filter((a) => a.bookReceiveType === 'EBOOK').length,
      OWN: applications.filter((a) => a.bookReceiveType === 'OWN').length,
    }

    const ebookByProvider: Record<string, number> = {}
    applications
      .filter((a) => a.bookReceiveType === 'EBOOK' && a.ebookProvider)
      .forEach((a) => {
        const provider = a.ebookProvider === 'OTHER' ? a.ebookProviderOther || 'OTHER' : a.ebookProvider!
        ebookByProvider[provider] = (ebookByProvider[provider] || 0) + 1
      })

    return NextResponse.json({
      summary: {
        total,
        completed,
        pending,
        byType,
        ebookByProvider,
      },
      applications,
    })
  } catch (error) {
    console.error('Get book surveys error:', error)
    return NextResponse.json(
      { error: '조회 중 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}
