import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function testRegistration() {
  console.log('=== 프로그램 신청 기능 테스트 ===\n')

  // 테스트할 사용자와 프로그램
  const testUserId = 'cmk90mokt0005b0asky1qyznd' // 한동원
  const testProgramId = 'cmk90moqh0007b0asqmagya6s' // DMZ 평화 탐방

  // 1. 사용자 정보 확인
  const user = await prisma.user.findUnique({ where: { id: testUserId } })
  console.log('테스트 사용자:', user?.name, `(${user?.email})`)

  // 2. 프로그램 정보 확인
  const program = await prisma.program.findUnique({
    where: { id: testProgramId },
    include: { _count: { select: { registrations: { where: { status: 'APPROVED' } } } } }
  })
  console.log('테스트 프로그램:', program?.title)
  console.log('현재 참가자:', program?._count.registrations, '/', program?.capacity)
  console.log('상태:', program?.status)

  // 3. 기존 신청 여부 확인
  const existing = await prisma.registration.findUnique({
    where: { userId_programId: { userId: testUserId, programId: testProgramId } }
  })

  if (existing) {
    console.log('\n[!] 이미 신청한 프로그램입니다. 신청 내역:', existing.status)

    // 테스트를 위해 기존 신청 삭제
    console.log('[테스트] 기존 신청을 삭제하고 다시 테스트합니다...')
    await prisma.registration.delete({ where: { id: existing.id } })
  }

  // 4. 프로그램 신청 테스트
  console.log('\n--- 신청 테스트 시작 ---')

  try {
    // 신청 생성
    const registration = await prisma.registration.create({
      data: {
        userId: testUserId,
        programId: testProgramId,
        status: program!._count.registrations < program!.capacity ? 'APPROVED' : 'PENDING'
      }
    })
    console.log('[성공] 신청 완료!')
    console.log('신청 ID:', registration.id)
    console.log('신청 상태:', registration.status)

    // 활동 로그 기록
    await prisma.activityLog.create({
      data: {
        userId: testUserId,
        action: 'PROGRAM_REGISTER',
        target: program!.title,
        targetId: testProgramId
      }
    })
    console.log('[성공] 활동 로그 기록됨')

    // 5. 신청 후 참가자 수 확인
    const updatedProgram = await prisma.program.findUnique({
      where: { id: testProgramId },
      include: { _count: { select: { registrations: { where: { status: 'APPROVED' } } } } }
    })
    console.log('\n--- 신청 후 현황 ---')
    console.log('현재 참가자:', updatedProgram?._count.registrations, '/', updatedProgram?.capacity)

    // 6. 중복 신청 테스트
    console.log('\n--- 중복 신청 테스트 ---')
    try {
      const duplicateCheck = await prisma.registration.findUnique({
        where: { userId_programId: { userId: testUserId, programId: testProgramId } }
      })
      if (duplicateCheck) {
        console.log('[정상] 중복 신청 방지: 이미 신청한 프로그램입니다.')
      }
    } catch (err) {
      console.log('[오류]', err)
    }

    // 7. 신청 취소 테스트
    console.log('\n--- 신청 취소 테스트 ---')
    await prisma.registration.update({
      where: { id: registration.id },
      data: { status: 'CANCELLED' }
    })
    console.log('[성공] 신청이 취소되었습니다.')

    // 취소 후 참가자 수 확인
    const afterCancel = await prisma.program.findUnique({
      where: { id: testProgramId },
      include: { _count: { select: { registrations: { where: { status: 'APPROVED' } } } } }
    })
    console.log('취소 후 참가자:', afterCancel?._count.registrations, '/', afterCancel?.capacity)

    // 테스트 데이터 정리 (신청 기록은 유지)
    await prisma.registration.update({
      where: { id: registration.id },
      data: { status: 'APPROVED' }
    })
    console.log('\n[정리] 테스트 신청을 APPROVED 상태로 복원했습니다.')

  } catch (error) {
    console.error('[실패]', error)
  }

  console.log('\n=== 테스트 완료 ===')
}

testRegistration()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
