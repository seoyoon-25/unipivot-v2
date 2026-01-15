'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { SelectRoot as Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Calendar, TrendingUp, TrendingDown, Eye, MousePointer, Users, BarChart3, RefreshCw } from 'lucide-react'
import { toast } from '@/hooks/use-toast'

interface FloatingButtonAnalytics {
  button: {
    id: string
    title: string
  }
  dateRange: {
    startDate: string
    endDate: string
    days: number
  }
  summary: {
    totalImpressions: number
    totalClicks: number
    uniqueUsers: number
    ctr: number // Click Through Rate
  }
  dailyAnalytics: Array<{
    id: string
    buttonId: string
    date: string
    impressions: number
    clicks: number
    uniqueUsers: number
  }>
}

interface FloatingButtonAnalyticsProps {
  buttonId: string
  buttonTitle: string
}

const PERIOD_OPTIONS = [
  { value: '7', label: '최근 7일' },
  { value: '30', label: '최근 30일' },
  { value: '90', label: '최근 90일' },
  { value: 'custom', label: '사용자 지정' }
]

export function FloatingButtonAnalytics({ buttonId, buttonTitle }: FloatingButtonAnalyticsProps) {
  const [analytics, setAnalytics] = useState<FloatingButtonAnalytics | null>(null)
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState('30')
  const [customStartDate, setCustomStartDate] = useState('')
  const [customEndDate, setCustomEndDate] = useState('')

  // 분석 데이터 조회
  const fetchAnalytics = async () => {
    try {
      setLoading(true)

      let url = `/api/admin/floating-buttons/${buttonId}/analytics`
      const params = new URLSearchParams()

      if (period === 'custom') {
        if (customStartDate) params.set('startDate', customStartDate)
        if (customEndDate) params.set('endDate', customEndDate)
      } else {
        params.set('days', period)
      }

      if (params.toString()) {
        url += `?${params.toString()}`
      }

      const response = await fetch(url)

      if (!response.ok) {
        throw new Error('분석 데이터를 불러올 수 없습니다')
      }

      const data = await response.json()
      setAnalytics(data)

    } catch (error) {
      console.error('Error fetching analytics:', error)
      toast({
        title: '오류',
        description: '분석 데이터를 불러오는데 실패했습니다.',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  // 초기 로드 및 기간 변경 시 재조회
  useEffect(() => {
    fetchAnalytics()
  }, [buttonId, period, customStartDate, customEndDate])

  // 일별 트렌드 계산
  const getDailyTrend = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? 100 : 0
    return ((current - previous) / previous) * 100
  }

  // 성과 지표 카드 렌더링
  const renderMetricCard = (
    title: string,
    value: number | string,
    icon: React.ReactNode,
    description?: string,
    trend?: number
  ) => (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {icon}
            <span className="text-sm font-medium text-muted-foreground">{title}</span>
          </div>
          {trend !== undefined && (
            <div className={`flex items-center text-sm ${
              trend >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {trend >= 0 ? (
                <TrendingUp className="h-4 w-4 mr-1" />
              ) : (
                <TrendingDown className="h-4 w-4 mr-1" />
              )}
              {Math.abs(trend).toFixed(1)}%
            </div>
          )}
        </div>
        <div className="mt-2">
          <div className="text-2xl font-bold">{value}</div>
          {description && (
            <div className="text-xs text-muted-foreground mt-1">{description}</div>
          )}
        </div>
      </CardContent>
    </Card>
  )

  // 일별 차트 데이터 준비 (간단한 막대 차트)
  const renderDailyChart = () => {
    if (!analytics?.dailyAnalytics?.length) {
      return <div className="text-center text-muted-foreground py-8">데이터가 없습니다.</div>
    }

    const maxValue = Math.max(...analytics.dailyAnalytics.map(d => d.impressions))

    return (
      <div className="space-y-4">
        {analytics.dailyAnalytics.map((day, index) => {
          const percentage = maxValue > 0 ? (day.impressions / maxValue) * 100 : 0
          const date = new Date(day.date)

          return (
            <div key={day.id} className="flex items-center space-x-4">
              <div className="w-16 text-xs text-muted-foreground">
                {date.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })}
              </div>
              <div className="flex-1 bg-muted rounded-full h-2 relative">
                <div
                  className="bg-primary h-2 rounded-full transition-all duration-500"
                  style={{ width: `${percentage}%` }}
                />
              </div>
              <div className="flex space-x-4 text-xs">
                <div className="flex items-center space-x-1">
                  <Eye className="h-3 w-3" />
                  <span>{day.impressions.toLocaleString()}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <MousePointer className="h-3 w-3" />
                  <span>{day.clicks.toLocaleString()}</span>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    )
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-32 bg-muted rounded-lg" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Array(4).fill(0).map((_, i) => (
              <div key={i} className="h-24 bg-muted rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!analytics) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">분석 데이터를 불러올 수 없습니다.</p>
        <Button onClick={fetchAnalytics} className="mt-4">
          <RefreshCw className="h-4 w-4 mr-2" />
          다시 시도
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* 기간 선택 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Calendar className="h-4 w-4" />
            <span className="text-sm font-medium">기간 선택:</span>
          </div>
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PERIOD_OPTIONS.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {period === 'custom' && (
            <div className="flex items-center space-x-2">
              <input
                type="date"
                value={customStartDate}
                onChange={(e) => setCustomStartDate(e.target.value)}
                className="px-2 py-1 border rounded text-xs"
              />
              <span className="text-xs text-muted-foreground">~</span>
              <input
                type="date"
                value={customEndDate}
                onChange={(e) => setCustomEndDate(e.target.value)}
                className="px-2 py-1 border rounded text-xs"
              />
            </div>
          )}
        </div>

        <Button onClick={fetchAnalytics} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          새로고침
        </Button>
      </div>

      {/* 요약 통계 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {renderMetricCard(
          '총 노출 수',
          analytics.summary.totalImpressions.toLocaleString(),
          <Eye className="h-4 w-4 text-blue-500" />
        )}
        {renderMetricCard(
          '총 클릭 수',
          analytics.summary.totalClicks.toLocaleString(),
          <MousePointer className="h-4 w-4 text-green-500" />
        )}
        {renderMetricCard(
          '클릭률 (CTR)',
          `${analytics.summary.ctr}%`,
          <TrendingUp className="h-4 w-4 text-purple-500" />,
          '클릭 수 / 노출 수'
        )}
        {renderMetricCard(
          '순 사용자 수',
          analytics.summary.uniqueUsers.toLocaleString(),
          <Users className="h-4 w-4 text-indigo-500" />
        )}
      </div>

      {/* 일별 성과 차트 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">일별 성과</CardTitle>
          <CardDescription>
            {new Date(analytics.dateRange.startDate).toLocaleDateString()} ~
            {new Date(analytics.dateRange.endDate).toLocaleDateString()}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {renderDailyChart()}
        </CardContent>
      </Card>

      <Separator />

      {/* 분석 팁 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">분석 팁</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>• <strong>클릭률(CTR)</strong>: 1-5%가 평균적인 수치입니다. 낮다면 버튼 위치나 디자인을 개선해보세요.</p>
          <p>• <strong>노출 대비 클릭</strong>: 사용자가 버튼을 발견하기 쉬운지, 클릭할 동기가 있는지 확인하세요.</p>
          <p>• <strong>위치 최적화</strong>: 사용자의 시선 흐름을 고려해 버튼 위치를 조정해보세요.</p>
          <p>• <strong>타이밍</strong>: 스크롤 임계값을 설정해 적절한 타이밍에 표시되도록 하세요.</p>
        </CardContent>
      </Card>
    </div>
  )
}