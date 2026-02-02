import { redirect, notFound } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth/check-role'
import { getClubNoticeById } from '@/lib/club/notice-queries'
import NoticeForm from '@/components/club/notices/NoticeForm'
import { updateNotice } from '@/app/club/notices/admin/actions'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export const metadata = {
  title: '공지사항 수정 | 유니클럽',
}

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function EditNoticePage({ params }: PageProps) {
  const user = await getCurrentUser()
  if (!user) {
    redirect('/login?callbackUrl=' + encodeURIComponent('/club/notices/admin'))
  }
  if (!['ADMIN', 'SUPER_ADMIN', 'FACILITATOR'].includes(user.role)) {
    redirect('/club/unauthorized?required=admin')
  }

  const { id } = await params
  const notice = await getClubNoticeById(id)

  if (!notice) {
    notFound()
  }

  const handleUpdate = async (data: {
    title: string
    content: string
    isPinned: boolean
    isPublished: boolean
  }) => {
    'use server'
    return updateNotice(id, data)
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <div className="flex items-center gap-3 mb-6">
        <Link
          href="/club/notices/admin"
          className="p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-xl font-bold text-gray-900">공지사항 수정</h1>
      </div>
      <NoticeForm
        mode="edit"
        initialData={{
          title: notice.title,
          content: notice.content,
          isPinned: notice.isPinned,
          isPublished: notice.isPublished,
        }}
        onSubmit={handleUpdate}
      />
    </div>
  )
}
