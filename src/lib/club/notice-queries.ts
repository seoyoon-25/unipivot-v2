import prisma from '@/lib/db'

export async function getClubNotices(options?: {
  page?: number
  limit?: number
  includeUnpublished?: boolean
}) {
  const page = options?.page || 1
  const limit = options?.limit || 20
  const where = options?.includeUnpublished ? {} : { isPublished: true }

  const [notices, total] = await Promise.all([
    prisma.clubNotice.findMany({
      where,
      include: {
        author: {
          select: { id: true, name: true, image: true },
        },
      },
      orderBy: [{ isPinned: 'desc' }, { createdAt: 'desc' }],
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.clubNotice.count({ where }),
  ])

  return {
    notices,
    total,
    pages: Math.ceil(total / limit),
  }
}

export async function getClubNoticeById(id: string) {
  const notice = await prisma.clubNotice.findUnique({
    where: { id },
    include: {
      author: {
        select: { id: true, name: true, image: true },
      },
    },
  })

  if (notice) {
    // Increment views
    await prisma.clubNotice.update({
      where: { id },
      data: { views: { increment: 1 } },
    })
  }

  return notice
}
