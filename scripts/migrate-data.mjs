import { PrismaClient } from '@prisma/client'
import { execSync } from 'child_process'
import { readFileSync, writeFileSync } from 'fs'

const prisma = new PrismaClient()

function queryJsonFromSqlite(sql) {
  const result = execSync(`sqlite3 -json prisma/data/unipivot.db "${sql}"`, {
    encoding: 'utf-8',
    maxBuffer: 50 * 1024 * 1024
  })
  return result.trim() ? JSON.parse(result) : []
}

async function migrate() {
  console.log('=== SQLite → PostgreSQL 마이그레이션 시작 ===\n')

  try {
    // 1. Users
    console.log('1. Users 마이그레이션...')
    const users = queryJsonFromSqlite('SELECT * FROM User')
    for (const user of users) {
      await prisma.user.upsert({
        where: { id: user.id },
        update: {},
        create: {
          id: user.id,
          name: user.name,
          email: user.email,
          emailVerified: user.emailVerified ? new Date(user.emailVerified) : null,
          image: user.image,
          password: user.password,
          phone: user.phone,
          origin: user.origin,
          birthYear: user.birthYear ? parseInt(user.birthYear) : null,
          occupation: user.occupation,
          bio: user.bio,
          points: parseInt(user.points) || 0,
          role: user.role || 'USER',
          status: user.status || 'ACTIVE',
          createdAt: new Date(user.createdAt),
          updatedAt: new Date(user.updatedAt),
        },
      })
    }
    console.log(`   ${users.length}개 레코드 완료`)

    // 2. Programs
    console.log('2. Programs 마이그레이션...')
    const programs = queryJsonFromSqlite('SELECT * FROM Program')
    for (const prog of programs) {
      await prisma.program.upsert({
        where: { id: prog.id },
        update: {},
        create: {
          id: prog.id,
          title: prog.title,
          slug: prog.slug,
          type: prog.type,
          description: prog.description,
          content: prog.content,
          image: prog.image,
          capacity: parseInt(prog.capacity) || 30,
          fee: parseInt(prog.fee) || 0,
          location: prog.location,
          isOnline: prog.isOnline === 1 || prog.isOnline === '1',
          status: prog.status || 'DRAFT',
          startDate: prog.startDate ? new Date(prog.startDate) : null,
          endDate: prog.endDate ? new Date(prog.endDate) : null,
          createdAt: new Date(prog.createdAt),
          updatedAt: new Date(prog.updatedAt),
        },
      })
    }
    console.log(`   ${programs.length}개 레코드 완료`)

    // 3. Books
    console.log('3. Books 마이그레이션...')
    const books = queryJsonFromSqlite('SELECT * FROM Book')
    for (const book of books) {
      await prisma.book.upsert({
        where: { id: book.id },
        update: {},
        create: {
          id: book.id,
          title: book.title,
          author: book.author,
          publisher: book.publisher,
          isbn: book.isbn,
          image: book.image,
          summary: book.summary,
          createdAt: new Date(book.createdAt),
        },
      })
    }
    console.log(`   ${books.length}개 레코드 완료`)

    // 4. Registrations
    console.log('4. Registrations 마이그레이션...')
    const registrations = queryJsonFromSqlite('SELECT * FROM Registration')
    for (const reg of registrations) {
      await prisma.registration.upsert({
        where: { id: reg.id },
        update: {},
        create: {
          id: reg.id,
          userId: reg.userId,
          programId: reg.programId,
          status: reg.status || 'PENDING',
          note: reg.note,
          createdAt: new Date(reg.createdAt),
          updatedAt: new Date(reg.updatedAt),
        },
      })
    }
    console.log(`   ${registrations.length}개 레코드 완료`)

    // 5. BookReports
    console.log('5. BookReports 마이그레이션...')
    const bookReports = queryJsonFromSqlite('SELECT * FROM BookReport')
    for (const report of bookReports) {
      await prisma.bookReport.upsert({
        where: { id: report.id },
        update: {},
        create: {
          id: report.id,
          userId: report.userId,
          bookId: report.bookId,
          title: report.title,
          content: report.content,
          isPublic: report.isPublic === 1 || report.isPublic === '1',
          createdAt: new Date(report.createdAt),
          updatedAt: new Date(report.updatedAt),
        },
      })
    }
    console.log(`   ${bookReports.length}개 레코드 완료`)

    // 6. Donations
    console.log('6. Donations 마이그레이션...')
    const donations = queryJsonFromSqlite('SELECT * FROM Donation')
    for (const don of donations) {
      await prisma.donation.upsert({
        where: { id: don.id },
        update: {},
        create: {
          id: don.id,
          userId: don.userId,
          amount: parseInt(don.amount),
          type: don.type,
          method: don.method,
          message: don.message,
          anonymous: don.anonymous === 1 || don.anonymous === '1',
          status: don.status || 'PENDING',
          createdAt: new Date(don.createdAt),
        },
      })
    }
    console.log(`   ${donations.length}개 레코드 완료`)

    // 7. PointHistory
    console.log('7. PointHistory 마이그레이션...')
    const pointHistory = queryJsonFromSqlite('SELECT * FROM PointHistory')
    for (const ph of pointHistory) {
      await prisma.pointHistory.upsert({
        where: { id: ph.id },
        update: {},
        create: {
          id: ph.id,
          userId: ph.userId,
          amount: parseInt(ph.amount),
          type: ph.type,
          category: ph.category,
          description: ph.description,
          balance: parseInt(ph.balance),
          createdAt: new Date(ph.createdAt),
        },
      })
    }
    console.log(`   ${pointHistory.length}개 레코드 완료`)

    // 8. Notices
    console.log('8. Notices 마이그레이션...')
    const notices = queryJsonFromSqlite('SELECT * FROM Notice')
    for (const notice of notices) {
      await prisma.notice.upsert({
        where: { id: notice.id },
        update: {},
        create: {
          id: notice.id,
          title: notice.title,
          content: notice.content,
          isPinned: notice.isPinned === 1 || notice.isPinned === '1',
          isPublic: notice.isPublic === 1 || notice.isPublic === '1',
          views: parseInt(notice.views) || 0,
          createdAt: new Date(notice.createdAt),
          updatedAt: new Date(notice.updatedAt),
        },
      })
    }
    console.log(`   ${notices.length}개 레코드 완료`)

    // 9. ActivityLogs
    console.log('9. ActivityLogs 마이그레이션...')
    const activityLogs = queryJsonFromSqlite('SELECT * FROM ActivityLog')
    for (const log of activityLogs) {
      await prisma.activityLog.upsert({
        where: { id: log.id },
        update: {},
        create: {
          id: log.id,
          userId: log.userId,
          action: log.action,
          target: log.target,
          targetId: log.targetId,
          details: log.details,
          ip: log.ip,
          userAgent: log.userAgent,
          createdAt: new Date(log.createdAt),
        },
      })
    }
    console.log(`   ${activityLogs.length}개 레코드 완료`)

    console.log('\n=== 마이그레이션 완료 ===')

    // Verify
    console.log('\n=== 데이터 검증 ===')
    const userCount = await prisma.user.count()
    const programCount = await prisma.program.count()
    const bookCount = await prisma.book.count()
    console.log(`Users: ${userCount}`)
    console.log(`Programs: ${programCount}`)
    console.log(`Books: ${bookCount}`)

  } catch (error) {
    console.error('마이그레이션 오류:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

migrate()
