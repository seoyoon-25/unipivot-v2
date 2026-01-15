'use client'

import { useEffect } from 'react'
import Head from 'next/head'

interface MetaTagsProps {
  pageKey?: string
  templateKey?: string
  variables?: Record<string, any>
  title?: string
  description?: string
  canonical?: string
  noIndex?: boolean
}

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

export default function MetaTags({
  pageKey = 'default',
  templateKey,
  variables = {},
  title,
  description,
  canonical,
  noIndex = false
}: MetaTagsProps) {
  useEffect(() => {
    const loadMetadata = async () => {
      try {
        const params = new URLSearchParams()
        params.append('pageKey', pageKey)

        if (templateKey) {
          params.append('templateKey', templateKey)
        }

        if (Object.keys(variables).length > 0) {
          params.append('variables', JSON.stringify(variables))
        }

        const response = await fetch(`/api/seo/metadata?${params.toString()}`)

        if (response.ok) {
          const data = await response.json()
          const metadata: SeoMetadata = data.metadata

          // 동적으로 meta 태그 생성 및 업데이트
          updateMetaTags(metadata)
        }
      } catch (error) {
        console.error('SEO 메타데이터 로드 실패:', error)
      }
    }

    loadMetadata()
  }, [pageKey, templateKey, JSON.stringify(variables)])

  const updateMetaTags = (metadata: SeoMetadata) => {
    const head = document.head

    // 기존 동적 메타 태그 제거 (data-dynamic 속성을 가진 것들)
    const existingTags = head.querySelectorAll('meta[data-dynamic="true"], link[data-dynamic="true"]')
    existingTags.forEach(tag => tag.remove())

    // 기본 메타 태그 생성
    if (metadata.title) {
      updateOrCreateTag('title', null, metadata.title)
      createMetaTag('og:title', metadata.openGraph.title || metadata.title)
      createMetaTag('twitter:title', metadata.twitter.title || metadata.openGraph.title || metadata.title)
    }

    if (metadata.description) {
      createMetaTag('description', metadata.description)
      createMetaTag('og:description', metadata.openGraph.description || metadata.description)
      createMetaTag('twitter:description', metadata.twitter.description || metadata.openGraph.description || metadata.description)
    }

    if (metadata.keywords && metadata.keywords.length > 0) {
      createMetaTag('keywords', metadata.keywords.join(', '))
    }

    // 로봇 메타 태그
    const robots = noIndex ? 'noindex,nofollow' : (metadata.robots || 'index,follow')
    createMetaTag('robots', robots)

    // Canonical URL
    if (canonical || metadata.canonical) {
      createLinkTag('canonical', canonical || metadata.canonical!)
    }

    // Open Graph 태그
    if (metadata.openGraph.image) {
      createMetaTag('og:image', metadata.openGraph.image)
      if (metadata.openGraph.imageAlt) {
        createMetaTag('og:image:alt', metadata.openGraph.imageAlt)
      }
    }

    if (metadata.openGraph.type) {
      createMetaTag('og:type', metadata.openGraph.type)
    }

    if (metadata.openGraph.url) {
      createMetaTag('og:url', metadata.openGraph.url)
    }

    if (metadata.openGraph.siteName) {
      createMetaTag('og:site_name', metadata.openGraph.siteName)
    }

    // Twitter Card 태그
    if (metadata.twitter.card) {
      createMetaTag('twitter:card', metadata.twitter.card)
    }

    if (metadata.twitter.image) {
      createMetaTag('twitter:image', metadata.twitter.image)
      if (metadata.twitter.imageAlt) {
        createMetaTag('twitter:image:alt', metadata.twitter.imageAlt)
      }
    }

    if (metadata.twitter.site) {
      createMetaTag('twitter:site', metadata.twitter.site)
    }

    if (metadata.twitter.creator) {
      createMetaTag('twitter:creator', metadata.twitter.creator)
    }

    // 구조화된 데이터 (JSON-LD)
    if (metadata.schema) {
      createSchemaScript(metadata.schema)
    }

    // 커스텀 헤드 콘텐츠
    if (metadata.customHead) {
      injectCustomHead(metadata.customHead)
    }
  }

  const createMetaTag = (property: string, content: string) => {
    const meta = document.createElement('meta')

    if (property.startsWith('og:') || property.startsWith('twitter:')) {
      meta.setAttribute('property', property)
    } else {
      meta.setAttribute('name', property)
    }

    meta.setAttribute('content', content)
    meta.setAttribute('data-dynamic', 'true')
    document.head.appendChild(meta)
  }

  const createLinkTag = (rel: string, href: string) => {
    const link = document.createElement('link')
    link.setAttribute('rel', rel)
    link.setAttribute('href', href)
    link.setAttribute('data-dynamic', 'true')
    document.head.appendChild(link)
  }

  const updateOrCreateTag = (tagName: string, attribute: string | null, content: string) => {
    let tag = document.querySelector(tagName)

    if (!tag) {
      tag = document.createElement(tagName)
      document.head.appendChild(tag)
    }

    tag.textContent = content
  }

  const createSchemaScript = (schema: object) => {
    const script = document.createElement('script')
    script.setAttribute('type', 'application/ld+json')
    script.setAttribute('data-dynamic', 'true')
    script.textContent = JSON.stringify(schema)
    document.head.appendChild(script)
  }

  const injectCustomHead = (customHead: string) => {
    const parser = new DOMParser()
    const doc = parser.parseFromString(customHead, 'text/html')
    const elements = doc.head.children

    for (let i = 0; i < elements.length; i++) {
      const element = elements[i]
      const clonedElement = element.cloneNode(true) as Element
      clonedElement.setAttribute('data-dynamic', 'true')
      document.head.appendChild(clonedElement)
    }
  }

  // 이 컴포넌트는 side effect만 수행하므로 렌더링하지 않음
  return null
}

// 서버 사이드 렌더링용 메타데이터 헬퍼 함수
export async function generateMetadata(
  pageKey: string,
  templateKey?: string,
  variables?: Record<string, any>
): Promise<any> {
  try {
    const params = new URLSearchParams()
    params.append('pageKey', pageKey)

    if (templateKey) {
      params.append('templateKey', templateKey)
    }

    if (variables && Object.keys(variables).length > 0) {
      params.append('variables', JSON.stringify(variables))
    }

    // 서버에서 메타데이터 API 호출
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const response = await fetch(`${baseUrl}/api/seo/metadata?${params.toString()}`)

    if (response.ok) {
      const data = await response.json()
      const metadata: SeoMetadata = data.metadata

      // Next.js metadata 객체 형태로 변환
      return {
        title: metadata.title,
        description: metadata.description,
        keywords: metadata.keywords,
        robots: metadata.robots,
        canonical: metadata.canonical,
        openGraph: {
          title: metadata.openGraph.title,
          description: metadata.openGraph.description,
          images: metadata.openGraph.image ? [
            {
              url: metadata.openGraph.image,
              alt: metadata.openGraph.imageAlt
            }
          ] : undefined,
          type: metadata.openGraph.type,
          url: metadata.openGraph.url,
          siteName: metadata.openGraph.siteName
        },
        twitter: {
          card: metadata.twitter.card,
          title: metadata.twitter.title,
          description: metadata.twitter.description,
          images: metadata.twitter.image ? [metadata.twitter.image] : undefined,
          site: metadata.twitter.site,
          creator: metadata.twitter.creator
        },
        other: metadata.schema ? {
          'application/ld+json': JSON.stringify(metadata.schema)
        } : undefined
      }
    }
  } catch (error) {
    console.error('SEO 메타데이터 생성 실패:', error)
  }

  return {}
}

// Hook for client-side metadata management
export function useSeoMetadata(
  pageKey: string,
  templateKey?: string,
  variables?: Record<string, any>
) {
  useEffect(() => {
    const loadAndApplyMetadata = async () => {
      try {
        const params = new URLSearchParams()
        params.append('pageKey', pageKey)

        if (templateKey) {
          params.append('templateKey', templateKey)
        }

        if (variables && Object.keys(variables).length > 0) {
          params.append('variables', JSON.stringify(variables))
        }

        const response = await fetch(`/api/seo/metadata?${params.toString()}`)

        if (response.ok) {
          const data = await response.json()

          // 페이지 제목 업데이트
          if (data.metadata.title) {
            document.title = data.metadata.title
          }
        }
      } catch (error) {
        console.error('SEO 메타데이터 로드 실패:', error)
      }
    }

    loadAndApplyMetadata()
  }, [pageKey, templateKey, JSON.stringify(variables)])
}