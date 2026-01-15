import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    // 전역 SEO 설정 조회
    const globalSettings = await prisma.globalSeoSetting.findMany()
    const siteInfo = globalSettings.find(s => s.settingKey === 'site-info')

    const baseUrl = siteInfo?.siteUrl || 'http://localhost:3000'

    let robotsContent = ''

    // 커스텀 robots.txt가 설정된 경우
    if (siteInfo?.robotsTxt) {
      robotsContent = siteInfo.robotsTxt
    } else {
      // 기본 robots.txt 생성
      robotsContent = generateDefaultRobotsTxt(baseUrl, siteInfo?.sitemapEnabled ?? true)
    }

    // 동적으로 차단해야 할 경로들 추가
    const disallowPaths = await getDynamicDisallowPaths()
    if (disallowPaths.length > 0) {
      robotsContent += '\n# 동적 차단 경로\n'
      disallowPaths.forEach(path => {
        robotsContent += `Disallow: ${path}\n`
      })
    }

    return new NextResponse(robotsContent, {
      headers: {
        'Content-Type': 'text/plain',
        'Cache-Control': 'public, max-age=86400' // 24시간 캐시
      }
    })

  } catch (error) {
    console.error('Robots.txt generation error:', error)

    // 에러 발생 시 기본 robots.txt 반환
    const defaultRobots = `User-agent: *
Allow: /

Sitemap: ${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/sitemap.xml`

    return new NextResponse(defaultRobots, {
      headers: {
        'Content-Type': 'text/plain'
      }
    })
  }
}

function generateDefaultRobotsTxt(baseUrl: string, sitemapEnabled: boolean): string {
  let robots = `# https://www.robotstxt.org/robotstxt.html

User-agent: *
Allow: /

# 관리자 페이지 차단
Disallow: /admin/
Disallow: /api/

# 개발/테스트 관련 파일 차단
Disallow: /_next/
Disallow: /static/
Disallow: /.well-known/

# 임시/백업 파일 차단
Disallow: /tmp/
Disallow: /temp/
Disallow: /*.bak$
Disallow: /*.tmp$

# 검색 및 필터 페이지 차단 (SEO 중복 방지)
Disallow: /*?page=
Disallow: /*?search=
Disallow: /*?filter=
Disallow: /*?sort=

# 프린트 및 모바일 버전 차단
Disallow: /print/
Disallow: /m/

# 개인정보 보호 관련 페이지 차단
Disallow: /privacy-test/
Disallow: /gdpr-test/

# 404 및 에러 페이지 차단
Disallow: /404
Disallow: /500
Disallow: /error`

  // 사이트맵 추가
  if (sitemapEnabled) {
    robots += `\n\n# 사이트맵
Sitemap: ${baseUrl}/sitemap.xml`
  }

  return robots
}

async function getDynamicDisallowPaths(): Promise<string[]> {
  const disallowPaths: string[] = []

  try {
    // 비공개 또는 비활성화된 프로그램들
    const privatePrograms = await prisma.program.findMany({
      where: {
        status: { in: ['DRAFT'] }
      },
      select: { slug: true }
    })

    for (const program of privatePrograms) {
      disallowPaths.push(`/programs/${program.slug}`)
    }

    // TODO: 비공개 게시글들 처리 (Post 모델이 구현된 후)
    // const privatePosts = await prisma.post.findMany({
    //   where: { isPublished: false },
    //   select: { slug: true }
    // }).catch(() => [])
    //
    // for (const post of privatePosts) {
    //   disallowPaths.push(`/posts/${post.slug}`)
    // }

    // TODO: 종료된 이벤트들 처리 (Event 모델이 구현된 후)
    // const endedEvents = await prisma.event.findMany({
    //   where: { endDate: { lt: new Date() } },
    //   select: { slug: true }
    // }).catch(() => [])
    //
    // for (const event of endedEvents) {
    //   disallowPaths.push(`/events/${event.slug}`)
    // }

    // 비활성화된 SEO 설정이 있는 페이지들
    const inactivePages = await prisma.seoSetting.findMany({
      where: { isActive: false },
      select: { pageKey: true }
    })

    for (const page of inactivePages) {
      if (page.pageKey !== 'home') { // 홈페이지는 제외
        disallowPaths.push(`/${page.pageKey}`)
      }
    }

  } catch (error) {
    console.error('Error getting dynamic disallow paths:', error)
  }

  return disallowPaths
}

// robots.txt 관리 API (관리자용)
export async function PUT(request: NextRequest) {
  try {
    const session = await import('next-auth').then(auth => auth.getServerSession())

    // 권한 확인
    if (!session?.user || !['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) {
      return NextResponse.json({ error: '권한이 없습니다.' }, { status: 403 })
    }

    const body = await request.json()
    const { robotsContent } = body

    if (typeof robotsContent !== 'string') {
      return NextResponse.json(
        { error: 'robots.txt 내용이 올바르지 않습니다.' },
        { status: 400 }
      )
    }

    // 전역 SEO 설정 업데이트
    await prisma.globalSeoSetting.upsert({
      where: { settingKey: 'site-info' },
      update: {
        robotsTxt: robotsContent,
        updatedBy: session.user.id
      },
      create: {
        settingKey: 'site-info',
        robotsTxt: robotsContent,
        updatedBy: session.user.id
      }
    })

    return NextResponse.json({
      message: 'robots.txt가 성공적으로 업데이트되었습니다.'
    })

  } catch (error) {
    console.error('Robots.txt update error:', error)
    return NextResponse.json(
      { error: 'robots.txt 업데이트에 실패했습니다.' },
      { status: 500 }
    )
  }
}