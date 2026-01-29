import { getQuestionSessions } from './actions'
import QuestionsPageClient from './QuestionsPageClient'

export const metadata = {
  title: 'AI 토론 질문 | 운영진 도구 | 유니클럽',
}

export default async function QuestionsPage() {
  const programs = await getQuestionSessions()

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-1">AI 토론 질문</h1>
      <p className="text-sm text-gray-500 mb-6">
        독후감을 분석하여 토론 질문을 생성합니다
      </p>

      <QuestionsPageClient programs={JSON.parse(JSON.stringify(programs))} />
    </div>
  )
}
