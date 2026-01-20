'use client'

import { Plus, X, MessageCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface QuestionsSectionData {
  questions?: string[]
}

interface QuestionsSectionProps {
  value: QuestionsSectionData | undefined
  onChange: (data: QuestionsSectionData) => void
  maxQuestions?: number
}

export function QuestionsSection({
  value,
  onChange,
  maxQuestions = 5,
}: QuestionsSectionProps) {
  const questions = value?.questions || ['']

  const handleQuestionChange = (index: number, text: string) => {
    const newQuestions = [...questions]
    newQuestions[index] = text
    onChange({ questions: newQuestions })
  }

  const addQuestion = () => {
    if (questions.length < maxQuestions) {
      onChange({ questions: [...questions, ''] })
    }
  }

  const removeQuestion = (index: number) => {
    if (questions.length > 1) {
      const newQuestions = questions.filter((_, i) => i !== index)
      onChange({ questions: newQuestions })
    } else {
      // Clear the only question instead of removing
      onChange({ questions: [''] })
    }
  }

  return (
    <div className="space-y-3">
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-center gap-2 text-blue-800 mb-2">
          <MessageCircle className="w-4 h-4" />
          <span className="font-medium text-sm">토론 질문 작성 팁</span>
        </div>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• 예/아니오로 답할 수 없는 열린 질문이 좋아요</li>
          <li>• 책의 내용과 연결된 질문을 만들어보세요</li>
          <li>• 다른 참가자들의 의견이 궁금한 부분을 질문해보세요</li>
        </ul>
      </div>

      {questions.map((question, index) => (
        <div key={index} className="flex gap-2 items-start">
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-yellow-100 text-yellow-700 flex items-center justify-center text-sm font-medium">
            Q{index + 1}
          </div>
          <Input
            value={question}
            onChange={(e) => handleQuestionChange(index, e.target.value)}
            placeholder={`토론 질문 ${index + 1}을 입력해주세요`}
            className="flex-1"
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => removeQuestion(index)}
            className="flex-shrink-0 text-gray-400 hover:text-red-500"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      ))}

      {questions.length < maxQuestions && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addQuestion}
          className="w-full"
        >
          <Plus className="w-4 h-4 mr-2" />
          질문 추가 ({questions.length}/{maxQuestions})
        </Button>
      )}
    </div>
  )
}
