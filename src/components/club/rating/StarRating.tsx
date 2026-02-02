'use client'

import { useState } from 'react'
import { Star } from 'lucide-react'

interface Props {
  value: number | null
  onChange: (rating: number | null) => void
  size?: 'sm' | 'md' | 'lg'
  readonly?: boolean
}

const sizes = {
  sm: 'w-4 h-4',
  md: 'w-6 h-6',
  lg: 'w-8 h-8',
}

export default function StarRating({ value, onChange, size = 'md', readonly = false }: Props) {
  const [hovered, setHovered] = useState<number | null>(null)

  const displayValue = hovered ?? value ?? 0

  const handleClick = (rating: number) => {
    if (readonly) return
    onChange(value === rating ? null : rating)
  }

  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => handleClick(star)}
          onMouseEnter={() => !readonly && setHovered(star)}
          onMouseLeave={() => setHovered(null)}
          disabled={readonly}
          className={`transition-colors ${readonly ? 'cursor-default' : 'cursor-pointer'}`}
          aria-label={`${star}점`}
        >
          <Star
            className={`${sizes[size]} ${
              star <= displayValue
                ? 'fill-yellow-400 text-yellow-400'
                : 'fill-none text-gray-300'
            }`}
          />
        </button>
      ))}
      {value !== null && value !== undefined && (
        <span className="ml-2 text-sm text-gray-600">{value}점</span>
      )}
    </div>
  )
}
