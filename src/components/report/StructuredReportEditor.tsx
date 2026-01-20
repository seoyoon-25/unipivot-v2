'use client'

import { useState, useEffect, useCallback } from 'react'
import { Loader2, Save, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import {
  ReportStructureCode,
  ReportSection,
  ReportTemplateStructure,
  SectionData,
  StructuredReportData,
} from '@/types/report'
import { QuoteSection } from './QuoteSection'
import { ListSection } from './ListSection'
import { EmotionSection } from './EmotionSection'
import { QuestionsSection } from './QuestionsSection'

interface StructuredReportEditorProps {
  structure: ReportStructureCode
  template: ReportTemplateStructure
  // Controlled mode
  value?: StructuredReportData
  onChange?: (data: StructuredReportData) => void
  // Uncontrolled mode
  initialData?: StructuredReportData
  title?: string
  onTitleChange?: (title: string) => void
  onSave?: (data: StructuredReportData) => void
  onDraft?: (data: StructuredReportData) => void
  isSubmitting?: boolean
  autoSaveKey?: string
  // Additional for controlled mode
  programId?: string
  sessionId?: string
}

export function StructuredReportEditor({
  structure,
  template,
  value,
  onChange,
  initialData,
  title = '',
  onTitleChange,
  onSave,
  onDraft,
  isSubmitting = false,
  autoSaveKey,
  programId,
  sessionId,
}: StructuredReportEditorProps) {
  // Controlled mode: use value prop, otherwise internal state
  const isControlled = value !== undefined && onChange !== undefined
  const [internalSections, setInternalSections] = useState<Record<string, SectionData>>(() => {
    if (initialData?.sections) {
      return initialData.sections
    }
    return {}
  })

  const sections = isControlled ? (value?.sections || {}) : internalSections
  const setSections = isControlled
    ? (updater: Record<string, SectionData> | ((prev: Record<string, SectionData>) => Record<string, SectionData>)) => {
        const newSections = typeof updater === 'function' ? updater(sections) : updater
        onChange({ ...value, sections: newSections })
      }
    : setInternalSections

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [lastSaved, setLastSaved] = useState<Date | null>(null)

  // Compute autoSave key
  const effectiveAutoSaveKey = autoSaveKey || (programId && sessionId ? `structured-report-draft-${programId}-${sessionId}` : undefined)

  // Auto-save to localStorage (only for uncontrolled mode)
  useEffect(() => {
    if (!effectiveAutoSaveKey || isControlled) return

    const savedData = localStorage.getItem(effectiveAutoSaveKey)
    if (savedData && !initialData) {
      try {
        const parsed = JSON.parse(savedData)
        if (parsed.sections) {
          setInternalSections(parsed.sections)
        }
      } catch {
        // Ignore parse errors
      }
    }
  }, [effectiveAutoSaveKey, initialData, isControlled])

  // Save to localStorage on change
  useEffect(() => {
    if (!effectiveAutoSaveKey) return

    const timer = setTimeout(() => {
      const data: StructuredReportData = {
        structure,
        sections,
      }
      localStorage.setItem(effectiveAutoSaveKey, JSON.stringify(data))
      setLastSaved(new Date())
    }, 2000)

    return () => clearTimeout(timer)
  }, [sections, structure, effectiveAutoSaveKey])

  const handleSectionChange = useCallback((sectionId: string, data: SectionData) => {
    setSections((prev) => ({
      ...prev,
      [sectionId]: data,
    }))

    // Clear error when user edits
    if (errors[sectionId]) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[sectionId]
        return newErrors
      })
    }
  }, [errors])

  const validateSections = (): boolean => {
    const newErrors: Record<string, string> = {}

    template.sections.forEach((section) => {
      if (section.required) {
        const data = sections[section.id]

        if (!data) {
          newErrors[section.id] = '필수 항목입니다'
          return
        }

        // Validate based on type
        if (typeof data === 'string' && !data.trim()) {
          newErrors[section.id] = '필수 항목입니다'
        } else if (section.type === 'quote') {
          const quoteData = data as { quote?: string; reason?: string }
          if (!quoteData.quote?.trim()) {
            newErrors[section.id] = '구절을 입력해주세요'
          }
        } else if (section.type === 'list') {
          const listData = data as { items?: string[] }
          if (!listData.items || listData.items.length === 0 || !listData.items.some((i) => i.trim())) {
            newErrors[section.id] = '최소 하나의 항목을 입력해주세요'
          }
        } else if (section.type === 'emotion') {
          const emotionData = data as { emotions?: string[]; description?: string }
          if (!emotionData.emotions || emotionData.emotions.length === 0) {
            newErrors[section.id] = '감정을 선택해주세요'
          }
        }
      }
    })

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = () => {
    if (!validateSections()) {
      return
    }

    const data: StructuredReportData = {
      structure,
      sections,
    }
    onSave?.(data)

    // Clear localStorage on submit
    if (effectiveAutoSaveKey) {
      localStorage.removeItem(effectiveAutoSaveKey)
    }
  }

  const handleDraft = () => {
    const data: StructuredReportData = {
      structure,
      sections,
    }
    onDraft?.(data)
  }

  // Calculate progress
  const totalSections = template.sections.filter((s) => s.required).length
  const completedSections = template.sections.filter((s) => {
    if (!s.required) return false
    const data = sections[s.id]
    if (!data) return false
    if (typeof data === 'string') return data.trim().length > 0
    if (s.type === 'list') {
      const listData = data as { items?: string[] }
      return listData.items && listData.items.some((i) => i.trim())
    }
    return true
  }).length

  const progress = totalSections > 0 ? Math.round((completedSections / totalSections) * 100) : 0

  return (
    <div className="space-y-6">
      {/* Title Input */}
      {onTitleChange && (
        <div className="space-y-2">
          <Label htmlFor="report-title">제목 (선택)</Label>
          <Input
            id="report-title"
            value={title}
            onChange={(e) => onTitleChange(e.target.value)}
            placeholder="독후감 제목을 입력해주세요"
          />
        </div>
      )}

      {/* Progress Bar */}
      <div className="bg-gray-50 rounded-lg p-4">
        <div className="flex items-center justify-between text-sm mb-2">
          <span className="text-gray-600">작성 진행률</span>
          <span className="font-medium">{progress}% ({completedSections}/{totalSections})</span>
        </div>
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-primary transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
        {lastSaved && (
          <p className="text-xs text-gray-500 mt-2">
            자동 저장됨: {lastSaved.toLocaleTimeString('ko-KR')}
          </p>
        )}
      </div>

      {/* Sections */}
      <div className="space-y-6">
        {template.sections.map((section) => (
          <SectionRenderer
            key={section.id}
            section={section}
            value={sections[section.id]}
            onChange={(data) => handleSectionChange(section.id, data)}
            error={errors[section.id]}
          />
        ))}
      </div>

      {/* Actions - only show in uncontrolled mode */}
      {!isControlled && onSave && (
        <div className="flex items-center justify-between pt-4 border-t">
          {onDraft && (
            <Button type="button" variant="outline" onClick={handleDraft}>
              <Save className="w-4 h-4 mr-2" />
              임시저장
            </Button>
          )}
          <div className="flex-1" />
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                제출 중...
              </>
            ) : (
              '제출하기'
            )}
          </Button>
        </div>
      )}
    </div>
  )
}

// Section Renderer
function SectionRenderer({
  section,
  value,
  onChange,
  error,
}: {
  section: ReportSection
  value: SectionData | undefined
  onChange: (data: SectionData) => void
  error?: string
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <span className="text-xl">{section.emoji}</span>
        <h3 className="font-semibold text-gray-900">{section.title}</h3>
        {section.required && <span className="text-red-500">*</span>}
      </div>

      {section.guide && (
        <p className="text-sm text-gray-500">{section.guide}</p>
      )}

      {error && (
        <div className="flex items-center gap-2 text-red-600 text-sm">
          <AlertCircle className="w-4 h-4" />
          {error}
        </div>
      )}

      <div className={cn(error && 'ring-2 ring-red-200 rounded-lg')}>
        {section.type === 'textarea' && (
          <Textarea
            value={(value as string) || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={section.placeholder}
            rows={6}
            className="resize-none"
          />
        )}

        {section.type === 'quote' && (
          <QuoteSection
            value={value as { quote?: string; page?: string; reason?: string; explanation?: string }}
            onChange={onChange}
            fields={section.fields}
          />
        )}

        {section.type === 'list' && (
          <ListSection
            value={value as { items?: string[] }}
            onChange={onChange}
            placeholder={section.placeholder}
          />
        )}

        {section.type === 'emotion' && (
          <EmotionSection
            value={value as { emotions?: string[]; description?: string }}
            onChange={onChange}
            options={section.options || []}
          />
        )}

        {section.type === 'questions' && (
          <QuestionsSection
            value={value as { questions?: string[] }}
            onChange={onChange}
          />
        )}
      </div>
    </div>
  )
}
