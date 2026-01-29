'use client'

import { useState } from 'react'
import Link from 'next/link'
import { BarChart3, Users, CheckCircle2, Circle, Loader2, ExternalLink } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { toast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'

interface SurveyOption {
  id: string
  text: string
  responseCount: number
  color?: string
}

interface Survey {
  id: string
  title: string
  description?: string | null
  type: string
  responseCount: number
  options: SurveyOption[]
}

interface SurveyCardProps {
  survey: Survey
  onRespond?: () => void
  className?: string
}

export function SurveyCard({ survey, onRespond, className }: SurveyCardProps) {
  const [selectedOption, setSelectedOption] = useState<string | null>(null)
  const [hasResponded, setHasResponded] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const [localOptions, setLocalOptions] = useState(survey.options)
  const [localResponseCount, setLocalResponseCount] = useState(survey.responseCount)

  const totalResponses = localResponseCount

  const handleSubmit = async () => {
    if (!selectedOption) {
      toast({
        title: '선택 필요',
        description: '답변을 선택해주세요',
        variant: 'destructive'
      })
      return
    }

    try {
      setSubmitting(true)
      const response = await fetch(`/api/issue-surveys/${survey.id}/respond`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ optionId: selectedOption })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || '응답 저장에 실패했습니다')
      }

      // 로컬 상태 업데이트
      setLocalOptions(prev => prev.map(opt =>
        opt.id === selectedOption
          ? { ...opt, responseCount: opt.responseCount + 1 }
          : opt
      ))
      setLocalResponseCount(prev => prev + 1)
      setHasResponded(true)
      setShowResults(true)

      toast({
        title: '응답 완료',
        description: '소중한 의견 감사합니다!'
      })

      onRespond?.()
    } catch (error: any) {
      toast({
        title: '오류',
        description: error.message,
        variant: 'destructive'
      })
    } finally {
      setSubmitting(false)
    }
  }

  // 결과 보기 (응답 후)
  if (showResults || hasResponded) {
    return (
      <Card className={cn('overflow-hidden', className)}>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-base">{survey.title}</CardTitle>
              {survey.description && (
                <CardDescription className="mt-1">{survey.description}</CardDescription>
              )}
            </div>
            <Badge variant="secondary" className="flex items-center gap-1">
              <Users className="w-3 h-3" />
              {totalResponses}명 참여
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {localOptions.map(option => {
              const percentage = totalResponses > 0
                ? Math.round((option.responseCount / totalResponses) * 100)
                : 0
              const isSelected = option.id === selectedOption

              return (
                <div key={option.id} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className={cn(
                      'flex items-center gap-2',
                      isSelected && 'font-medium text-primary'
                    )}>
                      {isSelected && <CheckCircle2 className="w-4 h-4" />}
                      {option.text}
                    </span>
                    <span className="text-gray-500">{percentage}%</span>
                  </div>
                  <Progress
                    value={percentage}
                    className={cn(
                      'h-2',
                      isSelected && '[&>div]:bg-primary'
                    )}
                  />
                  <p className="text-xs text-gray-400 text-right">
                    {option.responseCount}명
                  </p>
                </div>
              )
            })}
          </div>

          {hasResponded && (
            <p className="mt-4 text-sm text-center text-green-600 flex items-center justify-center gap-1">
              <CheckCircle2 className="w-4 h-4" />
              응답이 저장되었습니다
            </p>
          )}

          <Link
            href={`/surveys/${survey.id}`}
            className="mt-4 flex items-center justify-center gap-1 text-sm text-gray-500 hover:text-primary transition-colors"
          >
            다른 의견 보기
            <ExternalLink className="w-3 h-3" />
          </Link>
        </CardContent>
      </Card>
    )
  }

  // 투표 폼
  return (
    <Card className={cn('overflow-hidden', className)}>
      <CardHeader className="pb-3 bg-gradient-to-r from-primary/5 to-transparent">
        <div className="flex items-start justify-between">
          <div>
            <Badge variant="outline" className="mb-2">
              <BarChart3 className="w-3 h-3 mr-1" />
              설문조사
            </Badge>
            <CardTitle className="text-base">{survey.title}</CardTitle>
            {survey.description && (
              <CardDescription className="mt-1">{survey.description}</CardDescription>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        <RadioGroup
          value={selectedOption || ''}
          onValueChange={setSelectedOption}
          className="space-y-2"
        >
          {survey.options.map(option => (
            <div
              key={option.id}
              className={cn(
                'flex items-center space-x-3 p-3 rounded-lg border transition-colors cursor-pointer',
                selectedOption === option.id
                  ? 'border-primary bg-primary/5'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              )}
              onClick={() => setSelectedOption(option.id)}
            >
              <RadioGroupItem value={option.id} id={option.id} />
              <Label htmlFor={option.id} className="flex-1 cursor-pointer">
                {option.text}
              </Label>
            </div>
          ))}
        </RadioGroup>

        <div className="mt-4 flex items-center justify-between">
          <Button
            onClick={() => setShowResults(true)}
            variant="ghost"
            size="sm"
            className="text-gray-500"
          >
            결과 보기
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!selectedOption || submitting}
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                제출 중...
              </>
            ) : (
              '투표하기'
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
