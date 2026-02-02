import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth/check-role'
import NoticeForm from '@/components/club/notices/NoticeForm'
import { createNotice } from '@/app/club/notices/admin/actions'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export const metadata = {
  title: '공지사항 작성 | 유니클럽',
}

export default async function NewNoticePage() {
  const user = await getCurrentUser()
  if (!user) {
    redirect('/login?callbackUrl=' + encodeURIComponent('/club/notices/admin/new'))
  }
  if (!['ADMIN', 'SUPER_ADMIN', 'FACILITATOR'].includes(user.role)) {
    redirect('/club/unauthorized?required=admin')
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
        <h1 className="text-xl font-bold text-gray-900">공지사항 작성</h1>
      </div>
      <NoticeForm mode="create" onSubmit={createNotice} />
    </div>
  )
}
