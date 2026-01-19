'use client'

import { useState, useEffect, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Send, CheckCircle, AlertTriangle, XCircle, Sparkles, User } from 'lucide-react'
import { getFeeDisplay } from '@/lib/program/status-calculator'

const applicationSources = [
  { value: 'EXISTING_MEMBER', label: '기존회원' },
  { value: 'REFERRAL', label: '지인 추천' },
  { value: 'INSTAGRAM', label: '인스타그램' },
  { value: 'HANA_FOUNDATION', label: '남북하나재단' },
  { value: 'SEARCH', label: '인터넷 검색' },
  { value: 'OTHER', label: '기타' },
]

interface MemberType {
  id: string
  memberCode: string
  name: string
  email: string | null
  phone: string | null
  birthYear: number | null
  birthDate: Date | null
  gender: string | null
  organization: string | null
  origin: string | null
  hometown: string | null
  residence: string | null
  grade: string
  status: string
  stats?: {
    totalPrograms: number
    attendanceRate: number
  } | null
}

interface ApplicationFormProps {
  program: {
    id: string
    title: string
    slug: string
    type: string
    feeType: string
    feeAmount: number
    maxParticipants?: number | null
    depositAmount?: number | null
    requireMotivation: boolean
    requireSelfIntro: boolean
    currentCount: number
  }
  user: {
    id: string
    name?: string | null
    email?: string | null
  } | null | undefined
  userData: {
    id: string
    name: string | null
    email: string | null
    phone: string | null
    origin: string | null
    gender: string | null
    birthYear: number | null
    organization: string | null
    residenceRegion: string | null
    residenceCity: string | null
    birthRegion: string | null
    birthCity: string | null
  } | null
  member: MemberType | null
  previousApplication: {
    hometown: string | null
    residence: string | null
    origin: string | null
    organization: string | null
  } | null
  isLoggedIn: boolean
}

export function ApplicationForm({
  program,
  user,
  userData,
  member,
  previousApplication,
  isLoggedIn,
}: ApplicationFormProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState('')
  const [checking, setChecking] = useState(false)
  const [memberCheck, setMemberCheck] = useState<{
    matched: boolean
    alertLevel: string | null
    memberGrade: string | null
  } | null>(null)

  // Get residence from user data
  const getResidence = () => {
    if (member?.residence) return member.residence
    if (userData?.residenceRegion && userData?.residenceCity) {
      return `${userData.residenceRegion} ${userData.residenceCity}`
    }
    if (previousApplication?.residence) return previousApplication.residence
    return ''
  }

  // Get hometown from user data
  const getHometown = () => {
    if (member?.hometown) return member.hometown
    if (userData?.birthRegion && userData?.birthCity) {
      return `${userData.birthRegion} ${userData.birthCity}`
    }
    if (previousApplication?.hometown) return previousApplication.hometown
    return ''
  }

  const [form, setForm] = useState({
    name: member?.name || userData?.name || '',
    phone: member?.phone || userData?.phone || '',
    email: member?.email || userData?.email || '',
    birthYear: member?.birthYear || userData?.birthYear || '',
    birthDate: member?.birthDate ? new Date(member.birthDate).toISOString().split('T')[0] : '',
    gender: member?.gender || userData?.gender || '',
    organization: member?.organization || userData?.organization || previousApplication?.organization || '',
    origin: member?.origin || userData?.origin || previousApplication?.origin || '',
    hometown: getHometown(),
    residence: getResidence(),
    motivation: '',
    selfIntro: '',
    referralSource: '',
    referrerName: '',
    agreedToRules: false,
    agreedToTerms: false,
    agreedToPrivacy: false,
    facePrivacy: false,
  })

  // Check member status for non-logged-in users
  useEffect(() => {
    if (!user && form.name && (form.email || form.phone || form.birthYear)) {
      const timer = setTimeout(async () => {
        setChecking(true)
        try {
          const res = await fetch('/api/applications/check-member', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              name: form.name,
              email: form.email,
              phone: form.phone,
              birthYear: form.birthYear ? parseInt(String(form.birthYear)) : undefined,
            }),
          })
          if (res.ok) {
            const result = await res.json()
            setMemberCheck(result)
          }
        } catch (e) {
          console.error('Failed to check member:', e)
        } finally {
          setChecking(false)
        }
      }, 500)
      return () => clearTimeout(timer)
    }
  }, [form.name, form.email, form.phone, form.birthYear, user])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // Validation
    if (!form.name || !form.phone || !form.email) {
      setError('이름, 연락처, 이메일은 필수 입력입니다.')
      return
    }

    if (!form.origin) {
      setError('출신을 선택해주세요.')
      return
    }

    if (!form.hometown || !form.residence) {
      setError('고향과 거주지역은 필수 입력입니다.')
      return
    }

    if (program.requireMotivation && !form.motivation) {
      setError('신청 동기를 입력해주세요.')
      return
    }

    if (program.requireSelfIntro && !form.selfIntro) {
      setError('자기소개를 입력해주세요.')
      return
    }

    if (form.referralSource === 'REFERRAL' && !form.referrerName) {
      setError('추천인 이름을 입력해주세요.')
      return
    }

    if (!form.agreedToRules) {
      setError('독서모임 참여 십계명에 동의해주세요.')
      return
    }

    if (!form.agreedToTerms) {
      setError('이용약관에 동의해주세요.')
      return
    }

    if (!form.agreedToPrivacy) {
      setError('개인정보 처리방침에 동의해주세요.')
      return
    }

    startTransition(async () => {
      try {
        const res = await fetch(`/api/programs/${program.id}/apply`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...form,
            birthYear: form.birthYear ? parseInt(String(form.birthYear)) : null,
          }),
        })

        if (!res.ok) {
          const data = await res.json()
          throw new Error(data.error || '신청 중 오류가 발생했습니다.')
        }

        const result = await res.json()
        router.push(`/programs/${program.slug}/apply/complete?status=${result.status}`)
      } catch (err: any) {
        setError(err.message)
      }
    })
  }

  const feeDisplay = getFeeDisplay(program.feeType, program.feeAmount)
  const isVIP = member?.grade === 'VVIP' || member?.grade === 'VIP'
  const isFull = program.maxParticipants && program.currentCount >= program.maxParticipants

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <Link
          href={`/programs/${program.slug}`}
          className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          돌아가기
        </Link>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">{program.title}</h1>
        <p className="text-gray-500">
          신청 현황: {program.currentCount}명
          {program.maxParticipants && ` / ${program.maxParticipants}명`}
        </p>

        {isFull && (
          <div className="mt-4 p-3 bg-yellow-50 rounded-lg text-yellow-700">
            정원이 마감되었습니다. 대기자로 신청됩니다.
          </div>
        )}
      </div>

      {/* Login notice or Welcome message */}
      {!user ? (
        <div className="bg-blue-50 rounded-xl p-4">
          <p className="text-blue-700 text-sm">
            <Link href={`/login?callbackUrl=/programs/${program.slug}/apply`} className="underline font-medium">
              로그인
            </Link>
            하시면 정보가 자동으로 입력됩니다.
          </p>
        </div>
      ) : member ? (
        <div className={`rounded-xl p-4 ${
          member.grade === 'VVIP' ? 'bg-purple-50' :
          member.grade === 'VIP' ? 'bg-yellow-50' : 'bg-green-50'
        }`}>
          <div className="flex items-center gap-3">
            {member.grade === 'VVIP' && <Sparkles className="w-5 h-5 text-purple-500" />}
            {member.grade === 'VIP' && <Sparkles className="w-5 h-5 text-yellow-500" />}
            {!isVIP && <CheckCircle className="w-5 h-5 text-green-500" />}

            <div>
              <p className="font-medium">
                {member.grade === 'VVIP' && ' '}
                {member.grade === 'VIP' && ' '}
                {member.name}님, 환영합니다!
              </p>
              <p className="text-sm text-gray-600">
                {member.stats?.totalPrograms || 0}번째 참여
                {isVIP && ' • 우선 승인 대상'}
              </p>
            </div>
          </div>
        </div>
      ) : null}

      {/* Member check alert for non-logged-in users */}
      {!user && memberCheck && <MemberCheckAlert check={memberCheck} slug={program.slug} />}

      {error && (
        <div className="bg-red-50 text-red-600 px-4 py-3 rounded-xl text-sm">
          {error}
        </div>
      )}

      {/* Basic Info */}
      <div className="bg-white rounded-xl p-6 shadow-sm space-y-4">
        <h2 className="font-bold text-gray-900 mb-4">기본 정보</h2>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              이름 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              disabled={!!member}
              className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary disabled:bg-gray-100"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              출생년도
            </label>
            <input
              type="number"
              value={form.birthYear}
              onChange={(e) => setForm({ ...form, birthYear: e.target.value })}
              disabled={!!member?.birthYear}
              placeholder="예: 1990"
              min="1930"
              max={new Date().getFullYear()}
              className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary disabled:bg-gray-100"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              이메일 <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              disabled={!!member?.email}
              className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary disabled:bg-gray-100"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              연락처 <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              required
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              placeholder="010-0000-0000"
              className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              성별
            </label>
            <select
              value={form.gender}
              onChange={(e) => setForm({ ...form, gender: e.target.value })}
              disabled={!!member?.gender}
              className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary disabled:bg-gray-100"
            >
              <option value="">선택</option>
              <option value="MALE">남성</option>
              <option value="FEMALE">여성</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              소속
            </label>
            <input
              type="text"
              value={form.organization}
              onChange={(e) => setForm({ ...form, organization: e.target.value })}
              placeholder="회사명/학교명"
              className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>
        </div>
      </div>

      {/* Origin / Location */}
      <div className="bg-white rounded-xl p-6 shadow-sm space-y-4">
        <h2 className="font-bold text-gray-900 mb-4">출신/거주지</h2>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            출신 <span className="text-red-500">*</span>
          </label>
          <div className="flex gap-4">
            {['남한', '북한', '해외'].map((opt) => (
              <label key={opt} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="origin"
                  value={opt}
                  checked={form.origin === opt}
                  onChange={(e) => setForm({ ...form, origin: e.target.value })}
                  disabled={!!member?.origin}
                  className="text-primary focus:ring-primary"
                  required
                />
                {opt}
              </label>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              고향 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={form.hometown}
              onChange={(e) => setForm({ ...form, hometown: e.target.value })}
              placeholder="예: 함경북도 청진시"
              disabled={!!member?.hometown}
              className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary disabled:bg-gray-100"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              현 거주지 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={form.residence}
              onChange={(e) => setForm({ ...form, residence: e.target.value })}
              placeholder="예: 서울시 강남구"
              className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>
        </div>
      </div>

      {/* Application Info */}
      <div className="bg-white rounded-xl p-6 shadow-sm space-y-4">
        <h2 className="font-bold text-gray-900 mb-4">신청 정보</h2>

        {program.requireMotivation && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              신청 동기 <span className="text-red-500">*</span>
            </label>
            <textarea
              required={program.requireMotivation}
              value={form.motivation}
              onChange={(e) => setForm({ ...form, motivation: e.target.value })}
              rows={4}
              placeholder="이 독서모임에 참여하고 싶은 이유를 작성해주세요."
              className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
            />
          </div>
        )}

        {program.requireSelfIntro && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              자기소개 <span className="text-red-500">*</span>
            </label>
            <textarea
              required={program.requireSelfIntro}
              value={form.selfIntro}
              onChange={(e) => setForm({ ...form, selfIntro: e.target.value })}
              rows={4}
              placeholder="간단한 자기소개를 작성해주세요."
              className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
            />
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              알게 된 경로
            </label>
            <select
              value={form.referralSource}
              onChange={(e) => setForm({ ...form, referralSource: e.target.value, referrerName: '' })}
              className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            >
              <option value="">선택</option>
              {applicationSources.map((source) => (
                <option key={source.value} value={source.value}>
                  {source.label}
                </option>
              ))}
            </select>
          </div>

          {form.referralSource === 'REFERRAL' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                추천인 이름 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={form.referrerName}
                onChange={(e) => setForm({ ...form, referrerName: e.target.value })}
                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>
          )}
        </div>

        {/* Face privacy option */}
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={form.facePrivacy}
            onChange={(e) => setForm({ ...form, facePrivacy: e.target.checked })}
            className="w-4 h-4 text-primary rounded focus:ring-primary"
          />
          <span className="text-gray-700 text-sm">사진 촬영 시 얼굴 비공개 희망</span>
        </label>
      </div>

      {/* Terms Agreement */}
      <div className="bg-white rounded-xl p-6 shadow-sm space-y-3">
        <h2 className="font-bold text-gray-900 mb-4">동의 사항</h2>

        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            required
            checked={form.agreedToRules}
            onChange={(e) => setForm({ ...form, agreedToRules: e.target.checked })}
            className="mt-1 w-4 h-4 text-primary rounded focus:ring-primary"
          />
          <span className="text-sm">
            <span className="text-red-500">[필수]</span>{' '}
            <a href="/rules" target="_blank" className="text-orange-500 underline">
              독서모임 참여 십계명
            </a>에 동의합니다.
          </span>
        </label>

        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            required
            checked={form.agreedToTerms}
            onChange={(e) => setForm({ ...form, agreedToTerms: e.target.checked })}
            className="mt-1 w-4 h-4 text-primary rounded focus:ring-primary"
          />
          <span className="text-sm">
            <span className="text-red-500">[필수]</span>{' '}
            <a href="/terms" target="_blank" className="text-orange-500 underline">
              이용약관
            </a>에 동의합니다.
          </span>
        </label>

        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            required
            checked={form.agreedToPrivacy}
            onChange={(e) => setForm({ ...form, agreedToPrivacy: e.target.checked })}
            className="mt-1 w-4 h-4 text-primary rounded focus:ring-primary"
          />
          <span className="text-sm">
            <span className="text-red-500">[필수]</span>{' '}
            <a href="/privacy" target="_blank" className="text-orange-500 underline">
              개인정보 처리방침
            </a>에 동의합니다.
          </span>
        </label>
      </div>

      {/* Deposit Info */}
      {program.depositAmount && program.depositAmount > 0 && (
        <div className="bg-orange-50 rounded-xl p-6">
          <h3 className="font-bold text-orange-700 mb-2">보증금 안내</h3>
          <p className="text-orange-600">
            보증금: {program.depositAmount.toLocaleString()}원<br />
            승인 후 안내되는 계좌로 입금해주세요.
          </p>
        </div>
      )}

      {/* Fee Info */}
      {program.feeType !== 'FREE' && program.feeAmount > 0 && !program.depositAmount && (
        <div className="bg-gray-50 rounded-xl p-4">
          <h3 className="font-medium text-gray-900 mb-2">비용 안내</h3>
          <p className="text-gray-700">{feeDisplay}</p>
          <p className="text-sm text-gray-500 mt-2">
            * 합격 시 별도 안내드리는 계좌로 입금해주세요.
          </p>
        </div>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isPending}
        className="w-full flex items-center justify-center gap-2 py-4 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Send className="w-5 h-5" />
        {isPending ? '신청 중...' : '신청하기'}
      </button>
    </form>
  )
}

// Member check alert component
function MemberCheckAlert({ check, slug }: { check: { matched: boolean; alertLevel: string | null; memberGrade: string | null }, slug: string }) {
  if (!check.matched) return null

  if (check.alertLevel === 'BLOCKED') {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-4">
        <div className="flex items-center gap-3">
          <XCircle className="w-5 h-5 text-red-500" />
          <div>
            <p className="font-medium text-red-700">신청이 제한된 회원입니다</p>
            <p className="text-sm text-red-600">
              문의: unipivot@gmail.com
            </p>
          </div>
        </div>
      </div>
    )
  }

  if (check.alertLevel === 'WARNING') {
    return (
      <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
        <div className="flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-orange-500" />
          <div>
            <p className="font-medium text-orange-700">
              이전 참여 이력이 있습니다
            </p>
            <p className="text-sm text-orange-600">
              신청은 가능하나 검토가 필요합니다.
            </p>
          </div>
        </div>
      </div>
    )
  }

  if (check.alertLevel === 'VVIP' || check.alertLevel === 'VIP') {
    return (
      <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
        <div className="flex items-center gap-3">
          <Sparkles className="w-5 h-5 text-purple-500" />
          <div>
            <p className="font-medium text-purple-700">
              {check.alertLevel === 'VVIP' ? ' VVIP' : ' VIP'} 회원이시네요!
            </p>
            <p className="text-sm text-purple-600">
              <Link href={`/login?callbackUrl=/programs/${slug}/apply`} className="underline">로그인</Link>
              하시면 정보가 자동으로 입력됩니다.
            </p>
          </div>
        </div>
      </div>
    )
  }

  if (check.matched) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-xl p-4">
        <div className="flex items-center gap-3">
          <CheckCircle className="w-5 h-5 text-green-500" />
          <div>
            <p className="font-medium text-green-700">
              기존 회원으로 확인되었습니다
            </p>
            <p className="text-sm text-green-600">
              <Link href={`/login?callbackUrl=/programs/${slug}/apply`} className="underline">로그인</Link>
              하시면 정보가 자동으로 입력됩니다.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return null
}
