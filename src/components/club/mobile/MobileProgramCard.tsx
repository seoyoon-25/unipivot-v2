import Link from 'next/link'
import { format } from 'date-fns'
import { ko } from 'date-fns/locale'
import { Users, Calendar } from 'lucide-react'

interface Props {
  program: {
    id: string
    title: string
    type: string
    status: string
    startDate?: Date | string | null
    participantCount: number
  }
  onDelete?: (id: string) => void
}

const typeLabels: Record<string, string> = {
  BOOKCLUB: '독서모임',
  SEMINAR: '강연',
  DEBATE: '토론회',
}

const statusLabels: Record<string, string> = {
  RECRUITING: '모집중',
  ONGOING: '진행중',
  COMPLETED: '완료',
}

const statusColors: Record<string, string> = {
  RECRUITING: 'bg-green-100 text-green-700',
  ONGOING: 'bg-blue-100 text-blue-700',
  COMPLETED: 'bg-gray-100 text-gray-700',
}

export default function MobileProgramCard({ program, onDelete }: Props) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500">
            {typeLabels[program.type] || program.type}
          </span>
          <span
            className={`px-2 py-0.5 text-xs rounded-full ${statusColors[program.status] || 'bg-gray-100 text-gray-700'}`}
          >
            {statusLabels[program.status] || program.status}
          </span>
        </div>
      </div>

      <Link href={`/club/programs/${program.id}`}>
        <h3 className="font-medium text-gray-900 mb-2">{program.title}</h3>
      </Link>

      <div className="flex items-center gap-4 text-sm text-gray-500">
        <span className="flex items-center gap-1">
          <Users className="w-4 h-4" />
          {program.participantCount}명
        </span>
        {program.startDate && (
          <span className="flex items-center gap-1">
            <Calendar className="w-4 h-4" />
            {format(new Date(program.startDate), 'M.d', { locale: ko })}
          </span>
        )}
      </div>

      {onDelete && (
        <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-100">
          <Link
            href={`/club/admin/programs/${program.id}/edit`}
            className="flex-1 py-2 text-center text-sm text-blue-600 hover:bg-blue-50 rounded-lg"
          >
            수정
          </Link>
          <button
            onClick={() => onDelete(program.id)}
            className="flex-1 py-2 text-center text-sm text-red-600 hover:bg-red-50 rounded-lg"
          >
            삭제
          </button>
        </div>
      )}
    </div>
  )
}
