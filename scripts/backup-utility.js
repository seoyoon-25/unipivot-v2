/**
 * 데이터 백업 및 복구 유틸리티
 *
 * 이 모듈은 프로그램 테이블의 백업 생성, 목록 조회, 복구 기능을 제공합니다.
 * 데이터 손실 방지를 위해 동기화 실행 전 자동으로 백업이 생성됩니다.
 *
 * 사용법:
 *   const { createBackup, listBackups, restoreBackup } = require('./backup-utility');
 *
 * 백업 테이블 명명 규칙:
 *   Program_backup_YYYY-MM-DDTHH-MM-SS-SSSZ
 *
 * @module backup-utility
 * @author Claude Code
 * @version 1.0.0
 */

// 환경변수 로드
require('dotenv').config({ path: __dirname + '/.env' });

const { newDb } = require('./db-connection');

// ============================================================================
// 상수 정의
// ============================================================================

/**
 * 백업 테이블 접두사
 * @constant {string}
 */
const BACKUP_PREFIX = 'Program_backup_';

/**
 * 원본 테이블명 (Prisma 스키마에 정의된 이름)
 * @constant {string}
 */
const SOURCE_TABLE = '"Program"';

// ============================================================================
// 백업 생성
// ============================================================================

/**
 * 현재 프로그램 테이블의 백업을 생성합니다.
 *
 * 타임스탬프가 포함된 새 테이블을 생성하고 현재 데이터를 복사합니다.
 * 백업 테이블은 스키마 구조를 그대로 유지합니다.
 *
 * @returns {Promise<string>} 생성된 백업 테이블명
 * @throws {Error} 백업 생성 실패 시
 *
 * @example
 * const backupName = await createBackup();
 * console.log(`백업 생성됨: ${backupName}`);
 * // 출력: 백업 생성됨: Program_backup_2024-01-28T12-30-45-123Z
 */
async function createBackup() {
  // 타임스탬프 생성 (ISO 형식, 특수문자 대체)
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupTableName = `"${BACKUP_PREFIX}${timestamp}"`;

  try {
    console.log('💾 백업 생성 중...');
    console.log(`   테이블명: ${backupTableName}`);

    // 백업 테이블 생성 (기존 테이블 구조와 데이터 복사)
    await newDb.$executeRawUnsafe(`
      CREATE TABLE ${backupTableName} AS
      SELECT * FROM ${SOURCE_TABLE}
    `);

    // 백업된 레코드 수 확인
    const countResult = await newDb.$queryRawUnsafe(`
      SELECT COUNT(*) as count FROM ${backupTableName}
    `);

    const count = Number(countResult[0].count);
    console.log(`✅ 백업 완료!`);
    console.log(`   저장된 프로그램: ${count}개`);

    return backupTableName.replace(/"/g, '');
  } catch (error) {
    console.error('❌ 백업 생성 실패');
    console.error(`   오류: ${error.message}`);

    // 일반적인 오류 원인 안내
    if (error.message.includes('already exists')) {
      console.error('\n💡 동일한 이름의 백업 테이블이 이미 존재합니다.');
      console.error('   잠시 후 다시 시도하세요.');
    }
    if (error.message.includes('permission')) {
      console.error('\n💡 테이블 생성 권한이 없습니다.');
      console.error('   데이터베이스 사용자 권한을 확인하세요.');
    }

    throw error;
  }
}

// ============================================================================
// 백업 목록 조회
// ============================================================================

/**
 * 존재하는 모든 백업 테이블 목록을 조회합니다.
 *
 * 결과는 최신 백업이 먼저 오도록 정렬됩니다.
 *
 * @returns {Promise<string[]>} 백업 테이블명 배열
 *
 * @example
 * const backups = await listBackups();
 * // 결과: ['Program_backup_2024-01-28T12-30-45-123Z', 'Program_backup_2024-01-27T10-00-00-000Z']
 */
async function listBackups() {
  try {
    const tables = await newDb.$queryRawUnsafe(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
        AND table_name LIKE '${BACKUP_PREFIX}%'
      ORDER BY table_name DESC
    `);

    return tables.map(t => t.table_name);
  } catch (error) {
    console.error('❌ 백업 목록 조회 실패');
    console.error(`   오류: ${error.message}`);
    return [];
  }
}

/**
 * 백업 테이블 상세 정보를 조회합니다.
 *
 * @param {string} backupTableName - 백업 테이블명
 * @returns {Promise<Object>} 백업 상세 정보
 */
async function getBackupInfo(backupTableName) {
  try {
    const quotedName = backupTableName.includes('"') ? backupTableName : `"${backupTableName}"`;

    const countResult = await newDb.$queryRawUnsafe(`
      SELECT COUNT(*) as count FROM ${quotedName}
    `);

    // 테이블명에서 타임스탬프 추출
    const timestampStr = backupTableName.replace(BACKUP_PREFIX, '').replace(/"/g, '');
    const timestamp = timestampStr.replace(/-/g, (m, i) => {
      if (i === 4 || i === 7) return '-';
      if (i === 10) return 'T';
      if (i === 13 || i === 16) return ':';
      if (i === 19) return '.';
      return m;
    });

    return {
      name: backupTableName.replace(/"/g, ''),
      count: Number(countResult[0].count),
      createdAt: new Date(timestamp).toLocaleString('ko-KR')
    };
  } catch (error) {
    return {
      name: backupTableName,
      count: 0,
      error: error.message
    };
  }
}

// ============================================================================
// 백업 복구
// ============================================================================

/**
 * 지정된 백업에서 데이터를 복구합니다.
 *
 * 주의: 이 작업은 현재 프로그램 테이블의 모든 데이터를 삭제하고
 * 백업 데이터로 대체합니다. 되돌릴 수 없습니다.
 *
 * 복구 과정:
 * 1. 트랜잭션 시작
 * 2. 현재 테이블 데이터 삭제 (CASCADE)
 * 3. 백업에서 데이터 복사
 * 4. 트랜잭션 커밋
 *
 * @param {string} backupTableName - 복구할 백업 테이블명
 * @returns {Promise<boolean>} 복구 성공 여부
 *
 * @example
 * const success = await restoreBackup('Program_backup_2024-01-28T12-30-45-123Z');
 * if (success) {
 *   console.log('복구 완료!');
 * }
 */
async function restoreBackup(backupTableName) {
  const quotedName = backupTableName.includes('"') ? backupTableName : `"${backupTableName}"`;

  try {
    console.log(`🔄 백업 복구 중: ${backupTableName}`);

    // 백업 테이블 존재 확인
    const exists = await checkTableExists(backupTableName);
    if (!exists) {
      console.error('❌ 백업 테이블이 존재하지 않습니다.');
      return false;
    }

    // 백업 데이터 수 확인
    const countResult = await newDb.$queryRawUnsafe(`
      SELECT COUNT(*) as count FROM ${quotedName}
    `);
    const backupCount = Number(countResult[0].count);
    console.log(`   백업 데이터: ${backupCount}개`);

    // 트랜잭션으로 복구 실행
    await newDb.$transaction(async (tx) => {
      // 1. 현재 데이터 삭제
      console.log('   1/3 현재 데이터 삭제 중...');
      await tx.$executeRawUnsafe(`DELETE FROM ${SOURCE_TABLE}`);

      // 2. 시퀀스 리셋 (auto-increment ID가 있는 경우)
      // Prisma는 보통 UUID를 사용하므로 생략 가능

      // 3. 백업에서 복구
      console.log('   2/3 백업 데이터 복구 중...');
      await tx.$executeRawUnsafe(`
        INSERT INTO ${SOURCE_TABLE}
        SELECT * FROM ${quotedName}
      `);

      // 4. 복구 확인
      console.log('   3/3 복구 확인 중...');
      const newCountResult = await tx.$queryRawUnsafe(`
        SELECT COUNT(*) as count FROM ${SOURCE_TABLE}
      `);
      const newCount = Number(newCountResult[0].count);

      if (newCount !== backupCount) {
        throw new Error(`복구 데이터 수 불일치: 기대 ${backupCount}, 실제 ${newCount}`);
      }
    });

    console.log('✅ 복구 완료!');
    return true;
  } catch (error) {
    console.error('❌ 복구 실패');
    console.error(`   오류: ${error.message}`);

    if (error.message.includes('foreign key')) {
      console.error('\n💡 외래 키 제약 조건으로 인해 복구에 실패했습니다.');
      console.error('   관련 테이블의 데이터를 먼저 정리해야 할 수 있습니다.');
    }

    return false;
  }
}

// ============================================================================
// 백업 삭제
// ============================================================================

/**
 * 지정된 백업 테이블을 삭제합니다.
 *
 * @param {string} backupTableName - 삭제할 백업 테이블명
 * @returns {Promise<boolean>} 삭제 성공 여부
 */
async function deleteBackup(backupTableName) {
  const quotedName = backupTableName.includes('"') ? backupTableName : `"${backupTableName}"`;

  try {
    console.log(`🗑️  백업 삭제 중: ${backupTableName}`);

    await newDb.$executeRawUnsafe(`DROP TABLE IF EXISTS ${quotedName}`);

    console.log('✅ 삭제 완료');
    return true;
  } catch (error) {
    console.error('❌ 삭제 실패');
    console.error(`   오류: ${error.message}`);
    return false;
  }
}

/**
 * 오래된 백업을 정리합니다.
 *
 * 지정된 개수만큼의 최신 백업만 유지하고 나머지는 삭제합니다.
 *
 * @param {number} [keepCount=5] - 유지할 백업 개수
 * @returns {Promise<number>} 삭제된 백업 개수
 */
async function cleanupOldBackups(keepCount = 5) {
  try {
    const backups = await listBackups();

    if (backups.length <= keepCount) {
      console.log(`📋 현재 백업: ${backups.length}개 (정리 불필요)`);
      return 0;
    }

    const toDelete = backups.slice(keepCount);
    console.log(`🧹 오래된 백업 정리: ${toDelete.length}개 삭제 예정`);

    let deleted = 0;
    for (const backup of toDelete) {
      const success = await deleteBackup(backup);
      if (success) deleted++;
    }

    console.log(`✅ ${deleted}개 백업 삭제 완료`);
    return deleted;
  } catch (error) {
    console.error('❌ 백업 정리 실패:', error.message);
    return 0;
  }
}

// ============================================================================
// 유틸리티 함수
// ============================================================================

/**
 * 테이블 존재 여부를 확인합니다.
 *
 * @param {string} tableName - 확인할 테이블명
 * @returns {Promise<boolean>} 존재 여부
 */
async function checkTableExists(tableName) {
  const cleanName = tableName.replace(/"/g, '');

  try {
    const result = await newDb.$queryRawUnsafe(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_schema = 'public'
          AND table_name = '${cleanName}'
      ) as exists
    `);

    return result[0].exists;
  } catch {
    return false;
  }
}

// ============================================================================
// 모듈 내보내기
// ============================================================================

module.exports = {
  // 백업 관리
  createBackup,
  listBackups,
  getBackupInfo,
  restoreBackup,
  deleteBackup,
  cleanupOldBackups,

  // 유틸리티
  checkTableExists,

  // 상수
  BACKUP_PREFIX,
  SOURCE_TABLE
};
