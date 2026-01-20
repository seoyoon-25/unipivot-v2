'use client'

import { Plus, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'

interface ListSectionData {
  items?: string[]
}

interface ListSectionProps {
  value: ListSectionData | undefined
  onChange: (data: ListSectionData) => void
  placeholder?: string
  maxItems?: number
}

export function ListSection({
  value,
  onChange,
  placeholder = '내용을 입력해주세요',
  maxItems = 10,
}: ListSectionProps) {
  const items = value?.items || ['']

  const handleItemChange = (index: number, text: string) => {
    const newItems = [...items]
    newItems[index] = text
    onChange({ items: newItems })
  }

  const addItem = () => {
    if (items.length < maxItems) {
      onChange({ items: [...items, ''] })
    }
  }

  const removeItem = (index: number) => {
    if (items.length > 1) {
      const newItems = items.filter((_, i) => i !== index)
      onChange({ items: newItems })
    }
  }

  return (
    <div className="space-y-3">
      {items.map((item, index) => (
        <div key={index} className="flex gap-2">
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-medium">
            {index + 1}
          </div>
          <Textarea
            value={item}
            onChange={(e) => handleItemChange(index, e.target.value)}
            placeholder={placeholder}
            rows={2}
            className="flex-1 resize-none"
          />
          {items.length > 1 && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => removeItem(index)}
              className="flex-shrink-0 text-gray-400 hover:text-red-500"
            >
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>
      ))}

      {items.length < maxItems && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addItem}
          className="w-full"
        >
          <Plus className="w-4 h-4 mr-2" />
          항목 추가
        </Button>
      )}

      {items.length >= maxItems && (
        <p className="text-sm text-gray-500 text-center">
          최대 {maxItems}개까지 추가할 수 있습니다
        </p>
      )}
    </div>
  )
}
