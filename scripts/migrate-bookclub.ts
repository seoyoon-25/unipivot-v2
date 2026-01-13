/**
 * 독서모임 레거시 콘텐츠 이전 스크립트
 *
 * 실행: npx ts-node scripts/migrate-bookclub.ts
 * 또는: npx tsx scripts/migrate-bookclub.ts
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const BASE_URL = 'https://bestcome.org/unipivot-ver2'

// 오프라인 독서모임 목록
const offlinePrograms = [
  { title: '[오프라인 독서모임 시즌26] AI와 함께 사는 삶을 준비하기 위한 독서모임', url: '/bookclub_offline/165833306.html' },
  { title: '[오프라인 시즌25] 진실과 거짓에 대한 분별력을 키우는 독서모임', url: '/bookclub_offline/148826796.html' },
  { title: '[시즌24] 화요일 마음힐링 독서모임 회원 모집', url: '/bookclub_offline/47467415.html' },
  { title: '[시즌22] 남북한걸음 회원모집 공지', url: '/bookclub_offline/15403411.html' },
  { title: '[시즌21] 남북한걸음 회원모집 공지', url: '/bookclub_offline/15403402.html' },
  { title: '[시즌20] 남북한걸음 회원모집 공지', url: '/bookclub_offline/15403385.html' },
  { title: '[시즌19] 남북한걸음 회원모집 공지', url: '/bookclub_offline/15403372.html' },
  { title: '[시즌18] 남북한걸음 회원모집 공지', url: '/bookclub_offline/15403355.html' },
  { title: '[시즌17] 남북한걸음 회원모집 공지', url: '/bookclub_offline/15403345.html' },
  { title: '[시즌16] 남북한걸음 회원모집 공지', url: '/bookclub_offline/15403338.html' },
  { title: '[시즌15] 남북한걸음 회원가입 공지', url: '/bookclub_offline/15403332.html' },
  { title: '[시즌14] 남북한걸음 회원가입 공지', url: '/bookclub_offline/15403326.html' },
  { title: '[시즌13] 남북한걸음 회원가입 공지', url: '/bookclub_offline/15403307.html' },
  { title: '[시즌12] 남북한걸음 회원모집 공지', url: '/bookclub_offline/15403302.html' },
  { title: '[시즌11] 남북한걸음 회원모집 공지', url: '/bookclub_offline/15403299.html' },
  { title: '[시즌10] 남북한걸음 회원모집 공지', url: '/bookclub_offline/15403291.html' },
  { title: '[시즌9] 남북한걸음 회원모집 공지', url: '/bookclub_offline/15403286.html' },
  { title: '[시즌8] 남북한걸음 회원모집 공지', url: '/bookclub_offline/15403279.html' },
  { title: '[시즌7] 남북한걸음 회원모집 공지', url: '/bookclub_offline/15403273.html' },
  { title: '[시즌6] 남북한걸음 회원모집 공지', url: '/bookclub_offline/15403267.html' },
  { title: '[시즌5] 남북한걸음 회원 모집 공지', url: '/bookclub_offline/15403264.html' },
  { title: '[시즌4] 남북한걸음 회원모집 공지', url: '/bookclub_offline/15403260.html' },
  { title: '[시즌3] 한 걸음 가득 독서모임 회원 모집', url: '/bookclub_offline/15403227.html' },
]

// 온라인 독서모임 목록
const onlinePrograms = [
  { title: '[온라인 독서 15] 나를 키우는 철학 :알랭드보통 특집', url: '/bookclub_olinen/169214127.html' },
  { title: '[온라인 시즌14] 부의 근육을 키우는 경제독서모임 회원모집', url: '/bookclub_olinen/169214010.html' },
  { title: '[온라인 시즌13] 응답하라 1950 ~ 1990 소설 독서모임 회원모집', url: '/bookclub_olinen/167027302.html' },
  { title: '[온라인 시즌12] 우리들은 자란다, 아동·청소년 문학 읽기 회원모집', url: '/bookclub_olinen/159924381.html' },
  { title: '[온라인 시즌11] 노벨문학상 한강소설 읽기 독서모임 회원모집', url: '/bookclub_olinen/127362311.html' },
  { title: '[온라인 시즌10] 소설로 읽는 미국사회 독서모임 회원모집', url: '/bookclub_olinen/47677038.html' },
  { title: '[온라인 시즌9] "성공을 위한 초집중 훈련" 독서모임 회원모집', url: '/bookclub_olinen/18953067.html' },
  { title: '에리히 프롬 책 읽기', url: '/bookclub_olinen/16896907.html' },
  { title: '[시즌3]더 \'행복한 삶\'을 위한 독서', url: '/bookclub_olinen/16895793.html' },
  { title: '[시즌8] "혼돈의 세상을 관통한 현인" 온라인 독서모임 회원 모집', url: '/bookclub_olinen/16883251.html' },
  { title: '[시즌7] 남북한걸음 회원 모집 공지', url: '/bookclub_olinen/15403673.html' },
  { title: '[시즌6] 남북한걸음 회원 모집 공지', url: '/bookclub_olinen/15403665.html' },
  { title: '[시즌5] 남북한걸음 회원 모집 공지', url: '/bookclub_olinen/15403639.html' },
  { title: '[시즌4] 남북한걸음', url: '/bookclub_olinen/15403631.html' },
  { title: '[시즌2] 남북한걸음 회원모집 공지', url: '/bookclub_olinen/15403618.html' },
  { title: '[시즌1] 독서모임 회원모집 공지', url: '/bookclub_olinen/15403611.html' },
]

// slug 생성 함수
function generateSlug(title: string, index: number, type: 'offline' | 'online'): string {
  // 시즌 번호 추출
  const seasonMatch = title.match(/시즌\s*(\d+)|독서\s*(\d+)/i)
  const season = seasonMatch ? (seasonMatch[1] || seasonMatch[2]) : null

  if (season) {
    return `bookclub-${type}-season-${season}`
  }

  // 시즌 번호가 없으면 인덱스 사용
  return `bookclub-${type}-${index + 1}`
}

// HTML에서 본문 콘텐츠 추출
function extractContent(html: string): { content: string; images: string[] } {
  // 이미지 URL 추출
  const imageRegex = /src=["'](https?:\/\/[^"']+(?:\.jpg|\.jpeg|\.png|\.gif|\.webp)[^"']*)["']/gi
  const images: string[] = []
  let match
  while ((match = imageRegex.exec(html)) !== null) {
    images.push(match[1])
  }

  // 본문 콘텐츠 추출 (여러 패턴 시도)
  let content = ''

  // 패턴 1: POST_DETAIL 클래스
  const postDetailMatch = html.match(/<div[^>]*class="[^"]*POST_DETAIL[^"]*"[^>]*>([\s\S]*?)<\/div>\s*(?:<div[^>]*class="[^"]*(?:footer|nav|comment)[^"]*"|<footer|$)/i)
  if (postDetailMatch) {
    content = postDetailMatch[1]
  }

  // 패턴 2: post-content 클래스
  if (!content) {
    const postContentMatch = html.match(/<div[^>]*class="[^"]*post-content[^"]*"[^>]*>([\s\S]*?)<\/div>\s*(?:<div[^>]*class="[^"]*(?:footer|nav|comment)[^"]*"|<footer|$)/i)
    if (postContentMatch) {
      content = postContentMatch[1]
    }
  }

  // 패턴 3: article 태그
  if (!content) {
    const articleMatch = html.match(/<article[^>]*>([\s\S]*?)<\/article>/i)
    if (articleMatch) {
      content = articleMatch[1]
    }
  }

  // 패턴 4: main 태그
  if (!content) {
    const mainMatch = html.match(/<main[^>]*>([\s\S]*?)<\/main>/i)
    if (mainMatch) {
      content = mainMatch[1]
    }
  }

  // 패턴 5: body에서 header/footer 제외
  if (!content) {
    const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i)
    if (bodyMatch) {
      content = bodyMatch[1]
        .replace(/<header[\s\S]*?<\/header>/gi, '')
        .replace(/<footer[\s\S]*?<\/footer>/gi, '')
        .replace(/<nav[\s\S]*?<\/nav>/gi, '')
    }
  }

  return { content: content || html, images }
}

// 페이지 fetch
async function fetchPage(url: string): Promise<string | null> {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; MigrationBot/1.0)',
        'Accept': 'text/html,application/xhtml+xml',
      },
    })

    if (!response.ok) {
      console.error(`  ❌ HTTP ${response.status}: ${url}`)
      return null
    }

    return await response.text()
  } catch (error) {
    console.error(`  ❌ Fetch error: ${url}`, error)
    return null
  }
}

// 메인 이전 함수
async function migratePrograms() {
  console.log('═══════════════════════════════════════════════════════════')
  console.log('  독서모임 레거시 콘텐츠 이전 시작')
  console.log('═══════════════════════════════════════════════════════════\n')

  const allPrograms = [
    ...offlinePrograms.map((p, i) => ({ ...p, type: 'offline' as const, index: i })),
    ...onlinePrograms.map((p, i) => ({ ...p, type: 'online' as const, index: i })),
  ]

  let successCount = 0
  let errorCount = 0
  const errors: string[] = []

  for (let i = 0; i < allPrograms.length; i++) {
    const program = allPrograms[i]
    const fullUrl = `${BASE_URL}${program.url}`
    const locationType = program.type === 'offline' ? 'OFFLINE' : 'ONLINE'

    console.log(`[${i + 1}/${allPrograms.length}] ${program.title}`)
    console.log(`  URL: ${fullUrl}`)

    // 페이지 fetch
    const html = await fetchPage(fullUrl)
    if (!html) {
      errorCount++
      errors.push(`${program.title}: fetch 실패`)
      continue
    }

    // 콘텐츠 추출
    const { content, images } = extractContent(html)
    console.log(`  이미지 ${images.length}개 발견`)

    // slug 생성 (중복 방지)
    let slug = generateSlug(program.title, program.index, program.type)

    // 중복 체크
    const existing = await prisma.program.findUnique({ where: { slug } })
    if (existing) {
      // URL의 ID를 slug에 추가
      const urlId = program.url.match(/(\d+)\.html$/)?.[1] || Date.now().toString()
      slug = `${slug}-${urlId}`
    }

    try {
      // DB 저장
      await prisma.program.create({
        data: {
          title: program.title,
          slug,
          type: 'BOOKCLUB',
          status: 'COMPLETED',
          isOnline: program.type === 'online',
          description: `레거시 콘텐츠 - ${program.title}`,

          // 레거시 필드
          isLegacy: true,
          legacyHtml: content,
          legacyImages: images,
          originalUrl: fullUrl,
          migratedAt: new Date(),

          // 기본값
          capacity: 0,
        },
      })

      successCount++
      console.log(`  ✅ 저장 완료 (slug: ${slug})`)
    } catch (error: any) {
      errorCount++
      errors.push(`${program.title}: ${error.message}`)
      console.error(`  ❌ 저장 실패:`, error.message)
    }

    // 매 5개마다 진행상황 출력
    if ((i + 1) % 5 === 0) {
      console.log(`\n  ━━━ [${i + 1}/${allPrograms.length}] 완료 ━━━\n`)
    }

    // rate limiting 방지
    await new Promise(resolve => setTimeout(resolve, 500))
  }

  console.log('\n═══════════════════════════════════════════════════════════')
  console.log('  이전 완료!')
  console.log(`  성공: ${successCount}개`)
  console.log(`  실패: ${errorCount}개`)
  console.log('═══════════════════════════════════════════════════════════')

  if (errors.length > 0) {
    console.log('\n실패 목록:')
    errors.forEach(e => console.log(`  - ${e}`))
  }
}

// 실행
migratePrograms()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
