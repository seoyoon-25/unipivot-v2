import { prisma } from '@/lib/db'
import SurveyTable from './SurveyTable'

interface Props {
  searchParams: { page?: string; status?: string; search?: string }
}

async function getSurveyRequests(params: {
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
      { requesterName: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } },
      { requirements: { contains: search, mode: 'insensitive' } },
    ]
  }

  const [requests, total] = await Promise.all([
    prisma.surveyRequest.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.surveyRequest.count({ where }),
  ])

  return {
    requests,
    total,
    pages: Math.ceil(total / limit),
  }
}

export default async function SurveyRequestsPage({ searchParams }: Props) {
  const page = parseInt(searchParams.page || '1')
  const { requests, total, pages } = await getSurveyRequests({
    page,
    limit: 10,
    status: searchParams.status,
    search: searchParams.search,
  })

  return (
    <SurveyTable
      requests={requests}
      total={total}
      pages={pages}
      currentPage={page}
      searchParams={searchParams}
    />
  )
}
