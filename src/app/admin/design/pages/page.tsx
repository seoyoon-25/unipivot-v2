import prisma from '@/lib/db'
import PageTree from './PageTree'
import { MainPagesSection } from './MainPagesSection'
import { getAllPages } from '@/lib/actions/pages'

export default async function AdminDesignPagesPage() {
  // Fetch pages for publish status
  const pages = await getAllPages()

  // Fetch hierarchical page structure (CMS pages)
  const cmsPages = await prisma.pageContent.findMany({
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

  // Fetch site sections for pages
  const sections = await prisma.siteSection.findMany({
    where: {
      sectionKey: {
        startsWith: 'page.'
      }
    },
    orderBy: { order: 'asc' }
  })

  return (
    <div className="space-y-8">
      {/* Main Pages Section */}
      <MainPagesSection sections={sections} pages={pages} />

      {/* CMS Pages Section */}
      <div>
        <div className="mb-4">
          <h2 className="text-xl font-bold text-gray-900">CMS 페이지</h2>
          <p className="text-gray-600 text-sm">
            /p/[slug] 경로로 접근하는 커스텀 페이지입니다.
          </p>
        </div>
        <PageTree pages={cmsPages} />
      </div>
    </div>
  )
}
