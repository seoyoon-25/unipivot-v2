import { prisma } from '@/lib/db'
import ParticipationsTable from './ParticipationsTable'

interface Props {
  searchParams: Promise<{ page?: string; status?: string; rewardStatus?: string; search?: string; surveyId?: string }>
}

async function getParticipations(params: {
  page: number
  limit: number
  status?: string
  rewardStatus?: string
  search?: string
  surveyId?: string
}) {
  const { page, limit, status, rewardStatus, search, surveyId } = params

  const where: any = {}

  if (status) {
    where.status = status
  }

  if (rewardStatus) {
    where.rewardStatus = rewardStatus
  }

  if (surveyId) {
    where.surveyId = surveyId
  }

  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } },
      { phone: { contains: search, mode: 'insensitive' } },
    ]
  }

  const [participations, total] = await Promise.all([
    prisma.researchParticipation.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
      include: {
        survey: {
          select: {
            id: true,
            title: true,
            type: true,
            rewardAmount: true,
          },
        },
        expert: {
          select: {
            id: true,
            name: true,
            email: true,
            originCategory: true,
          },
        },
      },
    }),
    prisma.researchParticipation.count({ where }),
  ])

  // Get list of surveys for filter dropdown
  const surveys = await prisma.labSurvey.findMany({
    select: {
      id: true,
      title: true,
    },
    orderBy: { createdAt: 'desc' },
  })

  return {
    participations,
    surveys,
    total,
    pages: Math.ceil(total / limit),
  }
}

export default async function ParticipationsAdminPage({ searchParams }: Props) {
  const params = await searchParams
  const page = parseInt(params.page || '1')
  const { participations, surveys, total, pages } = await getParticipations({
    page,
    limit: 10,
    status: params.status,
    rewardStatus: params.rewardStatus,
    search: params.search,
    surveyId: params.surveyId,
  })

  return (
    <ParticipationsTable
      participations={participations}
      surveys={surveys}
      total={total}
      pages={pages}
      currentPage={page}
      searchParams={params}
    />
  )
}
