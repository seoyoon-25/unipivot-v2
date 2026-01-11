export const dynamic = 'force-dynamic'

import type { Metadata } from 'next'
import Link from 'next/link'
import { MapPin, Calendar, Users, Bus } from 'lucide-react'
import { getProgramsByType } from '@/lib/actions/public'

export const metadata: Metadata = {
  title: 'K-Move',
  description: '한반도 관련 역사적 장소를 탐방하며 현장에서 배우는 체험 프로그램',
}

function getStatusLabel(status: string) {
  switch (status) {
    case 'OPEN': return '모집중'
    case 'CLOSED': return '진행중'
    case 'COMPLETED': return '완료'
    default: return status
  }
}

export default async function KmovePage() {
  const programs = await getProgramsByType('KMOVE')

  return (
    <>
      <section className="pt-32 pb-16 bg-gradient-to-b from-gray-900 to-gray-800">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <span className="text-primary text-sm font-semibold tracking-wider uppercase">Program</span>
          <h1 className="text-4xl md:text-5xl font-bold text-white mt-2 mb-4">K-Move</h1>
          <p className="text-xl text-white/80 max-w-2xl mx-auto">
            한반도 관련 역사적 장소를 탐방하며 현장에서 배우는 체험 프로그램
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
                <p className="font-bold text-gray-900">분기 1회</p>
                <p className="text-gray-500 text-sm">정기 진행</p>
              </div>
              <div>
                <div className="w-12 h-12 bg-primary-light rounded-xl flex items-center justify-center mx-auto mb-3">
                  <Bus className="w-6 h-6 text-primary" />
                </div>
                <p className="font-bold text-gray-900">당일/1박</p>
                <p className="text-gray-500 text-sm">일정</p>
              </div>
              <div>
                <div className="w-12 h-12 bg-primary-light rounded-xl flex items-center justify-center mx-auto mb-3">
                  <MapPin className="w-6 h-6 text-primary" />
                </div>
                <p className="font-bold text-gray-900">오프라인</p>
                <p className="text-gray-500 text-sm">현장 탐방</p>
              </div>
              <div>
                <div className="w-12 h-12 bg-primary-light rounded-xl flex items-center justify-center mx-auto mb-3">
                  <Users className="w-6 h-6 text-primary" />
                </div>
                <p className="font-bold text-gray-900">20명</p>
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
            <p>K-Move는 한반도의 분단 역사와 평화의 현장을 직접 탐방하는 체험 프로그램입니다.</p>
            <p>DMZ, 접경지역, 근현대사 관련 장소 등을 방문하여 역사를 현장에서 배웁니다.</p>
            <p>전문 해설과 함께 남북의 청년들이 같은 장소에서 서로 다른 관점을 나눕니다.</p>
          </div>
        </div>
      </section>

      {/* K-Move List */}
      {programs.length > 0 && (
        <section className="py-16 bg-gray-50">
          <div className="max-w-4xl mx-auto px-4">
            <h2 className="text-2xl font-bold text-gray-900 mb-8">탐방 프로그램</h2>
            <div className="space-y-4">
              {programs.map((program) => (
                <Link
                  key={program.id}
                  href={`/programs/${program.id}`}
                  className="block bg-white rounded-2xl p-6 shadow-sm hover:shadow-lg transition-shadow"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-primary-light rounded-xl flex items-center justify-center">
                      <MapPin className="w-6 h-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-900">{program.title}</h3>
                      <p className="text-gray-500 text-sm">{program.description}</p>
                      <div className="flex items-center gap-4 mt-2 text-sm text-gray-400">
                        {program.startDate && (
                          <span>{new Date(program.startDate).toLocaleDateString('ko-KR')}</span>
                        )}
                        {program.location && (
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {program.location}
                          </span>
                        )}
                      </div>
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
          <h2 className="text-2xl font-bold text-gray-900 mb-4">다음 탐방 알림 받기</h2>
          <p className="text-gray-600 mb-8">K-Move 일정이 공지되면 알림을 받으세요</p>
          <Link href="/register" className="inline-block px-8 py-4 bg-primary hover:bg-primary-dark text-white rounded-xl font-semibold transition-colors">
            알림 신청하기
          </Link>
        </div>
      </section>
    </>
  )
}
