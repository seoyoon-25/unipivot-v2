import prisma from '@/lib/db'
import PagesTable from './PagesTable'

export default async function AdminDesignPagesPage() {
  const pages = await prisma.pageContent.findMany({
    orderBy: { updatedAt: 'desc' },
  })

  return <PagesTable pages={pages} />
}
