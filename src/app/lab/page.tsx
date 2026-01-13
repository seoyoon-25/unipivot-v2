import Link from 'next/link'
import { Users, ClipboardList, FileSearch, TrendingUp, ArrowRight } from 'lucide-react'

const features = [
  {
    icon: Users,
    title: '전문가/강사 풀',
    description: '이주배경 전문가, 강사 프로필을 검색하고 직접 섭외하세요.',
    href: '/lab/experts',
    color: 'bg-blue-500',
  },
  {
    icon: ClipboardList,
    title: '설문조사',
    description: '설문조사 참가자 모집을 대행해드립니다.',
    href: '/lab/surveys',
    color: 'bg-green-500',
  },
  {
    icon: FileSearch,
    title: '연구참여',
    description: '인터뷰, 연구 참가자로 직접 참여하고 사례비를 받으세요.',
    href: '/lab/research',
    color: 'bg-purple-500',
  },
  {
    icon: TrendingUp,
    title: '연구동향',
    description: '최신 북한·통일·다문화 관련 연구 동향을 확인하세요.',
    href: '/lab/trends',
    color: 'bg-orange-500',
  },
]

const stats = [
  { label: '등록 전문가', value: '50+' },
  { label: '강연 매칭', value: '100+' },
  { label: '연구 협력', value: '30+' },
]

export default function LabHomePage() {
  return (
    <>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white py-20 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-72 h-72 bg-primary rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-500 rounded-full blur-3xl" />
        </div>

        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/20 rounded-full mb-6">
              <span className="w-2 h-2 bg-primary rounded-full animate-pulse" />
              <span className="text-sm text-primary-light font-medium">UniPivot Research Lab</span>
            </div>

            <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
              이주배경 주민 전문가 풀과<br />
              연구 매칭 플랫폼
            </h1>

            <p className="text-xl text-gray-300 mb-8 leading-relaxed">
              통일·북한·다문화 분야의 전문가와 강사를 직접 검색하고 섭외하세요.
              연구 설문조사와 인터뷰 참가자 모집도 지원합니다.
            </p>

            <div className="flex flex-wrap gap-4">
              <Link
                href="/lab/experts"
                className="inline-flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary-dark text-white rounded-xl font-medium transition-all hover:scale-105"
              >
                전문가 검색
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                href="/lab/experts/register"
                className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl font-medium transition-colors"
              >
                전문가 등록하기
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-white py-12 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-3 gap-8">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-3xl md:text-4xl font-bold text-primary">{stat.value}</p>
                <p className="text-gray-500 mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">리서치랩 서비스</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              전문가 매칭부터 연구 참여까지, 다양한 서비스를 제공합니다.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {features.map((feature) => {
              const Icon = feature.icon
              return (
                <Link
                  key={feature.title}
                  href={feature.href}
                  className="group bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-all border border-gray-100"
                >
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 ${feature.color} rounded-xl flex items-center justify-center flex-shrink-0`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-lg text-gray-900 mb-2 group-hover:text-primary transition-colors">
                        {feature.title}
                      </h3>
                      <p className="text-gray-600">{feature.description}</p>
                    </div>
                    <ArrowRight className="w-5 h-5 text-gray-300 group-hover:text-primary group-hover:translate-x-1 transition-all" />
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary/5">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            전문가로 등록하세요
          </h2>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
            이주배경을 가진 전문가, 강사라면 누구나 등록할 수 있습니다.
            프로필을 등록하고 강연, 자문, 연구 참여 기회를 얻으세요.
          </p>
          <Link
            href="/lab/experts/register"
            className="inline-flex items-center gap-2 px-8 py-4 bg-primary hover:bg-primary-dark text-white rounded-xl font-medium transition-colors"
          >
            전문가 등록하기
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>
    </>
  )
}
