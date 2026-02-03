import Link from 'next/link'
import Image from 'next/image'
import FollowButton from './FollowButton'

interface UserCardProps {
  user: {
    id: string
    name: string | null
    image: string | null
    bio: string | null
    reason?: string
  }
  isFollowing: boolean
  showFollowButton?: boolean
  currentUserId?: string
}

export default function UserCard({
  user,
  isFollowing,
  showFollowButton = true,
  currentUserId,
}: UserCardProps) {
  const isMe = currentUserId === user.id

  return (
    <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200">
      <Link href={`/club/profile/${user.id}`} className="shrink-0">
        {user.image ? (
          <Image
            src={user.image}
            alt={user.name || '프로필'}
            width={44}
            height={44}
            className="w-11 h-11 rounded-full object-cover"
          />
        ) : (
          <div className="w-11 h-11 rounded-full bg-gray-200 flex items-center justify-center text-lg text-gray-400">
            {user.name?.[0] || '?'}
          </div>
        )}
      </Link>
      <div className="flex-1 min-w-0">
        <Link
          href={`/club/profile/${user.id}`}
          className="text-sm font-medium text-gray-900 hover:text-blue-600 truncate block"
        >
          {user.name || '(이름 없음)'}
        </Link>
        {user.bio && (
          <p className="text-xs text-gray-500 truncate">{user.bio}</p>
        )}
        {user.reason && (
          <p className="text-xs text-blue-500">{user.reason}</p>
        )}
      </div>
      {showFollowButton && !isMe && (
        <FollowButton userId={user.id} initialFollowing={isFollowing} />
      )}
    </div>
  )
}
