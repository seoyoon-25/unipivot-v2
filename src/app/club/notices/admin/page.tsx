import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Plus, Pin, Eye, Pencil } from 'lucide-react'
import { getCurrentUser } from '@/lib/auth/check-role'
import { getClubNotices } from '@/lib/club/notice-queries'
import NoticeDeleteButton from '@/components/club/notices/NoticeDeleteButton'

export const metadata = {
  title: '공지사항 관리 | 유니클럽',
}

export default async function NoticeAdminPage() {
  const user = await getCurrentUser()
  if (!user) {
    redirect('/login?callbackUrl=' + encodeURIComponent('/club/notices/admin'))
  }
  if (!['ADMIN', 'SUPER_ADMIN', 'FACILITATOR'].includes(user.role)) {
    redirect('/club/unauthorized?required=admin')
  }

  const { notices } = await getClubNotices({ limit: 100, includeUnpublished: true })

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-gray-900">공지사항 관리</h1>
        <Link
          href="/club/notices/admin/new"
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800"
        >
          <Plus className="w-4 h-4" />
          새 공지
        </Link>
      </div>

      {notices.length === 0 ? (
        <div className="bg-white rounded-lg p-12 text-center text-gray-500">
          등록된 공지사항이 없습니다.
        </div>
      ) : (
        <div className="space-y-2">
          {notices.map((notice) => (
            <div
              key={notice.id}
              className={`bg-white rounded-lg border p-4 ${
                !notice.isPublished ? 'border-yellow-200 bg-yellow-50/30' : 'border-gray-100'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    {notice.isPinned && <Pin className="w-3.5 h-3.5 text-blue-500 shrink-0" />}
                    {!notice.isPublished && (
                      <span className="text-[10px] font-medium px-1.5 py-0.5 bg-yellow-100 text-yellow-700 rounded">
                        미발행
                      </span>
                    )}
                    <h2 className="text-sm font-medium text-gray-900 truncate">{notice.title}</h2>
                  </div>
                  <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                    <span>{notice.author.name}</span>
                    <span>{new Date(notice.createdAt).toLocaleDateString('ko-KR')}</span>
                    <span className="flex items-center gap-1">
                      <Eye className="w-3 h-3" />
                      {notice.views}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <Link
                    href={`/club/notices/admin/${notice.id}/edit`}
                    className="p-2 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-gray-100"
                    title="수정"
                  >
                    <Pencil className="w-4 h-4" />
                  </Link>
                  <NoticeDeleteButton noticeId={notice.id} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
