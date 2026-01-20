'use server'

import prisma from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { revalidatePath } from 'next/cache'
import {
  SurveyStructure,
  SurveyQuestion,
  SurveyTemplateRaw,
  parseTemplateQuestions,
  parseTemplateSettings,
  SurveyAnswer,
} from '@/types/survey'

// Get all survey templates
export async function getSurveyTemplates(category?: string) {
  const templates = await prisma.surveyTemplate.findMany({
    where: category ? { category, isPublic: true } : { isPublic: true },
    orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
  })

  return templates.map((t: { id: string; name: string; description: string | null; category: string; isDefault: boolean; isPublic: boolean; createdBy: string | null; questions: string; settings: string | null; createdAt: Date; updatedAt: Date }) => ({
    ...t,
    questions: parseTemplateQuestions(t.questions),
    settings: parseTemplateSettings(t.settings),
  }))
}

// Get single template by ID
export async function getSurveyTemplate(templateId: string) {
  const template = await prisma.surveyTemplate.findUnique({
    where: { id: templateId },
  })

  if (!template) return null

  return {
    ...template,
    questions: parseTemplateQuestions(template.questions),
    settings: parseTemplateSettings(template.settings),
  }
}

// Create survey from template
export async function createSurveyFromTemplate(options: {
  programId: string
  templateId?: string
  title: string
  description?: string
  deadline: Date
  surveyType: 'session' | 'program'
  sessionId?: string
  customQuestions?: SurveyQuestion[]
  includeRefund?: boolean
  reminderEnabled?: boolean
  reminderDays?: number[]
}) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    throw new Error('로그인이 필요합니다')
  }

  const {
    programId,
    templateId,
    title,
    description,
    deadline,
    surveyType,
    sessionId,
    customQuestions,
    includeRefund = false,
    reminderEnabled = true,
    reminderDays = [3, 1],
  } = options

  // Get questions from template or use custom
  let questions: SurveyQuestion[] = []

  if (templateId) {
    const template = await prisma.surveyTemplate.findUnique({
      where: { id: templateId },
    })
    if (template) {
      const parsed = parseTemplateQuestions(template.questions)
      questions = parsed.questions
    }
  }

  if (customQuestions && customQuestions.length > 0) {
    questions = customQuestions
  }

  if (questions.length === 0) {
    throw new Error('질문이 없습니다')
  }

  // Calculate target count based on participants
  const program = await prisma.program.findUnique({
    where: { id: programId },
    include: {
      participants: {
        where: { status: 'ACTIVE' },
      },
    },
  })

  const targetCount = program?.participants.length || 0

  // Create survey
  const survey = await prisma.satisfactionSurvey.create({
    data: {
      programId,
      title,
      description,
      questions: JSON.stringify(questions),
      deadline,
      surveyType,
      sessionId: surveyType === 'session' ? sessionId : null,
      includeRefund,
      templateId,
      reminderEnabled,
      reminderDays: JSON.stringify(reminderDays),
      targetCount,
      status: 'DRAFT',
    },
  })

  revalidatePath(`/admin/programs/${programId}`)
  revalidatePath(`/admin/programs/${programId}/surveys`)

  return survey
}

// Publish survey (send to participants)
export async function publishSurvey(surveyId: string) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    throw new Error('로그인이 필요합니다')
  }

  const survey = await prisma.satisfactionSurvey.findUnique({
    where: { id: surveyId },
    include: {
      program: {
        include: {
          participants: {
            where: { status: 'ACTIVE' },
            include: { user: true },
          },
        },
      },
    },
  })

  if (!survey) {
    throw new Error('조사를 찾을 수 없습니다')
  }

  if (survey.status !== 'DRAFT') {
    throw new Error('이미 발송된 조사입니다')
  }

  // Update status
  const updatedSurvey = await prisma.satisfactionSurvey.update({
    where: { id: surveyId },
    data: {
      status: 'ACTIVE',
      sentAt: new Date(),
      targetCount: survey.program.participants.length,
    },
  })

  // Create notifications for participants
  const notifications = survey.program.participants.map((participant: { userId: string }) => ({
    userId: participant.userId,
    type: 'SURVEY',
    title: '만족도 조사 안내',
    message: `${survey.title} 조사에 참여해주세요.`,
    link: `/surveys/${surveyId}/respond`,
  }))

  if (notifications.length > 0) {
    await prisma.notification.createMany({
      data: notifications,
    })
  }

  revalidatePath(`/admin/programs/${survey.programId}`)
  revalidatePath(`/admin/surveys/${surveyId}`)

  return updatedSurvey
}

// Close survey
export async function closeSurvey(surveyId: string) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    throw new Error('로그인이 필요합니다')
  }

  const survey = await prisma.satisfactionSurvey.update({
    where: { id: surveyId },
    data: {
      status: 'CLOSED',
      closedAt: new Date(),
    },
  })

  revalidatePath(`/admin/programs/${survey.programId}`)
  revalidatePath(`/admin/surveys/${surveyId}`)

  return survey
}

// Save custom template
export async function saveSurveyTemplate(
  name: string,
  description: string | undefined,
  category: string,
  questions: SurveyQuestion[],
  settings?: {
    anonymous?: boolean
    allowEdit?: boolean
    showProgress?: boolean
  }
) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    throw new Error('로그인이 필요합니다')
  }

  const structure: SurveyStructure = {
    version: '1.0',
    type: 'session',
    questions,
    settings,
  }

  const template = await prisma.surveyTemplate.create({
    data: {
      name,
      description,
      category,
      questions: JSON.stringify(structure),
      createdBy: session.user.id,
      isPublic: false,
    },
  })

  revalidatePath('/admin/survey-templates')

  return template
}

// Submit survey response
export async function submitSurveyResponse(data: {
  surveyId: string
  applicationId: string
  answers: SurveyAnswer[]
  refundInfo?: {
    choice: 'REFUND' | 'DONATE'
    bankAccountId?: string
    newAccount?: {
      bankCode: string
      bankName: string
      accountNumber: string
      accountHolder: string
    }
    donationMessage?: string
    saveNewAccount?: boolean
  }
  isAnonymous?: boolean
}) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    throw new Error('로그인이 필요합니다')
  }

  const { surveyId, applicationId, answers, refundInfo, isAnonymous = false } = data

  // Check survey exists and is active
  const survey = await prisma.satisfactionSurvey.findUnique({
    where: { id: surveyId },
  })

  if (!survey) {
    throw new Error('조사를 찾을 수 없습니다')
  }

  if (survey.status !== 'ACTIVE') {
    throw new Error('현재 응답할 수 없는 조사입니다')
  }

  if (new Date() > survey.deadline) {
    throw new Error('응답 마감일이 지났습니다')
  }

  // Check for duplicate response
  const existingResponse = await prisma.surveyResponse.findUnique({
    where: { applicationId },
  })

  if (existingResponse) {
    throw new Error('이미 응답을 제출하셨습니다')
  }

  // Validate required questions
  const questions = JSON.parse(survey.questions) as SurveyQuestion[]
  const requiredQuestionIds = questions
    .filter((q) => q.required)
    .map((q) => q.id)

  const answeredQuestionIds = answers.map((a) => a.questionId)
  const missingRequired = requiredQuestionIds.filter(
    (id) => !answeredQuestionIds.includes(id)
  )

  if (missingRequired.length > 0) {
    throw new Error('필수 질문에 모두 응답해주세요')
  }

  // Handle new bank account if needed
  let bankAccountId = refundInfo?.bankAccountId

  if (refundInfo?.newAccount && refundInfo.saveNewAccount) {
    const newAccount = await prisma.bankAccount.create({
      data: {
        userId: session.user.id,
        bankCode: refundInfo.newAccount.bankCode,
        bankName: refundInfo.newAccount.bankName,
        accountNumber: refundInfo.newAccount.accountNumber,
        accountHolder: refundInfo.newAccount.accountHolder,
      },
    })
    bankAccountId = newAccount.id
  }

  // Create response
  const response = await prisma.surveyResponse.create({
    data: {
      surveyId,
      applicationId,
      userId: session.user.id,
      answers: JSON.stringify(answers),
      refundChoice: refundInfo?.choice || 'REFUND',
      bankAccountId,
      newBankCode: refundInfo?.newAccount?.bankCode,
      newBankName: refundInfo?.newAccount?.bankName,
      newAccountNumber: refundInfo?.newAccount?.accountNumber,
      newAccountHolder: refundInfo?.newAccount?.accountHolder,
      saveNewAccount: refundInfo?.saveNewAccount || false,
      donationMessage: refundInfo?.donationMessage,
      isAnonymous,
    },
  })

  // Update response count
  await prisma.satisfactionSurvey.update({
    where: { id: surveyId },
    data: {
      responseCount: { increment: 1 },
    },
  })

  revalidatePath(`/surveys/${surveyId}`)
  revalidatePath(`/admin/surveys/${surveyId}`)

  return response
}

// Get survey results (for admin)
export async function getSurveyResults(surveyId: string) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    throw new Error('로그인이 필요합니다')
  }

  const survey = await prisma.satisfactionSurvey.findUnique({
    where: { id: surveyId },
    include: {
      program: true,
      responses: {
        include: {
          application: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                },
              },
            },
          },
        },
      },
    },
  })

  if (!survey) {
    throw new Error('조사를 찾을 수 없습니다')
  }

  const questions = JSON.parse(survey.questions) as SurveyQuestion[]

  // Parse responses
  type ResponseType = typeof survey.responses[number]
  const responses = survey.responses.map((r: ResponseType) => ({
    id: r.id,
    userId: r.userId,
    userName: r.isAnonymous ? '익명' : r.application.user?.name || '알 수 없음',
    answers: JSON.parse(r.answers) as SurveyAnswer[],
    refundChoice: r.refundChoice,
    submittedAt: r.submittedAt,
  }))

  // Calculate statistics for each question
  type ParsedResponse = { id: string; userId: string; userName: string; answers: SurveyAnswer[]; refundChoice: string; submittedAt: Date }
  const questionStats = questions.map((question) => {
    const questionAnswers = responses
      .map((r: ParsedResponse) => r.answers.find((a: SurveyAnswer) => a.questionId === question.id))
      .filter(Boolean) as SurveyAnswer[]

    let stats: Record<string, unknown> = {
      questionId: question.id,
      questionText: question.text,
      questionType: question.type,
      totalResponses: questionAnswers.length,
    }

    switch (question.type) {
      case 'emoji_5':
      case 'star_5':
      case 'rating_10': {
        const values = questionAnswers
          .map((a: SurveyAnswer) => a.value as number)
          .filter((v: number) => typeof v === 'number')

        const sum = values.reduce((acc: number, v: number) => acc + v, 0)
        const average = values.length > 0 ? sum / values.length : 0

        // Distribution
        const distribution: Record<number, number> = {}
        values.forEach((v: number) => {
          distribution[v] = (distribution[v] || 0) + 1
        })

        stats = {
          ...stats,
          average: Math.round(average * 10) / 10,
          distribution,
        }

        // NPS calculation for rating_10
        if (question.type === 'rating_10') {
          const promoters = values.filter((v: number) => v >= 9).length
          const passives = values.filter((v: number) => v >= 7 && v <= 8).length
          const detractors = values.filter((v: number) => v <= 6).length
          const total = values.length

          stats = {
            ...stats,
            nps: total > 0
              ? Math.round(((promoters - detractors) / total) * 100)
              : 0,
            promotersPercent: total > 0 ? Math.round((promoters / total) * 100) : 0,
            passivesPercent: total > 0 ? Math.round((passives / total) * 100) : 0,
            detractorsPercent: total > 0 ? Math.round((detractors / total) * 100) : 0,
          }
        }
        break
      }

      case 'single_choice':
      case 'yes_no': {
        const distribution: Record<string, number> = {}
        questionAnswers.forEach((a: SurveyAnswer) => {
          const value = String(a.value)
          distribution[value] = (distribution[value] || 0) + 1
        })

        stats = {
          ...stats,
          distribution,
        }
        break
      }

      case 'multi_choice': {
        const distribution: Record<string, number> = {}
        questionAnswers.forEach((a: SurveyAnswer) => {
          const answerValues = a.value as string[]
          if (Array.isArray(answerValues)) {
            answerValues.forEach((v: string) => {
              distribution[v] = (distribution[v] || 0) + 1
            })
          }
        })

        stats = {
          ...stats,
          distribution,
        }
        break
      }

      case 'text_short':
      case 'text_long': {
        const textResponses = questionAnswers
          .map((a: SurveyAnswer) => a.value as string)
          .filter((v: string) => v && v.trim().length > 0)

        stats = {
          ...stats,
          responses: textResponses,
        }
        break
      }
    }

    return stats
  })

  return {
    survey: {
      id: survey.id,
      title: survey.title,
      description: survey.description,
      programId: survey.programId,
      programTitle: survey.program.title,
      status: survey.status,
      deadline: survey.deadline,
      targetCount: survey.targetCount,
      responseCount: survey.responseCount,
      responseRate: survey.targetCount > 0
        ? Math.round((survey.responseCount / survey.targetCount) * 100)
        : 0,
    },
    questions,
    questionStats,
    responses,
  }
}

// Get survey for response
export async function getSurveyForResponse(surveyId: string) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    throw new Error('로그인이 필요합니다')
  }

  const survey = await prisma.satisfactionSurvey.findUnique({
    where: { id: surveyId },
    include: {
      program: {
        select: {
          id: true,
          title: true,
        },
      },
    },
  })

  if (!survey) {
    return null
  }

  // Get user's application
  const application = await prisma.programApplication.findFirst({
    where: {
      programId: survey.programId,
      userId: session.user.id,
      status: 'APPROVED',
    },
  })

  // Check if already responded
  const existingResponse = application
    ? await prisma.surveyResponse.findUnique({
        where: { applicationId: application.id },
      })
    : null

  // Get user's bank accounts for refund
  const bankAccounts = await prisma.bankAccount.findMany({
    where: { userId: session.user.id },
    orderBy: { isDefault: 'desc' },
  })

  return {
    survey: {
      id: survey.id,
      title: survey.title,
      description: survey.description,
      programTitle: survey.program.title,
      status: survey.status,
      deadline: survey.deadline,
      includeRefund: survey.includeRefund,
      questions: JSON.parse(survey.questions) as SurveyQuestion[],
    },
    applicationId: application?.id,
    hasResponded: !!existingResponse,
    bankAccounts,
  }
}

// Get surveys for program
export async function getProgramSurveys(programId: string) {
  const surveys = await prisma.satisfactionSurvey.findMany({
    where: { programId },
    orderBy: { createdAt: 'desc' },
    include: {
      session: {
        select: {
          id: true,
          sessionNo: true,
          title: true,
          date: true,
        },
      },
    },
  })

  type SurveyWithSession = typeof surveys[number]
  return surveys.map((s: SurveyWithSession) => ({
    ...s,
    questions: JSON.parse(s.questions) as SurveyQuestion[],
    reminderDays: s.reminderDays ? JSON.parse(s.reminderDays) as number[] : [3, 1],
  }))
}
