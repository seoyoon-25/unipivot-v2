import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function testMyPage() {
  console.log('=== 마이페이지 신청내역 테스트 ===\n')

  const testUserId = 'cmk90mokt0005b0asky1qyznd' // 한동원

  // 1. 사용자 프로필 조회 (getUserProfile 시뮬레이션)
  const user = await prisma.user.findUnique({
    where: { id: testUserId },
    include: {
      registrations: {
        include: { program: true },
        orderBy: { createdAt: 'desc' }
      },
      donations: {
        where: { status: 'COMPLETED' },
        orderBy: { createdAt: 'desc' },
        take: 10
      },
      bookReports: {
        include: { book: true },
        orderBy: { createdAt: 'desc' },
        take: 10
      }
    }
  })

  console.log('사용자:', user?.name, `(${user?.email})`)
  console.log('보유 포인트:', user?.points)
  console.log('')

  // 2. 참여 프로그램 목록 (getUserPrograms 시뮬레이션)
  const registrations = await prisma.registration.findMany({
    where: { userId: testUserId },
    include: {
      program: {
        include: { _count: { select: { registrations: { where: { status: 'APPROVED' } } } } }
      }
    },
    orderBy: { createdAt: 'desc' }
  })

  console.log('--- 참여 프로그램 목록 ---')
  if (registrations.length === 0) {
    console.log('참여한 프로그램이 없습니다.')
  } else {
    registrations.forEach((reg, i) => {
      const statusLabel = {
        APPROVED: '승인됨',
        PENDING: '대기중',
        REJECTED: '거절됨',
        CANCELLED: '취소됨'
      }[reg.status] || reg.status

      const programStatusLabel = {
        OPEN: '모집중',
        CLOSED: '진행중',
        COMPLETED: '완료'
      }[reg.program.status] || reg.program.status

      console.log(`${i + 1}. ${reg.program.title}`)
      console.log(`   유형: ${reg.program.type}`)
      console.log(`   프로그램 상태: ${programStatusLabel}`)
      console.log(`   신청 상태: ${statusLabel}`)
      console.log(`   참가자: ${reg.program._count.registrations}/${reg.program.capacity}명`)
      if (reg.program.startDate) {
        console.log(`   일정: ${new Date(reg.program.startDate).toLocaleDateString('ko-KR')}`)
      }
      console.log('')
    })
  }

  // 3. 다른 사용자 (김철수)도 테스트
  console.log('--- 김철수 신청내역 ---')
  const kimRegistrations = await prisma.registration.findMany({
    where: { userId: 'cmk90mokt0000b0asctj214zt' },
    include: {
      program: {
        include: { _count: { select: { registrations: { where: { status: 'APPROVED' } } } } }
      }
    },
    orderBy: { createdAt: 'desc' }
  })

  kimRegistrations.forEach((reg, i) => {
    const statusLabel = {
      APPROVED: '승인됨',
      PENDING: '대기중',
      REJECTED: '거절됨',
      CANCELLED: '취소됨'
    }[reg.status] || reg.status

    console.log(`${i + 1}. ${reg.program.title} - ${statusLabel}`)
  })

  console.log('\n=== 테스트 완료 ===')
}

testMyPage()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
