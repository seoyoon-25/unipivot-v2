export const dynamic = 'force-dynamic'

import type { Metadata } from 'next'
import { Mic, Building2, Users } from 'lucide-react'

export const metadata: Metadata = {
  title: '강연요청',
  description: '유니피벗에 강연/협력을 요청하세요',
}

export default function RequestPage() {
  return (
    <>
      <section className="pt-32 pb-16 bg-gradient-to-b from-gray-900 to-gray-800">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <span className="text-primary text-sm font-semibold tracking-wider uppercase">Request</span>
          <h1 className="text-4xl md:text-5xl font-bold text-white mt-2 mb-4">강연요청</h1>
          <p className="text-xl text-white/80 max-w-2xl mx-auto">유니피벗에 강연 및 협력을 요청하세요</p>
        </div>
      </section>

      <section className="py-12 bg-white -mt-8">
        <div className="max-w-5xl mx-auto px-4">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="grid md:grid-cols-3 gap-8 text-center">
              <div>
                <div className="w-12 h-12 bg-primary-light rounded-xl flex items-center justify-center mx-auto mb-3">
                  <Mic className="w-6 h-6 text-primary" />
                </div>
                <p className="font-bold text-gray-900">강연</p>
                <p className="text-gray-500 text-sm">통일/한반도 관련 강연</p>
              </div>
              <div>
                <div className="w-12 h-12 bg-primary-light rounded-xl flex items-center justify-center mx-auto mb-3">
                  <Building2 className="w-6 h-6 text-primary" />
                </div>
                <p className="font-bold text-gray-900">협력</p>
                <p className="text-gray-500 text-sm">기관/단체 협력 프로젝트</p>
              </div>
              <div>
                <div className="w-12 h-12 bg-primary-light rounded-xl flex items-center justify-center mx-auto mb-3">
                  <Users className="w-6 h-6 text-primary" />
                </div>
                <p className="font-bold text-gray-900">워크숍</p>
                <p className="text-gray-500 text-sm">맞춤형 교육 프로그램</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-2xl mx-auto px-4">
          <form className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">요청 유형</label>
              <select className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary">
                <option>강연 요청</option>
                <option>협력 요청</option>
                <option>워크숍 요청</option>
                <option>기타</option>
              </select>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">기관/단체명</label>
                <input type="text" className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" placeholder="기관명" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">담당자명</label>
                <input type="text" className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" placeholder="담당자명" />
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">이메일</label>
                <input type="email" className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" placeholder="email@example.com" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">연락처</label>
                <input type="tel" className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" placeholder="010-0000-0000" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">희망 일시</label>
              <input type="text" className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" placeholder="2024년 3월 중 (협의 가능)" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">상세 내용</label>
              <textarea rows={6} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" placeholder="요청 내용을 상세히 작성해주세요" />
            </div>
            <button type="submit" className="w-full py-4 bg-primary hover:bg-primary-dark text-white rounded-xl font-semibold transition-colors">
              요청하기
            </button>
          </form>
        </div>
      </section>
    </>
  )
}
