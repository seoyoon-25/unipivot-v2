/**
 * 책 데이터 마이그레이션 스크립트
 *
 * 소스: 노션 CSV (118권)
 * 대상: ReadBook 테이블
 *
 * 실행: npx tsx scripts/migrate-books.ts
 */

import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

// 별점 파싱 (❤️❤️❤️❤️❤️ → 5)
function parseRating(ratingStr: string | undefined): number | null {
  if (!ratingStr) return null;
  // 하트 이모지 개수 세기
  const hearts = (ratingStr.match(/❤️/g) || []).length;
  return hearts > 0 ? hearts : null;
}

// 상태 파싱
function parseStatus(statusStr: string | undefined): string {
  if (!statusStr) return 'COMPLETED';
  if (statusStr.includes('완료')) return 'COMPLETED';
  if (statusStr.includes('진행')) return 'IN_PROGRESS';
  return 'COMPLETED';
}

// CSV 파싱 (간단한 구현)
function parseCSV(content: string): Record<string, string>[] {
  const lines = content.trim().split('\n');
  if (lines.length < 2) return [];

  // BOM 제거
  const headerLine = lines[0].replace(/^\uFEFF/, '');
  const headers = headerLine.split(',').map(h => h.trim());

  const rows: Record<string, string>[] = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    const values: string[] = [];
    let current = '';
    let inQuotes = false;

    for (const char of line) {
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        values.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    values.push(current.trim());

    const row: Record<string, string> = {};
    headers.forEach((header, index) => {
      row[header] = values[index] || '';
    });
    rows.push(row);
  }

  return rows;
}

async function main() {
  console.log('📚 책 데이터 마이그레이션 시작...\n');

  // CSV 파일 경로
  const csvDir = '/tmp/notion_export';
  const files = fs.readdirSync(csvDir, { recursive: true }) as string[];
  const csvFile = files.find(f => f.toString().endsWith('.csv') && !f.toString().endsWith('_all.csv'));

  if (!csvFile) {
    console.error('❌ CSV 파일을 찾을 수 없습니다.');
    return;
  }

  // 디렉토리 내의 서브폴더 확인
  const subDirs = fs.readdirSync(csvDir).filter(f => {
    const fullPath = path.join(csvDir, f);
    return fs.statSync(fullPath).isDirectory();
  });

  let csvPath = '';
  for (const subDir of subDirs) {
    const subDirPath = path.join(csvDir, subDir);
    const subFiles = fs.readdirSync(subDirPath);
    const csv = subFiles.find(f => f.endsWith('.csv') && !f.endsWith('_all.csv'));
    if (csv) {
      csvPath = path.join(subDirPath, csv);
      break;
    }
  }

  if (!csvPath) {
    console.error('❌ CSV 파일을 찾을 수 없습니다.');
    return;
  }

  console.log(`📁 파일: ${csvPath}\n`);

  // CSV 파일 읽기
  const content = fs.readFileSync(csvPath, 'utf-8');
  const rows = parseCSV(content);

  console.log(`📋 총 행 수: ${rows.length}\n`);

  let created = 0;
  let skipped = 0;
  let errors = 0;

  for (const row of rows) {
    try {
      const title = row['이름']?.trim();
      if (!title) {
        skipped++;
        continue;
      }

      // 중복 체크
      const existing = await prisma.readBook.findFirst({
        where: { title, season: row['시즌'] || '미분류' },
      });
      if (existing) {
        console.log(`⏭️ 중복: ${title} (${row['시즌']})`);
        skipped++;
        continue;
      }

      // ReadBook 생성
      await prisma.readBook.create({
        data: {
          title,
          author: row['저자']?.trim() || null,
          publisher: row['출판사']?.trim() || null,
          pubYear: row['출판연도']?.trim() || null,
          image: row['표지']?.trim() || null,
          season: row['시즌']?.trim() || '미분류',
          sessionCount: row['진행횟수'] ? parseInt(row['진행횟수']) : null,
          participants: row['참여인원'] ? parseInt(row['참여인원']) : null,
          category: row['분류']?.trim() || null,
          rating: parseRating(row['별점']),
          status: parseStatus(row['진행상태']),
        },
      });

      created++;

      if (created % 20 === 0) {
        console.log(`✅ ${created}권 생성 완료...`);
      }
    } catch (error: any) {
      console.error(`❌ 오류 (${row['이름']}):`, error.message);
      errors++;
    }
  }

  console.log('\n========================================');
  console.log('📊 마이그레이션 결과');
  console.log('========================================');
  console.log(`✅ 생성: ${created}권`);
  console.log(`⏭️ 스킵: ${skipped}권`);
  console.log(`❌ 오류: ${errors}건`);
  console.log('========================================\n');

  // 시즌별 통계
  const seasonStats = await prisma.readBook.groupBy({
    by: ['season'],
    _count: { id: true },
    orderBy: { season: 'asc' },
  });
  console.log('📈 시즌별 통계:');
  seasonStats.forEach(s => console.log(`  ${s.season}: ${s._count.id}권`));

  // 분류별 통계
  const categoryStats = await prisma.readBook.groupBy({
    by: ['category'],
    _count: { id: true },
  });
  console.log('\n📈 분류별 통계:');
  categoryStats.forEach(s => console.log(`  ${s.category || '미분류'}: ${s._count.id}권`));
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
