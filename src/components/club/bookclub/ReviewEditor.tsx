'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, Send } from 'lucide-react'
import { submitBookReport, submitStructuredReport, updateBookReport, updateStructuredReport, getReportTemplates } from '@/lib/actions/review'
import StarRating from '@/components/club/rating/StarRating'
import { saveReviewDraft, loadReviewDraft, clearReviewDraft, formatCharCount, REVIEW_GUIDELINES } from '@/lib/utils/review'
import TemplateSelector from './TemplateSelector'
import AutoSaveIndicator from './AutoSaveIndicator'
import type { ReportTemplate, ReportStructureCode, StructuredReportData, SectionData, ReportSection } from '@/types/report'

interface ReviewEditorProps {
  programId: string
  sessionId: string
  bookTitle: string
  bookAuthor?: string | null
  existingReview?: {
    id: string
    title: string
    content: string
    visibility: string
    rating?: number | null
    structuredData?: {
      structure: string
      sections: Record<string, SectionData>
    } | null
  } | null
}

export default function ReviewEditor({
  programId,
  sessionId,
  bookTitle,
  bookAuthor,
  existingReview,
}: ReviewEditorProps) {
  const router = useRouter()
  const [title, setTitle] = useState(existingReview?.title || '')
  const [content, setContent] = useState(existingReview?.content || '')
  const [isPublic, setIsPublic] = useState(existingReview?.visibility !== 'PRIVATE')
  const [rating, setRating] = useState<number | null>(existingReview?.rating ?? null)
  const [templates, setTemplates] = useState<ReportTemplate[]>([])
  const [selectedTemplate, setSelectedTemplate] = useState<ReportTemplate | null>(null)
  const [structuredSections, setStructuredSections] = useState<Record<string, SectionData>>({})
  const [saving, setSaving] = useState(false)
  const [autoSaveStatus, setAutoSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null)
  const [error, setError] = useState('')
  const autoSaveTimer = useRef<NodeJS.Timeout | null>(null)
  const isEditing = !!existingReview

  // Load templates
  useEffect(() => {
    getReportTemplates().then((t) => {
      const mapped: ReportTemplate[] = t.map((tmpl) => ({
        id: tmpl.id,
        name: tmpl.name,
        code: tmpl.code as ReportStructureCode,
        description: tmpl.description,
        category: tmpl.category,
        icon: tmpl.icon,
        structure: tmpl.structure,
        isDefault: tmpl.isDefault,
        isActive: tmpl.isActive,
        sortOrder: tmpl.sortOrder,
      }))
      setTemplates(mapped)
      // If editing with structured data, find matching template
      if (existingReview?.structuredData) {
        const match = mapped.find(
          (tmpl) => tmpl.code === existingReview.structuredData?.structure
        )
        if (match) {
          setSelectedTemplate(match)
          setStructuredSections(existingReview.structuredData.sections)
        }
      }
    })
  }, [existingReview])

  // Load draft from localStorage (only for new reviews)
  useEffect(() => {
    if (!isEditing) {
      const draft = loadReviewDraft(programId, sessionId)
      if (draft) {
        setTitle(draft.title)
        setContent(draft.content)
        setIsPublic(draft.isPublic)
        setLastSavedAt(draft.savedAt)
        setAutoSaveStatus('saved')
      }
    }
  }, [programId, sessionId, isEditing])

  // Auto-save every 30 seconds
  const doAutoSave = useCallback(() => {
    if (!isEditing && (title || content)) {
      setAutoSaveStatus('saving')
      try {
        saveReviewDraft(programId, sessionId, { title, content, isPublic })
        setAutoSaveStatus('saved')
        setLastSavedAt(new Date().toISOString())
      } catch {
        setAutoSaveStatus('error')
      }
    }
  }, [title, content, isPublic, programId, sessionId, isEditing])

  useEffect(() => {
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current)
    autoSaveTimer.current = setTimeout(doAutoSave, 30000)
    return () => {
      if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current)
    }
  }, [doAutoSave])

  const handleTemplateSelect = (template: ReportTemplate) => {
    if (selectedTemplate?.code === template.code) {
      setSelectedTemplate(null)
      setStructuredSections({})
    } else {
      setSelectedTemplate(template)
      // Initialize sections if not already set
      if (Object.keys(structuredSections).length === 0) {
        const initial: Record<string, SectionData> = {}
        template.structure.sections.forEach((s) => {
          if (s.type === 'textarea') initial[s.id] = ''
          else if (s.type === 'quote') initial[s.id] = { quote: '', page: '', reason: '' }
          else if (s.type === 'list') initial[s.id] = { items: [''] }
          else if (s.type === 'emotion') initial[s.id] = { emotions: [], description: '' }
          else if (s.type === 'questions') initial[s.id] = { questions: [''] }
        })
        setStructuredSections(initial)
      }
    }
  }

  const updateSection = (sectionId: string, value: SectionData) => {
    setStructuredSections((prev) => ({ ...prev, [sectionId]: value }))
  }

  const handleSubmit = async () => {
    setError('')
    setSaving(true)
    try {
      if (isEditing) {
        if (selectedTemplate) {
          await updateStructuredReport(existingReview!.id, {
            title,
            structure: selectedTemplate.code,
            template: selectedTemplate.structure,
            data: { structure: selectedTemplate.code, sections: structuredSections },
            isPublic,
            rating,
          })
        } else {
          await updateBookReport(existingReview!.id, { title, content, isPublic, rating })
        }
      } else {
        if (selectedTemplate) {
          await submitStructuredReport({
            programId,
            sessionId,
            title,
            structure: selectedTemplate.code,
            template: selectedTemplate.structure,
            data: { structure: selectedTemplate.code, sections: structuredSections },
            isPublic,
            rating,
          })
        } else {
          await submitBookReport({ programId, sessionId, title, content, isPublic, rating })
        }
        clearReviewDraft(programId, sessionId)
      }
      router.push('/club/bookclub/reviews')
      router.refresh()
    } catch (e) {
      setError(e instanceof Error ? e.message : '저장에 실패했습니다')
    } finally {
      setSaving(false)
    }
  }

  const renderSectionEditor = (section: ReportSection) => {
    const value = structuredSections[section.id]

    if (section.type === 'textarea') {
      return (
        <textarea
          value={(value as string) || ''}
          onChange={(e) => updateSection(section.id, e.target.value)}
          placeholder={section.placeholder || `${section.title}을(를) 작성해주세요`}
          className="w-full rounded-lg border border-gray-300 p-3 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 min-h-[120px] resize-y"
        />
      )
    }

    if (section.type === 'quote') {
      const quoteData = (value || {}) as { quote?: string; page?: string; reason?: string }
      return (
        <div className="space-y-2">
          <textarea
            value={quoteData.quote || ''}
            onChange={(e) => updateSection(section.id, { ...quoteData, quote: e.target.value })}
            placeholder="인상 깊은 구절을 입력하세요"
            className="w-full rounded-lg border border-gray-300 p-3 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 min-h-[80px] resize-y"
          />
          <div className="flex gap-2">
            <input
              type="text"
              value={quoteData.page || ''}
              onChange={(e) => updateSection(section.id, { ...quoteData, page: e.target.value })}
              placeholder="페이지 (선택)"
              className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <textarea
            value={quoteData.reason || ''}
            onChange={(e) => updateSection(section.id, { ...quoteData, reason: e.target.value })}
            placeholder="이 구절을 선택한 이유"
            className="w-full rounded-lg border border-gray-300 p-3 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 min-h-[60px] resize-y"
          />
        </div>
      )
    }

    if (section.type === 'list') {
      const listData = (value || { items: [''] }) as { items?: string[] }
      const items = listData.items || ['']
      return (
        <div className="space-y-2">
          {items.map((item, i) => (
            <div key={i} className="flex gap-2">
              <span className="text-sm text-gray-400 pt-2">{i + 1}.</span>
              <input
                type="text"
                value={item}
                onChange={(e) => {
                  const newItems = [...items]
                  newItems[i] = e.target.value
                  updateSection(section.id, { items: newItems })
                }}
                placeholder={`항목 ${i + 1}`}
                className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>
          ))}
          <button
            type="button"
            onClick={() => updateSection(section.id, { items: [...items, ''] })}
            className="text-sm text-blue-600 hover:text-blue-700"
          >
            + 항목 추가
          </button>
        </div>
      )
    }

    if (section.type === 'emotion') {
      const emotionData = (value || { emotions: [], description: '' }) as { emotions?: string[]; description?: string }
      const options = section.options || ['감동', '놀라움', '공감', '분노', '슬픔', '기쁨', '두려움', '희망']
      return (
        <div className="space-y-3">
          <div className="flex flex-wrap gap-2">
            {options.map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => {
                  const emotions = emotionData.emotions || []
                  const updated = emotions.includes(opt)
                    ? emotions.filter((e) => e !== opt)
                    : [...emotions, opt]
                  updateSection(section.id, { ...emotionData, emotions: updated })
                }}
                className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
                  (emotionData.emotions || []).includes(opt)
                    ? 'bg-blue-100 border-blue-300 text-blue-700'
                    : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
          <textarea
            value={emotionData.description || ''}
            onChange={(e) => updateSection(section.id, { ...emotionData, description: e.target.value })}
            placeholder="감정에 대해 자세히 적어주세요"
            className="w-full rounded-lg border border-gray-300 p-3 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 min-h-[80px] resize-y"
          />
        </div>
      )
    }

    if (section.type === 'questions') {
      const questionsData = (value || { questions: [''] }) as { questions?: string[] }
      const questions = questionsData.questions || ['']
      return (
        <div className="space-y-2">
          {questions.map((q, i) => (
            <div key={i} className="flex gap-2">
              <span className="text-sm text-gray-400 pt-2">Q{i + 1}.</span>
              <input
                type="text"
                value={q}
                onChange={(e) => {
                  const newQ = [...questions]
                  newQ[i] = e.target.value
                  updateSection(section.id, { questions: newQ })
                }}
                placeholder={`토론 질문 ${i + 1}`}
                className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>
          ))}
          <button
            type="button"
            onClick={() => updateSection(section.id, { questions: [...questions, ''] })}
            className="text-sm text-blue-600 hover:text-blue-700"
          >
            + 질문 추가
          </button>
        </div>
      )
    }

    return null
  }

  return (
    <div className="space-y-6">
      {/* Book Info */}
      <div className="bg-blue-50 rounded-lg p-4">
        <div className="text-sm text-blue-600 font-medium">{bookTitle}</div>
        {bookAuthor && <div className="text-xs text-blue-500 mt-0.5">{bookAuthor}</div>}
      </div>

      {/* Template Selector */}
      <TemplateSelector
        templates={templates}
        selectedCode={selectedTemplate?.code || null}
        onSelect={handleTemplateSelect}
      />

      {/* Title */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">제목</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="독후감 제목을 입력하세요"
          className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          maxLength={REVIEW_GUIDELINES.titleMaxLength}
        />
      </div>

      {/* Content - either structured or free-form */}
      {selectedTemplate ? (
        <div className="space-y-5">
          {selectedTemplate.structure.sections.map((section) => (
            <div key={section.id}>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                {section.emoji} {section.title}
                {section.required && <span className="text-red-500 ml-1">*</span>}
              </label>
              {section.guide && (
                <p className="text-xs text-gray-500 mb-2">{section.guide}</p>
              )}
              {renderSectionEditor(section)}
            </div>
          ))}
        </div>
      ) : (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">내용</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="독후감을 작성해주세요"
            className="w-full rounded-lg border border-gray-300 p-4 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 min-h-[300px] resize-y"
            maxLength={REVIEW_GUIDELINES.maxLength}
          />
          <div className="text-right text-xs text-gray-400 mt-1">
            {formatCharCount(content.length, REVIEW_GUIDELINES.maxLength)}
          </div>
        </div>
      )}

      {/* Star Rating */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          이 책을 평가해주세요 <span className="text-gray-400 font-normal">(선택)</span>
        </label>
        <StarRating value={rating} onChange={setRating} size="lg" />
      </div>

      {/* Visibility + Auto-save status */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => setIsPublic(!isPublic)}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm border transition-colors ${
            isPublic
              ? 'bg-green-50 border-green-200 text-green-700'
              : 'bg-gray-50 border-gray-200 text-gray-600'
          }`}
        >
          {isPublic ? (
            <>
              <Eye className="w-4 h-4" />
              공개
            </>
          ) : (
            <>
              <EyeOff className="w-4 h-4" />
              비공개
            </>
          )}
        </button>
        <AutoSaveIndicator status={autoSaveStatus} lastSavedAt={lastSavedAt} />
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 text-red-700 text-sm rounded-lg p-3">{error}</div>
      )}

      {/* Submit */}
      <button
        onClick={handleSubmit}
        disabled={saving || !title.trim()}
        className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
      >
        <Send className="w-4 h-4" />
        {saving ? '저장 중...' : isEditing ? '수정하기' : '제출하기'}
      </button>
    </div>
  )
}
