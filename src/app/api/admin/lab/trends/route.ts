import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const {
      title,
      source,
      category,
      authors,
      abstract,
      keywords,
      publishedDate,
      sourceUrl,
      isActive,
    } = body

    if (!title) {
      return NextResponse.json(
        { error: '제목은 필수입니다.' },
        { status: 400 }
      )
    }

    const trend = await prisma.researchTrend.create({
      data: {
        title,
        source: source || 'OTHER',
        category: category || null,
        authors: authors || null,
        abstract: abstract || null,
        keywords: keywords || null,
        publishedDate: publishedDate ? new Date(publishedDate) : null,
        sourceUrl: sourceUrl || null,
        isActive: isActive ?? true,
      },
    })

    return NextResponse.json(trend, { status: 201 })
  } catch (error) {
    console.error('Error creating trend:', error)
    return NextResponse.json(
      { error: '연구자료 등록에 실패했습니다.' },
      { status: 500 }
    )
  }
}
