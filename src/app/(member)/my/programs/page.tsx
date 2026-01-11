import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Calendar, MapPin, Users, Monitor } from 'lucide-react'
import { getUserPrograms } from '@/lib/actions/public'

function getStatusLabel(status: string) {
  switch (status) {
    case 'OPEN': return '모집중'
    case 'CLOSED': return '진행중'
    case 'COMPLETED': return '완료'
    default: return status
  }
}

function getRegStatusLabel(status: string) {
  switch (status) {
    case 'APPROVED': return '승인됨'
    case 'PENDING': return '대기중'
    case 'REJECTED': return '거절됨'
    case 'CANCELLED': return '취소됨'
    default: return status
  }
}

export default async function ProgramsPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    redirect('/login')
  }

  const registrations = await getUserPrograms(session.user.id)

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-8">참여 프로그램</h1>

      {registrations.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center">
          <p className="text-gray-500 mb-4">참여한 프로그램이 없습니다.</p>
          <Link
            href="/bookclub"
            className="inline-block px-6 py-3 bg-primary text-white rounded-xl hover:bg-primary-dark transition-colors"
          >
            프로그램 둘러보기
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {registrations.map((reg) => (
            <Link
              key={reg.id}
              href={`/programs/${reg.program.id}`}
              className="block bg-white rounded-2xl p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                      reg.program.status === 'CLOSED' ? 'bg-green-100 text-green-600' :
                      reg.program.status === 'OPEN' ? 'bg-blue-100 text-blue-600' :
                      'bg-gray-100 text-gray-600'
                    }`}>
                      {getStatusLabel(reg.program.status)}
                    </span>
                    <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                      reg.status === 'APPROVED' ? 'bg-green-100 text-green-600' :
                      reg.status === 'PENDING' ? 'bg-yellow-100 text-yellow-600' :
                      'bg-gray-100 text-gray-600'
                    }`}>
                      {getRegStatusLabel(reg.status)}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">{reg.program.title}</h3>
                  <p className="text-gray-500 text-sm">{reg.program.type}</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-primary">
                    {reg.program._count.registrations}/{reg.program.capacity}
                  </p>
                  <p className="text-gray-400 text-sm">참가자</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                {reg.program.startDate && (
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {new Date(reg.program.startDate).toLocaleDateString('ko-KR')}
                    {reg.program.endDate && ` ~ ${new Date(reg.program.endDate).toLocaleDateString('ko-KR')}`}
                  </div>
                )}
                <div className="flex items-center gap-1">
                  {reg.program.isOnline ? (
                    <>
                      <Monitor className="w-4 h-4" />
                      온라인
                    </>
                  ) : (
                    <>
                      <MapPin className="w-4 h-4" />
                      {reg.program.location || '오프라인'}
                    </>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  정원 {reg.program.capacity}명
                </div>
              </div>

              {reg.program.status === 'CLOSED' && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">참가율</span>
                    <span className="text-primary font-medium">
                      {Math.round((reg.program._count.registrations / reg.program.capacity) * 100)}%
                    </span>
                  </div>
                  <div className="mt-2 h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full"
                      style={{ width: `${Math.min(100, (reg.program._count.registrations / reg.program.capacity) * 100)}%` }}
                    />
                  </div>
                </div>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
