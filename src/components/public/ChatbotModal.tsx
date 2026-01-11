'use client'

import { useState, useRef, useEffect } from 'react'
import { X, Send, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
}

interface ChatbotModalProps {
  isOpen: boolean
  onClose: () => void
}

export function ChatbotModal({ isOpen, onClose }: ChatbotModalProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: '안녕하세요! 저는 유니피벗의 AI 챗봇 피봇이입니다. 한반도 이슈나 유니피벗 프로그램에 대해 궁금한 점을 물어보세요!',
    },
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [sessionId] = useState(() => Math.random().toString(36).substring(7))
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage.content,
          sessionId,
        }),
      })

      const data = await res.json()

      if (res.ok) {
        setMessages((prev) => [
          ...prev,
          {
            id: (Date.now() + 1).toString(),
            role: 'assistant',
            content: data.response,
          },
        ])
      } else {
        throw new Error(data.error)
      }
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: '죄송합니다. 일시적인 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
        },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  const handleQuickQuestion = (question: string) => {
    setInput(question)
  }

  if (!isOpen) return null

  return (
    <div className="fixed bottom-6 right-6 w-96 h-[500px] bg-white rounded-2xl shadow-2xl z-50 flex flex-col overflow-hidden animate-fade-up">
      {/* Header */}
      <div className="bg-primary p-4 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
            <span className="text-white font-bold">P</span>
          </div>
          <div>
            <h3 className="text-white font-bold">피봇이</h3>
            <p className="text-white/80 text-xs">AI 챗봇</p>
          </div>
        </div>
        <button onClick={onClose} className="text-white/80 hover:text-white transition-colors">
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
        {messages.map((message) => (
          <div
            key={message.id}
            className={cn('flex gap-3 mb-4', message.role === 'user' && 'flex-row-reverse')}
          >
            {message.role === 'assistant' && (
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-white text-sm font-bold">P</span>
              </div>
            )}
            <div
              className={cn(
                'rounded-2xl p-4 max-w-[80%]',
                message.role === 'user'
                  ? 'bg-primary text-white rounded-tr-sm'
                  : 'bg-white shadow-sm rounded-tl-sm'
              )}
            >
              <p className={cn('text-sm', message.role === 'user' ? 'text-white' : 'text-gray-700')}>
                {message.content}
              </p>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex gap-3 mb-4">
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-white text-sm font-bold">P</span>
            </div>
            <div className="bg-white shadow-sm rounded-2xl rounded-tl-sm p-4">
              <Loader2 className="w-5 h-5 text-primary animate-spin" />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />

        {/* Quick Questions */}
        {messages.length === 1 && (
          <div className="mt-4 space-y-2">
            <p className="text-xs text-gray-500 px-2">자주 묻는 질문</p>
            {[
              '독서모임은 어떻게 참여하나요?',
              '유니피벗은 어떤 단체인가요?',
              '후원은 어떻게 하나요?',
            ].map((question) => (
              <button
                key={question}
                onClick={() => handleQuickQuestion(question)}
                className="w-full text-left px-4 py-3 bg-white rounded-xl text-sm text-gray-700 hover:bg-primary-light hover:text-primary transition-colors shadow-sm"
              >
                {question}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Input */}
      <form onSubmit={sendMessage} className="p-4 border-t border-gray-100 flex-shrink-0">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="메시지를 입력하세요..."
            className="flex-1 px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="px-4 py-3 bg-primary hover:bg-primary-dark text-white rounded-xl transition-colors disabled:opacity-50"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </form>
    </div>
  )
}
