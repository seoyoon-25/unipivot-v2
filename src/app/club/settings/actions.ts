'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth/check-role'
import prisma from '@/lib/db'
import bcrypt from 'bcryptjs'

export async function changePassword(formData: FormData) {
  const user = await getCurrentUser()
  if (!user) return { error: '로그인이 필요합니다.' }

  const currentPassword = formData.get('currentPassword') as string
  const newPassword = formData.get('newPassword') as string
  const confirmPassword = formData.get('confirmPassword') as string

  if (!currentPassword || !newPassword || !confirmPassword) {
    return { error: '모든 필드를 입력해주세요.' }
  }

  if (newPassword !== confirmPassword) {
    return { error: '새 비밀번호가 일치하지 않습니다.' }
  }

  if (newPassword.length < 8) {
    return { error: '비밀번호는 8자 이상이어야 합니다.' }
  }

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { password: true },
  })

  if (!dbUser?.password) {
    return { error: '소셜 로그인 계정은 비밀번호를 변경할 수 없습니다.' }
  }

  const isValid = await bcrypt.compare(currentPassword, dbUser.password)
  if (!isValid) {
    return { error: '현재 비밀번호가 일치하지 않습니다.' }
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10)

  await prisma.user.update({
    where: { id: user.id },
    data: { password: hashedPassword },
  })

  return { success: true, message: '비밀번호가 변경되었습니다.' }
}

export async function exportMyData() {
  const user = await getCurrentUser()
  if (!user) return { error: '로그인이 필요합니다.' }

  const [userData, reports, quotes, attendances] = await Promise.all([
    prisma.user.findUnique({
      where: { id: user.id },
      select: { name: true, email: true, createdAt: true },
    }),
    prisma.bookReport.findMany({
      where: { authorId: user.id },
      select: { bookTitle: true, bookAuthor: true, content: true, createdAt: true },
    }),
    prisma.quote.findMany({
      where: { userId: user.id },
      select: { bookTitle: true, content: true, createdAt: true },
    }),
    prisma.programAttendance.findMany({
      where: { participant: { userId: user.id } },
      include: {
        session: {
          include: { program: { select: { title: true } } },
        },
      },
    }),
  ])

  const exportData = {
    exportedAt: new Date().toISOString(),
    user: userData,
    reports,
    quotes,
    attendances: attendances.map((a) => ({
      program: a.session.program.title,
      sessionNo: a.session.sessionNo,
      date: a.session.date,
      status: a.status,
    })),
  }

  return { data: exportData }
}

export async function deleteAccount(formData: FormData) {
  const user = await getCurrentUser()
  if (!user) return { error: '로그인이 필요합니다.' }

  const password = formData.get('password') as string
  const confirmation = formData.get('confirmation') as string

  if (confirmation !== '계정 삭제') {
    return { error: '"계정 삭제"를 정확히 입력해주세요.' }
  }

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { password: true },
  })

  if (dbUser?.password) {
    if (!password) {
      return { error: '비밀번호를 입력해주세요.' }
    }
    const isValid = await bcrypt.compare(password, dbUser.password)
    if (!isValid) {
      return { error: '비밀번호가 일치하지 않습니다.' }
    }
  }

  // Delete related records without cascade rules in a transaction
  try {
    await prisma.$transaction(async (tx) => {
      // Delete records that don't have onDelete: Cascade on User relation
      await tx.communityPost.deleteMany({ where: { authorId: user.id } })
      await tx.communityComment.deleteMany({ where: { authorId: user.id } })
      await tx.communityLike.deleteMany({ where: { userId: user.id } })
      await tx.clubNotice.deleteMany({ where: { authorId: user.id } })

      await tx.user.delete({ where: { id: user.id } })
    })
  } catch {
    return { error: '계정 삭제 중 오류가 발생했습니다. 관리자에게 문의해주세요.' }
  }

  // Invalidate session cookies
  const cookieStore = await cookies()
  cookieStore.delete('next-auth.session-token')
  cookieStore.delete('__Secure-next-auth.session-token')
  cookieStore.delete('next-auth.callback-url')
  cookieStore.delete('next-auth.csrf-token')

  redirect('/')
}
