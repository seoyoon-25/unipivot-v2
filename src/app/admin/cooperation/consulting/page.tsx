import { prisma } from '@/lib/db'
import ConsultingTable from './ConsultingTable'

interface Props {
  searchParams: { page?: string; status?: string; search?: string }
}

async function getConsultingRequests(params: {
  page: number
  limit: number
  status?: string
  search?: string
}) {
  const { page, limit, status, search } = params

  const where: any = {}
  if (status) where.status = status
  if (search) {
    where.OR = [
      { organization: { contains: search, mode: 'insensitive' } },
      { contactName: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } },
    ]
  }

  const [requests, total] = await Promise.all([
    prisma.consultingRequest.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.consultingRequest.count({ where }),
  ])

  return {
    requests,
    total,
    pages: Math.ceil(total / limit),
  }
}

export default async function ConsultingRequestsPage({ searchParams }: Props) {
  const page = parseInt(searchParams.page || '1')
  const { requests, total, pages } = await getConsultingRequests({
    page,
    limit: 10,
    status: searchParams.status,
    search: searchParams.search,
  })

  return (
    <ConsultingTable
      requests={requests}
      total={total}
      pages={pages}
      currentPage={page}
      searchParams={searchParams}
    />
  )
}
