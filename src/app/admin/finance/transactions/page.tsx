import { getTransactions } from '@/lib/actions/admin'
import TransactionsTable from './TransactionsTable'

interface Props {
  searchParams: { page?: string; type?: string }
}

export default async function TransactionsPage({ searchParams }: Props) {
  const page = parseInt(searchParams.page || '1')
  const { transactions, total, pages, summary } = await getTransactions({
    page,
    limit: 10,
    type: searchParams.type
  })

  return (
    <TransactionsTable
      transactions={transactions}
      total={total}
      pages={pages}
      currentPage={page}
      summary={summary}
      searchParams={searchParams}
    />
  )
}
