import { Suspense } from 'react'
import { getMembers, getBlacklistMembers, getVIPMembers } from '@/lib/actions/members'
import MembersTable from './MembersTable'

interface Props {
  searchParams: {
    page?: string
    search?: string
    grade?: string
    status?: string
    sortBy?: string
    sortOrder?: string
  }
}

export default async function MembersPage({ searchParams }: Props) {
  const page = parseInt(searchParams.page || '1')

  const { members, pagination } = await getMembers({
    page,
    limit: 20,
    search: searchParams.search,
    grade: searchParams.grade,
    status: searchParams.status,
    sortBy: searchParams.sortBy as any,
    sortOrder: searchParams.sortOrder as any,
  })

  // 등급/상태별 통계
  const [blacklistData, vipData] = await Promise.all([
    getBlacklistMembers(),
    getVIPMembers(),
  ])

  const stats = {
    total: pagination.total,
    staff: vipData.grouped.STAFF.length,
    vvip: vipData.grouped.VVIP.length,
    vip: vipData.grouped.VIP.length,
    watch: blacklistData.watchCount,
    warning: blacklistData.warningCount,
    blocked: blacklistData.blockedCount,
  }

  return (
    <Suspense fallback={<div className="p-8 text-center">로딩 중...</div>}>
      <MembersTable
        members={members}
        pagination={pagination}
        stats={stats}
        searchParams={searchParams}
      />
    </Suspense>
  )
}
