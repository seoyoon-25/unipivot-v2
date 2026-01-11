import { getDonations } from '@/lib/actions/admin'
import DonationsTable from './DonationsTable'

interface Props {
  searchParams: { page?: string; status?: string }
}

export default async function DonationsPage({ searchParams }: Props) {
  const page = parseInt(searchParams.page || '1')
  const { donations, total, pages, summary } = await getDonations({
    page,
    limit: 10,
    status: searchParams.status
  })

  return (
    <DonationsTable
      donations={donations}
      total={total}
      pages={pages}
      currentPage={page}
      summary={summary}
      searchParams={searchParams}
    />
  )
}
