import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/db'

// GET /api/donations - 기부금 목록 조회
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || (session.user?.role !== 'ADMIN' && session.user?.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const type = searchParams.get('type')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    const where: Record<string, unknown> = {}
    if (type) where.type = type
    if (startDate || endDate) {
      where.date = {}
      if (startDate) (where.date as Record<string, Date>).gte = new Date(startDate)
      if (endDate) (where.date as Record<string, Date>).lte = new Date(endDate)
    }

    const [donations, total, summary] = await Promise.all([
      prisma.financeDonation.findMany({
        where,
        include: { donor: true },
        orderBy: { date: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.financeDonation.count({ where }),
      prisma.financeDonation.aggregate({
        _sum: { amount: true },
        _count: true,
      }),
    ])

    return NextResponse.json({
      donations,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
      summary: { totalAmount: summary._sum.amount || 0, totalCount: summary._count },
    })
  } catch (error) {
    console.error('Error fetching donations:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/donations - 기부금 등록
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || (session.user?.role !== 'ADMIN' && session.user?.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { donorId, donorName, donorType, amount, date, type, designation, note } = body

    if (!donorName || !amount || !date) {
      return NextResponse.json({ error: 'Required fields missing' }, { status: 400 })
    }

    // 기부자 업데이트 또는 생성
    let donor = donorId ? await prisma.donor.findUnique({ where: { id: donorId } }) : null

    if (!donor && donorName) {
      donor = await prisma.donor.create({
        data: {
          name: donorName,
          type: donorType || 'INDIVIDUAL',
        },
      })
    }

    const donation = await prisma.financeDonation.create({
      data: {
        donorId: donor?.id,
        donorName,
        donorType: donorType || 'INDIVIDUAL',
        amount: parseInt(amount),
        date: new Date(date),
        type: type || 'ONETIME',
        designation,
        note,
      },
      include: { donor: true },
    })

    // 기부자 통계 업데이트
    if (donor) {
      await prisma.donor.update({
        where: { id: donor.id },
        data: {
          totalDonation: { increment: parseInt(amount) },
          donationCount: { increment: 1 },
          lastDonationAt: new Date(date),
        },
      })
    }

    return NextResponse.json(donation, { status: 201 })
  } catch (error) {
    console.error('Error creating donation:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
