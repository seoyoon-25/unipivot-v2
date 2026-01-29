import { Suspense } from 'react'
import ExpertList from './ExpertList'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: '전문가/강사 풀',
  description: '이주배경 전문가와 강사를 검색하고 섭외하세요.',
}

async function getCategories() {
  const categories = await prisma.expertCategory.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: 'asc' },
  })
  return categories
}

async function getExperts(searchParams: { category?: string; search?: string; page?: string; originCategory?: string }) {
  const page = parseInt(searchParams.page || '1')
  const limit = 12
  const skip = (page - 1) * limit

  const where: any = {
    isPublic: true,
    isActive: true,
  }

  if (searchParams.category) {
    where.categories = {
      contains: searchParams.category,
      mode: 'insensitive' as const,
    }
  }

  // 이주배경 필터
  if (searchParams.originCategory) {
    where.AND = where.AND || []
    where.AND.push({
      OR: [
        { originCategory: searchParams.originCategory },
        // 하위 호환: DEFECTOR → NORTH, KOREAN → SOUTH
        ...(searchParams.originCategory === 'DEFECTOR' ? [{ origin: 'NORTH' }] : []),
        ...(searchParams.originCategory === 'KOREAN' ? [{ origin: 'SOUTH' }] : []),
      ]
    })
  }

  if (searchParams.search) {
    where.AND = where.AND || []
    where.AND.push({
      OR: [
        { name: { contains: searchParams.search, mode: 'insensitive' as const } },
        { title: { contains: searchParams.search, mode: 'insensitive' as const } },
        { organization: { contains: searchParams.search, mode: 'insensitive' as const } },
        { specialties: { contains: searchParams.search, mode: 'insensitive' as const } },
        { keywords: { contains: searchParams.search, mode: 'insensitive' as const } },
        { lectureTopics: { contains: searchParams.search, mode: 'insensitive' as const } },
      ]
    })
  }

  const [experts, total] = await Promise.all([
    prisma.expertProfile.findMany({
      where,
      select: {
        id: true,
        name: true,
        photo: true,
        title: true,
        organization: true,
        categories: true,
        specialties: true,
        lectureTopics: true,
        lectureFeeMin: true,
        lectureFeeMax: true,
        lectureCount: true,
        consultingCount: true,
        isVerified: true,
        bio: true,
      },
      orderBy: [
        { isVerified: 'desc' },
        { lectureCount: 'desc' },
        { createdAt: 'desc' },
      ],
      skip,
      take: limit,
    }),
    prisma.expertProfile.count({ where }),
  ])

  return {
    experts,
    pagination: {
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    },
  }
}

interface PageProps {
  searchParams: Promise<{ category?: string; search?: string; page?: string; originCategory?: string }>
}

export default async function ExpertsPage({ searchParams }: PageProps) {
  const params = await searchParams
  const [categories, expertsData] = await Promise.all([
    getCategories(),
    getExperts(params),
  ])

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-white border-b border-gray-100 py-12">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">전문가/강사 풀</h1>
          <p className="text-gray-600 max-w-2xl">
            이주배경 전문가와 강사를 직접 검색하고 섭외하세요.
            통일·북한·다문화 분야의 강연, 자문, 연구 협력이 가능합니다.
          </p>
        </div>
      </section>

      {/* Expert List */}
      <Suspense fallback={<div className="py-20 text-center">로딩 중...</div>}>
        <ExpertList
          categories={categories}
          initialExperts={expertsData.experts}
          initialPagination={expertsData.pagination}
          searchParams={params}
        />
      </Suspense>
    </div>
  )
}
