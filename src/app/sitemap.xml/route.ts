import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

interface SitemapUrl {
  loc: string
  lastmod?: string
  changefreq?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never'
  priority?: number
}

export async function GET(request: NextRequest) {
  try {
    const sitemapUrls: SitemapUrl[] = []

    // 전역 설정 조회
    const globalSettings = await prisma.globalSeoSetting.findMany()
    const siteInfo = globalSettings.find(s => s.settingKey === 'site-info')

    if (!siteInfo?.sitemapEnabled) {
      return new NextResponse('Sitemap generation is disabled', { status: 404 })
    }

    const baseUrl = siteInfo.siteUrl || 'http://localhost:3000'
    const defaultChangefreq = (siteInfo.sitemapChangefreq || 'weekly') as 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never'
    const defaultPriority = siteInfo.sitemapPriority || 0.5

    // 활성화된 SEO 설정이 있는 페이지들 조회
    const seoSettings = await prisma.seoSetting.findMany({
      where: { isActive: true },
      orderBy: { priority: 'desc' }
    })

    // SEO 설정 기반으로 URL 생성
    for (const setting of seoSettings) {
      const url: SitemapUrl = {
        loc: `${baseUrl}/${setting.pageKey === 'home' ? '' : setting.pageKey}`,
        changefreq: defaultChangefreq,
        priority: setting.priority > 0 ? setting.priority / 100 : defaultPriority,
        lastmod: setting.updatedAt.toISOString().split('T')[0]
      }

      // canonical URL이 설정된 경우 해당 URL 사용
      if (setting.canonical) {
        url.loc = setting.canonical
      }

      sitemapUrls.push(url)
    }

    // 동적 콘텐츠 페이지들 추가
    await addDynamicPages(sitemapUrls, baseUrl, defaultChangefreq, defaultPriority)

    // XML 생성
    const sitemap = generateSitemapXml(sitemapUrls)

    return new NextResponse(sitemap, {
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=3600' // 1시간 캐시
      }
    })

  } catch (error) {
    console.error('Sitemap generation error:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}

async function addDynamicPages(
  sitemapUrls: SitemapUrl[],
  baseUrl: string,
  defaultChangefreq: string,
  defaultPriority: number
) {
  try {
    // 프로그램 페이지들 추가
    const programs = await prisma.program.findMany({
      where: {
        status: { in: ['RECRUITING', 'RECRUIT_CLOSED', 'ONGOING', 'COMPLETED'] }
      },
      select: {
        slug: true,
        updatedAt: true,
        type: true
      }
    })

    for (const program of programs) {
      sitemapUrls.push({
        loc: `${baseUrl}/programs/${program.slug}`,
        lastmod: program.updatedAt.toISOString().split('T')[0],
        changefreq: 'monthly' as const,
        priority: 0.8
      })
    }

    // TODO: 블로그/뉴스 페이지들 추가 (Post 모델이 구현된 후)
    // const posts = await prisma.post.findMany({
    //   where: { isPublished: true },
    //   select: { slug: true, updatedAt: true, category: true }
    // }).catch(() => [])
    //
    // for (const post of posts) {
    //   sitemapUrls.push({
    //     loc: `${baseUrl}/posts/${post.slug}`,
    //     lastmod: post.updatedAt.toISOString().split('T')[0],
    //     changefreq: 'weekly' as const,
    //     priority: 0.6
    //   })
    // }

    // TODO: 이벤트 페이지들 추가 (Event 모델이 구현된 후)
    // const events = await prisma.event.findMany({
    //   where: { isPublished: true, endDate: { gte: new Date() } },
    //   select: { slug: true, updatedAt: true }
    // }).catch(() => [])
    //
    // for (const event of events) {
    //   sitemapUrls.push({
    //     loc: `${baseUrl}/events/${event.slug}`,
    //     lastmod: event.updatedAt.toISOString().split('T')[0],
    //     changefreq: 'daily' as const,
    //     priority: 0.7
    //   })
    // }

    // 기본 정적 페이지들 추가 (SEO 설정이 없는 경우)
    const staticPages = [
      { path: '/about', priority: 0.8, changefreq: 'monthly' as const },
      { path: '/contact', priority: 0.6, changefreq: 'yearly' as const },
      { path: '/programs', priority: 0.9, changefreq: 'weekly' as const },
      { path: '/events', priority: 0.7, changefreq: 'daily' as const },
      { path: '/news', priority: 0.7, changefreq: 'daily' as const }
    ]

    const existingPaths = new Set(sitemapUrls.map(url => new URL(url.loc).pathname))

    for (const page of staticPages) {
      if (!existingPaths.has(page.path)) {
        sitemapUrls.push({
          loc: `${baseUrl}${page.path}`,
          changefreq: page.changefreq,
          priority: page.priority,
          lastmod: new Date().toISOString().split('T')[0]
        })
      }
    }

  } catch (error) {
    console.error('Error adding dynamic pages to sitemap:', error)
  }
}

function generateSitemapXml(urls: SitemapUrl[]): string {
  const urlElements = urls.map(url => {
    let urlXml = `  <url>
    <loc>${escapeXml(url.loc)}</loc>`

    if (url.lastmod) {
      urlXml += `
    <lastmod>${url.lastmod}</lastmod>`
    }

    if (url.changefreq) {
      urlXml += `
    <changefreq>${url.changefreq}</changefreq>`
    }

    if (url.priority !== undefined) {
      urlXml += `
    <priority>${url.priority.toFixed(1)}</priority>`
    }

    urlXml += `
  </url>`

    return urlXml
  }).join('\n')

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlElements}
</urlset>`
}

function escapeXml(unsafe: string): string {
  return unsafe.replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case '<': return '&lt;'
      case '>': return '&gt;'
      case '&': return '&amp;'
      case "'": return '&apos;'
      case '"': return '&quot;'
      default: return c
    }
  })
}