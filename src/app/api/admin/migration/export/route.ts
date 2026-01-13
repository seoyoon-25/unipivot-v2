import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/db'

// GET /api/admin/migration/export - 데이터 내보내기
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 })
    }

    // 관리자 권한 체크
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true }
    })

    if (user?.role !== 'ADMIN') {
      return NextResponse.json({ error: '권한이 없습니다.' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const tables = searchParams.get('tables')?.split(',') || ['all']

    const exportData: Record<string, any> = {
      exportedAt: new Date().toISOString(),
      version: '2.0'
    }

    // 각 테이블 데이터 수집
    if (tables.includes('all') || tables.includes('users')) {
      exportData.users = await prisma.user.findMany({
        select: {
          id: true,
          email: true,
          name: true,
          phone: true,
          origin: true,
          status: true,
          role: true,
          createdAt: true
        }
      })
    }

    if (tables.includes('all') || tables.includes('programs')) {
      exportData.programs = await prisma.program.findMany({
        include: {
          sessions: true,
          books: { include: { book: true } }
        }
      })
    }

    if (tables.includes('all') || tables.includes('programParticipants')) {
      exportData.programParticipants = await prisma.programParticipant.findMany({
        include: {
          attendances: true,
          reports: true
        }
      })
    }

    if (tables.includes('all') || tables.includes('donations')) {
      exportData.donations = await prisma.donation.findMany()
    }

    if (tables.includes('all') || tables.includes('financeDonations')) {
      exportData.financeDonations = await prisma.financeDonation.findMany({
        include: { donor: true }
      })
    }

    if (tables.includes('all') || tables.includes('financeTransactions')) {
      exportData.financeTransactions = await prisma.financeTransaction.findMany({
        include: {
          fund: true,
          financeAccount: true
        }
      })
    }

    if (tables.includes('all') || tables.includes('funds')) {
      exportData.funds = await prisma.fund.findMany()
    }

    if (tables.includes('all') || tables.includes('financeAccounts')) {
      exportData.financeAccounts = await prisma.financeAccount.findMany()
    }

    if (tables.includes('all') || tables.includes('financeProjects')) {
      exportData.financeProjects = await prisma.financeProject.findMany({
        include: { budgetItems: true }
      })
    }

    if (tables.includes('all') || tables.includes('notices')) {
      exportData.notices = await prisma.notice.findMany()
    }

    if (tables.includes('all') || tables.includes('books')) {
      exportData.books = await prisma.book.findMany()
    }

    // 로그 기록
    await prisma.activityLog.create({
      data: {
        userId: session.user.id,
        action: 'DATA_EXPORT',
        target: tables.join(','),
        details: `Exported ${Object.keys(exportData).length - 2} tables`
      }
    })

    return new NextResponse(JSON.stringify(exportData, null, 2), {
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="unipivot-export-${new Date().toISOString().split('T')[0]}.json"`
      }
    })
  } catch (error) {
    console.error('Error exporting data:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
