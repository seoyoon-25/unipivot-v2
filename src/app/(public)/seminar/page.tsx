export const dynamic = 'force-dynamic'

import type { Metadata } from 'next'
import Link from 'next/link'
import { Calendar, Users, Clock, Video } from 'lucide-react'
import { getProgramsByType } from '@/lib/actions/public'

export const metadata: Metadata = {
  title: '세미나',
  description: '분단과 통일, 한반도 평화에 대한 전문가 강연과 토론',
}

function getStatusLabel(status: string) {
  switch (status) {
    case 'OPEN': return '모집중'
    case 'CLOSED': return '진행중'
    case 'COMPLETED': return '완료'
    default: return status
  }
}

export default async function SeminarPage() {
  const programs = await getProgramsByType('SEMINAR')

  return (
    <>
      <section className="pt-32 pb-16 bg-gradient-to-b from-gray-900 to-gray-800">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <span className="text-primary text-sm font-semibold tracking-wider uppercase">Program</span>
          <h1 className="text-4xl md:text-5xl font-bold text-white mt-2 mb-4">정기 세미나</h1>
          <p className="text-xl text-white/80 max-w-2xl mx-auto">
            분단과 통일, 한반도 평화에 대한 전문가 강연과 토론
          </p>
        </div>
      </section>

      <section className="py-12 bg-white -mt-8">
        <div className="max-w-5xl mx-auto px-4">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              <div>
                <div className="w-12 h-12 bg-primary-light rounded-xl flex items-center justify-center mx-auto mb-3">
                  <Calendar className="w-6 h-6 text-primary" />
                </div>
                <p className="font-bold text-gray-900">월 1회</p>
                <p className="text-gray-500 text-sm">정기 진행</p>
              </div>
              <div>
                <div className="w-12 h-12 bg-primary-light rounded-xl flex items-center justify-center mx-auto mb-3">
                  <Clock className="w-6 h-6 text-primary" />
                </div>
                <p className="font-bold text-gray-900">2시간</p>
                <p className="text-gray-500 text-sm">강연 + 토론</p>
              </div>
              <div>
                <div className="w-12 h-12 bg-primary-light rounded-xl flex items-center justify-center mx-auto mb-3">
                  <Video className="w-6 h-6 text-primary" />
                </div>
                <p className="font-bold text-gray-900">하이브리드</p>
                <p className="text-gray-500 text-sm">온/오프라인</p>
              </div>
              <div>
                <div className="w-12 h-12 bg-primary-light rounded-xl flex items-center justify-center mx-auto mb-3">
                  <Users className="w-6 h-6 text-primary" />
                </div>
                <p className="font-bold text-gray-900">50명</p>
                <p className="text-gray-500 text-sm">정원</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">프로그램 소개</h2>
          <div className="prose prose-lg text-gray-600">
            <p>유니피벗 정기 세미나는 한반도 평화와 통일에 관한 다양한 주제로 전문가 강연과 토론을 진행합니다.</p>
            <p>정치, 경제, 사회, 문화 등 다양한 분야의 전문가를 초청하여 깊이 있는 인사이트를 제공합니다.</p>
          </div>
        </div>
      </section>

      {/* Seminars List */}
      {programs.length > 0 && (
        <section className="py-16 bg-gray-50">
          <div className="max-w-4xl mx-auto px-4">
            <h2 className="text-2xl font-bold text-gray-900 mb-8">세미나 목록</h2>
            <div className="space-y-4">
              {programs.map((program) => (
                <Link
                  key={program.id}
                  href={`/programs/${program.id}`}
                  className="block bg-white rounded-2xl p-6 shadow-sm hover:shadow-lg transition-shadow"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-primary-light rounded-xl flex items-center justify-center">
                      <Calendar className="w-6 h-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-900">{program.title}</h3>
                      <p className="text-gray-500 text-sm">{program.description}</p>
                      {program.startDate && (
                        <p className="text-gray-400 text-sm mt-1">
                          {new Date(program.startDate).toLocaleDateString('ko-KR')}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        program.status === 'CLOSED' ? 'bg-green-100 text-green-600' :
                        program.status === 'OPEN' ? 'bg-blue-100 text-blue-600' :
                        'bg-gray-100 text-gray-600'
                      }`}>
                        {getStatusLabel(program.status)}
                      </span>
                      <p className="text-gray-400 text-sm mt-1">{program._count.registrations}명 참여</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">다음 세미나 알림 받기</h2>
          <p className="text-gray-600 mb-8">세미나 일정이 공지되면 알림을 받으세요</p>
          <Link href="/register" className="inline-block px-8 py-4 bg-primary hover:bg-primary-dark text-white rounded-xl font-semibold transition-colors">
            알림 신청하기
          </Link>
        </div>
      </section>
    </>
  )
}
