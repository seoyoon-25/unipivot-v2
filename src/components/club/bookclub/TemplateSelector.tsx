'use client'

import { REPORT_STRUCTURES } from '@/types/report'
import type { ReportStructureCode, ReportTemplate } from '@/types/report'

interface TemplateSelectorProps {
  templates: ReportTemplate[]
  selectedCode: ReportStructureCode | null
  onSelect: (template: ReportTemplate) => void
}

export default function TemplateSelector({
  templates,
  selectedCode,
  onSelect,
}: TemplateSelectorProps) {
  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium text-zinc-700">독후감 형식 선택</h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {templates.map((template) => {
          const structureInfo = REPORT_STRUCTURES[template.code]
          const isSelected = selectedCode === template.code

          return (
            <button
              key={template.id}
              onClick={() => onSelect(template)}
              className={`p-3 rounded-lg border-2 text-left transition-all ${
                isSelected
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-zinc-200 hover:border-zinc-300 bg-white'
              }`}
            >
              <div className="text-lg mb-1">{structureInfo?.icon || '📝'}</div>
              <div className="font-medium text-sm text-zinc-900">{template.name}</div>
              {template.description && (
                <div className="text-xs text-zinc-500 mt-0.5 line-clamp-2">
                  {template.description}
                </div>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
