export const dynamic = 'force-dynamic'

import type { Metadata } from 'next'
import Link from 'next/link'
import { Pin, Calendar, Eye, Plus } from 'lucide-react'
import { getPublicNotices } from '@/lib/actions/public'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export const metadata: Metadata = {
  title: '공지사항',
  description: '유니피벗의 소식과 공지사항',
}

interface Props {
  searchParams: { page?: string }
}

// Default header content
const defaultHeader = {
  hero: {
    badge: 'Notice',
    title: '공지사항',
    subtitle: '유니피벗의 소식과 안내사항을 확인하세요',
  },
}

async function getHeaderContent() {
  try {
    const section = await prisma.siteSection.findUnique({
      where: { sectionKey: 'page.notice' },
    })
    if (section?.content && typeof section.content === 'string') {
      return JSON.parse(section.content) as typeof defaultHeader
    }
  } catch (error) {
    console.error('Failed to load notice header:', error)
  }
  return defaultHeader
}

export default async function NoticePage({ searchParams }: Props) {
  const page = parseInt(searchParams.page || '1')
  const [session, header, noticeData] = await Promise.all([
    getServerSession(authOptions),
    getHeaderContent(),
    getPublicNotices({ page, limit: 10 }),
  ])
  const { notices, total, pages } = noticeData
  const isAdmin = session?.user?.role === 'ADMIN' || session?.user?.role === 'SUPER_ADMIN'

  return (
    <>
      <section className="pt-32 pb-16 bg-gradient-to-b from-gray-900 to-gray-800">
        <div className="max-w-7xl mx-auto px-4 text-center relative">
          <span className="text-primary text-sm font-semibold tracking-wider uppercase">
            {header.hero.badge}
          </span>
          <h1 className="text-4xl md:text-5xl font-bold text-white mt-2 mb-4">
            {header.hero.title}
          </h1>
          <p className="text-xl text-white/80 max-w-2xl mx-auto">
            {header.hero.subtitle}
          </p>
          {/* 관리자 전용 글쓰기 버튼 */}
          {isAdmin && (
            <Link
              href="/notice/write"
              className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-gray-100 text-primary rounded-xl font-medium transition-colors shadow-lg"
            >
              <Plus className="w-5 h-5" />
              <span className="hidden sm:inline">글쓰기</span>
            </Link>
          )}
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4">
          {notices.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              등록된 공지사항이 없습니다.
            </div>
          ) : (
            <div className="space-y-4">
              {notices.map((notice) => (
                <Link
                  key={notice.id}
                  href={`/notice/${notice.id}`}
                  className="block bg-white rounded-xl p-6 border border-gray-100 hover:border-primary/20 hover:shadow-lg transition-all"
                >
                  <div className="flex items-center gap-4">
                    {notice.isPinned && (
                      <span className="flex items-center gap-1 px-2 py-1 bg-primary-light text-primary text-xs font-medium rounded">
                        <Pin className="w-3 h-3" />
                        고정
                      </span>
                    )}
                    <h3 className="flex-1 font-medium text-gray-900 hover:text-primary transition-colors">
                      {notice.title}
                    </h3>
                    <div className="flex items-center gap-4 text-gray-400 text-sm">
                      <span className="flex items-center gap-1">
                        <Eye className="w-4 h-4" />
                        {notice.views}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {new Date(notice.createdAt).toLocaleDateString('ko-KR')}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {/* Pagination */}
          {pages > 1 && (
            <div className="mt-8 flex justify-center">
              <nav className="flex gap-2">
                {page > 1 && (
                  <Link
                    href={`/notice?page=${page - 1}`}
                    className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                  >
                    이전
                  </Link>
                )}
                {Array.from({ length: pages }, (_, i) => (
                  <Link
                    key={i + 1}
                    href={`/notice?page=${i + 1}`}
                    className={`px-4 py-2 rounded-lg ${
                      page === i + 1
                        ? 'bg-primary text-white'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {i + 1}
                  </Link>
                ))}
                {page < pages && (
                  <Link
                    href={`/notice?page=${page + 1}`}
                    className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                  >
                    다음
                  </Link>
                )}
              </nav>
            </div>
          )}
        </div>
      </section>
    </>
  )
}
