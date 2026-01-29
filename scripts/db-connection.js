/**
 * 데이터베이스 연결 유틸리티
 *
 * 이 모듈은 기존 사이트(unipivot.org)와 새 사이트(bestcome.org)의
 * 데이터베이스에 연결하기 위한 헬퍼 함수들을 제공합니다.
 *
 * 사용법:
 *   const { oldDb, newDb, testConnections, closeConnections } = require('./db-connection');
 *
 * 환경변수:
 *   - OLD_DATABASE_URL: 기존 DB 연결 문자열
 *   - NEW_DATABASE_URL: 새 DB 연결 문자열
 *
 * @module db-connection
 * @author Claude Code
 * @version 1.0.0
 */

// 환경변수 로드 (.env 파일에서)
require('dotenv').config({ path: __dirname + '/.env' });

const { PrismaClient } = require('@prisma/client');

// ============================================================================
// 환경변수 검증
// ============================================================================

/**
 * 필수 환경변수가 설정되어 있는지 확인
 */
function validateEnvironment() {
  const required = ['OLD_DATABASE_URL', 'NEW_DATABASE_URL'];
  const missing = required.filter(key => !process.env[key]);

  if (missing.length > 0) {
    console.error('❌ 필수 환경변수가 설정되지 않았습니다:');
    missing.forEach(key => console.error(`   - ${key}`));
    console.error('\n💡 scripts/.env 파일을 확인하세요.');
    console.error('   scripts/.env.example을 참고하여 .env 파일을 생성하세요.');
    process.exit(1);
  }
}

// 환경변수 검증 실행
validateEnvironment();

// ============================================================================
// Prisma Client 인스턴스 생성
// ============================================================================

/**
 * 기존 데이터베이스 (unipivot.org) 연결
 *
 * 이 연결은 읽기 전용으로 사용됩니다.
 * 기존 프로그램 데이터를 조회하여 날짜 정보를 가져옵니다.
 */
const oldDb = new PrismaClient({
  datasources: {
    db: {
      url: process.env.OLD_DATABASE_URL
    }
  },
  // 로그 레벨 설정 (필요시 'query' 추가하여 쿼리 로깅)
  log: ['error', 'warn']
});

/**
 * 새 데이터베이스 (bestcome.org) 연결
 *
 * 이 연결은 읽기/쓰기 모두 사용됩니다.
 * 프로그램 데이터를 조회하고 날짜 정보를 업데이트합니다.
 */
const newDb = new PrismaClient({
  datasources: {
    db: {
      url: process.env.NEW_DATABASE_URL
    }
  },
  log: ['error', 'warn']
});

// ============================================================================
// 연결 관리 함수
// ============================================================================

/**
 * 두 데이터베이스 연결을 테스트합니다.
 *
 * 각 데이터베이스에 연결을 시도하고 결과를 콘솔에 출력합니다.
 * 연결에 실패하면 상세한 에러 메시지를 표시합니다.
 *
 * @returns {Promise<boolean>} 두 DB 모두 연결 성공 시 true, 하나라도 실패 시 false
 *
 * @example
 * const connected = await testConnections();
 * if (!connected) {
 *   console.log('DB 연결 실패!');
 *   process.exit(1);
 * }
 */
async function testConnections() {
  let oldConnected = false;
  let newConnected = false;

  // 기존 DB 연결 테스트
  try {
    await oldDb.$connect();

    // 간단한 쿼리로 연결 확인
    const oldCount = await oldDb.program.count();
    console.log(`✅ 기존 DB 연결 성공 (프로그램 ${oldCount}개)`);
    oldConnected = true;
  } catch (error) {
    console.error('❌ 기존 DB 연결 실패');
    console.error(`   URL: ${maskPassword(process.env.OLD_DATABASE_URL)}`);
    console.error(`   오류: ${error.message}`);

    // 일반적인 오류 원인 안내
    if (error.message.includes('connect')) {
      console.error('\n💡 연결 오류 해결 방법:');
      console.error('   1. 데이터베이스 서버가 실행 중인지 확인');
      console.error('   2. 호스트 주소와 포트가 올바른지 확인');
      console.error('   3. 방화벽 설정 확인');
    }
    if (error.message.includes('authentication') || error.message.includes('password')) {
      console.error('\n💡 인증 오류 해결 방법:');
      console.error('   1. 사용자 이름과 비밀번호가 올바른지 확인');
      console.error('   2. 데이터베이스 사용자 권한 확인');
    }
  }

  // 새 DB 연결 테스트
  try {
    await newDb.$connect();

    // 간단한 쿼리로 연결 확인
    const newCount = await newDb.program.count();
    console.log(`✅ 새 DB 연결 성공 (프로그램 ${newCount}개)`);
    newConnected = true;
  } catch (error) {
    console.error('❌ 새 DB 연결 실패');
    console.error(`   URL: ${maskPassword(process.env.NEW_DATABASE_URL)}`);
    console.error(`   오류: ${error.message}`);
  }

  return oldConnected && newConnected;
}

/**
 * 데이터베이스 연결을 종료합니다.
 *
 * 스크립트 종료 시 반드시 호출하여 연결을 정리해야 합니다.
 * 연결을 종료하지 않으면 연결 풀이 고갈될 수 있습니다.
 *
 * @returns {Promise<void>}
 *
 * @example
 * try {
 *   // 작업 수행
 * } finally {
 *   await closeConnections();
 * }
 */
async function closeConnections() {
  try {
    await oldDb.$disconnect();
    await newDb.$disconnect();
    console.log('🔌 DB 연결 종료');
  } catch (error) {
    console.error('⚠️ DB 연결 종료 중 오류:', error.message);
  }
}

// ============================================================================
// 유틸리티 함수
// ============================================================================

/**
 * 데이터베이스 URL에서 비밀번호를 마스킹합니다.
 *
 * 로그 출력 시 비밀번호가 노출되지 않도록 합니다.
 *
 * @param {string} url - 데이터베이스 연결 URL
 * @returns {string} 비밀번호가 마스킹된 URL
 *
 * @example
 * maskPassword('postgresql://user:secret@host:5432/db')
 * // 결과: 'postgresql://user:****@host:5432/db'
 */
function maskPassword(url) {
  if (!url) return '[URL 없음]';

  try {
    // URL에서 비밀번호 부분을 마스킹
    return url.replace(/:([^:@]+)@/, ':****@');
  } catch {
    return '[URL 파싱 오류]';
  }
}

/**
 * 연결 상태를 확인합니다.
 *
 * @param {PrismaClient} db - Prisma Client 인스턴스
 * @param {string} name - DB 이름 (로깅용)
 * @returns {Promise<boolean>} 연결 상태
 */
async function isConnected(db, name) {
  try {
    await db.$queryRaw`SELECT 1`;
    return true;
  } catch {
    console.warn(`⚠️ ${name} DB 연결 끊김`);
    return false;
  }
}

// ============================================================================
// 모듈 내보내기
// ============================================================================

module.exports = {
  // Prisma Client 인스턴스
  oldDb,
  newDb,

  // 연결 관리 함수
  testConnections,
  closeConnections,

  // 유틸리티 함수
  maskPassword,
  isConnected
};
