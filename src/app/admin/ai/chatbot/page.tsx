'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  ArrowLeft,
  MessageSquare,
  Bot,
  Settings,
  Play,
  Pause,
  BarChart3,
  Clock,
  Users,
  AlertCircle,
  Send,
} from 'lucide-react'

export default function AdminAiChatbotPage() {
  const [testMessage, setTestMessage] = useState('')
  const [testResponse, setTestResponse] = useState('')
  const [isTesting, setIsTesting] = useState(false)

  const handleTestChat = async () => {
    if (!testMessage.trim()) return

    setIsTesting(true)
    // 시뮬레이션
    setTimeout(() => {
      setTestResponse('AI 챗봇 기능이 곧 활성화될 예정입니다. 현재는 테스트 응답입니다.')
      setIsTesting(false)
    }, 1000)
  }

  const stats = {
    totalConversations: 0,
    todayConversations: 0,
    avgResponseTime: '-',
    satisfactionRate: '-',
  }

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center gap-4">
        <Link
          href="/admin/ai"
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">챗봇 관리</h1>
          <p className="text-gray-500">AI 챗봇 설정 및 대화 기록을 관리합니다</p>
        </div>
        <button
          className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-400 rounded-lg cursor-not-allowed"
          disabled
        >
          <Play className="w-4 h-4" />
          챗봇 활성화
        </button>
      </div>

      {/* 상태 배너 */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
        <div className="flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-yellow-600" />
          <p className="text-sm text-yellow-800">
            챗봇 기능은 현재 개발 중입니다. 지식 베이스가 구축되면 챗봇을 활성화할 수 있습니다.
          </p>
        </div>
      </div>

      {/* 통계 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-blue-600" />
            </div>
          </div>
          <div className="text-2xl font-bold text-gray-900">{stats.totalConversations}</div>
          <div className="text-sm text-gray-500">전체 대화</div>
        </div>

        <div className="bg-white rounded-xl p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-green-600" />
            </div>
          </div>
          <div className="text-2xl font-bold text-gray-900">{stats.todayConversations}</div>
          <div className="text-sm text-gray-500">오늘 대화</div>
        </div>

        <div className="bg-white rounded-xl p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-purple-600" />
            </div>
          </div>
          <div className="text-2xl font-bold text-gray-900">{stats.avgResponseTime}</div>
          <div className="text-sm text-gray-500">평균 응답시간</div>
        </div>

        <div className="bg-white rounded-xl p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-orange-600" />
            </div>
          </div>
          <div className="text-2xl font-bold text-gray-900">{stats.satisfactionRate}</div>
          <div className="text-sm text-gray-500">만족도</div>
        </div>
      </div>

      {/* 챗봇 테스트 */}
      <div className="bg-white rounded-xl shadow-sm">
        <div className="flex items-center gap-3 p-5 border-b border-gray-100">
          <Bot className="w-5 h-5 text-primary" />
          <h3 className="font-semibold text-gray-900">챗봇 테스트</h3>
        </div>

        <div className="p-5">
          <div className="bg-gray-50 rounded-xl p-4 h-64 mb-4 overflow-y-auto">
            {testResponse ? (
              <div className="space-y-4">
                <div className="flex gap-3">
                  <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-sm">나</span>
                  </div>
                  <div className="bg-white rounded-lg p-3 shadow-sm">
                    <p className="text-sm">{testMessage}</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                    <Bot className="w-4 h-4 text-gray-600" />
                  </div>
                  <div className="bg-blue-50 rounded-lg p-3">
                    <p className="text-sm">{testResponse}</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-400">
                <div className="text-center">
                  <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">메시지를 입력하여 챗봇을 테스트해보세요</p>
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={testMessage}
              onChange={(e) => setTestMessage(e.target.value)}
              placeholder="메시지를 입력하세요..."
              className="flex-1 px-4 py-2 border rounded-lg"
              onKeyPress={(e) => e.key === 'Enter' && handleTestChat()}
            />
            <button
              onClick={handleTestChat}
              disabled={isTesting || !testMessage.trim()}
              className="px-4 py-2 bg-primary text-white rounded-lg disabled:opacity-50 flex items-center gap-2"
            >
              {isTesting ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
              전송
            </button>
          </div>
        </div>
      </div>

      {/* 설정 */}
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <Settings className="w-5 h-5 text-gray-500" />
          <h3 className="font-semibold text-gray-900">챗봇 설정</h3>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="text-sm font-medium text-gray-700 mb-1">AI 모델</div>
            <div className="text-sm text-gray-500">GPT-4 (예정)</div>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="text-sm font-medium text-gray-700 mb-1">최대 토큰</div>
            <div className="text-sm text-gray-500">2048</div>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="text-sm font-medium text-gray-700 mb-1">온도</div>
            <div className="text-sm text-gray-500">0.7</div>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="text-sm font-medium text-gray-700 mb-1">시스템 프롬프트</div>
            <div className="text-sm text-gray-500">기본값</div>
          </div>
        </div>

        <div className="mt-4 p-4 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>팁:</strong> 챗봇이 더 정확한 답변을 제공하려면 먼저 지식 베이스에 관련 문서를 업로드하세요.
          </p>
        </div>
      </div>

      {/* 대화 기록 */}
      <div className="bg-white rounded-xl shadow-sm">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h3 className="font-semibold text-gray-900">최근 대화 기록</h3>
        </div>

        <div className="p-12 text-center text-gray-500">
          <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-20" />
          <p>대화 기록이 없습니다</p>
          <p className="text-sm mt-1">챗봇이 활성화되면 대화 기록이 여기에 표시됩니다</p>
        </div>
      </div>
    </div>
  )
}
