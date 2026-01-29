import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getPublicQuotes, getMyQuotes } from '@/lib/club/quote-queries'
import QuotesPageClient from './QuotesPageClient'

export const metadata = {
  title: '명문장 | 유니클럽',
}

export default async function QuotesPage() {
  const session = await getServerSession(authOptions)

  const [publicQuotes, myQuotes] = await Promise.all([
    getPublicQuotes(),
    session?.user ? getMyQuotes() : Promise.resolve([]),
  ])

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">명문장</h1>
        <p className="text-sm text-gray-500 mt-1">
          책에서 발견한 아름다운 문장을 모아보세요
        </p>
      </div>

      <QuotesPageClient
        publicQuotes={JSON.parse(JSON.stringify(publicQuotes))}
        myQuotes={JSON.parse(JSON.stringify(myQuotes))}
        isLoggedIn={!!session?.user}
      />
    </div>
  )
}
