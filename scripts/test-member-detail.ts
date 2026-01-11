import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function testMemberDetail() {
  console.log('=== 회원 상세 신청내역 테스트 ===\n')

  const memberId = 'cmk90mokt0000b0asctj214zt' // 김철수

  // getMember 함수 시뮬레이션
  const member = await prisma.user.findUnique({
    where: { id: memberId },
    include: {
      registrations: {
        include: {
          program: { select: { id: true, title: true, type: true } }
        }
      },
      donations: {
        where: { status: 'COMPLETED' },
        orderBy: { createdAt: 'desc' },
        take: 10
      }
    }
  })

  if (!member) {
    console.log('회원을 찾을 수 없습니다.')
    return
  }

  console.log('회원 정보:')
  console.log(`  이름: ${member.name}`)
  console.log(`  이메일: ${member.email}`)
  console.log(`  포인트: ${member.points}P`)
  console.log(`  가입일: ${new Date(member.createdAt).toLocaleDateString('ko-KR')}`)

  console.log('\n--- 참여 프로그램 목록 ---')
  if (member.registrations.length === 0) {
    console.log('참여한 프로그램이 없습니다.')
  } else {
    member.registrations.forEach((reg, i) => {
      const statusLabel = {
        APPROVED: '✅ 승인',
        PENDING: '⏳ 대기',
        REJECTED: '❌ 거절',
        CANCELLED: '🚫 취소'
      }[reg.status] || reg.status

      const typeLabel = {
        BOOKCLUB: '독서모임',
        SEMINAR: '세미나',
        KMOVE: 'K-Move',
        WORKSHOP: '워크샵'
      }[reg.program.type] || reg.program.type

      console.log(`${i + 1}. ${reg.program.title}`)
      console.log(`   유형: ${typeLabel} | 상태: ${statusLabel}`)
    })
  }

  console.log('\n--- 후원 내역 ---')
  if (member.donations.length === 0) {
    console.log('후원 내역이 없습니다.')
  } else {
    const total = member.donations.reduce((sum, d) => sum + d.amount, 0)
    member.donations.forEach((d, i) => {
      console.log(`${i + 1}. ₩${d.amount.toLocaleString()} (${new Date(d.createdAt).toLocaleDateString('ko-KR')})`)
    })
    console.log(`총 후원금: ₩${total.toLocaleString()}`)
  }

  // 다른 회원도 테스트
  console.log('\n\n=== 정미영 회원 신청내역 ===')
  const member2 = await prisma.user.findFirst({
    where: { name: '정미영' },
    include: {
      registrations: {
        include: {
          program: { select: { id: true, title: true, type: true } }
        }
      }
    }
  })

  if (member2) {
    console.log(`이름: ${member2.name}`)
    console.log(`참여 프로그램: ${member2.registrations.length}개`)
    member2.registrations.forEach((reg, i) => {
      const statusLabel = {
        APPROVED: '✅ 승인',
        PENDING: '⏳ 대기',
        REJECTED: '❌ 거절',
        CANCELLED: '🚫 취소'
      }[reg.status] || reg.status
      console.log(`  ${i + 1}. ${reg.program.title} - ${statusLabel}`)
    })
  }

  console.log('\n=== 테스트 완료 ===')
}

testMemberDetail()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
