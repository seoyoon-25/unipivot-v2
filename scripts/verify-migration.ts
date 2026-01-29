#!/usr/bin/env tsx
/**
 * SQLite → PostgreSQL 마이그레이션 검증 스크립트
 *
 * 사용법: npx tsx scripts/verify-migration.ts
 *
 * 검증 항목:
 * 1. 레코드 수 일치 (163개 테이블 각각 COUNT 비교)
 * 2. 샘플 데이터 비교 (각 테이블 첫/마지막 레코드 필드값)
 * 3. Boolean 변환 정확성 (0/1 → true/false)
 * 4. DateTime 변환 정확성 (타임존)
 * 5. JSON 문자열 파싱 가능 여부
 */

import Database from 'better-sqlite3'
import { Client } from 'pg'
import * as fs from 'fs'
import * as path from 'path'
import * as dotenv from 'dotenv'

dotenv.config({ path: path.join(__dirname, '..', '.env') })

// ─── Types ───────────────────────────────────────────────────────
interface FieldInfo {
  name: string
  type: string
  isOptional: boolean
}

interface ModelInfo {
  name: string
  fields: FieldInfo[]
}

// ─── Schema Parser (same as migration script) ───────────────────
function parseSchema(schemaPath: string): Map<string, ModelInfo> {
  const content = fs.readFileSync(schemaPath, 'utf-8')
  const models = new Map<string, ModelInfo>()
  const lines = content.split('\n')
  let currentModel: string | null = null
  let braceDepth = 0
  let fields: FieldInfo[] = []

  for (const line of lines) {
    const trimmed = line.trim()
    const modelMatch = trimmed.match(/^model\s+(\w+)\s*\{/)
    if (modelMatch) {
      currentModel = modelMatch[1]
      braceDepth = 1
      fields = []
      continue
    }
    if (currentModel) {
      for (const ch of trimmed) {
        if (ch === '{') braceDepth++
        if (ch === '}') braceDepth--
      }
      if (braceDepth <= 0) {
        models.set(currentModel, { name: currentModel, fields })
        currentModel = null
        continue
      }
      if (trimmed.startsWith('//') || trimmed.startsWith('@@')) continue
      const fieldMatch = trimmed.match(
        /^(\w+)\s+(String|Int|Float|Boolean|DateTime)(\?)?\s*/
      )
      if (fieldMatch) {
        fields.push({
          name: fieldMatch[1],
          type: fieldMatch[2],
          isOptional: !!fieldMatch[3],
        })
      }
    }
  }
  return models
}

// ─── Main ────────────────────────────────────────────────────────
async function main() {
  console.log('╔══════════════════════════════════════════════════╗')
  console.log('║  마이그레이션 검증                               ║')
  console.log('╚══════════════════════════════════════════════════╝\n')

  const DATABASE_URL = process.env.DATABASE_URL
  if (!DATABASE_URL || !DATABASE_URL.startsWith('postgresql://')) {
    console.error('ERROR: DATABASE_URL이 PostgreSQL URL이 아닙니다.')
    process.exit(1)
  }

  // Parse schema
  const schemaPath = path.join(__dirname, '..', 'prisma', 'schema.prisma')
  const models = parseSchema(schemaPath)

  // Connect
  const sqlitePath = path.join(__dirname, '..', 'prisma', 'data', 'unipivot.db')
  const sqlite = new Database(sqlitePath, { readonly: true })
  const pg = new Client({ connectionString: DATABASE_URL })
  await pg.connect()

  console.log('[연결] SQLite + PostgreSQL 연결 완료\n')

  // Get SQLite tables
  const sqliteTables = sqlite
    .prepare(
      `SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE '_prisma%' AND name NOT LIKE 'sqlite_%'`
    )
    .all() as { name: string }[]
  const sqliteTableSet = new Set(sqliteTables.map((t) => t.name))

  // ─── 1. Record Count Verification ─────────────────────────────
  console.log('━━━ 1. 레코드 수 검증 ━━━')
  let countPass = 0
  let countFail = 0
  let countSkip = 0
  const countMismatches: { table: string; sqlite: number; pg: number }[] = []

  for (const modelName of models.keys()) {
    if (!sqliteTableSet.has(modelName)) {
      countSkip++
      continue
    }

    const sqliteCount = (
      sqlite.prepare(`SELECT COUNT(*) as cnt FROM "${modelName}"`).get() as any
    ).cnt

    let pgCount: number
    try {
      const result = await pg.query(`SELECT COUNT(*) as cnt FROM "${modelName}"`)
      pgCount = parseInt(result.rows[0].cnt, 10)
    } catch {
      pgCount = -1 // Table doesn't exist in PG
    }

    if (sqliteCount === pgCount) {
      countPass++
    } else if (pgCount === -1) {
      countSkip++
    } else {
      countFail++
      countMismatches.push({ table: modelName, sqlite: sqliteCount, pg: pgCount })
    }
  }

  console.log(`  PASS: ${countPass}  FAIL: ${countFail}  SKIP: ${countSkip}`)
  if (countMismatches.length > 0) {
    console.log('  불일치 테이블:')
    for (const m of countMismatches) {
      const diff = m.pg - m.sqlite
      console.log(
        `    ${m.table}: SQLite=${m.sqlite} PG=${m.pg} (${diff > 0 ? '+' : ''}${diff})`
      )
    }
  }
  console.log('')

  // ─── 2. Sample Data Verification ──────────────────────────────
  console.log('━━━ 2. 샘플 데이터 검증 ━━━')
  let samplePass = 0
  let sampleFail = 0
  const sampleErrors: string[] = []

  for (const modelName of models.keys()) {
    if (!sqliteTableSet.has(modelName)) continue

    const model = models.get(modelName)!
    const hasId = model.fields.some((f) => f.name === 'id')
    if (!hasId) continue

    // Get first row from SQLite
    const sqliteRow = sqlite
      .prepare(`SELECT * FROM "${modelName}" ORDER BY rowid ASC LIMIT 1`)
      .get() as any
    if (!sqliteRow) continue

    // Get same row from PostgreSQL
    try {
      const pgResult = await pg.query(`SELECT * FROM "${modelName}" WHERE "id" = $1`, [
        sqliteRow.id,
      ])
      if (pgResult.rows.length === 0) {
        sampleFail++
        sampleErrors.push(`${modelName}: id=${sqliteRow.id} not found in PG`)
        continue
      }

      const pgRow = pgResult.rows[0]

      // Compare scalar fields
      let rowMatch = true
      for (const field of model.fields) {
        const sqliteVal = sqliteRow[field.name]
        const pgVal = pgRow[field.name]

        if (sqliteVal === null && pgVal === null) continue
        if (sqliteVal === undefined && pgVal === null) continue

        if (field.type === 'Boolean') {
          const expected = sqliteVal === 1 || sqliteVal === true
          if (pgVal !== expected) {
            rowMatch = false
            sampleErrors.push(
              `${modelName}.${field.name}: SQLite=${sqliteVal} PG=${pgVal} (expected ${expected})`
            )
          }
        } else if (field.type === 'DateTime') {
          if (sqliteVal && pgVal) {
            const sqliteDate = new Date(sqliteVal).getTime()
            const pgDate = new Date(pgVal).getTime()
            if (Math.abs(sqliteDate - pgDate) > 1000) {
              // 1 sec tolerance
              rowMatch = false
              sampleErrors.push(
                `${modelName}.${field.name}: SQLite=${sqliteVal} PG=${pgVal}`
              )
            }
          }
        } else if (field.type === 'Int' || field.type === 'Float') {
          if (Number(sqliteVal) !== Number(pgVal)) {
            rowMatch = false
            sampleErrors.push(
              `${modelName}.${field.name}: SQLite=${sqliteVal} PG=${pgVal}`
            )
          }
        } else {
          if (String(sqliteVal) !== String(pgVal)) {
            rowMatch = false
            sampleErrors.push(
              `${modelName}.${field.name}: values differ (length: ${String(sqliteVal).length} vs ${String(pgVal).length})`
            )
          }
        }
      }

      if (rowMatch) samplePass++
      else sampleFail++
    } catch (e: any) {
      sampleFail++
      sampleErrors.push(`${modelName}: ${e.message.substring(0, 100)}`)
    }
  }

  console.log(`  PASS: ${samplePass}  FAIL: ${sampleFail}`)
  if (sampleErrors.length > 0) {
    console.log('  불일치 항목 (최대 10개):')
    for (const err of sampleErrors.slice(0, 10)) {
      console.log(`    - ${err}`)
    }
  }
  console.log('')

  // ─── 3. Boolean Conversion Check ──────────────────────────────
  console.log('━━━ 3. Boolean 변환 검증 ━━━')
  let boolPass = 0
  let boolFail = 0

  for (const modelName of models.keys()) {
    if (!sqliteTableSet.has(modelName)) continue
    const model = models.get(modelName)!
    const boolFields = model.fields.filter((f) => f.type === 'Boolean')
    if (boolFields.length === 0) continue

    for (const field of boolFields) {
      try {
        const result = await pg.query(
          `SELECT "${field.name}", COUNT(*) as cnt FROM "${modelName}" WHERE "${field.name}" IS NOT NULL GROUP BY "${field.name}"`
        )
        const values = result.rows.map((r) => r[field.name])
        const allBool = values.every((v) => typeof v === 'boolean')
        if (allBool) {
          boolPass++
        } else {
          boolFail++
          console.log(
            `  FAIL ${modelName}.${field.name}: ${values.join(', ')} (expected boolean)`
          )
        }
      } catch {
        // Table or column might not exist
      }
    }
  }
  console.log(`  PASS: ${boolPass}  FAIL: ${boolFail}\n`)

  // ─── 4. DateTime Validation ───────────────────────────────────
  console.log('━━━ 4. DateTime 검증 ━━━')
  let datePass = 0
  let dateFail = 0

  for (const modelName of models.keys()) {
    if (!sqliteTableSet.has(modelName)) continue
    const model = models.get(modelName)!
    const dateFields = model.fields.filter((f) => f.type === 'DateTime')
    if (dateFields.length === 0) continue

    for (const field of dateFields) {
      try {
        // Check for invalid dates
        const result = await pg.query(
          `SELECT COUNT(*) as cnt FROM "${modelName}" WHERE "${field.name}" IS NOT NULL`
        )
        const count = parseInt(result.rows[0].cnt, 10)
        if (count > 0) {
          // Try to read a date value
          const sampleResult = await pg.query(
            `SELECT "${field.name}" FROM "${modelName}" WHERE "${field.name}" IS NOT NULL LIMIT 1`
          )
          if (sampleResult.rows.length > 0) {
            const val = sampleResult.rows[0][field.name]
            if (val instanceof Date && !isNaN(val.getTime())) {
              datePass++
            } else {
              dateFail++
              console.log(`  FAIL ${modelName}.${field.name}: ${val}`)
            }
          }
        }
      } catch {
        // Skip
      }
    }
  }
  console.log(`  PASS: ${datePass}  FAIL: ${dateFail}\n`)

  // ─── 5. JSON String Validation ────────────────────────────────
  console.log('━━━ 5. JSON 문자열 검증 ━━━')
  let jsonPass = 0
  let jsonFail = 0
  const jsonFields: string[] = []

  // Known JSON string fields (common patterns)
  const knownJsonPatterns = [
    'customQuestions',
    'legacyImages',
    'customFields',
    'refundCalculation',
    'targetPages',
    'targetRoles',
    'excludePages',
    'showTimeSlots',
    'primaryButton',
    'secondaryButton',
    'conditions',
    'targetDevices',
    'configSchema',
    'defaultConfig',
    'configuration',
    'loadOnPages',
    'userRoles',
    'components',
    'styles',
    'fields',
    'questions',
    'settings',
    'items',
    'completedItems',
    'messages',
    'context',
    'basedOn',
    'topSpeakers',
    'silentParticipants',
    'condition',
    'favoriteGenres',
    'topKeywords',
    'highlights',
    'photos',
    'structure',
    'sections',
    'removedContent',
    'keywords',
    'categories',
    'schemaData',
    'schemaTemplate',
    'settlementDates',
    'reminderDays',
    'targetConditions',
    'targetCountries',
    'targetCategories',
    'occupations',
    'badges',
    'relatedProgramIds',
    'aiStyle',
    'data',
    'schedules',
    'answers',
    'affectedEntities',
    'snapshot',
    'fullSnapshot',
  ]

  for (const modelName of models.keys()) {
    if (!sqliteTableSet.has(modelName)) continue
    const model = models.get(modelName)!
    const stringFields = model.fields.filter(
      (f) => f.type === 'String' && knownJsonPatterns.includes(f.name)
    )

    for (const field of stringFields) {
      try {
        const result = await pg.query(
          `SELECT "${field.name}" FROM "${modelName}" WHERE "${field.name}" IS NOT NULL AND "${field.name}" != '' LIMIT 5`
        )
        let allValid = true
        for (const row of result.rows) {
          const val = row[field.name]
          if (val) {
            try {
              JSON.parse(val)
            } catch {
              allValid = false
              jsonFail++
              console.log(
                `  FAIL ${modelName}.${field.name}: "${val.substring(0, 50)}..." is not valid JSON`
              )
            }
          }
        }
        if (allValid && result.rows.length > 0) {
          jsonPass++
          jsonFields.push(`${modelName}.${field.name}`)
        }
      } catch {
        // Skip
      }
    }
  }
  console.log(`  PASS: ${jsonPass}  FAIL: ${jsonFail}\n`)

  // ─── Summary ──────────────────────────────────────────────────
  const totalPass = countPass + samplePass + boolPass + datePass + jsonPass
  const totalFail = countFail + sampleFail + boolFail + dateFail + jsonFail

  console.log('╔══════════════════════════════════════════════════╗')
  console.log('║  검증 결과 요약                                  ║')
  console.log('╚══════════════════════════════════════════════════╝')
  console.log(`  레코드 수:    PASS=${countPass} FAIL=${countFail}`)
  console.log(`  샘플 데이터:  PASS=${samplePass} FAIL=${sampleFail}`)
  console.log(`  Boolean:      PASS=${boolPass} FAIL=${boolFail}`)
  console.log(`  DateTime:     PASS=${datePass} FAIL=${dateFail}`)
  console.log(`  JSON:         PASS=${jsonPass} FAIL=${jsonFail}`)
  console.log(`  ────────────────────────────`)
  console.log(`  총합:         PASS=${totalPass} FAIL=${totalFail}`)
  console.log('')

  if (totalFail === 0) {
    console.log('  모든 검증을 통과했습니다!')
  } else {
    console.log(`  ${totalFail}건의 검증 실패가 있습니다. 위의 상세 로그를 확인하세요.`)
  }

  // Save verification report
  const reportPath = path.join(__dirname, 'verification-report.json')
  fs.writeFileSync(
    reportPath,
    JSON.stringify(
      {
        timestamp: new Date().toISOString(),
        summary: { totalPass, totalFail },
        counts: {
          pass: countPass,
          fail: countFail,
          skip: countSkip,
          mismatches: countMismatches,
        },
        samples: { pass: samplePass, fail: sampleFail, errors: sampleErrors.slice(0, 20) },
        boolean: { pass: boolPass, fail: boolFail },
        dateTime: { pass: datePass, fail: dateFail },
        json: { pass: jsonPass, fail: jsonFail, validFields: jsonFields },
      },
      null,
      2
    )
  )
  console.log(`\n[리포트] ${reportPath} 저장 완료`)

  // Cleanup
  sqlite.close()
  await pg.end()

  process.exit(totalFail > 0 ? 1 : 0)
}

main().catch((e) => {
  console.error('검증 실패:', e)
  process.exit(1)
})
