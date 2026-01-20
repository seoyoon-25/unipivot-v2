/**
 * PostgreSQL → SQLite 데이터 마이그레이션 스크립트
 *
 * 사용법: npx ts-node scripts/migrate-to-sqlite.ts
 */

import { Client } from 'pg'
import Database from 'better-sqlite3'

const SQLITE_PATH = './prisma/data/unipivot.db'
const POSTGRES_CONFIG = {
  host: 'localhost',
  user: 'unipivot',
  password: 'unipivot',
  database: 'unipivot',
}

// 테이블 순서 (외래키 의존성 고려)
const TABLES = [
  'User',
  'Account',
  'Session',
  'VerificationToken',
  'PasswordResetToken',
  'Book',
  'Program',
  'ProgramSession',
  'AttendanceQR',
  'DepositSetting',
  'BookOnProgram',
  'ProgramGallery',
  'ProgramLike',
  'ProgramApplication',
  'ProgramParticipant',
  'ProgramAttendance',
  'ProgramReport',
  'ReportComment',
  'ReportLike',
  'BookSuggestion',
  'BookVote',
  'BookReport',
  'BookReportComment',
  'BookReportLike',
  'ReadBook',
  'SatisfactionSurvey',
  'SurveyResponse',
  'SurveyReminder',
  'Notice',
  'BlogPost',
  'SiteSection',
  'SiteSetting',
  'SiteSettings',
  'Banner',
  'BannerAnalytics',
  'BannerDismissal',
  'AnnouncementBanner',
  'Popup',
  'PopupTemplate',
  'PopupDismissal',
  'PopupInteraction',
  'PopupAnalytics',
  'FloatingButton',
  'FloatingButtonDismissal',
  'FloatingButtonAnalytics',
  'Page',
  'PageContent',
  'Menu',
  'ActivityLog',
  'NotificationLog',
  'AdminNotification',
  'Notification',
  'BankAccount',
  'RewardClaim',
  'Interest',
  'InterestKeyword',
  'InterestLike',
  'InterestKeywordLike',
  'ApplicationForm',
  'LabProfile',
  'LabSurvey',
  'ResearchParticipation',
  'ConsultingRequest',
  'LectureRequest',
  'LectureMatch',
  'SurveyRequest',
  'Expert',
  'ExpertProfile',
  'Talent',
  'Member',
  'MemberGradeHistory',
  'MemberAttendance',
  'MemberNote',
  'MemberStats',
  'MemberStatusLog',
  'Document',
  'Registration',
  'Partner',
  'Project',
  'Milestone',
  'PartnerOnProject',
  'Donor',
  'Donation',
  'FinanceDonation',
  'FinanceProject',
  'Fund',
  'Budget',
  'BudgetItem',
  'ProjectBudgetItem',
  'ProjectDocument',
  'FinanceAccount',
  'FinanceTransaction',
  'Receipt',
  'FiscalYear',
  'Deposit',
  'RefundHistory',
  'CalendarEvent',
  'ChatLog',
  'KnowledgeBase',
  'EmailLog',
  'NotificationTemplate',
  'Transaction',
  'TeamMember',
  'UserThemePreference',
  'ThemeSettings',
  'ThemeAnalytics',
  'SeoSetting',
  'SeoTemplate',
  'GlobalSeoSetting',
  'GlobalScript',
  'CustomCode',
  'CustomCodeDependency',
  'CustomCodeExecution',
  'CodeLibrary',
  'ContentTemplate',
  'PreviewSession',
  'PreviewSnapshot',
  'PreviewDevice',
  'PreviewChange',
  'ChangeHistory',
  'Rollback',
  'BackupConfig',
  'RestorePoint',
  'SystemSetting',
  'InterestSetting',
  'CooperationSection',
]

async function main() {
  console.log('🚀 PostgreSQL → SQLite 마이그레이션 시작\n')

  // PostgreSQL 연결
  const pg = new Client(POSTGRES_CONFIG)
  await pg.connect()
  console.log('✅ PostgreSQL 연결됨')

  // SQLite 연결
  const sqlite = new Database(SQLITE_PATH)
  sqlite.pragma('foreign_keys = OFF')
  sqlite.pragma('journal_mode = WAL')
  console.log('✅ SQLite 연결됨\n')

  let successCount = 0
  let skipCount = 0
  let errorCount = 0

  try {
    for (const table of TABLES) {
      const result = await migrateTable(pg, sqlite, table)
      if (result === 'success') successCount++
      else if (result === 'skip') skipCount++
      else errorCount++
    }

    console.log('\n' + '='.repeat(50))
    console.log('📊 마이그레이션 결과:')
    console.log(`  ✅ 성공: ${successCount}개 테이블`)
    console.log(`  ⏭️  스킵: ${skipCount}개 테이블`)
    console.log(`  ❌ 오류: ${errorCount}개 테이블`)

    // 검증
    console.log('\n📊 데이터 검증:')
    const tables = ['User', 'Program', 'ProgramApplication', 'Notice', 'Book']
    for (const t of tables) {
      try {
        const result = sqlite.prepare(`SELECT COUNT(*) as count FROM "${t}"`).get() as any
        console.log(`  - ${t}: ${result?.count || 0}개`)
      } catch {
        console.log(`  - ${t}: 테이블 없음`)
      }
    }

  } finally {
    sqlite.pragma('foreign_keys = ON')
    sqlite.close()
    await pg.end()
  }

  console.log('\n🎉 마이그레이션 완료!')
}

async function migrateTable(pg: Client, sqlite: Database.Database, tableName: string): Promise<'success' | 'skip' | 'error'> {
  try {
    // PostgreSQL에서 데이터 조회
    const result = await pg.query(`SELECT * FROM "${tableName}"`)
    const rows = result.rows

    if (!rows || rows.length === 0) {
      console.log(`⏭️  ${tableName}: 데이터 없음`)
      return 'skip'
    }

    const columns = Object.keys(rows[0])

    // INSERT 문 생성
    const placeholders = columns.map(() => '?').join(', ')
    const columnList = columns.map(c => `"${c}"`).join(', ')

    // 먼저 테이블 존재 확인
    const tableExists = sqlite.prepare(
      `SELECT name FROM sqlite_master WHERE type='table' AND name=?`
    ).get(tableName)

    if (!tableExists) {
      console.log(`⚠️  ${tableName}: SQLite 테이블 없음 (스킵)`)
      return 'skip'
    }

    const insertStmt = sqlite.prepare(
      `INSERT OR REPLACE INTO "${tableName}" (${columnList}) VALUES (${placeholders})`
    )

    // 트랜잭션으로 배치 삽입
    const insertMany = sqlite.transaction((dataRows: any[]) => {
      for (const row of dataRows) {
        const values = columns.map(col => {
          const val = row[col]
          if (val === null || val === undefined) return null
          if (val instanceof Date) return val.toISOString()
          if (typeof val === 'object') return JSON.stringify(val)
          if (typeof val === 'boolean') return val ? 1 : 0
          return val
        })
        insertStmt.run(...values)
      }
    })

    insertMany(rows)
    console.log(`✅ ${tableName}: ${rows.length}개 레코드 이전됨`)
    return 'success'

  } catch (error: any) {
    if (error.message?.includes('relation') && error.message?.includes('does not exist')) {
      console.log(`⚠️  ${tableName}: PostgreSQL에 테이블 없음 (스킵)`)
      return 'skip'
    } else if (error.message?.includes('no such table')) {
      console.log(`⚠️  ${tableName}: SQLite에 테이블 없음 (스킵)`)
      return 'skip'
    } else {
      console.log(`❌ ${tableName}: ${error.message}`)
      return 'error'
    }
  }
}

main().catch(console.error)
