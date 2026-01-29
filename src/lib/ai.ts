import { GoogleGenerativeAI } from '@google/generative-ai'
import { prisma } from './db'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')

const systemPrompt = `당신은 유니피벗(UniPivot)의 AI 챗봇 "피봇이"입니다.

유니피벗은 남북청년 교류 커뮤니티로, 다음과 같은 프로그램을 운영합니다:
1. 남Book북한걸음 (독서모임): 격주 1회, 총 8회 진행. 남북 관련 책을 읽고 토론합니다.
2. 정기 세미나: 월 1회, 한반도 평화와 통일 관련 전문가 강연
3. K-Move: 분기 1회, DMZ 등 한반도 역사 현장 탐방

당신의 역할:
- 유니피벗 프로그램에 대해 안내합니다
- 한반도 이슈, 통일, 남북관계에 대한 질문에 답합니다
- 친근하고 따뜻한 말투로 대화합니다
- 정치적으로 편향되지 않은 균형잡힌 정보를 제공합니다

답변 가이드:
- 간결하고 명확하게 답변합니다 (200자 내외)
- 필요시 유니피벗 프로그램을 안내합니다
- 모르는 내용은 솔직히 모른다고 답합니다
- 민감한 정치적 질문에는 중립적으로 답변합니다`

export async function generateChatResponse(
  message: string,
  sessionId: string,
  userId?: string
): Promise<string> {
  try {
    // 지식 베이스에서 관련 정보 검색
    const keywords = message.split(' ').filter(word => word.length > 1)
    const knowledgeBase = await prisma.knowledgeBase.findMany({
      where: {
        isActive: true,
        OR: keywords.map(keyword => ({
          OR: [
            { question: { contains: keyword, mode: 'insensitive' as const } },
            { answer: { contains: keyword, mode: 'insensitive' as const } },
            { keywords: { contains: keyword, mode: 'insensitive' as const } },
          ]
        }))
      },
      orderBy: { priority: 'desc' },
      take: 3,
    })

    let context = ''
    if (knowledgeBase.length > 0) {
      context = '\n\n관련 정보:\n' + knowledgeBase.map(kb =>
        `Q: ${kb.question}\nA: ${kb.answer}`
      ).join('\n\n')
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-pro' })

    const result = await model.generateContent([
      { text: systemPrompt + context },
      { text: `사용자: ${message}` }
    ])

    const response = result.response.text()

    // 대화 로그 저장
    await prisma.chatLog.createMany({
      data: [
        {
          sessionId,
          userId,
          role: 'USER',
          content: message,
        },
        {
          sessionId,
          userId,
          role: 'ASSISTANT',
          content: response,
        },
      ],
    })

    return response
  } catch (error) {
    console.error('AI chat error:', error)
    return '죄송합니다. 일시적인 오류가 발생했습니다. 잠시 후 다시 시도해주세요.'
  }
}

export async function getKnowledgeBase(category?: string) {
  return prisma.knowledgeBase.findMany({
    where: {
      isActive: true,
      ...(category && { category }),
    },
    orderBy: { priority: 'desc' },
  })
}

export async function createKnowledge(data: {
  category: string
  question: string
  answer: string
  keywords?: string
  priority?: number
}) {
  return prisma.knowledgeBase.create({
    data: {
      ...data,
      priority: data.priority || 0,
    },
  })
}
