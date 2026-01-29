import { prisma } from '@/lib/db'
import ProjectsTable from './ProjectsTable'

interface Props {
  searchParams: Promise<{ page?: string; status?: string; search?: string }>
}

async function getProjects(params: {
  page: number
  limit: number
  status?: string
  search?: string
}) {
  const { page, limit, status, search } = params

  const where: any = {}

  if (status) {
    where.status = status
  }

  if (search) {
    where.OR = [
      { title: { contains: search, mode: 'insensitive' as const } },
      { description: { contains: search, mode: 'insensitive' as const } },
    ]
  }

  const [projects, total] = await Promise.all([
    prisma.project.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
      include: {
        partners: {
          include: {
            partner: {
              select: { id: true, name: true },
            },
          },
        },
        _count: {
          select: {
            milestones: true,
            documents: true,
            events: true,
          },
        },
      },
    }),
    prisma.project.count({ where }),
  ])

  // Get all partners for the form dropdown
  const allPartners = await prisma.partner.findMany({
    select: { id: true, name: true },
    orderBy: { name: 'asc' },
  })

  return {
    projects,
    partners: allPartners,
    total,
    pages: Math.ceil(total / limit),
  }
}

export default async function AdminBusinessProjectsPage({ searchParams }: Props) {
  const params = await searchParams
  const page = parseInt(params.page || '1')
  const { projects, partners, total, pages } = await getProjects({
    page,
    limit: 10,
    status: params.status,
    search: params.search,
  })

  return (
    <ProjectsTable
      projects={projects}
      partners={partners}
      total={total}
      pages={pages}
      currentPage={page}
      searchParams={params}
    />
  )
}
