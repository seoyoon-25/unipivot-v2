import type { Metadata } from 'next'
import { Mail, Briefcase } from 'lucide-react'

export const metadata: Metadata = {
  title: '전문가 풀',
  description: '유니피벗과 함께하는 분야별 전문가',
}

const experts = [
  { name: '김통일', title: '통일연구원 선임연구위원', field: '통일정책', image: null },
  { name: '이평화', title: '북한대학원대학교 교수', field: '북한학', image: null },
  { name: '박한반', title: '국립외교원 교수', field: '국제관계', image: null },
  { name: '최미래', title: '한반도평화연구소 소장', field: '평화학', image: null },
  { name: '정청년', title: '통일부 정책자문위원', field: '청년정책', image: null },
  { name: '한교류', title: '남북교류협력지원협회 이사', field: '남북교류', image: null },
]

export default function ExpertsPage() {
  return (
    <>
      <section className="pt-32 pb-16 bg-gradient-to-b from-gray-900 to-gray-800">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <span className="text-primary text-sm font-semibold tracking-wider uppercase">Experts</span>
          <h1 className="text-4xl md:text-5xl font-bold text-white mt-2 mb-4">전문가 풀</h1>
          <p className="text-xl text-white/80 max-w-2xl mx-auto">유니피벗과 함께하는 분야별 전문가</p>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {experts.map((expert) => (
              <div key={expert.name} className="bg-white rounded-2xl p-6 border border-gray-100 hover:border-primary/20 hover:shadow-lg transition-all">
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-primary to-primary-dark rounded-2xl flex items-center justify-center text-white font-bold text-xl">
                    {expert.name[0]}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900">{expert.name}</h3>
                    <p className="text-gray-500 text-sm">{expert.title}</p>
                    <span className="inline-block mt-2 px-2 py-1 bg-primary-light text-primary text-xs font-medium rounded">
                      {expert.field}
                    </span>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-100 flex gap-2">
                  <button className="flex-1 flex items-center justify-center gap-2 py-2 text-sm text-gray-600 hover:text-primary transition-colors">
                    <Briefcase className="w-4 h-4" />
                    프로필
                  </button>
                  <button className="flex-1 flex items-center justify-center gap-2 py-2 text-sm text-gray-600 hover:text-primary transition-colors">
                    <Mail className="w-4 h-4" />
                    연락
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">전문가로 참여하기</h2>
          <p className="text-gray-600 mb-8">통일/한반도 분야 전문가로 유니피벗에 참여하세요</p>
          <a href="/request" className="inline-block px-8 py-4 bg-primary hover:bg-primary-dark text-white rounded-xl font-semibold transition-colors">
            참여 문의하기
          </a>
        </div>
      </section>
    </>
  )
}
