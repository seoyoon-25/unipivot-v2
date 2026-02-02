import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { getCurrentUser } from '@/lib/auth/check-role'
import prisma from '@/lib/db'
import PostForm from '@/components/club/community/PostForm'

export const metadata = { title: '글 수정 | 커뮤니티' }

interface PageProps {
  params: Promise<{ postId: string }>
}

export default async function EditPostPage({ params }: PageProps) {
  const { postId } = await params
  const user = await getCurrentUser()
  if (!user) redirect('/login')

  const post = await prisma.communityPost.findUnique({
    where: { id: postId },
  })

  if (!post) notFound()
  if (post.authorId !== user.id) redirect(`/club/community/${postId}`)

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <Link
        href={`/club/community/${postId}`}
        className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        돌아가기
      </Link>

      <h1 className="text-2xl font-bold text-gray-900 mb-6">글 수정</h1>

      <PostForm
        postId={postId}
        initialData={{
          category: post.category,
          title: post.title,
          content: post.content,
        }}
      />
    </div>
  )
}
