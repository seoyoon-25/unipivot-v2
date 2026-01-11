import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function seedBooks() {
  console.log('=== 도서 및 독서 기록 샘플 데이터 생성 ===\n')

  // 1. 샘플 도서 생성
  console.log('--- 도서 생성 ---')
  const books = await Promise.all([
    prisma.book.upsert({
      where: { id: 'book-1' },
      update: {},
      create: {
        id: 'book-1',
        title: '한반도의 미래',
        author: '김평화',
        publisher: '통일출판사',
        summary: '남북 관계의 역사와 미래 전망을 다룬 책'
      }
    }),
    prisma.book.upsert({
      where: { id: 'book-2' },
      update: {},
      create: {
        id: 'book-2',
        title: '차라투스트라는 이렇게 말했다',
        author: '프리드리히 니체',
        publisher: '민음사',
        summary: '니체의 대표적인 철학서'
      }
    }),
    prisma.book.upsert({
      where: { id: 'book-3' },
      update: {},
      create: {
        id: 'book-3',
        title: '북한 문학의 이해',
        author: '이문학',
        publisher: '한겨레출판',
        summary: '북한 문학의 역사와 특징을 소개하는 입문서'
      }
    }),
    prisma.book.upsert({
      where: { id: 'book-4' },
      update: {},
      create: {
        id: 'book-4',
        title: '분단 시대의 청년들',
        author: '박청년',
        publisher: '청년사',
        summary: '분단 시대를 살아가는 청년들의 이야기'
      }
    }),
    prisma.book.upsert({
      where: { id: 'book-5' },
      update: {},
      create: {
        id: 'book-5',
        title: 'DMZ 생태 기행',
        author: '최자연',
        publisher: '환경출판사',
        summary: 'DMZ의 자연 생태계를 탐구하는 여행기'
      }
    })
  ])

  books.forEach(b => console.log(`- ${b.title} (${b.author})`))

  // 2. 사용자 조회
  const users = await prisma.user.findMany({
    where: { role: 'USER' },
    take: 4
  })

  // 3. 샘플 독서 기록 생성
  console.log('\n--- 독서 기록 생성 ---')

  const reports = [
    {
      userId: users[0].id,
      bookId: 'book-1',
      title: '한반도의 미래에 대한 나의 생각',
      content: `이 책을 읽으면서 분단의 역사와 통일의 필요성에 대해 다시 한번 생각해보게 되었습니다.

저자는 남북관계의 변화 과정을 시대별로 정리하면서, 앞으로 우리가 나아가야 할 방향에 대해 제시합니다.

특히 인상 깊었던 부분은 청년 세대의 역할에 대한 장이었습니다. 우리 세대가 통일 과정에서 어떤 역할을 할 수 있을지 고민하게 되었습니다.

이 책을 유니피벗 독서모임에서 함께 읽으면서 다양한 의견을 나눌 수 있어서 더욱 의미 있었습니다.`,
      isPublic: true
    },
    {
      userId: users[0].id,
      bookId: 'book-2',
      title: '니체와 남북관계: 힘에의 의지',
      content: `니체의 철학을 통해 남북관계를 새롭게 바라보는 시도를 해보았습니다.

"신은 죽었다"라는 유명한 선언처럼, 기존의 고정관념을 타파하고 새로운 가치를 창조해야 한다는 메시지가 인상적이었습니다.

남북관계에서도 과거의 관성에서 벗어나 새로운 관계 정립이 필요하다는 생각이 들었습니다.`,
      isPublic: true
    },
    {
      userId: users[1].id,
      bookId: 'book-3',
      title: '북한 문학 속 인간상 탐구',
      content: `북한 문학을 처음 접하면서 많은 것을 배웠습니다.

같은 언어를 사용하지만 다른 체제에서 발전한 문학의 특징을 이해할 수 있었습니다.

특히 주체문학의 특성과 그 속에 담긴 인간상에 대해 깊이 생각해보게 되었습니다.`,
      isPublic: false
    },
    {
      userId: users[2].id,
      bookId: 'book-4',
      title: '청년으로서 분단 시대를 살아간다는 것',
      content: `이 책은 분단 시대를 살아가는 청년들의 이야기를 담고 있습니다.

남과 북의 청년들이 서로 다른 환경에서 어떤 꿈을 꾸고 있는지 알 수 있었습니다.

유니피벗 활동을 하면서 만난 북한이탈주민 청년들의 이야기와 겹치는 부분이 많아 더욱 공감이 갔습니다.`,
      isPublic: true
    },
    {
      userId: users[3].id,
      bookId: 'book-5',
      title: 'DMZ, 분단의 상징에서 평화의 공간으로',
      content: `DMZ 탐방 프로그램에 참여하기 전 이 책을 읽었습니다.

DMZ가 단순한 군사적 분계선이 아니라, 70년 넘게 사람의 손길이 닿지 않아 형성된 독특한 생태계임을 알게 되었습니다.

분단의 역설적 선물이라고 할 수 있는 이 자연을 어떻게 보존하고 활용할 수 있을지 고민하게 되었습니다.`,
      isPublic: true
    }
  ]

  for (const report of reports) {
    const created = await prisma.bookReport.upsert({
      where: {
        id: `report-${report.userId}-${report.bookId}`
      },
      update: {},
      create: {
        id: `report-${report.userId}-${report.bookId}`,
        ...report,
        updatedAt: new Date()
      },
      include: { user: true, book: true }
    })
    console.log(`- ${created.user.name}: "${created.title}" (${created.book.title})`)
  }

  // 4. 통계 확인
  console.log('\n--- 통계 ---')
  const bookCount = await prisma.book.count()
  const reportCount = await prisma.bookReport.count()
  console.log(`총 도서: ${bookCount}권`)
  console.log(`총 독서 기록: ${reportCount}건`)

  console.log('\n=== 완료 ===')
}

seedBooks()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
