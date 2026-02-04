import Link from 'next/link'
import { Pin, Eye } from 'lucide-react'
import { getClubNotices } from '@/lib/club/notice-queries'

export const metadata = {
  title: '공지사항 | 유니클럽',
}

export default async function NoticesPage() {
  const { notices } = await getClubNotices({ limit: 50 })

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-xl font-bold text-zinc-900 tracking-tight mb-6">공지사항</h1>

      {notices.length === 0 ? (
        <div className="club-card p-12 text-center text-zinc-500">
          등록된 공지사항이 없습니다.
        </div>
      ) : (
        <div className="space-y-2">
          {notices.map((notice) => (
            <Link
              key={notice.id}
              href={`/club/notices/${notice.id}`}
              className="block club-card p-4 hover:bg-zinc-50 transition-colors duration-200"
            >
              <div className="flex items-start gap-3">
                {notice.isPinned && (
                  <Pin className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                )}
                <div className="flex-1 min-w-0">
                  <h2
                    className={`text-sm ${notice.isPinned ? 'font-bold' : 'font-medium'} text-zinc-900 truncate`}
                  >
                    {notice.title}
                  </h2>
                  <div className="flex items-center gap-3 mt-1.5 text-xs text-zinc-500">
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
