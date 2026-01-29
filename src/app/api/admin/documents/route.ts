import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const type = searchParams.get('type') || undefined
    const projectId = searchParams.get('projectId') || undefined
    const search = searchParams.get('search') || undefined

    const where: any = {}

    if (type) {
      where.type = type
    }

    if (projectId) {
      where.projectId = projectId
    }

    if (search) {
      where.title = { contains: search, mode: 'insensitive' as const }
    }

    const [documents, total] = await Promise.all([
      prisma.document.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          project: {
            select: { id: true, title: true },
          },
        },
      }),
      prisma.document.count({ where }),
    ])

    return NextResponse.json({
      documents,
      total,
      pages: Math.ceil(total / limit),
    })
  } catch (error) {
    console.error('Error fetching documents:', error)
    return NextResponse.json(
      { error: 'Failed to fetch documents' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const document = await prisma.document.create({
      data: {
        title: body.title,
        type: body.type,
        filePath: body.filePath,
        fileSize: body.fileSize,
        projectId: body.projectId,
      },
    })

    return NextResponse.json(document)
  } catch (error) {
    console.error('Error creating document:', error)
    return NextResponse.json(
      { error: 'Failed to create document' },
      { status: 500 }
    )
  }
}
