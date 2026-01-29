#!/usr/bin/env tsx
/**
 * SQLite → PostgreSQL 전체 마이그레이션 스크립트
 *
 * 사용법: npx tsx scripts/migrate-all-to-postgres.ts
 *
 * - better-sqlite3로 SQLite 읽기 (readonly)
 * - pg로 PostgreSQL 직접 쓰기 (ON CONFLICT DO NOTHING)
 * - schema.prisma 파싱으로 필드 타입 정보 추출
 * - 외래키 의존 순서(topological sort) 마이그레이션
 * - Boolean: 0/1 → true/false
 * - DateTime: 문자열 → Date 객체
 * - Int/Float: 문자열 → 숫자 변환
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
  type: 'String' | 'Int' | 'Float' | 'Boolean' | 'DateTime'
  isOptional: boolean
}

interface ModelInfo {
  name: string
  fields: FieldInfo[]
  dependencies: string[] // FK target model names
}

// ─── Schema Parser ───────────────────────────────────────────────
function parseSchema(schemaPath: string): Map<string, ModelInfo> {
  const content = fs.readFileSync(schemaPath, 'utf-8')
  const models = new Map<string, ModelInfo>()

  // Split by model blocks
  const lines = content.split('\n')
  let currentModel: string | null = null
  let braceDepth = 0
  let fields: FieldInfo[] = []
  let dependencies: string[] = []

  for (const line of lines) {
    const trimmed = line.trim()

    // Detect model start
    const modelMatch = trimmed.match(/^model\s+(\w+)\s*\{/)
    if (modelMatch) {
      currentModel = modelMatch[1]
      braceDepth = 1
      fields = []
      dependencies = []
      continue
    }

    if (currentModel) {
      // Track braces
      for (const ch of trimmed) {
        if (ch === '{') braceDepth++
        if (ch === '}') braceDepth--
      }

      if (braceDepth <= 0) {
        // Model block ended
        models.set(currentModel, { name: currentModel, fields, dependencies })
        currentModel = null
        continue
      }

      // Skip comments and directives
      if (trimmed.startsWith('//') || trimmed.startsWith('@@')) continue

      // Parse scalar fields: fieldName Type? @...
      const fieldMatch = trimmed.match(
        /^(\w+)\s+(String|Int|Float|Boolean|DateTime)(\?)?\s*/
      )
      if (fieldMatch) {
        fields.push({
          name: fieldMatch[1],
          type: fieldMatch[2] as FieldInfo['type'],
          isOptional: !!fieldMatch[3],
        })
      }

      // Parse relation to find FK dependencies
      const relationMatch = trimmed.match(
        /^(\w+)\s+(\w+)\??\s+@relation\(fields:\s*\[/
      )
      if (relationMatch) {
        const relatedModel = relationMatch[2]
        if (relatedModel !== currentModel && !dependencies.includes(relatedModel)) {
          dependencies.push(relatedModel)
        }
      }
    }
  }

  return models
}

// ─── Topological Sort ────────────────────────────────────────────
function topologicalSort(models: Map<string, ModelInfo>): string[] {
  const visited = new Set<string>()
  const visiting = new Set<string>()
  const result: string[] = []

  function visit(name: string) {
    if (visited.has(name)) return
    if (visiting.has(name)) {
      // Circular dependency → break cycle
      visited.add(name)
      result.push(name)
      return
    }

    visiting.add(name)
    const model = models.get(name)
    if (model) {
      for (const dep of model.dependencies) {
        if (models.has(dep) && dep !== name) {
          visit(dep)
        }
      }
    }
    visiting.delete(name)
    visited.add(name)
    result.push(name)
  }

  for (const name of models.keys()) {
    visit(name)
  }

  return result
}

// ─── Value Conversion ────────────────────────────────────────────
function convertValue(value: any, fieldType: string): any {
  if (value === null || value === undefined) return null

  switch (fieldType) {
    case 'Boolean':
      return value === 1 || value === true || value === '1' || value === 'true'
    case 'DateTime': {
      if (!value) return null
      const d = new Date(value)
      return isNaN(d.getTime()) ? null : d
    }
    case 'Int': {
      if (typeof value === 'number') return Math.floor(value)
      const n = parseInt(String(value), 10)
      return isNaN(n) ? null : n
    }
    case 'Float': {
      if (typeof value === 'number') return value
      const f = parseFloat(String(value))
      return isNaN(f) ? null : f
    }
    case 'String':
    default:
      return String(value)
  }
}

// ─── Main ────────────────────────────────────────────────────────
async function main() {
  const startTime = Date.now()
  console.log('╔══════════════════════════════════════════════════╗')
  console.log('║  SQLite → PostgreSQL 전체 마이그레이션           ║')
  console.log('╚══════════════════════════════════════════════════╝\n')

  // Validate DATABASE_URL
  const DATABASE_URL = process.env.DATABASE_URL
  if (!DATABASE_URL || !DATABASE_URL.startsWith('postgresql://')) {
    console.error('ERROR: DATABASE_URL이 PostgreSQL URL이 아닙니다.')
    console.error('현재값:', DATABASE_URL)
    console.error('.env 파일에 PostgreSQL URL을 설정하세요.')
    process.exit(1)
  }

  // Parse schema
  const schemaPath = path.join(__dirname, '..', 'prisma', 'schema.prisma')
  const models = parseSchema(schemaPath)
  console.log(`[스키마] ${models.size}개 모델 파싱 완료`)

  // Get dependency order
  const sortedModels = topologicalSort(models)
  console.log(`[순서] 토폴로지 정렬 완료\n`)

  // Connect to SQLite (readonly)
  const sqlitePath = path.join(__dirname, '..', 'prisma', 'data', 'unipivot.db')
  if (!fs.existsSync(sqlitePath)) {
    console.error(`ERROR: SQLite DB 파일을 찾을 수 없습니다: ${sqlitePath}`)
    process.exit(1)
  }
  const sqlite = new Database(sqlitePath, { readonly: true })
  console.log('[SQLite] 연결 완료 (readonly)')

  // Connect to PostgreSQL
  const pg = new Client({ connectionString: DATABASE_URL })
  await pg.connect()
  console.log('[PostgreSQL] 연결 완료')

  // Get list of existing SQLite tables
  const sqliteTables = sqlite
    .prepare(
      `SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE '_prisma%' AND name NOT LIKE 'sqlite_%'`
    )
    .all() as { name: string }[]
  const sqliteTableSet = new Set(sqliteTables.map((t) => t.name))
  console.log(`[SQLite] ${sqliteTableSet.size}개 테이블 발견\n`)

  // Disable FK checks for bulk insert (requires superuser)
  try {
    await pg.query('SET session_replication_role = replica')
    console.log('[PostgreSQL] FK 검사 비활성화 (superuser)\n')
  } catch {
    // Non-superuser: rely on topological sort for FK ordering
    // Truncate all tables first, then insert in dependency order
    console.log('[PostgreSQL] FK 검사 비활성화 불가 (superuser 아님)')
    console.log('[PostgreSQL] 토폴로지 정렬 순서로 마이그레이션 진행\n')

    // Truncate in reverse dependency order to avoid FK violations
    const reverseSorted = [...sortedModels].reverse()
    for (const modelName of reverseSorted) {
      if (sqliteTableSet.has(modelName)) {
        try {
          await pg.query(`TRUNCATE TABLE "${modelName}" CASCADE`)
        } catch {
          // Table might not exist yet
        }
      }
    }
    console.log('[PostgreSQL] 기존 데이터 정리 완료\n')
  }

  // Migration stats
  let totalRecords = 0
  let totalInserted = 0
  let totalSkipped = 0
  let totalErrors = 0
  const tableResults: { name: string; sqlite: number; inserted: number; errors: number }[] = []

  // Migrate each model in dependency order
  for (const modelName of sortedModels) {
    const model = models.get(modelName)!
    const tableName = modelName

    // Check if table exists in SQLite
    if (!sqliteTableSet.has(tableName)) {
      continue
    }

    // Read all rows from SQLite
    let rows: any[]
    try {
      rows = sqlite.prepare(`SELECT * FROM "${tableName}"`).all() as any[]
    } catch (e: any) {
      console.error(`  ERROR reading ${tableName}: ${e.message}`)
      continue
    }

    totalRecords += rows.length

    if (rows.length === 0) {
      tableResults.push({ name: modelName, sqlite: 0, inserted: 0, errors: 0 })
      continue
    }

    // Build field type map for this model
    const fieldTypeMap = new Map<string, string>()
    for (const field of model.fields) {
      fieldTypeMap.set(field.name, field.type)
    }

    // Get actual columns from first row
    const sqliteColumns = Object.keys(rows[0])

    // Filter to columns that exist in both SQLite and our schema field map
    const scalarColumns = sqliteColumns.filter((col) => fieldTypeMap.has(col))

    if (scalarColumns.length === 0) {
      console.log(`  SKIP ${modelName}: 매핑 가능한 컬럼 없음`)
      continue
    }

    // Build INSERT statement
    const quotedColumns = scalarColumns.map((c) => `"${c}"`).join(', ')
    const placeholders = scalarColumns.map((_, i) => `$${i + 1}`).join(', ')
    const insertSQL = `INSERT INTO "${tableName}" (${quotedColumns}) VALUES (${placeholders}) ON CONFLICT DO NOTHING`

    let inserted = 0
    let skipped = 0
    let errors = 0

    // Process in batches for progress reporting
    const BATCH_SIZE = 100
    for (let batchStart = 0; batchStart < rows.length; batchStart += BATCH_SIZE) {
      const batch = rows.slice(batchStart, batchStart + BATCH_SIZE)

      for (const row of batch) {
        const values = scalarColumns.map((col) => {
          const fieldType = fieldTypeMap.get(col)!
          return convertValue(row[col], fieldType)
        })

        try {
          const result = await pg.query(insertSQL, values)
          if (result.rowCount && result.rowCount > 0) {
            inserted++
          } else {
            skipped++
          }
        } catch (e: any) {
          errors++
          if (errors <= 3) {
            console.error(`  WARN ${modelName}: ${e.message.substring(0, 150)}`)
          }
        }
      }
    }

    totalInserted += inserted
    totalSkipped += skipped
    totalErrors += errors

    const status = errors > 0 ? 'WARN' : 'OK'
    const detail = [
      `${inserted}/${rows.length}`,
      skipped > 0 ? `skip:${skipped}` : '',
      errors > 0 ? `err:${errors}` : '',
    ]
      .filter(Boolean)
      .join(' ')
    console.log(`  [${status}] ${modelName}: ${detail}`)

    tableResults.push({ name: modelName, sqlite: rows.length, inserted, errors })
  }

  // Re-enable FK checks (only if we disabled them)
  try {
    await pg.query('SET session_replication_role = DEFAULT')
    console.log('\n[PostgreSQL] FK 검사 재활성화')
  } catch {
    // Was not set in the first place
  }

  // Reset sequences for tables with auto-increment (if any)
  // CUID IDs don't use sequences, but just in case
  try {
    const seqResult = await pg.query(`
      SELECT schemaname, sequencename
      FROM pg_sequences
      WHERE schemaname = 'public'
    `)
    if (seqResult.rows.length > 0) {
      console.log(`\n[시퀀스] ${seqResult.rows.length}개 시퀀스 리셋 중...`)
      for (const seq of seqResult.rows) {
        try {
          const tableName = seq.sequencename.replace(/_id_seq$/, '')
          await pg.query(`
            SELECT setval('"${seq.sequencename}"', COALESCE((SELECT MAX(id) FROM "${tableName}"), 0) + 1, false)
          `)
        } catch {
          // Skip if table doesn't exist or has non-numeric id
        }
      }
    }
  } catch {
    // No sequences to reset
  }

  // Summary
  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1)
  console.log('\n╔══════════════════════════════════════════════════╗')
  console.log('║  마이그레이션 결과 요약                          ║')
  console.log('╚══════════════════════════════════════════════════╝')
  console.log(`  소요 시간:    ${elapsed}초`)
  console.log(`  총 레코드:    ${totalRecords}`)
  console.log(`  삽입 성공:    ${totalInserted}`)
  console.log(`  건너뜀:       ${totalSkipped}`)
  console.log(`  오류:         ${totalErrors}`)
  console.log('')

  // Table-by-table summary (only non-empty tables)
  const nonEmpty = tableResults.filter((t) => t.sqlite > 0)
  if (nonEmpty.length > 0) {
    console.log('  ──── 테이블별 결과 ────')
    for (const t of nonEmpty) {
      const status = t.errors > 0 ? 'WARN' : t.inserted === t.sqlite ? 'OK' : 'PARTIAL'
      console.log(`  [${status}] ${t.name.padEnd(35)} ${t.inserted}/${t.sqlite}`)
    }
  }

  // Save results to JSON for verification script
  const resultPath = path.join(__dirname, 'migration-result.json')
  fs.writeFileSync(
    resultPath,
    JSON.stringify(
      {
        timestamp: new Date().toISOString(),
        elapsed: `${elapsed}s`,
        totalRecords,
        totalInserted,
        totalSkipped,
        totalErrors,
        tables: tableResults,
      },
      null,
      2
    )
  )
  console.log(`\n[결과] ${resultPath} 저장 완료`)

  // Cleanup
  sqlite.close()
  await pg.end()

  if (totalErrors > 0) {
    console.log('\n경고: 일부 오류가 발생했습니다. 위의 오류 메시지를 확인하세요.')
    process.exit(1)
  }

  console.log('\n마이그레이션이 성공적으로 완료되었습니다!')
}

main().catch((e) => {
  console.error('마이그레이션 실패:', e)
  process.exit(1)
})
