import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Pin, Eye } from 'lucide-react'
import { getClubNoticeById } from '@/lib/club/notice-queries'
import { sanitizeHtml } from '@/lib/sanitize'

export const metadata = {
  title: '공지사항 상세 | 유니클럽',
}

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function NoticeDetailPage({ params }: PageProps) {
  const { id } = await params
  const notice = await getClubNoticeById(id)

  if (!notice || !notice.isPublished) {
    notFound()
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <Link
        href="/club/notices"
        className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-4"
      >
        <ArrowLeft className="w-4 h-4" />
        공지사항 목록
      </Link>

      <article className="bg-white rounded-lg border border-gray-100 p-6">
        <div className="flex items-start gap-2 mb-4">
          {notice.isPinned && <Pin className="w-4 h-4 text-blue-500 shrink-0 mt-1" />}
          <h1 className="text-lg font-bold text-gray-900">{notice.title}</h1>
        </div>

        <div className="flex items-center gap-3 text-sm text-gray-500 mb-6 pb-4 border-b border-gray-100">
          <span>{notice.author.name}</span>
          <span>
            {new Date(notice.createdAt).toLocaleDateString('ko-KR', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </span>
          <span className="flex items-center gap-1">
            <Eye className="w-3.5 h-3.5" />
            {notice.views + 1}
          </span>
        </div>

        <div
          className="prose prose-sm max-w-none"
          dangerouslySetInnerHTML={{ __html: sanitizeHtml(notice.content) }}
        />
      </article>
    </div>
  )
}
