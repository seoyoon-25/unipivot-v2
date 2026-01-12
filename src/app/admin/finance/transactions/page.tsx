import { getTransactions, getFinanceAccounts, getFunds } from '@/lib/actions/admin'
import TransactionsTable from './TransactionsTable'

interface Props {
  searchParams: Promise<{ page?: string; type?: string }>
}

export default async function TransactionsPage({ searchParams }: Props) {
  const params = await searchParams
  const page = parseInt(params.page || '1')

  const [{ transactions, total, pages, summary }, accounts, funds] = await Promise.all([
    getTransactions({
      page,
      limit: 15,
      type: params.type
    }),
    getFinanceAccounts({ isActive: true }),
    getFunds({ isActive: true })
  ])

  return (
    <TransactionsTable
      transactions={transactions}
      total={total}
      pages={pages}
      currentPage={page}
      summary={summary}
      searchParams={params}
      accounts={accounts}
      funds={funds}
    />
  )
}
