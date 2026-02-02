import Link from 'next/link'
import { Pin, Eye } from 'lucide-react'
import { getClubNotices } from '@/lib/club/notice-queries'

export const metadata = {
  title: '공지사항 | 유니클럽',
}

export default async function NoticesPage() {
  const { notices } = await getClubNotices({ limit: 50 })

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <h1 className="text-xl font-bold text-gray-900 mb-6">공지사항</h1>

      {notices.length === 0 ? (
        <div className="bg-white rounded-lg p-12 text-center text-gray-500">
          등록된 공지사항이 없습니다.
        </div>
      ) : (
        <div className="space-y-2">
          {notices.map((notice) => (
            <Link
              key={notice.id}
              href={`/club/notices/${notice.id}`}
              className="block bg-white rounded-lg border border-gray-100 p-4 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-start gap-3">
                {notice.isPinned && (
                  <Pin className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                )}
                <div className="flex-1 min-w-0">
                  <h2
                    className={`text-sm ${notice.isPinned ? 'font-bold' : 'font-medium'} text-gray-900 truncate`}
                  >
                    {notice.title}
                  </h2>
                  <div className="flex items-center gap-3 mt-1.5 text-xs text-gray-500">
                    <span>{notice.author.name}</span>
                    <span>
                      {new Date(notice.createdAt).toLocaleDateString('ko-KR')}
                    </span>
                    <span className="flex items-center gap-1">
                      <Eye className="w-3 h-3" />
                      {notice.views}
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
