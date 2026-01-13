import { prisma } from '@/lib/db'
import PartnersTable from './PartnersTable'

interface Props {
  searchParams: Promise<{ page?: string; type?: string; search?: string }>
}

async function getPartners(params: {
  page: number
  limit: number
  type?: string
  search?: string
}) {
  const { page, limit, type, search } = params

  const where: any = {}

  if (type) {
    where.type = type
  }

  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { contact: { contains: search, mode: 'insensitive' } },
    ]
  }

  const [partners, total] = await Promise.all([
    prisma.partner.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
      include: {
        _count: {
          select: { projects: true },
        },
      },
    }),
    prisma.partner.count({ where }),
  ])

  return {
    partners,
    total,
    pages: Math.ceil(total / limit),
  }
}

export default async function AdminBusinessPartnersPage({ searchParams }: Props) {
  const params = await searchParams
  const page = parseInt(params.page || '1')
  const { partners, total, pages } = await getPartners({
    page,
    limit: 10,
    type: params.type,
    search: params.search,
  })

  return (
    <PartnersTable
      partners={partners}
      total={total}
      pages={pages}
      currentPage={page}
      searchParams={params}
    />
  )
}
