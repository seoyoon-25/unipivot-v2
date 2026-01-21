'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Plus,
  FileText,
  BarChart3,
  Clock,
  Users,
  Send,
  CheckCircle,
  AlertCircle,
  MoreVertical,
  Eye,
  Trash2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { ResponseRate } from '@/components/shared/ProgressBar'
import { cn } from '@/lib/utils'

interface Survey {
  id: string
  title: string
  description: string | null
  status: 'DRAFT' | 'ACTIVE' | 'CLOSED' | 'SENT'
  surveyType: 'session' | 'program'
  deadline: Date
  sessionId: string | null
  createdAt: Date
  _count: {
    responses: number
  }
  session?: {
    sessionNumber: number
    title: string | null
  } | null
}

interface SurveysManagementProps {
  programId: string
  surveys: Survey[]
  participantCount: number
  className?: string
  isFacilitator?: boolean
}

export function SurveysManagement({
  programId,
  surveys,
  participantCount,
  className,
  isFacilitator = false,
}: SurveysManagementProps) {
  const router = useRouter()
  const [sendingReminder, setSendingReminder] = useState<string | null>(null)

  const handleSendReminder = async (surveyId: string) => {
    if (!confirm('미응답자에게 리마인더를 발송하시겠습니까?')) return

    setSendingReminder(surveyId)
    try {
      const response = await fetch(`/api/admin/surveys/${surveyId}/reminders`, {
        method: 'POST',
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || '리마인더 발송 실패')
      }

      const result = await response.json()
      alert(`리마인더 발송 완료: ${result.sent}명 성공`)
      router.refresh()
    } catch (error) {
      alert(error instanceof Error ? error.message : '리마인더 발송 중 오류가 발생했습니다.')
    } finally {
      setSendingReminder(null)
    }
  }

  // Separate surveys by type
  const programSurveys = surveys.filter((s) => s.surveyType === 'program')
  const sessionSurveys = surveys.filter((s) => s.surveyType === 'session')

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header with Create Button */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">만족도 조사</h2>
        {isFacilitator && (
          <Button asChild>
            <Link href={`/admin/programs/${programId}/surveys/create`}>
              <Plus className="mr-2 h-4 w-4" />
              새 조사 만들기
            </Link>
          </Button>
        )}
      </div>

      {/* Program-level Surveys (Season End) */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-gray-500">시즌 종료 조사</h3>
        {programSurveys.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-8">
              <FileText className="mb-2 h-10 w-10 text-gray-300" />
              <p className="text-sm text-gray-500">시즌 종료 조사가 없습니다</p>
              {isFacilitator && (
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-3"
                  onClick={() =>
                    router.push(`/admin/programs/${programId}/surveys/create`)
                  }
                >
                  <Plus className="mr-2 h-4 w-4" />
                  시즌 조사 만들기
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          programSurveys.map((survey) => (
            <SurveyCard
              key={survey.id}
              survey={survey}
              participantCount={participantCount}
              programId={programId}
              isFacilitator={isFacilitator}
              onSendReminder={handleSendReminder}
              sendingReminder={sendingReminder}
            />
          ))
        )}
      </div>

      {/* Session-level Surveys */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-gray-500">회차별 조사</h3>
        {sessionSurveys.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-8">
              <FileText className="mb-2 h-10 w-10 text-gray-300" />
              <p className="text-sm text-gray-500">회차별 조사가 없습니다</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {sessionSurveys.map((survey) => (
              <SurveyCard
                key={survey.id}
                survey={survey}
                participantCount={participantCount}
                programId={programId}
                isFacilitator={isFacilitator}
                onSendReminder={handleSendReminder}
                sendingReminder={sendingReminder}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// Individual Survey Card
interface SurveyCardProps {
  survey: Survey
  participantCount: number
  programId: string
  isFacilitator: boolean
  onSendReminder: (surveyId: string) => void
  sendingReminder: string | null
}

function SurveyCard({
  survey,
  participantCount,
  programId,
  isFacilitator,
  onSendReminder,
  sendingReminder,
}: SurveyCardProps) {
  const router = useRouter()
  const now = new Date()
  const deadline = new Date(survey.deadline)
  const isExpired = now > deadline && survey.status !== 'CLOSED'
  const isSending = sendingReminder === survey.id
  const nonRespondents = participantCount - survey._count.responses

  const handleViewResults = () => {
    router.push(`/admin/surveys/${survey.id}/results`)
  }

  return (
    <Card className={cn(isExpired && 'border-yellow-300 bg-yellow-50/50')}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            {/* Title and status */}
            <div className="flex items-center gap-2">
              <h4 className="font-medium">{survey.title}</h4>
              <StatusBadge status={survey.status} size="sm" />
              {isExpired && (
                <span className="rounded bg-yellow-100 px-2 py-0.5 text-xs text-yellow-700">
                  마감됨
                </span>
              )}
            </div>

            {/* Session info if applicable */}
            {survey.session && (
              <p className="mt-1 text-sm text-gray-500">
                {survey.session.sessionNumber}회차
                {survey.session.title && ` - ${survey.session.title}`}
              </p>
            )}

            {/* Meta info */}
            <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-gray-500">
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>
                  마감: {deadline.toLocaleDateString('ko-KR')}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                <span>
                  {survey._count.responses}/{participantCount}명 응답
                </span>
              </div>
            </div>

            {/* Response rate */}
            <div className="mt-3">
              <ResponseRate
                count={survey._count.responses}
                total={participantCount}
              />
            </div>
          </div>

          {/* Actions */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleViewResults}>
                <BarChart3 className="mr-2 h-4 w-4" />
                결과 보기
              </DropdownMenuItem>
              {isFacilitator && survey.status === 'ACTIVE' && nonRespondents > 0 && (
                <DropdownMenuItem
                  onClick={() => onSendReminder(survey.id)}
                  disabled={isSending}
                >
                  {isSending ? (
                    <>
                      <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-primary" />
                      발송 중...
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" />
                      리마인더 발송 ({nonRespondents}명)
                    </>
                  )}
                </DropdownMenuItem>
              )}
              {isFacilitator && survey.status === 'DRAFT' && (
                <DropdownMenuItem onClick={() => router.push(`/admin/surveys/${survey.id}/edit`)}>
                  <FileText className="mr-2 h-4 w-4" />
                  편집
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardContent>
    </Card>
  )
}

// Survey Quick Stats Component
interface SurveyQuickStatsProps {
  surveys: Survey[]
  participantCount: number
  className?: string
}

export function SurveyQuickStats({
  surveys,
  participantCount,
  className,
}: SurveyQuickStatsProps) {
  const activeSurveys = surveys.filter((s) => s.status === 'ACTIVE')
  const totalResponses = surveys.reduce((sum, s) => sum + s._count.responses, 0)
  const avgResponseRate = surveys.length > 0
    ? Math.round(
        surveys.reduce(
          (sum, s) => sum + (s._count.responses / participantCount) * 100,
          0
        ) / surveys.length
      )
    : 0

  return (
    <div className={cn('grid grid-cols-3 gap-4', className)}>
      <div className="rounded-lg border p-3 text-center">
        <div className="text-2xl font-bold text-primary">{surveys.length}</div>
        <div className="text-xs text-gray-500">전체 조사</div>
      </div>
      <div className="rounded-lg border p-3 text-center">
        <div className="text-2xl font-bold text-blue-600">{activeSurveys.length}</div>
        <div className="text-xs text-gray-500">진행중</div>
      </div>
      <div className="rounded-lg border p-3 text-center">
        <div className="text-2xl font-bold text-green-600">{avgResponseRate}%</div>
        <div className="text-xs text-gray-500">평균 응답률</div>
      </div>
    </div>
  )
}
