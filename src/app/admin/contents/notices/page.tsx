import { getNotices } from '@/lib/actions/admin'
import NoticesTable from './NoticesTable'

interface Props {
  searchParams: { page?: string; search?: string }
}

export default async function NoticesPage({ searchParams }: Props) {
  const page = parseInt(searchParams.page || '1')
  const { notices, total, pages } = await getNotices({
    page,
    limit: 10,
    search: searchParams.search
  })

  return (
    <NoticesTable
      notices={notices}
      total={total}
      pages={pages}
      currentPage={page}
      searchParams={searchParams}
    />
  )
}
