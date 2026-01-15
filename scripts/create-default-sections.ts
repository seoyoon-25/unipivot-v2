// Script to create default sections for testing
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const defaultSections = [
  {
    sectionKey: 'hero',
    sectionName: 'Hero',
    content: {
      title: '유 니 피 벳',
      subtitle: '남북청년이 함께 새로운 한반도를 만들어갑니다.',
      backgroundImage: '',
      stats: [
        { label: '전체 회원', value: 150, autoCalculate: true },
        { label: '완료된 프로그램', value: 25, autoCalculate: true },
        { label: '총 참여', value: 500, autoCalculate: true }
      ],
      ctaButtons: [
        { text: '프로그램 둘러보기', link: '/programs', variant: 'primary' },
        { text: '유니피벳 소개', link: '/about', variant: 'secondary' }
      ]
    },
    order: 1
  },
  {
    sectionKey: 'uni',
    sectionName: 'UNI',
    content: {
      title: 'UNI의 의미',
      description: '유니피벗의 핵심 가치와 비전을 소개합니다.'
    },
    order: 2
  },
  {
    sectionKey: 'pivot',
    sectionName: 'PIVOT',
    content: {
      title: 'PIVOT의 의미',
      description: '변화와 혁신을 통한 새로운 가치 창출을 추구합니다.'
    },
    order: 3
  },
  {
    sectionKey: 'interests',
    sectionName: '관심사',
    content: {
      title: '관심사 탐색',
      description: '다양한 관심분야를 통해 네트워킹하고 성장하세요.'
    },
    order: 4
  },
  {
    sectionKey: 'programs',
    sectionName: '핵심 프로그램',
    content: {
      title: '핵심 프로그램',
      programTypes: ['BOOKCLUB', 'SEMINAR', 'KMOVE']
    },
    order: 5
  },
  {
    sectionKey: 'lab',
    sectionName: '리서치랩',
    content: {
      title: '리서치랩',
      description: '연구와 인사이트를 통한 사회 기여',
      stats: [
        { label: '연구 프로젝트', value: 12, autoCalculate: false },
        { label: '등록된 전문가', value: 35, autoCalculate: true },
        { label: '발행된 리포트', value: 8, autoCalculate: false }
      ],
      link: '/lab'
    },
    order: 6
  },
  {
    sectionKey: 'story',
    sectionName: 'Our Story',
    content: {
      title: '우리의 이야기',
      content: '유니피벳의 여정과 비전을 소개합니다.',
      image: '',
      stats: [
        { label: '창립연도', value: 2020 },
        { label: '참여청년', value: 500, autoCalculate: true }
      ]
    },
    order: 7
  },
  {
    sectionKey: 'recent',
    sectionName: '진행중 프로그램',
    content: {
      title: '진행중인 프로그램',
      displayCount: 6
    },
    order: 8
  },
  {
    sectionKey: 'instagram',
    sectionName: 'Instagram',
    content: {
      account: 'unipivot.kr',
      link: 'https://www.instagram.com/unipivot.kr'
    },
    order: 9
  },
  {
    sectionKey: 'footer',
    sectionName: 'Footer',
    content: {
      organizationName: '(사)유니피벳',
      representative: '대표자명',
      businessNumber: '123-45-67890',
      address: '서울특별시 종로구 청와대로 1',
      phone: '02-1234-5678',
      email: 'contact@unipivot.kr',
      businessHours: '평일 09:00-18:00',
      socialLinks: {
        instagram: 'https://www.instagram.com/unipivot.kr',
        youtube: 'https://www.youtube.com/@unipivot',
        linkedin: '',
        facebook: ''
      }
    },
    order: 10
  }
]

async function main() {
  console.log('Creating default sections...')

  try {
    // Delete existing sections first
    await prisma.siteSection.deleteMany({})
    console.log('Deleted existing sections')

    // Create new sections
    for (const sectionData of defaultSections) {
      const section = await prisma.siteSection.create({
        data: sectionData
      })
      console.log(`Created section: ${section.sectionName} (${section.sectionKey})`)
    }

    console.log('✅ All default sections created successfully!')

    // Print summary
    const count = await prisma.siteSection.count()
    console.log(`\nTotal sections: ${count}`)

  } catch (error) {
    console.error('❌ Error creating sections:', error)
    throw error
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })