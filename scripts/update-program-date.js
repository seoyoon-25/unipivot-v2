#!/usr/bin/env node

/**
 * 프로그램 날짜 수동 업데이트 스크립트
 *
 * 사용법:
 *   node update-program-date.js                    # 날짜 없는 프로그램 목록 보기
 *   node update-program-date.js <ID> <날짜>        # 특정 프로그램 날짜 업데이트
 *   node update-program-date.js <ID> <시작일> <종료일>  # 기간 설정
 *
 * 날짜 형식 (모두 지원):
 *   - 2024-03-15
 *   - 2024.03.15
 *   - 2024년 3월 15일
 *   - 24.03.15
 *
 * 예시:
 *   node update-program-date.js cmkcrt96u000mn1qxfarh75xy 2022-05-15
 *   node update-program-date.js cmkcrt96u000mn1qxfarh75xy "2022년 5월 15일"
 *   node update-program-date.js cmkcrt96u000mn1qxfarh75xy 2022-05-15 2022-06-30
 */

const { PrismaClient } = require('@prisma/client');
const path = require('path');

// .env 로드
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const prisma = new PrismaClient();

// ============================================================================
// 날짜 파싱
// ============================================================================

/**
 * 다양한 형식의 날짜 문자열을 Date 객체로 변환
 */
function parseDate(dateStr) {
  if (!dateStr) return null;

  dateStr = dateStr.trim();

  // ISO 형식: 2024-03-15
  let match = dateStr.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
  if (match) {
    return new Date(parseInt(match[1]), parseInt(match[2]) - 1, parseInt(match[3]));
  }

  // 점 형식: 2024.03.15
  match = dateStr.match(/^(\d{4})\.(\d{1,2})\.(\d{1,2})$/);
  if (match) {
    return new Date(parseInt(match[1]), parseInt(match[2]) - 1, parseInt(match[3]));
  }

  // 2자리 연도: 24.03.15
  match = dateStr.match(/^(\d{2})\.(\d{1,2})\.(\d{1,2})$/);
  if (match) {
    const year = 2000 + parseInt(match[1]);
    return new Date(year, parseInt(match[2]) - 1, parseInt(match[3]));
  }

  // 한국어: 2024년 3월 15일
  match = dateStr.match(/(\d{4})년\s*(\d{1,2})월\s*(\d{1,2})일?/);
  if (match) {
    return new Date(parseInt(match[1]), parseInt(match[2]) - 1, parseInt(match[3]));
  }

  // 2자리 한국어: 24년 3월 15일
  match = dateStr.match(/(\d{2})년\s*(\d{1,2})월\s*(\d{1,2})일?/);
  if (match) {
    const year = 2000 + parseInt(match[1]);
    return new Date(year, parseInt(match[2]) - 1, parseInt(match[3]));
  }

  return null;
}

/**
 * 날짜를 보기 좋게 포맷
 */
function formatDate(date) {
  if (!date) return '없음';
  return date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

// ============================================================================
// 명령어 처리
// ============================================================================

async function listProgramsWithoutDate() {
  const programs = await prisma.program.findMany({
    where: { startDate: null },
    select: { id: true, title: true },
    orderBy: { createdAt: 'desc' }
  });

  if (programs.length === 0) {
    console.log('✅ 모든 프로그램에 날짜가 설정되어 있습니다!');
    return;
  }

  console.log(`\n📋 날짜 없는 프로그램 목록 (${programs.length}개)\n`);
  console.log('─'.repeat(80));

  programs.forEach((p, i) => {
    console.log(`${String(i + 1).padStart(2)}. ${p.title}`);
    console.log(`    ID: ${p.id}`);
    console.log();
  });

  console.log('─'.repeat(80));
  console.log('\n💡 사용법:');
  console.log('   node update-program-date.js <ID> <날짜>');
  console.log('   node update-program-date.js <ID> <시작일> <종료일>');
  console.log('\n📝 날짜 형식 예시:');
  console.log('   2024-03-15, 2024.03.15, "2024년 3월 15일", 24.03.15');
}

async function updateProgramDate(id, startDateStr, endDateStr) {
  // 프로그램 확인
  const program = await prisma.program.findUnique({
    where: { id },
    select: { id: true, title: true, startDate: true, endDate: true }
  });

  if (!program) {
    console.error(`❌ 프로그램을 찾을 수 없습니다: ${id}`);
    process.exit(1);
  }

  // 날짜 파싱
  const startDate = parseDate(startDateStr);
  if (!startDate) {
    console.error(`❌ 시작 날짜 형식이 올바르지 않습니다: ${startDateStr}`);
    console.error('   지원 형식: 2024-03-15, 2024.03.15, "2024년 3월 15일", 24.03.15');
    process.exit(1);
  }

  const endDate = endDateStr ? parseDate(endDateStr) : startDate;
  if (endDateStr && !endDate) {
    console.error(`❌ 종료 날짜 형식이 올바르지 않습니다: ${endDateStr}`);
    process.exit(1);
  }

  // 업데이트
  await prisma.program.update({
    where: { id },
    data: { startDate, endDate }
  });

  console.log('\n✅ 프로그램 날짜가 업데이트되었습니다!\n');
  console.log(`   제목: ${program.title}`);
  console.log(`   ID: ${id}`);
  console.log(`   시작일: ${formatDate(startDate)}`);
  console.log(`   종료일: ${formatDate(endDate)}`);

  // 남은 프로그램 수 표시
  const remaining = await prisma.program.count({ where: { startDate: null } });
  if (remaining > 0) {
    console.log(`\n📊 날짜 없는 프로그램: ${remaining}개 남음`);
  } else {
    console.log('\n🎉 모든 프로그램에 날짜가 설정되었습니다!');
  }
}

// ============================================================================
// 메인
// ============================================================================

async function main() {
  const args = process.argv.slice(2);

  try {
    if (args.length === 0) {
      // 목록 표시
      await listProgramsWithoutDate();
    } else if (args.length >= 2) {
      // 날짜 업데이트
      const [id, startDate, endDate] = args;
      await updateProgramDate(id, startDate, endDate);
    } else {
      console.log('사용법:');
      console.log('  node update-program-date.js                    # 목록 보기');
      console.log('  node update-program-date.js <ID> <날짜>        # 날짜 설정');
      console.log('  node update-program-date.js <ID> <시작일> <종료일>');
    }
  } finally {
    await prisma.$disconnect();
  }
}

main().catch(console.error);
