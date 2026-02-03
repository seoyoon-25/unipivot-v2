import Script from 'next/script'

// Escape </script> sequences to prevent XSS in JSON-LD blocks
function safeJsonLdStringify(data: unknown): string {
  return JSON.stringify(data).replace(/<\/script>/gi, '<\\/script>')
}

// 조직 정보 스키마
export function OrganizationJsonLd() {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: '유니피벗',
    alternateName: 'UniPivot',
    url: 'https://bestcome.org',
    logo: 'https://bestcome.org/logo.png',
    description: '남북청년이 함께 새로운 한반도를 만들어갑니다. UniPivot은 남북청년 교류와 통일 관련 프로그램을 운영하는 비영리 단체입니다.',
    foundingDate: '2020',
    sameAs: [
      'https://www.instagram.com/unipivot',
      'https://www.facebook.com/unipivot',
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer service',
      email: 'contact@bestcome.org',
      availableLanguage: ['Korean', 'English'],
    },
  }

  return (
    <Script
      id="organization-jsonld"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: safeJsonLdStringify(data) }}
    />
  )
}

// 프로그램 (이벤트) 스키마
interface ProgramJsonLdProps {
  program: {
    title: string
    slug: string
    description?: string | null
    image?: string | null
    startDate?: string | null
    endDate?: string | null
    location?: string | null
    isOnline?: boolean
    fee?: number
    capacity?: number
    status?: string
  }
}

export function ProgramJsonLd({ program }: ProgramJsonLdProps) {
  // Schema.org에 EventCompleted가 없으므로 COMPLETED도 EventScheduled 유지
  const eventStatus = 'EventScheduled'

  const attendanceMode = program.isOnline
    ? 'OnlineEventAttendanceMode'
    : 'OfflineEventAttendanceMode'

  const data: any = {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: program.title,
    description: program.description?.replace(/<[^>]*>/g, '').slice(0, 200) || '',
    url: `https://bestcome.org/programs/${program.slug}`,
    eventStatus: `https://schema.org/${eventStatus}`,
    eventAttendanceMode: `https://schema.org/${attendanceMode}`,
    organizer: {
      '@type': 'Organization',
      name: '유니피벗',
      url: 'https://bestcome.org',
    },
  }

  if (program.image) {
    data.image = program.image.startsWith('http')
      ? program.image
      : `https://bestcome.org${program.image}`
  }

  if (program.startDate) {
    data.startDate = program.startDate
  }

  if (program.endDate) {
    data.endDate = program.endDate
  }

  if (program.location) {
    if (program.isOnline) {
      data.location = {
        '@type': 'VirtualLocation',
        url: 'https://bestcome.org',
      }
    } else {
      data.location = {
        '@type': 'Place',
        name: program.location,
        address: {
          '@type': 'PostalAddress',
          addressCountry: 'KR',
        },
      }
    }
  }

  if (program.fee !== undefined) {
    data.offers = {
      '@type': 'Offer',
      price: program.fee,
      priceCurrency: 'KRW',
      availability: program.status === 'RECRUITING'
        ? 'https://schema.org/InStock'
        : 'https://schema.org/SoldOut',
      url: `https://bestcome.org/programs/${program.slug}`,
    }
  }

  if (program.capacity) {
    data.maximumAttendeeCapacity = program.capacity
  }

  return (
    <Script
      id={`program-jsonld-${program.slug}`}
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: safeJsonLdStringify(data) }}
    />
  )
}

// 블로그 포스트 스키마
interface BlogPostJsonLdProps {
  post: {
    title: string
    slug: string
    excerpt?: string | null
    content: string
    image?: string | null
    createdAt: string
    updatedAt: string
    author?: {
      name?: string | null
    }
  }
}

export function BlogPostJsonLd({ post }: BlogPostJsonLdProps) {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.excerpt || post.content.replace(/<[^>]*>/g, '').slice(0, 200),
    url: `https://bestcome.org/blog/${post.slug}`,
    datePublished: post.createdAt,
    dateModified: post.updatedAt,
    author: {
      '@type': 'Person',
      name: post.author?.name || '유니피벗',
    },
    publisher: {
      '@type': 'Organization',
      name: '유니피벗',
      logo: {
        '@type': 'ImageObject',
        url: 'https://bestcome.org/logo.png',
      },
    },
    ...(post.image && {
      image: post.image.startsWith('http')
        ? post.image
        : `https://bestcome.org${post.image}`,
    }),
  }

  return (
    <Script
      id={`blogpost-jsonld-${post.slug}`}
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: safeJsonLdStringify(data) }}
    />
  )
}

// FAQ 스키마
interface FAQJsonLdProps {
  items: Array<{
    question: string
    answer: string
  }>
}

export function FAQJsonLd({ items }: FAQJsonLdProps) {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  }

  return (
    <Script
      id="faq-jsonld"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: safeJsonLdStringify(data) }}
    />
  )
}

// 독후감(리뷰) 스키마
interface BookReviewJsonLdProps {
  review: {
    id: string
    bookTitle: string
    bookAuthor?: string | null
    content: string
    rating?: number | null
    createdAt: string
    authorName?: string | null
  }
}

export function BookReviewJsonLd({ review }: BookReviewJsonLdProps) {
  const data: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Review',
    itemReviewed: {
      '@type': 'Book',
      name: review.bookTitle,
      ...(review.bookAuthor && {
        author: {
          '@type': 'Person',
          name: review.bookAuthor,
        },
      }),
    },
    reviewBody: review.content.replace(/<[^>]*>/g, '').slice(0, 500),
    author: {
      '@type': 'Person',
      name: review.authorName || '유니클럽 회원',
    },
    datePublished: review.createdAt,
    publisher: {
      '@type': 'Organization',
      name: '유니피벗',
    },
    url: `https://bestcome.org/club/bookclub/reviews/${review.id}`,
  }

  if (review.rating) {
    data.reviewRating = {
      '@type': 'Rating',
      ratingValue: review.rating,
      bestRating: 5,
      worstRating: 1,
    }
  }

  return (
    <Script
      id={`review-jsonld-${review.id}`}
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: safeJsonLdStringify(data) }}
    />
  )
}

// BreadcrumbList 스키마
interface BreadcrumbJsonLdProps {
  items: Array<{
    name: string
    url: string
  }>
}

export function BreadcrumbJsonLd({ items }: BreadcrumbJsonLdProps) {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url.startsWith('http') ? item.url : `https://bestcome.org${item.url}`,
    })),
  }

  return (
    <Script
      id="breadcrumb-jsonld"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: safeJsonLdStringify(data) }}
    />
  )
}
