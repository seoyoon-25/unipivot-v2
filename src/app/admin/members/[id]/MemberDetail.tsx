'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Save, User, Mail, Phone, Calendar, BookOpen, Check, X } from 'lucide-react'
import { updateMember, updateRegistrationStatus } from '@/lib/actions/admin'

interface Member {
  id: string
  name: string | null
  email: string
  phone: string | null
  origin: string | null
  birthYear: number | null
  occupation: string | null
  bio: string | null
  points: number
  role: string
  status: string
  createdAt: Date
  registrations: Array<{
    id: string
    status: string
    program: { id: string; title: string; type: string }
  }>
  donations: Array<{
    id: string
    amount: number
    status: string
    createdAt: Date
  }>
}

interface Props {
  member: Member
}

export default function MemberDetail({ member }: Props) {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [updatingReg, setUpdatingReg] = useState<string | null>(null)
  const [form, setForm] = useState({
    name: member.name || '',
    phone: member.phone || '',
    origin: member.origin || '',
    status: member.status,
    role: member.role
  })

  const handleSave = async () => {
    setSaving(true)
    try {
      await updateMember(member.id, form)
      alert('저장되었습니다.')
      router.refresh()
    } catch (error) {
      alert('저장 중 오류가 발생했습니다.')
    } finally {
      setSaving(false)
    }
  }

  const totalDonations = member.donations
    .filter(d => d.status === 'COMPLETED')
    .reduce((sum, d) => sum + d.amount, 0)

  const handleStatusChange = async (regId: string, status: 'APPROVED' | 'REJECTED') => {
    setUpdatingReg(regId)
    try {
      await updateRegistrationStatus(regId, status)
      router.refresh()
    } catch (error) {
      alert('상태 변경 중 오류가 발생했습니다.')
    } finally {
      setUpdatingReg(null)
    }
  }

  return (
    <div>
      <div className="flex items-center gap-4 mb-8">
        <Link
          href="/admin/members"
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">회원 상세</h1>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <div className="text-center mb-6">
              <div className="w-24 h-24 bg-primary-light rounded-full flex items-center justify-center text-primary text-3xl font-bold mx-auto mb-4">
                {member.name?.[0] || '?'}
              </div>
              <h2 className="text-xl font-bold text-gray-900">{member.name || '이름 없음'}</h2>
              <p className="text-gray-500">{member.email}</p>
            </div>

            <div className="space-y-4 text-sm">
              <div className="flex items-center gap-3 text-gray-600">
                <Calendar className="w-4 h-4" />
                <span>가입일: {new Date(member.createdAt).toLocaleDateString('ko-KR')}</span>
              </div>
              <div className="flex items-center gap-3 text-gray-600">
                <BookOpen className="w-4 h-4" />
                <span>참여 프로그램: {member.registrations.length}개</span>
              </div>
              <div className="flex items-center gap-3 text-gray-600">
                <User className="w-4 h-4" />
                <span>포인트: {member.points.toLocaleString()}P</span>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-100">
              <p className="text-sm text-gray-500 mb-2">총 후원금</p>
              <p className="text-2xl font-bold text-primary">
                {new Intl.NumberFormat('ko-KR', { style: 'currency', currency: 'KRW' }).format(totalDonations)}
              </p>
            </div>
          </div>
        </div>

        {/* Edit Form */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h3 className="text-lg font-bold text-gray-900 mb-6">회원 정보 수정</h3>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">이름</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">이메일</label>
                <input
                  type="email"
                  value={member.email}
                  disabled
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl bg-gray-50 text-gray-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">전화번호</label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">출신</label>
                <select
                  value={form.origin}
                  onChange={(e) => setForm({ ...form, origin: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                >
                  <option value="">선택</option>
                  <option value="SOUTH">남한</option>
                  <option value="NORTH">북한</option>
                  <option value="OVERSEAS">해외</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">상태</label>
                <select
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                >
                  <option value="ACTIVE">활성</option>
                  <option value="INACTIVE">비활성</option>
                  <option value="BANNED">정지</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">역할</label>
                <select
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                >
                  <option value="USER">일반 회원</option>
                  <option value="ADMIN">관리자</option>
                  <option value="SUPER_ADMIN">최고 관리자</option>
                </select>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 px-6 py-2 bg-primary text-white rounded-xl hover:bg-primary-dark transition-colors disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                {saving ? '저장 중...' : '저장'}
              </button>
            </div>
          </div>

          {/* Program Registrations */}
          <div className="bg-white rounded-2xl p-6 shadow-sm mt-6">
            <h3 className="text-lg font-bold text-gray-900 mb-6">참여 프로그램</h3>
            {member.registrations.length === 0 ? (
              <p className="text-gray-500 text-center py-4">참여한 프로그램이 없습니다.</p>
            ) : (
              <div className="space-y-3">
                {member.registrations.map((reg) => (
                  <div key={reg.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <div className="flex-1 min-w-0">
                      <Link href={`/admin/programs/${reg.program.id}`} className="font-medium text-gray-900 hover:text-primary">
                        {reg.program.title}
                      </Link>
                      <p className="text-sm text-gray-500">{reg.program.type}</p>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      {reg.status === 'PENDING' ? (
                        <>
                          <button
                            onClick={() => handleStatusChange(reg.id, 'APPROVED')}
                            disabled={updatingReg === reg.id}
                            className="p-1.5 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition-colors disabled:opacity-50"
                            title="승인"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleStatusChange(reg.id, 'REJECTED')}
                            disabled={updatingReg === reg.id}
                            className="p-1.5 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors disabled:opacity-50"
                            title="거절"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </>
                      ) : (
                        <span className={`px-2 py-1 text-xs rounded ${
                          reg.status === 'APPROVED' ? 'bg-green-100 text-green-600' :
                          reg.status === 'REJECTED' ? 'bg-red-100 text-red-600' :
                          'bg-gray-100 text-gray-600'
                        }`}>
                          {reg.status === 'APPROVED' ? '승인됨' :
                           reg.status === 'REJECTED' ? '거절됨' : '취소됨'}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
