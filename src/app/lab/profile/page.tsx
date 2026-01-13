'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { User, Mail, Calendar, MapPin, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react'
import { LabProfileForm } from '@/components/lab/LabProfileForm'
import { LabBadgeList } from '@/components/lab/LabBadge'

interface LabProfileData {
  id: string
  profileComplete: boolean
  birthYear?: number
  birthRegion?: string
  hometown?: string
  leftHometownYear?: number
  enteredKoreaYear?: number
  maritalStatus?: string
  educationHometown?: string
  educationKorea?: string
  occupations?: string[]
  surveyCount: number
  interviewCount: number
  lectureCount: number
  badges?: {
    expert?: { earned: boolean }
    instructor?: { earned: boolean; matchCount: number }
    participant?: { earned: boolean; surveyCount: number; interviewCount: number }
  }
  user: {
    id: string
    name?: string
    email?: string
    origin?: string
    originCategory?: string
    birthYear?: number
  }
}

export default function LabProfilePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [profile, setProfile] = useState<LabProfileData | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login?callbackUrl=/lab/profile')
      return
    }

    if (status === 'authenticated') {
      fetchProfile()
    }
  }, [status, router])

  const fetchProfile = async () => {
    try {
      const res = await fetch('/api/lab/profile')
      const data = await res.json()
      if (data.error) {
        setError(data.error)
      } else {
        setProfile(data)
      }
    } catch (err) {
      setError('프로필을 불러오는 중 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (formData: any) => {
    setSaving(true)
    setSaved(false)
    setError('')

    try {
      const res = await fetch('/api/lab/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
      const data = await res.json()
      if (data.error) {
        throw new Error(data.error)
      }
      setProfile(data)
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (err) {
      throw err
    } finally {
      setSaving(false)
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </div>
    )
  }

  if (error && !profile) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-red-700 mb-2">오류가 발생했습니다</h2>
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">리서치랩 프로필</h1>
        <p className="text-gray-600">
          설문 및 인터뷰 참여를 위한 프로필 정보를 관리합니다.
        </p>
      </div>

      {/* Profile Status Card */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6">
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
            <User className="w-8 h-8 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-1">
              <h2 className="text-lg font-semibold text-gray-900">
                {session?.user?.name || '사용자'}
              </h2>
              {profile?.badges && (
                <LabBadgeList badges={profile.badges} size="sm" />
              )}
            </div>
            <div className="flex items-center gap-2 text-gray-500 text-sm mb-3">
              <Mail className="w-4 h-4" />
              {session?.user?.email}
            </div>

            {/* Profile Complete Status */}
            <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm ${
              profile?.profileComplete
                ? 'bg-green-50 text-green-700'
                : 'bg-orange-50 text-orange-700'
            }`}>
              {profile?.profileComplete ? (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  프로필 완성
                </>
              ) : (
                <>
                  <AlertCircle className="w-4 h-4" />
                  프로필 미완성 - 설문/인터뷰 참여를 위해 프로필을 완성해주세요
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Activity Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-gray-100 p-4 text-center">
          <p className="text-2xl font-bold text-primary">{profile?.surveyCount || 0}</p>
          <p className="text-sm text-gray-500">설문 참여</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4 text-center">
          <p className="text-2xl font-bold text-primary">{profile?.interviewCount || 0}</p>
          <p className="text-sm text-gray-500">인터뷰 참여</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4 text-center">
          <p className="text-2xl font-bold text-primary">{profile?.lectureCount || 0}</p>
          <p className="text-sm text-gray-500">강연 진행</p>
        </div>
      </div>

      {/* Badges */}
      {profile?.badges && (
        <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">획득한 뱃지</h3>
          <LabBadgeList badges={profile.badges} size="md" showLabels />
          {!profile.badges.expert?.earned && !profile.badges.instructor?.earned && !profile.badges.participant?.earned && (
            <p className="text-gray-500 text-sm">
              아직 획득한 뱃지가 없습니다. 설문/인터뷰에 참여하거나 전문가로 등록하면 뱃지를 받을 수 있습니다.
            </p>
          )}
        </div>
      )}

      {/* Saved Notification */}
      {saved && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-green-600" />
          <p className="text-green-700">프로필이 저장되었습니다.</p>
        </div>
      )}

      {/* Profile Form */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">참가자 정보</h3>

        {profile && (
          <LabProfileForm
            initialData={{
              birthYear: profile.birthYear,
              birthRegion: profile.birthRegion,
              hometown: profile.hometown,
              leftHometownYear: profile.leftHometownYear,
              enteredKoreaYear: profile.enteredKoreaYear,
              maritalStatus: profile.maritalStatus,
              educationHometown: profile.educationHometown,
              educationKorea: profile.educationKorea,
              occupations: profile.occupations,
            }}
            onSubmit={handleSubmit}
            submitLabel={saving ? '저장 중...' : '프로필 저장'}
          />
        )}
      </div>

      {/* Info Box */}
      <div className="mt-6 p-4 bg-blue-50 rounded-xl">
        <h4 className="font-medium text-blue-900 mb-2">프로필 정보 안내</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>* 입력하신 정보는 설문/인터뷰 참가 자격 확인에 사용됩니다.</li>
          <li>* 프로필을 완성해야 설문 및 인터뷰에 참여할 수 있습니다.</li>
          <li>* 개인정보는 연구 목적 외에는 사용되지 않습니다.</li>
        </ul>
      </div>
    </div>
  )
}
