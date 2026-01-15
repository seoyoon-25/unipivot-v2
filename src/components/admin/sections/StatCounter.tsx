'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FormField, TextField, SwitchField } from './FormField'
import { Plus, Trash2, BarChart3 } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface StatItem {
  label: string
  value: number
  autoCalculate: boolean
  icon?: string
}

interface StatCounterProps {
  label: string
  description?: string
  stats: StatItem[]
  onChange: (stats: StatItem[]) => void
  maxCount?: number
  className?: string
}

export function StatCounter({
  label,
  description,
  stats,
  onChange,
  maxCount = 5,
  className
}: StatCounterProps) {
  const handleStatChange = (index: number, field: keyof StatItem, value: any) => {
    const newStats = [...stats]
    newStats[index] = { ...newStats[index], [field]: value }
    onChange(newStats)
  }

  const handleAddStat = () => {
    if (stats.length < maxCount) {
      const newStat: StatItem = {
        label: '',
        value: 0,
        autoCalculate: false
      }
      onChange([...stats, newStat])
    }
  }

  const handleRemoveStat = (index: number) => {
    const newStats = stats.filter((_, i) => i !== index)
    onChange(newStats)
  }

  return (
    <FormField
      label={label}
      description={description}
      className={className}
    >
      <div className="space-y-4">
        {stats.map((stat, index) => (
          <Card key={index} className="relative">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm flex items-center gap-2">
                  <BarChart3 className="h-4 w-4" />
                  통계 {index + 1}
                </CardTitle>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleRemoveStat(index)}
                  className="h-8 w-8 text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <TextField
                  label="라벨"
                  value={stat.label}
                  onChange={(value) => handleStatChange(index, 'label', value)}
                  placeholder="예: 전체 회원"
                  required
                />
                <TextField
                  label="값"
                  type="number"
                  value={stat.value.toString()}
                  onChange={(value) => handleStatChange(index, 'value', parseInt(value) || 0)}
                  placeholder="0"
                  required
                />
              </div>
              <SwitchField
                label="자동 계산"
                description="체크하면 데이터베이스에서 자동으로 계산됩니다"
                checked={stat.autoCalculate}
                onCheckedChange={(checked) => handleStatChange(index, 'autoCalculate', checked)}
              />
            </CardContent>
          </Card>
        ))}

        {/* Add Button */}
        {stats.length < maxCount && (
          <Button
            variant="outline"
            onClick={handleAddStat}
            className="w-full h-20 border-dashed"
          >
            <Plus className="h-4 w-4 mr-2" />
            통계 추가 ({stats.length}/{maxCount})
          </Button>
        )}
      </div>
    </FormField>
  )
}

// CTA 버튼 관리 컴포넌트
export interface CTAButton {
  text: string
  link: string
  variant: 'primary' | 'secondary'
}

interface CTAButtonManagerProps {
  label: string
  description?: string
  buttons: CTAButton[]
  onChange: (buttons: CTAButton[]) => void
  maxCount?: number
  className?: string
}

export function CTAButtonManager({
  label,
  description,
  buttons,
  onChange,
  maxCount = 3,
  className
}: CTAButtonManagerProps) {
  const handleButtonChange = (index: number, field: keyof CTAButton, value: any) => {
    const newButtons = [...buttons]
    newButtons[index] = { ...newButtons[index], [field]: value }
    onChange(newButtons)
  }

  const handleAddButton = () => {
    if (buttons.length < maxCount) {
      const newButton: CTAButton = {
        text: '',
        link: '',
        variant: 'primary'
      }
      onChange([...buttons, newButton])
    }
  }

  const handleRemoveButton = (index: number) => {
    const newButtons = buttons.filter((_, i) => i !== index)
    onChange(newButtons)
  }

  return (
    <FormField
      label={label}
      description={description}
      className={className}
    >
      <div className="space-y-4">
        {buttons.map((button, index) => (
          <Card key={index} className="relative">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm">CTA 버튼 {index + 1}</CardTitle>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleRemoveButton(index)}
                  className="h-8 w-8 text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <TextField
                  label="버튼 텍스트"
                  value={button.text}
                  onChange={(value) => handleButtonChange(index, 'text', value)}
                  placeholder="예: 프로그램 둘러보기"
                  required
                />
                <TextField
                  label="링크"
                  type="url"
                  value={button.link}
                  onChange={(value) => handleButtonChange(index, 'link', value)}
                  placeholder="/programs 또는 https://example.com"
                  required
                />
              </div>
              <FormField label="버튼 스타일">
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant={button.variant === 'primary' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleButtonChange(index, 'variant', 'primary')}
                  >
                    Primary
                  </Button>
                  <Button
                    type="button"
                    variant={button.variant === 'secondary' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleButtonChange(index, 'variant', 'secondary')}
                  >
                    Secondary
                  </Button>
                </div>
              </FormField>
            </CardContent>
          </Card>
        ))}

        {/* Add Button */}
        {buttons.length < maxCount && (
          <Button
            variant="outline"
            onClick={handleAddButton}
            className="w-full h-16 border-dashed"
          >
            <Plus className="h-4 w-4 mr-2" />
            CTA 버튼 추가 ({buttons.length}/{maxCount})
          </Button>
        )}
      </div>
    </FormField>
  )
}