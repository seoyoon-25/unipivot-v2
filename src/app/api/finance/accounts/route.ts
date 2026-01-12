import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/db'

// GET /api/finance/accounts - 계정과목 목록 조회
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || (session.user?.role !== 'ADMIN' && session.user?.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') // INCOME, EXPENSE, ASSET, LIABILITY
    const category = searchParams.get('category')
    const isActive = searchParams.get('isActive')

    const where: Record<string, unknown> = {}
    if (type) where.type = type
    if (category) where.category = category
    if (isActive !== null) where.isActive = isActive === 'true'

    const accounts = await prisma.financeAccount.findMany({
      where,
      orderBy: { sortOrder: 'asc' },
    })

    return NextResponse.json(accounts)
  } catch (error) {
    console.error('Error fetching accounts:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/finance/accounts - 계정과목 생성
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user?.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { code, name, type, category, subcategory, description, sortOrder } = body

    if (!code || !name || !type || !category) {
      return NextResponse.json({ error: 'Required fields missing' }, { status: 400 })
    }

    const account = await prisma.financeAccount.create({
      data: {
        code,
        name,
        type,
        category,
        subcategory,
        description,
        sortOrder: sortOrder || 0,
      },
    })

    return NextResponse.json(account, { status: 201 })
  } catch (error) {
    console.error('Error creating account:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
