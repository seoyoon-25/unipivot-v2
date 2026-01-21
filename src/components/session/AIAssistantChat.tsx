'use client'

import { useState, useRef, useEffect } from 'react'
import { Send, Bot, User, Loader2 } from 'lucide-react'
import { chatWithAI, getAIConversation } from '@/lib/actions/ai-assistant'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

interface Props {
  sessionId: string
}

export default function AIAssistantChat({ sessionId }: Props) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // 기존 대화 로드
  useEffect(() => {
    loadConversation()
  }, [sessionId])

  // 스크롤 자동 이동
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const loadConversation = async () => {
    try {
      const conversation = await getAIConversation(sessionId)
      if (conversation) {
        setMessages(JSON.parse(conversation.messages))
      }
    } catch (error) {
      console.error('대화 로드 실패:', error)
    } finally {
      setInitialLoading(false)
    }
  }

  const handleSend = async () => {
    if (!input.trim() || loading) return

    const userMessage = input.trim()
    setInput('')
    setLoading(true)

    // 사용자 메시지 먼저 표시
    setMessages(prev => [...prev, { role: 'user', content: userMessage }])

    try {
      const result = await chatWithAI(sessionId, userMessage, messages)

      if (result.error) {
        setMessages(prev => [
          ...prev,
          { role: 'assistant', content: `오류: ${result.error}` }
        ])
      } else if (result.reply) {
        setMessages(prev => [
          ...prev,
          { role: 'assistant', content: result.reply }
        ])
      }
    } catch (error) {
      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: '오류가 발생했습니다. 다시 시도해주세요.' }
      ])
    } finally {
      setLoading(false)
    }
  }

  const quickActions = [
    { label: '독후감 분석', prompt: '독후감들을 분석해주세요' },
    { label: '토론 질문 추천', prompt: '토론 질문 5개 추천해주세요' },
    { label: '공통 주제 찾기', prompt: '공통 관심사가 뭔가요?' },
    { label: '논쟁 포인트', prompt: '의견이 갈리는 부분은?' }
  ]

  if (initialLoading) {
    return (
      <div className="border rounded-lg p-6 flex items-center justify-center h-96">
        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
      </div>
    )
  }

  return (
    <div className="border rounded-lg p-6 space-y-4">
      <h3 className="text-lg font-bold flex items-center gap-2">
        <Bot className="w-5 h-5" />
        AI 모임 준비 어시스턴트
      </h3>

      {/* 빠른 액션 */}
      <div className="flex gap-2 flex-wrap">
        {quickActions.map((action, idx) => (
          <button
            key={idx}
            onClick={() => setInput(action.prompt)}
            className="px-3 py-1.5 text-sm border rounded-full hover:bg-gray-50 transition-colors"
          >
            {action.label}
          </button>
        ))}
      </div>

      {/* 대화 기록 */}
      <div className="h-96 overflow-y-auto space-y-3 bg-gray-50 rounded-lg p-4">
        {messages.length === 0 && (
          <div className="text-center text-gray-500 py-12">
            <Bot className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p className="font-medium">안녕하세요! 모임 준비를 도와드릴게요.</p>
            <p className="text-sm mt-2">
              위 버튼을 클릭하거나 질문을 입력해주세요.
            </p>
          </div>
        )}

        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
          >
            <div
              className={`
                w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0
                ${msg.role === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-200'}
              `}
            >
              {msg.role === 'user' ? (
                <User className="w-4 h-4" />
              ) : (
                <Bot className="w-4 h-4" />
              )}
            </div>
            <div
              className={`
                p-3 rounded-lg max-w-[80%]
                ${msg.role === 'user'
                  ? 'bg-blue-500 text-white'
                  : 'bg-white border'
                }
              `}
            >
              <p className="whitespace-pre-wrap text-sm">{msg.content}</p>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
              <Bot className="w-4 h-4" />
            </div>
            <div className="bg-white border p-3 rounded-lg">
              <div className="flex items-center gap-2 text-gray-500">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-sm">AI가 생각 중...</span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* 입력 */}
      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyPress={e => e.key === 'Enter' && handleSend()}
          placeholder="AI에게 질문하세요..."
          className="flex-1 border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          disabled={loading}
        />
        <button
          onClick={handleSend}
          disabled={loading || !input.trim()}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-700 transition-colors"
        >
          <Send className="w-5 h-5" />
        </button>
      </div>
    </div>
  )
}
