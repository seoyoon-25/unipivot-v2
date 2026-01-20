import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

/**
 * 독후감 템플릿 구조 정의
 */
const reportTemplates = [
  {
    code: 'BONGGAEJEOK',
    name: '본깨적 (실천형)',
    description: '자기계발서나 실천 중심의 책에 적합합니다. 책에서 본 것, 깨달은 것, 적용할 것을 정리합니다.',
    category: 'self_development',
    icon: '✅',
    isDefault: true,
    sortOrder: 1,
    structure: JSON.stringify({
      sections: [
        {
          id: 'bon',
          name: '본',
          emoji: '👀',
          title: '본 것 (인상적인 구절)',
          type: 'quote',
          required: true,
          guide: '책에서 가장 인상 깊었던 구절을 적어주세요.',
          fields: [
            { id: 'quote', label: '구절', type: 'textarea', placeholder: '인상 깊은 구절을 적어주세요', required: true },
            { id: 'page', label: '페이지', type: 'text', placeholder: 'p.123', required: false },
            { id: 'reason', label: '선택 이유', type: 'textarea', placeholder: '이 구절을 선택한 이유는?', required: true }
          ]
        },
        {
          id: 'ggae',
          name: '깨',
          emoji: '💡',
          title: '깨달은 것',
          type: 'textarea',
          required: true,
          placeholder: '이 책을 통해 깨달은 점을 적어주세요.',
          guide: '책을 읽으면서 새롭게 알게 된 것, 깨달은 점을 정리해주세요.'
        },
        {
          id: 'jeok',
          name: '적',
          emoji: '✍️',
          title: '적용할 것 (실천 계획)',
          type: 'list',
          required: true,
          multiple: true,
          placeholder: '일상에서 실천할 계획을 적어주세요.',
          guide: '책에서 배운 것을 어떻게 실천할지 구체적으로 작성해주세요.'
        },
        {
          id: 'questions',
          name: '토론 질문',
          emoji: '💬',
          title: '토론 질문 (선택)',
          type: 'questions',
          required: false,
          guide: '모임에서 나누고 싶은 질문을 적어주세요.'
        }
      ]
    })
  },
  {
    code: 'OREO',
    name: 'OREO (비판형)',
    description: '철학/인문서 등 비판적 사고가 필요한 책에 적합합니다. 자신의 의견을 논리적으로 전개합니다.',
    category: 'philosophy',
    icon: '💭',
    isDefault: false,
    sortOrder: 2,
    structure: JSON.stringify({
      sections: [
        {
          id: 'opinion1',
          name: 'Opinion',
          emoji: '🎯',
          title: '의견 (Opinion)',
          type: 'textarea',
          required: true,
          placeholder: '저자의 주장에 대한 당신의 입장은?',
          guide: '책에서 다루는 주요 주장에 대해 동의하시나요? 당신의 입장을 밝혀주세요.'
        },
        {
          id: 'reason',
          name: 'Reason',
          emoji: '🧠',
          title: '이유 (Reason)',
          type: 'list',
          required: true,
          multiple: true,
          placeholder: '그렇게 생각하는 이유는?',
          guide: '왜 그렇게 생각하는지 근거를 들어 설명해주세요.'
        },
        {
          id: 'example',
          name: 'Example',
          emoji: '📖',
          title: '예시 (Example)',
          type: 'quote',
          required: true,
          guide: '책의 구절이나 당신의 경험에서 예시를 찾아주세요.',
          fields: [
            { id: 'quote', label: '책 속 구절 또는 예시', type: 'textarea', placeholder: '근거가 되는 구절이나 경험', required: true },
            { id: 'explanation', label: '설명', type: 'textarea', placeholder: '이 예시가 의견을 뒷받침하는 이유', required: true }
          ]
        },
        {
          id: 'opinion2',
          name: 'Opinion',
          emoji: '✨',
          title: '최종 의견 (Opinion)',
          type: 'textarea',
          required: true,
          placeholder: '결론적으로...',
          guide: '위의 논의를 바탕으로 최종 의견을 정리해주세요.'
        },
        {
          id: 'questions',
          name: '토론 질문',
          emoji: '💬',
          title: '토론 질문',
          type: 'questions',
          required: true,
          guide: '모임에서 논의하고 싶은 질문을 적어주세요.'
        }
      ]
    })
  },
  {
    code: '4F',
    name: '4F (감성형)',
    description: '문학/소설 등 감성적인 책에 적합합니다. 사실, 감정, 발견, 미래를 정리합니다.',
    category: 'literature',
    icon: '❤️',
    isDefault: false,
    sortOrder: 3,
    structure: JSON.stringify({
      sections: [
        {
          id: 'facts',
          name: 'Facts',
          emoji: '📚',
          title: '사실 (Facts)',
          type: 'textarea',
          required: true,
          placeholder: '책의 내용을 요약해주세요.',
          guide: '책에서 다루는 주요 내용, 사건, 인물 등을 정리해주세요.'
        },
        {
          id: 'feelings',
          name: 'Feelings',
          emoji: '💝',
          title: '감정 (Feelings)',
          type: 'emotion',
          required: true,
          guide: '책을 읽으면서 느낀 감정을 선택하고 설명해주세요.',
          options: ['감동', '슬픔', '기쁨', '분노', '불안', '희망', '공감', '놀라움', '그리움', '평온']
        },
        {
          id: 'findings',
          name: 'Findings',
          emoji: '🔍',
          title: '발견 (Findings)',
          type: 'textarea',
          required: true,
          placeholder: '새롭게 발견한 점은?',
          guide: '책을 통해 새롭게 알게 된 것, 깨달은 점을 적어주세요.'
        },
        {
          id: 'future',
          name: 'Future',
          emoji: '🌟',
          title: '미래 (Future)',
          type: 'textarea',
          required: true,
          placeholder: '이 책이 당신의 미래에 어떤 영향을 줄까요?',
          guide: '이 책이 앞으로의 삶에 어떤 영향을 미칠지 생각해보세요.'
        },
        {
          id: 'questions',
          name: '토론 질문',
          emoji: '💬',
          title: '토론 질문',
          type: 'questions',
          required: false,
          guide: '모임에서 나누고 싶은 질문을 적어주세요.'
        }
      ]
    })
  },
  {
    code: 'PMI',
    name: 'PMI (균형형)',
    description: '경영서나 분석이 필요한 책에 적합합니다. 장점, 단점, 흥미로운 점을 균형있게 분석합니다.',
    category: 'business',
    icon: '⚖️',
    isDefault: false,
    sortOrder: 4,
    structure: JSON.stringify({
      sections: [
        {
          id: 'plus',
          name: 'Plus',
          emoji: '➕',
          title: '좋은 점 (Plus)',
          type: 'list',
          required: true,
          multiple: true,
          placeholder: '책의 좋은 점을 적어주세요.',
          guide: '이 책에서 배울 수 있는 점, 동의하는 부분, 강점을 나열해주세요.'
        },
        {
          id: 'minus',
          name: 'Minus',
          emoji: '➖',
          title: '아쉬운 점 (Minus)',
          type: 'list',
          required: true,
          multiple: true,
          placeholder: '책의 아쉬운 점을 적어주세요.',
          guide: '동의하지 않는 부분, 보완이 필요한 점, 한계를 나열해주세요.'
        },
        {
          id: 'interesting',
          name: 'Interesting',
          emoji: '💎',
          title: '흥미로운 점 (Interesting)',
          type: 'list',
          required: true,
          multiple: true,
          placeholder: '새롭거나 흥미로운 관점을 적어주세요.',
          guide: '새로운 시각, 독특한 아이디어, 더 탐구하고 싶은 주제를 적어주세요.'
        },
        {
          id: 'summary',
          name: '종합 의견',
          emoji: '📝',
          title: '종합 의견',
          type: 'textarea',
          required: true,
          placeholder: '전체적인 평가와 의견을 적어주세요.',
          guide: 'Plus, Minus, Interesting를 종합하여 책에 대한 전체적인 의견을 정리해주세요.'
        },
        {
          id: 'questions',
          name: '토론 질문',
          emoji: '💬',
          title: '토론 질문',
          type: 'questions',
          required: false,
          guide: '모임에서 나누고 싶은 질문을 적어주세요.'
        }
      ]
    })
  },
  {
    code: 'FREE',
    name: '자유형식',
    description: '제약 없이 자유롭게 독후감을 작성합니다.',
    category: 'free',
    icon: '✏️',
    isDefault: false,
    sortOrder: 5,
    structure: JSON.stringify({
      sections: [
        {
          id: 'content',
          name: '본문',
          emoji: '📝',
          title: '자유롭게 작성하세요',
          type: 'textarea',
          required: true,
          placeholder: '책을 읽고 느낀 점, 생각, 인상 깊었던 부분 등을 자유롭게 작성해주세요.',
          guide: '형식에 구애받지 않고 자유롭게 작성해주세요.'
        },
        {
          id: 'questions',
          name: '토론 질문',
          emoji: '💬',
          title: '토론 질문 (선택)',
          type: 'questions',
          required: false,
          guide: '모임에서 나누고 싶은 질문을 적어주세요.'
        }
      ]
    })
  }
]

async function seedReportTemplates() {
  console.log('🌱 Seeding report templates...')

  for (const template of reportTemplates) {
    const existing = await prisma.reportTemplate.findUnique({
      where: { code: template.code }
    })

    if (existing) {
      await prisma.reportTemplate.update({
        where: { code: template.code },
        data: template
      })
      console.log(`  ✓ Updated: ${template.name}`)
    } else {
      await prisma.reportTemplate.create({
        data: template
      })
      console.log(`  ✓ Created: ${template.name}`)
    }
  }

  console.log('✅ Report templates seeded successfully!')
}

// Export for use in main seed file
export { seedReportTemplates }

// Run directly if executed as script
if (require.main === module) {
  seedReportTemplates()
    .catch((e) => {
      console.error(e)
      process.exit(1)
    })
    .finally(async () => {
      await prisma.$disconnect()
    })
}
