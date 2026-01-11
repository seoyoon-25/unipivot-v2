import prisma from '@/lib/db'
import PageTree from './PageTree'

export default async function AdminDesignPagesPage() {
  // Fetch hierarchical page structure
  const pages = await prisma.pageContent.findMany({
    where: { parentId: null },
    orderBy: { order: 'asc' },
    include: {
      children: {
        orderBy: { order: 'asc' },
        include: {
          children: {
            orderBy: { order: 'asc' },
            include: {
              children: {
                orderBy: { order: 'asc' },
              },
            },
          },
        },
      },
    },
  })

  return <PageTree pages={pages} />
}
