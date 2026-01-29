import { prisma } from '@/lib/db'
import BlogTable from './BlogTable'

interface Props {
  searchParams: Promise<{ page?: string; category?: string; status?: string; search?: string }>
}

async function getBlogPosts(params: {
  page: number
  limit: number
  category?: string
  status?: string
  search?: string
}) {
  const { page, limit, category, status, search } = params

  const where: any = {}

  if (category) {
    where.category = category
  }

  if (status === 'published') {
    where.isPublished = true
  } else if (status === 'draft') {
    where.isPublished = false
  }

  if (search) {
    where.OR = [
      { title: { contains: search, mode: 'insensitive' as const } },
      { content: { contains: search, mode: 'insensitive' as const } },
    ]
  }

  const [posts, total] = await Promise.all([
    prisma.blogPost.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    }),
    prisma.blogPost.count({ where }),
  ])

  // Get unique categories for filter dropdown
  const categories = await prisma.blogPost.findMany({
    select: { category: true },
    distinct: ['category'],
    where: { category: { not: null } },
  })

  return {
    posts,
    categories: categories.map(c => c.category).filter(Boolean) as string[],
    total,
    pages: Math.ceil(total / limit),
  }
}

export default async function AdminContentsBlogPage({ searchParams }: Props) {
  const params = await searchParams
  const page = parseInt(params.page || '1')
  const { posts, categories, total, pages } = await getBlogPosts({
    page,
    limit: 10,
    category: params.category,
    status: params.status,
    search: params.search,
  })

  return (
    <BlogTable
      posts={posts}
      categories={categories}
      total={total}
      pages={pages}
      currentPage={page}
      searchParams={params}
    />
  )
}
