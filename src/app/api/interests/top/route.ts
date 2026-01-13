import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

// GET - 인기 키워드 TOP N
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period') || 'monthly' // 'monthly', 'weekly', 'all'
    const limit = parseInt(searchParams.get('limit') || '5')

    // 설정에서 표시 개수 가져오기
    const rankingSetting = await prisma.interestSetting.findUnique({
      where: { key: 'topRankingCount' }
    })
    const count = rankingSetting ? parseInt(rankingSetting.value) : limit

    let orderBy: any
    if (period === 'monthly') {
      orderBy = { monthlyCount: 'desc' }
    } else if (period === 'weekly') {
      // 주간은 최근 7일 기준으로 계산 (별도 필드 없으면 monthly 사용)
      orderBy = { monthlyCount: 'desc' }
    } else {
      orderBy = { totalCount: 'desc' }
    }

    const keywords = await prisma.interestKeyword.findMany({
      where: {
        isHidden: false,
        OR: [
          { monthlyCount: { gt: 0 } },
          { totalCount: { gt: 0 } }
        ]
      },
      orderBy,
      take: count,
      select: {
        id: true,
        keyword: true,
        category: true,
        totalCount: true,
        monthlyCount: true,
        likeCount: true,
        isFixed: true,
        isRecommended: true,
      }
    })

    // 순위 정보 추가
    const rankedKeywords = keywords.map((kw, index) => ({
      ...kw,
      rank: index + 1,
      count: period === 'monthly' ? kw.monthlyCount : kw.totalCount,
    }))

    // 이전 달과 비교 (트렌드 계산)
    // 간단하게 isFixed/isRecommended로 트렌드 표시
    const withTrend = rankedKeywords.map(kw => ({
      ...kw,
      trend: kw.isRecommended ? 'up' : kw.isFixed ? 'stable' : 'new',
    }))

    return NextResponse.json({
      period,
      keywords: withTrend,
      total: keywords.length,
    })
  } catch (error) {
    console.error('Get top keywords error:', error)
    return NextResponse.json(
      { error: '조회 중 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}
