'use client'

import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'

interface EmotionSectionData {
  emotions?: string[]
  description?: string
}

interface EmotionSectionProps {
  value: EmotionSectionData | undefined
  onChange: (data: EmotionSectionData) => void
  options: string[]
}

// Emotion emoji mapping
const emotionEmojis: Record<string, string> = {
  감동: '🥹',
  슬픔: '😢',
  기쁨: '😊',
  분노: '😠',
  불안: '😰',
  희망: '🌈',
  공감: '🤝',
  놀라움: '😲',
  그리움: '💭',
  평온: '😌',
  설렘: '💓',
  호기심: '🤔',
  답답함: '😤',
  뿌듯함: '😇',
  아쉬움: '😔',
}

export function EmotionSection({ value, onChange, options }: EmotionSectionProps) {
  const data = value || { emotions: [], description: '' }
  const selectedEmotions = data.emotions || []

  const toggleEmotion = (emotion: string) => {
    const newEmotions = selectedEmotions.includes(emotion)
      ? selectedEmotions.filter((e) => e !== emotion)
      : [...selectedEmotions, emotion]

    onChange({
      ...data,
      emotions: newEmotions,
    })
  }

  const handleDescriptionChange = (description: string) => {
    onChange({
      ...data,
      description,
    })
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>
          느낀 감정 선택 (다중 선택 가능) <span className="text-red-500">*</span>
        </Label>
        <div className="flex flex-wrap gap-2">
          {options.map((emotion) => {
            const isSelected = selectedEmotions.includes(emotion)
            const emoji = emotionEmojis[emotion] || '❤️'

            return (
              <button
                key={emotion}
                type="button"
                onClick={() => toggleEmotion(emotion)}
                className={cn(
                  'px-4 py-2 rounded-full border-2 transition-all',
                  'flex items-center gap-2 text-sm font-medium',
                  isSelected
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                )}
              >
                <span>{emoji}</span>
                <span>{emotion}</span>
              </button>
            )
          })}
        </div>
        {selectedEmotions.length > 0 && (
          <p className="text-sm text-gray-500">
            선택됨: {selectedEmotions.join(', ')}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="emotion-description">감정에 대해 설명해주세요</Label>
        <Textarea
          id="emotion-description"
          value={data.description || ''}
          onChange={(e) => handleDescriptionChange(e.target.value)}
          placeholder="왜 이런 감정을 느꼈는지 자세히 적어주세요"
          rows={4}
          className="resize-none"
        />
      </div>
    </div>
  )
}
