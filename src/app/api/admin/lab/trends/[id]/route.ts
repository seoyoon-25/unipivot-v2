import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

interface RouteContext {
  params: Promise<{ id: string }>
}

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params

    const trend = await prisma.researchTrend.findUnique({
      where: { id },
    })

    if (!trend) {
      return NextResponse.json(
        { error: '연구자료를 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    return NextResponse.json(trend)
  } catch (error) {
    console.error('Error fetching trend:', error)
    return NextResponse.json(
      { error: '연구자료를 불러오는데 실패했습니다.' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params
    const body = await request.json()

    const existing = await prisma.researchTrend.findUnique({
      where: { id },
    })

    if (!existing) {
      return NextResponse.json(
        { error: '연구자료를 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

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

    const trend = await prisma.researchTrend.update({
      where: { id },
      data: {
        ...(title !== undefined && { title }),
        ...(source !== undefined && { source }),
        ...(category !== undefined && { category: category || null }),
        ...(authors !== undefined && { authors: authors || null }),
        ...(abstract !== undefined && { abstract: abstract || null }),
        ...(keywords !== undefined && { keywords: keywords || null }),
        ...(publishedDate !== undefined && {
          publishedDate: publishedDate ? new Date(publishedDate) : null,
        }),
        ...(sourceUrl !== undefined && { sourceUrl: sourceUrl || null }),
        ...(isActive !== undefined && { isActive }),
      },
    })

    return NextResponse.json(trend)
  } catch (error) {
    console.error('Error updating trend:', error)
    return NextResponse.json(
      { error: '연구자료 수정에 실패했습니다.' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params

    const existing = await prisma.researchTrend.findUnique({
      where: { id },
    })

    if (!existing) {
      return NextResponse.json(
        { error: '연구자료를 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    await prisma.researchTrend.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting trend:', error)
    return NextResponse.json(
      { error: '연구자료 삭제에 실패했습니다.' },
      { status: 500 }
    )
  }
}
