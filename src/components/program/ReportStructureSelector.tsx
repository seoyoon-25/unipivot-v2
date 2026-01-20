'use client'

import { useState } from 'react'
import { Check, Eye } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  ReportStructureCode,
  REPORT_STRUCTURES,
  ReportTemplateStructure,
} from '@/types/report'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

interface TemplateOption {
  code: ReportStructureCode
  name: string
  icon: string
  description: string
  color: string
  hoverColor: string
  selectedColor: string
}

const templateOptions: TemplateOption[] = [
  {
    code: 'BONGGAEJEOK',
    name: '본깨적 (실천형)',
    icon: '✅',
    description: '자기계발서, 실천 중심',
    color: 'bg-green-50 border-green-200',
    hoverColor: 'hover:bg-green-100 hover:border-green-300',
    selectedColor: 'ring-2 ring-green-500 border-green-500 bg-green-50',
  },
  {
    code: 'OREO',
    name: 'OREO (비판형)',
    icon: '💭',
    description: '철학/인문서, 비판적 사고',
    color: 'bg-purple-50 border-purple-200',
    hoverColor: 'hover:bg-purple-100 hover:border-purple-300',
    selectedColor: 'ring-2 ring-purple-500 border-purple-500 bg-purple-50',
  },
  {
    code: '4F',
    name: '4F (감성형)',
    icon: '❤️',
    description: '문학/소설, 감성 공감',
    color: 'bg-pink-50 border-pink-200',
    hoverColor: 'hover:bg-pink-100 hover:border-pink-300',
    selectedColor: 'ring-2 ring-pink-500 border-pink-500 bg-pink-50',
  },
  {
    code: 'PMI',
    name: 'PMI (균형형)',
    icon: '⚖️',
    description: '경영서, 균형 분석',
    color: 'bg-blue-50 border-blue-200',
    hoverColor: 'hover:bg-blue-100 hover:border-blue-300',
    selectedColor: 'ring-2 ring-blue-500 border-blue-500 bg-blue-50',
  },
  {
    code: 'FREE',
    name: '자유형식',
    icon: '✏️',
    description: '제약 없이 자유롭게',
    color: 'bg-gray-50 border-gray-200',
    hoverColor: 'hover:bg-gray-100 hover:border-gray-300',
    selectedColor: 'ring-2 ring-gray-500 border-gray-500 bg-gray-50',
  },
]

interface ReportStructureSelectorProps {
  value: ReportStructureCode | null
  onChange: (code: ReportStructureCode) => void
  disabled?: boolean
  showPreview?: boolean
  templates?: Record<ReportStructureCode, ReportTemplateStructure>
  recommendedStructure?: ReportStructureCode
}

export function ReportStructureSelector({
  value,
  onChange,
  disabled = false,
  showPreview = true,
  templates,
  recommendedStructure,
}: ReportStructureSelectorProps) {
  const [previewTemplate, setPreviewTemplate] = useState<TemplateOption | null>(null)

  const handlePreview = (template: TemplateOption, e: React.MouseEvent) => {
    e.stopPropagation()
    setPreviewTemplate(template)
  }

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {templateOptions.map((template) => {
          const isSelected = value === template.code
          const isRecommended = recommendedStructure === template.code

          return (
            <div
              key={template.code}
              onClick={() => !disabled && onChange(template.code)}
              className={cn(
                'relative p-4 rounded-xl border-2 cursor-pointer transition-all',
                isSelected ? template.selectedColor : template.color,
                !isSelected && !disabled && template.hoverColor,
                disabled && 'opacity-60 cursor-not-allowed'
              )}
            >
              {isRecommended && !isSelected && (
                <div className="absolute top-2 right-2">
                  <span className="px-2 py-0.5 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">
                    추천
                  </span>
                </div>
              )}
              {isSelected && (
                <div className="absolute top-2 right-2">
                  <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                </div>
              )}

              <div className="flex items-start gap-3">
                <span className="text-3xl">{template.icon}</span>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-gray-900 truncate">
                    {template.name}
                  </h4>
                  <p className="text-sm text-gray-600 mt-1">
                    {template.description}
                  </p>
                </div>
              </div>

              {showPreview && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="mt-3 w-full"
                  onClick={(e) => handlePreview(template, e)}
                >
                  <Eye className="w-4 h-4 mr-1" />
                  미리보기
                </Button>
              )}
            </div>
          )
        })}
      </div>

      {/* Preview Dialog */}
      <Dialog open={!!previewTemplate} onOpenChange={() => setPreviewTemplate(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <span className="text-2xl">{previewTemplate?.icon}</span>
              {previewTemplate?.name} 구조
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            {previewTemplate && (
              <TemplatePreview
                code={previewTemplate.code}
                templates={templates}
              />
            )}
          </div>

          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setPreviewTemplate(null)}>
              닫기
            </Button>
            <Button
              onClick={() => {
                if (previewTemplate) {
                  onChange(previewTemplate.code)
                  setPreviewTemplate(null)
                }
              }}
            >
              이 구조로 선택
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

// Template Preview Component
function TemplatePreview({
  code,
  templates,
}: {
  code: ReportStructureCode
  templates?: Record<ReportStructureCode, ReportTemplateStructure>
}) {
  // Default preview sections if templates not provided
  const defaultPreviews: Record<ReportStructureCode, { emoji: string; title: string }[]> = {
    BONGGAEJEOK: [
      { emoji: '👀', title: '본 것 (인상적인 구절)' },
      { emoji: '💡', title: '깨달은 것' },
      { emoji: '✍️', title: '적용할 것 (실천 계획)' },
      { emoji: '💬', title: '토론 질문 (선택)' },
    ],
    OREO: [
      { emoji: '🎯', title: '의견 (Opinion)' },
      { emoji: '🧠', title: '이유 (Reason)' },
      { emoji: '📖', title: '예시 (Example)' },
      { emoji: '✨', title: '최종 의견 (Opinion)' },
      { emoji: '💬', title: '토론 질문' },
    ],
    '4F': [
      { emoji: '📚', title: '사실 (Facts)' },
      { emoji: '💝', title: '감정 (Feelings)' },
      { emoji: '🔍', title: '발견 (Findings)' },
      { emoji: '🌟', title: '미래 (Future)' },
      { emoji: '💬', title: '토론 질문' },
    ],
    PMI: [
      { emoji: '➕', title: '좋은 점 (Plus)' },
      { emoji: '➖', title: '아쉬운 점 (Minus)' },
      { emoji: '💎', title: '흥미로운 점 (Interesting)' },
      { emoji: '📝', title: '종합 의견' },
      { emoji: '💬', title: '토론 질문' },
    ],
    FREE: [
      { emoji: '📝', title: '자유롭게 작성' },
      { emoji: '💬', title: '토론 질문 (선택)' },
    ],
  }

  const sections = templates?.[code]?.sections || defaultPreviews[code] || []

  return (
    <div className="space-y-2">
      {sections.map((section, index) => (
        <div
          key={index}
          className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
        >
          <span className="text-xl">{'emoji' in section ? section.emoji : ''}</span>
          <span className="text-gray-700">{'title' in section ? section.title : ''}</span>
        </div>
      ))}
    </div>
  )
}

// Compact version for display in lists
export function ReportStructureBadge({
  code,
  className,
}: {
  code: ReportStructureCode
  className?: string
}) {
  const info = REPORT_STRUCTURES[code] || REPORT_STRUCTURES.FREE

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium border',
        info.color,
        className
      )}
    >
      <span>{info.icon}</span>
      <span>{info.name}</span>
    </span>
  )
}
