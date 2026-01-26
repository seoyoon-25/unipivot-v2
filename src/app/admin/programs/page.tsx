import { getPrograms, getProgramStats } from '@/lib/actions/admin'
import ProgramsGrid from './ProgramsGrid'

interface Props {
  searchParams: {
    page?: string
    search?: string
    type?: string
    status?: string
    sortBy?: string
  }
}

export default async function ProgramsPage({ searchParams }: Props) {
  const page = parseInt(searchParams.page || '1')
  const sortBy = (searchParams.sortBy as 'newest' | 'oldest' | 'name' | 'startDate' | 'participants') || 'newest'

  const [{ programs, total, pages }, { stats, total: statsTotal }] = await Promise.all([
    getPrograms({
      page,
      limit: 12,
      search: searchParams.search,
      type: searchParams.type,
      status: searchParams.status,
      sortBy
    }),
    getProgramStats()
  ])

  return (
    <ProgramsGrid
      programs={programs}
      total={total}
      pages={pages}
      currentPage={page}
      searchParams={searchParams}
      stats={stats}
      statsTotal={statsTotal}
    />
  )
}
