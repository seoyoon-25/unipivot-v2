export const dynamic = 'force-dynamic'

import type { Metadata } from 'next'
import { Lightbulb } from 'lucide-react'

export const metadata: Metadata = {
  title: '제안하기',
  description: '유니피벗에 새로운 아이디어를 제안해주세요',
}

export default function SuggestPage() {
  return (
    <>
      <section className="pt-32 pb-16 bg-gradient-to-b from-gray-900 to-gray-800">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <span className="text-primary text-sm font-semibold tracking-wider uppercase">Suggestion</span>
          <h1 className="text-4xl md:text-5xl font-bold text-white mt-2 mb-4">제안하기</h1>
          <p className="text-xl text-white/80 max-w-2xl mx-auto">
            유니피벗에 새로운 아이디어를 제안해주세요
          </p>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-2xl mx-auto px-4">
          <div className="bg-primary-light rounded-2xl p-8 mb-8 text-center">
            <Lightbulb className="w-12 h-12 text-primary mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-900 mb-2">여러분의 아이디어가 필요합니다</h2>
            <p className="text-gray-600">새로운 프로그램, 활동, 협력 아이디어 등 무엇이든 제안해주세요</p>
          </div>

          <form className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">제안 유형</label>
              <select className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary">
                <option>프로그램 제안</option>
                <option>활동 제안</option>
                <option>협력 제안</option>
                <option>기타</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">제목</label>
              <input type="text" className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" placeholder="제안 제목을 입력하세요" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">내용</label>
              <textarea rows={6} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" placeholder="제안 내용을 상세히 작성해주세요" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">연락처 (선택)</label>
              <input type="email" className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" placeholder="회신 받으실 이메일" />
            </div>
            <button type="submit" className="w-full py-4 bg-primary hover:bg-primary-dark text-white rounded-xl font-semibold transition-colors">
              제안하기
            </button>
          </form>
        </div>
      </section>
    </>
  )
}
