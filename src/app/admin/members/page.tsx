import { getMembers } from '@/lib/actions/admin'
import MembersTable from './MembersTable'

interface Props {
  searchParams: { page?: string; search?: string; origin?: string; status?: string }
}

export default async function MembersPage({ searchParams }: Props) {
  const page = parseInt(searchParams.page || '1')
  const { members, total, pages } = await getMembers({
    page,
    limit: 10,
    search: searchParams.search,
    origin: searchParams.origin,
    status: searchParams.status
  })

  return (
    <MembersTable
      members={members}
      total={total}
      pages={pages}
      currentPage={page}
      searchParams={searchParams}
    />
  )
}
