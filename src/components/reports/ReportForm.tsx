'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { Save, Send, Star, Plus, Trash2, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { toast } from '@/hooks/use-toast'

interface TemplateSection {
  id: string
  emoji: string
  label: string
  description?: string
  type: 'textarea' | 'text' | 'rating' | 'list' | 'qa_list'
  placeholder?: string
  minLength?: number
  maxLength?: number
  minItems?: number
  maxItems?: number
  minValue?: number
  maxValue?: number
  required: boolean
  estimatedMinutes?: number
  guide?: string
  itemType?: string
  fields?: Array<{
    id: string
    label: string
    type: string
    placeholder?: string
    minLength?: number
    maxLength?: number
    required: boolean
  }>
}

interface Template {
  id: string
  name: string
  code: string
  estimatedMinutes: number
}

interface SessionReport {
  id: string
  content: string
  status: string
}

interface ReportFormProps {
  sessionId: string
  template: Template
  sections: TemplateSection[]
  existingReport: SessionReport | null
  onSuccess: () => void
}

type ReportContent = Record<
  string,
  string | number | string[] | Array<{ question: string; answer: string }>
>

export function ReportForm({
  sessionId,
  template,
  sections,
  existingReport,
  onSuccess,
}: ReportFormProps) {
  const [content, setContent] = useState<ReportContent>({})
  const [isSaving, setIsSaving] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null)

  // 기존 독후감 내용 로드
  useEffect(() => {
    if (existingReport?.content) {
      try {
        const parsed = JSON.parse(existingReport.content)
        setContent(parsed)
      } catch {
        console.error('기존 내용 파싱 실패')
      }
    } else {
      // 초기값 설정
      const initial: ReportContent = {}
      sections.forEach((section) => {
        if (section.type === 'rating') {
          initial[section.id] = 0
        } else if (section.type === 'list') {
          initial[section.id] = ['', '']
        } else if (section.type === 'qa_list') {
          initial[section.id] = [
            { question: '', answer: '' },
            { question: '', answer: '' },
            { question: '', answer: '' },
          ]
        } else {
          initial[section.id] = ''
        }
      })
      setContent(initial)
    }
  }, [existingReport, sections])

  // 자동저장 (1분마다)
  useEffect(() => {
    autoSaveTimerRef.current = setInterval(() => {
      if (Object.keys(content).length > 0) {
        handleSave(true)
      }
    }, 60000)

    return () => {
      if (autoSaveTimerRef.current) {
        clearInterval(autoSaveTimerRef.current)
      }
    }
  }, [content])

  // 유효성 검사
  const validate = useCallback(() => {
    const newErrors: Record<string, string> = {}

    sections.forEach((section) => {
      const value = content[section.id]

      if (section.required) {
        if (section.type === 'textarea' || section.type === 'text') {
          const strValue = (value as string) || ''
          if (!strValue.trim()) {
            newErrors[section.id] = `${section.label}을(를) 입력해주세요`
          } else if (section.minLength && strValue.length < section.minLength) {
            newErrors[section.id] = `${section.label}: 최소 ${section.minLength}자 이상 입력해주세요`
          }
        } else if (section.type === 'rating') {
          if (!value || (value as number) === 0) {
            newErrors[section.id] = `${section.label}을(를) 선택해주세요`
          }
        } else if (section.type === 'list') {
          const listValue = (value as string[]) || []
          const filledItems = listValue.filter((item) => item.trim())
          if (section.minItems && filledItems.length < section.minItems) {
            newErrors[section.id] = `${section.label}: 최소 ${section.minItems}개 이상 입력해주세요`
          }
        } else if (section.type === 'qa_list') {
          const qaValue = (value as Array<{ question: string; answer: string }>) || []
          const filledItems = qaValue.filter((item) => item.question.trim() && item.answer.trim())
          if (section.minItems && filledItems.length < section.minItems) {
            newErrors[section.id] = `${section.label}: ${section.minItems}개 모두 작성해주세요`
          }
        }
      }

      // 최대 길이 검사
      if (section.maxLength && (section.type === 'textarea' || section.type === 'text')) {
        const strValue = (value as string) || ''
        if (strValue.length > section.maxLength) {
          newErrors[section.id] = `${section.label}: 최대 ${section.maxLength}자까지 입력 가능합니다`
        }
      }
    })

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }, [content, sections])

  // 저장
  const handleSave = async (isAuto = false) => {
    if (isSaving) return

    setIsSaving(true)
    try {
      const res = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          templateId: template.id,
          content: JSON.stringify(content),
          status: 'DRAFT',
        }),
      })

      if (!res.ok) throw new Error('저장 실패')

      setLastSaved(new Date())
      if (!isAuto) {
        toast({ title: '임시저장되었습니다' })
      }
    } catch (error) {
      if (!isAuto) {
        toast({ title: '저장에 실패했습니다', variant: 'destructive' })
      }
    } finally {
      setIsSaving(false)
    }
  }

  // 제출
  const handleSubmit = async () => {
    if (!validate()) {
      toast({ title: '필수 항목을 모두 작성해주세요', variant: 'destructive' })
      return
    }

    setIsSubmitting(true)
    try {
      const res = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          templateId: template.id,
          content: JSON.stringify(content),
          status: 'SUBMITTED',
        }),
      })

      if (!res.ok) throw new Error('제출 실패')

      toast({ title: '독후감이 제출되었습니다!' })
      onSuccess()
    } catch (error) {
      toast({ title: '제출에 실패했습니다. 다시 시도해주세요.', variant: 'destructive' })
    } finally {
      setIsSubmitting(false)
    }
  }

  // 값 업데이트
  const updateValue = (sectionId: string, value: any) => {
    setContent((prev) => ({ ...prev, [sectionId]: value }))
    if (errors[sectionId]) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[sectionId]
        return newErrors
      })
    }
  }

  // 리스트 아이템 추가
  const addListItem = (sectionId: string, section: TemplateSection) => {
    const currentList = (content[sectionId] as string[]) || []
    if (!section.maxItems || currentList.length < section.maxItems) {
      updateValue(sectionId, [...currentList, ''])
    }
  }

  // 리스트 아이템 삭제
  const removeListItem = (sectionId: string, index: number, section: TemplateSection) => {
    const currentList = (content[sectionId] as string[]) || []
    if (!section.minItems || currentList.length > section.minItems) {
      updateValue(
        sectionId,
        currentList.filter((_, i) => i !== index)
      )
    }
  }

  // Q&A 아이템 추가
  const addQAItem = (sectionId: string, section: TemplateSection) => {
    const currentList = (content[sectionId] as Array<{ question: string; answer: string }>) || []
    if (!section.maxItems || currentList.length < section.maxItems) {
      updateValue(sectionId, [...currentList, { question: '', answer: '' }])
    }
  }

  // Q&A 아이템 삭제
  const removeQAItem = (sectionId: string, index: number, section: TemplateSection) => {
    const currentList = (content[sectionId] as Array<{ question: string; answer: string }>) || []
    if (!section.minItems || currentList.length > section.minItems) {
      updateValue(
        sectionId,
        currentList.filter((_, i) => i !== index)
      )
    }
  }

  // 섹션 렌더링
  const renderSection = (section: TemplateSection) => {
    const value = content[section.id]
    const error = errors[section.id]

    return (
      <div key={section.id} className="space-y-3">
        {/* 헤더 */}
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
              <span>{section.emoji}</span>
              {section.label}
              {section.required && <span className="text-red-500">*</span>}
            </h3>
            {section.description && (
              <p className="text-sm text-gray-500 mt-1">{section.description}</p>
            )}
            {section.guide && (
              <p className="text-sm text-blue-600 mt-1 italic">{section.guide}</p>
            )}
          </div>
          {section.estimatedMinutes && (
            <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded">
              약 {section.estimatedMinutes}분
            </span>
          )}
        </div>

        {/* 필드 */}
        {section.type === 'textarea' && (
          <div className="relative">
            <Textarea
              value={(value as string) || ''}
              onChange={(e) => updateValue(section.id, e.target.value)}
              placeholder={section.placeholder}
              rows={6}
              className={error ? 'border-red-500' : ''}
            />
            {(section.minLength || section.maxLength) && (
              <div className="absolute bottom-2 right-2 text-xs text-gray-400">
                {((value as string) || '').length}
                {section.maxLength && `/${section.maxLength}`}자
                {section.minLength && ((value as string) || '').length < section.minLength && (
                  <span className="text-orange-500 ml-1">(최소 {section.minLength}자)</span>
                )}
              </div>
            )}
          </div>
        )}

        {section.type === 'text' && (
          <div className="relative">
            <Input
              value={(value as string) || ''}
              onChange={(e) => updateValue(section.id, e.target.value)}
              placeholder={section.placeholder}
              className={error ? 'border-red-500' : ''}
              maxLength={section.maxLength}
            />
            {section.maxLength && (
              <div className="absolute top-1/2 -translate-y-1/2 right-3 text-xs text-gray-400">
                {((value as string) || '').length}/{section.maxLength}
              </div>
            )}
          </div>
        )}

        {section.type === 'rating' && (
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => updateValue(section.id, star)}
                className="p-1 hover:scale-110 transition-transform"
              >
                <Star
                  className={`w-8 h-8 ${
                    star <= ((value as number) || 0)
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'text-gray-300'
                  }`}
                />
              </button>
            ))}
            {(value as number) > 0 && (
              <span className="ml-2 text-sm text-gray-500">{value as number}점</span>
            )}
          </div>
        )}

        {section.type === 'list' && (
          <div className="space-y-2">
            {((value as string[]) || []).map((item, index) => (
              <div key={index} className="flex items-center gap-2">
                <span className="text-gray-400 text-sm w-6">{index + 1}.</span>
                <Input
                  value={item}
                  onChange={(e) => {
                    const newList = [...((value as string[]) || [])]
                    newList[index] = e.target.value
                    updateValue(section.id, newList)
                  }}
                  placeholder={section.placeholder}
                  className="flex-1"
                />
                {(!section.minItems || ((value as string[]) || []).length > section.minItems) && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeListItem(section.id, index, section)}
                  >
                    <Trash2 className="w-4 h-4 text-gray-400" />
                  </Button>
                )}
              </div>
            ))}
            {(!section.maxItems || ((value as string[]) || []).length < section.maxItems) && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => addListItem(section.id, section)}
                className="w-full"
              >
                <Plus className="w-4 h-4 mr-1" />
                항목 추가
              </Button>
            )}
          </div>
        )}

        {section.type === 'qa_list' && (
          <div className="space-y-4">
            {((value as Array<{ question: string; answer: string }>) || []).map((item, index) => (
              <div key={index} className="p-4 bg-gray-50 rounded-lg space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-700">질문 {index + 1}</span>
                  {(!section.minItems ||
                    ((value as Array<{ question: string; answer: string }>) || []).length >
                      section.minItems) && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeQAItem(section.id, index, section)}
                    >
                      <Trash2 className="w-4 h-4 text-gray-400" />
                    </Button>
                  )}
                </div>
                <Input
                  value={item.question}
                  onChange={(e) => {
                    const newList = [
                      ...((value as Array<{ question: string; answer: string }>) || []),
                    ]
                    newList[index] = { ...newList[index], question: e.target.value }
                    updateValue(section.id, newList)
                  }}
                  placeholder="질문을 입력하세요"
                />
                <Textarea
                  value={item.answer}
                  onChange={(e) => {
                    const newList = [
                      ...((value as Array<{ question: string; answer: string }>) || []),
                    ]
                    newList[index] = { ...newList[index], answer: e.target.value }
                    updateValue(section.id, newList)
                  }}
                  placeholder="내 생각을 입력하세요"
                  rows={3}
                />
              </div>
            ))}
            {(!section.maxItems ||
              ((value as Array<{ question: string; answer: string }>) || []).length <
                section.maxItems) && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => addQAItem(section.id, section)}
                className="w-full"
              >
                <Plus className="w-4 h-4 mr-1" />
                질문 추가
              </Button>
            )}
          </div>
        )}

        {/* 에러 메시지 */}
        {error && <p className="text-sm text-red-500">{error}</p>}
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* 섹션들 */}
      <div className="bg-white rounded-xl border p-6 space-y-8">
        {sections.map(renderSection)}
      </div>

      {/* 하단 버튼 */}
      <div className="sticky bottom-4 bg-white rounded-xl border p-4 shadow-lg">
        <div className="flex items-center justify-between gap-4">
          <div className="text-sm text-gray-500">
            {lastSaved && (
              <span>
                마지막 저장: {lastSaved.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={() => handleSave(false)} disabled={isSaving}>
              {isSaving ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              임시저장
            </Button>
            <Button onClick={handleSubmit} disabled={isSubmitting} className="flex-1 min-w-[120px]">
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Send className="w-4 h-4 mr-2" />
              )}
              제출하기
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
