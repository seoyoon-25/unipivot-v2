import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import SwaggerClient from './SwaggerClient'

export default async function ApiDocsPage() {
  // 프로덕션: 관리자만 접근 가능
  if (process.env.NODE_ENV === 'production') {
    const session = await getServerSession(authOptions)
    if (!session?.user || !['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) {
      redirect('/login')
    }
  }

  return <SwaggerClient />
}
