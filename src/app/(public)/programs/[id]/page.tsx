import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Calendar, MapPin, Users, Monitor, Clock, BookOpen } from 'lucide-react'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getProgramById } from '@/lib/actions/public'
import RegisterButton from './RegisterButton'

interface Props {
  params: { id: string }
}

function getStatusLabel(status: string) {
  switch (status) {
    case 'OPEN': return '모집중'
    case 'CLOSED': return '진행중'
    case 'COMPLETED': return '완료'
    default: return status
  }
}

function getTypeLabel(type: string) {
  switch (type) {
    case 'BOOKCLUB': return '독서모임'
    case 'SEMINAR': return '세미나'
    case 'WORKSHOP': return '워크샵'
    case 'KMOVE': return 'K-Move'
    default: return type
  }
}

function getTypeHref(type: string) {
  switch (type) {
    case 'BOOKCLUB': return '/bookclub'
    case 'SEMINAR': return '/seminar'
    case 'KMOVE': return '/kmove'
    default: return '/'
  }
}

export default async function ProgramDetailPage({ params }: Props) {
  const [program, session] = await Promise.all([
    getProgramById(params.id),
    getServerSession(authOptions)
  ])

  if (!program) {
    notFound()
  }

  const participantCount = program._count.registrations
  const isFull = participantCount >= program.capacity

  return (
    <>
      <section className="pt-32 pb-8 bg-gradient-to-b from-gray-900 to-gray-800">
        <div className="max-w-4xl mx-auto px-4">
          <Link
            href={getTypeHref(program.type)}
            className="inline-flex items-center gap-2 text-white/60 hover:text-white transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            {getTypeLabel(program.type)} 목록
          </Link>

          <div className="flex items-center gap-3 mb-4">
            <span className={`px-3 py-1 text-sm font-medium rounded-full ${
              program.status === 'OPEN' ? 'bg-blue-500 text-white' :
              program.status === 'CLOSED' ? 'bg-green-500 text-white' :
              'bg-gray-500 text-white'
            }`}>
              {getStatusLabel(program.status)}
            </span>
            <span className="px-3 py-1 text-sm font-medium rounded-full bg-white/20 text-white">
              {getTypeLabel(program.type)}
            </span>
          </div>

          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
            {program.title}
          </h1>

          {program.description && (
            <p className="text-xl text-white/80">{program.description}</p>
          )}
        </div>
      </section>

      <section className="py-12 bg-white">
        <div className="max-w-4xl mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="md:col-span-2">
              {/* Program Info */}
              <div className="bg-gray-50 rounded-2xl p-6 mb-8">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {program.startDate && (
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary-light rounded-xl flex items-center justify-center">
                        <Calendar className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">일정</p>
                        <p className="font-medium text-gray-900 text-sm">
                          {new Date(program.startDate).toLocaleDateString('ko-KR', { month: 'long', day: 'numeric' })}
                          {program.endDate && ` ~ ${new Date(program.endDate).toLocaleDateString('ko-KR', { month: 'long', day: 'numeric' })}`}
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary-light rounded-xl flex items-center justify-center">
                      {program.isOnline ? (
                        <Monitor className="w-5 h-5 text-primary" />
                      ) : (
                        <MapPin className="w-5 h-5 text-primary" />
                      )}
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">장소</p>
                      <p className="font-medium text-gray-900 text-sm">
                        {program.isOnline ? '온라인' : (program.location || '오프라인')}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary-light rounded-xl flex items-center justify-center">
                      <Users className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">정원</p>
                      <p className="font-medium text-gray-900 text-sm">
                        {participantCount}/{program.capacity}명
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary-light rounded-xl flex items-center justify-center">
                      <Clock className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">참가비</p>
                      <p className="font-medium text-gray-900 text-sm">
                        {program.fee > 0 ? `${program.fee.toLocaleString()}원` : '무료'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Content */}
              {program.content && (
                <div className="mb-8">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">프로그램 소개</h2>
                  <div className="prose prose-lg max-w-none">
                    {program.content.split('\n').map((line, i) => (
                      <p key={i}>{line || <br />}</p>
                    ))}
                  </div>
                </div>
              )}

              {/* Sessions */}
              {program.sessions && program.sessions.length > 0 && (
                <div className="mb-8">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">세션 일정</h2>
                  <div className="space-y-3">
                    {program.sessions.map((session, index) => (
                      <div key={session.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                        <div className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center font-bold text-sm">
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{session.title}</p>
                          <p className="text-sm text-gray-500">
                            {new Date(session.date).toLocaleDateString('ko-KR', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                              weekday: 'short'
                            })}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Books */}
              {program.books && program.books.length > 0 && (
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-4">관련 도서</h2>
                  <div className="space-y-3">
                    {program.books.map((pb) => (
                      <div key={pb.book.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                        <div className="w-10 h-10 bg-primary-light rounded-lg flex items-center justify-center">
                          <BookOpen className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{pb.book.title}</p>
                          <p className="text-sm text-gray-500">{pb.book.author}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="md:col-span-1">
              <div className="sticky top-24 bg-white border border-gray-100 rounded-2xl p-6 shadow-lg">
                <h3 className="font-bold text-gray-900 mb-4">참가 현황</h3>

                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-500">현재 참가자</span>
                    <span className="font-bold text-primary">{participantCount}/{program.capacity}명</span>
                  </div>
                  <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${isFull ? 'bg-red-500' : 'bg-primary'}`}
                      style={{ width: `${Math.min(100, (participantCount / program.capacity) * 100)}%` }}
                    />
                  </div>
                  {isFull && (
                    <p className="text-red-500 text-sm mt-2">정원이 마감되었습니다</p>
                  )}
                </div>

                {program.fee > 0 && (
                  <div className="py-4 border-t border-gray-100">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-500">참가비</span>
                      <span className="text-2xl font-bold text-gray-900">{program.fee.toLocaleString()}원</span>
                    </div>
                  </div>
                )}

                <div className="pt-4 border-t border-gray-100">
                  <RegisterButton
                    programId={program.id}
                    programStatus={program.status}
                    isFull={isFull}
                    isLoggedIn={!!session?.user}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
