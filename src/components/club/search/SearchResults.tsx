'use client'

import { useState } from 'react'
import Link from 'next/link'
import { BookOpen, Megaphone, FileText, Quote } from 'lucide-react'

interface SearchResult {
  type: 'program' | 'notice' | 'report' | 'quote'
  id: string
  title: string
  content: string | null
  link: string
  createdAt: string
  meta?: Record<string, string>
}

interface Props {
  query: string
  programs: SearchResult[]
  notices: SearchResult[]
  reports: SearchResult[]
  quotes: SearchResult[]
  totalCount: number
}

type TabType = 'all' | 'program' | 'notice' | 'report' | 'quote'

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function highlightText(text: string, query: string) {
  if (!query.trim() || !text) return text
  const escaped = escapeRegex(query.trim())
  const regex = new RegExp(`(${escaped})`, 'gi')
  const parts = text.split(regex)

  return parts.map((part, i) =>
    regex.test(part) ? (
      <mark key={i} className="bg-yellow-200 rounded px-0.5">
        {part}
      </mark>
    ) : (
      part
    )
  )
}

const typeConfig = {
  program: { label: '프로그램', icon: BookOpen, color: 'text-blue-600 bg-blue-50' },
  notice: { label: '공지사항', icon: Megaphone, color: 'text-green-600 bg-green-50' },
  report: { label: '독후감', icon: FileText, color: 'text-purple-600 bg-purple-50' },
  quote: { label: '명문장', icon: Quote, color: 'text-orange-600 bg-orange-50' },
}

export default function SearchResults({
  query,
  programs,
  notices,
  reports,
  quotes,
  totalCount,
}: Props) {
  const [tab, setTab] = useState<TabType>('all')

  const tabs: { key: TabType; label: string; count: number }[] = [
    { key: 'all', label: '전체', count: totalCount },
    { key: 'program', label: '프로그램', count: programs.length },
    { key: 'notice', label: '공지사항', count: notices.length },
    { key: 'report', label: '독후감', count: reports.length },
    { key: 'quote', label: '명문장', count: quotes.length },
  ]

  const getVisibleResults = (): SearchResult[] => {
    switch (tab) {
      case 'program':
        return programs
      case 'notice':
        return notices
      case 'report':
        return reports
      case 'quote':
        return quotes
      default:
        return [...programs, ...notices, ...reports, ...quotes].sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )
    }
  }

  const results = getVisibleResults()

  return (
    <div>
      {/* Tabs */}
      <div className="flex gap-1 mb-6 overflow-x-auto pb-1">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-3 py-1.5 text-sm rounded-lg whitespace-nowrap ${
              tab === t.key
                ? 'bg-gray-900 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {t.label}
            <span className="ml-1 text-xs opacity-70">{t.count}</span>
          </button>
        ))}
      </div>

      {/* Results */}
      {results.length === 0 ? (
        <div className="bg-white rounded-lg p-12 text-center text-gray-500">
          <p className="text-sm">
            &ldquo;{query}&rdquo;에 대한 검색 결과가 없습니다.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {results.map((result) => {
            const config = typeConfig[result.type]
            const Icon = config.icon
            return (
              <Link
                key={`${result.type}-${result.id}`}
                href={result.link}
                className="block bg-white rounded-lg border border-gray-100 p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start gap-3">
                  <span
                    className={`inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded ${config.color} shrink-0 mt-0.5`}
                  >
                    <Icon className="w-3 h-3" />
                    {config.label}
                  </span>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-medium text-gray-900 truncate">
                      {highlightText(result.title, query)}
                    </h3>
                    {result.content && (
                      <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                        {highlightText(result.content, query)}
                      </p>
                    )}
                    <div className="flex items-center gap-2 mt-1.5 text-[11px] text-gray-400">
                      <span>{new Date(result.createdAt).toLocaleDateString('ko-KR')}</span>
                      {result.meta?.bookTitle && <span>{result.meta.bookTitle}</span>}
                      {result.meta?.author && <span>{result.meta.author}</span>}
                    </div>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
