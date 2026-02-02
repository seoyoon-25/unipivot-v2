import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { getCurrentUser } from '@/lib/auth/check-role'
import PostForm from '@/components/club/community/PostForm'

export const metadata = { title: '글쓰기 | 커뮤니티' }

export default async function NewPostPage() {
  const user = await getCurrentUser()
  if (!user) redirect('/login?callbackUrl=' + encodeURIComponent('/club/community/new'))

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <Link
        href="/club/community"
        className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        목록으로
      </Link>

      <h1 className="text-2xl font-bold text-gray-900 mb-6">글쓰기</h1>

      <PostForm />
    </div>
  )
}
