'use server'

import prisma from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// AI 독후감 분석
export async function analyzeBookReports(sessionId: string) {
  // 독후감들 조회
  const reports = await prisma.bookReport.findMany({
    where: { sessionId },
    include: {
      author: {
        select: { name: true }
      },
      structuredReport: true
    }
  })

  if (reports.length === 0) {
    return { error: '아직 제출된 독후감이 없습니다.' }
  }

  // 독후감 내용 정리
  const reportsText = reports
    .map(r => {
      if (r.structuredReport) {
        try {
          const sections = JSON.parse(r.structuredReport.sections)
          return `[${r.author.name}의 독후감]\n${Object.entries(sections)
            .map(([key, value]) => `${key}: ${value}`)
            .join('\n')}`
        } catch {
          return `[${r.author.name}의 독후감]\n${r.content}`
        }
      }
      return `[${r.author.name}의 독후감]\n${r.content}`
    })
    .join('\n\n---\n\n')

  // AI API 호출 (Anthropic 또는 OpenAI)
  const apiKey = process.env.ANTHROPIC_API_KEY || process.env.OPENAI_API_KEY

  if (!apiKey) {
    // API 키가 없으면 간단한 분석 결과 반환
    return {
      analysis: `총 ${reports.length}개의 독후감이 제출되었습니다.\n\n참가자: ${reports.map(r => r.author.name).join(', ')}\n\n(AI 분석을 위해서는 ANTHROPIC_API_KEY 또는 OPENAI_API_KEY 환경변수를 설정해주세요.)`
    }
  }

  try {
    if (process.env.ANTHROPIC_API_KEY) {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': process.env.ANTHROPIC_API_KEY,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 2000,
          messages: [
            {
              role: 'user',
              content: `다음은 독서모임 참가자들의 독후감입니다. 분석해주세요:

${reportsText}

다음 형식으로 분석해주세요:

1. 공통 관심사 (3-5개)
   - 여러 사람이 언급한 주제나 개념

2. 의견이 갈리는 지점 (2-3개)
   - 참가자들 간 시각 차이가 있는 부분

3. 독특한 관점 (2-3개)
   - 한 사람만 제시한 흥미로운 관점

4. 토론 질문 추천 (5개)
   - 도입 질문 (1개): 가볍게 시작
   - 심화 질문 (2개): 깊이 있는 토론
   - 적용 질문 (2개): 실천/일상 연결

각 질문마다 "왜 이 질문이 좋은지" 간단히 설명해주세요.`
            }
          ]
        })
      })

      const data = await response.json()
      return { analysis: data.content[0].text }
    }

    // OpenAI fallback
    if (process.env.OPENAI_API_KEY) {
      const response = await fetch(
        'https://api.openai.com/v1/chat/completions',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${process.env.OPENAI_API_KEY}`
          },
          body: JSON.stringify({
            model: 'gpt-4o',
            messages: [
              {
                role: 'user',
                content: `다음은 독서모임 참가자들의 독후감입니다. 분석해주세요:

${reportsText}

다음 형식으로 분석해주세요:

1. 공통 관심사 (3-5개)
2. 의견이 갈리는 지점 (2-3개)
3. 독특한 관점 (2-3개)
4. 토론 질문 추천 (5개)`
              }
            ]
          })
        }
      )

      const data = await response.json()
      return { analysis: data.choices[0].message.content }
    }
  } catch (error) {
    console.error('AI 분석 오류:', error)
    return { error: 'AI 분석 중 오류가 발생했습니다.' }
  }

  return { error: 'AI API가 설정되지 않았습니다.' }
}

// 토론 질문 생성 및 저장
export async function generateDiscussionQuestions(sessionId: string) {
  const analysis = await analyzeBookReports(sessionId)

  if (analysis.error) return analysis

  // 질문 파싱
  const questions = parseQuestionsFromAnalysis(analysis.analysis || '')

  if (questions.length === 0) {
    return { questions: [], saved: 0 }
  }

  // DB 저장 (기존 질문 삭제 후 새로 생성)
  await prisma.aIGeneratedQuestion.deleteMany({
    where: { sessionId }
  })

  await prisma.aIGeneratedQuestion.createMany({
    data: questions.map(q => ({
      sessionId,
      question: q.question,
      category: q.category,
      reasoning: q.reasoning
    }))
  })

  return { questions, saved: questions.length }
}

// AI 챗봇 대화
export async function chatWithAI(
  sessionId: string,
  userMessage: string,
  conversationHistory?: { role: string; content: string }[]
) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return { error: '로그인이 필요합니다.' }
  }

  const userId = session.user.id

  // 세션 정보 조회
  const programSession = await prisma.programSession.findUnique({
    where: { id: sessionId },
    include: {
      program: true,
      bookReports: {
        include: { author: { select: { name: true } } }
      }
    }
  })

  if (!programSession) {
    return { error: '세션을 찾을 수 없습니다.' }
  }

  // 컨텍스트 구성
  const context = `당신은 독서모임 진행자를 돕는 AI 어시스턴트입니다.

[현재 모임 정보]
- 프로그램: ${programSession.program.title}
- 회차: ${programSession.sessionNo}회차
- 책: ${programSession.bookTitle || '미정'}
- 읽을 범위: ${programSession.bookRange || '미정'}
- 제출된 독후감: ${programSession.bookReports.length}개

[당신의 역할]
1. 독후감을 분석하여 토론 질문을 제안
2. 진행자의 질문에 답변
3. 모임 준비를 도움

친절하고 실용적으로 답변해주세요. 한국어로 답변하세요.`

  // 대화 기록 조회
  const existingConversation = await prisma.aIConversation.findUnique({
    where: {
      sessionId_userId: { sessionId, userId }
    }
  })

  const messages = conversationHistory ||
    (existingConversation ? JSON.parse(existingConversation.messages) : [])

  messages.push({
    role: 'user',
    content: userMessage
  })

  // AI API 호출
  const apiKey = process.env.ANTHROPIC_API_KEY || process.env.OPENAI_API_KEY

  if (!apiKey) {
    return {
      reply: 'AI API가 설정되지 않았습니다. ANTHROPIC_API_KEY 또는 OPENAI_API_KEY 환경변수를 설정해주세요.',
      messages
    }
  }

  try {
    let aiReply = ''

    if (process.env.ANTHROPIC_API_KEY) {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': process.env.ANTHROPIC_API_KEY,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1500,
          system: context,
          messages: messages.map((m: { role: string; content: string }) => ({
            role: m.role,
            content: m.content
          }))
        })
      })

      const data = await response.json()
      aiReply = data.content?.[0]?.text || '응답을 생성할 수 없습니다.'
    } else if (process.env.OPENAI_API_KEY) {
      const response = await fetch(
        'https://api.openai.com/v1/chat/completions',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${process.env.OPENAI_API_KEY}`
          },
          body: JSON.stringify({
            model: 'gpt-4o',
            messages: [
              { role: 'system', content: context },
              ...messages
            ]
          })
        }
      )

      const data = await response.json()
      aiReply = data.choices?.[0]?.message?.content || '응답을 생성할 수 없습니다.'
    }

    messages.push({
      role: 'assistant',
      content: aiReply
    })

    // 대화 저장
    await prisma.aIConversation.upsert({
      where: {
        sessionId_userId: { sessionId, userId }
      },
      create: {
        sessionId,
        userId,
        messages: JSON.stringify(messages)
      },
      update: {
        messages: JSON.stringify(messages)
      }
    })

    return { reply: aiReply, messages }
  } catch (error) {
    console.error('AI 챗봇 오류:', error)
    return { error: 'AI 응답 중 오류가 발생했습니다.' }
  }
}

// AI 생성 질문 조회
export async function getAIGeneratedQuestions(sessionId: string) {
  return await prisma.aIGeneratedQuestion.findMany({
    where: { sessionId },
    orderBy: { createdAt: 'desc' }
  })
}

// 질문 사용 표시
export async function markQuestionAsUsed(questionId: string) {
  return await prisma.aIGeneratedQuestion.update({
    where: { id: questionId },
    data: {
      isUsed: true,
      usedAt: new Date()
    }
  })
}

// 대화 기록 조회
export async function getAIConversation(sessionId: string) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return null
  }

  return await prisma.aIConversation.findUnique({
    where: {
      sessionId_userId: { sessionId, userId: session.user.id }
    }
  })
}

// 헬퍼 함수: 분석 결과에서 질문 파싱
function parseQuestionsFromAnalysis(analysis: string) {
  const questions: { question: string; category: string; reasoning: string }[] =
    []
  const lines = analysis.split('\n')

  let currentCategory = ''
  let currentQuestion = ''
  let currentReasoning = ''

  for (const line of lines) {
    if (line.includes('도입 질문')) currentCategory = 'INTRO'
    else if (line.includes('심화 질문')) currentCategory = 'DEEP'
    else if (line.includes('적용 질문')) currentCategory = 'APPLICATION'

    // 질문 추출 (다양한 패턴)
    const questionMatch = line.match(/^[-*•]\s*(.+\?)\s*$/)
    if (questionMatch && currentCategory) {
      if (currentQuestion) {
        questions.push({
          question: currentQuestion,
          category: currentCategory,
          reasoning: currentReasoning.trim()
        })
      }
      currentQuestion = questionMatch[1]
      currentReasoning = ''
    } else if (currentQuestion && !line.match(/^[-*•]/) && line.trim()) {
      currentReasoning += ' ' + line.trim()
    }
  }

  // 마지막 질문 추가
  if (currentQuestion) {
    questions.push({
      question: currentQuestion,
      category: currentCategory,
      reasoning: currentReasoning.trim()
    })
  }

  return questions
}
