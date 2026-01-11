import { PrismaClient } from '@prisma/client'
import { hash } from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('샘플 데이터 생성 시작...')

  // 1. 샘플 회원 생성
  console.log('회원 데이터 생성 중...')
  const hashedPassword = await hash('test1234', 12)

  const users = await Promise.all([
    prisma.user.upsert({
      where: { email: 'chulsu@example.com' },
      update: {},
      create: {
        email: 'chulsu@example.com',
        name: '김철수',
        password: hashedPassword,
        origin: 'SOUTH',
        phone: '010-1234-5678',
        birthYear: 1995,
        occupation: '대학생',
        bio: '통일에 관심이 많은 대학생입니다.',
        points: 150,
        status: 'ACTIVE'
      }
    }),
    prisma.user.upsert({
      where: { email: 'younghee@example.com' },
      update: {},
      create: {
        email: 'younghee@example.com',
        name: '이영희',
        password: hashedPassword,
        origin: 'NORTH',
        phone: '010-2345-6789',
        birthYear: 1998,
        occupation: '사회복지사',
        bio: '탈북민으로서 남북 청년 교류에 힘쓰고 있습니다.',
        points: 320,
        status: 'ACTIVE'
      }
    }),
    prisma.user.upsert({
      where: { email: 'minsu@example.com' },
      update: {},
      create: {
        email: 'minsu@example.com',
        name: '박민수',
        password: hashedPassword,
        origin: 'SOUTH',
        phone: '010-3456-7890',
        birthYear: 1992,
        occupation: '직장인',
        bio: '독서모임을 통해 다양한 관점을 배우고 싶습니다.',
        points: 280,
        status: 'ACTIVE'
      }
    }),
    prisma.user.upsert({
      where: { email: 'jiyeon@example.com' },
      update: {},
      create: {
        email: 'jiyeon@example.com',
        name: '최지연',
        password: hashedPassword,
        origin: 'OVERSEAS',
        phone: '010-4567-8901',
        birthYear: 1997,
        occupation: '유학생',
        bio: '해외에서 한반도 문제에 관심을 갖게 되었습니다.',
        points: 100,
        status: 'ACTIVE'
      }
    }),
    prisma.user.upsert({
      where: { email: 'miyoung@example.com' },
      update: {},
      create: {
        email: 'miyoung@example.com',
        name: '정미영',
        password: hashedPassword,
        origin: 'NORTH',
        phone: '010-5678-9012',
        birthYear: 1994,
        occupation: '프리랜서',
        bio: '남북 청년들의 소통을 돕고 싶습니다.',
        points: 450,
        status: 'ACTIVE'
      }
    }),
    prisma.user.upsert({
      where: { email: 'dongwon@example.com' },
      update: {},
      create: {
        email: 'dongwon@example.com',
        name: '한동원',
        password: hashedPassword,
        origin: 'SOUTH',
        phone: '010-6789-0123',
        birthYear: 1990,
        occupation: 'NGO 활동가',
        bio: '평화 통일을 위해 일하고 있습니다.',
        points: 520,
        status: 'ACTIVE'
      }
    }),
    prisma.user.upsert({
      where: { email: 'soojin@example.com' },
      update: {},
      create: {
        email: 'soojin@example.com',
        name: '김수진',
        password: hashedPassword,
        origin: 'SOUTH',
        birthYear: 2000,
        occupation: '대학원생',
        points: 80,
        status: 'INACTIVE'
      }
    })
  ])
  console.log(`  ${users.length}명의 회원 생성됨`)

  // 2. 샘플 프로그램 생성
  console.log('프로그램 데이터 생성 중...')
  const programs = await Promise.all([
    prisma.program.upsert({
      where: { slug: '15기-철학-독서모임' },
      update: {},
      create: {
        title: '15기 철학 독서모임',
        slug: '15기-철학-독서모임',
        type: 'BOOKCLUB',
        description: '동서양 철학 고전을 함께 읽고 토론하는 독서모임입니다.',
        content: '## 프로그램 소개\n\n철학 고전을 통해 삶의 지혜를 배우고, 남북 청년들이 함께 토론하며 서로의 생각을 나눕니다.\n\n## 일정\n- 매주 토요일 오후 2시\n- 총 12주 과정',
        capacity: 30,
        fee: 50000,
        location: '서울시 마포구 합정동 유니피봇 사무실',
        isOnline: false,
        status: 'CLOSED',
        startDate: new Date('2026-01-01'),
        endDate: new Date('2026-03-31')
      }
    }),
    prisma.program.upsert({
      where: { slug: '16기-역사-독서모임' },
      update: {},
      create: {
        title: '16기 역사 독서모임',
        slug: '16기-역사-독서모임',
        type: 'BOOKCLUB',
        description: '한국 근현대사를 함께 배우는 독서모임입니다.',
        content: '## 프로그램 소개\n\n한반도 근현대사를 다양한 시각에서 조명하고, 남북 청년들이 역사에 대해 토론합니다.',
        capacity: 25,
        fee: 50000,
        location: '서울시 종로구 혜화동',
        isOnline: false,
        status: 'OPEN',
        startDate: new Date('2026-02-01'),
        endDate: new Date('2026-04-30')
      }
    }),
    prisma.program.upsert({
      where: { slug: '2026-신년-세미나' },
      update: {},
      create: {
        title: '2026 신년 세미나',
        slug: '2026-신년-세미나',
        type: 'SEMINAR',
        description: '2026년 한반도 정세와 청년의 역할을 논의하는 세미나입니다.',
        content: '## 세미나 개요\n\n새해를 맞아 한반도 정세를 점검하고, 청년들이 어떤 역할을 할 수 있는지 함께 고민합니다.',
        capacity: 50,
        fee: 0,
        location: '온라인 (Zoom)',
        isOnline: true,
        status: 'COMPLETED',
        startDate: new Date('2026-01-10'),
        endDate: new Date('2026-01-10')
      }
    }),
    prisma.program.upsert({
      where: { slug: 'dmz-평화-탐방' },
      update: {},
      create: {
        title: 'DMZ 평화 탐방',
        slug: 'dmz-평화-탐방',
        type: 'KMOVE',
        description: 'DMZ와 접경지역을 방문하여 분단의 현실을 체험합니다.',
        content: '## K-Move 프로그램\n\n실제로 DMZ를 방문하여 분단의 현실을 체험하고, 평화에 대해 생각해봅니다.',
        capacity: 20,
        fee: 30000,
        location: '파주 DMZ',
        isOnline: false,
        status: 'OPEN',
        startDate: new Date('2026-02-15'),
        endDate: new Date('2026-02-15')
      }
    }),
    prisma.program.upsert({
      where: { slug: '통일-워크샵' },
      update: {},
      create: {
        title: '청년 통일 워크샵',
        slug: '통일-워크샵',
        type: 'WORKSHOP',
        description: '통일 이후를 준비하는 청년 워크샵입니다.',
        content: '## 워크샵 소개\n\n통일 이후 한반도의 미래를 함께 구상하고 준비합니다.',
        capacity: 40,
        fee: 20000,
        location: '서울시 강남구',
        isOnline: false,
        status: 'DRAFT',
        startDate: new Date('2026-03-01'),
        endDate: new Date('2026-03-02')
      }
    })
  ])
  console.log(`  ${programs.length}개의 프로그램 생성됨`)

  // 3. 프로그램 신청 생성
  console.log('프로그램 신청 데이터 생성 중...')
  const registrations = []
  for (const user of users.slice(0, 5)) {
    for (const program of programs.slice(0, 3)) {
      try {
        const reg = await prisma.registration.upsert({
          where: { userId_programId: { userId: user.id, programId: program.id } },
          update: {},
          create: {
            userId: user.id,
            programId: program.id,
            status: Math.random() > 0.2 ? 'APPROVED' : 'PENDING'
          }
        })
        registrations.push(reg)
      } catch (e) {}
    }
  }
  console.log(`  ${registrations.length}개의 프로그램 신청 생성됨`)

  // 4. 공지사항 생성
  console.log('공지사항 데이터 생성 중...')
  const notices = await Promise.all([
    prisma.notice.create({
      data: {
        title: '[필독] 유니피봇 커뮤니티 이용 안내',
        content: '안녕하세요, 유니피봇입니다.\n\n유니피봇 커뮤니티를 이용해 주셔서 감사합니다. 원활한 커뮤니티 운영을 위해 아래 안내사항을 꼭 읽어주세요.\n\n1. 상호 존중의 원칙을 지켜주세요.\n2. 정치적 편향을 지양하고 열린 대화를 나눠주세요.\n3. 개인정보 보호에 유의해주세요.\n\n감사합니다.',
        isPinned: true,
        isPublic: true,
        views: 156
      }
    }),
    prisma.notice.create({
      data: {
        title: '16기 역사 독서모임 모집 안내',
        content: '16기 역사 독서모임 참가자를 모집합니다.\n\n- 모집 기간: 2026년 1월 15일 ~ 1월 31일\n- 모집 인원: 25명\n- 참가비: 50,000원\n\n많은 관심 부탁드립니다!',
        isPinned: true,
        isPublic: true,
        views: 89
      }
    }),
    prisma.notice.create({
      data: {
        title: '2026년 1월 정기 모임 일정 안내',
        content: '2026년 1월 정기 모임 일정을 안내드립니다.\n\n- 일시: 2026년 1월 20일 토요일 오후 3시\n- 장소: 유니피봇 사무실\n- 주제: 새해 계획 나누기\n\n참석 여부를 회신해주세요.',
        isPinned: false,
        isPublic: true,
        views: 45
      }
    }),
    prisma.notice.create({
      data: {
        title: '후원금 사용 내역 보고 (2025년 12월)',
        content: '2025년 12월 후원금 사용 내역을 보고드립니다.\n\n수입: 3,500,000원\n지출: 2,800,000원\n- 프로그램 운영비: 1,500,000원\n- 사무실 임대료: 800,000원\n- 기타 운영비: 500,000원\n\n투명한 운영을 위해 노력하겠습니다.',
        isPinned: false,
        isPublic: true,
        views: 32
      }
    }),
    prisma.notice.create({
      data: {
        title: '[내부] 운영진 회의 안내',
        content: '운영진 회의가 있습니다.\n\n- 일시: 2026년 1월 18일 오후 7시\n- 장소: Zoom 회의\n\n운영진 여러분은 참석 부탁드립니다.',
        isPinned: false,
        isPublic: false,
        views: 8
      }
    })
  ])
  console.log(`  ${notices.length}개의 공지사항 생성됨`)

  // 5. 후원금 데이터 생성
  console.log('후원금 데이터 생성 중...')
  const donations = await Promise.all([
    prisma.donation.create({
      data: {
        userId: users[0].id,
        amount: 50000,
        type: 'ONE_TIME',
        method: 'BANK_TRANSFER',
        message: '좋은 활동 응원합니다!',
        anonymous: false,
        status: 'COMPLETED'
      }
    }),
    prisma.donation.create({
      data: {
        userId: users[1].id,
        amount: 100000,
        type: 'MONTHLY',
        method: 'CARD',
        message: '매달 후원하겠습니다.',
        anonymous: false,
        status: 'COMPLETED'
      }
    }),
    prisma.donation.create({
      data: {
        amount: 200000,
        type: 'ONE_TIME',
        method: 'BANK_TRANSFER',
        message: '익명으로 후원합니다.',
        anonymous: true,
        status: 'COMPLETED'
      }
    }),
    prisma.donation.create({
      data: {
        userId: users[2].id,
        amount: 30000,
        type: 'ONE_TIME',
        method: 'BANK_TRANSFER',
        anonymous: false,
        status: 'PENDING'
      }
    }),
    prisma.donation.create({
      data: {
        userId: users[3].id,
        amount: 50000,
        type: 'MONTHLY',
        method: 'CARD',
        message: '청년 통일 운동 화이팅!',
        anonymous: false,
        status: 'COMPLETED'
      }
    }),
    prisma.donation.create({
      data: {
        userId: users[5].id,
        amount: 150000,
        type: 'ONE_TIME',
        method: 'BANK_TRANSFER',
        anonymous: false,
        status: 'COMPLETED'
      }
    })
  ])
  console.log(`  ${donations.length}개의 후원 내역 생성됨`)

  // 6. 수입/지출 데이터 생성
  console.log('수입/지출 데이터 생성 중...')
  const transactions = await Promise.all([
    prisma.transaction.create({
      data: {
        type: 'INCOME',
        category: 'DONATION',
        amount: 550000,
        description: '1월 후원금 입금',
        date: new Date('2026-01-05')
      }
    }),
    prisma.transaction.create({
      data: {
        type: 'INCOME',
        category: 'PROGRAM_FEE',
        amount: 750000,
        description: '15기 독서모임 참가비',
        date: new Date('2026-01-03')
      }
    }),
    prisma.transaction.create({
      data: {
        type: 'INCOME',
        category: 'GRANT',
        amount: 2000000,
        description: '통일부 청년단체 지원금',
        date: new Date('2026-01-02')
      }
    }),
    prisma.transaction.create({
      data: {
        type: 'EXPENSE',
        category: 'RENT',
        amount: 800000,
        description: '1월 사무실 임대료',
        date: new Date('2026-01-01')
      }
    }),
    prisma.transaction.create({
      data: {
        type: 'EXPENSE',
        category: 'SUPPLIES',
        amount: 150000,
        description: '사무용품 구입',
        date: new Date('2026-01-08')
      }
    }),
    prisma.transaction.create({
      data: {
        type: 'EXPENSE',
        category: 'OTHER',
        amount: 200000,
        description: '신년 세미나 진행비',
        date: new Date('2026-01-10')
      }
    }),
    prisma.transaction.create({
      data: {
        type: 'INCOME',
        category: 'PROGRAM_FEE',
        amount: 300000,
        description: 'DMZ 탐방 참가비',
        date: new Date('2026-01-09')
      }
    })
  ])
  console.log(`  ${transactions.length}개의 거래 내역 생성됨`)

  // 7. 활동 로그 생성
  console.log('활동 로그 데이터 생성 중...')
  const activities = await Promise.all([
    prisma.activityLog.create({
      data: {
        userId: users[0].id,
        action: 'REGISTER',
        target: 'User',
        details: '회원가입 완료'
      }
    }),
    prisma.activityLog.create({
      data: {
        userId: users[1].id,
        action: 'PROGRAM_REGISTER',
        target: '15기 철학 독서모임',
        details: '프로그램 신청 완료'
      }
    }),
    prisma.activityLog.create({
      data: {
        userId: users[2].id,
        action: 'DONATION',
        target: '₩50,000',
        details: '후원금 입금'
      }
    }),
    prisma.activityLog.create({
      data: {
        userId: users[3].id,
        action: 'UPDATE_PROFILE',
        target: 'User',
        details: '프로필 수정'
      }
    })
  ])
  console.log(`  ${activities.length}개의 활동 로그 생성됨`)

  console.log('\n✅ 샘플 데이터 생성 완료!')
  console.log('\n요약:')
  console.log(`  - 회원: ${users.length}명`)
  console.log(`  - 프로그램: ${programs.length}개`)
  console.log(`  - 프로그램 신청: ${registrations.length}건`)
  console.log(`  - 공지사항: ${notices.length}개`)
  console.log(`  - 후원 내역: ${donations.length}건`)
  console.log(`  - 거래 내역: ${transactions.length}건`)
  console.log(`  - 활동 로그: ${activities.length}건`)
}

main()
  .catch((e) => {
    console.error('오류 발생:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
