import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function testReports() {
  console.log('=== 독서 기록 기능 테스트 ===\n')

  // 1. 도서 목록 확인
  console.log('--- 1. 도서 목록 확인 ---')
  const books = await prisma.book.findMany({
    orderBy: { title: 'asc' }
  })

  if (books.length === 0) {
    console.log('도서가 없습니다. seed-books.ts를 먼저 실행해주세요.')
    return
  }

  console.log(`총 ${books.length}권의 도서:`)
  books.forEach(b => console.log(`  - ${b.title} (${b.author})`))

  // 2. 테스트 사용자 조회
  console.log('\n--- 2. 테스트 사용자 조회 ---')
  const testUser = await prisma.user.findFirst({
    where: { role: 'USER' }
  })

  if (!testUser) {
    console.log('테스트 사용자가 없습니다.')
    return
  }
  console.log(`테스트 사용자: ${testUser.name} (${testUser.email})`)

  // 3. 기존 독서 기록 확인
  console.log('\n--- 3. 기존 독서 기록 확인 ---')
  const existingReports = await prisma.bookReport.findMany({
    where: { userId: testUser.id },
    include: { book: true },
    orderBy: { createdAt: 'desc' }
  })

  console.log(`기존 기록 ${existingReports.length}건:`)
  existingReports.forEach(r => {
    console.log(`  - "${r.title}" (${r.book.title}) - ${r.isPublic ? '공개' : '비공개'}`)
  })

  // 4. 새 독서 기록 작성 테스트
  console.log('\n--- 4. 새 독서 기록 작성 테스트 ---')
  const testBook = books[0]
  const testReportId = `test-report-${Date.now()}`

  // 기존 포인트 확인
  const userBefore = await prisma.user.findUnique({
    where: { id: testUser.id },
    select: { points: true }
  })
  console.log(`작성 전 포인트: ${userBefore?.points}P`)

  const newReport = await prisma.bookReport.create({
    data: {
      id: testReportId,
      userId: testUser.id,
      bookId: testBook.id,
      title: '테스트 독서 기록',
      content: '이것은 테스트용 독서 기록입니다. 기능 확인을 위해 작성되었습니다.',
      isPublic: true
    },
    include: { book: true }
  })
  console.log(`새 기록 생성: "${newReport.title}"`)

  // 포인트 적립 (실제로는 createBookReport 액션이 처리)
  const newBalance = (userBefore?.points || 0) + 200
  await prisma.user.update({
    where: { id: testUser.id },
    data: { points: newBalance }
  })
  await prisma.pointHistory.create({
    data: {
      userId: testUser.id,
      amount: 200,
      type: 'EARN',
      category: 'REPORT',
      description: `독서 기록 작성 - ${testBook.title}`,
      balance: newBalance
    }
  })
  console.log(`포인트 적립: +200P (현재: ${newBalance}P)`)

  // 5. 독서 기록 수정 테스트
  console.log('\n--- 5. 독서 기록 수정 테스트 ---')
  const updatedReport = await prisma.bookReport.update({
    where: { id: testReportId },
    data: {
      title: '테스트 독서 기록 (수정됨)',
      isPublic: false
    }
  })
  console.log(`수정 완료: "${updatedReport.title}" - ${updatedReport.isPublic ? '공개' : '비공개'}`)

  // 6. 독서 기록 조회 테스트
  console.log('\n--- 6. 독서 기록 조회 테스트 ---')
  const report = await prisma.bookReport.findUnique({
    where: { id: testReportId },
    include: { book: true, user: true }
  })
  console.log(`조회 결과:`)
  console.log(`  제목: ${report?.title}`)
  console.log(`  도서: ${report?.book.title}`)
  console.log(`  작성자: ${report?.user.name}`)
  console.log(`  공개여부: ${report?.isPublic ? '공개' : '비공개'}`)

  // 7. 독서 기록 삭제 테스트
  console.log('\n--- 7. 독서 기록 삭제 테스트 ---')
  await prisma.bookReport.delete({
    where: { id: testReportId }
  })
  console.log('테스트 기록 삭제 완료')

  // 8. 공개 독서 기록 목록 조회
  console.log('\n--- 8. 공개 독서 기록 목록 ---')
  const publicReports = await prisma.bookReport.findMany({
    where: { isPublic: true },
    include: { book: true, user: true },
    orderBy: { createdAt: 'desc' },
    take: 5
  })
  console.log(`공개 기록 ${publicReports.length}건:`)
  publicReports.forEach(r => {
    console.log(`  - "${r.title}" by ${r.user.name} (${r.book.title})`)
  })

  // 9. 포인트 내역 확인
  console.log('\n--- 9. 포인트 내역 확인 ---')
  const pointHistory = await prisma.pointHistory.findMany({
    where: {
      userId: testUser.id,
      category: 'REPORT'
    },
    orderBy: { createdAt: 'desc' },
    take: 5
  })
  console.log(`독서 기록 관련 포인트 내역 ${pointHistory.length}건:`)
  pointHistory.forEach(h => {
    console.log(`  - ${h.type === 'EARN' ? '+' : '-'}${h.amount}P: ${h.description}`)
  })

  console.log('\n=== 테스트 완료 ===')
}

testReports()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
