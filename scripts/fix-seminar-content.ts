/**
 * 세미나 본문(legacyHtml) 재추출 스크립트
 *
 * 실행: npx tsx scripts/fix-seminar-content.ts
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// 아임웹 본문 추출 (수정된 패턴)
function extractContent(html: string): string | null {
  // 패턴 1: board_txt_area fr-view (싱글/더블 쿼트 모두 지원)
  let match = html.match(/<div[^>]*class=['"][^'"]*board_txt_area[^'"]*['"][^>]*>([\s\S]*?)<\/div>\s*<\/div>/i)
  if (match && match[1].length > 50) {
    return match[1].trim()
  }

  // 패턴 2: 더 넓은 범위
  match = html.match(/<div[^>]*class=['"]board_txt_area[^'"]*['"][^>]*>([\s\S]*?)(?=<div[^>]*class=['"][^'"]*board_comment|<div[^>]*class=['"][^'"]*tools|<script)/i)
  if (match && match[1].length > 50) {
    return match[1].trim()
  }

  // 패턴 3: fr-view 클래스 직접
  match = html.match(/<div[^>]*class=['"][^'"]*fr-view[^'"]*['"][^>]*>([\s\S]*?)<\/div>\s*<\/div>/i)
  if (match && match[1].length > 50) {
    return match[1].trim()
  }

  return null
}

async function fetchPage(url: string): Promise<string | null> {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'text/html,application/xhtml+xml',
        'Accept-Language': 'ko-KR,ko;q=0.9',
      },
    })
    if (response.ok) {
      return await response.text()
    }
  } catch (error) {
    console.log('  ⚠️ fetch 오류')
  }
  return null
}

async function fixSeminarContent() {
  console.log('═══════════════════════════════════════════════════════════')
  console.log('  세미나 본문(legacyHtml) 재추출')
  console.log('═══════════════════════════════════════════════════════════\n')

  // 세미나 조회
  const seminars = await prisma.program.findMany({
    where: { type: 'SEMINAR', isLegacy: true },
    select: { id: true, title: true, originalUrl: true, legacyHtml: true }
  })

  console.log(`총 ${seminars.length}개 세미나\n`)

  let successCount = 0

  for (let i = 0; i < seminars.length; i++) {
    const seminar = seminars[i]
    console.log(`[${i + 1}/${seminars.length}] ${seminar.title.substring(0, 40)}...`)

    if (!seminar.originalUrl) {
      console.log('  ❌ originalUrl 없음')
      continue
    }

    // HTML fetch
    const html = await fetchPage(seminar.originalUrl)
    if (!html) {
      console.log('  ❌ fetch 실패')
      continue
    }

    // 본문 추출
    const content = extractContent(html)
    if (!content) {
      console.log('  ❌ 본문 추출 실패')
      continue
    }

    console.log(`  ✓ 본문: ${content.length}자`)

    // DB 업데이트
    await prisma.program.update({
      where: { id: seminar.id },
      data: { legacyHtml: content }
    })

    console.log('  ✅ 업데이트 완료')
    successCount++

    // Rate limiting
    await new Promise(r => setTimeout(r, 500))
  }

  console.log('\n═══════════════════════════════════════════════════════════')
  console.log(`  완료! ${successCount}/${seminars.length}개 업데이트`)
  console.log('═══════════════════════════════════════════════════════════')
}

fixSeminarContent()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
