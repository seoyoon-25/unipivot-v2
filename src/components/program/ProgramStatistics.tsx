'use client'

import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  PieChart,
  Pie,
  Cell,
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { StatCard, StatGrid, NPSScore, AttendanceSummary } from '@/components/shared/StatCard'
import { Users, BookOpen, FileCheck, TrendingUp, Award } from 'lucide-react'
import { cn } from '@/lib/utils'

const COLORS = ['#4F46E5', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6']

interface SessionStats {
  sessionNumber: number
  date: string
  attendanceRate: number
  reviewSubmissionRate: number
  satisfactionScore: number | null
}

interface ProgramStatisticsProps {
  programName: string
  totalSessions: number
  completedSessions: number
  participantCount: number
  sessionStats: SessionStats[]
  overallStats: {
    avgAttendance: number
    avgReviewRate: number
    avgSatisfaction: number | null
    npsScore: number | null
    totalReviews: number
    totalAttendances: number
  }
  attendanceSummary: {
    present: number
    late: number
    absent: number
    total: number
  }
  className?: string
}

export function ProgramStatistics({
  programName,
  totalSessions,
  completedSessions,
  participantCount,
  sessionStats,
  overallStats,
  attendanceSummary,
  className,
}: ProgramStatisticsProps) {
  const progressRate = totalSessions > 0
    ? Math.round((completedSessions / totalSessions) * 100)
    : 0

  return (
    <div className={cn('space-y-6', className)}>
      {/* Summary Stats */}
      <StatGrid columns={4}>
        <StatCard
          label="진행률"
          value={`${progressRate}%`}
          icon={TrendingUp}
          description={`${completedSessions}/${totalSessions}회차`}
          color="primary"
        />
        <StatCard
          label="참가자"
          value={participantCount}
          icon={Users}
          color="default"
        />
        <StatCard
          label="평균 출석률"
          value={`${overallStats.avgAttendance}%`}
          icon={FileCheck}
          color={overallStats.avgAttendance >= 80 ? 'success' : overallStats.avgAttendance >= 60 ? 'warning' : 'error'}
        />
        <StatCard
          label="총 독후감"
          value={overallStats.totalReviews}
          icon={BookOpen}
          color="default"
        />
      </StatGrid>

      {/* Attendance Summary */}
      <AttendanceSummary {...attendanceSummary} />

      {/* NPS Score if available */}
      {overallStats.npsScore !== null && (
        <NPSScore
          score={overallStats.npsScore}
          className="max-w-sm"
        />
      )}

      {/* Session Trend Chart */}
      {sessionStats.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>회차별 추이</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={sessionStats}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="sessionNumber"
                    tickFormatter={(value) => `${value}회차`}
                  />
                  <YAxis domain={[0, 100]} />
                  <Tooltip
                    labelFormatter={(value) => `${value}회차`}
                  />
                  <Legend
                    formatter={(value) =>
                      value === 'attendanceRate'
                        ? '출석률'
                        : value === 'reviewSubmissionRate'
                          ? '독후감 제출률'
                          : '만족도'
                    }
                  />
                  <Line
                    type="monotone"
                    dataKey="attendanceRate"
                    stroke="#4F46E5"
                    strokeWidth={2}
                    dot={{ r: 4 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="reviewSubmissionRate"
                    stroke="#10B981"
                    strokeWidth={2}
                    dot={{ r: 4 }}
                  />
                  {sessionStats.some((s) => s.satisfactionScore !== null) && (
                    <Line
                      type="monotone"
                      dataKey="satisfactionScore"
                      stroke="#F59E0B"
                      strokeWidth={2}
                      dot={{ r: 4 }}
                    />
                  )}
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Attendance Distribution Bar Chart */}
      <Card>
        <CardHeader>
          <CardTitle>출석 분포</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2">
            {/* Bar Chart */}
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={[
                    { name: '출석', value: attendanceSummary.present, color: '#10B981' },
                    { name: '지각', value: attendanceSummary.late, color: '#F59E0B' },
                    { name: '결석', value: attendanceSummary.absent, color: '#EF4444' },
                  ]}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" name="횟수">
                    {[
                      { name: '출석', value: attendanceSummary.present, color: '#10B981' },
                      { name: '지각', value: attendanceSummary.late, color: '#F59E0B' },
                      { name: '결석', value: attendanceSummary.absent, color: '#EF4444' },
                    ].map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Pie Chart */}
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={[
                      { name: '출석', value: attendanceSummary.present },
                      { name: '지각', value: attendanceSummary.late },
                      { name: '결석', value: attendanceSummary.absent },
                    ]}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label={({ name, percent }) =>
                      `${name} ${((percent ?? 0) * 100).toFixed(0)}%`
                    }
                  >
                    <Cell fill="#10B981" />
                    <Cell fill="#F59E0B" />
                    <Cell fill="#EF4444" />
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Insights Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5 text-yellow-500" />
            인사이트
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {generateInsights(overallStats, attendanceSummary, sessionStats).map(
              (insight, index) => (
                <div
                  key={index}
                  className={cn(
                    'rounded-lg p-3',
                    insight.type === 'positive'
                      ? 'bg-green-50 text-green-800'
                      : insight.type === 'negative'
                        ? 'bg-red-50 text-red-800'
                        : 'bg-blue-50 text-blue-800'
                  )}
                >
                  <p className="text-sm">{insight.message}</p>
                </div>
              )
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Generate insights based on statistics
function generateInsights(
  overallStats: ProgramStatisticsProps['overallStats'],
  attendanceSummary: ProgramStatisticsProps['attendanceSummary'],
  sessionStats: SessionStats[]
): { type: 'positive' | 'negative' | 'neutral'; message: string }[] {
  const insights: { type: 'positive' | 'negative' | 'neutral'; message: string }[] = []

  // Attendance insight
  if (overallStats.avgAttendance >= 90) {
    insights.push({
      type: 'positive',
      message: `🎉 평균 출석률 ${overallStats.avgAttendance}%! 참가자들의 높은 참여도가 돋보입니다.`,
    })
  } else if (overallStats.avgAttendance < 60) {
    insights.push({
      type: 'negative',
      message: `⚠️ 평균 출석률이 ${overallStats.avgAttendance}%로 낮습니다. 참여 독려가 필요합니다.`,
    })
  }

  // Review insight
  if (overallStats.avgReviewRate >= 80) {
    insights.push({
      type: 'positive',
      message: `📚 독후감 제출률 ${overallStats.avgReviewRate}%! 참가자들이 열심히 참여하고 있습니다.`,
    })
  }

  // Late arrivals insight
  const lateRate = attendanceSummary.total > 0
    ? Math.round((attendanceSummary.late / attendanceSummary.total) * 100)
    : 0
  if (lateRate > 20) {
    insights.push({
      type: 'neutral',
      message: `⏰ 지각 비율이 ${lateRate}%입니다. 시작 시간 안내를 강화해보세요.`,
    })
  }

  // Trend insight
  if (sessionStats.length >= 3) {
    const recentStats = sessionStats.slice(-3)
    const firstAttendance = recentStats[0].attendanceRate
    const lastAttendance = recentStats[recentStats.length - 1].attendanceRate

    if (lastAttendance > firstAttendance + 5) {
      insights.push({
        type: 'positive',
        message: '📈 최근 출석률이 상승 추세입니다. 좋은 흐름을 유지하세요!',
      })
    } else if (lastAttendance < firstAttendance - 10) {
      insights.push({
        type: 'negative',
        message: '📉 최근 출석률이 하락하고 있습니다. 참가자 소통을 늘려보세요.',
      })
    }
  }

  // NPS insight
  if (overallStats.npsScore !== null) {
    if (overallStats.npsScore >= 50) {
      insights.push({
        type: 'positive',
        message: `🌟 NPS ${overallStats.npsScore}점! 프로그램에 대한 만족도가 매우 높습니다.`,
      })
    } else if (overallStats.npsScore < 0) {
      insights.push({
        type: 'negative',
        message: `💭 NPS ${overallStats.npsScore}점으로 개선이 필요합니다. 피드백을 수집해보세요.`,
      })
    }
  }

  // Default insight if none generated
  if (insights.length === 0) {
    insights.push({
      type: 'neutral',
      message: '📊 프로그램이 순조롭게 진행되고 있습니다.',
    })
  }

  return insights
}

// Compact stats for dashboard view
interface CompactProgramStatsProps {
  avgAttendance: number
  avgReviewRate: number
  participantCount: number
  className?: string
}

export function CompactProgramStats({
  avgAttendance,
  avgReviewRate,
  participantCount,
  className,
}: CompactProgramStatsProps) {
  return (
    <div className={cn('flex items-center gap-6', className)}>
      <div className="text-center">
        <div className="text-lg font-bold text-primary">{avgAttendance}%</div>
        <div className="text-xs text-gray-500">출석률</div>
      </div>
      <div className="h-8 w-px bg-gray-200" />
      <div className="text-center">
        <div className="text-lg font-bold text-green-600">{avgReviewRate}%</div>
        <div className="text-xs text-gray-500">독후감</div>
      </div>
      <div className="h-8 w-px bg-gray-200" />
      <div className="text-center">
        <div className="text-lg font-bold text-gray-900">{participantCount}</div>
        <div className="text-xs text-gray-500">참가자</div>
      </div>
    </div>
  )
}
