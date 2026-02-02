import Image from 'next/image'
import { Mail } from 'lucide-react'

interface Props {
  member: {
    id: string
    name: string | null
    email: string
    image: string | null
    role: string
  }
}

const roleLabels: Record<string, string> = {
  USER: '회원',
  ADMIN: '관리자',
  SUPER_ADMIN: '최고관리자',
  FACILITATOR: '진행자',
}

export default function MobileMemberCard({ member }: Props) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden flex-shrink-0">
          {member.image ? (
            <Image
              src={member.image}
              alt={member.name || ''}
              width={40}
              height={40}
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm font-medium">
              {(member.name || '?')[0]}
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-gray-900 truncate">{member.name || '이름 없음'}</p>
          <p className="text-sm text-gray-500 truncate flex items-center gap-1">
            <Mail className="w-3.5 h-3.5" />
            {member.email}
          </p>
        </div>
        <span className="px-2 py-0.5 text-xs rounded-full bg-gray-100 text-gray-600">
          {roleLabels[member.role] || member.role}
        </span>
      </div>
    </div>
  )
}
