import Link from 'next/link'
import {
  Bot,
  Brain,
  MessageSquare,
  Database,
  Zap,
  ArrowRight,
  Settings,
  BarChart3,
  Clock,
  CheckCircle,
  AlertCircle,
} from 'lucide-react'

export default function AdminAiPage() {
  const modules = [
    {
      title: '지식 베이스',
      description: 'AI 학습용 문서 및 데이터 관리',
      href: '/admin/ai/knowledge',
      icon: Database,
      status: '준비중',
      statusColor: 'bg-yellow-100 text-yellow-700',
      color: 'bg-blue-500',
      features: ['문서 업로드', '데이터 벡터화', '검색 최적화'],
    },
    {
      title: '챗봇 관리',
      description: 'AI 챗봇 설정 및 대화 기록',
      href: '/admin/ai/chatbot',
      icon: MessageSquare,
      status: '준비중',
      statusColor: 'bg-yellow-100 text-yellow-700',
      color: 'bg-green-500',
      features: ['대화 시나리오', '응답 템플릿', '대화 로그'],
    },
  ]

  const upcomingFeatures = [
    {
      title: 'RAG 시스템',
      description: '문서 기반 질문 응답 시스템',
      icon: Brain,
      status: 'planned',
    },
    {
      title: '자동 요약',
      description: '프로그램 후기, 독후감 자동 요약',
      icon: Zap,
      status: 'planned',
    },
    {
      title: '스마트 매칭',
      description: 'AI 기반 프로그램 추천',
      icon: CheckCircle,
      status: 'planned',
    },
    {
      title: '감성 분석',
      description: '피드백 감성 분석 및 인사이트',
      icon: BarChart3,
      status: 'planned',
    },
  ]

  return (
    <div className="space-y-8">
      {/* 헤더 */}
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl flex items-center justify-center">
          <Bot className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">AI 관리</h1>
          <p className="text-gray-500">AI 기능 설정 및 관리</p>
        </div>
      </div>

      {/* 상태 배너 */}
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-100 rounded-xl p-6">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <AlertCircle className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 mb-1">AI 기능 개발 중</h3>
            <p className="text-sm text-gray-600">
              AI 기반 기능들이 개발 중입니다. 지식 베이스 구축과 챗봇 설정 기능이 곧 추가될 예정입니다.
              현재는 기본 설정만 가능합니다.
            </p>
          </div>
        </div>
      </div>

      {/* 주요 모듈 */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">AI 모듈</h2>
        <div className="grid md:grid-cols-2 gap-4">
          {modules.map((module) => (
            <Link
              key={module.href}
              href={module.href}
              className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-all group border border-gray-100"
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 ${module.color} rounded-xl flex items-center justify-center`}>
                  <module.icon className="w-6 h-6 text-white" />
                </div>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${module.statusColor}`}>
                  {module.status}
                </span>
              </div>

              <h3 className="font-semibold text-lg text-gray-900 mb-1 group-hover:text-primary transition-colors">
                {module.title}
              </h3>
              <p className="text-sm text-gray-500 mb-4">{module.description}</p>

              <div className="flex flex-wrap gap-2 mb-4">
                {module.features.map((feature) => (
                  <span
                    key={feature}
                    className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded"
                  >
                    {feature}
                  </span>
                ))}
              </div>

              <div className="flex items-center text-sm text-primary font-medium">
                설정하기
                <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* 예정된 기능 */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">예정된 기능</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {upcomingFeatures.map((feature) => (
            <div
              key={feature.title}
              className="bg-white rounded-xl p-5 shadow-sm border border-gray-100"
            >
              <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center mb-4">
                <feature.icon className="w-5 h-5 text-gray-500" />
              </div>
              <h3 className="font-medium text-gray-900 mb-1">{feature.title}</h3>
              <p className="text-sm text-gray-500">{feature.description}</p>
              <div className="mt-3">
                <span className="inline-flex items-center gap-1 text-xs text-gray-400">
                  <Clock className="w-3 h-3" />
                  개발 예정
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 빠른 설정 */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center gap-3 mb-4">
          <Settings className="w-5 h-5 text-gray-500" />
          <h2 className="font-semibold text-gray-900">AI 설정</h2>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="text-sm font-medium text-gray-700 mb-1">AI 모델</div>
            <div className="text-sm text-gray-500">GPT-4 (예정)</div>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="text-sm font-medium text-gray-700 mb-1">임베딩 모델</div>
            <div className="text-sm text-gray-500">OpenAI Ada-002 (예정)</div>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="text-sm font-medium text-gray-700 mb-1">벡터 DB</div>
            <div className="text-sm text-gray-500">Pinecone (예정)</div>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-gray-100">
          <p className="text-sm text-gray-500">
            AI 기능을 활성화하려면 API 키 설정이 필요합니다.
            <Link href="/admin/settings" className="text-primary hover:underline ml-1">
              설정으로 이동
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
