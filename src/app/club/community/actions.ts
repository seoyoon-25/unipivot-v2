'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth/check-role'
import prisma from '@/lib/db'

export async function createPost(formData: FormData) {
  const user = await getCurrentUser()
  if (!user) return { error: '로그인이 필요합니다.' }

  const category = formData.get('category') as string
  const title = formData.get('title') as string
  const content = formData.get('content') as string

  const validCategories = ['FREE', 'BOOK_REVIEW', 'QUESTION', 'MEETUP']
  if (!validCategories.includes(category)) {
    return { error: '유효하지 않은 카테고리입니다.' }
  }

  if (!title?.trim() || !content?.trim()) {
    return { error: '제목과 내용을 입력해주세요.' }
  }

  const post = await prisma.communityPost.create({
    data: {
      authorId: user.id,
      category,
      title: title.trim(),
      content: content.trim(),
    },
  })

  revalidatePath('/club/community')
  redirect(`/club/community/${post.id}`)
}

export async function updatePost(postId: string, formData: FormData) {
  const user = await getCurrentUser()
  if (!user) return { error: '로그인이 필요합니다.' }

  const post = await prisma.communityPost.findUnique({ where: { id: postId } })
  if (!post || post.authorId !== user.id) {
    return { error: '수정 권한이 없습니다.' }
  }

  const category = formData.get('category') as string
  const title = formData.get('title') as string
  const content = formData.get('content') as string

  const validCategories = ['FREE', 'BOOK_REVIEW', 'QUESTION', 'MEETUP']
  if (!validCategories.includes(category)) {
    return { error: '유효하지 않은 카테고리입니다.' }
  }

  if (!title?.trim() || !content?.trim()) {
    return { error: '제목과 내용을 입력해주세요.' }
  }

  await prisma.communityPost.update({
    where: { id: postId },
    data: {
      category,
      title: title.trim(),
      content: content.trim(),
    },
  })

  revalidatePath('/club/community')
  revalidatePath(`/club/community/${postId}`)
  redirect(`/club/community/${postId}`)
}

export async function deletePost(postId: string) {
  const user = await getCurrentUser()
  if (!user) return { error: '로그인이 필요합니다.' }

  const post = await prisma.communityPost.findUnique({ where: { id: postId } })
  if (!post) return { error: '게시물을 찾을 수 없습니다.' }

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { role: true },
  })
  const isAdmin = dbUser && ['ADMIN', 'SUPER_ADMIN'].includes(dbUser.role)

  if (post.authorId !== user.id && !isAdmin) {
    return { error: '삭제 권한이 없습니다.' }
  }

  await prisma.communityPost.delete({ where: { id: postId } })
  revalidatePath('/club/community')
  redirect('/club/community')
}

export async function createComment(postId: string, formData: FormData) {
  const user = await getCurrentUser()
  if (!user) return { error: '로그인이 필요합니다.' }

  const content = formData.get('content') as string
  const parentId = formData.get('parentId') as string | null

  if (!content?.trim()) {
    return { error: '댓글 내용을 입력해주세요.' }
  }

  // Validate parentId: only allow replies to top-level comments (1-depth max)
  if (parentId) {
    const parentComment = await prisma.communityComment.findUnique({
      where: { id: parentId },
      select: { parentId: true },
    })
    if (!parentComment) {
      return { error: '원댓글을 찾을 수 없습니다.' }
    }
    if (parentComment.parentId !== null) {
      return { error: '답글에는 답글을 달 수 없습니다.' }
    }
  }

  await prisma.communityComment.create({
    data: {
      postId,
      authorId: user.id,
      content: content.trim(),
      parentId: parentId || null,
    },
  })

  revalidatePath(`/club/community/${postId}`)
  return { success: true }
}

export async function deleteComment(commentId: string, postId: string) {
  const user = await getCurrentUser()
  if (!user) return { error: '로그인이 필요합니다.' }

  const comment = await prisma.communityComment.findUnique({ where: { id: commentId } })
  if (!comment) return { error: '댓글을 찾을 수 없습니다.' }

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { role: true },
  })
  const isAdmin = dbUser && ['ADMIN', 'SUPER_ADMIN'].includes(dbUser.role)

  if (comment.authorId !== user.id && !isAdmin) {
    return { error: '삭제 권한이 없습니다.' }
  }

  await prisma.communityComment.delete({ where: { id: commentId } })
  revalidatePath(`/club/community/${postId}`)
  return { success: true }
}
