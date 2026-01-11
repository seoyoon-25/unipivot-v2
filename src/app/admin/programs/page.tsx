import { getPrograms } from '@/lib/actions/admin'
import ProgramsGrid from './ProgramsGrid'

interface Props {
  searchParams: { page?: string; search?: string; type?: string; status?: string }
}

export default async function ProgramsPage({ searchParams }: Props) {
  const page = parseInt(searchParams.page || '1')
  const { programs, total, pages } = await getPrograms({
    page,
    limit: 10,
    search: searchParams.search,
    type: searchParams.type,
    status: searchParams.status
  })

  return (
    <ProgramsGrid
      programs={programs}
      total={total}
      pages={pages}
      currentPage={page}
      searchParams={searchParams}
    />
  )
}
