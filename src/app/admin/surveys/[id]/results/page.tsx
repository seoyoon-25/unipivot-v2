'use client'

import { useState, useEffect, use } from 'react'
import Link from 'next/link'
import {
  ArrowLeft,
  BarChart3,
  Users,
  CheckCircle,
  Clock,
  Download,
  Star,
  MessageSquare,
  TrendingUp,
  PieChart,
  FileText,
} from 'lucide-react'

interface SurveyQuestion {
  id: string
  type: 'rating' | 'single' | 'multiple' | 'text'
  question: string
  options?: string[]
  required?: boolean
}

interface QuestionStats {
  questionId: string
  question: string
  type: string
  totalResponses: number
  // For rating questions
  average?: number
  distribution?: Record<number, number>
  // For single/multiple choice
  optionCounts?: Record<string, number>
  // For text questions
  textResponses?: Array<{ text: string; respondent?: string }>
}

interface SurveyResults {
  survey: {
    id: string
    title: string
    description: string | null
    status: string
    deadline: string
    targetCount: number
    responseCount: number
    sentAt: string | null
    createdAt: string
    program: {
      id: string
      title: string
      type: string
    }
  }
  questions: SurveyQuestion[]
  stats: {
    responseRate: number
    averageRating: number
    completedCount: number
    pendingCount: number
    refundCount: number
    donateCount: number
  }
  questionStats: QuestionStats[]
  responses: Array<{
    id: string
    userId: string
    userName: string | null
    answers: Record<string, any>
    refundChoice: string
    createdAt: string
  }>
}

export default function SurveyResultsPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const [results, setResults] = useState<SurveyResults | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'overview' | 'questions' | 'responses'>('overview')

  useEffect(() => {
    fetchResults()
  }, [id])

  const fetchResults = async () => {
    try {
      const res = await fetch(`/api/admin/surveys/${id}/results`)
      if (res.ok) {
        const data = await res.json()
        setResults(data)
      }
    } catch (error) {
      console.error('Failed to fetch results:', error)
    } finally {
      setLoading(false)
    }
  }

  const exportToCSV = async () => {
    try {
      const res = await fetch(`/api/admin/surveys/${id}/results/export`)
      if (res.ok) {
        const blob = await res.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `survey-results-${id}.csv`
        a.click()
        window.URL.revokeObjectURL(url)
      }
    } catch (error) {
      console.error('Export failed:', error)
    }
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const getRatingStars = (rating: number) => {
    const stars = []
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Star
          key={i}
          className={`w-4 h-4 ${
            i <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
          }`}
        />
      )
    }
    return stars
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!results) {
    return (
      <div className="p-12 text-center">
        <p className="text-gray-500">결과를 불러올 수 없습니다.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/surveys"
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold">{results.survey.title}</h1>
            <p className="text-gray-600">{results.survey.program.title}</p>
          </div>
        </div>
        <button
          onClick={exportToCSV}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
        >
          <Download className="w-4 h-4" />
          결과 내보내기
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">대상자</p>
              <p className="text-xl font-bold">{results.survey.targetCount}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">응답완료</p>
              <p className="text-xl font-bold text-green-600">
                {results.survey.responseCount}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <TrendingUp className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">응답률</p>
              <p className="text-xl font-bold text-purple-600">
                {results.stats.responseRate}%
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Star className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">평균 평점</p>
              <p className="text-xl font-bold text-yellow-600">
                {results.stats.averageRating.toFixed(1)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-100 rounded-lg">
              <PieChart className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">반환 선택</p>
              <p className="text-xl font-bold text-emerald-600">
                {results.stats.refundCount}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-pink-100 rounded-lg">
              <FileText className="w-5 h-5 text-pink-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">후원 전환</p>
              <p className="text-xl font-bold text-pink-600">
                {results.stats.donateCount}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="border-b">
          <div className="flex">
            {[
              { id: 'overview', label: '개요', icon: BarChart3 },
              { id: 'questions', label: '질문별 분석', icon: MessageSquare },
              { id: 'responses', label: '개별 응답', icon: FileText },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-6 py-4 text-sm font-medium transition-colors border-b-2 ${
                  activeTab === tab.id
                    ? 'text-primary border-primary'
                    : 'text-gray-500 border-transparent hover:text-gray-700'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="p-6">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Rating Questions Summary */}
              <div>
                <h3 className="text-lg font-semibold mb-4">평점 요약</h3>
                <div className="space-y-4">
                  {results.questionStats
                    .filter((q) => q.type === 'rating')
                    .map((stat) => (
                      <div key={stat.questionId} className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <p className="font-medium text-gray-900">{stat.question}</p>
                          <div className="flex items-center gap-2">
                            <div className="flex">{getRatingStars(Math.round(stat.average || 0))}</div>
                            <span className="text-lg font-bold text-yellow-600">
                              {(stat.average || 0).toFixed(1)}
                            </span>
                          </div>
                        </div>
                        {/* Rating Distribution Bar */}
                        <div className="flex gap-1 h-8">
                          {[1, 2, 3, 4, 5].map((rating) => {
                            const count = stat.distribution?.[rating] || 0
                            const percentage =
                              stat.totalResponses > 0
                                ? (count / stat.totalResponses) * 100
                                : 0
                            return (
                              <div
                                key={rating}
                                className="flex-1 flex flex-col items-center"
                              >
                                <div className="w-full bg-gray-200 rounded-full h-4 mb-1">
                                  <div
                                    className="bg-yellow-400 h-4 rounded-full transition-all"
                                    style={{ width: `${percentage}%` }}
                                  />
                                </div>
                                <span className="text-xs text-gray-500">
                                  {rating}점 ({count})
                                </span>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    ))}
                </div>
              </div>

              {/* Refund vs Donate */}
              <div>
                <h3 className="text-lg font-semibold mb-4">보증금 처리 현황</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <div className="flex justify-between mb-2">
                        <span className="text-sm text-gray-600">반환 선택</span>
                        <span className="font-medium">{results.stats.refundCount}명</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-4">
                        <div
                          className="bg-emerald-500 h-4 rounded-full transition-all"
                          style={{
                            width: `${
                              results.survey.responseCount > 0
                                ? (results.stats.refundCount / results.survey.responseCount) * 100
                                : 0
                            }%`,
                          }}
                        />
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between mb-2">
                        <span className="text-sm text-gray-600">후원 전환</span>
                        <span className="font-medium">{results.stats.donateCount}명</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-4">
                        <div
                          className="bg-pink-500 h-4 rounded-full transition-all"
                          style={{
                            width: `${
                              results.survey.responseCount > 0
                                ? (results.stats.donateCount / results.survey.responseCount) * 100
                                : 0
                            }%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Questions Tab */}
          {activeTab === 'questions' && (
            <div className="space-y-6">
              {results.questionStats.map((stat, index) => (
                <div key={stat.questionId} className="border rounded-lg p-4">
                  <div className="flex items-start gap-3 mb-4">
                    <span className="flex-shrink-0 w-8 h-8 bg-primary/10 text-primary rounded-full flex items-center justify-center text-sm font-bold">
                      {index + 1}
                    </span>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{stat.question}</p>
                      <p className="text-sm text-gray-500">
                        {stat.totalResponses}명 응답 ·{' '}
                        {stat.type === 'rating'
                          ? '평점'
                          : stat.type === 'single'
                          ? '단일 선택'
                          : stat.type === 'multiple'
                          ? '복수 선택'
                          : '주관식'}
                      </p>
                    </div>
                  </div>

                  {/* Rating Question */}
                  {stat.type === 'rating' && (
                    <div className="pl-11">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="flex">{getRatingStars(Math.round(stat.average || 0))}</div>
                        <span className="text-2xl font-bold text-yellow-600">
                          {(stat.average || 0).toFixed(1)}
                        </span>
                        <span className="text-gray-500">/ 5.0</span>
                      </div>
                      <div className="space-y-2">
                        {[5, 4, 3, 2, 1].map((rating) => {
                          const count = stat.distribution?.[rating] || 0
                          const percentage =
                            stat.totalResponses > 0
                              ? (count / stat.totalResponses) * 100
                              : 0
                          return (
                            <div key={rating} className="flex items-center gap-3">
                              <span className="w-12 text-sm text-gray-600">{rating}점</span>
                              <div className="flex-1 bg-gray-100 rounded-full h-6">
                                <div
                                  className="bg-yellow-400 h-6 rounded-full flex items-center justify-end pr-2 transition-all"
                                  style={{ width: `${Math.max(percentage, 2)}%` }}
                                >
                                  {percentage > 10 && (
                                    <span className="text-xs font-medium text-yellow-800">
                                      {percentage.toFixed(0)}%
                                    </span>
                                  )}
                                </div>
                              </div>
                              <span className="w-12 text-sm text-gray-500 text-right">
                                {count}명
                              </span>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )}

                  {/* Single/Multiple Choice Question */}
                  {(stat.type === 'single' || stat.type === 'multiple') && stat.optionCounts && (
                    <div className="pl-11 space-y-2">
                      {Object.entries(stat.optionCounts)
                        .sort((a, b) => b[1] - a[1])
                        .map(([option, count]) => {
                          const percentage =
                            stat.totalResponses > 0 ? (count / stat.totalResponses) * 100 : 0
                          return (
                            <div key={option} className="flex items-center gap-3">
                              <div className="flex-1">
                                <div className="flex justify-between mb-1">
                                  <span className="text-sm text-gray-700">{option}</span>
                                  <span className="text-sm text-gray-500">
                                    {count}명 ({percentage.toFixed(0)}%)
                                  </span>
                                </div>
                                <div className="w-full bg-gray-100 rounded-full h-4">
                                  <div
                                    className="bg-primary h-4 rounded-full transition-all"
                                    style={{ width: `${percentage}%` }}
                                  />
                                </div>
                              </div>
                            </div>
                          )
                        })}
                    </div>
                  )}

                  {/* Text Question */}
                  {stat.type === 'text' && stat.textResponses && (
                    <div className="pl-11 space-y-2 max-h-60 overflow-y-auto">
                      {stat.textResponses.length > 0 ? (
                        stat.textResponses.map((response, i) => (
                          <div key={i} className="bg-gray-50 rounded-lg p-3">
                            <p className="text-sm text-gray-700">{response.text}</p>
                            {response.respondent && (
                              <p className="text-xs text-gray-400 mt-1">- {response.respondent}</p>
                            )}
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-gray-500">응답 없음</p>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Responses Tab */}
          {activeTab === 'responses' && (
            <div className="space-y-4">
              {results.responses.length === 0 ? (
                <p className="text-center text-gray-500 py-8">응답이 없습니다.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">
                          응답자
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">
                          응답일
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">
                          보증금
                        </th>
                        {results.questions.slice(0, 3).map((q, i) => (
                          <th
                            key={q.id}
                            className="px-4 py-3 text-left text-sm font-medium text-gray-500 max-w-[150px] truncate"
                          >
                            Q{i + 1}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {results.responses.map((response) => (
                        <tr key={response.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm">
                            {response.userName || '익명'}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-500">
                            {formatDate(response.createdAt)}
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`px-2 py-1 rounded text-xs font-medium ${
                                response.refundChoice === 'DONATE'
                                  ? 'bg-pink-100 text-pink-700'
                                  : 'bg-emerald-100 text-emerald-700'
                              }`}
                            >
                              {response.refundChoice === 'DONATE' ? '후원' : '반환'}
                            </span>
                          </td>
                          {results.questions.slice(0, 3).map((q) => (
                            <td key={q.id} className="px-4 py-3 text-sm max-w-[150px] truncate">
                              {q.type === 'rating' ? (
                                <div className="flex items-center gap-1">
                                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                  {response.answers[q.id]}
                                </div>
                              ) : (
                                <span className="text-gray-600">
                                  {Array.isArray(response.answers[q.id])
                                    ? response.answers[q.id].join(', ')
                                    : response.answers[q.id] || '-'}
                                </span>
                              )}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
