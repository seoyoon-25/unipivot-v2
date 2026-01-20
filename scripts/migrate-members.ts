/**
 * 회원 데이터 마이그레이션 스크립트
 *
 * 소스: 회원관리_2025년.xlsx
 * 대상: Member 테이블
 *
 * 실행: npx ts-node scripts/migrate-members.ts
 */

import { PrismaClient } from '@prisma/client';
import * as XLSX from 'xlsx';
import * as path from 'path';

const prisma = new PrismaClient();

// 등급 매핑
const GRADE_MAP: Record<string, string> = {
  'VVIP': 'VVIP',
  'VIP': 'VIP',
  '기본': 'MEMBER',
  '주의 - 1단계': 'MEMBER',  // status로 처리
  '주의 - 2단계': 'MEMBER',  // status로 처리
  '': 'MEMBER',
};

// 상태 매핑
const STATUS_MAP: Record<string, string> = {
  '주의 - 1단계': 'WATCH',
  '주의 - 2단계': 'WARNING',
};

// 출신 매핑
const ORIGIN_MAP: Record<string, string> = {
  '남한': 'SOUTH',
  '북한': 'NORTH',
  '기타': 'OVERSEAS',
  '해외': 'OVERSEAS',
};

// 성별 매핑
const GENDER_MAP: Record<string, string> = {
  '남': 'MALE',
  '여': 'FEMALE',
  '남성': 'MALE',
  '여성': 'FEMALE',
};

// Excel 날짜 시리얼 번호를 Date로 변환
function excelDateToDate(serial: number): Date | null {
  if (!serial || typeof serial !== 'number') return null;
  // Excel 날짜는 1900년 1월 1일부터의 일수
  const utc_days = Math.floor(serial - 25569);
  const utc_value = utc_days * 86400;
  return new Date(utc_value * 1000);
}

// 생년월일에서 출생년도 추출
function extractBirthYear(birthDate: Date | number | string | null): number | null {
  if (!birthDate) return null;

  if (typeof birthDate === 'number') {
    const date = excelDateToDate(birthDate);
    return date ? date.getFullYear() : null;
  }

  if (birthDate instanceof Date) {
    return birthDate.getFullYear();
  }

  return null;
}

// 전화번호 정규화
function normalizePhone(phone: string | number | null): string | null {
  if (!phone) return null;
  const str = String(phone).replace(/[^0-9]/g, '');
  if (str.length === 10) {
    return `010-${str.slice(0, 4)}-${str.slice(4)}`;
  }
  if (str.length === 11) {
    return `${str.slice(0, 3)}-${str.slice(3, 7)}-${str.slice(7)}`;
  }
  return str;
}

// 회원 고유번호 생성
function generateMemberCode(birthYear: number | null, joinDate: Date, sequence: number): string {
  const birthCode = birthYear ? String(birthYear).slice(-2) : '00';
  const year = String(joinDate.getFullYear()).slice(-2);
  const month = String(joinDate.getMonth() + 1).padStart(2, '0');
  const seq = String(sequence).padStart(2, '0');
  return `${birthCode}-${year}${month}-${seq}`;
}

interface ExcelRow {
  '회원등급'?: string;
  '이름': string;
  '성별'?: string;
  '생년월일'?: number | string;
  '소속'?: string;
  '연락처'?: string | number;
  '이메일'?: string;
  '고향'?: string;
  '거주지'?: string;
  '출신'?: string;
  '참여수'?: number;
  '나이'?: number;
}

async function main() {
  console.log('📊 회원 데이터 마이그레이션 시작...\n');

  // Excel 파일 읽기
  const filePath = path.resolve('/home/seoyoon/다운로드/회원관리_2025년.xlsx');
  const workbook = XLSX.readFile(filePath);

  // 첫 번째 시트 사용 (BG 임시명부 - 등급 정보 포함)
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  const rows: ExcelRow[] = XLSX.utils.sheet_to_json(sheet);

  console.log(`📁 파일: ${filePath}`);
  console.log(`📋 시트: ${sheetName}`);
  console.log(`👥 총 행 수: ${rows.length}\n`);

  // 중복 체크를 위한 맵
  const emailSet = new Set<string>();
  const phoneSet = new Set<string>();
  const memberCodeMap = new Map<string, number>(); // yearMonth -> sequence

  let created = 0;
  let skipped = 0;
  let errors = 0;

  const joinDate = new Date('2025-01-01'); // 기본 가입일

  for (const row of rows) {
    try {
      const name = row['이름']?.trim();
      if (!name) {
        skipped++;
        continue;
      }

      const email = row['이메일']?.toString().trim().toLowerCase();
      const phone = normalizePhone(row['연락처'] ?? null);

      // 중복 체크 (이메일 또는 전화번호)
      if (email && emailSet.has(email)) {
        console.log(`⏭️ 중복 이메일: ${name} (${email})`);
        skipped++;
        continue;
      }
      if (phone && phoneSet.has(phone)) {
        console.log(`⏭️ 중복 전화번호: ${name} (${phone})`);
        skipped++;
        continue;
      }

      // DB에서 기존 회원 확인
      if (email) {
        const existing = await prisma.member.findFirst({ where: { email } });
        if (existing) {
          console.log(`⏭️ DB 중복: ${name} (${email})`);
          skipped++;
          continue;
        }
      }

      // 생년월일 파싱
      const rawBirthDate = row['생년월일'];
      const birthDate = typeof rawBirthDate === 'number'
        ? excelDateToDate(rawBirthDate)
        : null;
      const birthYear = extractBirthYear(rawBirthDate ?? null);

      // 회원 고유번호 생성
      const birthCode = birthYear ? String(birthYear).slice(-2) : '00';
      const yearMonth = `${birthCode}-${joinDate.toISOString().slice(2, 4)}${joinDate.toISOString().slice(5, 7)}`;
      const currentSeq = memberCodeMap.get(yearMonth) || 0;
      const newSeq = currentSeq + 1;
      memberCodeMap.set(yearMonth, newSeq);
      const memberCode = `${yearMonth}-${String(newSeq).padStart(2, '0')}`;

      // 등급 & 상태 매핑
      const gradeRaw = row['회원등급'] || '';
      const grade = GRADE_MAP[gradeRaw] || 'MEMBER';
      const status = STATUS_MAP[gradeRaw] || 'ACTIVE';

      // 출신 매핑
      const originRaw = row['출신'] || '';
      const origin = ORIGIN_MAP[originRaw] || null;

      // 성별 매핑
      const genderRaw = row['성별'] || '';
      const gender = GENDER_MAP[genderRaw] || null;

      // Member 생성
      const member = await prisma.member.create({
        data: {
          memberCode,
          name,
          email: email || null,
          phone: phone || null,
          birthYear,
          birthDate,
          gender,
          organization: row['소속']?.toString().trim() || null,
          origin,
          hometown: row['고향']?.toString().trim() || null,
          residence: row['거주지']?.toString().trim() || null,
          grade,
          status,
          joinedAt: joinDate,
        },
      });

      // MemberStats 생성
      await prisma.memberStats.create({
        data: {
          memberId: member.id,
          totalPrograms: row['참여수'] || 0,
        },
      });

      // 중복 체크 셋에 추가
      if (email) emailSet.add(email);
      if (phone) phoneSet.add(phone);

      created++;

      if (created % 50 === 0) {
        console.log(`✅ ${created}명 생성 완료...`);
      }
    } catch (error: any) {
      console.error(`❌ 오류 (${row['이름']}):`, error.message);
      errors++;
    }
  }

  console.log('\n========================================');
  console.log('📊 마이그레이션 결과');
  console.log('========================================');
  console.log(`✅ 생성: ${created}명`);
  console.log(`⏭️ 스킵: ${skipped}명`);
  console.log(`❌ 오류: ${errors}건`);
  console.log('========================================\n');

  // 등급별 통계
  const gradeStats = await prisma.member.groupBy({
    by: ['grade'],
    _count: { id: true },
  });
  console.log('📈 등급별 통계:');
  gradeStats.forEach(s => console.log(`  ${s.grade}: ${s._count.id}명`));

  // 출신별 통계
  const originStats = await prisma.member.groupBy({
    by: ['origin'],
    _count: { id: true },
  });
  console.log('\n📈 출신별 통계:');
  originStats.forEach(s => console.log(`  ${s.origin || '미입력'}: ${s._count.id}명`));
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
