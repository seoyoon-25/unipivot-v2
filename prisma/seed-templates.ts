import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// 본깨적 템플릿 (20분)
const bongaeTemplate = {
  name: '본깨적',
  code: 'BONGAE',
  description: '본 것, 깨달은 것, 적용할 것을 정리하는 템플릿',
  category: 'BOOK_REPORT',
  icon: '📖',
  estimatedMinutes: 20,
  structure: JSON.stringify({
    totalEstimatedMinutes: 20,
    sections: [
      {
        id: 'observed',
        emoji: '📖',
        label: '본 (본 것)',
        description: '핵심만 간단히!',
        type: 'textarea',
        placeholder: '가장 인상 깊었던 구절 1-2개\n또는\n핵심 메시지 1-2가지',
        minLength: 100,
        maxLength: 200,
        required: true,
        estimatedMinutes: 5,
        guide: '완벽하게 쓰려 하지 마세요. 핵심만!'
      },
      {
        id: 'realized',
        emoji: '💡',
        label: '깨 (깨달은 것)',
        description: '내 생각, 솔직하게',
        type: 'textarea',
        placeholder: '아래 중 1-2개만 선택:\n□ 공감되는 부분\n□ 새롭게 알게 된 것\n□ 내 경험과 비슷한 점\n□ 의문이 드는 부분',
        minLength: 150,
        maxLength: 300,
        required: true,
        estimatedMinutes: 7
      },
      {
        id: 'action',
        emoji: '✅',
        label: '적 (적용할 것)',
        description: '이번 주 실천할 것',
        type: 'textarea',
        placeholder: "구체적으로 1-2가지만!\n예: '이번 주 매일 아침 10분 명상'",
        minLength: 50,
        maxLength: 150,
        required: true,
        estimatedMinutes: 3
      },
      {
        id: 'questions',
        emoji: '❓',
        label: '토론 질문',
        description: '진짜 궁금한 것만',
        type: 'list',
        itemType: 'text',
        minItems: 2,
        maxItems: 5,
        placeholder: '토론 질문을 입력하세요',
        required: true,
        estimatedMinutes: 5
      }
    ]
  }),
  fields: JSON.stringify({
    totalEstimatedMinutes: 20,
    sections: [
      {
        id: 'observed',
        emoji: '📖',
        label: '본 (본 것)',
        description: '핵심만 간단히!',
        type: 'textarea',
        placeholder: '가장 인상 깊었던 구절 1-2개\n또는\n핵심 메시지 1-2가지',
        minLength: 100,
        maxLength: 200,
        required: true,
        estimatedMinutes: 5,
        guide: '완벽하게 쓰려 하지 마세요. 핵심만!'
      },
      {
        id: 'realized',
        emoji: '💡',
        label: '깨 (깨달은 것)',
        description: '내 생각, 솔직하게',
        type: 'textarea',
        placeholder: '아래 중 1-2개만 선택:\n□ 공감되는 부분\n□ 새롭게 알게 된 것\n□ 내 경험과 비슷한 점\n□ 의문이 드는 부분',
        minLength: 150,
        maxLength: 300,
        required: true,
        estimatedMinutes: 7
      },
      {
        id: 'action',
        emoji: '✅',
        label: '적 (적용할 것)',
        description: '이번 주 실천할 것',
        type: 'textarea',
        placeholder: "구체적으로 1-2가지만!\n예: '이번 주 매일 아침 10분 명상'",
        minLength: 50,
        maxLength: 150,
        required: true,
        estimatedMinutes: 3
      },
      {
        id: 'questions',
        emoji: '❓',
        label: '토론 질문',
        description: '진짜 궁금한 것만',
        type: 'list',
        itemType: 'text',
        minItems: 2,
        maxItems: 5,
        placeholder: '토론 질문을 입력하세요',
        required: true,
        estimatedMinutes: 5
      }
    ]
  }),
  isDefault: true,
  isActive: true,
  sortOrder: 1
}

// 질문 중심형 템플릿 (15분)
const questionTemplate = {
  name: '질문 중심형',
  code: 'QUESTION',
  description: '질문과 답변 중심으로 정리하는 템플릿',
  category: 'BOOK_REPORT',
  icon: '🎯',
  estimatedMinutes: 15,
  structure: JSON.stringify({
    totalEstimatedMinutes: 15,
    sections: [
      {
        id: 'summary',
        emoji: '💡',
        label: '한 줄 요약',
        type: 'text',
        placeholder: '이 책은 ____에 대한 책이다',
        maxLength: 100,
        required: true,
        estimatedMinutes: 2
      },
      {
        id: 'questions_and_answers',
        emoji: '🎯',
        label: '핵심 질문 3개 + 내 답',
        description: '저자에게 묻고 싶거나 토론하고 싶은 것',
        type: 'qa_list',
        minItems: 3,
        maxItems: 3,
        required: true,
        estimatedMinutes: 10,
        fields: [
          {
            id: 'question',
            label: '질문',
            type: 'text',
            placeholder: '질문을 입력하세요',
            required: true
          },
          {
            id: 'answer',
            label: '내 생각',
            type: 'textarea',
            placeholder: '내 생각을 50-100자로',
            minLength: 50,
            maxLength: 100,
            required: true
          }
        ]
      },
      {
        id: 'action',
        emoji: '✅',
        label: '적용 (선택사항)',
        type: 'text',
        placeholder: '실천할 것이 있다면...',
        maxLength: 50,
        required: false,
        estimatedMinutes: 2
      }
    ]
  }),
  fields: JSON.stringify({
    totalEstimatedMinutes: 15,
    sections: [
      {
        id: 'summary',
        emoji: '💡',
        label: '한 줄 요약',
        type: 'text',
        placeholder: '이 책은 ____에 대한 책이다',
        maxLength: 100,
        required: true,
        estimatedMinutes: 2
      },
      {
        id: 'questions_and_answers',
        emoji: '🎯',
        label: '핵심 질문 3개 + 내 답',
        description: '저자에게 묻고 싶거나 토론하고 싶은 것',
        type: 'qa_list',
        minItems: 3,
        maxItems: 3,
        required: true,
        estimatedMinutes: 10,
        fields: [
          {
            id: 'question',
            label: '질문',
            type: 'text',
            placeholder: '질문을 입력하세요',
            required: true
          },
          {
            id: 'answer',
            label: '내 생각',
            type: 'textarea',
            placeholder: '내 생각을 50-100자로',
            minLength: 50,
            maxLength: 100,
            required: true
          }
        ]
      },
      {
        id: 'action',
        emoji: '✅',
        label: '적용 (선택사항)',
        type: 'text',
        placeholder: '실천할 것이 있다면...',
        maxLength: 50,
        required: false,
        estimatedMinutes: 2
      }
    ]
  }),
  isDefault: false,
  isActive: true,
  sortOrder: 2
}

// 간단형 템플릿 (10분)
const simpleTemplate = {
  name: '간단형',
  code: 'SIMPLE',
  description: '간단하게 감상을 정리하는 템플릿',
  category: 'BOOK_REPORT',
  icon: '✍️',
  estimatedMinutes: 10,
  structure: JSON.stringify({
    totalEstimatedMinutes: 10,
    sections: [
      {
        id: 'rating',
        emoji: '⭐',
        label: '별점',
        type: 'rating',
        minValue: 1,
        maxValue: 5,
        required: true,
        estimatedMinutes: 1
      },
      {
        id: 'oneline',
        emoji: '✍️',
        label: '한 줄 평',
        type: 'text',
        placeholder: '이 책을 한 문장으로 표현한다면?',
        maxLength: 100,
        required: true,
        estimatedMinutes: 2
      },
      {
        id: 'reflection',
        emoji: '💬',
        label: '감상',
        description: '솔직하게!',
        type: 'textarea',
        placeholder: '• 좋았던 점\n• 아쉬웠던 점\n• 추천 대상',
        minLength: 100,
        maxLength: 200,
        required: true,
        estimatedMinutes: 5
      },
      {
        id: 'quote',
        emoji: '💡',
        label: '기억에 남는 구절',
        type: 'text',
        placeholder: '인상 깊었던 구절 하나',
        maxLength: 200,
        required: false,
        estimatedMinutes: 1
      },
      {
        id: 'question',
        emoji: '❓',
        label: '토론 질문',
        type: 'text',
        placeholder: '함께 이야기 나누고 싶은 질문',
        maxLength: 200,
        required: true,
        estimatedMinutes: 2
      }
    ]
  }),
  fields: JSON.stringify({
    totalEstimatedMinutes: 10,
    sections: [
      {
        id: 'rating',
        emoji: '⭐',
        label: '별점',
        type: 'rating',
        minValue: 1,
        maxValue: 5,
        required: true,
        estimatedMinutes: 1
      },
      {
        id: 'oneline',
        emoji: '✍️',
        label: '한 줄 평',
        type: 'text',
        placeholder: '이 책을 한 문장으로 표현한다면?',
        maxLength: 100,
        required: true,
        estimatedMinutes: 2
      },
      {
        id: 'reflection',
        emoji: '💬',
        label: '감상',
        description: '솔직하게!',
        type: 'textarea',
        placeholder: '• 좋았던 점\n• 아쉬웠던 점\n• 추천 대상',
        minLength: 100,
        maxLength: 200,
        required: true,
        estimatedMinutes: 5
      },
      {
        id: 'quote',
        emoji: '💡',
        label: '기억에 남는 구절',
        type: 'text',
        placeholder: '인상 깊었던 구절 하나',
        maxLength: 200,
        required: false,
        estimatedMinutes: 1
      },
      {
        id: 'question',
        emoji: '❓',
        label: '토론 질문',
        type: 'text',
        placeholder: '함께 이야기 나누고 싶은 질문',
        maxLength: 200,
        required: true,
        estimatedMinutes: 2
      }
    ]
  }),
  isDefault: false,
  isActive: true,
  sortOrder: 3
}

async function main() {
  console.log('🌱 템플릿 시딩 시작...')

  // 기존 템플릿 삭제 (중복 방지)
  await prisma.reportTemplate.deleteMany({
    where: {
      code: {
        in: ['BONGAE', 'QUESTION', 'SIMPLE']
      }
    }
  })

  // 템플릿 생성
  const templates = [bongaeTemplate, questionTemplate, simpleTemplate]

  for (const template of templates) {
    const created = await prisma.reportTemplate.create({
      data: template
    })
    console.log(`✅ 템플릿 생성됨: ${created.name} (${created.code})`)
  }

  console.log('\n🎉 템플릿 시딩 완료!')
  console.log('총 3개의 템플릿이 생성되었습니다:')
  console.log('  1. 본깨적 (20분)')
  console.log('  2. 질문 중심형 (15분)')
  console.log('  3. 간단형 (10분)')
}

main()
  .catch((e) => {
    console.error('❌ 시딩 실패:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
