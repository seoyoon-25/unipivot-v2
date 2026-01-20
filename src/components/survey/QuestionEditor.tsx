'use client'

import { useState } from 'react'
import { GripVertical, Trash2, ChevronDown, ChevronUp } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent } from '@/components/ui/card'
import { QuestionChoicesEditor } from './QuestionChoicesEditor'
import {
  SurveyQuestion,
  QuestionType,
  QUESTION_TYPE_LABELS,
  DEFAULT_EMOJI_LABELS,
  DEFAULT_NPS_LABELS,
} from '@/types/survey'

interface QuestionEditorProps {
  question: SurveyQuestion
  onChange: (question: SurveyQuestion) => void
  onDelete: () => void
  dragHandleProps?: React.HTMLAttributes<HTMLDivElement>
}

export function QuestionEditor({
  question,
  onChange,
  onDelete,
  dragHandleProps,
}: QuestionEditorProps) {
  const [isExpanded, setIsExpanded] = useState(true)

  const handleTypeChange = (type: QuestionType) => {
    const updatedQuestion: SurveyQuestion = {
      ...question,
      type,
      options: undefined,
    }

    // Set default options based on type
    switch (type) {
      case 'emoji_5':
        updatedQuestion.options = {
          labels: [...DEFAULT_EMOJI_LABELS],
        }
        break
      case 'rating_10':
        updatedQuestion.options = {
          min: 0,
          max: 10,
          ...DEFAULT_NPS_LABELS,
        }
        break
      case 'single_choice':
      case 'multi_choice':
        updatedQuestion.options = {
          choices: [
            { id: 'c1', text: '', order: 1 },
            { id: 'c2', text: '', order: 2 },
          ],
        }
        break
      case 'text_short':
        updatedQuestion.options = {
          placeholder: '',
          maxLength: 200,
        }
        break
      case 'text_long':
        updatedQuestion.options = {
          placeholder: '',
          maxLength: 500,
          rows: 4,
        }
        break
    }

    onChange(updatedQuestion)
  }

  const handleTextChange = (text: string) => {
    onChange({ ...question, text })
  }

  const handleDescriptionChange = (description: string) => {
    onChange({ ...question, description: description || undefined })
  }

  const handleRequiredChange = (required: boolean) => {
    onChange({ ...question, required })
  }

  const handleOptionsChange = (options: SurveyQuestion['options']) => {
    onChange({ ...question, options })
  }

  const renderTypeSpecificOptions = () => {
    switch (question.type) {
      case 'emoji_5':
        return (
          <div className="space-y-2">
            <Label className="text-sm text-gray-600">라벨 설정 (선택)</Label>
            <div className="grid grid-cols-5 gap-2">
              {(question.options?.labels || DEFAULT_EMOJI_LABELS).map((label, index) => (
                <Input
                  key={index}
                  value={label}
                  onChange={(e) => {
                    const labels = [...(question.options?.labels || DEFAULT_EMOJI_LABELS)]
                    labels[index] = e.target.value
                    handleOptionsChange({ ...question.options, labels })
                  }}
                  placeholder={DEFAULT_EMOJI_LABELS[index]}
                  className="text-xs"
                />
              ))}
            </div>
          </div>
        )

      case 'rating_10':
        return (
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm text-gray-600">최소값 라벨</Label>
              <Input
                value={question.options?.minLabel || ''}
                onChange={(e) =>
                  handleOptionsChange({ ...question.options, minLabel: e.target.value })
                }
                placeholder={DEFAULT_NPS_LABELS.minLabel}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm text-gray-600">최대값 라벨</Label>
              <Input
                value={question.options?.maxLabel || ''}
                onChange={(e) =>
                  handleOptionsChange({ ...question.options, maxLabel: e.target.value })
                }
                placeholder={DEFAULT_NPS_LABELS.maxLabel}
              />
            </div>
          </div>
        )

      case 'single_choice':
      case 'multi_choice':
        return (
          <QuestionChoicesEditor
            choices={question.options?.choices || []}
            onChange={(choices) => handleOptionsChange({ ...question.options, choices })}
          />
        )

      case 'text_short':
        return (
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm text-gray-600">플레이스홀더</Label>
              <Input
                value={question.options?.placeholder || ''}
                onChange={(e) =>
                  handleOptionsChange({ ...question.options, placeholder: e.target.value })
                }
                placeholder="입력 힌트"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm text-gray-600">최대 글자 수</Label>
              <Input
                type="number"
                value={question.options?.maxLength || 200}
                onChange={(e) =>
                  handleOptionsChange({ ...question.options, maxLength: parseInt(e.target.value) || 200 })
                }
                min={10}
                max={1000}
              />
            </div>
          </div>
        )

      case 'text_long':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm text-gray-600">플레이스홀더</Label>
                <Input
                  value={question.options?.placeholder || ''}
                  onChange={(e) =>
                    handleOptionsChange({ ...question.options, placeholder: e.target.value })
                  }
                  placeholder="입력 힌트"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm text-gray-600">최대 글자 수</Label>
                <Input
                  type="number"
                  value={question.options?.maxLength || 500}
                  onChange={(e) =>
                    handleOptionsChange({ ...question.options, maxLength: parseInt(e.target.value) || 500 })
                  }
                  min={50}
                  max={5000}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-sm text-gray-600">입력창 높이 (줄 수)</Label>
              <Input
                type="number"
                value={question.options?.rows || 4}
                onChange={(e) =>
                  handleOptionsChange({ ...question.options, rows: parseInt(e.target.value) || 4 })
                }
                min={2}
                max={10}
                className="w-24"
              />
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <Card className="border-l-4 border-l-primary">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          {/* Drag Handle */}
          <div
            {...dragHandleProps}
            className="mt-2 cursor-grab text-gray-400 hover:text-gray-600"
          >
            <GripVertical className="h-5 w-5" />
          </div>

          <div className="flex-1 space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-sm font-medium text-primary">
                  {question.order}
                </span>
                <Select value={question.type} onValueChange={handleTypeChange}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(QUESTION_TYPE_LABELS).map(([type, label]) => (
                      <SelectItem key={type} value={type}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsExpanded(!isExpanded)}
                >
                  {isExpanded ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onDelete}
                  className="text-red-500 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {isExpanded && (
              <>
                {/* Question Text */}
                <div className="space-y-2">
                  <Label>질문 내용 *</Label>
                  <Textarea
                    value={question.text}
                    onChange={(e) => handleTextChange(e.target.value)}
                    placeholder="질문을 입력하세요"
                    rows={2}
                  />
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <Label className="text-sm text-gray-600">설명 (선택)</Label>
                  <Input
                    value={question.description || ''}
                    onChange={(e) => handleDescriptionChange(e.target.value)}
                    placeholder="질문에 대한 추가 설명"
                  />
                </div>

                {/* Required Toggle */}
                <div className="flex items-center gap-3">
                  <Switch
                    id={`required-${question.id}`}
                    checked={question.required}
                    onCheckedChange={handleRequiredChange}
                  />
                  <Label htmlFor={`required-${question.id}`} className="text-sm">
                    필수 응답
                  </Label>
                </div>

                {/* Type-specific Options */}
                {renderTypeSpecificOptions()}
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
