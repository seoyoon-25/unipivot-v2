import Image from 'next/image'
import { format } from 'date-fns'
import { ko } from 'date-fns/locale'

interface Props {
  profile: {
    name: string | null
    email: string
    image: string | null
    bio: string | null
    favoriteGenre: string | null
    createdAt: Date
  }
  showEmail?: boolean
}

const genreLabels: Record<string, string> = {
  novel: '소설',
  essay: '에세이',
  selfhelp: '자기계발',
  humanities: '인문학',
  science: '과학',
  history: '역사',
  business: '경제/경영',
  art: '예술',
  other: '기타',
}

export default function ProfileHeader({ profile, showEmail = true }: Props) {
  return (
    <div className="flex items-start gap-6">
      {profile.image ? (
        <Image
          src={profile.image}
          alt={profile.name || '프로필'}
          width={96}
          height={96}
          className="w-24 h-24 rounded-full object-cover shrink-0"
        />
      ) : (
        <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center text-3xl text-gray-400 shrink-0">
          {profile.name?.[0] || '?'}
        </div>
      )}

      <div className="flex-1 min-w-0">
        <h1 className="text-2xl font-bold text-gray-900">
          {profile.name || '(이름 없음)'}
        </h1>

        {showEmail && <p className="text-gray-500 mt-1">{profile.email}</p>}

        {profile.bio && <p className="text-gray-700 mt-3">{profile.bio}</p>}

        <div className="flex items-center gap-3 mt-3">
          {profile.favoriteGenre && (
            <span className="px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-full">
              {genreLabels[profile.favoriteGenre] || profile.favoriteGenre}
            </span>
          )}
          <span className="text-sm text-gray-400">
            {format(new Date(profile.createdAt), 'yyyy년 M월', { locale: ko })} 가입
          </span>
        </div>
      </div>
    </div>
  )
}
