import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/db'

// GET /api/finance/projects - 프로젝트 목록 조회
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || (session.user?.role !== 'ADMIN' && session.user?.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const projects = await prisma.financeProject.findMany({
      include: {
        budgetItems: true,
        funds: {
          include: {
            transactions: {
              where: { type: 'EXPENSE' },
              select: { amount: true }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    // Calculate executed amount for each project
    const projectsWithExecution = projects.map(project => {
      const executed = project.budgetItems.reduce((sum, item) => sum + item.executed, 0)
      return {
        id: project.id,
        name: project.name,
        funder: project.funder,
        contractNumber: project.contractNumber,
        totalBudget: project.totalBudget,
        startDate: project.startDate,
        endDate: project.endDate,
        status: project.status,
        executed
      }
    })

    return NextResponse.json({ projects: projectsWithExecution })
  } catch (error) {
    console.error('Error fetching projects:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/finance/projects - 새 프로젝트 생성
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || (session.user?.role !== 'ADMIN' && session.user?.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { name, funder, contractNumber, totalBudget, startDate, endDate, description, budgetItems } = body

    // Create project with budget items
    const project = await prisma.financeProject.create({
      data: {
        name,
        funder,
        contractNumber,
        totalBudget,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        description,
        status: 'PLANNING',
        budgetItems: {
          create: budgetItems?.map((item: any, index: number) => ({
            category: item.category,
            subcategory: item.subcategory || null,
            item: item.item,
            budget: item.budget,
            executed: 0,
            sortOrder: index
          })) || []
        }
      },
      include: {
        budgetItems: true
      }
    })

    // Create a fund for this project
    await prisma.fund.create({
      data: {
        name: `${name} 기금`,
        type: 'PROJECT',
        financeProjectId: project.id,
        balance: 0,
        isActive: true
      }
    })

    return NextResponse.json(project, { status: 201 })
  } catch (error) {
    console.error('Error creating project:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
