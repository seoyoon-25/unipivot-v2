import { redirect } from 'next/navigation'
import { Search } from 'lucide-react'
import { getCurrentUser } from '@/lib/auth/check-role'
import { searchAll } from '@/lib/club/search-queries'
import SearchResults from '@/components/club/search/SearchResults'

export const metadata = {
  title: '검색 | 유니클럽',
}

interface PageProps {
  searchParams: Promise<{ q?: string }>
}

export default async function SearchPage({ searchParams }: PageProps) {
  const user = await getCurrentUser()
  if (!user) redirect('/api/auth/signin')

  const { q } = await searchParams
  const query = q?.trim() || ''

  const results = query ? await searchAll(query) : null

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <div className="flex items-center gap-2 mb-6">
        <Search className="w-5 h-5 text-gray-400" />
        <h1 className="text-xl font-bold text-gray-900">
          {query ? (
            <>
              &ldquo;{query}&rdquo; 검색 결과
              {results && (
                <span className="text-sm font-normal text-gray-500 ml-2">
                  {results.totalCount}건
                </span>
              )}
            </>
          ) : (
            '검색'
          )}
        </h1>
      </div>

      {/* Search form for mobile or when no query */}
      <form action="/club/search" method="get" className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            name="q"
            defaultValue={query}
            placeholder="프로그램, 공지, 독후감, 명문장 검색..."
            className="w-full pl-9 pr-4 py-2.5 text-sm rounded-lg border border-gray-200 bg-white focus:border-blue-300 focus:ring-1 focus:ring-blue-300"
            autoFocus={!query}
          />
        </div>
      </form>

      {results && (
        <SearchResults
          query={query}
          programs={results.programs.map((r) => ({ ...r, createdAt: r.createdAt.toISOString() }))}
          notices={results.notices.map((r) => ({ ...r, createdAt: r.createdAt.toISOString() }))}
          reports={results.reports.map((r) => ({ ...r, createdAt: r.createdAt.toISOString() }))}
          quotes={results.quotes.map((r) => ({ ...r, createdAt: r.createdAt.toISOString() }))}
          totalCount={results.totalCount}
        />
      )}

      {!query && (
        <div className="bg-white rounded-lg p-12 text-center text-gray-500">
          <Search className="w-8 h-8 mx-auto mb-3 text-gray-300" />
          <p className="text-sm">검색어를 입력하세요</p>
          <p className="text-xs mt-1 text-gray-400">
            프로그램, 공지사항, 독후감, 명문장을 검색할 수 있습니다
          </p>
        </div>
      )}
    </div>
  )
}
