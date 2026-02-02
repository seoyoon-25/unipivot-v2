'use server'

import { revalidatePath } from 'next/cache'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function updateProfile(formData: FormData) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return { error: '로그인이 필요합니다.' }
  }

  const name = formData.get('name') as string
  const bio = formData.get('bio') as string
  const favoriteGenre = formData.get('favoriteGenre') as string
  const isPublicProfile = formData.get('isPublicProfile') === 'true'
  const profileImage = formData.get('profileImage') as string

  if (!name?.trim()) {
    return { error: '이름을 입력해주세요.' }
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: {
      name: name.trim(),
      bio: bio?.trim() || null,
      favoriteGenre: favoriteGenre || null,
      isPublicProfile,
      ...(profileImage && { image: profileImage }),
    },
  })

  revalidatePath('/club/profile')
  return { success: true }
}

export async function updateProfileImage(imageUrl: string) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return { error: '로그인이 필요합니다.' }
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: { image: imageUrl },
  })

  revalidatePath('/club/profile')
  return { success: true }
}
