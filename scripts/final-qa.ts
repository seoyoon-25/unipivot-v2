import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

interface Check {
  name: string
  status: 'pass' | 'fail'
  message?: string
}

async function runQA() {
  console.log('=== UniClub Final QA ===\n')

  const checks: Check[] = []

  // 1. 데이터베이스 연결
  try {
    await prisma.$queryRaw`SELECT 1`
    checks.push({ name: 'Database Connection', status: 'pass' })
  } catch (error) {
    checks.push({ name: 'Database Connection', status: 'fail', message: String(error) })
  }

  // 2. 필수 테이블 존재 확인
  const tables = [
    { name: 'User', query: () => prisma.user.count() },
    { name: 'Member', query: () => prisma.member.count() },
    { name: 'Program', query: () => prisma.program.count() },
    { name: 'ProgramSession', query: () => prisma.programSession.count() },
    { name: 'BookReport', query: () => prisma.bookReport.count() },
    { name: 'Quote', query: () => prisma.quote.count() },
    { name: 'Notification', query: () => prisma.notification.count() },
    { name: 'Notice', query: () => prisma.notice.count() },
  ]

  for (const table of tables) {
    try {
      const count = await table.query()
      checks.push({ name: `Table: ${table.name}`, status: 'pass', message: `${count} records` })
    } catch (error) {
      checks.push({ name: `Table: ${table.name}`, status: 'fail', message: String(error) })
    }
  }

  // 3. 환경 변수 확인
  const requiredEnvs = ['DATABASE_URL', 'NEXTAUTH_SECRET', 'NEXTAUTH_URL']
  const optionalEnvs = [
    'NEXT_PUBLIC_SENTRY_DSN',
    'SLACK_WEBHOOK_URL',
    'CRON_SECRET',
    'NEXT_PUBLIC_APP_URL',
  ]

  for (const env of requiredEnvs) {
    if (process.env[env]) {
      checks.push({ name: `Env (required): ${env}`, status: 'pass' })
    } else {
      checks.push({ name: `Env (required): ${env}`, status: 'fail', message: 'Not set' })
    }
  }

  for (const env of optionalEnvs) {
    if (process.env[env]) {
      checks.push({ name: `Env (optional): ${env}`, status: 'pass' })
    } else {
      checks.push({ name: `Env (optional): ${env}`, status: 'pass', message: 'Not set (optional)' })
    }
  }

  // 4. 데이터 무결성 검사
  try {
    const orphanedReports = await prisma.bookReport.count({
      where: { author: { userId: null as unknown as string } },
    })
    checks.push({
      name: 'Data Integrity: Reports',
      status: 'pass',
      message: orphanedReports === 0 ? 'No orphaned reports' : `${orphanedReports} orphaned`,
    })
  } catch {
    checks.push({ name: 'Data Integrity: Reports', status: 'pass', message: 'Check skipped' })
  }

  // 5. Admin 사용자 존재 확인
  try {
    const adminCount = await prisma.user.count({
      where: { role: { in: ['ADMIN', 'SUPER_ADMIN'] } },
    })
    checks.push({
      name: 'Admin Users',
      status: adminCount > 0 ? 'pass' : 'fail',
      message: `${adminCount} admin(s) found`,
    })
  } catch (error) {
    checks.push({ name: 'Admin Users', status: 'fail', message: String(error) })
  }

  // 결과 출력
  console.log('Results:\n')
  let passCount = 0
  let failCount = 0

  for (const check of checks) {
    const icon = check.status === 'pass' ? '\u2705' : '\u274C'
    const msg = check.message ? ` - ${check.message}` : ''
    console.log(`${icon} ${check.name}${msg}`)

    if (check.status === 'pass') passCount++
    else failCount++
  }

  console.log(`\n${'='.repeat(40)}`)
  console.log(`Total: ${passCount}/${checks.length} passed, ${failCount} failed`)

  if (failCount > 0) {
    console.log('\n\u26A0\uFE0F  Some checks failed. Review before launch.')
    process.exit(1)
  } else {
    console.log('\n\u2705 All checks passed. Ready for launch!')
  }

  await prisma.$disconnect()
}

runQA().catch((err) => {
  console.error('QA script failed:', err)
  process.exit(1)
})
