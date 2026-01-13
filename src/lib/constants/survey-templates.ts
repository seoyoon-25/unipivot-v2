export interface SurveyQuestion {
  id: string
  type: 'rating' | 'single' | 'multiple' | 'text'
  question: string
  options?: string[]
  required: boolean
}

export const DEFAULT_SURVEY_QUESTIONS: SurveyQuestion[] = [
  {
    id: 'satisfaction',
    type: 'rating',
    question: '전반적인 만족도는 어떠셨나요?',
    options: ['매우 불만족', '불만족', '보통', '만족', '매우 만족'],
    required: true,
  },
  {
    id: 'content',
    type: 'rating',
    question: '프로그램 내용은 어떠셨나요?',
    options: ['매우 불만족', '불만족', '보통', '만족', '매우 만족'],
    required: true,
  },
  {
    id: 'facilitation',
    type: 'rating',
    question: '진행 방식은 어떠셨나요?',
    options: ['매우 불만족', '불만족', '보통', '만족', '매우 만족'],
    required: true,
  },
  {
    id: 'recommend',
    type: 'single',
    question: '다른 분께 이 프로그램을 추천하시겠어요?',
    options: ['적극 추천', '추천', '보통', '비추천'],
    required: true,
  },
  {
    id: 'reapply',
    type: 'single',
    question: '다음에도 참여하실 의향이 있으신가요?',
    options: ['예', '아니오', '모르겠음'],
    required: true,
  },
  {
    id: 'improvement',
    type: 'text',
    question: '개선되었으면 하는 점이 있다면 자유롭게 적어주세요.',
    required: false,
  },
  {
    id: 'comment',
    type: 'text',
    question: '기타 의견이 있으시면 적어주세요.',
    required: false,
  },
]

export const BOOK_CLUB_QUESTIONS: SurveyQuestion[] = [
  DEFAULT_SURVEY_QUESTIONS[0], // satisfaction
  DEFAULT_SURVEY_QUESTIONS[1], // content
  {
    id: 'book',
    type: 'rating',
    question: '선정된 책은 어떠셨나요?',
    options: ['매우 불만족', '불만족', '보통', '만족', '매우 만족'],
    required: true,
  },
  {
    id: 'discussion',
    type: 'rating',
    question: '토론 분위기는 어떠셨나요?',
    options: ['매우 불만족', '불만족', '보통', '만족', '매우 만족'],
    required: true,
  },
  DEFAULT_SURVEY_QUESTIONS[2], // facilitation
  DEFAULT_SURVEY_QUESTIONS[3], // recommend
  DEFAULT_SURVEY_QUESTIONS[4], // reapply
  DEFAULT_SURVEY_QUESTIONS[5], // improvement
  DEFAULT_SURVEY_QUESTIONS[6], // comment
]

export const SEMINAR_QUESTIONS: SurveyQuestion[] = [
  DEFAULT_SURVEY_QUESTIONS[0], // satisfaction
  {
    id: 'speaker',
    type: 'rating',
    question: '강연자는 어떠셨나요?',
    options: ['매우 불만족', '불만족', '보통', '만족', '매우 만족'],
    required: true,
  },
  DEFAULT_SURVEY_QUESTIONS[1], // content
  {
    id: 'venue',
    type: 'rating',
    question: '행사 장소/환경은 어떠셨나요?',
    options: ['매우 불만족', '불만족', '보통', '만족', '매우 만족'],
    required: true,
  },
  DEFAULT_SURVEY_QUESTIONS[3], // recommend
  DEFAULT_SURVEY_QUESTIONS[4], // reapply
  DEFAULT_SURVEY_QUESTIONS[5], // improvement
  DEFAULT_SURVEY_QUESTIONS[6], // comment
]

export function getSurveyTemplateByProgramType(programType: string): SurveyQuestion[] {
  switch (programType) {
    case 'BOOKCLUB':
      return BOOK_CLUB_QUESTIONS
    case 'SEMINAR':
    case 'WORKSHOP':
      return SEMINAR_QUESTIONS
    default:
      return DEFAULT_SURVEY_QUESTIONS
  }
}

// 응답 분석 헬퍼
export function calculateSurveyStats(
  responses: Array<{ questionId: string; answer: string | number }>[]
): Record<string, { average?: number; distribution?: Record<string, number> }> {
  const stats: Record<string, { values: (string | number)[]; options?: string[] }> = {}

  // 응답 수집
  for (const response of responses) {
    for (const answer of response) {
      if (!stats[answer.questionId]) {
        stats[answer.questionId] = { values: [] }
      }
      stats[answer.questionId].values.push(answer.answer)
    }
  }

  // 통계 계산
  const result: Record<string, { average?: number; distribution?: Record<string, number> }> = {}

  for (const [questionId, data] of Object.entries(stats)) {
    const values = data.values

    // 숫자인 경우 평균 계산
    if (values.every((v) => typeof v === 'number')) {
      const numValues = values as number[]
      result[questionId] = {
        average: numValues.reduce((a, b) => a + b, 0) / numValues.length,
      }
    } else {
      // 문자열인 경우 분포 계산
      const distribution: Record<string, number> = {}
      for (const value of values) {
        const key = String(value)
        distribution[key] = (distribution[key] || 0) + 1
      }
      result[questionId] = { distribution }
    }
  }

  return result
}
