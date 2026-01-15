import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

interface SeoMetadata {
  title?: string
  description?: string
  keywords?: string[]
  canonical?: string
  robots?: string
  openGraph: {
    title?: string
    description?: string
    image?: string
    imageAlt?: string
    type?: string
    url?: string
    siteName?: string
  }
  twitter: {
    card?: string
    title?: string
    description?: string
    image?: string
    imageAlt?: string
    site?: string
    creator?: string
  }
  schema?: object
  customHead?: string
}

// 템플릿 변수 치환 함수
function replaceTemplateVariables(template: string, variables: Record<string, any>): string {
  return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
    return variables[key] || match
  })
}

// JSON-LD 스키마 파싱 함수
function parseSchemaData(schemaData: string, variables: Record<string, any> = {}): object | null {
  try {
    // 템플릿 변수 치환
    const processedSchema = replaceTemplateVariables(schemaData, variables)
    return JSON.parse(processedSchema)
  } catch (error) {
    console.error('Error parsing schema data:', error)
    return null
  }
}

// GET: 페이지 SEO 메타데이터 조회
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const pageKey = searchParams.get('pageKey') || 'home'
    const templateKey = searchParams.get('templateKey')
    const variables = searchParams.get('variables') ? JSON.parse(searchParams.get('variables')!) : {}

    let seoSetting = null

    // 템플릿 사용 여부에 따라 처리
    if (templateKey) {
      // 동적 페이지 (템플릿 사용)
      const template = await prisma.seoTemplate.findUnique({
        where: { templateKey, isActive: true }
      })

      if (template) {
        seoSetting = {
          pageKey: templateKey,
          pageName: template.templateName,
          title: template.titleTemplate ? replaceTemplateVariables(template.titleTemplate, variables) : undefined,
          description: template.descriptionTemplate ? replaceTemplateVariables(template.descriptionTemplate, variables) : undefined,
          keywords: template.keywordsTemplate ? replaceTemplateVariables(template.keywordsTemplate, variables) : undefined,
          ogTitle: template.ogTitleTemplate ? replaceTemplateVariables(template.ogTitleTemplate, variables) : undefined,
          ogDescription: template.ogDescriptionTemplate ? replaceTemplateVariables(template.ogDescriptionTemplate, variables) : undefined,
          ogImage: template.ogImageTemplate ? replaceTemplateVariables(template.ogImageTemplate, variables) : undefined,
          twitterTitle: template.twitterTitleTemplate ? replaceTemplateVariables(template.twitterTitleTemplate, variables) : undefined,
          twitterDescription: template.twitterDescriptionTemplate ? replaceTemplateVariables(template.twitterDescriptionTemplate, variables) : undefined,
          twitterImage: template.twitterImageTemplate ? replaceTemplateVariables(template.twitterImageTemplate, variables) : undefined,
          schemaData: template.schemaTemplate ? replaceTemplateVariables(template.schemaTemplate, variables) : undefined
        }
      }
    } else {
      // 정적 페이지 (직접 설정)
      seoSetting = await prisma.seoSetting.findUnique({
        where: { pageKey, isActive: true }
      })
    }

    // 전역 설정 조회
    const globalSettings = await prisma.globalSeoSetting.findMany()
    const siteInfo = globalSettings.find(s => s.settingKey === 'site-info')

    // 메타데이터 구성
    const metadata: SeoMetadata = {
      title: seoSetting?.title || (siteInfo?.siteName && `${siteInfo.siteName}`) || undefined,
      description: seoSetting?.description || siteInfo?.siteDescription || undefined,
      keywords: seoSetting?.keywords ? seoSetting.keywords.split(',').map(k => k.trim()) : undefined,
      canonical: seoSetting?.canonical || undefined,
      robots: seoSetting?.robots || 'index,follow',
      openGraph: {
        title: seoSetting?.ogTitle || seoSetting?.title || siteInfo?.siteName || undefined,
        description: seoSetting?.ogDescription || seoSetting?.description || siteInfo?.siteDescription || undefined,
        image: seoSetting?.ogImage || siteInfo?.defaultImage || undefined,
        imageAlt: seoSetting?.ogImageAlt || undefined,
        type: seoSetting?.ogType || 'website',
        url: seoSetting?.ogUrl || undefined,
        siteName: siteInfo?.siteName || undefined
      },
      twitter: {
        card: seoSetting?.twitterCard || 'summary_large_image',
        title: seoSetting?.twitterTitle || seoSetting?.ogTitle || seoSetting?.title || undefined,
        description: seoSetting?.twitterDescription || seoSetting?.ogDescription || seoSetting?.description || undefined,
        image: seoSetting?.twitterImage || seoSetting?.ogImage || siteInfo?.defaultImage || undefined,
        imageAlt: seoSetting?.twitterImageAlt || seoSetting?.ogImageAlt || undefined,
        site: seoSetting?.twitterSite || siteInfo?.twitterHandle || undefined,
        creator: seoSetting?.twitterCreator || siteInfo?.twitterHandle || undefined
      },
      customHead: seoSetting?.customHead || undefined
    }

    // 구조화된 데이터 처리
    if (seoSetting?.schemaData) {
      const parsedSchema = parseSchemaData(seoSetting.schemaData, variables)
      if (parsedSchema) {
        metadata.schema = parsedSchema
      }
    } else if (seoSetting?.schemaType) {
      // 기본 스키마 생성
      metadata.schema = {
        '@context': 'https://schema.org',
        '@type': seoSetting.schemaType,
        name: metadata.title,
        description: metadata.description,
        url: seoSetting.canonical || siteInfo?.siteUrl,
        image: metadata.openGraph.image
      }
    }

    // 빈 값 제거
    Object.keys(metadata.openGraph).forEach(key => {
      if (!metadata.openGraph[key as keyof typeof metadata.openGraph]) {
        delete metadata.openGraph[key as keyof typeof metadata.openGraph]
      }
    })

    Object.keys(metadata.twitter).forEach(key => {
      if (!metadata.twitter[key as keyof typeof metadata.twitter]) {
        delete metadata.twitter[key as keyof typeof metadata.twitter]
      }
    })

    return NextResponse.json({ metadata })

  } catch (error) {
    console.error('Error fetching SEO metadata:', error)
    return NextResponse.json(
      { error: 'SEO 메타데이터를 불러오는데 실패했습니다.' },
      { status: 500 }
    )
  }
}

// POST: SEO 메타데이터 검증 및 미리보기
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { seoData, variables = {} } = body

    const metadata: SeoMetadata = {
      title: seoData.titleTemplate ? replaceTemplateVariables(seoData.titleTemplate, variables) : seoData.title,
      description: seoData.descriptionTemplate ? replaceTemplateVariables(seoData.descriptionTemplate, variables) : seoData.description,
      keywords: seoData.keywords ? seoData.keywords.split(',').map((k: string) => k.trim()) : undefined,
      canonical: seoData.canonical,
      robots: seoData.robots || 'index,follow',
      openGraph: {
        title: seoData.ogTitleTemplate ? replaceTemplateVariables(seoData.ogTitleTemplate, variables) : seoData.ogTitle,
        description: seoData.ogDescriptionTemplate ? replaceTemplateVariables(seoData.ogDescriptionTemplate, variables) : seoData.ogDescription,
        image: seoData.ogImageTemplate ? replaceTemplateVariables(seoData.ogImageTemplate, variables) : seoData.ogImage,
        imageAlt: seoData.ogImageAlt,
        type: seoData.ogType || 'website',
        url: seoData.ogUrl
      },
      twitter: {
        card: seoData.twitterCard || 'summary_large_image',
        title: seoData.twitterTitleTemplate ? replaceTemplateVariables(seoData.twitterTitleTemplate, variables) : seoData.twitterTitle,
        description: seoData.twitterDescriptionTemplate ? replaceTemplateVariables(seoData.twitterDescriptionTemplate, variables) : seoData.twitterDescription,
        image: seoData.twitterImageTemplate ? replaceTemplateVariables(seoData.twitterImageTemplate, variables) : seoData.twitterImage,
        imageAlt: seoData.twitterImageAlt,
        site: seoData.twitterSite,
        creator: seoData.twitterCreator
      },
      customHead: seoData.customHead
    }

    // 구조화된 데이터 처리
    if (seoData.schemaTemplate || seoData.schemaData) {
      const schemaString = seoData.schemaTemplate || seoData.schemaData
      const parsedSchema = parseSchemaData(schemaString, variables)
      if (parsedSchema) {
        metadata.schema = parsedSchema
      }
    }

    return NextResponse.json({ metadata })

  } catch (error) {
    console.error('Error processing SEO metadata:', error)
    return NextResponse.json(
      { error: 'SEO 메타데이터 처리에 실패했습니다.' },
      { status: 500 }
    )
  }
}