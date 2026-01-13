/**
 * 독서모임 레거시 데이터 정확한 재매핑 스크립트
 *
 * 원본 사이트(www.unipivot.org)에서 idx 기반으로 정확한 데이터 fetch
 *
 * 실행: npx tsx scripts/fix-bookclub-data.ts
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const ORIGINAL_SITE = 'https://www.unipivot.org'

// originalUrl에서 idx 추출
// 예: https://bestcome.org/unipivot-ver2/bookclub_offline/165833306.html -> 165833306
function extractIdx(originalUrl: string): string | null {
  const match = originalUrl.match(/(\d+)\.html$/)
  return match ? match[1] : null
}

// originalUrl에서 타입 추출 (bookclub_offline 또는 bookclub_olinen)
function extractType(originalUrl: string): string | null {
  if (originalUrl.includes('bookclub_offline')) return 'bookclub_offline'
  if (originalUrl.includes('bookclub_olinen')) return 'bookclub_olinen'
  return null
}

// HTML에서 og:image 메타 태그 추출
function extractOgImage(html: string): string | null {
  const match = html.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["']/i)
  if (match) return match[1]

  // 역순 패턴도 시도
  const match2 = html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*property=["']og:image["']/i)
  return match2 ? match2[1] : null
}

// HTML에서 첫 번째 썸네일 이미지 추출
function extractFirstThumbnail(html: string): string | null {
  // cdn.imweb.me/thumbnail 패턴 찾기
  const match = html.match(/(?:https?:)?\/?\/?cdn\.imweb\.me\/thumbnail\/[^\s"'<>]+/i)
  if (match) {
    let url = match[0]
    // URL 정규화
    if (url.startsWith('//')) url = 'https:' + url
    if (url.startsWith('cdn.')) url = 'https://' + url
    return url
  }
  return null
}

// HTML에서 본문 콘텐츠 추출 (board_txt_area 또는 POST_DETAIL)
function extractContent(html: string): string | null {
  // 패턴 1: board_txt_area
  let match = html.match(/<div[^>]*class="[^"]*board_txt_area[^"]*"[^>]*>([\s\S]*?)<\/div>\s*(?:<div[^>]*class="[^"]*(?:board_comment|board_view_sns|tools)[^"]*"|<script|$)/i)
  if (match) return match[1].trim()

  // 패턴 2: POST_DETAIL
  match = html.match(/<div[^>]*class="[^"]*POST_DETAIL[^"]*"[^>]*>([\s\S]*?)<\/div>\s*(?:<div[^>]*class="[^"]*(?:comment|sns|tools)[^"]*"|<script|$)/i)
  if (match) return match[1].trim()

  // 패턴 3: board_view 내부 content
  match = html.match(/<div[^>]*class="[^"]*board_view[^"]*"[^>]*>[\s\S]*?<div[^>]*class="[^"]*content[^"]*"[^>]*>([\s\S]*?)<\/div>/i)
  if (match) return match[1].trim()

  return null
}

// 더 정교한 본문 추출 (전체 board_view 영역)
function extractFullContent(html: string): string | null {
  // 게시물 본문 전체 영역
  const startPatterns = [
    /<div[^>]*class="[^"]*board_txt_area[^"]*"[^>]*>/i,
    /<div[^>]*class="[^"]*board_view_area[^"]*"[^>]*>/i,
    /<article[^>]*>/i
  ]

  for (const pattern of startPatterns) {
    const startMatch = html.match(pattern)
    if (startMatch) {
      const startIdx = startMatch.index! + startMatch[0].length

      // 종료 지점 찾기 (댓글, SNS 공유, 목록 버튼 등)
      const endPatterns = [
        /<div[^>]*class="[^"]*board_comment/i,
        /<div[^>]*class="[^"]*board_view_sns/i,
        /<div[^>]*class="[^"]*board_bottom/i,
        /<div[^>]*class="[^"]*tools[^"]*">/i,
        /<\/article>/i
      ]

      let endIdx = html.length
      for (const endPattern of endPatterns) {
        const endMatch = html.slice(startIdx).match(endPattern)
        if (endMatch && startIdx + endMatch.index! < endIdx) {
          endIdx = startIdx + endMatch.index!
        }
      }

      const content = html.slice(startIdx, endIdx).trim()
      if (content.length > 100) { // 최소 길이 체크
        return content
      }
    }
  }

  return null
}

async function fetchWithRetry(url: string, retries = 3): Promise<string | null> {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'ko-KR,ko;q=0.9,en;q=0.8',
        },
      })

      if (response.ok) {
        return await response.text()
      }

      console.log(`    ⚠️ HTTP ${response.status}, 재시도 ${i + 1}/${retries}`)
    } catch (error: any) {
      console.log(`    ⚠️ 네트워크 오류, 재시도 ${i + 1}/${retries}: ${error.message}`)
    }

    await new Promise(r => setTimeout(r, 1000)) // 재시도 전 대기
  }

  return null
}

async function fixBookclubData() {
  console.log('═══════════════════════════════════════════════════════════')
  console.log('  독서모임 레거시 데이터 정확한 재매핑')
  console.log('  원본 사이트: ' + ORIGINAL_SITE)
  console.log('═══════════════════════════════════════════════════════════\n')

  // 1. DB에서 레거시 프로그램 조회
  console.log('1. DB에서 레거시 프로그램 조회...')
  const programs = await prisma.program.findMany({
    where: { isLegacy: true, type: 'BOOKCLUB' },
    select: {
      id: true,
      title: true,
      slug: true,
      originalUrl: true,
      isOnline: true,
      image: true,
    },
    orderBy: { createdAt: 'asc' }
  })

  console.log(`   총 ${programs.length}개 프로그램 발견\n`)

  let successCount = 0
  let errorCount = 0
  const errors: string[] = []

  // 2. 각 프로그램에 대해 원본 사이트에서 데이터 fetch
  for (let i = 0; i < programs.length; i++) {
    const program = programs[i]

    console.log(`[${i + 1}/${programs.length}] ${program.title.substring(0, 50)}...`)

    // idx와 타입 추출
    const idx = extractIdx(program.originalUrl || '')
    const type = extractType(program.originalUrl || '')

    if (!idx || !type) {
      console.log(`   ❌ idx 또는 타입 추출 실패`)
      errors.push(`${program.title}: idx/type 추출 실패`)
      errorCount++
      continue
    }

    // 원본 사이트 URL 구성
    const detailUrl = `${ORIGINAL_SITE}/${type}/?idx=${idx}&bmode=view`
    console.log(`   URL: ${detailUrl}`)

    // HTML fetch
    const html = await fetchWithRetry(detailUrl)

    if (!html) {
      console.log(`   ❌ 페이지 fetch 실패`)
      errors.push(`${program.title}: fetch 실패`)
      errorCount++
      continue
    }

    // 데이터 추출
    const ogImage = extractOgImage(html)
    const thumbnail = ogImage || extractFirstThumbnail(html)
    const content = extractFullContent(html) || extractContent(html)

    if (!thumbnail) {
      console.log(`   ⚠️ 썸네일 추출 실패 (기존 유지)`)
    } else {
      console.log(`   ✓ 썸네일: ${thumbnail.substring(0, 60)}...`)
    }

    if (!content) {
      console.log(`   ⚠️ 본문 추출 실패 (기존 유지)`)
    } else {
      console.log(`   ✓ 본문: ${content.length}자`)
    }

    // DB 업데이트 (변경된 것만)
    const updateData: any = {}
    if (thumbnail && thumbnail !== program.image) {
      updateData.image = thumbnail
    }
    if (content) {
      updateData.legacyHtml = content
    }

    // originalUrl을 원본 사이트로 업데이트
    updateData.originalUrl = detailUrl

    if (Object.keys(updateData).length > 0) {
      try {
        await prisma.program.update({
          where: { id: program.id },
          data: updateData
        })
        console.log(`   ✅ 업데이트 완료`)
        successCount++
      } catch (error: any) {
        console.log(`   ❌ DB 업데이트 실패: ${error.message}`)
        errors.push(`${program.title}: DB 업데이트 실패`)
        errorCount++
      }
    } else {
      console.log(`   ⏭️ 변경 없음`)
      successCount++
    }

    // Rate limiting
    await new Promise(r => setTimeout(r, 500))

    // 매 10개마다 진행 상황
    if ((i + 1) % 10 === 0) {
      console.log(`\n   ━━━ [${i + 1}/${programs.length}] 완료 ━━━\n`)
    }
  }

  console.log('\n═══════════════════════════════════════════════════════════')
  console.log('  완료!')
  console.log(`  성공: ${successCount}개`)
  console.log(`  실패: ${errorCount}개`)
  console.log('═══════════════════════════════════════════════════════════')

  if (errors.length > 0) {
    console.log('\n실패 목록:')
    errors.forEach(e => console.log(`  - ${e}`))
  }
}

fixBookclubData()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
