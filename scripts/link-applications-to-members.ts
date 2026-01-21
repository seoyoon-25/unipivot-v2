/**
 * 기존 ProgramApplication에 memberId 연결하는 마이그레이션 스크립트
 *
 * 실행: npx ts-node scripts/link-applications-to-members.ts
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function linkApplicationsToMembers() {
  console.log('Starting migration: Link applications to members...\n')

  // memberId가 없는 신청 조회
  const applications = await prisma.programApplication.findMany({
    where: { memberId: null },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      userId: true,
    }
  })

  console.log(`Found ${applications.length} applications without memberId\n`)

  let linkedCount = 0
  let notFoundCount = 0

  for (const app of applications) {
    let member = null

    // 1. User와 연동된 Member 확인
    if (app.userId) {
      member = await prisma.member.findFirst({
        where: { userId: app.userId }
      })
      if (member) {
        console.log(`[User Link] ${app.name} -> Member ${member.memberCode}`)
      }
    }

    // 2. email로 Member 매칭
    if (!member && app.email) {
      member = await prisma.member.findFirst({
        where: { email: app.email }
      })
      if (member) {
        console.log(`[Email Match] ${app.name} (${app.email}) -> Member ${member.memberCode}`)
      }
    }

    // 3. phone으로 Member 매칭
    if (!member && app.phone) {
      member = await prisma.member.findFirst({
        where: { phone: app.phone }
      })
      if (member) {
        console.log(`[Phone Match] ${app.name} (${app.phone}) -> Member ${member.memberCode}`)
      }
    }

    // 매칭된 경우 업데이트
    if (member) {
      await prisma.programApplication.update({
        where: { id: app.id },
        data: {
          memberId: member.id,
          matchedMemberId: member.id,
          matchedMemberCode: member.memberCode,
          memberGrade: member.grade,
          memberStatus: member.status,
        }
      })
      linkedCount++
    } else {
      console.log(`[Not Found] ${app.name} (${app.email || app.phone || 'no contact'})`)
      notFoundCount++
    }
  }

  console.log('\n--- Migration Complete ---')
  console.log(`Linked: ${linkedCount}`)
  console.log(`Not Found: ${notFoundCount}`)
  console.log(`Total: ${applications.length}`)
}

linkApplicationsToMembers()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
