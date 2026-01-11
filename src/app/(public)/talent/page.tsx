import type { Metadata } from 'next'
import Link from 'next/link'
import { Palette, Code, Languages, Megaphone, Camera, PenTool } from 'lucide-react'

export const metadata: Metadata = {
  title: '재능나눔',
  description: '재능으로 한반도 평화에 기여하세요',
}

const categories = [
  { name: '디자인', icon: Palette, count: 12 },
  { name: '개발', icon: Code, count: 8 },
  { name: '번역', icon: Languages, count: 15 },
  { name: '마케팅', icon: Megaphone, count: 6 },
  { name: '영상', icon: Camera, count: 9 },
  { name: '콘텐츠', icon: PenTool, count: 11 },
]

export default function TalentPage() {
  return (
    <>
      <section className="pt-32 pb-16 bg-gradient-to-b from-gray-900 to-gray-800">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <span className="text-primary text-sm font-semibold tracking-wider uppercase">Talent</span>
          <h1 className="text-4xl md:text-5xl font-bold text-white mt-2 mb-4">재능나눔</h1>
          <p className="text-xl text-white/80 max-w-2xl mx-auto">재능으로 한반도 평화에 기여하세요</p>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">재능 카테고리</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map((category) => (
              <div key={category.name} className="bg-white rounded-2xl p-6 text-center border border-gray-100 hover:border-primary/20 hover:shadow-lg transition-all cursor-pointer">
                <div className="w-12 h-12 bg-primary-light rounded-xl flex items-center justify-center mx-auto mb-3">
                  <category.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-bold text-gray-900">{category.name}</h3>
                <p className="text-gray-400 text-sm">{category.count}명 참여</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-white rounded-2xl p-8 shadow-sm">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">재능기부 신청</h2>
            <form className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">이름</label>
                  <input type="text" className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" placeholder="이름" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">이메일</label>
                  <input type="email" className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" placeholder="email@example.com" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">재능 분야</label>
                <select className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary">
                  <option>디자인</option>
                  <option>개발</option>
                  <option>번역</option>
                  <option>마케팅</option>
                  <option>영상</option>
                  <option>콘텐츠</option>
                  <option>기타</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">재능 소개</label>
                <textarea rows={4} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" placeholder="보유하신 재능을 소개해주세요" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">포트폴리오 (선택)</label>
                <input type="url" className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" placeholder="https://" />
              </div>
              <button type="submit" className="w-full py-4 bg-primary hover:bg-primary-dark text-white rounded-xl font-semibold transition-colors">
                신청하기
              </button>
            </form>
          </div>
        </div>
      </section>
    </>
  )
}
