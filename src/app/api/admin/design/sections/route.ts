import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

// GET - List all site sections
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ error: '권한이 없습니다' }, { status: 403 })
    }

    const sections = await prisma.siteSection.findMany({
      orderBy: { order: 'asc' },
    })

    return NextResponse.json({ sections })
  } catch (error) {
    console.error('Get sections error:', error)
    return NextResponse.json(
      { error: '섹션 조회 중 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}

// POST - Create default sections if they don't exist
export async function POST() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: '슈퍼 관리자 권한이 필요합니다' }, { status: 403 })
    }

    // Default sections configuration
    const defaultSections = [
      {
        sectionKey: 'hero',
        sectionName: 'Hero',
        content: {
          title: '유 니 피 벗',
          subtitle: '남북청년이 함께 새로운 한반도를 만들어갑니다.',
          backgroundImage: '',
          stats: [
            { label: '전체 회원', value: 0, autoCalculate: true },
            { label: '완료된 프로그램', value: 0, autoCalculate: true },
            { label: '총 참여', value: 0, autoCalculate: true }
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
            { label: '연구 프로젝트', value: 0, autoCalculate: false },
            { label: '등록된 전문가', value: 0, autoCalculate: true },
            { label: '발행된 리포트', value: 0, autoCalculate: false }
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
            { label: '참여청년', value: 0, autoCalculate: true }
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
          organizationName: '(사)유니피벗',
          representative: '대표자명',
          businessNumber: '사업자등록번호',
          address: '서울특별시 주소',
          phone: '02-0000-0000',
          email: 'contact@unipivot.kr',
          businessHours: '평일 09:00-18:00',
          socialLinks: {
            instagram: 'https://www.instagram.com/unipivot.kr',
            youtube: '',
            linkedin: '',
            facebook: ''
          }
        },
        order: 10
      },
      // Page Sections
      {
        sectionKey: 'page.about-us',
        sectionName: '단체 소개',
        content: {
          images: {
            about: [
              'https://cdn.imweb.me/thumbnail/20230611/9837611e1ecc4.jpg',
              'https://cdn.imweb.me/thumbnail/20230611/ff3fae27e81d6.jpg',
              'https://cdn.imweb.me/thumbnail/20230611/38424c39d1b97.jpg',
            ],
            vision: 'https://cdn.imweb.me/thumbnail/20230722/8e44d28325321.png',
          },
          about: {
            title: '유니피벗은 어떤 곳인가요?',
            paragraphs: [
              '유니피벗은 남북청년이 수평적으로 만나 성장하고 협력하여 더 나은 나, 공동체, 대한민국을 만들어 가기 위해 2015년 남북한걸음으로 시작되었습니다.',
              '남북청년 뿐만 아니라 유니피벗이 추구하는 방향에 대해 공감하는 사람이라면 인종, 성별, 나이, 국적, 종교, 성적지향과 무관하게 모두와 함께합니다.',
              '유니피벗은 비정치적, 비종교적이며 우리 사회의 다양한 구성원들과 연대하여 분단체제를 해체하고 분단으로 인해 생긴 상처를 치유하고 회복하여 남북이 함께 살기 좋은 새로운 한반도를 만들어가고자 합니다.',
              '새로운 한반도는 분단된 한반도가 아닌 회복과 통합의 한반도로서 남북청년이 함께 만들어나가야 하며 이를 위해 남북청년이 함께 성장하고 소통하며 새로운 한반도의 리더로 자리매김하고자 합니다.',
              '남북청년의 성장을 위해 인문, 사회, 경제, 역사 과학, 철학, 환경, 젠더 등 다양한 주제로 독서모임과 강연프로그램을 꾸준히 운영하고 있습니다. 이와 더불어 남북청년의 교류를 위해 등산, 클라이밍, 볼링, 스키, 캠핑 등 다양한 스포츠 모임과, 전시회관람, 영화관람 등 문화활동을 병행하고 있습니다.',
              '앞으로 활동의 범위에 제한하지 않고 유니피벗의 비전과 일치하는 활동을 계획하는 회원들을 지원하여 더 많은 사람들이 한반도 분단 체제를 해체하는 활동에 참여할 수 있도록 지원하고자 합니다.',
            ],
          },
          vision: {
            title: '유니피벗이 추구하는 가치',
          },
        },
        order: 11
      },
      {
        sectionKey: 'page.history',
        sectionName: '연혁',
        content: {
          images: {
            background: 'https://cdn.imweb.me/thumbnail/20230722/7444706724935.jpg',
          },
          hero: {
            title: '유니피벗이 걸어온 여정',
            subtitle: '남북청년이 함께 만들어가는 새로운 한반도',
          },
          timeline: {
            items: [
              { year: '2015', title: '남북한걸음 시작', description: '남북 청년들의 첫 만남의 장을 열다' },
              { year: '2018', title: 'K-MOVE 시작', description: '해외 취업 지원 프로그램 런칭' },
              { year: '2023', title: '유니피벗으로 명칭 변경', description: 'UNITE + PIVOT의 의미를 담아 새롭게 출발' },
              { year: '2024', title: '비영리민간단체 등록', description: '통일부 산하 비영리민간단체로 공식 등록' },
            ],
          },
        },
        order: 12
      }
    ]

    // Create sections only if they don't exist
    const createdSections = []

    for (const sectionData of defaultSections) {
      const existing = await prisma.siteSection.findUnique({
        where: { sectionKey: sectionData.sectionKey }
      })

      if (!existing) {
        const created = await prisma.siteSection.create({
          data: {
            ...sectionData,
            content: JSON.stringify(sectionData.content)
          }
        })
        createdSections.push(created)
      }
    }

    return NextResponse.json({
      success: true,
      created: createdSections.length,
      sections: createdSections
    })
  } catch (error) {
    console.error('Create sections error:', error)
    return NextResponse.json(
      { error: '섹션 생성 중 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}