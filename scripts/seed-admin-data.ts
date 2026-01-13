import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding admin test data...')

  // Get admin user
  const adminUser = await prisma.user.findFirst({
    where: { role: 'ADMIN' },
  })
  if (!adminUser) {
    throw new Error('Admin user not found')
  }
  console.log(`Using admin user: ${adminUser.email}`)

  // 1. Blog Posts
  console.log('Creating blog posts...')
  const blogPosts = await Promise.all([
    prisma.blogPost.create({
      data: {
        title: '2024년 하반기 프로그램 안내',
        slug: 'program-guide-2024-h2',
        content: '2024년 하반기에 진행되는 다양한 프로그램을 소개합니다.\n\n## 주요 프로그램\n\n1. **취업 지원 프로그램** - 이력서 작성부터 면접 준비까지\n2. **창업 교육** - 사업 아이디어 발굴과 사업계획서 작성\n3. **네트워킹 행사** - 현직자와의 만남\n\n많은 참여 부탁드립니다.',
        excerpt: '2024년 하반기 프로그램 일정과 참가 방법을 안내합니다.',
        category: 'NOTICE',
        isPublished: true,
        authorId: adminUser.id,
      },
    }),
    prisma.blogPost.create({
      data: {
        title: '성공적인 취업 면접 준비 가이드',
        slug: 'interview-preparation-guide',
        content: '취업 면접을 앞두고 있다면 이 가이드를 참고하세요.\n\n## 면접 전 준비사항\n\n- 회사 정보 조사\n- 예상 질문 리스트 작성\n- 자기소개 연습\n\n## 면접 당일\n\n- 정장 착용\n- 10분 전 도착\n- 긍정적인 마인드',
        excerpt: '면접 준비의 A to Z를 알려드립니다.',
        category: 'GUIDE',
        isPublished: true,
        authorId: adminUser.id,
      },
    }),
    prisma.blogPost.create({
      data: {
        title: '창업 성공 사례: 스타트업 A사 이야기',
        slug: 'startup-success-story-a',
        content: '창업 프로그램을 통해 성공적으로 사업을 시작한 A사의 이야기를 들어봅니다.\n\n아이디어 발굴부터 투자 유치까지의 여정을 공유합니다.',
        excerpt: '창업 프로그램 수료생의 성공 스토리',
        category: 'STORY',
        isPublished: false,
        authorId: adminUser.id,
      },
    }),
  ])
  console.log(`Created ${blogPosts.length} blog posts`)

  // 2. Banners
  console.log('Creating banners...')
  const banners = await Promise.all([
    prisma.banner.create({
      data: {
        title: '2024 취업박람회 개최',
        subtitle: '100개 기업 참여, 현장 면접 기회',
        position: 'HERO',
        image: '/images/banners/job-fair-2024.jpg',
        link: '/programs',
        order: 1,
        isActive: true,
      },
    }),
    prisma.banner.create({
      data: {
        title: '창업 지원 프로그램 모집',
        subtitle: '예비 창업자를 위한 멘토링과 공간 지원',
        position: 'HERO',
        image: '/images/banners/startup-program.jpg',
        link: '/programs',
        order: 2,
        isActive: true,
      },
    }),
    prisma.banner.create({
      data: {
        title: '후원 안내',
        subtitle: '여러분의 후원이 청년들의 미래를 바꿉니다',
        position: 'SIDEBAR',
        image: '/images/banners/donation.jpg',
        link: '/donate',
        order: 1,
        isActive: true,
      },
    }),
  ])
  console.log(`Created ${banners.length} banners`)

  // 3. Menus
  console.log('Creating menus...')
  const headerMenu1 = await prisma.menu.create({
    data: {
      title: '프로그램',
      url: '/programs',
      location: 'HEADER',
      position: 1,
      isActive: true,
    },
  })
  const headerMenu2 = await prisma.menu.create({
    data: {
      title: '소개',
      url: '/about',
      location: 'HEADER',
      position: 2,
      isActive: true,
    },
  })
  await prisma.menu.createMany({
    data: [
      { title: '취업 프로그램', url: '/programs?type=EMPLOYMENT', location: 'HEADER', parentId: headerMenu1.id, position: 1, isActive: true },
      { title: '창업 프로그램', url: '/programs?type=STARTUP', location: 'HEADER', parentId: headerMenu1.id, position: 2, isActive: true },
      { title: '교육 프로그램', url: '/programs?type=EDUCATION', location: 'HEADER', parentId: headerMenu1.id, position: 3, isActive: true },
      { title: '기관 소개', url: '/about', location: 'HEADER', parentId: headerMenu2.id, position: 1, isActive: true },
      { title: '연혁', url: '/about/history', location: 'HEADER', parentId: headerMenu2.id, position: 2, isActive: true },
      { title: '이용약관', url: '/terms', location: 'FOOTER', position: 1, isActive: true },
      { title: '개인정보처리방침', url: '/privacy', location: 'FOOTER', position: 2, isActive: true },
      { title: '문의하기', url: '/contact', location: 'FOOTER', position: 3, isActive: true },
    ],
  })
  console.log('Created menus')

  // 4. Partners
  console.log('Creating partners...')
  const partners = await Promise.all([
    prisma.partner.create({
      data: {
        name: '고용노동부',
        type: 'GOVERNMENT',
        description: '대한민국 고용노동 정책을 총괄하는 정부기관',
        email: 'contact@moel.go.kr',
      },
    }),
    prisma.partner.create({
      data: {
        name: '한국산업인력공단',
        type: 'GOVERNMENT',
        description: '국가기술자격 및 직업능력개발 전문기관',
        email: 'contact@hrdkorea.or.kr',
      },
    }),
    prisma.partner.create({
      data: {
        name: '삼성전자',
        type: 'CORPORATION',
        description: '글로벌 IT 기업',
        contact: '채용담당팀',
      },
    }),
    prisma.partner.create({
      data: {
        name: '서울대학교',
        type: 'ACADEMIC',
        description: '대한민국 대표 국립대학교',
        contact: '산학협력단',
      },
    }),
    prisma.partner.create({
      data: {
        name: '카카오',
        type: 'CORPORATION',
        description: '대한민국 대표 IT 플랫폼 기업',
        email: 'recruit@kakaocorp.com',
      },
    }),
  ])
  console.log(`Created ${partners.length} partners`)

  // 5. Projects
  console.log('Creating projects...')
  const projects = await Promise.all([
    prisma.project.create({
      data: {
        title: '2024 청년 취업 지원 사업',
        description: '청년층의 취업 역량 강화 및 일자리 연계를 위한 종합 지원 사업입니다.',
        status: 'IN_PROGRESS',
        startDate: new Date('2024-03-01'),
        endDate: new Date('2024-12-31'),
        budget: 500000000,
        partners: {
          create: [
            { partnerId: partners[0].id, role: '주관기관' },
            { partnerId: partners[1].id, role: '협력기관' },
          ],
        },
      },
    }),
    prisma.project.create({
      data: {
        title: '창업 인큐베이팅 프로그램',
        description: '예비 창업자를 위한 멘토링, 교육, 사무공간 지원 프로그램',
        status: 'IN_PROGRESS',
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-06-30'),
        budget: 200000000,
        partners: {
          create: [
            { partnerId: partners[2].id, role: '후원사' },
            { partnerId: partners[4].id, role: '후원사' },
          ],
        },
      },
    }),
    prisma.project.create({
      data: {
        title: '산학협력 인턴십 연계',
        description: '대학과 기업 간 인턴십 연계 프로젝트',
        status: 'PLANNING',
        startDate: new Date('2025-01-01'),
        endDate: new Date('2025-12-31'),
        budget: 300000000,
        partners: {
          create: [
            { partnerId: partners[3].id, role: '참여기관' },
          ],
        },
      },
    }),
    prisma.project.create({
      data: {
        title: '2023 직업훈련 프로그램',
        description: '구직자 대상 직업능력개발 훈련 사업',
        status: 'COMPLETED',
        startDate: new Date('2023-01-01'),
        endDate: new Date('2023-12-31'),
        budget: 450000000,
      },
    }),
  ])
  console.log(`Created ${projects.length} projects`)

  // 6. Calendar Events
  console.log('Creating calendar events...')
  const now = new Date()
  const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  await prisma.calendarEvent.createMany({
    data: [
      {
        title: '월간 정기 회의',
        description: '월간 사업 진행 상황 점검 및 계획 수립',
        type: 'MEETING',
        startDate: new Date(thisMonth.getFullYear(), thisMonth.getMonth(), 10, 10, 0),
        endDate: new Date(thisMonth.getFullYear(), thisMonth.getMonth(), 10, 12, 0),
        location: '본사 대회의실',
        projectId: projects[0].id,
      },
      {
        title: '취업박람회',
        description: '2024년 상반기 대규모 취업박람회',
        type: 'EVENT',
        startDate: new Date(thisMonth.getFullYear(), thisMonth.getMonth(), 15, 9, 0),
        endDate: new Date(thisMonth.getFullYear(), thisMonth.getMonth(), 16, 18, 0),
        location: 'COEX 전시장',
        projectId: projects[0].id,
      },
      {
        title: '사업계획서 제출 마감',
        description: '2025년도 사업계획서 제출 마감일',
        type: 'DEADLINE',
        startDate: new Date(thisMonth.getFullYear(), thisMonth.getMonth(), 20),
        allDay: true,
      },
      {
        title: '창업 멘토링 세션',
        description: '예비 창업자 대상 1:1 멘토링',
        type: 'MEETING',
        startDate: new Date(thisMonth.getFullYear(), thisMonth.getMonth(), 25, 14, 0),
        endDate: new Date(thisMonth.getFullYear(), thisMonth.getMonth(), 25, 17, 0),
        location: '창업지원센터 3층',
        projectId: projects[1].id,
      },
      {
        title: '네트워킹 데이',
        description: '협력기관 및 수료생 네트워킹 행사',
        type: 'EVENT',
        startDate: new Date(thisMonth.getFullYear(), thisMonth.getMonth() + 1, 5, 18, 0),
        endDate: new Date(thisMonth.getFullYear(), thisMonth.getMonth() + 1, 5, 21, 0),
        location: '그랜드 호텔 연회장',
      },
    ],
  })
  console.log('Created calendar events')

  // 7. Documents
  console.log('Creating documents...')
  await prisma.document.createMany({
    data: [
      {
        title: '2024년도 사업계획서',
        type: 'PROPOSAL',
        filePath: '/documents/2024-business-plan.pdf',
        fileSize: 2500000,
        projectId: projects[0].id,
      },
      {
        title: '1분기 실적 보고서',
        type: 'REPORT',
        filePath: '/documents/2024-q1-report.pdf',
        fileSize: 1800000,
        projectId: projects[0].id,
      },
      {
        title: '협력기관 MOU 계약서',
        type: 'CONTRACT',
        filePath: '/documents/mou-contract.pdf',
        fileSize: 500000,
        projectId: projects[0].id,
      },
      {
        title: '3월 정기회의 회의록',
        type: 'MEETING',
        filePath: '/documents/meeting-march.docx',
        fileSize: 350000,
        projectId: projects[0].id,
      },
      {
        title: '창업 프로그램 커리큘럼',
        type: 'OTHER',
        filePath: '/documents/startup-curriculum.xlsx',
        fileSize: 120000,
        projectId: projects[1].id,
      },
    ],
  })
  console.log('Created documents')

  console.log('\nTest data seeding completed!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
