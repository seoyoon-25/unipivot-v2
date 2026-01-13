/**
 * 세미나 레거시 콘텐츠 이전 스크립트
 *
 * 원본 사이트(www.unipivot.org/seminar)에서 데이터 크롤링
 *
 * 실행: npx tsx scripts/migrate-seminar.ts
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const ORIGINAL_SITE = 'https://www.unipivot.org'

// 세미나 idx 목록
const seminarIdxList = [
  '163691916',  // 대한민국 21대 대통령 자격 검증 토론회
  '121849118',  // 10주 안에 끝내는 책쓰기
  '20389415',   // 다시 돌아온 매력만점 대화법
  '20341183',   // 기본 경제상식 강연
  '18025792',   // 2024년 매력만점 대화법
  '16896886',   // 홍승표 박사 토크콘서트
  '16896882',   // 김권능 목사 토크콘서트
  '16896875',   // 김영인 상담사 특강
  '16896869',   // 북향민 한의사 김지은 토크콘서트
  '15403782',   // 무조건 끌리는 말하기 전략 특강
]

// HTML에서 제목 추출
function extractTitle(html: string): string | null {
  // og:title 메타 태그
  let match = html.match(/<meta[^>]*property=["']og:title["'][^>]*content=["']([^"']+)["']/i)
  if (match) return match[1].trim()

  // 역순 패턴
  match = html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*property=["']og:title["']/i)
  if (match) return match[1].trim()

  // title 태그
  match = html.match(/<title[^>]*>([^<]+)<\/title>/i)
  if (match) return match[1].trim()

  // board_tit 클래스
  match = html.match(/<[^>]*class="[^"]*board_tit[^"]*"[^>]*>([^<]+)</i)
  if (match) return match[1].trim()

  return null
}

// HTML에서 썸네일 추출
function extractThumbnail(html: string): string | null {
  // og:image 메타 태그
  let match = html.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["']/i)
  if (match) return match[1]

  match = html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*property=["']og:image["']/i)
  if (match) return match[1]

  // cdn.imweb.me/thumbnail 패턴
  match = html.match(/cdn\.imweb\.me\/thumbnail\/[^\s"'<>]+/i)
  if (match) {
    let url = match[0]
    if (!url.startsWith('http')) url = 'https://' + url
    return url
  }

  return null
}

// HTML에서 본문 추출
function extractContent(html: string): string | null {
  // board_txt_area 영역
  let match = html.match(/<div[^>]*class="[^"]*board_txt_area[^"]*"[^>]*>([\s\S]*?)(?=<div[^>]*class="[^"]*(?:board_comment|board_view_sns|tools)[^"]*"|<\/article|$)/i)
  if (match && match[1].length > 50) return match[1].trim()

  return null
}

// slug 생성
function generateSlug(title: string, idx: string): string {
  // 한글 제거하고 영문/숫자만 사용
  const cleaned = title
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .substring(0, 30)

  return `seminar-${idx}`
}

async function fetchWithRetry(url: string, retries = 3): Promise<string | null> {
  for (let i = 0; i < retries; i++) {
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
      console.log(`    ⚠️ HTTP ${response.status}`)
    } catch (error: any) {
      console.log(`    ⚠️ 오류: ${error.message}`)
    }
    await new Promise(r => setTimeout(r, 1000))
  }
  return null
}

async function migrateSeminars() {
  console.log('═══════════════════════════════════════════════════════════')
  console.log('  세미나 레거시 콘텐츠 이전')
  console.log('  원본 사이트: ' + ORIGINAL_SITE + '/seminar')
  console.log('═══════════════════════════════════════════════════════════\n')

  let successCount = 0
  let errorCount = 0
  let skipCount = 0
  const errors: string[] = []

  for (let i = 0; i < seminarIdxList.length; i++) {
    const idx = seminarIdxList[i]
    const detailUrl = `${ORIGINAL_SITE}/seminar/?idx=${idx}&bmode=view`

    console.log(`[${i + 1}/${seminarIdxList.length}] idx=${idx}`)
    console.log(`   URL: ${detailUrl}`)

    // HTML fetch
    const html = await fetchWithRetry(detailUrl)
    if (!html) {
      console.log(`   ❌ fetch 실패`)
      errors.push(`idx=${idx}: fetch 실패`)
      errorCount++
      continue
    }

    // 데이터 추출
    const title = extractTitle(html)
    const thumbnail = extractThumbnail(html)
    const content = extractContent(html)

    if (!title) {
      console.log(`   ❌ 제목 추출 실패`)
      errors.push(`idx=${idx}: 제목 추출 실패`)
      errorCount++
      continue
    }

    console.log(`   제목: ${title}`)
    console.log(`   썸네일: ${thumbnail ? thumbnail.substring(0, 50) + '...' : '없음'}`)
    console.log(`   본문: ${content ? content.length + '자' : '추출 실패'}`)

    // slug 생성 및 중복 체크
    let slug = generateSlug(title, idx)
    const existing = await prisma.program.findUnique({ where: { slug } })
    if (existing) {
      console.log(`   ⏭️ 이미 존재함 (slug: ${slug})`)
      skipCount++
      continue
    }

    // DB 저장
    try {
      await prisma.program.create({
        data: {
          title,
          slug,
          type: 'SEMINAR',
          status: 'COMPLETED',
          isOnline: false,
          description: `레거시 콘텐츠 - ${title}`,
          image: thumbnail,
          capacity: 0,

          // 레거시 필드
          isLegacy: true,
          legacyHtml: content,
          legacyImages: thumbnail ? [thumbnail] : [],
          originalUrl: detailUrl,
          migratedAt: new Date(),
        },
      })
      console.log(`   ✅ 저장 완료`)
      successCount++
    } catch (error: any) {
      console.log(`   ❌ DB 저장 실패: ${error.message}`)
      errors.push(`${title}: DB 저장 실패`)
      errorCount++
    }

    // Rate limiting
    await new Promise(r => setTimeout(r, 500))
  }

  console.log('\n═══════════════════════════════════════════════════════════')
  console.log('  완료!')
  console.log(`  성공: ${successCount}개`)
  console.log(`  스킵(이미 존재): ${skipCount}개`)
  console.log(`  실패: ${errorCount}개`)
  console.log('═══════════════════════════════════════════════════════════')

  if (errors.length > 0) {
    console.log('\n실패 목록:')
    errors.forEach(e => console.log(`  - ${e}`))
  }
}

migrateSeminars()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
