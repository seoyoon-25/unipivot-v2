import { SurveyQuestion, QuestionType } from '@/types/survey'

interface SurveyAnswer {
  questionId: string
  value: string | number | string[] | null
}

interface SurveyResponseData {
  id: string
  answers: string // JSON string
  createdAt: Date
  user?: {
    name: string | null
    email: string | null
  }
}

// Parse answers from JSON string
export function parseAnswers(answersJson: string): Record<string, SurveyAnswer['value']> {
  try {
    return JSON.parse(answersJson)
  } catch {
    return {}
  }
}

// Calculate average rating for numeric questions
export function calculateAverageRating(
  responses: SurveyResponseData[],
  questionId: string
): number | null {
  const values: number[] = []

  responses.forEach((response) => {
    const answers = parseAnswers(response.answers)
    const value = answers[questionId]
    if (typeof value === 'number') {
      values.push(value)
    }
  })

  if (values.length === 0) return null
  return Math.round((values.reduce((a, b) => a + b, 0) / values.length) * 10) / 10
}

// Get distribution of ratings
export function getRatingDistribution(
  responses: SurveyResponseData[],
  questionId: string,
  type: QuestionType
): { value: number; count: number; percentage: number }[] {
  const maxValue = type === 'rating_10' ? 10 : 5
  const distribution: Record<number, number> = {}

  // Initialize all values
  for (let i = type === 'rating_10' ? 0 : 1; i <= maxValue; i++) {
    distribution[i] = 0
  }

  responses.forEach((response) => {
    const answers = parseAnswers(response.answers)
    const value = answers[questionId]
    if (typeof value === 'number' && distribution.hasOwnProperty(value)) {
      distribution[value]++
    }
  })

  const total = responses.length
  return Object.entries(distribution).map(([value, count]) => ({
    value: parseInt(value),
    count,
    percentage: total > 0 ? Math.round((count / total) * 100) : 0,
  }))
}

// Calculate NPS score (-100 to 100)
export function calculateNPS(
  responses: SurveyResponseData[],
  questionId: string
): {
  score: number
  promoters: number
  passives: number
  detractors: number
  promoterCount: number
  passiveCount: number
  detractorCount: number
} {
  let promoterCount = 0
  let passiveCount = 0
  let detractorCount = 0

  responses.forEach((response) => {
    const answers = parseAnswers(response.answers)
    const value = answers[questionId]
    if (typeof value === 'number') {
      if (value >= 9) {
        promoterCount++
      } else if (value >= 7) {
        passiveCount++
      } else {
        detractorCount++
      }
    }
  })

  const total = promoterCount + passiveCount + detractorCount
  const promoters = total > 0 ? Math.round((promoterCount / total) * 100) : 0
  const passives = total > 0 ? Math.round((passiveCount / total) * 100) : 0
  const detractors = total > 0 ? Math.round((detractorCount / total) * 100) : 0
  const score = promoters - detractors

  return {
    score,
    promoters,
    passives,
    detractors,
    promoterCount,
    passiveCount,
    detractorCount,
  }
}

// Get text responses for open-ended questions
export function getTextResponses(
  responses: SurveyResponseData[],
  questionId: string
): { text: string; userName: string | null; createdAt: Date }[] {
  const results: { text: string; userName: string | null; createdAt: Date }[] = []

  responses.forEach((response) => {
    const answers = parseAnswers(response.answers)
    const value = answers[questionId]
    if (typeof value === 'string' && value.trim()) {
      results.push({
        text: value,
        userName: response.user?.name || null,
        createdAt: response.createdAt,
      })
    }
  })

  return results.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
}

// Get choice distribution for single/multi choice questions
export function getChoiceDistribution(
  responses: SurveyResponseData[],
  questionId: string,
  options: string[]
): { option: string; count: number; percentage: number }[] {
  const counts: Record<string, number> = {}
  options.forEach((opt) => (counts[opt] = 0))

  let totalResponses = 0

  responses.forEach((response) => {
    const answers = parseAnswers(response.answers)
    const value = answers[questionId]

    if (typeof value === 'string' && counts.hasOwnProperty(value)) {
      counts[value]++
      totalResponses++
    } else if (Array.isArray(value)) {
      value.forEach((v: string) => {
        if (counts.hasOwnProperty(v)) {
          counts[v]++
        }
      })
      if (value.length > 0) totalResponses++
    }
  })

  return options.map((option) => ({
    option,
    count: counts[option],
    percentage: totalResponses > 0 ? Math.round((counts[option] / responses.length) * 100) : 0,
  }))
}

// Get yes/no distribution
export function getYesNoDistribution(
  responses: SurveyResponseData[],
  questionId: string
): { yes: number; no: number; yesPercentage: number; noPercentage: number } {
  let yes = 0
  let no = 0

  responses.forEach((response) => {
    const answers = parseAnswers(response.answers)
    const value = answers[questionId]
    if (value === 'yes') yes++
    else if (value === 'no') no++
  })

  const total = yes + no
  return {
    yes,
    no,
    yesPercentage: total > 0 ? Math.round((yes / total) * 100) : 0,
    noPercentage: total > 0 ? Math.round((no / total) * 100) : 0,
  }
}

// Analyze all questions in a survey
export function analyzeSurvey(
  responses: SurveyResponseData[],
  questions: SurveyQuestion[]
): {
  totalResponses: number
  averageSatisfaction: number | null
  npsScore: number | null
  questionAnalysis: Record<string, unknown>
} {
  const questionAnalysis: Record<string, unknown> = {}
  let satisfactionSum = 0
  let satisfactionCount = 0
  let npsScore: number | null = null

  questions.forEach((question) => {
    switch (question.type) {
      case 'emoji_5':
      case 'star_5': {
        const avg = calculateAverageRating(responses, question.id)
        const distribution = getRatingDistribution(responses, question.id, question.type)
        questionAnalysis[question.id] = {
          type: question.type,
          average: avg,
          distribution,
        }
        if (avg !== null) {
          satisfactionSum += (avg / 5) * 100
          satisfactionCount++
        }
        break
      }

      case 'rating_10': {
        const nps = calculateNPS(responses, question.id)
        const distribution = getRatingDistribution(responses, question.id, question.type)
        questionAnalysis[question.id] = {
          type: question.type,
          nps,
          distribution,
        }
        npsScore = nps.score
        break
      }

      case 'single_choice':
      case 'multi_choice': {
        // Extract choice texts from options.choices
        const choiceTexts = question.options?.choices?.map(c => c.text) || []
        const distribution = getChoiceDistribution(responses, question.id, choiceTexts)
        questionAnalysis[question.id] = {
          type: question.type,
          distribution,
        }
        break
      }

      case 'yes_no': {
        const distribution = getYesNoDistribution(responses, question.id)
        questionAnalysis[question.id] = {
          type: question.type,
          distribution,
        }
        break
      }

      case 'text_short':
      case 'text_long': {
        const textResponses = getTextResponses(responses, question.id)
        questionAnalysis[question.id] = {
          type: question.type,
          responses: textResponses,
          responseCount: textResponses.length,
        }
        break
      }
    }
  })

  return {
    totalResponses: responses.length,
    averageSatisfaction: satisfactionCount > 0 ? Math.round(satisfactionSum / satisfactionCount) : null,
    npsScore,
    questionAnalysis,
  }
}

// Export survey results to CSV format
export function exportToCSV(
  responses: SurveyResponseData[],
  questions: SurveyQuestion[]
): string {
  const headers = ['응답 일시', '응답자', ...questions.map((q) => q.text)]
  const rows = responses.map((response) => {
    const answers = parseAnswers(response.answers)
    return [
      new Date(response.createdAt).toLocaleString('ko-KR'),
      response.user?.name || '익명',
      ...questions.map((q) => {
        const value = answers[q.id]
        if (value === null || value === undefined) return ''
        if (Array.isArray(value)) return value.join(', ')
        return String(value)
      }),
    ]
  })

  const csvContent = [headers, ...rows]
    .map((row) =>
      row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')
    )
    .join('\n')

  return '\ufeff' + csvContent // BOM for Excel compatibility
}

// Generate summary statistics for dashboard
export function generateSummaryStats(
  responses: SurveyResponseData[],
  questions: SurveyQuestion[],
  totalParticipants: number
): {
  responseRate: number
  averageSatisfaction: number | null
  npsScore: number | null
  completionRate: number
} {
  const analysis = analyzeSurvey(responses, questions)

  // Calculate completion rate (responses with all required questions answered)
  const requiredQuestions = questions.filter((q) => q.required)
  let completeResponses = 0

  responses.forEach((response) => {
    const answers = parseAnswers(response.answers)
    const allRequired = requiredQuestions.every((q) => {
      const value = answers[q.id]
      return value !== null && value !== '' && (!Array.isArray(value) || value.length > 0)
    })
    if (allRequired) completeResponses++
  })

  return {
    responseRate: totalParticipants > 0 ? Math.round((responses.length / totalParticipants) * 100) : 0,
    averageSatisfaction: analysis.averageSatisfaction,
    npsScore: analysis.npsScore,
    completionRate: responses.length > 0 ? Math.round((completeResponses / responses.length) * 100) : 0,
  }
}
