import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/db'

// GET /api/finance/projects/[id] - 프로젝트 상세 조회
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || (session.user?.role !== 'ADMIN' && session.user?.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    const project = await prisma.financeProject.findUnique({
      where: { id },
      include: {
        budgetItems: {
          orderBy: { sortOrder: 'asc' }
        },
        documents: {
          orderBy: { uploadedAt: 'desc' }
        },
        funds: {
          include: {
            transactions: {
              where: { type: 'EXPENSE' },
              include: {
                financeAccount: {
                  select: { name: true }
                }
              },
              orderBy: { date: 'desc' }
            }
          }
        }
      }
    })

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    // Flatten transactions from all funds
    const transactions = project.funds.flatMap(fund => fund.transactions)

    return NextResponse.json({
      ...project,
      transactions
    })
  } catch (error) {
    console.error('Error fetching project:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PATCH /api/finance/projects/[id] - 프로젝트 수정
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || (session.user?.role !== 'ADMIN' && session.user?.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()

    const updateData: any = {}

    if (body.name !== undefined) updateData.name = body.name
    if (body.funder !== undefined) updateData.funder = body.funder
    if (body.contractNumber !== undefined) updateData.contractNumber = body.contractNumber
    if (body.totalBudget !== undefined) updateData.totalBudget = body.totalBudget
    if (body.startDate !== undefined) updateData.startDate = new Date(body.startDate)
    if (body.endDate !== undefined) updateData.endDate = new Date(body.endDate)
    if (body.status !== undefined) updateData.status = body.status
    if (body.description !== undefined) updateData.description = body.description

    const project = await prisma.financeProject.update({
      where: { id },
      data: updateData
    })

    return NextResponse.json(project)
  } catch (error) {
    console.error('Error updating project:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE /api/finance/projects/[id] - 프로젝트 삭제
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || (session.user?.role !== 'ADMIN' && session.user?.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    // Check if project has transactions
    const project = await prisma.financeProject.findUnique({
      where: { id },
      include: {
        funds: {
          include: {
            transactions: true
          }
        }
      }
    })

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    const hasTransactions = project.funds.some(fund => fund.transactions.length > 0)
    if (hasTransactions) {
      return NextResponse.json(
        { error: '거래 내역이 있는 프로젝트는 삭제할 수 없습니다.' },
        { status: 400 }
      )
    }

    // Delete related funds first
    await prisma.fund.deleteMany({
      where: { financeProjectId: id }
    })

    // Delete project (budget items and documents will be cascade deleted)
    await prisma.financeProject.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting project:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
