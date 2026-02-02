import { notFound } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth/check-role'
import { getCommunityPost, getComments, incrementViewCount } from '@/lib/club/community-queries'
import PostDetail from '@/components/club/community/PostDetail'
import CommentSection from '@/components/club/community/CommentSection'

interface PageProps {
  params: Promise<{ postId: string }>
}

export default async function CommunityPostPage({ params }: PageProps) {
  const { postId } = await params
  const user = await getCurrentUser()
  const post = await getCommunityPost(postId, user?.id)

  if (!post) notFound()

  await incrementViewCount(postId)

  const comments = await getComments(postId)

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <PostDetail
        post={{
          ...post,
          createdAt: post.createdAt.toISOString(),
        }}
        isAuthor={user?.id === post.authorId}
        isLoggedIn={!!user}
      />

      <CommentSection
        postId={postId}
        comments={comments.map((c) => ({
          ...c,
          createdAt: c.createdAt.toISOString(),
          updatedAt: c.updatedAt.toISOString(),
          replies: c.replies.map((r) => ({
            ...r,
            createdAt: r.createdAt.toISOString(),
            updatedAt: r.updatedAt.toISOString(),
          })),
        }))}
        currentUserId={user?.id}
      />
    </div>
  )
}
