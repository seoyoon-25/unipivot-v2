'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft,
  Save,
  User,
  Mail,
  Phone,
  Calendar,
  MapPin,
  Building,
  Loader2,
} from 'lucide-react'
import { createMember } from '@/lib/actions/members'
import { MEMBER_GRADES, MEMBER_STATUS } from '@/lib/services/member-matching'

const ORIGIN_OPTIONS = [
  { value: 'SOUTH', label: '남한' },
  { value: 'NORTH', label: '북한' },
  { value: 'OVERSEAS', label: '해외' },
]

const GENDER_OPTIONS = [
  { value: 'M', label: '남성' },
  { value: 'F', label: '여성' },
]

export default function NewMemberPage() {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [form, setForm] = useState({
    name: '',
    birthYear: '',
    gender: '',
    email: '',
    phone: '',
    origin: '',
    hometown: '',
    residence: '',
    organization: '',
    grade: 'NEW',
    status: 'ACTIVE',
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
    setError(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!form.name.trim()) {
      setError('이름을 입력해주세요.')
      return
    }

    setSaving(true)
    setError(null)

    try {
      const member = await createMember({
        name: form.name.trim(),
        birthYear: form.birthYear ? parseInt(form.birthYear) : undefined,
        gender: form.gender || undefined,
        email: form.email.trim() || undefined,
        phone: form.phone.trim() || undefined,
        origin: form.origin || undefined,
        hometown: form.hometown.trim() || undefined,
        residence: form.residence.trim() || undefined,
        organization: form.organization.trim() || undefined,
        grade: form.grade,
        status: form.status,
      })

      router.push(`/admin/members/${member.id}`)
    } catch (err) {
      console.error('회원 생성 실패:', err)
      setError(err instanceof Error ? err.message : '회원 생성에 실패했습니다.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      {/* 헤더 */}
      <div className="flex items-center gap-4 mb-8">
        <Link
          href="/admin/members"
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">신규 회원 등록</h1>
          <p className="text-gray-500 text-sm mt-1">새로운 회원 정보를 입력해주세요</p>
        </div>
      </div>

      {/* 에러 메시지 */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* 기본 정보 카드 */}
        <div className="bg-white rounded-xl border shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <User className="w-5 h-5" />
            기본 정보
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* 이름 (필수) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                이름 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                placeholder="홍길동"
                required
              />
            </div>

            {/* 출생년도 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <Calendar className="w-4 h-4 inline mr-1" />
                출생년도
              </label>
              <input
                type="number"
                name="birthYear"
                value={form.birthYear}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                placeholder="1990"
                min="1900"
                max={new Date().getFullYear()}
              />
            </div>

            {/* 성별 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                성별
              </label>
              <select
                name="gender"
                value={form.gender}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              >
                <option value="">선택 안함</option>
                {GENDER_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>

            {/* 이메일 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <Mail className="w-4 h-4 inline mr-1" />
                이메일
              </label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                placeholder="example@email.com"
              />
            </div>

            {/* 연락처 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <Phone className="w-4 h-4 inline mr-1" />
                연락처
              </label>
              <input
                type="tel"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                placeholder="010-1234-5678"
              />
            </div>

            {/* 출신 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                출신
              </label>
              <select
                name="origin"
                value={form.origin}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              >
                <option value="">선택 안함</option>
                {ORIGIN_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>

            {/* 고향 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <MapPin className="w-4 h-4 inline mr-1" />
                고향
              </label>
              <input
                type="text"
                name="hometown"
                value={form.hometown}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                placeholder="서울특별시"
              />
            </div>

            {/* 거주지 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <MapPin className="w-4 h-4 inline mr-1" />
                거주지
              </label>
              <input
                type="text"
                name="residence"
                value={form.residence}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                placeholder="경기도 성남시"
              />
            </div>

            {/* 소속 */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <Building className="w-4 h-4 inline mr-1" />
                소속
              </label>
              <input
                type="text"
                name="organization"
                value={form.organization}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                placeholder="회사/학교 등"
              />
            </div>
          </div>
        </div>

        {/* 등급/상태 카드 */}
        <div className="bg-white rounded-xl border shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">등급 및 상태</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* 등급 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                회원 등급
              </label>
              <select
                name="grade"
                value={form.grade}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              >
                {Object.entries(MEMBER_GRADES).map(([value, info]) => (
                  <option key={value} value={value}>
                    {info.emoji} {info.label}
                  </option>
                ))}
              </select>
            </div>

            {/* 상태 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                회원 상태
              </label>
              <select
                name="status"
                value={form.status}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              >
                {Object.entries(MEMBER_STATUS).map(([value, info]) => (
                  <option key={value} value={value}>
                    {info.emoji} {info.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* 액션 버튼 */}
        <div className="flex items-center justify-between">
          <Link
            href="/admin/members"
            className="px-4 py-2 border rounded-lg hover:bg-gray-50 transition-colors"
          >
            취소
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                저장 중...
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                회원 등록
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
