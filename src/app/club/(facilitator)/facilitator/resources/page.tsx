import { prisma } from '@/lib/db'
import { FolderOpen } from 'lucide-react'
import ResourceList from '@/components/club/facilitator/ResourceList'

export const metadata = {
  title: '진행자 자료실 | 운영진 도구 | 유니클럽',
}

export default async function FacilitatorResourcesPage() {
  const resources = await prisma.facilitatorResource.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      user: {
        select: { name: true },
      },
    },
  })

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <div className="flex items-center gap-3 mb-1">
        <div className="p-2 bg-amber-50 rounded-lg">
          <FolderOpen className="w-6 h-6 text-amber-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900">진행자 자료실</h1>
      </div>
      <p className="text-sm text-gray-500 mb-6 ml-[52px]">
        스크립트와 가이드
      </p>

      <ResourceList resources={JSON.parse(JSON.stringify(resources))} />
    </div>
  )
}
