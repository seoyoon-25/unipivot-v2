'use client'

import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ReportField } from '@/types/report'

interface QuoteSectionData {
  quote?: string
  page?: string
  reason?: string
  explanation?: string
}

interface QuoteSectionProps {
  value: QuoteSectionData | undefined
  onChange: (data: QuoteSectionData) => void
  fields?: ReportField[]
}

export function QuoteSection({ value, onChange, fields }: QuoteSectionProps) {
  const data = value || {}

  const handleChange = (field: string, fieldValue: string) => {
    onChange({
      ...data,
      [field]: fieldValue,
    })
  }

  // Use custom fields if provided, otherwise use defaults
  if (fields && fields.length > 0) {
    return (
      <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
        {fields.map((field) => (
          <div key={field.id} className="space-y-2">
            <Label htmlFor={`quote-${field.id}`}>
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            {field.type === 'textarea' ? (
              <Textarea
                id={`quote-${field.id}`}
                value={(data as Record<string, string>)[field.id] || ''}
                onChange={(e) => handleChange(field.id, e.target.value)}
                placeholder={field.placeholder}
                rows={4}
                className="resize-none bg-white"
              />
            ) : (
              <Input
                id={`quote-${field.id}`}
                value={(data as Record<string, string>)[field.id] || ''}
                onChange={(e) => handleChange(field.id, e.target.value)}
                placeholder={field.placeholder}
                className="bg-white"
              />
            )}
          </div>
        ))}
      </div>
    )
  }

  // Default layout
  return (
    <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
      <div className="space-y-2">
        <Label htmlFor="quote-text">
          구절 <span className="text-red-500">*</span>
        </Label>
        <Textarea
          id="quote-text"
          value={data.quote || ''}
          onChange={(e) => handleChange('quote', e.target.value)}
          placeholder="인상 깊은 구절을 적어주세요"
          rows={4}
          className="resize-none bg-white italic"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="quote-page">페이지</Label>
        <Input
          id="quote-page"
          value={data.page || ''}
          onChange={(e) => handleChange('page', e.target.value)}
          placeholder="p.123"
          className="w-32 bg-white"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="quote-reason">
          선택 이유 <span className="text-red-500">*</span>
        </Label>
        <Textarea
          id="quote-reason"
          value={data.reason || ''}
          onChange={(e) => handleChange('reason', e.target.value)}
          placeholder="이 구절을 선택한 이유는?"
          rows={3}
          className="resize-none bg-white"
        />
      </div>
    </div>
  )
}
