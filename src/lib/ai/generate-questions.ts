import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')

export interface GeneratedQuestion {
  question: string
  category: 'INTRO' | 'DEEP' | 'APPLICATION'
  reasoning: string
}

export async function generateDiscussionQuestions(
  bookTitle: string,
  bookAuthor: string | null,
  reviews: string[],
  count = 5
): Promise<GeneratedQuestion[]> {
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

  const reviewsText = reviews
    .map((r, i) => `[독후감 ${i + 1}]\n${r}`)
    .join('\n\n---\n\n')

  const prompt = `당신은 독서모임 진행자를 위한 토론 질문 생성 전문가입니다.

책 "${bookTitle}"${bookAuthor ? ` (저자: ${bookAuthor})` : ''}에 대해 참가자들이 작성한 독후감을 분석하고, 토론 질문 ${count}개를 생성해주세요.

[참가자 독후감]
${reviewsText}

[질문 생성 기준]
1. 도입 질문 (INTRO) 1개: 모든 참가자가 쉽게 답할 수 있는 가벼운 질문
2. 심화 질문 (DEEP) 2개: 책의 핵심 주제에 대한 깊이 있는 토론 유도
3. 적용 질문 (APPLICATION) 2개: 책의 내용을 일상이나 실천에 연결하는 질문

[중요]
- 독후감에서 참가자들의 공통 관심사와 의견 차이를 반영해주세요
- 열린 질문(open-ended)으로 만들어주세요
- 각 질문에 대해 왜 이 질문이 좋은지 간단히 설명해주세요

반드시 아래 JSON 형식으로만 응답하세요. JSON 외의 텍스트는 포함하지 마세요:
[
  {
    "question": "질문 내용",
    "category": "INTRO",
    "reasoning": "이 질문을 추천하는 이유"
  },
  ...
]`

  const result = await model.generateContent(prompt)
  const text = result.response.text()

  // JSON 파싱 — 코드블록 래핑 제거
  const jsonStr = text.replace(/```json\s*\n?/g, '').replace(/```\s*$/g, '').trim()
  const parsed: GeneratedQuestion[] = JSON.parse(jsonStr)

  return parsed.map(q => ({
    question: q.question,
    category: q.category,
    reasoning: q.reasoning,
  }))
}
