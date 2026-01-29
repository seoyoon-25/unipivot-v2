'use server'

import prisma from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { generateDiscussionQuestions as geminiGenerateQuestions } from '@/lib/ai/generate-questions'

// 독후감 내용을 텍스트로 정리하는 헬퍼
function formatReportsText(reports: { author: { name: string }; content: string; structuredReport: { sections: string } | null }[]) {
  return reports.map(r => {
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
}

// 토론 질문 생성 및 저장 (Gemini 1.5 Flash 사용)
export async function generateDiscussionQuestions(sessionId: string) {
  // 세션 정보 조회
  const sessionData = await prisma.programSession.findUnique({
    where: { id: sessionId },
    include: {
      program: { select: { title: true } },
      bookReports: {
        include: {
          author: { select: { name: true } },
          structuredReport: true,
        },
      },
    },
  })

  if (!sessionData) {
    return { error: '세션을 찾을 수 없습니다.' }
  }

  if (sessionData.bookReports.length === 0) {
    return { error: '아직 제출된 독후감이 없습니다.' }
  }

  const bookTitle = sessionData.bookTitle || sessionData.program.title
  const bookAuthor = sessionData.bookAuthor || null
  const reviewTexts = formatReportsText(sessionData.bookReports)

  try {
    // 1차: Gemini 1.5 Flash (비용 효율적)
    if (process.env.GEMINI_API_KEY) {
      try {
        const questions = await geminiGenerateQuestions(bookTitle, bookAuthor, reviewTexts, 5)

        // DB 저장 (기존 질문 삭제 후 새로 생성)
        await prisma.aIGeneratedQuestion.deleteMany({ where: { sessionId } })
        await prisma.aIGeneratedQuestion.createMany({
          data: questions.map(q => ({
            sessionId,
            question: q.question,
            category: q.category,
            reasoning: q.reasoning,
          })),
        })

        return { questions, saved: questions.length }
      } catch (geminiError) {
        console.error('Gemini API 오류, fallback 시도:', geminiError)
      }
    }

    // 2차 fallback: Anthropic
    if (process.env.ANTHROPIC_API_KEY) {
      return await generateQuestionsWithAnthropic(sessionId, bookTitle, reviewTexts)
    }

    // 3차 fallback: OpenAI
    if (process.env.OPENAI_API_KEY) {
      return await generateQuestionsWithOpenAI(sessionId, bookTitle, reviewTexts)
    }

    return { error: 'AI API가 설정되지 않았습니다. GEMINI_API_KEY 환경변수를 설정해주세요.' }
  } catch (error) {
    console.error('AI 질문 생성 오류:', error)
    return { error: 'AI 질문 생성 중 오류가 발생했습니다.' }
  }
}

// Anthropic fallback
async function generateQuestionsWithAnthropic(sessionId: string, bookTitle: string, reviewTexts: string[]) {
  const reportsText = reviewTexts.join('\n\n---\n\n')
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.ANTHROPIC_API_KEY!,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2000,
      messages: [{
        role: 'user',
        content: `다음은 "${bookTitle}" 독서모임 참가자들의 독후감입니다. 토론 질문 5개를 생성해주세요:\n\n${reportsText}\n\n도입 질문 1개, 심화 질문 2개, 적용 질문 2개를 만들어주세요.\n각 질문마다 추천 이유를 설명해주세요.`,
      }],
    }),
  })

  const data = await response.json()
  const analysis = data.content?.[0]?.text || ''
  const questions = parseQuestionsFromAnalysis(analysis)

  await prisma.aIGeneratedQuestion.deleteMany({ where: { sessionId } })
  if (questions.length > 0) {
    await prisma.aIGeneratedQuestion.createMany({
      data: questions.map(q => ({ sessionId, question: q.question, category: q.category, reasoning: q.reasoning })),
    })
  }

  return { questions, saved: questions.length }
}

// OpenAI fallback
async function generateQuestionsWithOpenAI(sessionId: string, bookTitle: string, reviewTexts: string[]) {
  const reportsText = reviewTexts.join('\n\n---\n\n')
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o',
      messages: [{
        role: 'user',
        content: `다음은 "${bookTitle}" 독서모임 참가자들의 독후감입니다. 토론 질문 5개를 생성해주세요:\n\n${reportsText}\n\n도입 질문 1개, 심화 질문 2개, 적용 질문 2개를 만들어주세요.`,
      }],
    }),
  })

  const data = await response.json()
  const analysis = data.choices?.[0]?.message?.content || ''
  const questions = parseQuestionsFromAnalysis(analysis)

  await prisma.aIGeneratedQuestion.deleteMany({ where: { sessionId } })
  if (questions.length > 0) {
    await prisma.aIGeneratedQuestion.createMany({
      data: questions.map(q => ({ sessionId, question: q.question, category: q.category, reasoning: q.reasoning })),
    })
  }

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

  // AI API 호출 (Gemini → Anthropic → OpenAI 순서)
  try {
    let aiReply = ''

    // 1차: Gemini 1.5 Flash (비용 효율적)
    if (process.env.GEMINI_API_KEY) {
      try {
        const { GoogleGenerativeAI } = await import('@google/generative-ai')
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

        const chatHistory = messages.slice(0, -1).map((m: { role: string; content: string }) => ({
          role: m.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: m.content }],
        }))

        const chat = model.startChat({
          history: chatHistory,
          generationConfig: { maxOutputTokens: 1500 },
        })

        const result = await chat.sendMessage(`${context}\n\n${userMessage}`)
        aiReply = result.response.text()
      } catch (geminiError) {
        console.error('Gemini 챗봇 오류, fallback 시도:', geminiError)
      }
    }

    // 2차 fallback: Anthropic
    if (!aiReply && process.env.ANTHROPIC_API_KEY) {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': process.env.ANTHROPIC_API_KEY,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1500,
          system: context,
          messages: messages.map((m: { role: string; content: string }) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      })

      const data = await response.json()
      aiReply = data.content?.[0]?.text || ''
    }

    // 3차 fallback: OpenAI
    if (!aiReply && process.env.OPENAI_API_KEY) {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o',
          messages: [
            { role: 'system', content: context },
            ...messages,
          ],
        }),
      })

      const data = await response.json()
      aiReply = data.choices?.[0]?.message?.content || ''
    }

    if (!aiReply) {
      return {
        reply: 'AI API가 설정되지 않았습니다. GEMINI_API_KEY 환경변수를 설정해주세요.',
        messages,
      }
    }

    messages.push({
      role: 'assistant',
      content: aiReply,
    })

    // 대화 저장
    await prisma.aIConversation.upsert({
      where: {
        sessionId_userId: { sessionId, userId },
      },
      create: {
        sessionId,
        userId,
        messages: JSON.stringify(messages),
      },
      update: {
        messages: JSON.stringify(messages),
      },
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
