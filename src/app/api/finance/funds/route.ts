import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/db'

// GET /api/finance/funds - 기금 목록 조회
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || (session.user?.role !== 'ADMIN' && session.user?.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const isActive = searchParams.get('isActive')
    const type = searchParams.get('type')

    const where: Record<string, unknown> = {}
    if (isActive !== null) where.isActive = isActive === 'true'
    if (type) where.type = type

    const funds = await prisma.fund.findMany({
      where,
      include: {
        financeProject: true,
        _count: {
          select: { transactions: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(funds)
  } catch (error) {
    console.error('Error fetching funds:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/finance/funds - 기금 생성
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user?.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { name, type, description, financeProjectId } = body

    if (!name || !type) {
      return NextResponse.json({ error: 'Required fields missing' }, { status: 400 })
    }

    const fund = await prisma.fund.create({
      data: {
        name,
        type,
        description,
        financeProjectId,
        balance: 0,
      },
    })

    return NextResponse.json(fund, { status: 201 })
  } catch (error) {
    console.error('Error creating fund:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
