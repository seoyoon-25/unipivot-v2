import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function testIntegration() {
  console.log('╔════════════════════════════════════════════════════════════╗')
  console.log('║         UniPivot v2.0 전체 기능 통합 테스트                ║')
  console.log('╚════════════════════════════════════════════════════════════╝\n')

  const results: { name: string; status: 'PASS' | 'FAIL'; message?: string }[] = []

  // =============================================
  // 1. 사용자 관리 테스트
  // =============================================
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('📌 1. 사용자 관리 테스트')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')

  try {
    // 1.1 사용자 목록 조회
    const users = await prisma.user.findMany({
      include: {
        _count: {
          select: {
            registrations: true,
            donations: true,
            bookReports: true
          }
        }
      }
    })
    console.log(`  ✓ 사용자 목록 조회: ${users.length}명`)
    results.push({ name: '사용자 목록 조회', status: 'PASS' })

    // 1.2 관리자/일반 사용자 분류
    const admins = users.filter(u => u.role === 'ADMIN')
    const regularUsers = users.filter(u => u.role === 'USER')
    console.log(`    - 관리자: ${admins.length}명`)
    console.log(`    - 일반 사용자: ${regularUsers.length}명`)

    // 1.3 사용자 상세 정보 조회
    const testUser = regularUsers[0]
    if (testUser) {
      const userDetail = await prisma.user.findUnique({
        where: { id: testUser.id },
        include: {
          registrations: { include: { program: true } },
          donations: true,
          bookReports: { include: { book: true } }
        }
      })
      console.log(`  ✓ 사용자 상세 조회: ${userDetail?.name}`)
      console.log(`    - 프로그램 신청: ${userDetail?.registrations.length}건`)
      console.log(`    - 후원: ${userDetail?.donations.length}건`)
      console.log(`    - 독서 기록: ${userDetail?.bookReports.length}건`)
      results.push({ name: '사용자 상세 조회', status: 'PASS' })
    }

    // 1.4 사용자 정보 수정
    const updatedUser = await prisma.user.update({
      where: { id: testUser.id },
      data: { bio: '통합 테스트에서 업데이트됨' }
    })
    console.log(`  ✓ 사용자 정보 수정: ${updatedUser.bio}`)
    results.push({ name: '사용자 정보 수정', status: 'PASS' })

  } catch (error) {
    console.log(`  ✗ 사용자 관리 테스트 실패: ${error}`)
    results.push({ name: '사용자 관리', status: 'FAIL', message: String(error) })
  }

  // =============================================
  // 2. 프로그램 관리 테스트
  // =============================================
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('📌 2. 프로그램 관리 테스트')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')

  try {
    // 2.1 프로그램 목록 조회
    const programs = await prisma.program.findMany({
      include: {
        _count: { select: { registrations: { where: { status: 'APPROVED' } } } },
        sessions: true,
        books: { include: { book: true } }
      }
    })
    console.log(`  ✓ 프로그램 목록 조회: ${programs.length}개`)
    results.push({ name: '프로그램 목록 조회', status: 'PASS' })

    // 2.2 상태별 분류
    const statusCount = {
      OPEN: programs.filter(p => p.status === 'OPEN').length,
      CLOSED: programs.filter(p => p.status === 'CLOSED').length,
      COMPLETED: programs.filter(p => p.status === 'COMPLETED').length
    }
    console.log(`    - 모집중: ${statusCount.OPEN}개, 모집마감: ${statusCount.CLOSED}개, 종료: ${statusCount.COMPLETED}개`)

    // 2.3 유형별 분류
    const typeCount: Record<string, number> = {}
    programs.forEach(p => {
      typeCount[p.type] = (typeCount[p.type] || 0) + 1
    })
    console.log(`    - 유형: ${Object.entries(typeCount).map(([t, c]) => `${t}(${c})`).join(', ')}`)

    // 2.4 프로그램 상세 조회
    const program = programs[0]
    if (program) {
      console.log(`  ✓ 프로그램 상세 조회: ${program.title}`)
      console.log(`    - 세션: ${program.sessions.length}회`)
      console.log(`    - 도서: ${program.books.length}권`)
      console.log(`    - 참가자: ${program._count.registrations}/${program.capacity}명`)
      results.push({ name: '프로그램 상세 조회', status: 'PASS' })
    }

  } catch (error) {
    console.log(`  ✗ 프로그램 관리 테스트 실패: ${error}`)
    results.push({ name: '프로그램 관리', status: 'FAIL', message: String(error) })
  }

  // =============================================
  // 3. 프로그램 신청 및 승인 테스트
  // =============================================
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('📌 3. 프로그램 신청/승인 테스트')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')

  try {
    // 3.1 전체 신청 목록
    const registrations = await prisma.registration.findMany({
      include: {
        user: true,
        program: true
      }
    })
    console.log(`  ✓ 전체 신청 목록: ${registrations.length}건`)

    // 3.2 상태별 분류
    const regStatus = {
      PENDING: registrations.filter(r => r.status === 'PENDING').length,
      APPROVED: registrations.filter(r => r.status === 'APPROVED').length,
      REJECTED: registrations.filter(r => r.status === 'REJECTED').length,
      CANCELLED: registrations.filter(r => r.status === 'CANCELLED').length
    }
    console.log(`    - 대기: ${regStatus.PENDING}, 승인: ${regStatus.APPROVED}, 거절: ${regStatus.REJECTED}, 취소: ${regStatus.CANCELLED}`)
    results.push({ name: '신청 목록 조회', status: 'PASS' })

    // 3.3 신청 생성 테스트
    const testUser = await prisma.user.findFirst({ where: { role: 'USER' } })
    const testProgram = await prisma.program.findFirst({ where: { status: 'OPEN' } })

    if (testUser && testProgram) {
      // 기존 신청 확인
      const existingReg = await prisma.registration.findUnique({
        where: { userId_programId: { userId: testUser.id, programId: testProgram.id } }
      })

      if (!existingReg) {
        const newReg = await prisma.registration.create({
          data: {
            userId: testUser.id,
            programId: testProgram.id,
            status: 'PENDING'
          }
        })
        console.log(`  ✓ 신청 생성: ${testUser.name} → ${testProgram.title}`)

        // 3.4 승인 테스트
        await prisma.registration.update({
          where: { id: newReg.id },
          data: { status: 'APPROVED' }
        })
        console.log(`  ✓ 신청 승인 처리 완료`)

        // 3.5 활동 로그 기록
        await prisma.activityLog.create({
          data: {
            userId: testUser.id,
            action: 'PROGRAM_REGISTER',
            target: testProgram.title,
            targetId: testProgram.id
          }
        })
        console.log(`  ✓ 활동 로그 기록 완료`)
        results.push({ name: '신청 생성/승인', status: 'PASS' })
      } else {
        console.log(`  ✓ 기존 신청 있음: ${existingReg.status}`)
        results.push({ name: '신청 확인', status: 'PASS' })
      }
    }

  } catch (error) {
    console.log(`  ✗ 신청/승인 테스트 실패: ${error}`)
    results.push({ name: '신청/승인', status: 'FAIL', message: String(error) })
  }

  // =============================================
  // 4. 후원 기능 테스트
  // =============================================
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('📌 4. 후원 기능 테스트')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')

  try {
    // 4.1 후원 목록 조회
    const donations = await prisma.donation.findMany({
      include: { user: true },
      orderBy: { createdAt: 'desc' }
    })
    console.log(`  ✓ 후원 목록: ${donations.length}건`)

    // 4.2 상태별/유형별 분류
    const donationStats = {
      total: donations.reduce((sum, d) => sum + d.amount, 0),
      completed: donations.filter(d => d.status === 'COMPLETED').length,
      pending: donations.filter(d => d.status === 'PENDING').length,
      anonymous: donations.filter(d => d.anonymous).length
    }
    console.log(`    - 총 금액: ₩${donationStats.total.toLocaleString()}`)
    console.log(`    - 완료: ${donationStats.completed}건, 대기: ${donationStats.pending}건`)
    console.log(`    - 익명 후원: ${donationStats.anonymous}건`)
    results.push({ name: '후원 목록 조회', status: 'PASS' })

    // 4.3 새 후원 생성
    const testUser = await prisma.user.findFirst({ where: { role: 'USER' } })
    if (testUser) {
      const newDonation = await prisma.donation.create({
        data: {
          userId: testUser.id,
          amount: 10000,
          type: 'ONE_TIME',
          method: 'CARD',
          status: 'COMPLETED',
          message: '통합 테스트 후원입니다.'
        }
      })
      console.log(`  ✓ 후원 생성: ₩${newDonation.amount.toLocaleString()}`)
      results.push({ name: '후원 생성', status: 'PASS' })

      // 삭제 (테스트 데이터 정리)
      await prisma.donation.delete({ where: { id: newDonation.id } })
    }

  } catch (error) {
    console.log(`  ✗ 후원 기능 테스트 실패: ${error}`)
    results.push({ name: '후원 기능', status: 'FAIL', message: String(error) })
  }

  // =============================================
  // 5. 포인트 시스템 테스트
  // =============================================
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('📌 5. 포인트 시스템 테스트')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')

  try {
    // 5.1 포인트 보유 현황
    const usersWithPoints = await prisma.user.findMany({
      where: { role: 'USER' },
      select: { id: true, name: true, points: true }
    })
    const totalPoints = usersWithPoints.reduce((sum, u) => sum + u.points, 0)
    console.log(`  ✓ 전체 포인트 현황: ${totalPoints.toLocaleString()}P (${usersWithPoints.length}명)`)
    usersWithPoints.slice(0, 3).forEach(u => {
      console.log(`    - ${u.name}: ${u.points.toLocaleString()}P`)
    })
    results.push({ name: '포인트 현황 조회', status: 'PASS' })

    // 5.2 포인트 내역 조회
    const pointHistory = await prisma.pointHistory.findMany({
      include: { user: true },
      orderBy: { createdAt: 'desc' },
      take: 10
    })
    console.log(`  ✓ 포인트 내역: ${pointHistory.length}건`)

    const categories: Record<string, number> = {}
    pointHistory.forEach(h => {
      categories[h.category] = (categories[h.category] || 0) + 1
    })
    console.log(`    - 카테고리: ${Object.entries(categories).map(([c, n]) => `${c}(${n})`).join(', ')}`)
    results.push({ name: '포인트 내역 조회', status: 'PASS' })

    // 5.3 포인트 적립/차감 테스트
    const testUser = usersWithPoints[0]
    if (testUser) {
      const beforePoints = testUser.points

      // 적립
      await prisma.user.update({
        where: { id: testUser.id },
        data: { points: beforePoints + 100 }
      })
      await prisma.pointHistory.create({
        data: {
          userId: testUser.id,
          amount: 100,
          type: 'EARN',
          category: 'TEST',
          description: '통합 테스트 적립',
          balance: beforePoints + 100
        }
      })
      console.log(`  ✓ 포인트 적립: +100P`)

      // 차감
      await prisma.user.update({
        where: { id: testUser.id },
        data: { points: beforePoints }
      })
      await prisma.pointHistory.create({
        data: {
          userId: testUser.id,
          amount: -100,
          type: 'SPEND',
          category: 'TEST',
          description: '통합 테스트 차감',
          balance: beforePoints
        }
      })
      console.log(`  ✓ 포인트 차감: -100P`)
      results.push({ name: '포인트 적립/차감', status: 'PASS' })
    }

  } catch (error) {
    console.log(`  ✗ 포인트 시스템 테스트 실패: ${error}`)
    results.push({ name: '포인트 시스템', status: 'FAIL', message: String(error) })
  }

  // =============================================
  // 6. 독서 기록 테스트
  // =============================================
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('📌 6. 독서 기록 테스트')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')

  try {
    // 6.1 도서 목록
    const books = await prisma.book.findMany()
    console.log(`  ✓ 도서 목록: ${books.length}권`)
    results.push({ name: '도서 목록 조회', status: 'PASS' })

    // 6.2 독서 기록 목록
    const reports = await prisma.bookReport.findMany({
      include: { book: true, user: true }
    })
    console.log(`  ✓ 독서 기록: ${reports.length}건`)

    const publicReports = reports.filter(r => r.isPublic)
    console.log(`    - 공개: ${publicReports.length}건, 비공개: ${reports.length - publicReports.length}건`)
    results.push({ name: '독서 기록 조회', status: 'PASS' })

    // 6.3 독서 기록 CRUD
    const testUser = await prisma.user.findFirst({ where: { role: 'USER' } })
    const testBook = books[0]

    if (testUser && testBook) {
      // 생성
      const newReport = await prisma.bookReport.create({
        data: {
          userId: testUser.id,
          bookId: testBook.id,
          title: '통합 테스트 독서 기록',
          content: '이것은 통합 테스트를 위한 독서 기록입니다.',
          isPublic: true
        }
      })
      console.log(`  ✓ 독서 기록 생성: "${newReport.title}"`)

      // 수정
      await prisma.bookReport.update({
        where: { id: newReport.id },
        data: { title: '통합 테스트 독서 기록 (수정됨)' }
      })
      console.log(`  ✓ 독서 기록 수정 완료`)

      // 삭제
      await prisma.bookReport.delete({ where: { id: newReport.id } })
      console.log(`  ✓ 독서 기록 삭제 완료`)
      results.push({ name: '독서 기록 CRUD', status: 'PASS' })
    }

  } catch (error) {
    console.log(`  ✗ 독서 기록 테스트 실패: ${error}`)
    results.push({ name: '독서 기록', status: 'FAIL', message: String(error) })
  }

  // =============================================
  // 7. 공지사항 테스트
  // =============================================
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('📌 7. 공지사항 테스트')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')

  try {
    const notices = await prisma.notice.findMany({
      orderBy: [{ isPinned: 'desc' }, { createdAt: 'desc' }]
    })
    console.log(`  ✓ 공지사항 목록: ${notices.length}건`)

    const pinnedNotices = notices.filter(n => n.isPinned)
    const publicNotices = notices.filter(n => n.isPublic)
    console.log(`    - 상단 고정: ${pinnedNotices.length}건`)
    console.log(`    - 공개: ${publicNotices.length}건`)

    if (notices.length > 0) {
      console.log(`    - 최근 공지: ${notices[0].title}`)
    }
    results.push({ name: '공지사항 조회', status: 'PASS' })

  } catch (error) {
    console.log(`  ✗ 공지사항 테스트 실패: ${error}`)
    results.push({ name: '공지사항', status: 'FAIL', message: String(error) })
  }

  // =============================================
  // 8. 활동 로그 테스트
  // =============================================
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('📌 8. 활동 로그 테스트')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')

  try {
    const logs = await prisma.activityLog.findMany({
      include: { user: true },
      orderBy: { createdAt: 'desc' },
      take: 20
    })
    console.log(`  ✓ 활동 로그: ${logs.length}건`)

    const actions: Record<string, number> = {}
    logs.forEach(l => {
      actions[l.action] = (actions[l.action] || 0) + 1
    })
    console.log(`    - 활동 유형: ${Object.entries(actions).map(([a, c]) => `${a}(${c})`).join(', ')}`)
    results.push({ name: '활동 로그 조회', status: 'PASS' })

  } catch (error) {
    console.log(`  ✗ 활동 로그 테스트 실패: ${error}`)
    results.push({ name: '활동 로그', status: 'FAIL', message: String(error) })
  }

  // =============================================
  // 9. 관리자 대시보드 데이터 테스트
  // =============================================
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('📌 9. 관리자 대시보드 데이터')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')

  try {
    const [
      totalUsers,
      totalPrograms,
      totalRegistrations,
      totalDonations,
      pendingRegistrations
    ] = await Promise.all([
      prisma.user.count(),
      prisma.program.count(),
      prisma.registration.count({ where: { status: 'APPROVED' } }),
      prisma.donation.aggregate({ _sum: { amount: true }, where: { status: 'COMPLETED' } }),
      prisma.registration.count({ where: { status: 'PENDING' } })
    ])

    console.log(`  ✓ 대시보드 통계:`)
    console.log(`    - 총 회원: ${totalUsers}명`)
    console.log(`    - 총 프로그램: ${totalPrograms}개`)
    console.log(`    - 승인된 참가: ${totalRegistrations}건`)
    console.log(`    - 대기중 신청: ${pendingRegistrations}건`)
    console.log(`    - 총 후원금: ₩${(totalDonations._sum.amount || 0).toLocaleString()}`)
    results.push({ name: '대시보드 데이터', status: 'PASS' })

  } catch (error) {
    console.log(`  ✗ 대시보드 테스트 실패: ${error}`)
    results.push({ name: '대시보드', status: 'FAIL', message: String(error) })
  }

  // =============================================
  // 10. 홈페이지 데이터 테스트
  // =============================================
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('📌 10. 홈페이지 데이터')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')

  try {
    const [programs, notices, stats] = await Promise.all([
      prisma.program.findMany({
        where: { status: { in: ['OPEN', 'CLOSED'] } },
        take: 4,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.notice.findMany({
        where: { isPublic: true },
        take: 5,
        orderBy: [{ isPinned: 'desc' }, { createdAt: 'desc' }]
      }),
      Promise.all([
        prisma.user.count(),
        prisma.program.count({ where: { status: 'COMPLETED' } }),
        prisma.registration.count({ where: { status: 'APPROVED' } })
      ])
    ])

    console.log(`  ✓ 홈페이지 데이터:`)
    console.log(`    - 프로그램 배너: ${programs.length}개`)
    console.log(`    - 공지사항: ${notices.length}건`)
    console.log(`    - 통계: 회원 ${stats[0]}명, 완료 프로그램 ${stats[1]}개, 참가 ${stats[2]}건`)
    results.push({ name: '홈페이지 데이터', status: 'PASS' })

  } catch (error) {
    console.log(`  ✗ 홈페이지 테스트 실패: ${error}`)
    results.push({ name: '홈페이지', status: 'FAIL', message: String(error) })
  }

  // =============================================
  // 테스트 결과 요약
  // =============================================
  console.log('\n')
  console.log('╔════════════════════════════════════════════════════════════╗')
  console.log('║                     테스트 결과 요약                       ║')
  console.log('╚════════════════════════════════════════════════════════════╝')

  const passed = results.filter(r => r.status === 'PASS').length
  const failed = results.filter(r => r.status === 'FAIL').length

  console.log(`\n총 ${results.length}개 테스트 중 ${passed}개 성공, ${failed}개 실패\n`)

  results.forEach(r => {
    const icon = r.status === 'PASS' ? '✅' : '❌'
    console.log(`  ${icon} ${r.name}${r.message ? ` - ${r.message}` : ''}`)
  })

  if (failed === 0) {
    console.log('\n🎉 모든 테스트를 통과했습니다!')
  } else {
    console.log(`\n⚠️ ${failed}개의 테스트가 실패했습니다.`)
  }

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
}

testIntegration()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
