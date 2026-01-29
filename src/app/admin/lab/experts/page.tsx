import { prisma } from '@/lib/db'
import ExpertsTable from './ExpertsTable'

interface Props {
  searchParams: Promise<{ page?: string; status?: string; search?: string }>
}

async function getExperts(params: {
  page: number
  limit: number
  status?: string
  search?: string
}) {
  const { page, limit, status, search } = params

  const where: any = {}

  if (status === 'verified') {
    where.isVerified = true
  } else if (status === 'pending') {
    where.isVerified = false
  }

  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' as const } },
      { email: { contains: search, mode: 'insensitive' as const } },
      { organization: { contains: search, mode: 'insensitive' as const } },
      { specialties: { contains: search, mode: 'insensitive' as const } },
    ]
  }

  const [experts, total] = await Promise.all([
    prisma.expertProfile.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.expertProfile.count({ where }),
  ])

  return {
    experts,
    total,
    pages: Math.ceil(total / limit),
  }
}

export default async function ExpertsAdminPage({ searchParams }: Props) {
  const params = await searchParams
  const page = parseInt(params.page || '1')
  const { experts, total, pages } = await getExperts({
    page,
    limit: 10,
    status: params.status,
    search: params.search,
  })

  return (
    <ExpertsTable
      experts={experts}
      total={total}
      pages={pages}
      currentPage={page}
      searchParams={params}
    />
  )
}
