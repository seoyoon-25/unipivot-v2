/**
 * Survey Templates Seed Data
 *
 * Run: npx tsx prisma/seeds/survey-templates.ts
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Survey question type definitions
type QuestionType =
  | 'emoji_5'       // 5-scale emoji
  | 'star_5'        // 5-star rating
  | 'rating_10'     // NPS 0-10
  | 'single_choice' // Single selection
  | 'multi_choice'  // Multiple selection
  | 'text_short'    // Short text
  | 'text_long'     // Long text
  | 'yes_no'        // Yes/No

interface SurveyQuestion {
  id: string
  order: number
  type: QuestionType
  text: string
  description?: string
  required: boolean
  options?: {
    labels?: string[]
    choices?: Array<{ id: string; text: string; order: number }>
    min?: number
    max?: number
    minLabel?: string
    maxLabel?: string
    placeholder?: string
    maxLength?: number
    rows?: number
  }
}

// Reading session template (per-session survey)
const readingSessionQuestions: SurveyQuestion[] = [
  {
    id: 'q1',
    order: 1,
    type: 'emoji_5',
    text: '오늘 모임은 어떠셨나요?',
    description: '전반적인 만족도를 선택해주세요',
    required: true,
    options: {
      labels: ['매우 불만족', '불만족', '보통', '만족', '매우 만족']
    }
  },
  {
    id: 'q2',
    order: 2,
    type: 'star_5',
    text: '오늘 읽은 책 내용은 어떠셨나요?',
    required: true
  },
  {
    id: 'q3',
    order: 3,
    type: 'star_5',
    text: '토론 주제와 진행 방식은 어떠셨나요?',
    required: true
  },
  {
    id: 'q4',
    order: 4,
    type: 'star_5',
    text: '진행자의 진행은 어떠셨나요?',
    required: true
  },
  {
    id: 'q5',
    order: 5,
    type: 'single_choice',
    text: '다음 모임도 참석할 의향이 있으신가요?',
    required: true,
    options: {
      choices: [
        { id: 'c1', text: '네, 꼭 참석하고 싶습니다', order: 1 },
        { id: 'c2', text: '참석할 것 같습니다', order: 2 },
        { id: 'c3', text: '모르겠습니다', order: 3 },
        { id: 'c4', text: '참석하기 어려울 것 같습니다', order: 4 }
      ]
    }
  },
  {
    id: 'q6',
    order: 6,
    type: 'multi_choice',
    text: '오늘 모임에서 좋았던 점을 모두 선택해주세요',
    required: false,
    options: {
      choices: [
        { id: 'c1', text: '책 선정', order: 1 },
        { id: 'c2', text: '토론 분위기', order: 2 },
        { id: 'c3', text: '진행자의 진행', order: 3 },
        { id: 'c4', text: '다른 참가자들과의 교류', order: 4 },
        { id: 'c5', text: '장소/환경', order: 5 },
        { id: 'c6', text: '시간 배분', order: 6 }
      ]
    }
  },
  {
    id: 'q7',
    order: 7,
    type: 'text_short',
    text: '오늘 모임에서 가장 인상 깊었던 부분이 있다면?',
    required: false,
    options: {
      placeholder: '간단히 적어주세요',
      maxLength: 200
    }
  },
  {
    id: 'q8',
    order: 8,
    type: 'text_long',
    text: '개선이 필요한 부분이나 건의사항이 있으시면 자유롭게 적어주세요',
    required: false,
    options: {
      placeholder: '소중한 의견을 남겨주세요',
      maxLength: 500,
      rows: 4
    }
  }
]

// Reading program template (season-end survey)
const readingProgramQuestions: SurveyQuestion[] = [
  {
    id: 'q1',
    order: 1,
    type: 'emoji_5',
    text: '이번 시즌 독서모임에 전반적으로 만족하셨나요?',
    description: '전체적인 만족도를 선택해주세요',
    required: true,
    options: {
      labels: ['매우 불만족', '불만족', '보통', '만족', '매우 만족']
    }
  },
  {
    id: 'q2',
    order: 2,
    type: 'rating_10',
    text: '이 프로그램을 주변에 추천하실 의향이 얼마나 되시나요?',
    description: '0점(전혀 추천 안함) ~ 10점(매우 추천함)',
    required: true,
    options: {
      minLabel: '전혀 추천 안함',
      maxLabel: '매우 추천함'
    }
  },
  {
    id: 'q3',
    order: 3,
    type: 'star_5',
    text: '선정된 도서들은 어떠셨나요?',
    required: true
  },
  {
    id: 'q4',
    order: 4,
    type: 'star_5',
    text: '모임 일정과 시간 배분은 어떠셨나요?',
    required: true
  },
  {
    id: 'q5',
    order: 5,
    type: 'star_5',
    text: '진행자의 운영은 어떠셨나요?',
    required: true
  },
  {
    id: 'q6',
    order: 6,
    type: 'single_choice',
    text: '다음 시즌에도 참여할 의향이 있으신가요?',
    required: true,
    options: {
      choices: [
        { id: 'c1', text: '네, 꼭 참여하고 싶습니다', order: 1 },
        { id: 'c2', text: '참여 의향이 있습니다', order: 2 },
        { id: 'c3', text: '고민 중입니다', order: 3 },
        { id: 'c4', text: '참여하기 어려울 것 같습니다', order: 4 }
      ]
    }
  },
  {
    id: 'q7',
    order: 7,
    type: 'multi_choice',
    text: '이번 시즌에서 좋았던 점을 모두 선택해주세요',
    required: false,
    options: {
      choices: [
        { id: 'c1', text: '책 선정', order: 1 },
        { id: 'c2', text: '토론 진행 방식', order: 2 },
        { id: 'c3', text: '진행자', order: 3 },
        { id: 'c4', text: '함께한 멤버들', order: 4 },
        { id: 'c5', text: '모임 장소/환경', order: 5 },
        { id: 'c6', text: '일정/시간대', order: 6 },
        { id: 'c7', text: '운영 방식', order: 7 }
      ]
    }
  },
  {
    id: 'q8',
    order: 8,
    type: 'text_long',
    text: '이번 시즌에서 가장 기억에 남는 순간이나 책이 있다면?',
    required: false,
    options: {
      placeholder: '자유롭게 적어주세요',
      maxLength: 500,
      rows: 3
    }
  },
  {
    id: 'q9',
    order: 9,
    type: 'text_long',
    text: '다음 시즌에 읽고 싶은 책이나 주제가 있으신가요?',
    required: false,
    options: {
      placeholder: '책 제목이나 주제를 적어주세요',
      maxLength: 300,
      rows: 2
    }
  },
  {
    id: 'q10',
    order: 10,
    type: 'text_long',
    text: '개선이 필요한 부분이나 건의사항이 있으시면 자유롭게 적어주세요',
    required: false,
    options: {
      placeholder: '소중한 의견을 남겨주세요',
      maxLength: 500,
      rows: 4
    }
  }
]

// Lecture template
const lectureQuestions: SurveyQuestion[] = [
  {
    id: 'q1',
    order: 1,
    type: 'emoji_5',
    text: '오늘 강연에 전반적으로 만족하셨나요?',
    required: true,
    options: {
      labels: ['매우 불만족', '불만족', '보통', '만족', '매우 만족']
    }
  },
  {
    id: 'q2',
    order: 2,
    type: 'star_5',
    text: '강연 내용은 유익했나요?',
    required: true
  },
  {
    id: 'q3',
    order: 3,
    type: 'star_5',
    text: '강연자의 전달력은 어떠셨나요?',
    required: true
  },
  {
    id: 'q4',
    order: 4,
    type: 'rating_10',
    text: '이 강연을 주변에 추천하실 의향이 얼마나 되시나요?',
    required: true,
    options: {
      minLabel: '전혀 추천 안함',
      maxLabel: '매우 추천함'
    }
  },
  {
    id: 'q5',
    order: 5,
    type: 'single_choice',
    text: '강연 시간은 적절했나요?',
    required: true,
    options: {
      choices: [
        { id: 'c1', text: '너무 짧았습니다', order: 1 },
        { id: 'c2', text: '적절했습니다', order: 2 },
        { id: 'c3', text: '약간 길었습니다', order: 3 },
        { id: 'c4', text: '너무 길었습니다', order: 4 }
      ]
    }
  },
  {
    id: 'q6',
    order: 6,
    type: 'yes_no',
    text: '강연 내용을 실생활이나 업무에 적용할 수 있을 것 같나요?',
    required: true
  },
  {
    id: 'q7',
    order: 7,
    type: 'text_short',
    text: '가장 인상 깊었던 내용은 무엇인가요?',
    required: false,
    options: {
      placeholder: '간단히 적어주세요',
      maxLength: 200
    }
  },
  {
    id: 'q8',
    order: 8,
    type: 'text_long',
    text: '개선사항이나 다음에 듣고 싶은 주제가 있다면 알려주세요',
    required: false,
    options: {
      placeholder: '의견을 남겨주세요',
      maxLength: 500,
      rows: 4
    }
  }
]

// Workshop template
const workshopQuestions: SurveyQuestion[] = [
  {
    id: 'q1',
    order: 1,
    type: 'emoji_5',
    text: '오늘 워크샵에 전반적으로 만족하셨나요?',
    required: true,
    options: {
      labels: ['매우 불만족', '불만족', '보통', '만족', '매우 만족']
    }
  },
  {
    id: 'q2',
    order: 2,
    type: 'star_5',
    text: '워크샵 내용의 유익함은 어땠나요?',
    required: true
  },
  {
    id: 'q3',
    order: 3,
    type: 'star_5',
    text: '진행자의 진행과 설명은 어땠나요?',
    required: true
  },
  {
    id: 'q4',
    order: 4,
    type: 'star_5',
    text: '실습/활동의 난이도는 적절했나요?',
    required: true
  },
  {
    id: 'q5',
    order: 5,
    type: 'star_5',
    text: '제공된 자료/도구는 충분했나요?',
    required: true
  },
  {
    id: 'q6',
    order: 6,
    type: 'rating_10',
    text: '이 워크샵을 주변에 추천하실 의향이 얼마나 되시나요?',
    required: true,
    options: {
      minLabel: '전혀 추천 안함',
      maxLabel: '매우 추천함'
    }
  },
  {
    id: 'q7',
    order: 7,
    type: 'single_choice',
    text: '실습 시간은 충분했나요?',
    required: true,
    options: {
      choices: [
        { id: 'c1', text: '매우 부족했습니다', order: 1 },
        { id: 'c2', text: '약간 부족했습니다', order: 2 },
        { id: 'c3', text: '적절했습니다', order: 3 },
        { id: 'c4', text: '충분했습니다', order: 4 }
      ]
    }
  },
  {
    id: 'q8',
    order: 8,
    type: 'yes_no',
    text: '배운 내용을 실제로 적용해볼 의향이 있으신가요?',
    required: true
  },
  {
    id: 'q9',
    order: 9,
    type: 'multi_choice',
    text: '오늘 워크샵에서 좋았던 점을 모두 선택해주세요',
    required: false,
    options: {
      choices: [
        { id: 'c1', text: '실습 활동', order: 1 },
        { id: 'c2', text: '진행자의 설명', order: 2 },
        { id: 'c3', text: '제공된 자료', order: 3 },
        { id: 'c4', text: '참가자 간 교류', order: 4 },
        { id: 'c5', text: '장소/환경', order: 5 },
        { id: 'c6', text: '시간 배분', order: 6 }
      ]
    }
  },
  {
    id: 'q10',
    order: 10,
    type: 'text_short',
    text: '가장 인상 깊었던 활동이나 내용은?',
    required: false,
    options: {
      placeholder: '간단히 적어주세요',
      maxLength: 200
    }
  },
  {
    id: 'q11',
    order: 11,
    type: 'text_long',
    text: '더 배우고 싶은 내용이 있다면?',
    required: false,
    options: {
      placeholder: '다음에 다뤘으면 하는 주제나 기술을 적어주세요',
      maxLength: 300,
      rows: 2
    }
  },
  {
    id: 'q12',
    order: 12,
    type: 'text_long',
    text: '개선사항이나 건의사항이 있다면 자유롭게 적어주세요',
    required: false,
    options: {
      placeholder: '소중한 의견을 남겨주세요',
      maxLength: 500,
      rows: 4
    }
  }
]

const templates = [
  {
    name: '독서모임 회차별 기본 템플릿',
    description: '독서모임 각 회차별 만족도 조사에 적합한 템플릿입니다. 8개 질문으로 구성되어 있습니다.',
    category: 'reading_session',
    isDefault: true,
    isPublic: true,
    questions: JSON.stringify({
      version: '1.0',
      type: 'session',
      questions: readingSessionQuestions,
      settings: {
        anonymous: true,
        allowEdit: false,
        showProgress: true
      }
    }),
    settings: JSON.stringify({
      estimatedTime: '2-3분',
      sendReminder: true,
      reminderDays: [1]
    })
  },
  {
    name: '독서모임 시즌별 종합 템플릿',
    description: '독서모임 시즌 종료 시 전체 만족도 조사에 적합한 템플릿입니다. 10개 질문과 보증금 환급 정보를 포함합니다.',
    category: 'reading_program',
    isDefault: true,
    isPublic: true,
    questions: JSON.stringify({
      version: '1.0',
      type: 'program',
      questions: readingProgramQuestions,
      settings: {
        anonymous: true,
        allowEdit: false,
        showProgress: true,
        includeRefund: true
      }
    }),
    settings: JSON.stringify({
      estimatedTime: '5-7분',
      sendReminder: true,
      reminderDays: [3, 1]
    })
  },
  {
    name: '강연/특강 기본 템플릿',
    description: '강연 및 특강 후 만족도 조사에 적합한 템플릿입니다. 8개 질문으로 구성되어 있습니다.',
    category: 'lecture',
    isDefault: true,
    isPublic: true,
    questions: JSON.stringify({
      version: '1.0',
      type: 'session',
      questions: lectureQuestions,
      settings: {
        anonymous: true,
        allowEdit: false,
        showProgress: true
      }
    }),
    settings: JSON.stringify({
      estimatedTime: '2-3분',
      sendReminder: true,
      reminderDays: [1]
    })
  },
  {
    name: '워크샵 기본 템플릿',
    description: '실습 위주 워크샵 만족도 조사에 적합한 템플릿입니다. 12개 질문으로 구성되어 있습니다.',
    category: 'workshop',
    isDefault: true,
    isPublic: true,
    questions: JSON.stringify({
      version: '1.0',
      type: 'session',
      questions: workshopQuestions,
      settings: {
        anonymous: true,
        allowEdit: false,
        showProgress: true
      }
    }),
    settings: JSON.stringify({
      estimatedTime: '3-5분',
      sendReminder: true,
      reminderDays: [1]
    })
  }
]

async function main() {
  console.log('Seeding survey templates...')

  for (const template of templates) {
    const existing = await prisma.surveyTemplate.findFirst({
      where: { name: template.name }
    })

    if (existing) {
      console.log(`  - "${template.name}" already exists, skipping`)
      continue
    }

    await prisma.surveyTemplate.create({
      data: template
    })
    console.log(`  + Created "${template.name}"`)
  }

  console.log('Survey templates seeding completed!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
