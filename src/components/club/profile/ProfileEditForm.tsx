'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { updateProfile } from '@/app/club/profile/actions'
import ProfileImageUpload from './ProfileImageUpload'

interface Props {
  profile: {
    name: string | null
    image: string | null
    bio: string | null
    favoriteGenre: string | null
    isPublicProfile: boolean
  }
}

const genres = [
  { value: 'novel', label: '소설' },
  { value: 'essay', label: '에세이' },
  { value: 'selfhelp', label: '자기계발' },
  { value: 'humanities', label: '인문학' },
  { value: 'science', label: '과학' },
  { value: 'history', label: '역사' },
  { value: 'business', label: '경제/경영' },
  { value: 'art', label: '예술' },
  { value: 'other', label: '기타' },
]

export default function ProfileEditForm({ profile }: Props) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [profileImage, setProfileImage] = useState(profile.image)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    if (profileImage) {
      formData.set('profileImage', profileImage)
    }

    const result = await updateProfile(formData)

    if (result.error) {
      setError(result.error)
      setIsSubmitting(false)
    } else {
      router.push('/club/profile')
      router.refresh()
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <ProfileImageUpload currentImage={profileImage} onUpload={setProfileImage} />

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          이름 <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          name="name"
          defaultValue={profile.name || ''}
          required
          className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">자기소개</label>
        <textarea
          name="bio"
          defaultValue={profile.bio || ''}
          rows={4}
          maxLength={500}
          className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          placeholder="간단한 자기소개를 작성해주세요"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">좋아하는 장르</label>
        <select
          name="favoriteGenre"
          defaultValue={profile.favoriteGenre || ''}
          className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">선택 안함</option>
          {genres.map((genre) => (
            <option key={genre.value} value={genre.value}>
              {genre.label}
            </option>
          ))}
        </select>
      </div>

      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
        <div>
          <p className="font-medium text-gray-900">프로필 공개</p>
          <p className="text-sm text-gray-500">다른 회원이 내 프로필을 볼 수 있습니다</p>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            name="isPublicProfile"
            value="true"
            defaultChecked={profile.isPublicProfile}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-gray-200 peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:bg-blue-600 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all" />
        </label>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-800 text-sm">
          {error}
        </div>
      )}

      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => router.back()}
          className="flex-1 py-2.5 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50"
        >
          취소
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex-1 py-2.5 bg-gray-900 text-white rounded-lg hover:bg-gray-800 disabled:opacity-50"
        >
          {isSubmitting ? '저장 중...' : '저장하기'}
        </button>
      </div>
    </form>
  )
}
