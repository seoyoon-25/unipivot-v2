import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const pageSections = [
  {
    sectionKey: 'page.about',
    sectionName: '소개 페이지',
    content: {
      hero: {
        badge: 'About Us',
        title: '유니피벗 소개',
        subtitle: '남북청년이 함께 새로운 한반도를 만들어갑니다',
      },
      stats: [
        { label: '창립연도', value: '2019', icon: 'Calendar' },
        { label: '참여 청년', value: '500+', icon: 'Users' },
        { label: '프로그램', value: '50+', icon: 'Target' },
        { label: '후원자', value: '100+', icon: 'Heart' },
      ],
      mission: {
        badge: 'Our Mission',
        title: '우리의 미션',
        paragraphs: [
          '유니피벗은 <strong>남북 청년들의 만남과 대화</strong>를 통해 한반도의 평화로운 미래를 준비하는 비영리 단체입니다.',
          '우리는 분단으로 인해 서로를 모르고 자란 남북의 청년들이 함께 책을 읽고, 토론하고, 교류하며 <strong>서로를 이해</strong>할 수 있는 공간을 만듭니다.',
          '언젠가 다가올 통일의 날, 우리는 이미 준비되어 있을 것입니다.',
        ],
        logoText: 'UNITE + PIVOT',
        logoSubtext: '하나됨 + 전환',
      },
      values: {
        badge: 'Our Values',
        title: '핵심 가치',
        items: [
          {
            title: '연결',
            description: '분단의 경계를 넘어 남북 청년이 하나로 연결됩니다.',
            icon: '🤝',
          },
          {
            title: '성장',
            description: '함께 배우고 토론하며 서로의 시각을 넓혀갑니다.',
            icon: '🌱',
          },
          {
            title: '변화',
            description: '작은 만남이 모여 한반도의 미래를 바꿉니다.',
            icon: '✨',
          },
        ],
      },
      cta: {
        title: '함께 만들어가는 한반도',
        subtitle: '유니피벗과 함께 새로운 한반도의 미래를 준비하세요',
        primaryButton: { text: '회원가입', link: '/register' },
        secondaryButton: { text: '후원하기', link: '/donate' },
      },
    },
    order: 100,
    isVisible: true,
  },
  {
    sectionKey: 'page.donate',
    sectionName: '후원 페이지',
    content: {
      hero: {
        badge: 'Donate',
        title: '후원하기',
        subtitle: '여러분의 후원이 남북청년의 만남을 가능하게 합니다',
      },
      monthly: {
        title: '정기 후원',
        description: '매월 정기적인 후원으로 유니피벗의 안정적인 운영을 도와주세요',
        buttonText: '정기 후원 문의하기',
        buttonLink: '/contact',
      },
      taxInfo: {
        title: '세액공제 안내',
        description: '사단법인 유니피벗에 대한 후원금은 소득세법에 따라 연말정산 시 세액공제 혜택을 받으실 수 있습니다.',
        contactLabel: '기부금 영수증 문의',
        contactEmail: 'unipivot@unipivot.org',
      },
    },
    order: 101,
    isVisible: true,
  },
  {
    sectionKey: 'page.programs',
    sectionName: '프로그램 목록 헤더',
    content: {
      hero: {
        badge: 'Programs',
        title: '프로그램',
        subtitle: '유니피벗과 함께하는 다양한 프로그램을 만나보세요',
      },
    },
    order: 102,
    isVisible: true,
  },
  {
    sectionKey: 'page.blog',
    sectionName: '블로그 헤더',
    content: {
      hero: {
        badge: 'Blog',
        title: '블로그',
        subtitle: '유니피벗의 이야기와 인사이트를 공유합니다',
      },
    },
    order: 103,
    isVisible: true,
  },
  {
    sectionKey: 'page.notice',
    sectionName: '공지사항 헤더',
    content: {
      hero: {
        badge: 'Notice',
        title: '공지사항',
        subtitle: '유니피벗의 소식과 안내사항을 확인하세요',
      },
    },
    order: 104,
    isVisible: true,
  },
]

async function main() {
  console.log('Creating page sections...')

  for (const section of pageSections) {
    const existing = await prisma.siteSection.findUnique({
      where: { sectionKey: section.sectionKey },
    })

    if (existing) {
      console.log(`Section ${section.sectionKey} already exists, updating...`)
      await prisma.siteSection.update({
        where: { sectionKey: section.sectionKey },
        data: section,
      })
    } else {
      console.log(`Creating section ${section.sectionKey}...`)
      await prisma.siteSection.create({
        data: section,
      })
    }
  }

  console.log('Done!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
