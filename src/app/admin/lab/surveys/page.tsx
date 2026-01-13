import { prisma } from '@/lib/db'
import SurveysTable from './SurveysTable'

interface Props {
  searchParams: Promise<{ page?: string; status?: string; type?: string; search?: string }>
}

async function getSurveys(params: {
  page: number
  limit: number
  status?: string
  type?: string
  search?: string
}) {
  const { page, limit, status, type, search } = params

  const where: any = {}

  if (status) {
    where.status = status
  }

  if (type) {
    where.type = type
  }

  if (search) {
    where.OR = [
      { title: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
      { requesterOrg: { contains: search, mode: 'insensitive' } },
    ]
  }

  const [surveys, total] = await Promise.all([
    prisma.labSurvey.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
      include: {
        _count: {
          select: { participations: true },
        },
      },
    }),
    prisma.labSurvey.count({ where }),
  ])

  return {
    surveys,
    total,
    pages: Math.ceil(total / limit),
  }
}

export default async function SurveysAdminPage({ searchParams }: Props) {
  const params = await searchParams
  const page = parseInt(params.page || '1')
  const { surveys, total, pages } = await getSurveys({
    page,
    limit: 10,
    status: params.status,
    type: params.type,
    search: params.search,
  })

  return (
    <SurveysTable
      surveys={surveys}
      total={total}
      pages={pages}
      currentPage={page}
      searchParams={params}
    />
  )
}
