import { prisma } from '@/lib/db'
import BannerTable from './BannerTable'

interface Props {
  searchParams: Promise<{ page?: string; position?: string; status?: string }>
}

async function getBanners(params: {
  page: number
  limit: number
  position?: string
  status?: string
}) {
  const { page, limit, position, status } = params

  const where: any = {}

  if (position) {
    where.position = position
  }

  if (status === 'active') {
    where.isActive = true
  } else if (status === 'inactive') {
    where.isActive = false
  }

  const [banners, total] = await Promise.all([
    prisma.banner.findMany({
      where,
      orderBy: [{ order: 'asc' }, { createdAt: 'desc' }],
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.banner.count({ where }),
  ])

  return {
    banners,
    total,
    pages: Math.ceil(total / limit),
  }
}

export default async function AdminDesignBannersPage({ searchParams }: Props) {
  const params = await searchParams
  const page = parseInt(params.page || '1')
  const { banners, total, pages } = await getBanners({
    page,
    limit: 10,
    position: params.position,
    status: params.status,
  })

  return (
    <BannerTable
      banners={banners}
      total={total}
      pages={pages}
      currentPage={page}
      searchParams={params}
    />
  )
}
