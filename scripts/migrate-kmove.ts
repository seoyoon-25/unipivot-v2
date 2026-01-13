/**
 * K-MOVE 레거시 콘텐츠 이전 스크립트
 *
 * 실행: npx tsx scripts/migrate-kmove.ts
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const ORIGINAL_SITE = 'https://www.unipivot.org'

// K-MOVE idx 목록
const kmoveIdxList = [
  '127023057',  // 2024년 남북청년 함께 만드는 네트워킹 연말파티
  '16917157',   // 지구도 우리도 회복이 필요한 때 "플로깅+심리회복"
  '16481544',   // 백두대간 7산 도전, 10월 산행
  '16425034',   // 2023년 남북청년 연말 파티
  '16374517',   // 미드풋 러닝 클래스
  '16246785',   // [지우회] 9월 8일 금요일 한강 잠수교 플로깅
  '16246783',   // "지구도 우리도 회복이 필요한 때(플로깅+템플스테이)"
  '16246780',   // 8월 14일 815런 플로깅
  '16246768',   // 백두대간 7산 종주 프로그램
  '15403766',   // 남북출신 청년 네트워킹 파티
]

// HTML에서 제목 추출
function extractTitle(html: string): string | null {
  let match = html.match(/<meta[^>]*property=["']og:title["'][^>]*content=["']([^"']+)["']/i)
  if (match) return match[1].replace(/ : 유니피벗$/, '').trim()

  match = html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*property=["']og:title["']/i)
  if (match) return match[1].replace(/ : 유니피벗$/, '').trim()

  match = html.match(/<title[^>]*>([^<]+)<\/title>/i)
  if (match) return match[1].replace(/ : 유니피벗$/, '').trim()

  return null
}

// HTML에서 썸네일 추출
function extractThumbnail(html: string): string | null {
  let match = html.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["']/i)
  if (match) return match[1]

  match = html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*property=["']og:image["']/i)
  if (match) return match[1]

  match = html.match(/cdn\.imweb\.me\/thumbnail\/[^\s"'<>]+/i)
  if (match) {
    let url = match[0]
    if (!url.startsWith('http')) url = 'https://' + url
    return url
  }

  return null
}

// HTML에서 본문 추출 (수정된 패턴 - 아임웹 fr-view 지원)
function extractContent(html: string): string | null {
  // 패턴 1: board_txt_area fr-view
  let match = html.match(/<div[^>]*class=['"][^'"]*board_txt_area[^'"]*['"][^>]*>([\s\S]*?)<\/div>\s*<\/div>/i)
  if (match && match[1].length > 50) {
    return match[1].trim()
  }

  // 패턴 2: 더 넓은 범위
  match = html.match(/<div[^>]*class=['"]board_txt_area[^'"]*['"][^>]*>([\s\S]*?)(?=<div[^>]*class=['"][^'"]*board_comment|<div[^>]*class=['"][^'"]*tools|<script)/i)
  if (match && match[1].length > 50) {
    return match[1].trim()
  }

  // 패턴 3: fr-view 클래스
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
    console.log(`  ⚠️ HTTP ${response.status}`)
  } catch (error: any) {
    console.log(`  ⚠️ 오류: ${error.message}`)
  }
  return null
}

async function migrateKmove() {
  console.log('═══════════════════════════════════════════════════════════')
  console.log('  K-MOVE 레거시 콘텐츠 이전')
  console.log('  원본 사이트: ' + ORIGINAL_SITE + '/kmove')
  console.log('═══════════════════════════════════════════════════════════\n')

  let successCount = 0
  let skipCount = 0
  let errorCount = 0

  for (let i = 0; i < kmoveIdxList.length; i++) {
    const idx = kmoveIdxList[i]
    const detailUrl = `${ORIGINAL_SITE}/kmove/?idx=${idx}&bmode=view`

    console.log(`[${i + 1}/${kmoveIdxList.length}] idx=${idx}`)
    console.log(`   URL: ${detailUrl}`)

    // HTML fetch
    const html = await fetchPage(detailUrl)
    if (!html) {
      console.log(`   ❌ fetch 실패`)
      errorCount++
      continue
    }

    // 데이터 추출
    const title = extractTitle(html)
    const thumbnail = extractThumbnail(html)
    const content = extractContent(html)

    if (!title) {
      console.log(`   ❌ 제목 추출 실패`)
      errorCount++
      continue
    }

    console.log(`   제목: ${title.substring(0, 40)}...`)
    console.log(`   썸네일: ${thumbnail ? '✓' : '없음'}`)
    console.log(`   본문: ${content ? content.length + '자 ✓' : '추출 실패 ❌'}`)

    // slug 생성 및 중복 체크
    const slug = `kmove-${idx}`
    const existing = await prisma.program.findUnique({ where: { slug } })
    if (existing) {
      console.log(`   ⏭️ 이미 존재함`)
      skipCount++
      continue
    }

    // DB 저장
    try {
      await prisma.program.create({
        data: {
          title,
          slug,
          type: 'KMOVE',
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
      errorCount++
    }

    // Rate limiting
    await new Promise(r => setTimeout(r, 500))
  }

  console.log('\n═══════════════════════════════════════════════════════════')
  console.log('  완료!')
  console.log(`  성공: ${successCount}개`)
  console.log(`  스킵: ${skipCount}개`)
  console.log(`  실패: ${errorCount}개`)
  console.log('═══════════════════════════════════════════════════════════')
}

migrateKmove()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
