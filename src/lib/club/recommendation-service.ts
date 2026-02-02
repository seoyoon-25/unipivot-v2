import { GoogleGenerativeAI } from '@google/generative-ai'
import prisma from '@/lib/db'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')

interface RecommendationResult {
  analysis?: string
  recommendations?: {
    id: string
    bookTitle: string
    bookAuthor: string | null
    reason: string
    isSaved: boolean
    isRead: boolean
    createdAt: Date
  }[]
  error?: string
}

/**
 * AI 기반 맞춤 책 추천 생성
 * BookReport.authorId = Member.id이므로 member 조회 필요
 */
export async function generateRecommendations(userId: string): Promise<RecommendationResult> {
  // Member 조회 (BookReport.authorId = Member.id)
  const member = await prisma.member.findFirst({
    where: { userId },
    select: { id: true },
  })

  // 사용자 독서 데이터 수집
  const [reports, favorites, highRated] = await Promise.all([
    member
      ? prisma.bookReport.findMany({
          where: { authorId: member.id },
          select: { bookTitle: true, bookAuthor: true, rating: true },
          orderBy: { createdAt: 'desc' },
          take: 20,
        })
      : Promise.resolve([]),
    prisma.favoriteBook.findMany({
      where: { userId },
      include: { readBook: { select: { title: true, author: true, category: true } } },
      take: 10,
    }),
    member
      ? prisma.bookReport.findMany({
          where: { authorId: member.id, rating: { gte: 4 } },
          select: { bookTitle: true, bookAuthor: true },
          take: 10,
        })
      : Promise.resolve([]),
  ])

  if (reports.length === 0 && favorites.length === 0) {
    return { error: '독서 기록이 부족합니다. 독후감을 작성하거나 좋아하는 책을 등록해주세요.' }
  }

  // AI 프롬프트 구성
  const readBooks = reports
    .map((r) => `${r.bookTitle} (${r.bookAuthor || '작자 미상'}${r.rating ? `, ${r.rating}점` : ''})`)
    .join(', ')
  const highRatedBooks = highRated.map((r) => r.bookTitle).join(', ')
  const favoriteCategories = Array.from(
    new Set(favorites.map((f) => f.readBook?.category).filter((c): c is string => !!c))
  ).join(', ')

  const prompt = `사용자의 독서 취향을 분석하고 맞춤 책을 추천해주세요.

읽은 책: ${readBooks || '없음'}
높은 평점을 준 책: ${highRatedBooks || '없음'}
선호 장르: ${favoriteCategories || '미확인'}

다음 JSON 형식으로 5권의 책을 추천해주세요:
{
  "analysis": "사용자 독서 취향 분석 (2-3문장, 한국어)",
  "recommendations": [
    {
      "title": "책 제목",
      "author": "저자",
      "reason": "이 책을 추천하는 구체적인 이유 (사용자가 읽은 책과 연관지어, 2-3문장)"
    }
  ]
}

주의:
- 사용자가 이미 읽은 책은 제외
- 한국에서 구할 수 있는 책 위주로 추천
- 추천 이유는 사용자가 읽은 특정 책을 언급하며 구체적으로 작성
- 반드시 위 JSON 형식으로만 응답`

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })
    const result = await model.generateContent(prompt)
    const response = result.response.text()

    // JSON 파싱 (코드 블록 제거 포함)
    const cleaned = response.replace(/```json\s*\n?/g, '').replace(/```\s*$/g, '').trim()
    const jsonMatch = cleaned.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      return { error: 'AI 응답을 파싱할 수 없습니다.' }
    }

    const data = JSON.parse(jsonMatch[0]) as {
      analysis: string
      recommendations: { title: string; author?: string; reason: string }[]
    }

    if (!data.recommendations || !Array.isArray(data.recommendations)) {
      return { error: 'AI가 유효한 추천을 생성하지 못했습니다.' }
    }

    // 추천 DB 저장 (최대 5개)
    const recommendations = await Promise.all(
      data.recommendations.slice(0, 5).map((rec) =>
        prisma.bookRecommendation.create({
          data: {
            userId,
            bookTitle: rec.title,
            bookAuthor: rec.author || null,
            reason: rec.reason,
          },
        })
      )
    )

    return {
      analysis: data.analysis,
      recommendations,
    }
  } catch (error) {
    console.error('Recommendation generation error:', error)
    return { error: '추천 생성에 실패했습니다. 잠시 후 다시 시도해주세요.' }
  }
}

/**
 * 저장된 추천 목록
 */
export async function getSavedRecommendations(userId: string) {
  return prisma.bookRecommendation.findMany({
    where: { userId, isSaved: true },
    orderBy: { createdAt: 'desc' },
  })
}

/**
 * 최근 추천 목록
 */
export async function getRecentRecommendations(userId: string, limit = 10) {
  return prisma.bookRecommendation.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: limit,
  })
}
