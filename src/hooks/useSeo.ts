'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import {
  safeDocumentHead,
  safeCreateElement,
  safeSetTitle,
  safeLocation,
  safeQuerySelectorAll,
  isBrowser
} from '@/lib/utils/safe-dom'

interface SeoData {
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

interface UseSeoOptions {
  pageKey?: string
  templateKey?: string
  variables?: Record<string, any>
  fallbackTitle?: string
  fallbackDescription?: string
  noIndex?: boolean
}

export function useSeo({
  pageKey,
  templateKey,
  variables = {},
  fallbackTitle,
  fallbackDescription,
  noIndex = false
}: UseSeoOptions = {}) {
  const pathname = usePathname()
  const [seoData, setSeoData] = useState<SeoData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // pageKey가 없으면 pathname에서 추출
  const actualPageKey = pageKey || derivePageKeyFromPathname(pathname)

  useEffect(() => {
    const loadSeoData = async () => {
      try {
        setLoading(true)
        setError(null)

        const params = new URLSearchParams()
        params.append('pageKey', actualPageKey)

        if (templateKey) {
          params.append('templateKey', templateKey)
        }

        if (Object.keys(variables).length > 0) {
          params.append('variables', JSON.stringify(variables))
        }

        const response = await fetch(`/api/seo/metadata?${params.toString()}`)

        if (response.ok) {
          const data = await response.json()
          setSeoData(data.metadata)

          // 동적으로 메타 태그 업데이트
          updateDocumentMetadata(data.metadata, {
            fallbackTitle,
            fallbackDescription,
            noIndex,
            pathname
          })
        } else {
          throw new Error(`HTTP ${response.status}`)
        }
      } catch (err) {
        console.error('SEO 데이터 로드 실패:', err)
        setError(err instanceof Error ? err.message : 'Unknown error')

        // 폴백 메타데이터 적용
        if (fallbackTitle || fallbackDescription) {
          applyFallbackMetadata({
            fallbackTitle,
            fallbackDescription,
            noIndex,
            pathname
          })
        }
      } finally {
        setLoading(false)
      }
    }

    loadSeoData()
  }, [actualPageKey, templateKey, JSON.stringify(variables), fallbackTitle, fallbackDescription, noIndex])

  return {
    seoData,
    loading,
    error,
    refresh: () => {
      // SEO 데이터 새로고침
      setLoading(true)
      setSeoData(null)
      setError(null)
    }
  }
}

function derivePageKeyFromPathname(pathname: string): string {
  // pathname에서 pageKey 추출
  if (pathname === '/') return 'home'

  const segments = pathname.split('/').filter(Boolean)

  // 동적 라우트 처리
  if (segments.length === 2 && segments[0] === 'programs') {
    return 'program-detail'
  }

  if (segments.length === 2 && segments[0] === 'events') {
    return 'event-detail'
  }

  if (segments.length === 2 && segments[0] === 'posts') {
    return 'post-detail'
  }

  // 첫 번째 세그먼트를 pageKey로 사용
  return segments[0] || 'home'
}

function updateDocumentMetadata(
  metadata: SeoData,
  options: {
    fallbackTitle?: string
    fallbackDescription?: string
    noIndex?: boolean
    pathname: string
  }
) {
  if (!isBrowser()) return

  // 기존 동적 메타 태그 제거 (안전한 접근)
  const existingTags = safeQuerySelectorAll('[data-seo-dynamic]')
  if (existingTags) {
    existingTags.forEach(tag => tag.remove())
  }

  // 제목 업데이트 (안전한 접근)
  const title = metadata.title || options.fallbackTitle
  if (title) {
    safeSetTitle(title)
    createMetaTag('og:title', metadata.openGraph.title || title)
    createMetaTag('twitter:title', metadata.twitter.title || metadata.openGraph.title || title)
  }

  // 설명 업데이트
  const description = metadata.description || options.fallbackDescription
  if (description) {
    createMetaTag('description', description)
    createMetaTag('og:description', metadata.openGraph.description || description)
    createMetaTag('twitter:description', metadata.twitter.description || metadata.openGraph.description || description)
  }

  // 키워드
  if (metadata.keywords && metadata.keywords.length > 0) {
    createMetaTag('keywords', metadata.keywords.join(', '))
  }

  // 로봇 메타 태그
  const robots = options.noIndex ? 'noindex,nofollow' : (metadata.robots || 'index,follow')
  createMetaTag('robots', robots)

  // Canonical URL
  if (metadata.canonical) {
    createLinkTag('canonical', metadata.canonical)
  } else {
    const canonicalUrl = `${window.location.origin}${options.pathname}`
    createLinkTag('canonical', canonicalUrl)
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

function applyFallbackMetadata(options: {
  fallbackTitle?: string
  fallbackDescription?: string
  noIndex?: boolean
  pathname: string
}) {
  if (options.fallbackTitle) {
    document.title = options.fallbackTitle
    createMetaTag('og:title', options.fallbackTitle)
    createMetaTag('twitter:title', options.fallbackTitle)
  }

  if (options.fallbackDescription) {
    createMetaTag('description', options.fallbackDescription)
    createMetaTag('og:description', options.fallbackDescription)
    createMetaTag('twitter:description', options.fallbackDescription)
  }

  const robots = options.noIndex ? 'noindex,nofollow' : 'index,follow'
  createMetaTag('robots', robots)

  const location = safeLocation()
  if (location) {
    const canonicalUrl = `${location.origin}${options.pathname}`
    createLinkTag('canonical', canonicalUrl)
  }
}

function createMetaTag(property: string, content: string) {
  const meta = safeCreateElement('meta')
  const head = safeDocumentHead()

  if (!meta || !head) return

  if (property.startsWith('og:') || property.startsWith('twitter:')) {
    meta.setAttribute('property', property)
  } else {
    meta.setAttribute('name', property)
  }

  meta.setAttribute('content', content)
  meta.setAttribute('data-seo-dynamic', 'true')
  head.appendChild(meta)
}

function createLinkTag(rel: string, href: string) {
  const link = safeCreateElement('link')
  const head = safeDocumentHead()

  if (!link || !head) return

  link.setAttribute('rel', rel)
  link.setAttribute('href', href)
  link.setAttribute('data-seo-dynamic', 'true')
  head.appendChild(link)
}

function createSchemaScript(schema: object) {
  const script = safeCreateElement('script')
  const head = safeDocumentHead()

  if (!script || !head) return

  script.setAttribute('type', 'application/ld+json')
  script.setAttribute('data-seo-dynamic', 'true')
  script.textContent = JSON.stringify(schema)
  head.appendChild(script)
}

function injectCustomHead(customHead: string) {
  const head = safeDocumentHead()
  if (!head) return

  try {
    const parser = new DOMParser()
    const doc = parser.parseFromString(customHead, 'text/html')
    const elements = doc.head.children

    for (let i = 0; i < elements.length; i++) {
      const element = elements[i]
      const clonedElement = element.cloneNode(true) as Element
      clonedElement.setAttribute('data-seo-dynamic', 'true')
      head.appendChild(clonedElement)
    }
  } catch (error) {
    console.warn('Failed to inject custom head elements:', error)
  }
}

// 서버 사이드에서 사용할 수 있는 유틸리티 함수
export async function getServerSeoData(
  pageKey: string,
  templateKey?: string,
  variables?: Record<string, any>
): Promise<SeoData | null> {
  try {
    const params = new URLSearchParams()
    params.append('pageKey', pageKey)

    if (templateKey) {
      params.append('templateKey', templateKey)
    }

    if (variables && Object.keys(variables).length > 0) {
      params.append('variables', JSON.stringify(variables))
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const response = await fetch(`${baseUrl}/api/seo/metadata?${params.toString()}`)

    if (response.ok) {
      const data = await response.json()
      return data.metadata
    }
  } catch (error) {
    console.error('서버 SEO 데이터 로드 실패:', error)
  }

  return null
}