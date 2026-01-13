'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Send } from 'lucide-react'
import { getFeeDisplay } from '@/lib/program/status-calculator'

const applicationSources = [
  { value: 'EXISTING_MEMBER', label: '기존회원' },
  { value: 'HANA_FOUNDATION', label: '남북하나재단 공지' },
  { value: 'SNS', label: '인스타그램, Facebook 등 SNS 홍보' },
  { value: 'KAKAO_GROUP', label: '관련 카톡방' },
  { value: 'KAKAO_CHANNEL', label: '카카오채널 또는 문자 메시지' },
  { value: 'REFERRAL', label: '지인추천' },
]

interface ApplicationFormProps {
  program: {
    id: string
    title: string
    slug: string
    type: string
    feeType: string
    feeAmount: number
  }
  userData: {
    id: string
    name: string | null
    email: string | null
    phone: string | null
  } | null
  previousApplication: {
    hometown: string | null
    residence: string | null
  } | null
  isLoggedIn: boolean
}

export function ApplicationForm({
  program,
  userData,
  previousApplication,
  isLoggedIn,
}: ApplicationFormProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    name: userData?.name || '',
    phone: userData?.phone || '',
    email: userData?.email || '',
    hometown: previousApplication?.hometown || '',
    residence: previousApplication?.residence || '',
    motivation: '',
    source: '',
    referrer: '',
    facePrivacy: false,
    privacyAgreed: false,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // Validation
    if (!form.name || !form.phone || !form.email) {
      setError('이름, 연락처, 이메일은 필수 입력입니다.')
      return
    }

    if (!form.hometown || !form.residence) {
      setError('고향과 거주지역은 필수 입력입니다.')
      return
    }

    if (!form.motivation) {
      setError('신청 동기를 입력해주세요.')
      return
    }

    if (!form.source) {
      setError('신청 경로를 선택해주세요.')
      return
    }

    if (form.source === 'REFERRAL' && !form.referrer) {
      setError('추천인 이름을 입력해주세요.')
      return
    }

    if (!form.privacyAgreed) {
      setError('개인정보 수집 및 이용에 동의해주세요.')
      return
    }

    startTransition(async () => {
      try {
        const res = await fetch(`/api/programs/${program.id}/apply`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        })

        if (!res.ok) {
          const data = await res.json()
          throw new Error(data.error || '신청 중 오류가 발생했습니다.')
        }

        alert('신청이 완료되었습니다!')
        router.push(`/programs/${program.slug}`)
      } catch (err: any) {
        setError(err.message)
      }
    })
  }

  const feeDisplay = getFeeDisplay(program.feeType, program.feeAmount)

  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
      {/* Header */}
      <div className="bg-primary px-6 py-8 text-white">
        <Link
          href={`/programs/${program.slug}`}
          className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          돌아가기
        </Link>
        <h1 className="text-2xl font-bold mb-2">{program.title}</h1>
        <p className="text-white/80">프로그램 신청서</p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {error && (
          <div className="bg-red-50 text-red-600 px-4 py-3 rounded-xl text-sm">
            {error}
          </div>
        )}

        {!isLoggedIn && (
          <div className="bg-yellow-50 text-yellow-800 px-4 py-3 rounded-xl text-sm">
            <Link href={`/login?callbackUrl=/programs/${program.slug}/apply`} className="underline font-medium">
              로그인
            </Link>
            하면 정보가 자동으로 입력됩니다.
          </div>
        )}

        {/* 기본 정보 */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">기본 정보</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                이름 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                연락처 <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="010-0000-0000"
                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                required
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                이메일 <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                required
              />
            </div>
          </div>
        </div>

        {/* 추가 정보 */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">추가 정보</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                고향 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={form.hometown}
                onChange={(e) => setForm({ ...form, hometown: e.target.value })}
                placeholder="예: 평양, 서울, 부산 등"
                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                거주지역 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={form.residence}
                onChange={(e) => setForm({ ...form, residence: e.target.value })}
                placeholder="예: 서울 강남구"
                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                required
              />
            </div>
          </div>
        </div>

        {/* 신청 동기 */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            신청 동기 <span className="text-red-500">*</span>
          </h2>
          <textarea
            value={form.motivation}
            onChange={(e) => setForm({ ...form, motivation: e.target.value })}
            rows={4}
            placeholder="프로그램에 신청하게 된 동기를 알려주세요."
            className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
            required
          />
        </div>

        {/* 신청 경로 */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            신청 경로 <span className="text-red-500">*</span>
          </h2>
          <div className="space-y-3">
            {applicationSources.map((source) => (
              <label
                key={source.value}
                className="flex items-center gap-3 cursor-pointer"
              >
                <input
                  type="radio"
                  name="source"
                  value={source.value}
                  checked={form.source === source.value}
                  onChange={(e) => setForm({ ...form, source: e.target.value, referrer: '' })}
                  className="text-primary focus:ring-primary"
                />
                <span className="text-gray-700">{source.label}</span>
              </label>
            ))}
          </div>

          {/* 추천인 입력 (지인추천 선택 시) */}
          {form.source === 'REFERRAL' && (
            <div className="mt-4 ml-7">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                추천인 이름 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={form.referrer}
                onChange={(e) => setForm({ ...form, referrer: e.target.value })}
                placeholder="추천해주신 분 이름을 입력해주세요"
                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                required
              />
            </div>
          )}
        </div>

        {/* 기타 옵션 */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">기타</h2>
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={form.facePrivacy}
              onChange={(e) => setForm({ ...form, facePrivacy: e.target.checked })}
              className="w-4 h-4 text-primary rounded focus:ring-primary"
            />
            <span className="text-gray-700">사진 촬영 시 얼굴 비공개 희망</span>
          </label>
        </div>

        {/* 비용 안내 */}
        {program.feeType !== 'FREE' && program.feeAmount > 0 && (
          <div className="bg-gray-50 rounded-xl p-4">
            <h3 className="font-medium text-gray-900 mb-2">비용 안내</h3>
            <p className="text-gray-700">{feeDisplay}</p>
            <p className="text-sm text-gray-500 mt-2">
              * 합격 시 별도 안내드리는 계좌로 입금해주세요.
            </p>
          </div>
        )}

        {/* 개인정보 동의 */}
        <div className="border-t pt-6">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={form.privacyAgreed}
              onChange={(e) => setForm({ ...form, privacyAgreed: e.target.checked })}
              className="w-4 h-4 text-primary rounded focus:ring-primary mt-0.5"
              required
            />
            <span className="text-gray-700">
              <span className="text-red-500">*</span> 개인정보 수집 및 이용에 동의합니다.
              <br />
              <span className="text-sm text-gray-500">
                수집된 개인정보는 프로그램 운영 목적으로만 사용되며, 프로그램 종료 후
                1년간 보관 후 파기됩니다.
              </span>
            </span>
          </label>
        </div>

        {/* 제출 버튼 */}
        <button
          type="submit"
          disabled={isPending}
          className="w-full flex items-center justify-center gap-2 py-4 bg-primary hover:bg-primary-dark text-white font-semibold rounded-xl transition-colors disabled:opacity-50"
        >
          <Send className="w-5 h-5" />
          {isPending ? '신청 중...' : '신청하기'}
        </button>
      </form>
    </div>
  )
}
