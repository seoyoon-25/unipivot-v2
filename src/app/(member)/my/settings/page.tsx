import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { Bell, Lock, Trash2, LogOut } from 'lucide-react'

export default async function SettingsPage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-8">설정</h1>

      <div className="space-y-6">
        {/* Notifications */}
        <div className="bg-white rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-primary-light rounded-xl flex items-center justify-center">
              <Bell className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="font-bold text-gray-900">알림 설정</h2>
              <p className="text-gray-500 text-sm">알림 수신 설정을 관리합니다</p>
            </div>
          </div>
          <div className="space-y-4">
            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-gray-700">이메일 알림</span>
              <input type="checkbox" defaultChecked className="w-5 h-5 text-primary rounded focus:ring-primary" />
            </label>
            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-gray-700">프로그램 공지 알림</span>
              <input type="checkbox" defaultChecked className="w-5 h-5 text-primary rounded focus:ring-primary" />
            </label>
            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-gray-700">마케팅 수신 동의</span>
              <input type="checkbox" className="w-5 h-5 text-primary rounded focus:ring-primary" />
            </label>
          </div>
        </div>

        {/* Security */}
        <div className="bg-white rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
              <Lock className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="font-bold text-gray-900">보안</h2>
              <p className="text-gray-500 text-sm">계정 보안 설정을 관리합니다</p>
            </div>
          </div>
          <div className="space-y-4">
            <button className="w-full flex items-center justify-between py-3 px-4 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
              <span className="text-gray-700">비밀번호 변경</span>
              <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
            <button className="w-full flex items-center justify-between py-3 px-4 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
              <span className="text-gray-700">로그인 기록</span>
              <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="bg-white rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
              <Trash2 className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <h2 className="font-bold text-gray-900">계정 관리</h2>
              <p className="text-gray-500 text-sm">계정 삭제 및 로그아웃</p>
            </div>
          </div>
          <div className="space-y-4">
            <button className="w-full flex items-center justify-center gap-2 py-3 px-4 border border-gray-200 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors">
              <LogOut className="w-5 h-5" />
              로그아웃
            </button>
            <button className="w-full flex items-center justify-center gap-2 py-3 px-4 border border-red-200 rounded-xl text-red-600 hover:bg-red-50 transition-colors">
              <Trash2 className="w-5 h-5" />
              회원 탈퇴
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
