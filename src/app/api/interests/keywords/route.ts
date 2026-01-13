import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

// GET - 키워드 목록 조회
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') // 'fixed', 'recommended', 'popular', 'all'
    const search = searchParams.get('search')
    const limit = parseInt(searchParams.get('limit') || '20')
    const forWordcloud = searchParams.get('wordcloud') === 'true'

    const where: any = {
      isHidden: false,
    }

    if (type === 'fixed') {
      where.isFixed = true
    } else if (type === 'recommended') {
      where.isRecommended = true
    } else if (type === 'popular') {
      where.monthlyCount = { gt: 0 }
    }

    if (search) {
      where.keyword = { contains: search, mode: 'insensitive' }
    }

    let orderBy: any = { monthlyCount: 'desc' }
    if (type === 'fixed' || type === 'recommended') {
      orderBy = [{ monthlyCount: 'desc' }, { keyword: 'asc' }]
    }

    const keywords = await prisma.interestKeyword.findMany({
      where,
      orderBy,
      take: limit,
      select: {
        id: true,
        keyword: true,
        category: true,
        totalCount: true,
        monthlyCount: true,
        likeCount: true,
        isFixed: true,
        isRecommended: true,
        relatedProgramIds: true,
        lastUsedAt: true,
      }
    })

    // 워드클라우드용 데이터
    if (forWordcloud) {
      const minCount = await prisma.interestSetting.findUnique({
        where: { key: 'wordcloudMinCount' }
      })
      const minValue = parseInt(minCount?.value || '1')

      const wordcloudData = keywords
        .filter(k => k.monthlyCount >= minValue)
        .map(k => ({
          text: k.keyword,
          value: k.monthlyCount,
          category: k.category,
        }))

      return NextResponse.json({ keywords: wordcloudData, type: 'wordcloud' })
    }

    return NextResponse.json({ keywords })
  } catch (error) {
    console.error('Get keywords error:', error)
    return NextResponse.json(
      { error: '조회 중 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}
