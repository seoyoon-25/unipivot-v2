import { PrismaClient as PostgresClient } from '@prisma/client'
import Database from 'better-sqlite3'

const sqliteDb = new Database('./prisma/data/unipivot.db')
const postgresDb = new PostgresClient()

async function migrate() {
  console.log('=== SQLite → PostgreSQL 마이그레이션 시작 ===\n')

  try {
    // 1. Users
    console.log('1. Users 마이그레이션...')
    const users = sqliteDb.prepare('SELECT * FROM User').all() as any[]
    for (const user of users) {
      await postgresDb.user.upsert({
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
          birthYear: user.birthYear,
          occupation: user.occupation,
          bio: user.bio,
          points: user.points || 0,
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
    const programs = sqliteDb.prepare('SELECT * FROM Program').all() as any[]
    for (const prog of programs) {
      await postgresDb.program.upsert({
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
          capacity: prog.capacity || 30,
          fee: prog.fee || 0,
          location: prog.location,
          isOnline: prog.isOnline === 1,
          status: prog.status || 'DRAFT',
          startDate: prog.startDate ? new Date(prog.startDate) : null,
          endDate: prog.endDate ? new Date(prog.endDate) : null,
          createdAt: new Date(prog.createdAt),
          updatedAt: new Date(prog.updatedAt),
        },
      })
    }
    console.log(`   ${programs.length}개 레코드 완료`)

    // 3. Registrations
    console.log('3. Registrations 마이그레이션...')
    const registrations = sqliteDb.prepare('SELECT * FROM Registration').all() as any[]
    for (const reg of registrations) {
      await postgresDb.registration.upsert({
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

    // 4. Books
    console.log('4. Books 마이그레이션...')
    const books = sqliteDb.prepare('SELECT * FROM Book').all() as any[]
    for (const book of books) {
      await postgresDb.book.upsert({
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

    // 5. BookReports
    console.log('5. BookReports 마이그레이션...')
    const bookReports = sqliteDb.prepare('SELECT * FROM BookReport').all() as any[]
    for (const report of bookReports) {
      await postgresDb.bookReport.upsert({
        where: { id: report.id },
        update: {},
        create: {
          id: report.id,
          userId: report.userId,
          bookId: report.bookId,
          title: report.title,
          content: report.content,
          isPublic: report.isPublic === 1,
          createdAt: new Date(report.createdAt),
          updatedAt: new Date(report.updatedAt),
        },
      })
    }
    console.log(`   ${bookReports.length}개 레코드 완료`)

    // 6. Donations
    console.log('6. Donations 마이그레이션...')
    const donations = sqliteDb.prepare('SELECT * FROM Donation').all() as any[]
    for (const don of donations) {
      await postgresDb.donation.upsert({
        where: { id: don.id },
        update: {},
        create: {
          id: don.id,
          userId: don.userId,
          amount: don.amount,
          type: don.type,
          method: don.method,
          message: don.message,
          anonymous: don.anonymous === 1,
          status: don.status || 'PENDING',
          createdAt: new Date(don.createdAt),
        },
      })
    }
    console.log(`   ${donations.length}개 레코드 완료`)

    // 7. PointHistory
    console.log('7. PointHistory 마이그레이션...')
    const pointHistory = sqliteDb.prepare('SELECT * FROM PointHistory').all() as any[]
    for (const ph of pointHistory) {
      await postgresDb.pointHistory.upsert({
        where: { id: ph.id },
        update: {},
        create: {
          id: ph.id,
          userId: ph.userId,
          amount: ph.amount,
          type: ph.type,
          category: ph.category,
          description: ph.description,
          balance: ph.balance,
          createdAt: new Date(ph.createdAt),
        },
      })
    }
    console.log(`   ${pointHistory.length}개 레코드 완료`)

    // 8. Notices
    console.log('8. Notices 마이그레이션...')
    const notices = sqliteDb.prepare('SELECT * FROM Notice').all() as any[]
    for (const notice of notices) {
      await postgresDb.notice.upsert({
        where: { id: notice.id },
        update: {},
        create: {
          id: notice.id,
          title: notice.title,
          content: notice.content,
          isPinned: notice.isPinned === 1,
          isPublic: notice.isPublic === 1,
          views: notice.views || 0,
          createdAt: new Date(notice.createdAt),
          updatedAt: new Date(notice.updatedAt),
        },
      })
    }
    console.log(`   ${notices.length}개 레코드 완료`)

    // 9. ActivityLogs
    console.log('9. ActivityLogs 마이그레이션...')
    const activityLogs = sqliteDb.prepare('SELECT * FROM ActivityLog').all() as any[]
    for (const log of activityLogs) {
      await postgresDb.activityLog.upsert({
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

  } catch (error) {
    console.error('마이그레이션 오류:', error)
    throw error
  } finally {
    sqliteDb.close()
    await postgresDb.$disconnect()
  }
}

migrate()
