/**
 * 독서모임 레거시 프로그램 썸네일 업데이트 스크립트
 *
 * 실행: npx tsx scripts/update-bookclub-thumbnails.ts
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const BASE_URL = 'https://bestcome.org/unipivot-ver2'

// 썸네일 매핑 (이전 스크립트의 목록과 동일한 순서)
const offlineThumbnails: Record<string, string> = {}
const onlineThumbnails: Record<string, string> = {}

// HTML에서 프로그램 카드와 썸네일 추출
function extractThumbnails(html: string): Array<{ title: string; url: string; thumbnail: string }> {
  const results: Array<{ title: string; url: string; thumbnail: string }> = []

  // 카드 패턴: 이미지와 링크가 있는 카드 구조
  // 패턴 1: data-link-url 속성에서 URL, img src에서 썸네일
  const cardPattern = /<a[^>]*href=["']([^"']*bookclub[^"']*)["'][^>]*>[\s\S]*?<img[^>]*src=["'](https:\/\/cdn\.imweb\.me\/thumbnail\/[^"']+)["'][^>]*>[\s\S]*?<[^>]*class="[^"]*title[^"]*"[^>]*>([^<]+)</gi

  let match
  while ((match = cardPattern.exec(html)) !== null) {
    results.push({
      url: match[1],
      thumbnail: match[2],
      title: match[3].trim()
    })
  }

  // 패턴 2: 다른 구조 시도
  if (results.length === 0) {
    // img 태그와 제목을 별도로 찾기
    const imgPattern = /src=["'](https:\/\/cdn\.imweb\.me\/thumbnail\/[^"']+)["']/gi
    const thumbnails: string[] = []
    while ((match = imgPattern.exec(html)) !== null) {
      thumbnails.push(match[1])
    }

    // 링크와 제목 찾기
    const linkPattern = /href=["']([^"']*bookclub[^"']*\.html)["'][^>]*>[\s\S]*?(?:title|tit)[^>]*>([^<]+)</gi
    const links: Array<{ url: string; title: string }> = []
    while ((match = linkPattern.exec(html)) !== null) {
      links.push({ url: match[1], title: match[2].trim() })
    }

    // 매칭 (순서대로 매핑)
    for (let i = 0; i < Math.min(thumbnails.length, links.length); i++) {
      results.push({
        url: links[i].url,
        thumbnail: thumbnails[i],
        title: links[i].title
      })
    }
  }

  return results
}

// URL에서 ID 추출 (예: /bookclub_offline/15403411.html -> 15403411)
function extractIdFromUrl(url: string): string | null {
  const match = url.match(/(\d+)\.html$/)
  return match ? match[1] : null
}

async function updateThumbnails() {
  console.log('═══════════════════════════════════════════════════════════')
  console.log('  독서모임 썸네일 업데이트 시작')
  console.log('═══════════════════════════════════════════════════════════\n')

  // 1. 오프라인 목록 페이지 fetch
  console.log('1. 오프라인 목록 페이지 fetch...')
  const offlineResponse = await fetch(`${BASE_URL}/bookclub_offline.html`)
  const offlineHtml = await offlineResponse.text()

  // 2. 온라인 목록 페이지 fetch
  console.log('2. 온라인 목록 페이지 fetch...')
  const onlineResponse = await fetch(`${BASE_URL}/bookclub_olinen.html`)
  const onlineHtml = await onlineResponse.text()

  // 3. 썸네일 추출
  console.log('\n3. 썸네일 추출 중...')

  // 간단하게 cdn.imweb.me/thumbnail/ 패턴으로 추출
  const offlineImgPattern = /cdn\.imweb\.me\/thumbnail\/[^"'\s)]+/g
  const offlineImages: string[] = []
  let match
  while ((match = offlineImgPattern.exec(offlineHtml)) !== null) {
    const url = 'https://' + match[0]
    if (!offlineImages.includes(url)) {
      offlineImages.push(url)
    }
  }
  console.log(`   오프라인: ${offlineImages.length}개 이미지 발견`)

  const onlineImgPattern = /cdn\.imweb\.me\/thumbnail\/[^"'\s)]+/g
  const onlineImages: string[] = []
  while ((match = onlineImgPattern.exec(onlineHtml)) !== null) {
    const url = 'https://' + match[0]
    if (!onlineImages.includes(url)) {
      onlineImages.push(url)
    }
  }
  console.log(`   온라인: ${onlineImages.length}개 이미지 발견`)

  // 4. DB에서 레거시 프로그램 가져오기
  console.log('\n4. DB에서 레거시 프로그램 조회...')
  const legacyPrograms = await prisma.program.findMany({
    where: { isLegacy: true, type: 'BOOKCLUB' },
    orderBy: { createdAt: 'asc' },
    select: { id: true, slug: true, title: true, isOnline: true, originalUrl: true }
  })

  const offlinePrograms = legacyPrograms.filter(p => !p.isOnline)
  const onlinePrograms = legacyPrograms.filter(p => p.isOnline)

  console.log(`   오프라인 프로그램: ${offlinePrograms.length}개`)
  console.log(`   온라인 프로그램: ${onlinePrograms.length}개`)

  // 5. 썸네일 업데이트
  console.log('\n5. 썸네일 업데이트 중...\n')

  let updateCount = 0
  let errorCount = 0

  // 오프라인 프로그램 업데이트 (순서대로 매핑)
  for (let i = 0; i < offlinePrograms.length; i++) {
    const program = offlinePrograms[i]
    const thumbnail = offlineImages[i]

    if (thumbnail) {
      try {
        await prisma.program.update({
          where: { id: program.id },
          data: { image: thumbnail }
        })
        console.log(`  ✅ [오프라인 ${i+1}] ${program.title.substring(0, 35)}...`)
        updateCount++
      } catch (error: any) {
        console.log(`  ❌ [오프라인 ${i+1}] ${program.title.substring(0, 35)}... - ${error.message}`)
        errorCount++
      }
    } else {
      console.log(`  ⚠️ [오프라인 ${i+1}] ${program.title.substring(0, 35)}... - 썸네일 없음`)
    }
  }

  // 온라인 프로그램 업데이트
  for (let i = 0; i < onlinePrograms.length; i++) {
    const program = onlinePrograms[i]
    const thumbnail = onlineImages[i]

    if (thumbnail) {
      try {
        await prisma.program.update({
          where: { id: program.id },
          data: { image: thumbnail }
        })
        console.log(`  ✅ [온라인 ${i+1}] ${program.title.substring(0, 35)}...`)
        updateCount++
      } catch (error: any) {
        console.log(`  ❌ [온라인 ${i+1}] ${program.title.substring(0, 35)}... - ${error.message}`)
        errorCount++
      }
    } else {
      console.log(`  ⚠️ [온라인 ${i+1}] ${program.title.substring(0, 35)}... - 썸네일 없음`)
    }
  }

  console.log('\n═══════════════════════════════════════════════════════════')
  console.log('  완료!')
  console.log(`  업데이트: ${updateCount}개`)
  console.log(`  실패: ${errorCount}개`)
  console.log('═══════════════════════════════════════════════════════════')
}

updateThumbnails()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
