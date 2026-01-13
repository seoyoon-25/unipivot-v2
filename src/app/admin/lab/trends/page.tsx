import { prisma } from '@/lib/db'
import TrendsTable from './TrendsTable'

interface Props {
  searchParams: Promise<{ page?: string; source?: string; search?: string }>
}

async function getTrends(params: {
  page: number
  limit: number
  source?: string
  search?: string
}) {
  const { page, limit, source, search } = params

  const where: any = {}
  if (source) where.source = source
  if (search) {
    where.OR = [
      { title: { contains: search, mode: 'insensitive' } },
      { authors: { contains: search, mode: 'insensitive' } },
      { keywords: { contains: search, mode: 'insensitive' } },
    ]
  }

  const [trends, total] = await Promise.all([
    prisma.researchTrend.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.researchTrend.count({ where }),
  ])

  return {
    trends,
    total,
    pages: Math.ceil(total / limit),
  }
}

export default async function TrendsAdminPage({ searchParams }: Props) {
  const params = await searchParams
  const page = parseInt(params.page || '1')
  const { trends, total, pages } = await getTrends({
    page,
    limit: 10,
    source: params.source,
    search: params.search,
  })

  return (
    <TrendsTable
      trends={trends}
      total={total}
      pages={pages}
      currentPage={page}
      searchParams={params}
    />
  )
}
