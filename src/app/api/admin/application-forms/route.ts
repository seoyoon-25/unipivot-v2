import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

// GET - List all application forms
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ error: '권한이 없습니다' }, { status: 403 })
    }

    const forms = await prisma.applicationForm.findMany({
      orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
      include: {
        _count: {
          select: { programs: true },
        },
      },
    })

    return NextResponse.json(forms)
  } catch (error) {
    console.error('Get forms error:', error)
    return NextResponse.json(
      { error: '양식 조회 중 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}

// POST - Create new application form
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ error: '권한이 없습니다' }, { status: 403 })
    }

    const body = await request.json()
    const { name, description, fields } = body

    if (!name || !fields) {
      return NextResponse.json(
        { error: '이름과 필드는 필수입니다' },
        { status: 400 }
      )
    }

    const form = await prisma.applicationForm.create({
      data: {
        name,
        description,
        fields: typeof fields === 'string' ? fields : JSON.stringify(fields),
        isDefault: false,
      },
    })

    return NextResponse.json(form)
  } catch (error) {
    console.error('Create form error:', error)
    return NextResponse.json(
      { error: '양식 생성 중 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}
