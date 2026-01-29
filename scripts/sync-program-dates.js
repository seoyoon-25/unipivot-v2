#!/usr/bin/env node

/**
 * 프로그램 날짜 동기화 스크립트
 *
 * 기존 사이트(unipivot.org)의 프로그램 날짜 정보를
 * 새 사이트(bestcome.org)에 자동으로 동기화합니다.
 *
 * 주요 기능:
 * - 프로그램 제목을 기반으로 자동 매칭
 * - 날짜 정보 (모집 기간, 진행 기간) 복사
 * - 상태 정보 동기화
 * - 자동 백업 및 복구 지원
 *
 * 사용법:
 *   node scripts/sync-program-dates.js              # 실제 실행
 *   node scripts/sync-program-dates.js --dry-run   # 테스트 모드
 *   node scripts/sync-program-dates.js --restore   # 백업 복구
 *
 * 환경변수:
 *   - OLD_DATABASE_URL: 기존 DB 연결 문자열
 *   - NEW_DATABASE_URL: 새 DB 연결 문자열
 *   - DRY_RUN: true면 테스트 모드
 *
 * @module sync-program-dates
 * @author Claude Code
 * @version 1.0.0
 */

// ============================================================================
// 모듈 로드
// ============================================================================

// 환경변수 로드 (.env 파일에서)
require('dotenv').config({ path: __dirname + '/.env' });

const { oldDb, newDb, testConnections, closeConnections } = require('./db-connection');
const { matchPrograms, similarity } = require('./string-matcher');
const { createBackup, listBackups, restoreBackup, getBackupInfo } = require('./backup-utility');

// ============================================================================
// 명령줄 옵션 파싱
// ============================================================================

const args = process.argv.slice(2);

/**
 * DRY_RUN 모드: 실제 업데이트 없이 확인만 수행
 * 명령줄에 --dry-run 플래그가 있거나 환경변수 DRY_RUN=true인 경우 활성화
 */
const DRY_RUN = args.includes('--dry-run') || process.env.DRY_RUN === 'true';

/**
 * RESTORE 모드: 백업에서 데이터 복구
 * 명령줄에 --restore 플래그가 있는 경우 활성화
 */
const RESTORE = args.includes('--restore');

/**
 * VERBOSE 모드: 상세 로깅 활성화
 */
const VERBOSE = args.includes('--verbose') || args.includes('-v');

/**
 * 매칭 임계값 (기본 85%)
 * --threshold=0.80 형태로 지정 가능
 */
const thresholdArg = args.find(a => a.startsWith('--threshold='));
const THRESHOLD = thresholdArg ? parseFloat(thresholdArg.split('=')[1]) : 0.85;

// ============================================================================
// 통계 객체
// ============================================================================

/**
 * 동기화 통계
 */
const stats = {
  total: 0,           // 기존 사이트 전체 프로그램 수
  matched: 0,         // 매칭 성공 수
  updated: 0,         // 업데이트 완료 수
  skipped: 0,         // 건너뛴 수 (날짜 없음 등)
  failed: 0,          // 실패 수
  unmatched: [],      // 매칭 실패 프로그램 목록
  multiMatched: [],   // 다중 매칭 프로그램 목록
  errors: []          // 오류 목록
};

// ============================================================================
// 복구 모드 처리
// ============================================================================

/**
 * 백업 복구를 처리합니다.
 *
 * 사용 가능한 백업 목록을 표시하고 가장 최근 백업으로 복구합니다.
 */
async function handleRestore() {
  console.log('🔄 백업 복구 모드\n');
  console.log('='.repeat(60));

  // 백업 목록 조회
  const backups = await listBackups();

  if (backups.length === 0) {
    console.log('❌ 사용 가능한 백업이 없습니다.');
    console.log('\n💡 먼저 동기화를 실행하면 자동으로 백업이 생성됩니다.');
    return;
  }

  // 백업 목록 표시
  console.log('📋 사용 가능한 백업:\n');
  for (let i = 0; i < Math.min(backups.length, 5); i++) {
    const info = await getBackupInfo(backups[i]);
    console.log(`   ${i + 1}. ${info.name}`);
    console.log(`      생성일시: ${info.createdAt}`);
    console.log(`      프로그램: ${info.count}개\n`);
  }

  if (backups.length > 5) {
    console.log(`   ... 외 ${backups.length - 5}개 더\n`);
  }

  // 최신 백업으로 복구
  console.log('='.repeat(60));
  console.log('⚠️  가장 최근 백업으로 복구합니다.');
  console.log('   현재 데이터가 모두 삭제됩니다!\n');

  const latestBackup = backups[0];
  const success = await restoreBackup(latestBackup);

  if (success) {
    console.log('\n✅ 복구가 완료되었습니다!');
  } else {
    console.log('\n❌ 복구에 실패했습니다.');
    console.log('   로그를 확인하고 수동으로 복구하세요.');
  }
}

// ============================================================================
// 프로그램 동기화
// ============================================================================

/**
 * 프로그램 날짜를 동기화합니다.
 *
 * 처리 과정:
 * 1. DB 연결 테스트
 * 2. 백업 생성 (실제 실행 모드일 때)
 * 3. 기존 사이트에서 프로그램 조회
 * 4. 새 사이트에서 프로그램 조회
 * 5. 제목으로 매칭
 * 6. 날짜 정보 업데이트
 * 7. 결과 리포트 출력
 */
async function syncPrograms() {
  try {
    // 헤더 출력
    console.log('');
    console.log('='.repeat(60));
    console.log('🚀 프로그램 날짜 동기화');
    console.log('='.repeat(60));
    console.log('');

    // 모드 표시
    if (DRY_RUN) {
      console.log('🔍 DRY-RUN 모드: 실제 업데이트 없이 확인만 합니다.');
      console.log('   실제로 실행하려면 --dry-run 옵션을 제거하세요.\n');
    }

    console.log(`📊 매칭 임계값: ${(THRESHOLD * 100).toFixed(0)}%\n`);

    // ========================================
    // 1. DB 연결 테스트
    // ========================================
    console.log('1️⃣  데이터베이스 연결 테스트');
    console.log('-'.repeat(40));

    const connected = await testConnections();
    if (!connected) {
      throw new Error('데이터베이스 연결에 실패했습니다.');
    }
    console.log('');

    // ========================================
    // 2. 백업 생성 (실제 실행 모드)
    // ========================================
    let backupName = null;
    if (!DRY_RUN) {
      console.log('2️⃣  백업 생성');
      console.log('-'.repeat(40));
      backupName = await createBackup();
      console.log('');
    }

    // ========================================
    // 3. 기존 사이트에서 프로그램 조회
    // ========================================
    console.log(`${DRY_RUN ? '2️⃣' : '3️⃣'}  기존 사이트 프로그램 조회`);
    console.log('-'.repeat(40));

    const oldPrograms = await oldDb.program.findMany({
      select: {
        id: true,
        title: true,
        // 기존 사이트의 필드명 (확인 필요)
        recruitStartDate: true,
        recruitEndDate: true,
        startDate: true,
        endDate: true,
        status: true
      }
    });

    stats.total = oldPrograms.length;
    console.log(`✅ ${oldPrograms.length}개 프로그램 찾음\n`);

    if (VERBOSE) {
      console.log('   프로그램 목록:');
      oldPrograms.slice(0, 5).forEach(p => {
        console.log(`   - ${p.title}`);
      });
      if (oldPrograms.length > 5) {
        console.log(`   ... 외 ${oldPrograms.length - 5}개\n`);
      }
    }

    // ========================================
    // 4. 새 사이트에서 프로그램 조회
    // ========================================
    console.log(`${DRY_RUN ? '3️⃣' : '4️⃣'}  새 사이트 프로그램 조회`);
    console.log('-'.repeat(40));

    const newPrograms = await newDb.program.findMany({
      select: {
        id: true,
        title: true,
        recruitStartDate: true,
        recruitEndDate: true,
        startDate: true,
        endDate: true
      }
    });

    console.log(`✅ ${newPrograms.length}개 프로그램 찾음\n`);

    // ========================================
    // 5. 매칭 및 업데이트
    // ========================================
    console.log(`${DRY_RUN ? '4️⃣' : '5️⃣'}  매칭 및 업데이트`);
    console.log('-'.repeat(40));
    console.log('');

    for (const oldProg of oldPrograms) {
      // 매칭 시도
      const matches = matchPrograms(oldProg, newPrograms, THRESHOLD);

      // 매칭 실패
      if (matches.length === 0) {
        console.log(`❌ 매칭 실패: "${oldProg.title}"`);
        stats.unmatched.push(oldProg.title);
        stats.failed++;
        continue;
      }

      // 다중 매칭 경고
      if (matches.length > 1) {
        console.log(`⚠️  여러 프로그램 매칭: "${oldProg.title}"`);
        matches.slice(0, 3).forEach((m, i) => {
          console.log(`   ${i + 1}. ${m.program.title} (${(m.score * 100).toFixed(1)}%)`);
        });
        console.log('   → 최고 점수 선택');
        stats.multiMatched.push({
          original: oldProg.title,
          matches: matches.slice(0, 3).map(m => ({
            title: m.program.title,
            score: m.score
          }))
        });
      }

      const bestMatch = matches[0];
      stats.matched++;

      // 매칭 정보 출력
      if (bestMatch.score < 1.0) {
        console.log(`✅ 매칭: "${oldProg.title.substring(0, 30)}..."`);
        console.log(`   → "${bestMatch.program.title.substring(0, 30)}..." (${(bestMatch.score * 100).toFixed(1)}%)`);
      } else {
        console.log(`✅ 완전 일치: "${oldProg.title.substring(0, 40)}..."`);
      }

      // 날짜가 없으면 건너뛰기
      if (!oldProg.recruitStartDate && !oldProg.startDate) {
        console.log('   ⚠️  날짜 정보 없음 (건너뜀)\n');
        stats.skipped++;
        continue;
      }

      // 업데이트 데이터 준비
      const updateData = {};

      if (oldProg.recruitStartDate) {
        updateData.recruitStartDate = oldProg.recruitStartDate;
      }
      if (oldProg.recruitEndDate) {
        updateData.recruitEndDate = oldProg.recruitEndDate;
      }
      if (oldProg.startDate) {
        updateData.startDate = oldProg.startDate;
      }
      if (oldProg.endDate) {
        updateData.endDate = oldProg.endDate;
      }
      if (oldProg.status) {
        updateData.status = oldProg.status;
      }

      // 날짜 표시
      if (VERBOSE || !DRY_RUN) {
        console.log('   📅 날짜 정보:');
        if (oldProg.recruitStartDate) {
          const start = formatDate(oldProg.recruitStartDate);
          const end = formatDate(oldProg.recruitEndDate);
          console.log(`      모집: ${start} ~ ${end}`);
        }
        if (oldProg.startDate) {
          const start = formatDate(oldProg.startDate);
          const end = formatDate(oldProg.endDate);
          console.log(`      진행: ${start} ~ ${end}`);
        }
      }

      // 실제 업데이트
      if (!DRY_RUN) {
        try {
          await newDb.program.update({
            where: { id: bestMatch.program.id },
            data: updateData
          });
          console.log('   ✅ 업데이트 완료');
          stats.updated++;
        } catch (error) {
          console.log(`   ❌ 업데이트 실패: ${error.message}`);
          stats.errors.push({
            program: oldProg.title,
            error: error.message
          });
          stats.failed++;
        }
      } else {
        console.log('   🔍 [DRY-RUN] 업데이트 건너뜀');
        stats.updated++;
      }

      console.log('');
    }

    // ========================================
    // 6. 결과 리포트
    // ========================================
    printReport(backupName);

  } catch (error) {
    console.error('\n❌ 오류 발생:', error.message);
    if (VERBOSE) {
      console.error(error.stack);
    }
    process.exit(1);
  }
}

// ============================================================================
// 결과 리포트 출력
// ============================================================================

/**
 * 동기화 결과 리포트를 출력합니다.
 *
 * @param {string|null} backupName - 백업 테이블명 (있는 경우)
 */
function printReport(backupName) {
  console.log('');
  console.log('='.repeat(60));
  console.log('📊 동기화 결과 리포트');
  console.log('='.repeat(60));
  console.log('');

  // 통계
  console.log('📈 통계');
  console.log('-'.repeat(40));
  console.log(`   전체 프로그램:    ${stats.total}개`);
  console.log(`   매칭 성공:        ${stats.matched}개`);
  console.log(`   업데이트 완료:    ${stats.updated}개`);
  console.log(`   건너뜀 (날짜없음): ${stats.skipped}개`);
  console.log(`   실패:             ${stats.failed}개`);
  console.log(`   매칭 실패:        ${stats.unmatched.length}개`);
  console.log('');

  // 매칭률
  const matchRate = stats.total > 0 ? (stats.matched / stats.total * 100).toFixed(1) : 0;
  console.log(`   📊 매칭률: ${matchRate}%`);
  console.log('');

  // 매칭 실패 목록
  if (stats.unmatched.length > 0) {
    console.log('❌ 매칭되지 않은 프로그램');
    console.log('-'.repeat(40));
    stats.unmatched.forEach(title => {
      console.log(`   - ${title}`);
    });
    console.log('');
  }

  // 다중 매칭 목록
  if (stats.multiMatched.length > 0 && VERBOSE) {
    console.log('⚠️  다중 매칭된 프로그램');
    console.log('-'.repeat(40));
    stats.multiMatched.forEach(item => {
      console.log(`   "${item.original}":`);
      item.matches.forEach(m => {
        console.log(`      - ${m.title} (${(m.score * 100).toFixed(1)}%)`);
      });
    });
    console.log('');
  }

  // 오류 목록
  if (stats.errors.length > 0) {
    console.log('🔴 오류 발생 항목');
    console.log('-'.repeat(40));
    stats.errors.forEach(err => {
      console.log(`   - ${err.program}: ${err.error}`);
    });
    console.log('');
  }

  // 백업 정보
  if (backupName && !DRY_RUN) {
    console.log('💾 백업 정보');
    console.log('-'.repeat(40));
    console.log(`   테이블명: ${backupName}`);
    console.log('');
    console.log('   문제 발생 시 복구:');
    console.log('   node scripts/sync-program-dates.js --restore');
    console.log('');
  }

  // DRY-RUN 안내
  if (DRY_RUN) {
    console.log('💡 다음 단계');
    console.log('-'.repeat(40));
    console.log('   실제로 실행하려면:');
    console.log('   node scripts/sync-program-dates.js');
    console.log('');
    console.log('   또는 npm 스크립트 사용:');
    console.log('   npm run sync:run');
    console.log('');
  }

  console.log('='.repeat(60));
  console.log('✅ 동기화 완료!');
  console.log('='.repeat(60));
}

// ============================================================================
// 유틸리티 함수
// ============================================================================

/**
 * 날짜를 포맷팅합니다.
 *
 * @param {Date|string|null} date - 날짜
 * @returns {string} 포맷된 날짜 문자열
 */
function formatDate(date) {
  if (!date) return '미정';

  try {
    const d = new Date(date);
    return d.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  } catch {
    return String(date);
  }
}

/**
 * 사용법을 출력합니다.
 */
function printUsage() {
  console.log(`
프로그램 날짜 동기화 스크립트

사용법:
  node scripts/sync-program-dates.js [옵션]

옵션:
  --dry-run          테스트 모드 (실제 업데이트 없음)
  --restore          백업에서 복구
  --verbose, -v      상세 로깅
  --threshold=N      매칭 임계값 (0.0~1.0, 기본 0.85)
  --help, -h         이 도움말 표시

예시:
  # 테스트 실행
  node scripts/sync-program-dates.js --dry-run

  # 실제 실행
  node scripts/sync-program-dates.js

  # 복구
  node scripts/sync-program-dates.js --restore

  # 낮은 임계값으로 실행
  node scripts/sync-program-dates.js --threshold=0.70
`);
}

// ============================================================================
// 메인 실행
// ============================================================================

/**
 * 메인 함수
 */
async function main() {
  // 도움말 출력
  if (args.includes('--help') || args.includes('-h')) {
    printUsage();
    return;
  }

  try {
    if (RESTORE) {
      await handleRestore();
    } else {
      await syncPrograms();
    }
  } finally {
    await closeConnections();
  }
}

// 스크립트 직접 실행 시
if (require.main === module) {
  main()
    .then(() => process.exit(0))
    .catch(error => {
      console.error('치명적 오류:', error);
      process.exit(1);
    });
}

// 모듈 내보내기 (테스트용)
module.exports = { syncPrograms, handleRestore, stats };
