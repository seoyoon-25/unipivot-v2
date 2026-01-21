'use server'

import prisma from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// AI 공지 생성
export async function generateAnnouncement(
  sessionId: string,
  type: 'TWO_WEEKS' | 'ONE_WEEK' | 'ONE_DAY',
  style: { tone: string; emoji: string; length: string }
) {
  const session = await prisma.programSession.findUnique({
    where: { id: sessionId },
    include: {
      program: true,
      facilitators: {
        include: {
          user: { select: { name: true } }
        }
      },
      rsvps: {
        where: { status: { in: ['ATTENDING', 'PENDING'] } }
      }
    }
  })

  if (!session) {
    return { error: '세션을 찾을 수 없습니다.' }
  }

  const attendingCount = session.rsvps.filter(r => r.status === 'ATTENDING').length
  const pendingCount = session.rsvps.filter(r => r.status === 'PENDING').length

  const facilitatorName = session.facilitators[0]?.user.name || '미정'
  const isOnline = session.program.isOnline
  const sessionDate = new Date(session.date).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long'
  })

  const apiKey = process.env.ANTHROPIC_API_KEY || process.env.OPENAI_API_KEY

  if (!apiKey) {
    // API 키가 없으면 기본 템플릿 반환
    return {
      content: generateDefaultTemplate(session, type, attendingCount, pendingCount)
    }
  }

  const prompt = `카카오톡 단체방 공지 메시지를 작성해주세요:

[모임 정보]
- 프로그램: ${session.program.title}
- 회차: ${session.sessionNo}회차
- 날짜: ${sessionDate}
- 시간: ${session.startTime || '미정'} - ${session.endTime || '미정'}
- 장소: ${isOnline ? '온라인 (Zoom)' : session.location || '미정'}
- 책: ${session.bookTitle || '미정'}
- 읽을 범위: ${session.bookRange || '미정'}
- 진행자: ${facilitatorName}

[RSVP 현황]
- 참석: ${attendingCount}명
- 미응답: ${pendingCount}명

[공지 유형]
${type === 'TWO_WEEKS' ? '2주 전 안내' : type === 'ONE_WEEK' ? '1주 전 안내' : '전날 리마인더'}

[스타일]
- 톤: ${style.tone}
- 이모지 사용: ${style.emoji}
- 길이: ${style.length}

요구사항:
1. 카카오톡에 어울리는 자연스러운 문체
2. 중요 정보 빠짐없이 포함
3. 이모지 적절히 사용
4. 참석 응답 독려
5. 따뜻한 인사말`

  try {
    let content = ''

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
          max_tokens: 1000,
          messages: [{ role: 'user', content: prompt }]
        })
      })

      const data = await response.json()
      content = data.content?.[0]?.text || ''
    } else if (process.env.OPENAI_API_KEY) {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: 'gpt-4o',
          messages: [{ role: 'user', content: prompt }]
        })
      })

      const data = await response.json()
      content = data.choices?.[0]?.message?.content || ''
    }

    return { content }
  } catch (error) {
    console.error('공지 생성 오류:', error)
    return { error: '공지 생성 중 오류가 발생했습니다.' }
  }
}

// 기본 템플릿 생성
function generateDefaultTemplate(
  session: any,
  type: string,
  attendingCount: number,
  pendingCount: number
) {
  const sessionDate = new Date(session.date).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long'
  })

  const header = type === 'TWO_WEEKS'
    ? '📚 [2주 전 안내]'
    : type === 'ONE_WEEK'
    ? '📖 [1주 전 안내]'
    : '⏰ [내일 모임 알림]'

  return `${header}

안녕하세요! ${session.program.title} ${session.sessionNo}회차 모임 안내드립니다.

📅 일시: ${sessionDate}
⏰ 시간: ${session.startTime || '미정'} - ${session.endTime || '미정'}
📍 장소: ${session.program.isOnline ? '온라인 (Zoom)' : session.location || '미정'}

📚 이번 책: ${session.bookTitle || '미정'}
📖 읽을 범위: ${session.bookRange || '미정'}

현재 참석 ${attendingCount}명 / 미응답 ${pendingCount}명

아직 응답하지 않으신 분들은 참석 여부를 알려주세요! 🙏

감사합니다! 🤗`
}

// 공지 저장
export async function saveAnnouncement(
  sessionId: string,
  type: 'TWO_WEEKS' | 'ONE_WEEK' | 'ONE_DAY',
  content: string,
  isAIGenerated: boolean = false,
  aiStyle?: { tone: string; emoji: string; length: string }
) {
  return await prisma.sessionAnnouncement.create({
    data: {
      sessionId,
      type,
      content,
      isAIGenerated,
      aiStyle: aiStyle ? JSON.stringify(aiStyle) : null
    }
  })
}

// 공지 발송 표시
export async function markAnnouncementAsSent(announcementId: string) {
  const userSession = await getServerSession(authOptions)

  return await prisma.sessionAnnouncement.update({
    where: { id: announcementId },
    data: {
      isSent: true,
      sentAt: new Date(),
      sentBy: userSession?.user?.id
    }
  })
}

// 세션의 공지 목록 조회
export async function getSessionAnnouncements(sessionId: string) {
  return await prisma.sessionAnnouncement.findMany({
    where: { sessionId },
    orderBy: { createdAt: 'desc' }
  })
}

// 공지 템플릿 저장
export async function saveAnnouncementTemplate(
  name: string,
  content: string,
  style?: { tone: string; emoji: string; length: string },
  isPublic: boolean = false
) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return { error: '로그인이 필요합니다.' }
  }

  return await prisma.announcementTemplate.create({
    data: {
      userId: session.user.id,
      name,
      content,
      style: style ? JSON.stringify(style) : null,
      isPublic
    }
  })
}

// 내 템플릿 목록 조회
export async function getMyAnnouncementTemplates() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return []
  }

  return await prisma.announcementTemplate.findMany({
    where: {
      OR: [
        { userId: session.user.id },
        { isPublic: true }
      ]
    },
    orderBy: { useCount: 'desc' }
  })
}

// 템플릿 사용 횟수 증가
export async function incrementTemplateUseCount(templateId: string) {
  return await prisma.announcementTemplate.update({
    where: { id: templateId },
    data: {
      useCount: { increment: 1 }
    }
  })
}

// 알림 설정 조회
export async function getNotificationSettings() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return null
  }

  return await prisma.notificationSettings.findUnique({
    where: { userId: session.user.id }
  })
}

// 알림 설정 저장
export async function saveNotificationSettings(settings: {
  oneWeekEnabled?: boolean
  facilitatorEnabled?: boolean
  rsvpEnabled?: boolean
  reportEnabled?: boolean
  quietHoursStart?: number
  quietHoursEnd?: number
}) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return { error: '로그인이 필요합니다.' }
  }

  return await prisma.notificationSettings.upsert({
    where: { userId: session.user.id },
    create: {
      userId: session.user.id,
      ...settings
    },
    update: settings
  })
}
