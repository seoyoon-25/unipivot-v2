import { Users, Mic, ClipboardList, ExternalLink } from 'lucide-react'

const LAB_DOMAIN = process.env.NEXT_PUBLIC_LAB_DOMAIN || 'lab.bestcome.org'

const features = [
  {
    icon: Users,
    title: '전문가 풀',
    description: '이주배경 전문가, 강사 프로필 검색',
  },
  {
    icon: Mic,
    title: '강연 매칭',
    description: '원하는 주제의 강연자를 직접 섭외',
  },
  {
    icon: ClipboardList,
    title: '연구 협력',
    description: '설문조사, 인터뷰 참가자 모집 대행',
  },
]

export function ResearchLabSection() {
  return (
    <section className="py-20 bg-gradient-to-br from-gray-900 to-gray-800 text-white relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-72 h-72 bg-primary rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-500 rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-4 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left - Content */}
          <div className="slide-from-left">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/20 rounded-full mb-6">
              <span className="w-2 h-2 bg-primary rounded-full animate-pulse" />
              <span className="text-sm text-primary-light font-medium">New Platform</span>
            </div>

            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              유니피벗 리서치랩
            </h2>
            <p className="text-xl text-gray-300 mb-6">
              이주배경 주민 전문가 풀과<br />
              연구 매칭 플랫폼
            </p>
            <p className="text-gray-400 mb-8 leading-relaxed">
              통일·북한·다문화 분야의 전문가와 강사를 직접 검색하고 섭외하세요.
              연구 설문조사와 인터뷰 참가자 모집도 지원합니다.
              리서치랩에서 더 쉽고 빠르게 연결됩니다.
            </p>

            <a
              href={`https://${LAB_DOMAIN}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 px-8 py-4 bg-primary hover:bg-primary-dark text-white rounded-xl font-semibold transition-all hover:scale-105 shadow-lg shadow-primary/30"
            >
              리서치랩 바로가기
              <ExternalLink className="w-5 h-5" />
            </a>
          </div>

          {/* Right - Features */}
          <div className="space-y-4">
            {features.map((feature, index) => (
              <div
                key={feature.title}
                className={`flex items-start gap-4 p-6 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 hover:bg-white/10 transition-colors animate-on-scroll stagger-${index + 1}`}
              >
                <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center flex-shrink-0">
                  <feature.icon className="w-6 h-6 text-primary-light" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1">{feature.title}</h3>
                  <p className="text-gray-400">{feature.description}</p>
                </div>
              </div>
            ))}

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mt-6 animate-on-scroll stagger-4">
              <div className="text-center p-4 bg-white/5 rounded-xl">
                <p className="text-2xl font-bold text-primary-light">50+</p>
                <p className="text-sm text-gray-400">등록 전문가</p>
              </div>
              <div className="text-center p-4 bg-white/5 rounded-xl">
                <p className="text-2xl font-bold text-primary-light">100+</p>
                <p className="text-sm text-gray-400">강연 매칭</p>
              </div>
              <div className="text-center p-4 bg-white/5 rounded-xl">
                <p className="text-2xl font-bold text-primary-light">30+</p>
                <p className="text-sm text-gray-400">연구 협력</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
