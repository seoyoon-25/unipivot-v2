import { prisma } from '@/lib/db'
import LecturerTable from './LecturerTable'

interface Props {
  searchParams: { page?: string; status?: string; search?: string }
}

async function getLecturerRequests(params: {
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
      { topic: { contains: search, mode: 'insensitive' } },
      { organization: { contains: search, mode: 'insensitive' } },
      { contactName: { contains: search, mode: 'insensitive' } },
    ]
  }

  const [requests, total] = await Promise.all([
    prisma.lecturerRequest.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.lecturerRequest.count({ where }),
  ])

  return {
    requests,
    total,
    pages: Math.ceil(total / limit),
  }
}

export default async function LecturerRequestsPage({ searchParams }: Props) {
  const page = parseInt(searchParams.page || '1')
  const { requests, total, pages } = await getLecturerRequests({
    page,
    limit: 10,
    status: searchParams.status,
    search: searchParams.search,
  })

  return (
    <LecturerTable
      requests={requests}
      total={total}
      pages={pages}
      currentPage={page}
      searchParams={searchParams}
    />
  )
}
