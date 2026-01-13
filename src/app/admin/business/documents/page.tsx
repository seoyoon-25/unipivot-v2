import { prisma } from '@/lib/db'
import DocumentsTable from './DocumentsTable'

interface Props {
  searchParams: Promise<{ page?: string; type?: string; projectId?: string; search?: string }>
}

async function getDocuments(params: {
  page: number
  limit: number
  type?: string
  projectId?: string
  search?: string
}) {
  const { page, limit, type, projectId, search } = params

  const where: any = {}

  if (type) {
    where.type = type
  }

  if (projectId) {
    where.projectId = projectId
  }

  if (search) {
    where.title = { contains: search, mode: 'insensitive' }
  }

  const [documents, total] = await Promise.all([
    prisma.document.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
      include: {
        project: {
          select: { id: true, title: true },
        },
      },
    }),
    prisma.document.count({ where }),
  ])

  const projects = await prisma.project.findMany({
    select: { id: true, title: true },
    orderBy: { title: 'asc' },
  })

  return {
    documents,
    projects,
    total,
    pages: Math.ceil(total / limit),
  }
}

export default async function AdminBusinessDocumentsPage({ searchParams }: Props) {
  const params = await searchParams
  const page = parseInt(params.page || '1')
  const { documents, projects, total, pages } = await getDocuments({
    page,
    limit: 10,
    type: params.type,
    projectId: params.projectId,
    search: params.search,
  })

  return (
    <DocumentsTable
      documents={documents}
      projects={projects}
      total={total}
      pages={pages}
      currentPage={page}
      searchParams={params}
    />
  )
}
