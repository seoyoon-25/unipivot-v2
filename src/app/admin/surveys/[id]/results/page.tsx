'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft,
  Download,
  Users,
  TrendingUp,
  BarChart3,
  FileText,
  Loader2,
} from 'lucide-react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { StatCard, StatGrid, NPSScore } from '@/components/shared/StatCard'
import { ResponseRate } from '@/components/shared/ProgressBar'
import { getSurveyResults } from '@/lib/actions/survey'
import { SurveyQuestion, SurveyAnswer } from '@/types/survey'
import { cn } from '@/lib/utils'

interface PageProps {
  params: Promise<{ surveyId: string }>
}

interface SurveyResultsData {
  survey: {
    id: string
    title: string
    description: string | null
    programId: string
    programTitle: string
    status: string
    deadline: Date
    targetCount: number
    responseCount: number
    responseRate: number
  }
  questions: SurveyQuestion[]
  questionStats: Array<{
    questionId: string
    questionText: string
    questionType: string
    totalResponses: number
    average?: number
    distribution?: Record<string | number, number>
    nps?: number
    promotersPercent?: number
    passivesPercent?: number
    detractorsPercent?: number
    responses?: string[]
  }>
  responses: Array<{
    id: string
    userId: string
    userName: string
    answers: SurveyAnswer[]
    refundChoice: string
    submittedAt: Date
  }>
}

const COLORS = ['#4F46E5', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16']

export default function SurveyResultsPage({ params }: PageProps) {
  const { surveyId } = use(params)
  const router = useRouter()

  const [data, setData] = useState<SurveyResultsData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadResults = async () => {
      try {
        const results = await getSurveyResults(surveyId)
        if (results) {
          setData(results as SurveyResultsData)
        }
      } catch (error) {
        console.error('Failed to load survey results:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadResults()
  }, [surveyId])

  const handleExportCSV = () => {
    if (!data) return

    // Build CSV
    const headers = ['응답자', '제출일시', ...data.questions.map(q => q.text), '환급선택']
    const rows = data.responses.map(response => {
      const answers = data.questions.map(q => {
        const answer = response.answers.find(a => a.questionId === q.id)
        if (!answer) return ''
        if (Array.isArray(answer.value)) return answer.value.join(', ')
        return String(answer.value ?? '')
      })
      return [
        response.userName,
        new Date(response.submittedAt).toLocaleString('ko-KR'),
        ...answers,
        response.refundChoice,
      ]
    })

    const csv = [headers.join(','), ...rows.map(r => r.map(cell => `"${cell}"`).join(','))].join('\n')
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${data.survey.title}_결과_${new Date().toISOString().split('T')[0]}.csv`
    link.click()
    URL.revokeObjectURL(url)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>결과를 불러올 수 없습니다.</p>
      </div>
    )
  }

  // Find NPS question if exists
  const npsQuestion = data.questionStats.find(q => q.questionType === 'rating_10' && q.nps !== undefined)

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-8 px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.back()}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold">{data.survey.title}</h1>
              <p className="text-gray-500">{data.survey.programTitle}</p>
            </div>
          </div>
          <Button onClick={handleExportCSV}>
            <Download className="h-4 w-4 mr-2" />
            CSV 다운로드
          </Button>
        </div>

        {/* Summary Stats */}
        <StatGrid columns={4} className="mb-8">
          <StatCard
            label="응답률"
            value={`${data.survey.responseRate}%`}
            icon={TrendingUp}
            description={`${data.survey.responseCount}/${data.survey.targetCount}명`}
            color="primary"
          />
          <StatCard
            label="총 응답"
            value={data.survey.responseCount}
            icon={Users}
            color="default"
          />
          <StatCard
            label="질문 수"
            value={data.questions.length}
            icon={BarChart3}
            color="default"
          />
          <StatCard
            label="마감일"
            value={new Date(data.survey.deadline).toLocaleDateString('ko-KR')}
            icon={FileText}
            color="default"
          />
        </StatGrid>

        {/* NPS Score if available */}
        {npsQuestion && npsQuestion.nps !== undefined && (
          <div className="mb-8">
            <NPSScore score={npsQuestion.nps} className="max-w-md" />
          </div>
        )}

        {/* Response Rate Progress */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>응답률</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponseRate
              count={data.survey.responseCount}
              total={data.survey.targetCount}
            />
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs defaultValue="charts" className="space-y-6">
          <TabsList>
            <TabsTrigger value="charts">차트 분석</TabsTrigger>
            <TabsTrigger value="responses">개별 응답</TabsTrigger>
          </TabsList>

          <TabsContent value="charts" className="space-y-6">
            {data.questionStats.map((stat, index) => (
              <Card key={stat.questionId}>
                <CardHeader>
                  <CardTitle className="text-lg">
                    Q{index + 1}. {stat.questionText}
                  </CardTitle>
                  <p className="text-sm text-gray-500">
                    응답 {stat.totalResponses}건
                  </p>
                </CardHeader>
                <CardContent>
                  {/* Rating questions */}
                  {['emoji_5', 'star_5', 'rating_10'].includes(stat.questionType) && stat.distribution && (
                    <div className="space-y-4">
                      {stat.average !== undefined && (
                        <div className="text-center">
                          <span className="text-4xl font-bold text-primary">
                            {stat.average}
                          </span>
                          <span className="text-gray-500 ml-2">
                            / {stat.questionType === 'rating_10' ? '10' : '5'}
                          </span>
                        </div>
                      )}
                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart
                            data={Object.entries(stat.distribution).map(([value, count]) => ({
                              value,
                              count,
                            }))}
                          >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="value" />
                            <YAxis />
                            <Tooltip />
                            <Bar dataKey="count" fill="#4F46E5" />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  )}

                  {/* Choice questions */}
                  {['single_choice', 'multi_choice', 'yes_no'].includes(stat.questionType) && stat.distribution && (
                    <div className="grid gap-6 md:grid-cols-2">
                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={Object.entries(stat.distribution).map(([name, value]) => ({
                                name,
                                value,
                              }))}
                              dataKey="value"
                              nameKey="name"
                              cx="50%"
                              cy="50%"
                              outerRadius={80}
                              label={({ name, percent }) =>
                                `${name} ${((percent ?? 0) * 100).toFixed(0)}%`
                              }
                            >
                              {Object.entries(stat.distribution).map((_, idx) => (
                                <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                      <div className="space-y-2">
                        {Object.entries(stat.distribution).map(([option, count], idx) => (
                          <div
                            key={option}
                            className="flex items-center justify-between p-2 rounded bg-gray-50"
                          >
                            <div className="flex items-center gap-2">
                              <div
                                className="w-3 h-3 rounded-full"
                                style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                              />
                              <span>{option}</span>
                            </div>
                            <span className="font-medium">{count}명</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Text questions */}
                  {['text_short', 'text_long'].includes(stat.questionType) && stat.responses && (
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {stat.responses.length > 0 ? (
                        stat.responses.map((text, idx) => (
                          <div
                            key={idx}
                            className="p-3 bg-gray-50 rounded-lg"
                          >
                            <p className="text-gray-700 whitespace-pre-wrap">{text}</p>
                          </div>
                        ))
                      ) : (
                        <p className="text-gray-500 text-center py-4">
                          텍스트 응답이 없습니다
                        </p>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="responses">
            <Card>
              <CardHeader>
                <CardTitle>개별 응답 목록</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4">응답자</th>
                        <th className="text-left py-3 px-4">제출일시</th>
                        <th className="text-left py-3 px-4">환급선택</th>
                        <th className="text-left py-3 px-4">응답</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.responses.map((response) => (
                        <tr key={response.id} className="border-b hover:bg-gray-50">
                          <td className="py-3 px-4">{response.userName}</td>
                          <td className="py-3 px-4">
                            {new Date(response.submittedAt).toLocaleString('ko-KR')}
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className={cn(
                                'px-2 py-1 rounded-full text-xs font-medium',
                                response.refundChoice === 'REFUND'
                                  ? 'bg-blue-100 text-blue-800'
                                  : 'bg-green-100 text-green-800'
                              )}
                            >
                              {response.refundChoice === 'REFUND' ? '환급' : '기부'}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                // Show response details (could open a modal)
                                alert(JSON.stringify(response.answers, null, 2))
                              }}
                            >
                              상세보기
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {data.responses.length === 0 && (
                    <p className="text-center text-gray-500 py-8">
                      아직 응답이 없습니다
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
