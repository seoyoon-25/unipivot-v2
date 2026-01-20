import prisma from '@/lib/db'
import { createDefaultQuestion } from '@/types/survey'

/**
 * 자동 조사 생성 유틸리티
 */

const DEFAULT_SURVEY_QUESTIONS = [
  {
    id: 'q1',
    order: 1,
    type: 'emoji_5' as const,
    text: '이번 모임은 전반적으로 만족스러웠나요?',
    required: true,
  },
  {
    id: 'q2',
    order: 2,
    type: 'star_5' as const,
    text: '진행자의 진행은 어땠나요?',
    required: true,
  },
  {
    id: 'q3',
    order: 3,
    type: 'text_long' as const,
    text: '좋았던 점이나 개선할 점이 있다면 알려주세요',
    required: false,
  },
]

const PROGRAM_END_QUESTIONS = [
  {
    id: 'q1',
    order: 1,
    type: 'emoji_5' as const,
    text: '프로그램 전체에 대해 얼마나 만족하셨나요?',
    required: true,
  },
  {
    id: 'q2',
    order: 2,
    type: 'rating_10' as const,
    text: '이 프로그램을 주변에 추천하시겠습니까?',
    description: '0: 전혀 추천하지 않음 ~ 10: 적극 추천',
    required: true,
  },
  {
    id: 'q3',
    order: 3,
    type: 'star_5' as const,
    text: '진행자의 운영은 어땠나요?',
    required: true,
  },
  {
    id: 'q4',
    order: 4,
    type: 'single_choice' as const,
    text: '다음 시즌도 참여하시겠습니까?',
    options: ['예, 꼭 참여하고 싶습니다', '아마도 참여할 것 같습니다', '아직 모르겠습니다', '참여하지 않을 것 같습니다'],
    required: true,
  },
  {
    id: 'q5',
    order: 5,
    type: 'text_long' as const,
    text: '프로그램에 대한 전반적인 소감을 들려주세요',
    required: false,
  },
]

/**
 * 회차 종료 후 자동 조사 생성
 */
export async function autoCreateSessionSurvey(sessionId: string) {
  const session = await prisma.programSession.findUnique({
    where: { id: sessionId },
    include: {
      program: true,
      surveys: true,
    },
  })

  if (!session) {
    console.log(`Session ${sessionId} not found`)
    return null
  }

  // Check if survey already exists for this session
  if (session.surveys.length > 0) {
    console.log(`Survey already exists for session ${sessionId}`)
    return null
  }

  // Check if session has ended
  const sessionEndTime = session.endTime
    ? new Date(session.endTime)
    : new Date(new Date(session.date).getTime() + 2 * 60 * 60 * 1000) // Default 2 hours

  if (new Date() < sessionEndTime) {
    console.log(`Session ${sessionId} has not ended yet`)
    return null
  }

  // Create survey
  const deadline = new Date()
  deadline.setDate(deadline.getDate() + 3) // 3 days deadline

  const survey = await prisma.satisfactionSurvey.create({
    data: {
      programId: session.programId,
      sessionId: sessionId,
      title: `${session.sessionNo}회차 만족도 조사`,
      description: `${session.program.title} ${session.sessionNo}회차 모임에 대한 만족도 조사입니다.`,
      questions: JSON.stringify({
        version: '1.0',
        type: 'session',
        questions: DEFAULT_SURVEY_QUESTIONS,
      }),
      surveyType: 'session',
      deadline,
      status: 'ACTIVE',
      reminderEnabled: true,
      reminderDays: JSON.stringify([2, 1]),
    },
  })

  console.log(`Created session survey: ${survey.id}`)
  return survey
}

/**
 * 프로그램 종료 후 자동 조사 생성
 */
export async function autoCreateProgramSurvey(programId: string) {
  const program = await prisma.program.findUnique({
    where: { id: programId },
    include: {
      sessions: {
        orderBy: { date: 'desc' },
        take: 1,
      },
      surveys: {
        where: {
          surveyType: 'program',
        },
      },
    },
  })

  if (!program) {
    console.log(`Program ${programId} not found`)
    return null
  }

  // Check if program survey already exists
  if (program.surveys.length > 0) {
    console.log(`Program survey already exists for ${programId}`)
    return null
  }

  // Check if program has ended (last session completed)
  const lastSession = program.sessions[0]
  if (!lastSession) {
    console.log(`No sessions found for program ${programId}`)
    return null
  }

  const lastSessionEnd = lastSession.endTime
    ? new Date(lastSession.endTime)
    : new Date(new Date(lastSession.date).getTime() + 2 * 60 * 60 * 1000)

  if (new Date() < lastSessionEnd) {
    console.log(`Program ${programId} has not ended yet`)
    return null
  }

  // Create program survey
  const deadline = new Date()
  deadline.setDate(deadline.getDate() + 7) // 7 days deadline

  const survey = await prisma.satisfactionSurvey.create({
    data: {
      programId,
      title: `${program.title} 종료 만족도 조사`,
      description: `${program.title} 프로그램 전체에 대한 만족도 조사입니다.`,
      questions: JSON.stringify({
        version: '1.0',
        type: 'program',
        questions: PROGRAM_END_QUESTIONS,
        settings: {
          includeRefund: true,
        },
      }),
      surveyType: 'program',
      includeRefund: true,
      deadline,
      status: 'ACTIVE',
      reminderEnabled: true,
      reminderDays: JSON.stringify([5, 3, 1]),
    },
  })

  console.log(`Created program survey: ${survey.id}`)
  return survey
}

/**
 * 자동 조사 생성 체크 및 실행 (Cron에서 호출)
 */
export async function checkAndTriggerSurveys() {
  const now = new Date()
  const results = {
    sessionSurveys: 0,
    programSurveys: 0,
    errors: [] as string[],
  }

  try {
    // Find sessions that ended in the last hour without surveys
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000)

    const sessionsNeedingSurvey = await prisma.programSession.findMany({
      where: {
        date: {
          lte: oneHourAgo,
        },
        surveys: {
          none: {},
        },
      },
      select: {
        id: true,
      },
    })

    for (const session of sessionsNeedingSurvey) {
      try {
        const survey = await autoCreateSessionSurvey(session.id)
        if (survey) results.sessionSurveys++
      } catch (error) {
        results.errors.push(`Session ${session.id}: ${error}`)
      }
    }

    // Find programs that ended without program surveys
    // This is simplified - in real implementation, check endDate field
    const programsNeedingSurvey = await prisma.program.findMany({
      where: {
        endDate: {
          lte: now,
        },
        surveys: {
          none: {
            surveyType: 'program',
          },
        },
      },
      select: {
        id: true,
      },
    })

    for (const program of programsNeedingSurvey) {
      try {
        const survey = await autoCreateProgramSurvey(program.id)
        if (survey) results.programSurveys++
      } catch (error) {
        results.errors.push(`Program ${program.id}: ${error}`)
      }
    }
  } catch (error) {
    results.errors.push(`General error: ${error}`)
  }

  return results
}
