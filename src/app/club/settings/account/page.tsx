import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { getCurrentUser } from '@/lib/auth/check-role'
import AccountForm from '@/components/club/settings/AccountForm'

export const metadata = { title: '계정 설정 | 유니클럽' }

export default async function AccountSettingsPage() {
  const user = await getCurrentUser()
  if (!user) redirect('/login')

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <Link
        href="/club/settings"
        className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        설정
      </Link>

      <h1 className="text-2xl font-bold text-gray-900 mb-6">계정 설정</h1>

      <AccountForm email={user.email || ''} />
    </div>
  )
}
