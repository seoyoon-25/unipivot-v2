'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import { SurveyQuestion, QuestionType } from '@/types/survey'
import { Star } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'

interface QuestionRendererProps {
  question: SurveyQuestion
  value: string | string[] | number | null
  onChange: (value: string | string[] | number | null) => void
  error?: string
  disabled?: boolean
}

const emojiOptions = [
  { value: 1, emoji: '😞', label: '매우 불만족' },
  { value: 2, emoji: '😐', label: '불만족' },
  { value: 3, emoji: '🙂', label: '보통' },
  { value: 4, emoji: '😊', label: '만족' },
  { value: 5, emoji: '🤩', label: '매우 만족' },
]

export function QuestionRenderer({
  question,
  value,
  onChange,
  error,
  disabled = false,
}: QuestionRendererProps) {
  const renderQuestion = () => {
    switch (question.type) {
      case 'emoji_5':
        return (
          <Emoji5Rating
            value={value as number | null}
            onChange={onChange}
            disabled={disabled}
          />
        )

      case 'star_5':
        return (
          <StarRating
            value={value as number | null}
            onChange={onChange}
            disabled={disabled}
          />
        )

      case 'rating_10':
        return (
          <NPSRating
            value={value as number | null}
            onChange={onChange}
            disabled={disabled}
          />
        )

      case 'single_choice':
        return (
          <SingleChoice
            options={Array.isArray(question.options) ? question.options as string[] : []}
            value={value as string | null}
            onChange={onChange}
            disabled={disabled}
          />
        )

      case 'multi_choice':
        return (
          <MultiChoice
            options={Array.isArray(question.options) ? question.options as string[] : []}
            value={(value as string[]) || []}
            onChange={onChange}
            disabled={disabled}
          />
        )

      case 'text_short':
        return (
          <TextShort
            value={(value as string) || ''}
            onChange={onChange}
            placeholder={question.description}
            disabled={disabled}
          />
        )

      case 'text_long':
        return (
          <TextLong
            value={(value as string) || ''}
            onChange={onChange}
            placeholder={question.description}
            disabled={disabled}
          />
        )

      case 'yes_no':
        return (
          <YesNo
            value={value as string | null}
            onChange={onChange}
            disabled={disabled}
          />
        )

      default:
        return <div className="text-gray-500">지원하지 않는 질문 유형입니다</div>
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-start gap-2">
        <span className="text-lg font-medium text-gray-900">{question.text}</span>
        {question.required && (
          <span className="text-red-500">*</span>
        )}
      </div>
      {question.description && (
        <p className="text-sm text-gray-500">{question.description}</p>
      )}
      <div className="pt-2">
        {renderQuestion()}
      </div>
      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}
    </div>
  )
}

// Emoji 5점 척도
function Emoji5Rating({
  value,
  onChange,
  disabled,
}: {
  value: number | null
  onChange: (value: number | null) => void
  disabled: boolean
}) {
  return (
    <div className="flex flex-wrap gap-3">
      {emojiOptions.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange(option.value)}
          disabled={disabled}
          className={cn(
            'flex flex-col items-center gap-1 rounded-xl border-2 p-3 transition-all',
            'hover:border-primary/50 hover:bg-primary/5',
            value === option.value
              ? 'border-primary bg-primary/10'
              : 'border-gray-200',
            disabled && 'cursor-not-allowed opacity-50'
          )}
        >
          <span className="text-3xl">{option.emoji}</span>
          <span className="text-xs text-gray-600">{option.label}</span>
        </button>
      ))}
    </div>
  )
}

// 별점 5점 척도
function StarRating({
  value,
  onChange,
  disabled,
}: {
  value: number | null
  onChange: (value: number | null) => void
  disabled: boolean
}) {
  const [hovered, setHovered] = useState<number | null>(null)

  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          onMouseEnter={() => !disabled && setHovered(star)}
          onMouseLeave={() => setHovered(null)}
          disabled={disabled}
          className={cn(
            'p-1 transition-transform hover:scale-110',
            disabled && 'cursor-not-allowed'
          )}
        >
          <Star
            className={cn(
              'h-10 w-10 transition-colors',
              (hovered !== null ? star <= hovered : star <= (value || 0))
                ? 'fill-yellow-400 text-yellow-400'
                : 'fill-transparent text-gray-300'
            )}
          />
        </button>
      ))}
      {value && (
        <span className="ml-3 self-center text-lg font-medium text-gray-700">
          {value}점
        </span>
      )}
    </div>
  )
}

// NPS 0-10점 척도
function NPSRating({
  value,
  onChange,
  disabled,
}: {
  value: number | null
  onChange: (value: number | null) => void
  disabled: boolean
}) {
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
          <button
            key={num}
            type="button"
            onClick={() => onChange(num)}
            disabled={disabled}
            className={cn(
              'h-12 w-12 rounded-lg border-2 text-lg font-medium transition-all',
              'hover:border-primary hover:bg-primary/10',
              value === num
                ? 'border-primary bg-primary text-white'
                : 'border-gray-200 text-gray-700',
              disabled && 'cursor-not-allowed opacity-50'
            )}
          >
            {num}
          </button>
        ))}
      </div>
      <div className="flex justify-between text-sm text-gray-500">
        <span>전혀 추천하지 않음</span>
        <span>매우 추천함</span>
      </div>
    </div>
  )
}

// 단일 선택 (라디오)
function SingleChoice({
  options,
  value,
  onChange,
  disabled,
}: {
  options: string[]
  value: string | null
  onChange: (value: string | null) => void
  disabled: boolean
}) {
  return (
    <RadioGroup
      value={value || ''}
      onValueChange={onChange}
      disabled={disabled}
      className="space-y-2"
    >
      {options.map((option, index) => (
        <div
          key={index}
          className={cn(
            'flex items-center space-x-3 rounded-lg border p-3 transition-colors',
            value === option ? 'border-primary bg-primary/5' : 'border-gray-200',
            !disabled && 'hover:border-primary/50'
          )}
        >
          <RadioGroupItem value={option} id={`option-${index}`} />
          <Label
            htmlFor={`option-${index}`}
            className="flex-1 cursor-pointer font-normal"
          >
            {option}
          </Label>
        </div>
      ))}
    </RadioGroup>
  )
}

// 다중 선택 (체크박스)
function MultiChoice({
  options,
  value,
  onChange,
  disabled,
}: {
  options: string[]
  value: string[]
  onChange: (value: string[]) => void
  disabled: boolean
}) {
  const handleChange = (option: string, checked: boolean) => {
    if (checked) {
      onChange([...value, option])
    } else {
      onChange(value.filter((v) => v !== option))
    }
  }

  return (
    <div className="space-y-2">
      {options.map((option, index) => (
        <div
          key={index}
          className={cn(
            'flex items-center space-x-3 rounded-lg border p-3 transition-colors',
            value.includes(option) ? 'border-primary bg-primary/5' : 'border-gray-200',
            !disabled && 'hover:border-primary/50'
          )}
        >
          <Checkbox
            id={`multi-${index}`}
            checked={value.includes(option)}
            onCheckedChange={(checked) => handleChange(option, !!checked)}
            disabled={disabled}
          />
          <Label
            htmlFor={`multi-${index}`}
            className="flex-1 cursor-pointer font-normal"
          >
            {option}
          </Label>
        </div>
      ))}
    </div>
  )
}

// 짧은 텍스트 입력
function TextShort({
  value,
  onChange,
  placeholder,
  disabled,
}: {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  disabled: boolean
}) {
  return (
    <Input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder || '답변을 입력해주세요'}
      disabled={disabled}
      className="max-w-md"
    />
  )
}

// 긴 텍스트 입력
function TextLong({
  value,
  onChange,
  placeholder,
  disabled,
}: {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  disabled: boolean
}) {
  return (
    <Textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder || '자유롭게 의견을 작성해주세요'}
      disabled={disabled}
      rows={4}
      className="resize-none"
    />
  )
}

// 예/아니오 선택
function YesNo({
  value,
  onChange,
  disabled,
}: {
  value: string | null
  onChange: (value: string | null) => void
  disabled: boolean
}) {
  return (
    <div className="flex gap-4">
      <button
        type="button"
        onClick={() => onChange('yes')}
        disabled={disabled}
        className={cn(
          'flex-1 rounded-lg border-2 py-4 text-lg font-medium transition-all',
          'hover:border-green-400 hover:bg-green-50',
          value === 'yes'
            ? 'border-green-500 bg-green-50 text-green-700'
            : 'border-gray-200 text-gray-700',
          disabled && 'cursor-not-allowed opacity-50'
        )}
      >
        예
      </button>
      <button
        type="button"
        onClick={() => onChange('no')}
        disabled={disabled}
        className={cn(
          'flex-1 rounded-lg border-2 py-4 text-lg font-medium transition-all',
          'hover:border-red-400 hover:bg-red-50',
          value === 'no'
            ? 'border-red-500 bg-red-50 text-red-700'
            : 'border-gray-200 text-gray-700',
          disabled && 'cursor-not-allowed opacity-50'
        )}
      >
        아니오
      </button>
    </div>
  )
}
