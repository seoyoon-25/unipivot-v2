import type { Metadata } from 'next'
import { MessageCircle, Sparkles } from 'lucide-react'

export const metadata: Metadata = {
  title: '한반도이슈',
  description: 'AI 피봇이와 함께 한반도 이슈를 탐구합니다',
}

const topics = [
  '남북 관계의 역사',
  '통일 비용과 편익',
  '북한 경제 현황',
  '이산가족 문제',
  '남북 문화 교류',
  '청년이 바라보는 통일',
]

export default function KoreaIssuePage() {
  return (
    <>
      <section className="pt-32 pb-16 bg-gradient-to-b from-gray-900 to-gray-800">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <span className="text-primary text-sm font-semibold tracking-wider uppercase">Korea Issue</span>
          <h1 className="text-4xl md:text-5xl font-bold text-white mt-2 mb-4">한반도이슈</h1>
          <p className="text-xl text-white/80 max-w-2xl mx-auto">
            AI 피봇이와 함께 한반도 이슈를 탐구합니다
          </p>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4">
          {/* AI Chat Interface */}
          <div className="bg-gray-50 rounded-2xl p-8 mb-12">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-14 h-14 bg-primary rounded-2xl flex items-center justify-center">
                <Sparkles className="w-7 h-7 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">피봇이</h2>
                <p className="text-gray-500">한반도 이슈 AI 챗봇</p>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 mb-4">
              <p className="text-gray-700">
                안녕하세요! 저는 한반도 이슈에 대해 함께 이야기를 나눌 수 있는 AI 피봇이입니다.
                통일, 남북관계, 북한 사회 등 궁금한 점을 물어보세요!
              </p>
            </div>

            <div className="flex gap-3">
              <input
                type="text"
                placeholder="한반도 이슈에 대해 물어보세요..."
                className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
              <button className="px-6 py-3 bg-primary hover:bg-primary-dark text-white rounded-xl font-semibold transition-colors">
                <MessageCircle className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Suggested Topics */}
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-4">추천 주제</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {topics.map((topic) => (
                <button
                  key={topic}
                  className="px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-700 hover:border-primary hover:text-primary transition-colors text-sm"
                >
                  {topic}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
