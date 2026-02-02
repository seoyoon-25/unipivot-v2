import prisma from '@/lib/db'

export async function getCommunityPosts(options: {
  category?: string
  page?: number
  limit?: number
  search?: string
} = {}) {
  const { category, page = 1, limit = 20, search } = options

  const where: Record<string, unknown> = {}
  if (category && category !== 'all') where.category = category
  if (search) {
    where.OR = [
      { title: { contains: search, mode: 'insensitive' } },
      { content: { contains: search, mode: 'insensitive' } },
    ]
  }

  const [posts, total] = await Promise.all([
    prisma.communityPost.findMany({
      where,
      include: {
        author: { select: { id: true, name: true, image: true } },
        _count: { select: { comments: true, likes: true } },
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.communityPost.count({ where }),
  ])

  return {
    posts: posts.map((p) => ({
      ...p,
      commentCount: p._count.comments,
      likeCount: p._count.likes,
    })),
    total,
    totalPages: Math.ceil(total / limit),
  }
}

export async function getCommunityPost(postId: string, userId?: string) {
  const post = await prisma.communityPost.findUnique({
    where: { id: postId },
    include: {
      author: { select: { id: true, name: true, image: true } },
      _count: { select: { comments: true, likes: true } },
    },
  })

  if (!post) return null

  let isLiked = false
  if (userId) {
    const like = await prisma.communityLike.findUnique({
      where: { postId_userId: { postId, userId } },
    })
    isLiked = !!like
  }

  return {
    ...post,
    commentCount: post._count.comments,
    likeCount: post._count.likes,
    isLiked,
  }
}

export async function getComments(postId: string) {
  return prisma.communityComment.findMany({
    where: { postId, parentId: null },
    include: {
      author: { select: { id: true, name: true, image: true } },
      replies: {
        include: {
          author: { select: { id: true, name: true, image: true } },
        },
        orderBy: { createdAt: 'asc' },
      },
    },
    orderBy: { createdAt: 'asc' },
  })
}

export async function incrementViewCount(postId: string) {
  return prisma.communityPost.update({
    where: { id: postId },
    data: { viewCount: { increment: 1 } },
  })
}
