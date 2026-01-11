export const dynamic = 'force-dynamic'

import type { Metadata } from 'next'
import Link from 'next/link'
import { Book, Users, Calendar, MapPin } from 'lucide-react'
import { getProgramsByType } from '@/lib/actions/public'

export const metadata: Metadata = {
  title: '독서모임',
  description: '남Book북한걸음 - 책을 통해 남북을 이해하는 독서모임',
}

function getStatusLabel(status: string) {
  switch (status) {
    case 'OPEN': return '모집중'
    case 'CLOSED': return '진행중'
    case 'COMPLETED': return '완료'
    default: return status
  }
}

export default async function BookclubPage() {
  const programs = await getProgramsByType('BOOKCLUB')

  const activeProgram = programs.find(p => p.status === 'CLOSED' || p.status === 'OPEN')
  const currentSeason = programs.length

  return (
    <>
      {/* Hero */}
      <section className="pt-32 pb-16 bg-gradient-to-b from-gray-900 to-gray-800">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <span className="text-primary text-sm font-semibold tracking-wider uppercase">Program</span>
          <h1 className="text-4xl md:text-5xl font-bold text-white mt-2 mb-4">
            남Book북한걸음
          </h1>
          <p className="text-xl text-white/80 max-w-2xl mx-auto">
            책을 통해 남북을 이해하는 독서모임
          </p>
        </div>
      </section>

      {/* Info Cards */}
      <section className="py-12 bg-white -mt-8">
        <div className="max-w-5xl mx-auto px-4">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="w-12 h-12 bg-primary-light rounded-xl flex items-center justify-center mx-auto mb-3">
                  <Calendar className="w-6 h-6 text-primary" />
                </div>
                <p className="font-bold text-gray-900">격주 1회</p>
                <p className="text-gray-500 text-sm">총 8회</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-primary-light rounded-xl flex items-center justify-center mx-auto mb-3">
                  <Users className="w-6 h-6 text-primary" />
                </div>
                <p className="font-bold text-gray-900">20-30명</p>
                <p className="text-gray-500 text-sm">정원</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-primary-light rounded-xl flex items-center justify-center mx-auto mb-3">
                  <MapPin className="w-6 h-6 text-primary" />
                </div>
                <p className="font-bold text-gray-900">{activeProgram?.isOnline ? '온라인' : '오프라인'}</p>
                <p className="text-gray-500 text-sm">{activeProgram?.isOnline ? 'Zoom' : activeProgram?.location || '장소 미정'}</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-primary-light rounded-xl flex items-center justify-center mx-auto mb-3">
                  <Book className="w-6 h-6 text-primary" />
                </div>
                <p className="font-bold text-gray-900">{currentSeason}기</p>
                <p className="text-gray-500 text-sm">{activeProgram ? getStatusLabel(activeProgram.status) : '준비중'}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Description */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">프로그램 소개</h2>
          <div className="prose prose-lg text-gray-600">
            <p>
              <strong>남Book북한걸음</strong>은 책을 매개로 남북 청년들이 함께 만나 토론하는 독서모임입니다.
            </p>
            <p>
              매 시즌마다 한반도와 관련된 다양한 주제의 책을 선정하여 읽고,
              온라인으로 만나 자유롭게 생각을 나눕니다.
            </p>
            <p>
              분단으로 인해 다른 환경에서 자란 청년들이 같은 책을 읽고
              서로의 관점을 공유하며 이해의 폭을 넓혀갑니다.
            </p>
          </div>
        </div>
      </section>

      {/* Seasons */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">시즌 목록</h2>
          {programs.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 text-center text-gray-500">
              아직 등록된 독서모임이 없습니다.
            </div>
          ) : (
            <div className="space-y-4">
              {programs.map((program, index) => (
                <Link
                  key={program.id}
                  href={`/programs/${program.id}`}
                  className="block bg-white rounded-2xl p-6 shadow-sm hover:shadow-lg transition-shadow"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-primary-light rounded-xl flex flex-col items-center justify-center">
                      <span className="text-primary font-bold text-lg">{programs.length - index}</span>
                      <span className="text-primary/70 text-xs">시즌</span>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-900">{program.title}</h3>
                      <p className="text-gray-500 text-sm">{program.description}</p>
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
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">함께 참여하세요</h2>
          <p className="text-gray-600 mb-8">다음 시즌 독서모임에 참여하고 싶으시다면 알림 신청을 해주세요</p>
          <Link
            href="/register"
            className="inline-block px-8 py-4 bg-primary hover:bg-primary-dark text-white rounded-xl font-semibold transition-colors"
          >
            참여 신청하기
          </Link>
        </div>
      </section>
    </>
  )
}
