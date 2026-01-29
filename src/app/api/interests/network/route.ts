import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

interface NetworkNode {
  id: string
  keyword: string
  totalCount: number
  monthlyCount: number
  likeCount: number
  category: string | null
  isFixed: boolean
  isRecommended: boolean
}

interface NetworkLink {
  source: string
  target: string
  strength: number
}

interface NetworkData {
  nodes: NetworkNode[]
  links: NetworkLink[]
}

// GET - 네트워크 그래프 데이터 조회
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const minCount = parseInt(searchParams.get('minCount') || '1')
    const minStrength = parseInt(searchParams.get('minStrength') || '1')
    const limit = parseInt(searchParams.get('limit') || '100')

    // 1. 키워드 조회 (숨겨지지 않은 것만)
    const keywords = await prisma.interestKeyword.findMany({
      where: {
        isHidden: false,
        totalCount: { gte: minCount }
      },
      orderBy: { totalCount: 'desc' },
      take: limit,
      select: {
        id: true,
        keyword: true,
        totalCount: true,
        monthlyCount: true,
        likeCount: true,
        category: true,
        isFixed: true,
        isRecommended: true,
      }
    })

    // 키워드 ID 목록
    const keywordIds = keywords.map(k => k.id)

    // 2. 연결 조회
    const connections = await prisma.keywordConnection.findMany({
      where: {
        AND: [
          { fromKeywordId: { in: keywordIds } },
          { toKeywordId: { in: keywordIds } },
          { strength: { gte: minStrength } }
        ]
      },
      select: {
        fromKeywordId: true,
        toKeywordId: true,
        strength: true,
      }
    })

    // 3. 노드 데이터 생성
    const nodes: NetworkNode[] = keywords.map(k => ({
      id: k.id,
      keyword: k.keyword,
      totalCount: k.totalCount,
      monthlyCount: k.monthlyCount,
      likeCount: k.likeCount,
      category: k.category,
      isFixed: k.isFixed,
      isRecommended: k.isRecommended,
    }))

    // 4. 링크 데이터 생성
    const links: NetworkLink[] = connections.map(c => ({
      source: c.fromKeywordId,
      target: c.toKeywordId,
      strength: c.strength,
    }))

    // 5. 통계 정보
    const stats = {
      totalNodes: nodes.length,
      totalLinks: links.length,
      avgStrength: links.length > 0
        ? Math.round(links.reduce((sum, l) => sum + l.strength, 0) / links.length * 100) / 100
        : 0,
      maxStrength: links.length > 0
        ? Math.max(...links.map(l => l.strength))
        : 0,
    }

    const data: NetworkData = { nodes, links }

    return NextResponse.json({
      ...data,
      stats
    })
  } catch (error) {
    console.error('Network data error:', error)
    return NextResponse.json(
      { error: '네트워크 데이터 조회 중 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}
