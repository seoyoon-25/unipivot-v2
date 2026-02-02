import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, AlertTriangle } from 'lucide-react'
import { getCurrentUser } from '@/lib/auth/check-role'
import DeleteAccountForm from '@/components/club/settings/DeleteAccountForm'

export const metadata = { title: '계정 탈퇴 | 유니클럽' }

export default async function DeleteAccountPage() {
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

      <h1 className="text-2xl font-bold text-gray-900 mb-6">계정 탈퇴</h1>

      <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-red-800">
              주의: 이 작업은 되돌릴 수 없습니다
            </p>
            <ul className="mt-2 text-sm text-red-700 space-y-1">
              <li>- 모든 독후감과 명문장이 삭제됩니다</li>
              <li>- 출석 기록이 삭제됩니다</li>
              <li>- 프로그램 참가 이력이 삭제됩니다</li>
              <li>- 커뮤니티 게시글과 댓글이 삭제됩니다</li>
            </ul>
          </div>
        </div>
      </div>

      <DeleteAccountForm />
    </div>
  )
}
