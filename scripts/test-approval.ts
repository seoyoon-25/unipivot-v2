import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function testApproval() {
  console.log('=== 신청 승인/거절 기능 테스트 ===\n')

  // 1. 대기중인 신청 조회
  console.log('--- 현재 대기중인 신청 ---')
  const pendingRegs = await prisma.registration.findMany({
    where: { status: 'PENDING' },
    include: {
      user: true,
      program: true
    }
  })

  if (pendingRegs.length === 0) {
    console.log('대기중인 신청이 없습니다. 테스트 데이터를 생성합니다...')

    // 테스트용 신청 생성
    const testReg = await prisma.registration.create({
      data: {
        userId: 'cmk90mokt0006b0asb6jno7mw', // 김수진
        programId: 'cmk90moqh0009b0as09iozsyr', // 16기 역사 독서모임
        status: 'PENDING'
      },
      include: {
        user: true,
        program: true
      }
    })
    console.log(`생성됨: ${testReg.user.name} - ${testReg.program.title} (${testReg.status})`)
    pendingRegs.push(testReg)
  } else {
    pendingRegs.forEach(reg => {
      console.log(`- ${reg.user.name} → ${reg.program.title} (${reg.status})`)
    })
  }

  // 2. 승인 테스트
  console.log('\n--- 승인 테스트 ---')
  const regToApprove = pendingRegs[0]
  console.log(`대상: ${regToApprove.user.name} - ${regToApprove.program.title}`)

  const approved = await prisma.registration.update({
    where: { id: regToApprove.id },
    data: { status: 'APPROVED' },
    include: { user: true, program: true }
  })
  console.log(`[성공] 상태 변경: PENDING → ${approved.status}`)

  // 활동 로그 기록
  await prisma.activityLog.create({
    data: {
      userId: approved.userId,
      action: 'REGISTRATION_APPROVED',
      target: approved.program.title,
      targetId: approved.programId
    }
  })
  console.log('[성공] 활동 로그 기록됨')

  // 3. 거절 테스트 (새 신청 생성 후)
  console.log('\n--- 거절 테스트 ---')
  const testRegForReject = await prisma.registration.create({
    data: {
      userId: 'cmk90mokt0006b0asb6jno7mw', // 김수진
      programId: 'cmk90moqh0007b0asqmagya6s', // DMZ 평화 탐방
      status: 'PENDING'
    },
    include: { user: true, program: true }
  })
  console.log(`대상: ${testRegForReject.user.name} - ${testRegForReject.program.title}`)

  const rejected = await prisma.registration.update({
    where: { id: testRegForReject.id },
    data: { status: 'REJECTED' },
    include: { user: true, program: true }
  })
  console.log(`[성공] 상태 변경: PENDING → ${rejected.status}`)

  await prisma.activityLog.create({
    data: {
      userId: rejected.userId,
      action: 'REGISTRATION_REJECTED',
      target: rejected.program.title,
      targetId: rejected.programId
    }
  })
  console.log('[성공] 활동 로그 기록됨')

  // 4. 최종 상태 확인
  console.log('\n--- 최종 신청 현황 ---')
  const allRegs = await prisma.registration.findMany({
    where: {
      OR: [
        { userId: 'cmk90mokt0006b0asb6jno7mw' },
        { userId: 'cmk90mokt0000b0asctj214zt' }
      ]
    },
    include: { user: true, program: true },
    orderBy: { createdAt: 'desc' },
    take: 5
  })

  allRegs.forEach(reg => {
    const statusLabel = {
      APPROVED: '✅ 승인됨',
      PENDING: '⏳ 대기중',
      REJECTED: '❌ 거절됨',
      CANCELLED: '🚫 취소됨'
    }[reg.status] || reg.status
    console.log(`${reg.user.name} - ${reg.program.title}: ${statusLabel}`)
  })

  // 5. 활동 로그 확인
  console.log('\n--- 최근 활동 로그 ---')
  const logs = await prisma.activityLog.findMany({
    where: {
      action: { in: ['REGISTRATION_APPROVED', 'REGISTRATION_REJECTED'] }
    },
    include: { user: true },
    orderBy: { createdAt: 'desc' },
    take: 5
  })

  logs.forEach(log => {
    console.log(`${log.user?.name}: ${log.action} - ${log.target}`)
  })

  console.log('\n=== 테스트 완료 ===')
}

testApproval()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
