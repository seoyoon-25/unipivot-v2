import { getTimerSessions } from './actions'
import TimerPageClient from './TimerPageClient'

export const metadata = {
  title: '발언 타이머 | 운영진 도구 | 유니클럽',
}

export default async function TimerPage() {
  const programs = await getTimerSessions()

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-1">발언 타이머</h1>
      <p className="text-sm text-gray-500 mb-6">
        참가자별 발언 시간을 기록하세요
      </p>

      <TimerPageClient programs={JSON.parse(JSON.stringify(programs))} />
    </div>
  )
}
